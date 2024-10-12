import { setCoords } from './utils.js';
import Piece from './piece.js';
import ChessClass from './ChessClass.js';

// Helper function to compare sets
const setsAreEqual = (setA, setB) => {
  if (setA.size !== setB.size) return false;
  for (let item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};

// Test Rook Moves
const testRookMoves = () => {
  console.log('Testing Rook Moves');

  const game = new ChessClass(new Map());
  const rook = new Piece('rook', 'white', 3, 3);
  game.board.set(setCoords(3, 3), rook);

  // No obstacles
  let validMoves = game.calculateMoves(3, 3);
  let expectedMoves = new Set([
    '4,3', '5,3', '6,3', '7,3', '2,3', '1,3', '0,3',
    '3,4', '3,5', '3,6', '3,7', '3,2', '3,1', '3,0'
  ]);
  console.log('Correct moves without obstacles:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Blocked by friendly pieces
  game.board.set(setCoords(5, 3), new Piece('pawn', 'white', 5, 3));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,3', '2,3', '1,3', '0,3',
    '3,4', '3,5', '3,6', '3,7', '3,2', '3,1', '3,0'
  ]);
  console.log('Correct moves when blocked by friendly piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Capturing opponent pieces
  game.board.set(setCoords(5, 3), new Piece('pawn', 'black', 5, 3));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,3', '5,3', '2,3', '1,3', '0,3',
    '3,4', '3,5', '3,6', '3,7', '3,2', '3,1', '3,0'
  ]);
  console.log('Correct moves when capturing opponent piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();
};

