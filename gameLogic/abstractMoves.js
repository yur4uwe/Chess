import { setCoords, intersection } from './utils.js';

/**
 * Calculates moves for a pawn piece.
 * @param {number} row - The row of the pawn.
 * @param {number} col - The column of the pawn.
 * @param {string} color - The color of the pawn.
 * @returns {Set} - A set of unobstructed moves for the pawn excluding en passant.
 */
const abstractPawnMoves = (row, col, color) => {
  const abstractMoves = new Set();
  const direction = color === 'white' ? 1 : -1;
  const startingRow = color === 'white' ? 1 : 6;

  // Single step forward
  if (row + direction >= 0 && row + direction < 8) {
    abstractMoves.add(setCoords(row + direction, col));
  }

  // Double step forward from starting position
  if (row === startingRow && row + 2 * direction >= 0 && row + 2 * direction < 8) {
    abstractMoves.add(setCoords(row + 2 * direction, col));
  }

  // Capturing moves
  if (col - 1 >= 0) {
    abstractMoves.add(setCoords(row + direction, col - 1));
  }
  if (col + 1 < 8) {
    abstractMoves.add(setCoords(row + direction, col + 1));
  }

  return abstractMoves;
};    
  
/**
   * Calculates moves for a knight piece.
   * @param {number} row - The row of the knight.
   * @param {number} col - The column of the knight.
   * @returns {Set} - A set of moves for the knight.
   */
const abstractKnightMoves = (row, col) => {
  const abstractMoves = new Set();
  const knightMoves = [
    [row + 2, col + 1], [row + 2, col - 1], [row - 2, col + 1], [row - 2, col - 1],
    [row + 1, col + 2], [row + 1, col - 2], [row - 1, col + 2], [row - 1, col - 2]
  ];

  knightMoves.forEach(([i, j]) => {
    if (i >= 0 && i < 8 && j >= 0 && j < 8) {
      abstractMoves.add(setCoords(i, j));
    }
  });

  return abstractMoves;
};

/**
 * Calculates moves for a bishop piece.
 * @param {number} row - The row of the bishop.
 * @param {number} col - The column of the bishop.
 * @returns {Set} - A set of moves for the bishop.
 */
const abstractBishopMoves = (row, col) => {
  const abstractMoves = new Set();
  for (let i = 1; row + i < 8 && col + i < 8; i++) {
    abstractMoves.add(setCoords(row + i, col + i));
  }
  for (let i = 1; row + i < 8 && col - i >= 0; i++) {
    abstractMoves.add(setCoords(row + i, col - i));
  }
  for (let i = 1; row - i >= 0 && col + i < 8; i++) {
    abstractMoves.add(setCoords(row - i, col + i));
  }
  for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
    abstractMoves.add(setCoords(row - i, col - i));
  }
  return abstractMoves;
};

/**
 * Calculates moves for a rook piece.
 * @param {number} row - The row of the rook.
 * @param {number} col - The column of the rook.
 * @returns {Set} - A set of moves for the rook.
 */
const abstractRookMoves = (row, col) => {
  const abstractMoves = new Set();
  for (let i = row + 1; i < 8; i++) {
    abstractMoves.add(setCoords(i, col));
  }
  for (let i = row - 1; i >= 0; i--) {
    abstractMoves.add(setCoords(i, col));
  }
  for (let i = col + 1; i < 8; i++) {
    abstractMoves.add(setCoords(row, i));
  }
  for (let i = col - 1; i >= 0; i--) {
    abstractMoves.add(setCoords(row, i));
  }
  return abstractMoves;
};

/**
 * Calculates moves for a queen piece.
 * @param {number} row - The row of the queen.
 * @param {number} col - The column of the queen.
 * @returns {Set} - A set of moves for the queen.
 */
const abstractQueenMoves = (row, col) => {
  return new Set([...abstractRookMoves(row, col), ...abstractBishopMoves(row, col)]);
};

/**
 * Calculates moves for a king piece.
 * @param {number} row - The row of the king.
 * @param {number} col - The column of the king.
 * @returns {Set} - A set of moves for the king.
 */
