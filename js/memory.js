const matchSound = new Audio('../assets/sounds/match.mp3');
const mismatchSound = new Audio('../assets/sounds/mismatch.mp3');
const winSound = new Audio('../assets/sounds/win.mp3');

// Theme icon sets
const emojiIcons = [
 '🤣','😇','🥰','🥳','🥶','🥵','😴', '😈',
 '😜','😎','🤩','😡','🤠','🤮','🤑', '😃','🤓','😫'];
const numberIcons = [
  '1', '2', '3', '4', '5', '6',
  '7', '8', '9', '10', '11', '12',
  '13', '14', '15', '16', '17', '18'
];
const colorIcons = [
  '🔴', '🟠', '🟡', '🟢', '🔵', '🟣',
  '⚫', '⚪', '🟤', '🔶', '🔷', '🔺',
  '🔻', '⬛', '⬜', '🟥', '🟩', '🟦'
];
const fruitIcons = ['🍎', '🍌', '🍇', '🍓', '🍉', '🍍', '🥝', '🍒',
  '🍐','🍊','🥭','🍅','🍏','🍋','🫐', '🍈','🍑','🥥'];
const animalIcons =['🦁','🐘','🦒','🦚','🦘','🐎','🦔', '🦅','🐅','🐄',
  '🐖','🦓','🐒','🐕','🐈', '🦩','🐢','🐉'];
const spaceIcons =['🌠','👨‍🚀','🌞','🌝','🌚','🌍','🪐', '👽',
  '🌕','👩‍🚀','🌛','🌜','🌙','💫','🌟', '☄','🌑','☀'
];
let currentTheme = 'emoji';
let currentDifficulty = 'easy';

document.getElementById('difficulty').addEventListener('change', (e) => {
  currentDifficulty = e.target.value;
  startGame();
});

document.getElementById("theme").addEventListener("change", (e) => {
  currentTheme = e.target.value;
  startGame(); // restart game with new theme
});

let grid = document.getElementById('grid');
let movesSpan = document.getElementById('moves');
let timerSpan = document.getElementById('timer');
let bestScoreSpan = document.getElementById('best-score');
let winMessage = document.getElementById('winMessage');

let flippedCards = [];
let matched = 0;
let moves = 0;
let timer;
let seconds = 0;

function getIconsForTheme(theme, count) {
  let base = [];

  if (theme === 'emoji') base = emojiIcons;
  else if (theme === 'numbers') base = numberIcons;
  else if (theme === 'fruits') base = fruitIcons;
  else if (theme === 'space') base = spaceIcons;
  else if (theme === 'colors') base = colorIcons;
  else if (theme === 'animals') base = animalIcons;

  const needed = Math.floor(count / 2);
  const selected = base.slice(0, needed);
  let icons = [...selected, ...selected];

  // For odd grids like 5x5 (25 cards), add 1 extra
  if (count % 2 !== 0 && base.length > needed)
    icons.push(base[needed]);

  return icons.sort(() => Math.random() - 0.5);
}

function startGame() {
  grid.innerHTML = '';
  winMessage.style.display = 'none';
  moves = 0;
  seconds = 0;
  matched = 0;
  flippedCards = [];
  movesSpan.textContent = 0;
  timerSpan.textContent = 0;
  clearInterval(timer);

  timer = setInterval(() => {
    seconds++;
    timerSpan.textContent = seconds;
  }, 1000);

let gridSize = 4;
if (currentDifficulty === 'normal') gridSize = 5;
else if (currentDifficulty === 'hard') gridSize = 6;

const totalCards = gridSize * gridSize;
const icons = getIconsForTheme(currentTheme, totalCards);

grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  icons.forEach((icon, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${icon}</div>
      </div>
    `;
    card.dataset.icon = icon;
    card.dataset.index = index;
    card.addEventListener('click', flipCard);
    grid.appendChild(card);
  });
    const allCards = document.querySelectorAll('.card');
  allCards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('shuffle');
      setTimeout(() => card.classList.remove('shuffle'), 300);
    }, i * 40);
  });
}

function flipCard() {
  if (
    this.classList.contains('flip') ||
    flippedCards.length === 2
  ) return;

  this.classList.add('flip');
  flippedCards.push(this);

  if (flippedCards.length === 2) {
    moves++;
    movesSpan.textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  const isMatch = card1.dataset.icon === card2.dataset.icon;

  if (isMatch) {
    matched += 2;
    flippedCards = [];
    matchSound.play();

    if (matched === 16) {
      clearInterval(timer);
      showWinMessage();
      winSound.play();
    }
  } else {
    mismatchSound.play();
    setTimeout(() => {
      card1.classList.remove('flip');
      card2.classList.remove('flip');
      flippedCards = [];
    }, 1000);
  }
}

function showWinMessage() {
  winMessage.style.display = 'block';

  const best = JSON.parse(localStorage.getItem('memoryBest')) || null;
  if (!best || seconds < best.time) {
    localStorage.setItem('memoryBest', JSON.stringify({ time: seconds, moves }));
  }
  updateBestScore();
}

function updateBestScore() {
  const best = JSON.parse(localStorage.getItem('memoryBest'));
  if (best) {
    bestScoreSpan.textContent = `${best.time}s / ${best.moves} moves`;
  }
}

startGame();
updateBestScore();
