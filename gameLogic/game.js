import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import ChessClass from './ChessClass.js';


const host = '127.0.0.1'
const port = 3000

/**
 * Map of games being played
 * Key: user ID
 * Value: ChessClass instance
 * there is a duplicate of ChessClass instance for each user
 * @type {Map<string, ChessClass>}
 */
const games = new Map();
/**
 * Map of users and their opponents
 * Key: user ID
 * Value: opponent ID
 * still works old way
 * @type {Map<string, { opponentId: string, lastRequestTime: Date}>}
 */
const sessions = new Map();
/**
 * Adds a session for two users
 * @param {string} userId - The user ID
 * @param {string} opponentId - The opponent ID
 */
function addSession(userId, opponentId) {
  const user1 = sessions.get(userId);
  const user2 = sessions.get(opponentId);

  console.log('addSession UserId:', userId);
  console.log('addSession OpponentId:', opponentId);
  console.log('User1:', user1, 'User2:', user2);

  if (userId && opponentId && !user1 && !user2) {
    for (const [key, value] of sessions) {
      if (value === null && (key === userId || key === opponentId)) {
        sessions.delete(key);
      }
    }
  }

  const now = new Date();
  sessions.set(userId, { opponentId: opponentId, lastRequestTime: now });
  if (opponentId) {
    sessions.set(opponentId, { opponentId: userId, lastRequestTime: now });
  }
  console.log('Sessions:', sessions);
}
/**
 * find an unpaired session
 * @returns {string} The user ID of the unpaired session or null if none
 */
function findUnpairedSession() {
  for (const [key, value] of sessions) {
    if (value.opponentId === null) {
      return key;
    }
  }
  return null;
}

function dissectMove(move) {
  const [from, to] = move.split('-');
  const [fromRow, fromCol] = from.split(',').map(Number);
  const [toRow, toCol] = to.split(',').map(Number);
  return [ fromRow, fromCol, toRow, toCol ];
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(url, `http://${host}:${port}`);
  const userId = parsedUrl.searchParams.get('userId');

  if(method !== 'GET' && parsedUrl.pathname !== '/waiting'){
    console.log(method, url);
  }

  if(method === 'GET' && parsedUrl.pathname === '/'){
    const filePath = './index.html';
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
  else if (method === 'GET' && parsedUrl.pathname === '/connect') {
    console.log('Connecting user');
    const userId = uuidv4();
    console.log('connect User ID:', userId);
    var color;
    const opponentId = findUnpairedSession();
    console.log('connect Opponent ID:', opponentId);
    if(opponentId === null){
      // No unpaired session found
      addSession(userId, null);
      color = 'white';
    }
    else {
      // Found an unpaired session
      addSession(userId, opponentId);
      const newGame = new ChessClass();
      games.set(userId, newGame);
      games.set(opponentId, newGame);
      color = 'black';
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      userId: userId, 
      color: color, 
    }));
  }
  else if (method === 'GET' && parsedUrl.pathname === '/checkOpponent') {
    if (!userId || !sessions.has(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid or missing user ID' }));
      return;
    }
    const session = sessions.get(userId);
    const opponentId = session.opponentId;
    if (opponentId) {
      console.log('Opponent found:', opponentId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ opponentId: opponentId }));
      setInterval(checkTimeout, 10000);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ opponentId: null }));
    }
    const now = new Date();
    sessions.set(userId, { ...session, lastRequestTime: now });
    if (opponentId) {
      sessions.set(opponentId, { ...sessions.get(opponentId), lastRequestTime: now });
    }
  }
  else if (method === 'GET' && parsedUrl.pathname === '/script.js') {
    const filePath = './script.js';
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
  }
  else if (method === 'GET' && parsedUrl.pathname === '/style.css') {
    const filePath = './style.css';
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
  }
  else if (method === 'GET' && parsedUrl.pathname.startsWith('/gameLogic')) {
    const filePath = `.${url}`;
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Internal Server Error');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.css') contentType = 'text/css';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }
  else if (method === 'GET' && parsedUrl.pathname === '/gameState') {
    if (!userId || !games.has(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid or missing user ID' }));
      return;
    }
    const game = games.get(userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      board: game.getBoard(),
      isWhiteTurn: game.isWhiteTurn,
      isCheck: game.isCheck,
      moveHistory: game.moveHistory,
    }));
  }
  else if (method === 'GET' && parsedUrl.pathname === '/waiting') {
    if (!userId || !games.has(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid or missing user ID' }));
      return;
    }
    const lastMove = parsedUrl.searchParams.get('lastMove');
    const session = sessions.get(userId);
    const opponentId = session.opponentId;
    const opponentGame = games.get(opponentId);
    const moveHistory = opponentGame.moveHistory;
    //console.log('User last move:', game.moveHistory[game.moveHistory.length - 1], '\nOpponent last move', moveHistory[moveHistory.length - 1]);
    if (lastMove !== moveHistory[moveHistory.length - 1]) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        move: moveHistory[moveHistory.length - 1],
      }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ move: null }));
    }
  }
  else if (method === 'POST' && parsedUrl.pathname === '/move') {
    if (!userId || !games.has(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid or missing user ID' }));
      return;
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const { moveTo, moveFrom, player } = JSON.parse(body);
      const moveToRow = parseInt(moveTo.split(',')[0]);
      const moveToCol = parseInt(moveTo.split(',')[1]);
      const moveFromRow = parseInt(moveFrom.split(',')[0]);
      const moveFromCol = parseInt(moveFrom.split(',')[1]);
      const game = games.get(userId);
      const result = game.MovePiece(moveFromRow, moveFromCol, moveToRow, moveToCol);
      if (result) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Move accepted',
          move: result ? `${moveFrom}-${moveTo}` : null,
          board: game.getBoard(),
          moveHistory: game.moveHistory,
        }));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid move!' }));
      }
    });
  
    const now = new Date();
    const session = sessions.get(userId);
    const opponentId = session.opponentId;
    sessions.set(userId, { ...session, lastRequestTime: now });
    if (opponentId) {
      sessions.set(opponentId, { ...sessions.get(opponentId), lastRequestTime: now });
    }
  }
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});

async function checkTimeout() {
  if (!sessions.size) {
    return;
  }
  
  console.log('Checking timeout');
  for (const [key, value] of sessions) {
    if (value && value.lastRequestTime && Date.now() - value.lastRequestTime > 30000) {
      console.log('Timeout:', key, value);
      sessions.delete(key);
      sessions.delete(value.opponentId);
      games.delete(key);
      games.delete(value.opponentId);
    }
  }
}