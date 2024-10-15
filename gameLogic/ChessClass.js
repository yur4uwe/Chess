import { initializeBoardData } from "./boardSetup.js";
import { Piece } from "./piece.js";
import { setCoords, intersection } from "./utils.js";

class ChessClass {
    constructor(options = {}) {
        const {
            board = initializeBoardData(),
            whiteKing = '0,4',
            blackKing = '7,4',
            isWhiteTurn = true,
            isGameEnd = false,
            isCheck = false,
            moveHistory = []
        } = options;

        this.board = board;
        this.whiteKing = whiteKing;
        this.blackKing = blackKing;
        this.pieceAttackingKing = '-1,-1';
        this.isWhiteTurn = isWhiteTurn;
        this.isGameEnd = isGameEnd;
        this.isCheck = isCheck;
        this.moveHistory = moveHistory;
    }
    /**
     * Calculates the moves for a piece on the board.
     * @param {number} row - The row of the piece to calculate moves for.
     * @param {number} col - The column of the piece to calculate moves for.
     * @returns {Set} - A set of moves for the piece.
     */
    calculateMoves(row, col) {
        const piece = this.board.get(`${row},${col}`);
        if (!piece) {
            return new Set();
        }
        if (piece.movesWereCalculated) {
            return piece.calculatedMoves;
        }
        else {return piece.calculatedMoves = this.saveKingFromCheck(piece);}
    }
    /**
     * Finds the moves that save the king from check.
     * If the king is not in check, it checks.
     * @param {Piece} piece 
     * @returns 
     */
    saveKingFromCheck(piece) {
        const moveSet = piece.getMoves(
            this.board, [], 
            piece.color ? this.whiteKing : this.blackKing, 
            this.isCheck
        );

        const originalPiecePosition = setCoords(piece.row, piece.col);

        if (!this.isCheck) {
            this.board.delete(originalPiecePosition);
        }
        if (!this.findCheck()) {
            this.board.set(originalPiecePosition, piece);
            return moveSet;
        }
        

        function findRookSavingMoves(i, j) {
            const moves = new Set();
            if (i === kingRow) {
                // Same row, iterate over columns
                for (let k = Math.min(kingCol, j) + 1; k < Math.max(kingCol, j); k++) {
                    moves.add(`${i},${k}`);
                }
              } else if (j === kingCol) {
                // Same column, iterate over rows
                for (let k = Math.min(kingRow, i) + 1; k < Math.max(kingRow, i); k++) {
                    moves.add(`${k},${j}`);
                }
              }
            return moves;
        }

        function findBishopSavingMoves(i, j) {
            const moves = new Set();
            let currRow = kingRow + rowDirection;
            let currCol = kingCol + colDirection;
            while(currRow !== i && currCol !== j) {
                moves.add(setCoords(currRow, currCol));
                currRow += rowDirection;
                currCol += colDirection;
            }
        }

        function findQueenSavingMoves(i, j) {
            const moves = new Set();
            if (i === kingRow || j === kingCol) {
                moves = findRookSavingMoves(i, j, kingRow, kingCol);
            }
            else {
                moves = findBishopSavingMoves(i, j, kingRow, kingCol, rowDirection, colDirection);
            }
            return moves;
        }

        const [kingRow, kingCol] = this.isWhiteTurn ? this.whiteKing.split(',').map(Number) : this.blackKing.split(',').map(Number);
        const attackingPiece = this.board.get(this.pieceAttackingKing);  

        const rowDirection = attackingPiece.row > kingRow ? 1 : -1;
        const colDirection = attackingPiece.col > kingCol ? 1 : -1;

        switch (attackingPiece.type) {
            case 'rook':
                return intersection(moveSet,
                    findRookSavingMoves(
                        attackingPiece.row, attackingPiece.col
                    )).delete(originalPiecePosition);
            case 'bishop':
                return intersection(moveSet,
                    findBishopSavingMoves(
                        attackingPiece.row, attackingPiece.col
                    )).delete(originalPiecePosition);
            case 'queen':
                return intersection(moveSet,
                    findQueenSavingMoves(
                        attackingPiece.row, attackingPiece.col
                    )).delete(originalPiecePosition);
            default:
                return intersection(moveSet, 
                        new Set([this.pieceAttackingKing])
                    ).delete(originalPiecePosition);
        }
    }
    /**
     * Moves a piece from one position to another on the board.
     * @param {number} row - The row of the piece to move.
     * @param {number} col - The column of the piece to move.
     * @param {number} newRow - The row to move the piece to.
     * @param {number} newCol - The column to move the piece to.
     */
    MovePiece(row, col, newRow, newCol) {
        console.log(`${row},${col}`);
        console.log(`${newRow},${newCol}`);
        const piece = this.board.get(`${row},${col}`);
        if (piece === null) {
            return false;
        }
        const moves = piece.getMoves(this.board, [], this.isWhiteTurn ? this.whiteKing : this.blackKing, this.isCheck);
        if (moves.has(`${newRow},${newCol}`)) {
            this.board.set(setCoords(newRow, newCol), piece);
            piece.changePosition(newRow, newCol);
            this.board.delete(setCoords(row, col));
            this.isWhiteTurn = !this.isWhiteTurn;
            this.moveHistory.push(`${row},${col}-${newRow},${newCol}`);
        }
        
        this.dropAllCalculatedMoves();

        this.isCheck = this.findCheck();
        return moves.has(`${newRow},${newCol}`) ? true : false;
    }   
    /**
     * Checks if a player is in check.
     * @returns {boolean} - True if the player is in check, false otherwise.
     */
    findCheck() {
        const [row, col] = this.isWhiteTurn ? this.whiteKing.split(',').map(Number) : this.blackKing.split(',').map(Number);
        for (let [key, value] of this.board) {
            if (value !== null && value.color !== this.isWhiteTurn) {
                const moves = value.getMoves(this.board, [], setCoords(row, col), false);
                if (moves.has(setCoords(row, col))) {
                    this.pieceAttackingKing = key;
                    return true;
                }
            }
        }
        this.pieceAttackingKing = '-1,-1';
        return false;
    }
    dropAllCalculatedMoves() {
        this.board.forEach((piece) => {
            if (piece) {
                piece.dropCalculatedMoves();
            }
        });
    }
    /**
     * Returns board as JSON object.
     * @returns {Object} The board as a JSON object.
     */
    getBoard() {
        const board = {};
        this.board.forEach((value, key) => {
            board[key] = value;
        });
        return board;
    }
}

export default ChessClass;