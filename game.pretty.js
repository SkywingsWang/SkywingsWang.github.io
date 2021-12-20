init()

// whether in the game
let status = false
// the two-dimensional array of treasure
let treasure = []
// the two-dimensional grid been occupied
let occupy = []
// hero
let hero = null
// killer
let killer = []
// obstacle
let obstacle = []
// round
let round = 1
// treasure left
let surplus = 0
// score of killer
let killerScore = 0
// score of hero
let heroScore = 0

/*
 * The code for the following init function is used to
 * initialize the 10*10 grid, and three special situations
 * use dom elements
 */
function init() {
  const table = document.getElementById('table')
  for (let i = 0; i<10; i++) {
    let tr = document.createElement("tr");
    for (let j = 0; j<10; j++) {
      let td = document.createElement("td");
      td.dataset.XY = `${i},${j}`;
      tr.appendChild(td)
      td.onclick = function () {

        // the setup operation cannot be performed in the play stage
        if (status) { return }

        // If the grid is already occupied, no more items can be added
        for (let k=0; k<occupy.length; k++) {
          if (occupy[k][0] === i && occupy[k][1] === j) {
            alert('This grid is already occupied!')
            return;
          }
        }

        // prompt window
        let tempScore = prompt("Please type h/k/o/1-9")
        // when the input is empty
        if (!tempScore) { return }
        analyseKey(tempScore, i, j, tempScore);
      }
    }
    table.appendChild(tr);
  }
}


/*
 * Make different displays according to the different input of the player
 * @param key: the character typed by the player
 * @param X: the x axis, indicate the position
 * @param Y: the y axis, indicate the position
 * @param score
 */
function analyseKey (key, X, Y, score=null) {
  switch (key) {

    // When the player type "o", it is regarded as setting an obstacle at the current position
    // set the background of the grid to black
    // set the grid as occupied
    case 'o':
      let div = document.createElement("div");
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.backgroundColor = 'black';
      div.dataset.type = 'obstacle';
      div.classList.add('dom')
      findTd(X, Y).appendChild(div);
      obstacle.push([X, Y])
      occupy.push([X, Y])
      break;

    // When the player type "h", it is regarded as setting an hero at the current position
    // set the background of the grid as hero picture
    // set the grid as occupied
    case 'h':
      if (hero) {
        alert('Only one hero can be set!')
      } else {
        draw(findTd(X, Y), 'hero')
        hero = [X, Y];
        occupy.push([X, Y]);
      }
      break;

    // When the player type "k", it is regarded as setting a killer at the current position
    // set the background of the grid as killer picture
    // set the grid as occupied
    case 'k':
      draw(findTd(X, Y), 'killer')
      killer.push([X, Y]);
      occupy.push([X, Y]);
      break;

    default:
      if (/^[1-9]$/.exec(key)) {
        // When the player type "o", it is regarded as setting a treasure at the current position
        // the treasure surplus+1, and displayed
        // update score, and set the grid as occupied
        draw(findTd(X, Y),'treasure', score);
        surplus++
        updateScore()
        treasure.push([X, Y, score]);
        occupy.push([X, Y]);

        // if the input is not covered in upper inputs,
        // alert that it is a wrong input
      } else {
        alert('Error: Wrong input!')
      }
  }
}

/*
 * The code for the following draw function is inspired by
 * stackoverflow (https://stackoverflow.com/questions/16978296/insert-image-into-table-cell-in-javascript):
 * Insert image into table cell in Javascript
 * @param td: specify the cell location
 * @param image: the image been inserted
 * @param score
 */
function draw(td, image, score=null) {
  let img = document.createElement("img");
  img.src = `./image/${image}.png`;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.display = 'block';
  img.dataset.type = image;
  if(score) {
    img.dataset.score = score;
  }
  img.classList.add('dom')
  img.onload = function () {
    td.append(img)
  }
}

/*
 * The code of findTd function is used to find specific grid
 * @param X: the x axis, indicate the position
 * @param Y: the y axis, indicate the position
 * @returns DOM element {HTMLTableDataCellElement}
 */
function findTd(X, Y) {
  const tr = document.getElementsByTagName('tr')[X]
  return tr.getElementsByTagName('td')[Y]
}

/*
 * The nextStage function is used to check status when the player click "nextStage"
 */
function nextStage() {
  if (!hero) {
    alert('We need a hero to start!')
  } else if (treasure.length === 0) {
    round++
    reset('It is a draw!')
  } else {
    status = true
  }
}

/*
 * The end function is used to check status when the player click "end the game"
 */
function end() {
  if (!status) {
    alert('The game haven not begin!')
  } else if (killerScore === heroScore) {
    reset('It is a draw')
  } else if (killerScore > heroScore) {
    reset('Your score is lower than the killer--You lose!')
  } else {
  reset('You win!')
  }
}

/*
 * This function is used to monitor the keyboard
 * @param event
 */
document.onkeydown = function(event){
  if (!status) { return }
  const e  = event || window.e;
  const keyCode = e.keyCode || e.which;

  // Move in four directions
  switch (keyCode) {
    case 87:
      move(findTd(hero[0], hero[1]), hero[0]-1, hero[1], 'hero', 'hero')
      break;

    case 83:
      move(findTd(hero[0], hero[1]), hero[0]+1, hero[1], 'hero', 'hero')
      break;

    case 65:
      move(findTd(hero[0], hero[1]), hero[0], hero[1]-1, 'hero', 'hero')
      break;

    case 68:
      move(findTd(hero[0], hero[1]), hero[0], hero[1]+1, 'hero', 'hero')
      break;
  }
}

