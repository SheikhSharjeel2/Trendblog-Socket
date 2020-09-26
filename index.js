const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { constants } = require("./constants");
const bodyParser = require("body-parser");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(bodyParser.json());

const port = process.env.PORT || 3004;

const { JOIN, LEAVE, MESSAGE, SENDDATA, UPDATE, DUMMY } = constants;

app.get("/logs", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

// app.post("/sendData", (req, res) => {
//   try {
//     const ticketId = req.body.ticketId;
//     console.log("Client Ticket: ", ticketId);
//     if (ticketId) {
//       io.in(ticketId).emit(SENDDATA, "please refresh data");
//       res.send(
//         `request received, update submitted with ticket id: ${ticketId}`
//       );
//     } else {
//       res.status(400);
//     }
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

io.on("connection", function(socket) {
  console.log("new socket connection");

  socket.on(JOIN, ({ username }, callback) => {
    console.log(`User entered the room with user name: ${username}`);
    try {
      socket.join(username);
      io.to(username).emit(MESSAGE, "You just subscribed to the chat room!");
      callback();
    } catch (error) {
      return callback(error);
    }
  });

  socket.on(UPDATE, ({sendername, username }, callback) => {
    console.log(`User with user name: ${username} ready to receive update`);
    try {
      io.in(username).emit(SENDDATA, sendername);
      //io.in(DUMMY).emit(SENDDATA, sendername);
      callback();
    } catch (error) {
      console.log(error);
      return callback(error);
    }
  });

  socket.on(LEAVE, ({ username }, callback) => {
    console.log(`User ready to leave ${username}`);
    try {
      socket.leave(username);
      callback();
    } catch (error) {
      console.log(error);
      return callback(error);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
