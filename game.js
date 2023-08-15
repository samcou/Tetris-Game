// Game Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SQUARE_SIZE = 30;
const GAME_SPEED = 500; // milliseconds
const MAX_LIVES = 3;

// Game Elements 
const gameContainer = document.getElementById("game-container"); // Game container
const tetrisBoard = document.getElementById("tetris-board"); // Tetris board
const scoreElement = document.getElementById("score-value"); // Score
const timerElement = document.getElementById("timer-value"); // Timer
const livesElement = document.getElementById("lives-value"); // Number of Lives left
const pauseMenu = document.getElementById("pause-menu"); // Pause menu
const continueButton = document.getElementById("continue-btn"); // Continue button
const restartButton = document.getElementById("restart-btn"); // Restart Button
const pauseButton = document.getElementById("pause-btn"); // Pause button

const music = document.getElementById("gameMusic");

function startMusic() {
    music.play();
}

function pauseMusic() {
    music.pause();
}

let gameMusic = document.getElementById('gameMusic');

document.getElementById('playMusic').addEventListener('click', function() {
    gameMusic.play();
});

document.getElementById('pauseMusic').addEventListener('click', function() {
    gameMusic.pause();
});

// You can start the music when the game starts and pause when the game is paused.

pauseButton.addEventListener("click", pauseGame);
continueButton.addEventListener("click", continueGame)

const TETROMINOS = [
  { shape: [[1, 1, 1, 1]], color : 1 },              // I-shape
  { shape: [[2, 2], [2, 2]], color : 2 },            // O-shape
  { shape: [[3, 3, 3], [0, 3, 0]], color : 3 },      // T-shape
  { shape: [[4, 4, 0], [0, 4, 4]], color : 4 },      // S-shape
  { shape: [[0, 5, 5], [5, 5, 0]], color : 5 },      // Z-shape
  { shape: [[6, 6, 6], [0, 0, 6]], color : 6 },      // J-shape
  { shape: [[7, 7, 7], [7, 0, 0]], color : 7 },      // L-shape
];

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
  gameMusic.pause();  // pause the music
  clearInterval(intervalId);
  pauseMenu.classList.remove("hidden");
  continueButton.classList.remove("hidden")
  restartButton.classList.remove("hidden")
}


function continueGame() {
  console.log("Continue game function called!");
  isPaused = false;
  gameMusic.play()
  intervalId = setInterval(updateGame, GAME_SPEED);
  pauseMenu.classList.add("hidden");
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
  
  if (lives > 1) {
    // If there are lives left, show the "Continue" button and decrement lives
    continueButton.classList.remove("hidden");
    restartButton.classList.add("hidden")
    console.log(lives, "remaining lives")
    resetBoard()
    lives--;
  } else {
    // If no lives left, show the "Restart" button and handle the game over
    restartButton.classList.remove("hidden")
    continueButton.classList.add("hidden")
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
  // Clear the previous state of the board in the HTML.
  tetrisBoard.innerHTML = "";

  // Iterate over each row of the board.
  for (let row = 0; row < BOARD_HEIGHT; row++) {
      // Iterate over each column in the current row.
      for (let col = 0; col < BOARD_WIDTH; col++) {
          // Get the value of the current cell.
          // This value corresponds to the type of block (or Tetromino).
          let cellValue = board[row][col];

          // If there's a currently active Tetromino, we check if 
          // the current cell is part of that Tetromino.
          if (currentTetromino) {
              const { x, y, shape } = currentTetromino;
              
              // Check if the cell is within the bounds of the current Tetromino.
              if (row >= y && row < y + shape.length && col >= x && col < x + shape[0].length) {
                  // Update the cell value if it's part of the Tetromino.
                  cellValue = shape[row - y][col - x] !== 0 ? shape[row - y][col - x] : cellValue;
              }
          }

          // Determine the class for the cell based on its value.
          // Cells with a value of 0 are empty, others are filled.
          const cellClass = cellValue === 0 ? "empty" : "filled";
          // Create a class based on the cell's value to apply the appropriate color.
          const colorClass = `color-${cellValue}`;

          // Create a new div element to represent the cell.
          const cellElement = document.createElement("div");
          // Add the default "cell" class, as well as the determined class (either "empty" or "filled").
          cellElement.classList.add("cell", cellClass, colorClass);

          // Append the cell to the Tetris board in the HTML.
          tetrisBoard.appendChild(cellElement);
      }
  }
}


// Event Listeners
document.addEventListener("keydown", handleKeyPress);

// Start the game
startGame();
