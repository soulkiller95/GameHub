const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");

const puzzle = document.getElementById("puzzle");
const moveCountEl = document.getElementById("moveCount");
const bestScoreEl = document.getElementById("bestScore");
const difficultySelect = document.getElementById("difficulty");
const shuffleBtn = document.getElementById("shuffleBtn");
const winMessage = document.getElementById("winMessage");

let gridSize = parseInt(difficultySelect.value); // e.g. 4
let tiles = [];
let emptyPos = {};
let moves = 0;

function initGame() {
  gridSize = parseInt(difficultySelect.value);
  puzzle.innerHTML = "";
  puzzle.dataset.size = gridSize;
  puzzle.style.pointerEvents = "none";
  tiles = [];
  moves = 0;
  moveCountEl.textContent = 0;
  winMessage.classList.add("hidden");

  // Generate ordered tiles
  for (let i = 1; i <= gridSize * gridSize - 1; i++) {
    tiles.push(i);
  }
  tiles.push(null); // empty tile

  // Shuffle and ensure solvable
  do {
    shuffleArray(tiles);
  } while (!isSolvable(tiles));

  // Render puzzle
  renderTiles();

  // Allow interaction
  setTimeout(() => puzzle.style.pointerEvents = "auto", 200);
}

function renderTiles() {
  puzzle.innerHTML = "";
  for (let i = 0; i < tiles.length; i++) {
    const tileValue = tiles[i];
    const tile = document.createElement("div");
    tile.classList.add("tile");
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    if (tileValue === null) {
      tile.classList.add("empty");
      emptyPos = { row, col };
    } else {
      tile.textContent = tileValue;
      tile.addEventListener("click", () => handleMove(row, col));
    }

    puzzle.appendChild(tile);
  }
}

function handleMove(row, col) {
  const dRow = Math.abs(row - emptyPos.row);
  const dCol = Math.abs(col - emptyPos.col);

  if ((dRow === 1 && dCol === 0) || (dRow === 0 && dCol === 1)) {
    const emptyIndex = emptyPos.row * gridSize + emptyPos.col;
    const clickedIndex = row * gridSize + col;

    // Swap in tile array
    [tiles[emptyIndex], tiles[clickedIndex]] = [tiles[clickedIndex], tiles[emptyIndex]];

    // Update empty position
    emptyPos = { row, col };

    renderTiles();
    moveSound.currentTime = 0;
moveSound.play();

    moves++;
    moveCountEl.textContent = moves;

    if (checkWin()) {
      winMessage.classList.remove("hidden");
      updateBestScore();
    }
  }
}

function checkWin() {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }winSound.currentTime = 0;
winSound.play();
  document.getElementById("replayBtn").addEventListener("click", () => {
  winMessage.classList.add("hidden");
    


initGame();
  loadBestScore();             // Randomizes the tiles
});

  return true;
}

function updateBestScore() {
  const key = `slidingBest_${gridSize}`;
  const currentBest = parseInt(localStorage.getItem(key)) || Infinity;
  if (moves < currentBest) {
    localStorage.setItem(key, moves);
    bestScoreEl.textContent = moves;
  }
}

function loadBestScore() {
  const key = `slidingBest_${gridSize}`;
  const best = parseInt(localStorage.getItem(key));
  bestScoreEl.textContent = isNaN(best) ? "--" : best;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function isSolvable(arr) {
  const invCount = getInversionCount(arr.filter(v => v !== null));
  if (gridSize % 2 === 1) {
    return invCount % 2 === 0;
  } else {
    const emptyRowFromBottom = gridSize - Math.floor(arr.indexOf(null) / gridSize);
    return (invCount + emptyRowFromBottom) % 2 === 0;
  }
}

function getInversionCount(arr) {
  let count = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) count++;
    }
  }
  return count;
}

// Event Listeners
shuffleBtn.addEventListener("click", () => {
  initGame();
  loadBestScore();
});

difficultySelect.addEventListener("change", () => {
  initGame();
  loadBestScore();
});

// Init
initGame();
loadBestScore();
