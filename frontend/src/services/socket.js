// socket.js
import { io } from 'socket.io-client'

let socket = null;

export function connectSocket(apiBaseUrl) {
  if (!socket) {
    socket = io(apiBaseUrl, { autoConnect: false });
  }
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}