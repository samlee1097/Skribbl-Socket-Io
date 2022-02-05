const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

var clients = [];

io.on("connection", (socket) => {
  
  socket.on("join_private_room", (data) => {
    socket.join(data.gameId);
    clients.push({avatar: data.avatar, username: data.username, id: socket.id});
    socket.emit("broadcast", clients);
  });

  socket.on("send_message", (data) => {
    socket.to(data.gameId).emit("receive_message", data);
  });

  socket.on("user_left", (data) => {
    clients.pop();
    socket.to(data.gameId).emit("remove_user", clients);
  })

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});