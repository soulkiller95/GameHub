document.body.addEventListener("touchstart", function (e) {
  if (e.target === canvas) e.preventDefault();
}, { passive: false });

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
let gameStarted = false;

const birdImg = new Image();
birdImg.src = "../assets/bird.png";

const flapSound = new Audio("../assets/sounds/flap.mp3");
const hitSound = new Audio("../assets/sounds/hit.mp3");

let isMuted = false;
document.getElementById("muteBtn").onclick = () => {
  isMuted = !isMuted;
  document.getElementById("muteBtn").innerText = isMuted ? "🔇" : "🔊";
};

let bird = {
  x: 60,
  y: 150,
  width: 50,
  height: 40,
  velocity: 0
};

let gravity = 0.5;
let flapStrength = -8;
let pipes = [];
let pipeGap = 160;
let pipeWidth = 60;
let score = 0;
let highScore = parseInt(localStorage.getItem("flappyHigh")) || 0;
document.getElementById("highScore").innerText = `High Score: ${highScore}`;

let gameOver = false;

function resetGame() {
  bird.y = 150;
  bird.velocity = 0;
  score = 0;
  pipes = [];
  gameOver = false;
  for (let i = 0; i < 3; i++) {
    pipes.push({
      x: canvas.width + i * 200,
      y: Math.floor(Math.random() * 250) + 50
    });
  }
  document.getElementById("message").innerText = "";
   startBtn.classList.remove("hidden"); 
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  pipes.forEach(pipe => {
    ctx.fillStyle = "limegreen";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
    ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - (pipe.y + pipeGap));
  });

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function update() {
  bird.velocity += gravity;
  bird.y += bird.velocity;

  pipes.forEach(pipe => {
    pipe.x -= 2;

    // Score when pipe passes
    if (pipe.x + pipeWidth === bird.x) {
      score++;
    }

    // Collision check
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipeGap)
    ) {
      gameOver = true;
    }
  });

  // Out of bounds
  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver = true;
  }
if (pipes[0].x + pipeWidth < 0) {
  pipes.shift();

  let maxTopHeight = canvas.height - pipeGap - 100;
  let newY = Math.floor(Math.random() * maxTopHeight) + 50;

  let lastX = pipes[pipes.length - 1].x;
  let spacing = 200; 
  pipes.push({
    x: lastX + spacing,
    y: newY
  });
}

}
function loop() {
  if (!gameOver && gameStarted) {
    update();
    draw();
    document.getElementById("score").innerText = `Score: ${score}`;
    if (score > highScore) {
  highScore = score;
  localStorage.setItem("flappyHigh", highScore);
  document.getElementById("highScore").innerText = `High Score: ${highScore}`;
}

    requestAnimationFrame(loop);

  } else if (gameOver) {
    document.getElementById("message").innerText = "💥 Game Over!";
    if (!isMuted) hitSound.play();
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault(); // prevents activating focused buttons

    // ✅ only allow flap when game has started and not over
    if (gameStarted && !gameOver) {
      bird.velocity = flapStrength;
      if (!isMuted) flapSound.play();
    }
  }
});
canvas.addEventListener("touchstart", e => {
  e.preventDefault(); // prevent scrolling on tap
  if (gameStarted && !gameOver) {
    bird.velocity = flapStrength;
    if (!isMuted) flapSound.play();
  }
});

startBtn.onclick = () => {
  gameStarted = true;
  startBtn.classList.add("hidden");
  loop();
};

document.getElementById("restartBtn").onclick = () => {
  resetGame();
  document.activeElement.blur();
};


window.onload = resetGame;
