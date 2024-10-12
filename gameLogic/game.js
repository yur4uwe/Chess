import http from 'http';
import url from 'url';
import { promises } from 'fs';
import ChessClass from './ChessClass.js';


const host = '127.0.0.1'
const port = 3000

const game = new ChessClass();

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  console.log(method, url);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  req.on('data', (chunk) => {
    console.log('data:', chunk.toString());
  });

  if (method === 'GET' && url === '/gameState') {
    console.log('Sending game state');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      board: game.getBoard(),
      isWhiteTurn: game.isWhiteTurn,
      isCheck: game.isCheck,
      moveHistory: game.moveHistory,
    }));
  }
  if (method === 'POST' && url === '/move') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString(); // Get the body data (should contain the move)
    });
    
    req.on('end', () => {
      const { moveTo, moveFrom, player } = JSON.parse(body);
      const moveToRow = parseInt(moveTo.split(',')[0]);
      const moveToCol = parseInt(moveTo.split(',')[1]);
      const moveFromRow = parseInt(moveFrom.split(',')[0]);
      const moveFromCol = parseInt(moveFrom.split(',')[1]);
      // Attempt to make the move using chess.js
      const result = game.MovePiece(moveFromRow, moveFromCol, moveToRow, moveToCol);
      if (result) {
        // Move was valid
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Move accepted',
          move: result ? `${moveFrom}-${moveTo}` : null,
          board: game.getBoard(),
          moveHistory: game.moveHistory,
        }));
      } else {
        // Move was invalid
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid move!' }));
      }
    });
  }
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});