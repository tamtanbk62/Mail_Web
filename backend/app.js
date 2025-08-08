const express = require('express');
const app = express();
const http = require('http');
const socketio = require('socket.io');
const mailRoute = require('./routers/mailRoute');
const userRoute = require('./routers/userRoute');
const { startMailWatcher } = require('./utils/mailWatcher');

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*'
  }
});

app.use(express.json());

const cors = require('cors')
app.use(cors())

app.use('/', mailRoute)
app.use('/user', userRoute);

io.on('connection', (socket) => {
  console.log('Client connected via socket');

  socket.on('start-watch', ({ email, password }) => {
    startMailWatcher(email, password, io);
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});