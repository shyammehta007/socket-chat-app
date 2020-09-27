const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/messages");
const { addUser, removeUser, getUser, getUserInRoom } = require("./utils/user");

const app = express();
const server = http.createServer(app); //express does this behind the scene we are only refactoring
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  socket.on("join", (option, callback) => {
    const { error, user } = addUser({ id: socket.id, ...option });
    if (error) {
      return callback(error);
    }
    let room = user.room;
    socket.join(room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast
      .to(room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined ${user.room}`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("profenity is not allowed");
    }
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    socket.broadcast
      .to(user.room)
      .emit("locationMessage", generateLocation(user.username, location));
    callback("location shared");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left ${user.room}`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("listening on PORT " + PORT);
});
