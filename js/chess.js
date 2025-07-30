let moved = {
  whiteKing: false,
  blackKing: false,
  whiteRookLeft: false,
  whiteRookRight: false,
  blackRookLeft: false,
  blackRookRight: false
};

const boardElement = document.getElementById("chessBoard");
const statusText = document.getElementById("status");
const promotionModal = document.getElementById("promotionModal");
const moveSound = document.getElementById("moveSound");
const captureSound = document.getElementById("captureSound");
const checkSound = document.getElementById("checkSound");

let board = [];
let selected = null;
let turn = "white";
let gameOver = false;
let promotionInfo = null;
let enPassant = null;
let moveHistory = [];

const pieceEmoji = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
};

function initialBoard() {
  return [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ];
}

function isWhitePiece(piece) {
  return piece && piece === piece.toUpperCase();
}

function isBlackPiece(piece) {
  return piece && piece === piece.toLowerCase();
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement("div");
      const isWhite = (row + col) % 2 === 0;
      cell.className = "cell " + (isWhite ? "white" : "black");
      cell.dataset.row = row;
      cell.dataset.col = col;

      const piece = board[row][col];
      if (piece) {
        cell.textContent = pieceEmoji[piece];
        cell.classList.add("move-anim");
      }

      if (!gameOver && !promotionInfo) {
        cell.addEventListener("click", () => handleCellClick(row, col));
      }

      boardElement.appendChild(cell);
    }
  }
}

function handleCellClick(row, col) {
  if (gameOver || promotionInfo) return;

  const piece = board[row][col];
  const isWhiteTurn = turn === "white";

  if (selected) {
    const [selRow, selCol] = selected;
    const movingPiece = board[selRow][selCol];

    if (row === selRow && col === selCol) {
      selected = null;
      renderBoard();
      return;
    }

    const target = board[row][col];

    if (isLegalMove(selRow, selCol, row, col, movingPiece)) {
      const snapshot = JSON.parse(JSON.stringify(board));
      moveHistory.push({ board: snapshot, turn, enPassant });

      const captured = board[row][col];
      board[row][col] = movingPiece;
      board[selRow][selCol] = "";
      // ✅ Update moved status
if (movingPiece === "K") moved.whiteKing = true;
if (movingPiece === "k") moved.blackKing = true;
if (movingPiece === "R" && selRow === 7 && selCol === 0) moved.whiteRookLeft = true;
if (movingPiece === "R" && selRow === 7 && selCol === 7) moved.whiteRookRight = true;
if (movingPiece === "r" && selRow === 0 && selCol === 0) moved.blackRookLeft = true;
if (movingPiece === "r" && selRow === 0 && selCol === 7) moved.blackRookRight = true;


      // En Passant Capture
      if (movingPiece.toLowerCase() === "p" && enPassant &&
          row === enPassant.row && col === enPassant.col) {
        const capRow = turn === "white" ? row + 1 : row - 1;
        board[capRow][col] = "";
      }

      // Castling
      if (movingPiece.toLowerCase() === "k" && Math.abs(col - selCol) === 2) {
        const rookCol = col === 6 ? 7 : 0;
        const newRookCol = col === 6 ? 5 : 3;
        board[row][newRookCol] = board[row][rookCol];
        board[row][rookCol] = "";
      }

      // Pawn Double Step → Set enPassant square
      enPassant = null;
      if (movingPiece.toLowerCase() === "p" && Math.abs(row - selRow) === 2) {
        enPassant = {
          row: (row + selRow) / 2,
          col: col
        };
      }

      // Promotion?
      if (movingPiece.toLowerCase() === "p" &&
         ((turn === "white" && row === 0) || (turn === "black" && row === 7))) {
        promotionInfo = { row, col, color: turn };
        renderBoard();
        promotionModal.style.display = "flex";
        return;
      }

      playSound(captured ? "capture" : "move");
      switchTurn();
    }

    selected = null;
    renderBoard();
  } else {
    if ((isWhiteTurn && isWhitePiece(piece)) || (!isWhiteTurn && isBlackPiece(piece))) {
      selected = [row, col];
      highlightCell(row, col);
    }
  }
}

function promotePawn(type) {
  const { row, col, color } = promotionInfo;
  board[row][col] = color === "white" ? type.toUpperCase() : type.toLowerCase();
  promotionInfo = null;
  promotionModal.style.display = "none";
  switchTurn();
  renderBoard();
}
function highlightCell(row, col) {
  renderBoard();
  const index = row * 8 + col;
  boardElement.children[index].classList.add("highlight");

  const piece = board[row][col];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (isLegalMove(row, col, r, c, piece)) {
        const moveIndex = r * 8 + c;
        boardElement.children[moveIndex].classList.add("legal-move");
      }
    }
  }
}


