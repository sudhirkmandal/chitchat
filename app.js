const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(app);

const io = socketIo(server);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const users = {};
const userids = [];
const usernames = [];

io.on("connection", function (socket) {
  socket.on("message", function ({ message, room }) {
    let index = userids.indexOf(socket.id);
    let name = usernames[index];

    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    if (room && roomSize > 0) {
      io.to(room).emit("message", { message, name, id: socket.id });
    } else {
      io.emit("message", { message, name, id: socket.id });
    }
  });

  socket.on("nameset", function (namevalue) {
    users[socket.id] = namevalue;
    userids.push(socket.id);
    usernames.push(namevalue);
    io.emit("numbersofusers", Object.keys(users).length);
    socket.emit("namesetdone");
  });

  socket.on("typing", function (room) {
    let index = userids.indexOf(socket.id);
    let name = usernames[index];
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    if (room && roomSize > 0) {
      socket.to(room).emit("typing", { name });
    } else {
      socket.broadcast.emit("typing", { name });
    }
  });

  socket.on("joinroom", function (room) {
    socket.join(room);
  });

  socket.on("disconnect", function () {
    let index = userids.indexOf(socket.id);
    let name = usernames[index];
    delete users[socket.id];
    userids.splice(index, 1);
    usernames.splice(index, 1);
    io.emit("numbersofusers", Object.keys(users).length);
    socket.broadcast.emit("userleft", name);
    socket.leaveAll();
  });
});

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(3000, function () {
  console.log("Server is running on port 3000");
});
