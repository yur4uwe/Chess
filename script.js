import ChessClass from './gameLogic/ChessClass.js';
import { Piece } from './gameLogic/piece.js';

const parseId = (id) => {
  // Example parsing logic: split the id by a delimiter (e.g., '-')
  const [col, row] = [(id.charCodeAt(0) - 'a'.charCodeAt(0)), parseInt(id[1]) - 1];
  return { row, col };
};

var selectedPiece = null;
var selectedSquares = new Set();

function* turnGenerator() {
  while (!game.isGameEnd) {
    yield 'white';
    yield 'black';
  }
}

const turnGen = turnGenerator();

const getNextTurn = () => turnGen.next().value;

var currentTurn = 'white';

async function makeMove(move) {
  console.log('Making move:', move);
  const [from, to] = move.split('-');
  const res = await fetch('http://127.0.0.1:3000/move', {
    method: 'POST',
    body: JSON.stringify({ moveTo: to, moveFrom: from, player: currentTurn }),
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
  }
  currentTurn = getNextTurn();
  checkGameState();
}

const renderBoard = (board) => {
  const chessBoard = document.getElementById('chessBoard');
  chessBoard.innerHTML = ''; // Clear the board before rendering
  console.log('Rendering board');
  console.log(board);

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
};

const handleCellClick = (e) => {
  console.log(currentTurn);
  const [ row, col ]  = e.target.id.split(',').map(Number);
  console.log('Clicked cell:', row, col);
  const selectedCell = game.board.get(`${row},${col}`);
  console.log('Selected cell:', selectedCell);
  if(selectedCell && selectedCell !== selectedPiece) {
    selectedSquares.forEach((cell) => cell.style.backgroundColor = 'white');
    selectedSquares.clear();
  }
  if (selectedCell && selectedCell.color === currentTurn) {
    selectedPiece = selectedCell;
    const moves = game.calculateMoves(selectedPiece.row, selectedPiece.col);
    console.log('Moves:', moves);
    for (const move of moves) {
      const cell = document.getElementById(move);
      cell.style.backgroundColor = 'green';
      selectedSquares.add(cell);
    }
  } else if (selectedPiece && selectedSquares.has(e.target)) {
    const move = `${selectedPiece.row},${selectedPiece.col}-${row},${col}`;
    selectedSquares.forEach((cell) => cell.style.backgroundColor = 'white');
    selectedSquares.clear();
    makeMove(move);
  }
  console.log('Selected piece:', selectedPiece);
}

const checkGameState = async () => {
  const res = await fetch('http://127.0.0.1:3000/gameState');
  const { board, isWhiteTurn, isCheck, moveHistory } = await res.json();
  console.log('Game state:', board, isWhiteTurn, isCheck, moveHistory);
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


const game = new ChessClass(await checkGameState());
renderBoard(game.board);
console.log(getNextTurn());