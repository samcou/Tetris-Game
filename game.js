// Game Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SQUARE_SIZE = 30;
const GAME_SPEED = 500; // milliseconds
const MAX_LIVES = 3;

// Game Elements
const gameContainer = document.getElementById("game-container");
const tetrisBoard = document.getElementById("tetris-board");
const scoreElement = document.getElementById("score-value");
const timerElement = document.getElementById("timer-value");
const livesElement = document.getElementById("lives-value");
const pauseMenu = document.getElementById("pause-menu");
const continueButton = document.getElementById("continue-btn");
const restartButton = document.getElementById("restart-btn");
const pauseButton = document.getElementById("pause-btn");


pauseButton.addEventListener("click", pauseGame);
continueButton.addEventListener("click", continueGame)

const TETROMINOS = [
    { shape: [[1, 1, 1, 1]], color : 1 },              // I-shape
    { shape: [[1, 1], [1, 1]], color : 2 },            // O-shape
    { shape: [[1, 1, 1], [0, 1, 0]], color : 3 },      // T-shape
    { shape: [[1, 1, 0], [0, 1, 1]], color : 4 },      // S-shape
    { shape: [[0, 1, 1], [1, 1, 0]], color : 5 },      // Z-shape
    { shape: [[1, 1, 1], [0, 0, 1]], color : 6 },      // J-shape
    { shape: [[1, 1, 1], [1, 0, 0]], color : 7 },      // L-shape
];

const COLORS = {
    0: "transparent",  // Empty cell color
    1: "cyan",         // I-shape color
    2: "yellow",       // O-shape color
    3: "purple",       // T-shape color
    4: "green",        // S-shape color
    5: "red",          // Z-shape color
    6: "blue",         // J-shape color
    7: "orange",       // L-shape color
};
 
let score = 0;
let timer = 0;
let lives = 3;
let isPaused = false;

let currentTetromino = null;

// Tetris Board
const board = [];
for (let row = 0; row < BOARD_HEIGHT; row++) {
  //each iteration fills board array with a 'row'
  //each row is then filled with an array the size of boardwidth
  board[row] = Array(BOARD_WIDTH).fill(0);
}

// Game Loop
let intervalId = null;

let lastRenderTime = 0;

function startGame() {
  intervalId = setInterval(updateGame, GAME_SPEED);
  console.log("game started")
  initializeGame();
  lastRenderTime = performance.now();
  requestAnimationFrame(updateGame);
}

function pauseGame() {
  isPaused = true;
  clearInterval(intervalId);
  pauseMenu.classList.remove("hidden");
}

function continueGame() {
  console.log("Continue game function called!");
  isPaused = false;
  intervalId = setInterval(updateGame, GAME_SPEED);
  pauseMenu.classList.add("hidden");
  continueButton.classList.add("hidden");
  renderBoard();
}

function restartGame() {
  clearInterval(intervalId);
  initializeGame();
  intervalId = setInterval(updateGame, GAME_SPEED);
}

function updateGame(timestamp) {
    if (!isPaused) {
      // Calculate the time elapsed since the last render
      const timeSinceLastRender = timestamp - lastRenderTime;
  
      // Only update the game if enough time has passed (aiming for 60 FPS)
      if (timeSinceLastRender >= GAME_SPEED) {
        // Update game logic
        timer++;
        moveTetrominoDown();
        checkLineClears();
  
        // Check for game over
        if (isGameOver()) {
          handleGameOver();
          return;
        }
  
        lastRenderTime = timestamp;
      }
    }
  
    renderBoard();
    scoreElement.textContent = score;
    timerElement.textContent = timer;
    livesElement.textContent = lives;
  
    requestAnimationFrame(updateGame);
  }
  

  function moveTetrominoDown() {
    if (canMoveTetromino(0, 1)) {
      currentTetromino.y++;
    } else {
      console.log("Locking tetromino");
      lockTetromino();

      spawnNewTetromino();
  
      //Check for game over
      if (isGameOver()) {
        handleGameOver();
        return;
      }

      renderBoard();
    }
  }
  

function checkLineClears() {
  let clearedLines = 0;

  for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
    if (board[row].every((cell) => cell !== 0)) {
      // Clear the line
      board.splice(row, 1);
      board.unshift(Array(BOARD_WIDTH).fill(0));
      clearedLines++;
    }
  }

  // Update score based on cleared lines
  if (clearedLines > 0) {
    score += calculateScore(clearedLines);
  }
}

function calculateScore(clearedLines) {
  // Calculate score based on the number of cleared lines
  switch (clearedLines) {
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4:
      return 800;
    default:
      return 0;
  }
}

function lockTetromino() {
  // Copy the current tetromino onto the game board
  const { shape, x, y } = currentTetromino;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const boardRow = y + row;
        const boardCol = x + col;
        board[boardRow][boardCol] = shape[row][col];
      }
    }
  }
}

function isGameOver() {
  // Check if any part of the new tetromino overlaps with the existing board
  const { shape, x, y } = currentTetromino;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const boardRow = y + row;
        const boardCol = x + col;

        // Check if the cell is occupied by the existing board
        if (board[boardRow][boardCol] !== 0) {
          
          return true;
        }
      }
    }
  }

  return false;
}

