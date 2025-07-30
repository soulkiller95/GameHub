let speed = 120; // initial speed in ms

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const modeSelect = document.getElementById("mode");
const rainbowBtn = document.getElementById("rainbow-btn");
let rainbowMode = false;

const messageBox = document.getElementById("message");
const restartBtn = document.getElementById("restart");
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const muteBtn = document.getElementById("muteBtn");
let isMuted = true;

muteBtn.onclick = () => {
  isMuted = !isMuted;
  eatSound.muted = isMuted;
  gameOverSound.muted = isMuted;
  muteBtn.textContent = isMuted ? "🔇":"🔊";
};

const box = 20;
const rows = canvas.height / box;
const cols = canvas.width / box;

let gameInterval, mode = "solo";
let snake1 = [], snake2 = [], dir1, dir2;
let food, score1, score2;
let obstacles = [];

function getHigh(id) {
  return parseInt(localStorage.getItem(id)) || 0;
}
function setHigh(id, score) {
  localStorage.setItem(id, score);
}

document.getElementById("high1").innerText = getHigh("snakeHigh1");
document.getElementById("high2").innerText = getHigh("snakeHigh2");

function initGame() {
  // Snake starting positions
  snake1 = [{ x: 5, y: 10 }];
  dir1 = "RIGHT";
  score1 = 0;

  if (mode === "two") {
    snake2 = [{ x: 15, y: 10 }];
    dir2 = "LEFT";
    score2 = 0;
  } else {
    snake2 = [];
    dir2 = null;
    score2 = 0;
  }
rainbowBtn.onclick = () => {
  rainbowMode = !rainbowMode;
  rainbowBtn.classList.toggle("active", rainbowMode);
};

  food = spawnFood();
  obstacles = generateObstacles(10); // Generate 10 obstacles randomly
  updateScores();
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);

  messageBox.innerText = "";
}

function spawnFood() {
  let position;
  while (true) {
    position = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
    if (
      !snake1.some(p => p.x === position.x && p.y === position.y) &&
      !snake2.some(p => p.x === position.x && p.y === position.y) &&
      !obstacles.some(p => p.x === position.x && p.y === position.y)
    ) break;
  }
  return position;
}

function generateObstacles(count = 10) {
  const taken = [...snake1];
  if (mode === "two") taken.push(...snake2);
  if (food) taken.push(food);

  const newObstacles = [];
  while (newObstacles.length < count) {
    const pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
    if (!taken.some(p => p.x === pos.x && p.y === pos.y) &&
        !newObstacles.some(p => p.x === pos.x && p.y === pos.y)) {
      newObstacles.push(pos);
    }
  }
  return newObstacles;
}
function draw() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

drawSnake(snake1, "limegreen");
if (mode === "two") drawSnake(snake2, "blue");

drawObstacles();

// Draw food
ctx.fillStyle = "red";
ctx.beginPath();
ctx.arc(food.x * box + box / 2, food.y * box + box / 2, box / 2.5, 0, 2 * Math.PI);
ctx.fill();

moveSnake(snake1, dir1, "score1", "snakeHigh1");
if (mode === "two") moveSnake(snake2, dir2, "score2", "snakeHigh2");

const snake1Dead = checkCollision(snake1);
const snake2Dead = mode === "two" ? checkCollision(snake2) : false;

if (snake1Dead && snake2Dead) {
if (score1 === score2) return endGame("Draw!");
else if (score1 > score2) return endGame("Player 1 Wins!");
else return endGame("Player 2 Wins!");
}

if (snake1Dead) return endGame(mode === "two" ? "Player 2 Wins!" : "Game Over");
if (snake2Dead) return endGame("Player 1 Wins!");
}

function drawSnake(snake, baseColor) {
  for (let i = 0; i < snake.length; i++) {
    let color = baseColor;

    if (rainbowMode && snake === snake1) {
      // Generate hue shifting along the body
      const hue = (i * 20 + Date.now() / 10) % 360;
      color = `hsl(${hue}, 100%, 50%)`;
    }

    ctx.fillStyle = color;
    ctx.fillRect(snake[i].x * box, snake[i].y * box, box, box);
  }
}


