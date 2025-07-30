const board = document.getElementById('board');
const turnText = document.getElementById('turn-indicator');
const resetBtn = document.getElementById('reset');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const modeSelect = document.getElementById('mode');
const messageBox = document.getElementById('message');

let currentPlayer = 'X';
let cells = Array(9).fill('');
let gameActive = true;
let mode = 'friend';

let scores = {
  X: parseInt(localStorage.getItem('scoreX')) || 0,
  O: parseInt(localStorage.getItem('scoreO')) || 0,
};

function drawBoard() {
  board.innerHTML = '';
  cells.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.textContent = val;
    board.appendChild(cell);
  });
}

function checkWin(player) {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return wins.some(line => line.every(i => cells[i] === player));
}

function checkDraw() {
  return cells.every(cell => cell !== '');
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.classList.remove('hidden');
}

function clearMessage() {
  messageBox.classList.add('hidden');
  messageBox.textContent = '';
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
}

function botMove() {
  let emptyIndexes = cells.map((val, idx) => val === '' ? idx : null).filter(idx => idx !== null);
  if (emptyIndexes.length === 0 || !gameActive) return;

  const choice = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  cells[choice] = 'O';
  drawBoard();

  if (checkWin('O')) {
    scores.O++;
    localStorage.setItem('scoreO', scores.O);
    updateScores();
    showMessage("🟢 Bot (O) wins!");
    gameActive = false;
    return;
  }

  if (checkDraw()) {
    showMessage("It's a draw!");
    gameActive = false;
    return;
  }

  currentPlayer = 'X';
  turnText.textContent = `Current Turn: ❌`;
}

board.addEventListener('click', (e) => {
  const idx = e.target.dataset.index;
  if (!gameActive || !idx || cells[idx] !== '') return;

  if (mode === 'bot' && currentPlayer !== 'X') return;

  cells[idx] = currentPlayer;
  drawBoard();

  if (checkWin(currentPlayer)) {
    scores[currentPlayer]++;
    localStorage.setItem(`score${currentPlayer}`, scores[currentPlayer]);
    updateScores();
    showMessage(`🎉 Player ${currentPlayer} wins!`);
    gameActive = false;
    return;
  }

  if (checkDraw()) {
    showMessage("It's a draw!");
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  turnText.textContent = `Current Turn: ${currentPlayer === 'X' ? '❌' : '🟢'}`;

  if (mode === 'bot' && currentPlayer === 'O') {
    setTimeout(botMove, 500);
  }
});

resetBtn.addEventListener('click', () => {
  cells = Array(9).fill('');
  gameActive = true;
  currentPlayer = 'X';
  drawBoard();
  turnText.textContent = `Current Turn: ❌`;
  clearMessage();
});

modeSelect.addEventListener('change', (e) => {
  mode = e.target.value;
  resetBtn.click(); // Reset game on mode switch
});

scoreX.textContent = scores.X;
scoreO.textContent = scores.O;
drawBoard();