// Test Pawn Moves
const testPawnMoves = () => {
  console.log('Testing Pawn Moves');

  const game = new ChessClass(new Map());
  const pawn = new Piece('pawn', 'white', 1, 3);
  game.board.set(setCoords(1, 3), pawn);

  // No obstacles
  let validMoves = game.calculateMoves(1, 3);
  let expectedMoves = new Set(['2,3', '3,3']);
  console.log('Correct moves without obstacles:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Blocked by friendly pieces
  game.board.set(setCoords(2, 3), new Piece('pawn', 'white', 2, 3));
  validMoves = game.calculateMoves(1, 3);
  expectedMoves = new Set([]);
  console.log('Correct moves when blocked by friendly piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Capturing opponent pieces
  game.board.set(setCoords(2, 4), new Piece('pawn', 'black', 2, 4));
  validMoves = game.calculateMoves(1, 3);
  expectedMoves = new Set(['2,4']);
  console.log('Correct moves when capturing opponent piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();
};

// Test Queen Moves
const testQueenMoves = () => {
  console.log('Testing Queen Moves');

  const game = new ChessClass(new Map());
  const queen = new Piece('queen', 'white', 3, 3);
  game.board.set(setCoords(3, 3), queen);

  // No obstacles
  let validMoves = game.calculateMoves(3, 3);
  let expectedMoves = new Set([
    '4,3', '5,3', '6,3', '7,3', '2,3', '1,3', '0,3',
    '3,4', '3,5', '3,6', '3,7', '3,2', '3,1', '3,0',
    '4,4', '5,5', '6,6', '7,7', '2,2', '1,1', '0,0',
    '4,2', '5,1', '6,0', '2,4', '1,5', '0,6'
  ]);
  console.log('Correct moves without obstacles:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Blocked by friendly pieces
  game.board.set(setCoords(5, 5), new Piece('pawn', 'white', 5, 5));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,3', '5,3', '6,3', '7,3', '2,3', '1,3', '0,3',
    '3,4', '3,5', '3,6', '3,7', '3,2', '3,1', '3,0',
    '4,4', '2,2', '1,1', '0,0',
    '4,2', '5,1', '6,0', '2,4', '1,5', '0,6'
  ]);
  console.log('Correct moves when blocked by friendly piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Capturing opponent pieces
  game.board.set(setCoords(5, 5), new Piece('pawn', 'black', 5, 5));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,3', '5,3', '6,3', '7,3', '2,3', '1,3', '0,3',
    '3,4', '3,5', '3,6', '3,7', '3,2', '3,1', '3,0',
    '4,4', '5,5', '2,2', '1,1', '0,0',
    '4,2', '5,1', '6,0', '2,4', '1,5', '0,6'
  ]);
  console.log('Correct moves when capturing opponent piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();
};

// Test King Moves
const testKingMoves = () => {
  console.log('Testing King Moves');

  const game = new ChessClass(new Map(), '3,3');
  const king = new Piece('king', 'white', 3, 3);
  game.board.set(setCoords(3, 3), king);

  // No obstacles
  let validMoves = game.calculateMoves(3, 3);
  let expectedMoves = new Set([
    '4,3', '4,4', '3,4', '2,4', '2,3', '2,2', '3,2', '4,2'
  ]);
  console.log('Correct moves without obstacles:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Blocked by friendly pieces
  game.board.set(setCoords(4, 3), new Piece('pawn', 'white', 4, 3));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,4', '3,4', '2,4', '2,3', '2,2', '3,2', '4,2'
  ]);
  console.log('Correct moves when blocked by friendly piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Capturing opponent pieces
  game.board.set(setCoords(4, 3), new Piece('pawn', 'black', 4, 3));
  game.board.get(setCoords(4, 3)).isProtected = false;
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,3', '4,4', '3,4', '2,4', '2,3', '2,2', '3,2', '4,2'
  ]);
  console.log('Correct moves when capturing opponent piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // King can only take a piece
  game.board.set(setCoords(7, 2), new Piece('rook', 'black', 7, 2));
  game.board.set(setCoords(4, 3), new Piece('pawn', 'black', 4, 3));
  game.board.get(setCoords(4, 3)).isProtected = false;
  game.board.set(setCoords(7, 4), new Piece('rook', 'black', 7, 4));
  game.board.set(setCoords(2, 1), new Piece('rook', 'black', 2, 1));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set(['4,3']);
  console.log('Correct moves when only viable move is to take a piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // King can't take a piece protected by another piece
  game.board.set(setCoords(4, 3), new Piece('pawn', 'black', 4, 3));
  game.board.set(setCoords(5, 3), new Piece('rook', 'black', 5, 3));
  game.board.delete(setCoords(7, 2));
  game.board.delete(setCoords(7, 4));
  game.board.delete(setCoords(2, 1));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,4', '3,4', '2,4', '2,3', '2,2', '3,2', '4,2'
  ]);
  console.log('Correct moves when taking a piece protected by another piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Other pieces can't move to protect the king
  game.board.set(setCoords(4, 3), new Piece('rook', 'white', 4, 3));
  validMoves = game.calculateMoves(4, 3);
  expectedMoves = new Set(['5,3']);
  console.log('Correct moves when other pieces can\'t move to protect the king:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();
};

// Test Knight Moves
const testKnightMoves = () => {
  console.log('Testing Knight Moves');

  const game = new ChessClass(new Map());
  const knight = new Piece('knight', 'white', 3, 3);
  game.board.set(setCoords(3, 3), knight);

  // No obstacles
  let validMoves = game.calculateMoves(3, 3);
  let expectedMoves = new Set([
    '5,4', '5,2', '4,5', '4,1', '1,4', '1,2', '2,5', '2,1'
  ]);
  console.log('Correct moves without obstacles:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Blocked by friendly pieces
  game.board.set(setCoords(5, 4), new Piece('pawn', 'white', 5, 4));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '5,2', '4,5', '4,1', '1,4', '1,2', '2,5', '2,1'
  ]);
  console.log('Correct moves when blocked by friendly piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Capturing opponent pieces
  game.board.set(setCoords(5, 4), new Piece('pawn', 'black', 5, 4));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '5,4', '5,2', '4,5', '4,1', '1,4', '1,2', '2,5', '2,1'
  ]);
  console.log('Correct moves when capturing opponent piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();
};

// Test Bishop Moves
const testBishopMoves = () => {
  console.log('Testing Bishop Moves');

  const game = new ChessClass(new Map());
  const bishop = new Piece('bishop', 'white', 3, 3);
  game.board.set(setCoords(3, 3), bishop);
  game.dropAllCalculatedMoves();

  // No obstacles
  let validMoves = game.calculateMoves(3, 3);
  let expectedMoves = new Set([
    '4,4', '5,5', '6,6', '7,7', '2,2', '1,1', '0,0',
    '4,2', '5,1', '6,0', '2,4', '1,5', '0,6'
  ]);
  console.log('Correct moves without obstacles:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Blocked by friendly pieces
  game.board.set(setCoords(5, 5), new Piece('pawn', 'white', 5, 5));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,4', '2,2', '1,1', '0,0',
    '4,2', '5,1', '6,0', '2,4', '1,5', '0,6'
  ]);
  console.log('Correct moves when blocked by friendly piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();

  // Capturing opponent pieces
  game.board.set(setCoords(5, 5), new Piece('pawn', 'black', 5, 5));
  validMoves = game.calculateMoves(3, 3);
  expectedMoves = new Set([
    '4,4', '5,5', '2,2', '1,1', '0,0',
    '4,2', '5,1', '6,0', '2,4', '1,5', '0,6'
  ]);
  console.log('Correct moves when capturing opponent piece:', setsAreEqual(validMoves, expectedMoves));
  game.dropAllCalculatedMoves();
};

// Run tests

const parseId = (id) => {
  // Example parsing logic: split the id by a delimiter (e.g., '-')
  const [col, row] = [(id.charCodeAt(0) - 'a'.charCodeAt(0)), parseInt(id[1]) - 1];
  return { row, col };
};

console.log('id:', parseId('a1'));
console.log('id:', parseId('h8'));

testRookMoves();
console.log('+---------------------------------+');
testPawnMoves();
console.log('+---------------------------------+');
testQueenMoves();
console.log('+---------------------------------+');
testKingMoves();
console.log('+---------------------------------+');
testKnightMoves();
console.log('+---------------------------------+');
testBishopMoves();

