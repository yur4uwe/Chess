// src/boardSetup.js
import { Piece } from './piece.js';
import { setCoords } from './utils.js';

/**
  * Initializes the board data with the starting pieces.
  * @returns {Map<string, Piece>} - A map of the board data.
  */
const initializeBoardData = () => {
  
  const BoardData = new Map();
  const pieceSetup = [
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
    Array(8).fill('pawn'),
  ];

  // Setup white and black pieces
  pieceSetup.forEach((row, rowIndex) => {
    row.forEach((piece, colIndex) => {
      BoardData.set(setCoords(rowIndex, colIndex), new Piece(piece, 'white', rowIndex, colIndex));
      BoardData.set(setCoords(7 - rowIndex, colIndex), new Piece(piece, 'black', 7 - rowIndex, colIndex));
    });
  });

  return BoardData;
};

export { initializeBoardData };