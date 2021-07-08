//create server object
const http = require('http');
 const app = require('./app');
const port = process.env.PORT || 3000;
//create the server
const server = http.createServer(app);
const WebSockets = require('./socketConnection');

const socketio = require("socket.io")

// (server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//       // allowedHeaders: ["my-custom-header"],
//       credentials: true,
//       transports: ['websocket', 'polling'],
//     },
//     allowEIO3: true
//   });

global.io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      // allowedHeaders: ["my-custom-header"],
      credentials: true,
      transports: ['websocket', 'polling'],
    },
    allowEIO3: true
  });
global.io.on('connection', WebSockets.connection)

server.listen(port);



