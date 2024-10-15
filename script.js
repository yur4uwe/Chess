import ChessClass from './gameLogic/ChessClass.js';
import { Piece } from './gameLogic/piece.js';

function dissectMove(move) {
  const [from, to] = move.split('-');
  const [fromRow, fromCol] = from.split(',').map(Number);
  const [toRow, toCol] = to.split(',').map(Number);
  return [ fromRow, fromCol, toRow, toCol ];
}

async function getUserId() {
  console.log('Getting user ID');
  if (!userId) {
    const response = await fetch('http://127.0.0.1:3000/connect');
    const data = await response.json();
    userId = data.userId;
    color = data.color;
    myMove = color === 'white';
    console.log('User ID:', userId);
    console.log('Color:', color);
  }
};

var selectedPieceToMove = null;
var selectedSquares = new Set();
var myMove = false;
var color = null;
var userId = null;
var opponentId = null;
/**
 * @type {ChessClass}
 */
var game = null;

async function makeMove(move) {
  console.log('Making move:', move);
  const [from, to] = move.split('-');
  const res = await fetch(`http://127.0.0.1:3000/move?userId=${userId}`, {
    method: 'POST',
    body: JSON.stringify({ moveTo: to, moveFrom: from, player: color }),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  console.log('Data:', data);
  if (data.message === 'Move accepted') {
    console.log('Move accepted:', data.move);
    game.moveHistory.push(data.move);
    const [from, to] = data.move.toString().split('-')
    const [fromRow, fromCol] = from.split(',').map(Number);
    const [toRow, toCol] = to.split(',').map(Number);
    console.log('Move:', fromRow, fromCol, toRow, toCol);
    game.MovePiece(fromRow, fromCol, toRow, toCol);
    renderBoard(game.board);
    myMove = false;
    console.log(game.moveHistory);
    waitForMove();
  }
  console.log('isCheck:', game.isCheck);
  checkGameState();
}

const renderBoard = (board) => {
  const chessBoard = document.getElementById('chessBoard');
  chessBoard.innerHTML = ''; // Clear the board before rendering
  console.log('Rendering board');

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board.get(`${i},${j}`);
      const squareDiv = document.createElement('div');
      squareDiv.classList.add('square');
      squareDiv.id = `${i},${j}`;
      squareDiv.style.display = 'flex';
      squareDiv.style.alignItems = 'center';
      squareDiv.style.justifyContent = 'center';
      squareDiv.style.border = '1px solid black';
      squareDiv.style.backgroundColor = piece ? 'gray' : 'white';
      squareDiv.onclick = handleCellClick;

      if (piece) {
        squareDiv.style.color = piece.color === 'white' ? 'white' : 'black';
        squareDiv.innerHTML = piece.type;
      }

      chessBoard.appendChild(squareDiv);
    }
  }
  console.log('Board rendered');
  waitForMove();
};

const handleCellClick = (e) => {
  if (!myMove) {
    console.log('Not my move');
    return;
  }
  const [row, col] = e.target.id.split(',').map(Number);
  console.log('Clicked cell:', row, col);
  const selectedCell = game.board.get(`${row},${col}`);
  console.log('Selected cell:', selectedCell);

  // Clear previous selection if a new piece of the same color is selected
  if (selectedCell && selectedPieceToMove
    && selectedCell.color === selectedPieceToMove.color 
    && selectedCell !== selectedPieceToMove) 
  {
    selectedSquares.forEach((cell) => { 
      game.board.has(cell.id) 
      ? cell.style.backgroundColor = 'gray' 
      : cell.style.backgroundColor = 'white';
    });
    selectedSquares.clear();
  }

  // If the selected cell contains a piece of the current turn's color
  if (selectedCell && selectedCell.color === color) {
    selectedPieceToMove = selectedCell;
    const moves = game.calculateMoves(selectedPieceToMove.row, selectedPieceToMove.col);
    console.log('Moves:', moves);

    // Highlight possible moves
    for (const move of moves) {
      const cell = document.getElementById(move);
      cell.style.backgroundColor = 'green';
      selectedSquares.add(cell);
    }
  } 
  // If a move is made to a highlighted cell
  else if (selectedPieceToMove && selectedSquares.has(e.target)) {
    const move = `${selectedPieceToMove.row},${selectedPieceToMove.col}-${row},${col}`;
    selectedSquares.forEach((cell) => cell.style.backgroundColor = 'white');
    selectedSquares.clear();
    makeMove(move);
  }
  console.log('Selected piece:', selectedPieceToMove);
}

const checkGameState = async () => {
  const res = await fetch(`http://127.0.0.1:3000/gameState?userId=${userId}`);
  const { board, isWhiteTurn, isCheck, moveHistory } = await res.json();
  const data = { board: new Map(), isWhiteTurn, isCheck, moveHistory };
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[`${i},${j}`];
      if (piece) {
        data.board.set(`${i},${j}`, new Piece(piece.type, piece.color, i, j));
      }
    }
  }
  return data;
}

async function checkOpponent() {
  const response = await fetch(`http://127.0.0.1:3000/checkOpponent?userId=${userId}`);
  const data = await response.json();
  if (data.opponentId) {
    opponentId = data.opponentId;
    console.log('Opponent found:', opponentId);
    const gameState = await checkGameState();
    game = new ChessClass(gameState);
    console.log('About to render board');
    renderBoard(game.board);
    // Enable move functionality
  } else {
    console.log('Waiting for an opponent...');
    setTimeout(checkOpponent, 5000); // Check again after 5 seconds
  }
}

async function waitForMove() {
  const response = await fetch(`http://127.0.0.1:3000/waiting?userId=${userId}&lastMove=${game.moveHistory[game.moveHistory.length - 1]}`);
  const data = await response.json();
  //console.log('Data:', data);
  if (data.move) {
    console.log('Opponent move:', data.move);
    const move = dissectMove(data.move);
    game.MovePiece(move[0], move[1], move[2], move[3]);
    renderBoard(game.board);
    myMove = true;
  } else {
    setTimeout(waitForMove, 1000); // Check again after 1 second
  }
}

(async () => {
  await getUserId();
  
  if (opponentId) {
    const gameState = await checkGameState();
    game = new ChessClass(gameState);
    console.log('About to render board');
    renderBoard(game.board);
    console.log('Waiting for opponent move...');
  } else {
    console.log('No game state found, checking for opponent...');
    checkOpponent();
  }
})();