/*
 * The function move is used to control the movement
 * @param dom
 * @param X
 * @param Y
 * @param image
 * @param type
 * @param flag
 * @param index
 */
function move(dom, X, Y, image, type, flag=true, index=null) {

  // If hero will move off the map
  if (X<0 || X>9 || Y<0 || Y>9 ) {
    alert('Can not walk into nothingness!')
    return;
  }

  // when the moved grid is not empty
  const newDom = findTd(X, Y).getElementsByClassName('dom')[0]
  if(newDom) {
    // if hero or killer hit obstacle
    if (newDom.dataset.type === 'obstacle') {
      return

      // if hero hit killer
    } else if (newDom.dataset.type === 'killer' && type === 'hero') {
      round++
      reset('You died! Game over!')
      return

      // if hero or killer hit treasure,
      // Reduce the number of remaining treasures and
      // update the scores of hero or killers
      // if no more treasures, game is over and enter into the end stage
    } else if (newDom.dataset.type === 'treasure') {
      if (type === 'hero') {
        heroScore += parseInt(newDom.dataset.score)
      } else {
        killerScore += parseInt(newDom.dataset.score)
      }
      for (let i=0;i<treasure.length;i++) {
        if (treasure[i][0] === X && treasure[i][1]) {
          treasure.splice(i, 1);
        }
      }
      surplus--
      updateScore()
      newDom.remove()

      if (surplus === 0) {
        round++
        if (heroScore >  killerScore) {
          reset('You win!')
        } else {
          reset('Your score is lower than the killer--You lose!')
        }
        return
      }

    // if killer hit player
    } else if (newDom.dataset.type === 'hero') {
      newDom.remove()
      findTd(X, Y).append(dom.getElementsByTagName('img')[0])
      round++
      reset('The hero is died, you lose!')
      return
    }
  }

  if (type === 'hero') {
    hero[0] = X
    hero[1] = Y
  } else {
    killer[index][0] = X
    killer[index][1] = Y
  }
  findTd(X, Y).append(dom.getElementsByTagName('img')[0])

  //
  if (flag) {
    for (let i=0; i<killer.length; i++) {
      const X = killer[i][0]
      const Y = killer[i][1]
      let heroDistance = Math.abs(hero[0]-X) + Math.abs(hero[1]-Y)
      let treasureDistance = { index: null, distance: 99, X: null, Y: null, XY: [] }

      for (let i=0;i<treasure.length;i++) {
        let temp = Math.abs(treasure[i][0]-X)+Math.abs(treasure[i][1]-Y)
        if (temp < treasureDistance.distance) {
          treasureDistance = { index: i, distance: temp, X: treasure[i][0], Y: treasure[i][1] ,XY: [ treasure[i][0], treasure[i][1] ]}
        }
      }

      let array = treasureDistance.XY
      if (heroDistance < treasureDistance.distance) {
        array = hero
      }

      let killerX = killer[i][0]
      let killerY = killer[i][1]

      // If the hero is near the killer
      if (Math.abs(array[0]-killer[i][0]) <= 1 && Math.abs(array[1]-killer[i][1]) <= 1) {
        killerX = array[0]
        killerY = array[1]

      // If within the same vertical line
      } else if (array[0] === killer[i][0] && array[1] > killer[i][1]) {
        killerY++
      } else if (array[0] === killer[i][0] && array[1] > killer[i][1]) {
        killerY--

      // If within the same horizontal line
      } else if (array[1] === killer[i][1] && array[0] > killer[i][0]) {
        killerX++
      } else if (array[1] === killer[i][1] && array[0] < killer[i][0]) {
        killerX--

      // The hero is in the upper left corner of the killer
      } else if (array[0] < killer[i][0] && array[1] < killer[i][1]) {
        killerX--
        killerY--
      // The hero is in the upper right corner of the killer
      } else if (array[0] > killer[i][0] && array[1] < killer[i][1]) {
        killerX++
        killerY--
      // The hero is in the lower left corner of the killer
      } else if (array[0] < killer[i][0] && array[1] > killer[i][1]) {
        killerX--
        killerY++
      // The hero is in the lower right corner of the killer
      } else if (array[0] > killer[i][0] && array[1] > killer[i][1]) {
        killerX++
        killerY++
      }
      move(findTd(X, Y), killerX, killerY, 'killer', 'killer', false, i)
    }
  }
}

/*
 * The fuction reset is used to reset the status in the table
 * except for the rounds that need to be kept
 * @param message: Passed by other functions
 */
function reset(message) {
  status = false;
  treasure = [];
  occupy = []
  hero = null
  killer = []
  obstacle = []
  surplus =  0
  killerScore = 0
  heroScore = 0
  updateScore()
  let dom = document.getElementsByTagName('td')
  for (let i=0; i<dom.length; i++) {
    dom[i].innerHTML = ''
  }
  alert(message)
}

/*
 * The function updateScore is used to update the round, surplus(treasure remained)
 * and scores of killer and hero
 */
function updateScore() {
  document.getElementById('round').innerText = `${round}`;
  document.getElementById('surplus').innerText = `${surplus}`;
  document.getElementById('killerScore').innerText = `${killerScore}`;
  document.getElementById('heroScore').innerText = `${heroScore}`;
}