function isLegalMove(sr, sc, dr, dc, piece) {
  const target = board[dr][dc];

  if ((isWhitePiece(piece) && isWhitePiece(target)) ||
      (isBlackPiece(piece) && isBlackPiece(target))) return false;

  const dx = dc - sc;
  const dy = dr - sr;

  switch (piece.toLowerCase()) {
    case "p": {
      const dir = isWhitePiece(piece) ? -1 : 1;
      const startRow = isWhitePiece(piece) ? 6 : 1;

      // Normal move
      if (dx === 0 && !target) {
        if (dr === sr + dir) return true;
        if (sr === startRow && dr === sr + 2 * dir && !board[sr + dir][sc]) return true;
      }

      // Capture
      if (Math.abs(dx) === 1 && dr === sr + dir) {
        if (target) return true;
        if (enPassant && enPassant.row === dr && enPassant.col === dc) return true;
      }

      return false;
    }

    case "r":
      return (sr === dr || sc === dc) && clearPath(sr, sc, dr, dc);

    case "n":
      return (Math.abs(dx) === 1 && Math.abs(dy) === 2) ||
             (Math.abs(dx) === 2 && Math.abs(dy) === 1);

    case "b":
      return Math.abs(dx) === Math.abs(dy) && clearPath(sr, sc, dr, dc);

    case "q":
      return (sr === dr || sc === dc || Math.abs(dx) === Math.abs(dy)) && clearPath(sr, sc, dr, dc);

   case "k": {
  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return true;

  // Castling
  if (sr === dr && Math.abs(dx) === 2) {
    const rookCol = dc > sc ? 7 : 0;
    const rook = board[sr][rookCol];

    // 1. Rook must be correct
    if (!rook || rook.toLowerCase() !== "r") return false;

    // 2. Path must be clear
    if (!clearPath(sr, sc, sr, rookCol)) return false;

    // 3. King or rook must not have moved
    if (turn === "white") {
      if (moved.whiteKing) return false;
      if (dc === 6 && moved.whiteRookRight) return false;
      if (dc === 2 && moved.whiteRookLeft) return false;
    } else {
      if (moved.blackKing) return false;
      if (dc === 6 && moved.blackRookRight) return false;
      if (dc === 2 && moved.blackRookLeft) return false;
    }

    // 4. Cannot castle through or into check
    const kingPath = dx > 0 ? [sc + 1, sc + 2] : [sc - 1, sc - 2];
    for (let col of kingPath) {
      const temp = board[sr][col];
      board[sr][sc] = "";
      board[sr][col] = piece;
      if (isKingInCheck(turn)) {
        board[sr][col] = temp;
        board[sr][sc] = piece;
        return false;
      }
      board[sr][col] = temp;
      board[sr][sc] = piece;
    }

    return true; // ✅ Castling allowed
  }

  return false;
}


    default:
      return false;
  }
}

function clearPath(sr, sc, dr, dc) {
  const stepR = Math.sign(dr - sr);
  const stepC = Math.sign(dc - sc);
  let r = sr + stepR;
  let c = sc + stepC;
  while (r !== dr || c !== dc) {
    if (board[r][c] !== "") return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

function isKingInCheck(color) {
  const king = color === "white" ? "K" : "k";
  let kr, kc;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === king) [kr, kc] = [r, c];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      if ((color === "white" && isBlackPiece(p)) ||
          (color === "black" && isWhitePiece(p))) {
        if (isLegalMove(r, c, kr, kc, p)) return true;
      }
    }
  }

  return false;
}

function isCheckmate(color) {
  for (let sr = 0; sr < 8; sr++) {
    for (let sc = 0; sc < 8; sc++) {
      const piece = board[sr][sc];
      if (!piece) continue;
      if ((color === "white" && !isWhitePiece(piece)) ||
          (color === "black" && !isBlackPiece(piece))) continue;

      for (let dr = 0; dr < 8; dr++) {
        for (let dc = 0; dc < 8; dc++) {
          const target = board[dr][dc];
          if ((sr === dr && sc === dc) || (isWhitePiece(piece) && isWhitePiece(target)) || (isBlackPiece(piece) && isBlackPiece(target))) continue;
          if (isLegalMove(sr, sc, dr, dc, piece)) {
            const backup = JSON.parse(JSON.stringify(board));
            board[dr][dc] = piece;
            board[sr][sc] = "";
            const check = isKingInCheck(color);
            board = backup;
            if (!check) return false;
          }
        }
      }
    }
  }
  return true;
}

function switchTurn() {
  turn = turn === "white" ? "black" : "white";
  if (isKingInCheck(turn)) {
    playSound("check");
    if (isCheckmate(turn)) {
      statusText.textContent = `Checkmate! ${turn === "white" ? "Black" : "White"} wins!`;
      gameOver = true;
    } else {
      statusText.textContent = `${capitalize(turn)} is in check!`;
    }
  } else {
    statusText.textContent = `${capitalize(turn)}'s turn`;
  }
}

function playSound(type) {
  if (type === "move") moveSound.play();
  else if (type === "capture") captureSound.play();
  else if (type === "check") checkSound.play();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function resetGame() {
  board = initialBoard();
  turn = "white";
  selected = null;
  gameOver = false;
  promotionInfo = null;
  enPassant = null;
  moveHistory = [];
  promotionModal.style.display = "none";
  statusText.textContent = "White's turn";
  renderBoard();
  moved = {
  whiteKing: false,
  blackKing: false,
  whiteRookLeft: false,
  whiteRookRight: false,
  blackRookLeft: false,
  blackRookRight: false
};

}

function undoMove() {
  if (moveHistory.length > 0) {
    const last = moveHistory.pop();
    board = last.board;
    turn = last.turn;
    enPassant = last.enPassant;
    gameOver = false;
    promotionInfo = null;
    promotionModal.style.display = "none";
    statusText.textContent = `${capitalize(turn)}'s turn`;
    renderBoard();
  }
}

resetGame();
