import { 
  abstractBishopMoves, 
  abstractKingMoves, 
  abstractKnightMoves, 
  abstractPawnMoves, 
  abstractQueenMoves, 
  abstractRookMoves, 
  excludeInvalidMoves 
} from './abstractMoves.js';
import { setCoords } from './utils.js';

class Piece {
  /**
   * Creates a piece.
   * @param {string} type - The type of the piece.
   * @param {string} color - The color of the piece.
   * @param {number} row - The row of the piece on the board.
   * @param {number} col - The column of the piece on the board.
   */ 
  constructor(type, color, row, col) {
    this.type = type;
    this.color = color;
    this.row = row;
    this.col = col;
    this.calculatedMoves = new Set();
    this.isProtected = true;
    this.movesWereCalculated = false;
  }
  /**
   * Returns the moves for a piece on the board.
   * @param {Map<string, Piece>} board - The board to calculate moves on.
   * @param {Array} gameMoves - The moves that have been made in the game.
   * @param {string} kingPosition - The position of the king on the board.
   * @param {boolean} isCheck - If there is a check on the board
   * @returns {Set} - A set of moves for the piece.
   */
  getMoves(board, gameMoves, kingPosition, isCheck) {
    if (this.calculatedMoves.size > 0) {
      return this.calculatedMoves;
    }
    let moves = new Set();
    switch (this.type) {
      case 'pawn':
        moves = this.pawnMoves(board, gameMoves, isCheck);
        break;
      case 'knight':
        moves = excludeInvalidMoves(abstractKnightMoves(this.row, this.col), board, this, isCheck);
        break;
      case 'bishop':
        moves = excludeInvalidMoves(abstractBishopMoves(this.row, this.col), board, this, isCheck);
        break;
      case 'rook':
        moves = excludeInvalidMoves(abstractRookMoves(this.row, this.col), board, this, isCheck);
        break;
      case 'queen':
        moves = excludeInvalidMoves(abstractQueenMoves(this.row, this.col), board, this, isCheck);
        break;
      case 'king':
        moves = excludeInvalidMoves(abstractKingMoves(this.row, this.col), board, this, isCheck);
        break;
      default:
        throw new Error('Unknown piece type');
    }
    this.calculatedMoves = moves;
    this.movesWereCalculated = true;
    return moves;
  }
  changePosition(row, col) {
    this.row = row;
    this.col = col;
    this.isProtected = false;
    this.dropCalculatedMoves();
  }
  /**
   * Drops the calculated moves for a piece.
   */
  dropCalculatedMoves() {
    this.calculatedMoves = new Set();
    this.movesWereCalculated = false;
  }
  pawnMoves(board, gameMoves, isCheck) {
    const newPossibleMoves = excludeInvalidMoves(abstractPawnMoves(this.row, this.col, this.color), board, this, isCheck);

    if (gameMoves.length > 0) {
        const lastMove = gameMoves[gameMoves.length - 1];
        const [lastMoveFrom, lastMoveTo, lastMovePiece] = lastMove.split('-');
  
        if (lastMovePiece === 'pawn') {
          const [lastRowFrom, lastColFrom] = lastMoveFrom.split(',').map(Number);
          const [lastRowTo, lastColTo] = lastMoveTo.split(',').map(Number);
          if (Math.abs(lastRowFrom - lastRowTo) === 2 && Math.abs(lastColTo - this.col) === 1 && lastRowTo === this.row) {
            const enPassantRow = this.row + direction;
            const enPassantCol = lastColTo;
            newPossibleMoves.add(setCoords(enPassantRow, enPassantCol));
          }
        }
      }

    return newPossibleMoves;
  }
}

export { Piece };