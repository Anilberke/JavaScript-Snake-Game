const scoreEl = document.querySelector('.score');
const highScoreEl = document.querySelector('.high-score');
const gameOverEl = document.querySelector('.game-over');
const playAgainBtn = document.querySelector('.play-again');

const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
cvs.style.border = '1px solid #fff';
const width = cvs.width;
const height = cvs.height;
const FPS = 1000 / 15;
let gameLoop;
const squareSize = 20;
let gameStarted = false;
let boardColor = '#000000', headColor = '#fff', bodyColor = "#999";
let currentDirection = '';
let directionsQueue = [];
const directions = { Right: "ArrowRight", Left: "ArrowLeft", Up: "ArrowUp", Down: "ArrowDown" };

function drawBoard() {
  ctx.fillStyle = boardColor;
  ctx.fillRect(0, 0, width, height);
}

function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
  ctx.strokeStyle = boardColor;
  ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

let snake = [
  { x: 2, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 0 },
];

function drawSnake() {
  snake.forEach((square, index) => {
    const color = index === 0 ? headColor : bodyColor;
    drawSquare(square.x, square.y, color);
  });
}

function moveSnake() {
  if (!gameStarted) return;
  
  const head = { ...snake[0] };
  if (directionsQueue.length) {
    currentDirection = directionsQueue.shift();
  }
  
  switch (currentDirection) {
    case directions.Right:
      head.x += 1;
      break;
    case directions.Left:
      head.x -= 1;
      break;
    case directions.Up:
      head.y -= 1;
      break;
    case directions.Down:
      head.y += 1;
      break;
  }

  if (hasEatenFood()) {
    food = createFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

function hasEatenFood() {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
}

document.addEventListener("keyup", setDirection);

function setDirection(event) {
  const newDirection = event.key;
  const oldDirection = currentDirection;
  
  if ((newDirection === directions.Right && oldDirection !== directions.Left)
    || (newDirection === directions.Left && oldDirection !== directions.Right)
    || (newDirection === directions.Up && oldDirection !== directions.Down)
    || (newDirection === directions.Down && oldDirection !== directions.Up)) {
      
    if (!gameStarted) {
      gameStarted = true;
      gameLoop = setInterval(frame, FPS);
    }
    directionsQueue.push(newDirection);
  }
}

const horizontalSq = width / squareSize;
const verticalSq = height / squareSize;

let food = createFood();

function createFood() {
  let food = {
    x: Math.floor(Math.random() * horizontalSq),
    y: Math.floor(Math.random() * verticalSq),
  };

  while (snake.some((square) => square.x === food.x && square.y === food.y)) {
    food = {
      x: Math.floor(Math.random() * horizontalSq),
      y: Math.floor(Math.random() * verticalSq),
    };
  }

  return food;
}

function drawFood() {
  drawSquare(food.x, food.y, "#F95700");
}

// Score
const initialSnakeLength = snake.length;
let score = 0;
let highScore = localStorage.getItem('high-score') || 0;

function drawScore() {
  scoreEl.innerHTML = `Score: ${score}`;
  highScoreEl.innerHTML = `Highscore: ${highScore}`;
}

function hitWall() {
  const head = snake[0];

  return (
    head.x < 0 ||
    head.x >= horizontalSq ||
    head.y < 0 ||
    head.y >= verticalSq
  );
}

function hitSelf() {
  const snakeBody = [...snake];
  const head = snakeBody.shift();
  return snakeBody.some((square) => square.x === head.x && square.y === head.y);
}

function gameOver() {
  const scoreEl = document.querySelector('.game-over-score .current');
  const highScoreEl = document.querySelector('.game-over-score .highscore');
  highScore = Math.max(score, highScore);
  localStorage.setItem('high-score', highScore);

  scoreEl.innerHTML = `Score: ${score}`;
  highScoreEl.innerHTML = `Highscore: ${highScore}`;

  gameOverEl.classList.remove('hide');
}

function frame() {
  drawBoard();
  drawFood();
  moveSnake();
  drawSnake();
  drawScore();
  
  if (hitWall() || hitSelf()) {
    clearInterval(gameLoop);
    gameOver();
  }
}

// Restart the game
playAgainBtn.addEventListener('click', restartGame);

function restartGame() {
  // Reset snake length and position
  snake = [
    { x: 2, y: 0 }, // Head
    { x: 1, y: 0 }, // Body
    { x: 0, y: 0 }, // Tail
  ];

  // Reset directions
  currentDirection = '';
  directionsQueue = [];

  // Hide the game over screen
  gameOverEl.classList.add('hide');

  // Reset the gameStarted state to false
  gameStarted = false;

  // Create new food
  food = createFood();

  // Re-draw everything
  frame();
}