function drawObstacles() {
  ctx.fillStyle = "#444"; // Wall color
  obstacles.forEach(ob => {
    ctx.fillRect(ob.x * box, ob.y * box, box, box);
  });
}

function moveSnake(snake, dir, scoreId, highKey) {
  const head = { ...snake[0] };
  if (dir === "LEFT") head.x--;
  if (dir === "RIGHT") head.x++;
  if (dir === "UP") head.y--;
  if (dir === "DOWN") head.y++;

  if (head.x === food.x && head.y === food.y) {
    snake.unshift(head);
    eatSound?.play();
    let score = scoreId === "score1" ? ++score1 : ++score2;
    food = spawnFood();
    updateScores();
      if (scoreId === "score1" && mode === "solo") {
    adjustSpeed(score1);
  }


    if (score > getHigh(highKey)) {
      setHigh(highKey, score);
      document.getElementById(highKey.replace("snake", "high")).innerText = score;
    }
  } else {
    snake.pop();
    snake.unshift(head);
  }
}

function checkCollision(snake) {
  const head = snake[0];

  if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) return true;

  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) return true;
  }

  for (let ob of obstacles) {
    if (ob.x === head.x && ob.y === head.y) return true;
  }

  if (mode === "two" && snake === snake1 && snake2.some(p => p.x === head.x && p.y === head.y)) return true;
  if (mode === "two" && snake === snake2 && snake1.some(p => p.x === head.x && p.y === head.y)) return true;

  return false;
}
function updateScores() {
  document.getElementById("score1").innerText = score1;
  document.getElementById("score2").innerText = score2;

  const p2ScoreBox = document.getElementById("p2-score");
  if (mode === "two") {
    p2ScoreBox.style.display = "inline-block";
  } else {
    p2ScoreBox.style.display = "none";
  }
}
function adjustSpeed(currentScore) {
  // For every 5 points, reduce interval by 10ms (up to a minimum speed)
  const newSpeed = Math.max(60, 120 - Math.floor(currentScore / 5) * 10);
  if (newSpeed !== speed) {
    speed = newSpeed;
    clearInterval(gameInterval);
    gameInterval = setInterval(draw, speed);
  }
}

function endGame(message) {
  clearInterval(gameInterval);
  gameOverSound?.play();

  if (mode === "two") {
    messageBox.innerText = `🚩 ${message}\nPlayer 1: ${score1} | Player 2: ${score2}`;
  } else {
    messageBox.innerText = `🚩 ${message}\nYour Score: ${score1}`;
  }

  // hide P2 score visually after solo game ends
  document.getElementById("p2-score").style.display = mode === "two" ? "inline-block" : "none";
}


window.addEventListener("keydown", (e) => {
  const k = e.key;
  if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(k)) {
    if (k === "ArrowLeft" && dir1 !== "RIGHT") dir1 = "LEFT";
    if (k === "ArrowUp" && dir1 !== "DOWN") dir1 = "UP";
    if (k === "ArrowRight" && dir1 !== "LEFT") dir1 = "RIGHT";
    if (k === "ArrowDown" && dir1 !== "UP") dir1 = "DOWN";
  }
  if (["a", "w", "d", "s"].includes(k)) {
    if (k === "a" && dir2 !== "RIGHT") dir2 = "LEFT";
    if (k === "w" && dir2 !== "DOWN") dir2 = "UP";
    if (k === "d" && dir2 !== "LEFT") dir2 = "RIGHT";
    if (k === "s" && dir2 !== "UP") dir2 = "DOWN";
  }
});

restartBtn.onclick = initGame;
modeSelect.onchange = () => {
  mode = modeSelect.value;
  initGame();
};
window.onload = initGame;
rainbowBtn.onclick = () => {
  rainbowMode = !rainbowMode;
  rainbowBtn.classList.toggle("active", rainbowMode);
};

