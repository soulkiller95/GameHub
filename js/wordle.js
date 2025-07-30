const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

let wordList = [];
let word = "";
// Load words from file
fetch("../assets/words.txt")
  .then(res => res.text())
  .then(text => {
    wordList = text.split("\n").map(w => w.trim().toLowerCase()).filter(w => w.length === 5);
    startGame();
  });

function startGame() {
  pickWord();
  createBoard();
  createKeyboard();
}

let currentGuess = "";
let currentRow = 0;
let gameOver = false;

function pickWord() {
  word = wordList[Math.floor(Math.random() * wordList.length)];
  console.log("Word is:", word); // for testing
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function createKeyboard() {
  const keys = "qwertyuiopasdfghjklzxcvbnm⌫↵";
  keyboard.innerHTML = "";
  for (let key of keys) {
    const button = document.createElement("button");
button.classList.add("key");

if (key === "↵") button.classList.add("key-enter");
if (key === "⌫") button.classList.add("key-del");
    button.textContent = key === "↵" ? "Enter" : key === "⌫" ? "Del" : key;
    button.dataset.key = key;
    button.addEventListener("click", () => handleKey(key));
    keyboard.appendChild(button);
  }
}

function handleKey(key) {
  if (gameOver) return;

  if (key === "⌫") {
    currentGuess = currentGuess.slice(0, -1);
  } else if (key === "↵") {
    if (currentGuess.length === 5) {
      checkGuess();
    }
  } else if (/^[a-z]$/.test(key) && currentGuess.length < 5) {
    currentGuess += key;
  }
  updateBoard();
}

function updateBoard() {
  const row = board.children[currentRow];
  for (let i = 0; i < 5; i++) {
    const tile = row.children[i];
    tile.textContent = currentGuess[i] || "";
  }
}

function checkGuess() {
  const row = board.children[currentRow];
  const guess = currentGuess;

  const answerLetters = word.split("");
  const guessLetters = guess.split("");

  const tileStates = Array(5).fill("absent");

  // Check for correct letters
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      tileStates[i] = "correct";
      answerLetters[i] = null; // mark as used
    }
  }

  // Check for present letters
  for (let i = 0; i < 5; i++) {
    if (tileStates[i] === "correct") continue;
    const idx = answerLetters.indexOf(guessLetters[i]);
    if (idx !== -1) {
      tileStates[i] = "present";
      answerLetters[idx] = null;
    }
  }

for (let i = 0; i < 5; i++) {
  const tile = row.children[i];
  setTimeout(() => {
    tile.classList.add("flip");
    tile.classList.add(tileStates[i]);
  }, i * 300);
}
setTimeout(() => {
  for (let i = 0; i < 5; i++) {
    const key = document.querySelector(`.key[data-key="${guess[i]}"]`);
    if (!key) continue;

    const state = tileStates[i];

    // Don't downgrade color (correct > present > absent)
    if (state === "correct" || 
       (state === "present" && !key.classList.contains("correct")) || 
       (state === "absent" && !key.classList.contains("correct") && !key.classList.contains("present"))) {
      key.classList.remove("correct", "present", "absent");
      key.classList.add(state);
    }
  }
}, 5 * 300); // After all flips are done


  if (guess === word) {
    showMessage("🎉 You guessed it!");
    gameOver = true;
    return;
  }

  currentRow++;
  currentGuess = "";

  if (currentRow >= 6) {
    showMessage(`❌ The word was: ${word.toUpperCase()}`);
    gameOver = true;
  }
}

function showMessage(text) {
  message.textContent = text;
  message.classList.remove("hidden");
}

restartBtn.addEventListener("click", () => {
  gameOver = false;
  currentGuess = "";
  currentRow = 0;
  message.classList.add("hidden");
  pickWord();
  createBoard();
  document.querySelectorAll(".key").forEach(k => {
  k.classList.remove("correct", "present", "absent");
});

  createKeyboard();
});

pickWord();
createBoard();
createKeyboard();