// User Controls
function handleKeyPress(event) {
    if (isPaused) {
      return;
    }
  
    if (event.key === "ArrowLeft") {
      moveTetrominoLeft();
    } else if (event.key === "ArrowRight") {
      moveTetrominoRight();
    } else if (event.key === "ArrowDown") {
      moveTetrominoDown();
    } else if (event.key === "ArrowUp") {
      rotateTetromino();
    } else if (event.key === " ") {
      // Spacebar to hard drop the tetromino
      hardDropTetromino();
    } else if (event.key === "Escape") {
      pauseGame();
    }
    event.preventDefault();
  }
  
function moveTetrominoLeft() {
  if (canMoveTetromino(-1, 0)) {
    currentTetromino.x--;
  }
}

function moveTetrominoRight() {
  if (canMoveTetromino(1, 0)) {
    currentTetromino.x++;
  }
}

function rotateTetromino() {
  const rotatedShape = rotateShape(currentTetromino.shape);

  if (canMoveTetromino(0, 0, rotatedShape)) {
    currentTetromino.shape = rotatedShape;
  }
}

function hardDropTetromino() {
  while (canMoveTetromino(0, 1)) {
    currentTetromino.y++;
  }

  moveTetrominoDown();
}

function canMoveTetromino(deltaX, deltaY, newShape) {
  const { shape, x, y } = currentTetromino;
  const tetrominoShape = newShape || shape;

  for (let row = 0; row < tetrominoShape.length; row++) {
    for (let col = 0; col < tetrominoShape[row].length; col++) {
      if (tetrominoShape[row][col] !== 0) {
        const boardRow = y + row + deltaY;
        const boardCol = x + col + deltaX;

        // Check if the cell is outside the board boundaries
        if (
          boardCol < 0 ||
          boardCol >= BOARD_WIDTH ||
          boardRow >= BOARD_HEIGHT
        ) {
          return false;
        }

        // Check if the cell is occupied by the existing board
        if (
          boardRow >= 0 &&
          board[boardRow][boardCol] !== 0 &&
          tetrominoShape[row][col] !== 0
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

function rotateShape(shape) {
  // Rotate the shape clockwise
  const rows = shape.length;
  const cols = shape[0].length;
  const rotatedShape = Array(cols)
    .fill()
    .map(() => Array(rows).fill(0));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotatedShape[col][rows - 1 - row] = shape[row][col];
    }
  }

  return rotatedShape;
}

// Pause Menu Functionality
  
restartButton.addEventListener("click", restartGame);




function handleGameOver() {
  clearInterval(intervalId);
  isPaused = true;
  pauseMenu.classList.remove("hidden");
  
  if (lives !== 0) {
    // If there are lives left, show the "Continue" button and decrement lives
    continueButton.classList.remove("hidden");
    console.log(lives, "remaining lives")
    resetBoard()
    lives--;
  } else {
    // If no lives left, show the "Restart" button and handle the game over
    startGame();
    console.log("Game Over");
  }
  
  tetrisBoard.innerHTML = "";
  // Additional game over logic, e.g., displaying a message or resetting the game state 
}


function resetBoard() {
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    board[row].fill(0);
  }
}

function  initializeGame() {
  document.documentElement.style.setProperty('--board-width', BOARD_WIDTH);
  document.documentElement.style.setProperty('--board-height', BOARD_HEIGHT);
    tetrisBoard.innerHTML = "";
    // Initialize the game state
    score = 0;
    lives = MAX_LIVES;
    timer = 0;
    isPaused = false;
    pauseMenu.classList.add("hidden");
    continueButton.disabled = false;
    resetBoard(); // Use the global resetBoard function instead
    spawnNewTetromino();
    renderBoard();
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    timerElement.textContent = timer;
    continueButton.classList.add("hidden")
  }
  

function createEmptyBoard() {
  // Create an empty game board
  const board = [];

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    board.push(Array(BOARD_WIDTH).fill(0));
  }

  return board;
}

function spawnNewTetromino() {
  // Spawn a new random tetromino at the top of the board
  const randomTetromino =
    TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
  currentTetromino = {
    shape: randomTetromino.shape,
    x: Math.floor((BOARD_WIDTH - randomTetromino.shape[0].length) / 2),
    y: 0,
  };
}

function renderBoard() {
  tetrisBoard.innerHTML = "";

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      let cellValue = board[row][col];
      console.log(board[row][col], "apparentl value")
      let cellColor = COLORS[cellValue];


      if (currentTetromino) {
        console.log(currentTetromino, "this the current tetromino")
        const { x, y, shape } = currentTetromino;
        if (row >= y && row < y + shape.length && col >= x && col < x + shape[0].length) {
          cellValue = shape[row - y][col - x] !== 0 ? shape[row - y][col - x] : cellValue;
          cellColor = COLORS[cellValue];
          console.log("cell2:", cellValue)
          console.log("cell2:", cellColor)

        }
      }

      const cellClass = cellValue === 0 ? "empty" : "filled";
  //    console.log("Cell Value:", cellValue, "Cell Color:", cellColor); // Debugging line


      const cellElement = document.createElement("div");
      cellElement.classList.add("cell", cellClass);
      cellElement.style.backgroundColor = cellColor;

      tetrisBoard.appendChild(cellElement);
    }
  }
}


// Event Listeners
document.addEventListener("keydown", handleKeyPress);

// Start the game
startGame();
