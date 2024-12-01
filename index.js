import express from 'express'; // npm install express@4
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io'; // npm install socket.io

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

/*
io.on('connection', (socket) => {
  console.log('a user connected');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
});
*/

let userCount = 0;

io.on('connection', (socket) => {
  userCount++;
  io.emit('update users', userCount);

  console.log('A user connected');

  socket.on('user connected', (username) => {
    console.log(`${username} joined the chat`);
    socket.username = username; // Guardar el nombre en el socket
  });

  socket.on('chat message', ({ username, message }) => {
    io.emit('chat message', { username, message });
  });

  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing');
  });

  socket.on('disconnect', () => {
    userCount--;
    io.emit('update users', userCount);
    console.log(`${socket.username || 'A user'} disconnected`);
  });
});


server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