const abstractKingMoves = (row, col) => {
  const abstractMoves = new Set();
  const kingMoves = [
    [row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1],
    [row + 1, col + 1], [row - 1, col - 1], [row + 1, col - 1], [row - 1, col + 1]
  ];

  kingMoves.forEach(([i, j]) => {
    if (i >= 0 && i < 8 && j >= 0 && j < 8) {
      abstractMoves.add(setCoords(i, j));
    }
  });

  return abstractMoves;
};

/**
 * Excludes invalid moves for pieces that can be blocked by obstacles.
 * @param {Set<string>} abstractMoves - The set of abstract moves.
 * @param {Map<string, Piece>} board - The current state of the board.
 * @param {Piece} piece - The piece to calculate valid moves for.
 * @param {boolean} isCheck - if there is a check on the board.
 * @returns {Set<string>} - A set of valid moves for the piece.
 */
const excludeInvalidMoves = (abstractMoves, board, piece, isCheck) => {
  const color = piece.color;
  let validMoves = new Set();

  const directions = {
    rook: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
    queen: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
  };

  const isBlockedByObstacle = piece.type !== 'knight' && piece.type !== 'king' && piece.type !== 'pawn';

  const pieceType = piece.type;
  const pieceDirections = directions[pieceType] || [];

  //exclude special moves for pawns
  if (pieceType === 'pawn') {
    const direction = color === 'white' ? 1 : -1;
    const startRow = color === 'white' ? 1 : 6;
      
    for (let move of abstractMoves) {
      const [row, col] = move.split(',').map(Number);
      
      // Diagonal capture
      if (piece.col !== col) {
          if (board.has(move) && board.get(move).color !== color) {
            if(board.get(move).color !== color)
              validMoves.add(move);
            else
              board.get(move).isProtected = true;
          }
      } 
      // Single step forward
      else if (piece.row + direction === row) {
        if (!board.has(move)) {
          validMoves.add(move);
        }
      }
      // Double step forward from starting position
      else if (piece.row === startRow && piece.row + 2 * direction === row) {
          const intermediateMove = setCoords(piece.row + direction, col);
          if (!board.has(move) && !board.has(intermediateMove)) {
              validMoves.add(move);
          }
      }
    }
    return validMoves;   
  } // exclude attacked squares for king
  else if(pieceType === 'king') {

    board.forEach((value, key) => {
      if (value.color === color) {
        abstractMoves.delete(key);
        board.get(key).isProtected = true;
      }
      else if (value.color !== color) {
        const enemyMoves = value.type !== 'king' 
          ? value.getMoves(board, [], isCheck)
          : abstractKingMoves(value.row, value.col);
        abstractMoves = intersection(abstractMoves, enemyMoves, true);
      }
    });

    validMoves = abstractMoves;

    abstractMoves.forEach(move => {
      if (board.has(move) && board.get(move).color !== color && board.get(move).isProtected) {    
          validMoves.delete(move);
      }
    });

    return validMoves;
  } // exclude moves that are blocked by obstacles(for knight)
  else if(pieceDirections.length === 0) {
    for (let move of abstractMoves) {
      if(!board.has(move) || board.get(move).color !== color){
        validMoves.add(move);
      } else board.get(move).isProtected = true;
    }
    return validMoves;
  }

  //exclude moves that are blocked by obstacles
  pieceDirections.forEach(([dRow, dCol]) => {
    let row = piece.row;
    let col = piece.col;

    while (true) {
      row += dRow;
      col += dCol;

      if (row < 0 || row >= 8 || col < 0 || col >= 8) break;

      const move = setCoords(row, col);
      const boardPiece = board.get(move);

      if (!boardPiece) {
        validMoves.add(move);
      } else {
        if (boardPiece.color !== color) {
          validMoves.add(move);
        } else {
          boardPiece.isProtected = true;
        }
        if (isBlockedByObstacle) {
          break;
        }
      }
    }
  });

  return validMoves;
};

export { 
  abstractPawnMoves, 
  abstractKnightMoves, 
  abstractBishopMoves, 
  abstractRookMoves, 
  abstractQueenMoves, 
  abstractKingMoves, 
  excludeInvalidMoves 
};