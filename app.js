const express = require("express");
const socketServer = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketServer(server);

const chess = new Chess();
let players = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", function (socket) {
  console.log("User connected:", socket.id);

  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
    console.log("White player joined");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
    console.log("Black player joined");
  } else {
    socket.emit("spectatorRole", "s");
    console.log("Spectator joined");
  }

  // Send current board state to new user
  socket.emit("boardState", chess.fen());

  socket.on("makeMove", function (move) {
    try {
      if (chess.turn() === "w" && socket.id !== players.white) return;
      if (chess.turn() === "b" && socket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        io.emit("move", move);
        io.emit("boardState", chess.fen());

        if (chess.game_over()) {
          let winner = "Draw";
          if (chess.in_checkmate()) {
            winner = chess.turn() === "w" ? "Black" : "White";
          }
          io.emit("gameOver", winner);
        }
      } else {
        socket.emit("invalidMove", move);
      }
    } catch (error) {
      console.error("Invalid move:", error);
      socket.emit("invalidMove", move);
    }
  });

  socket.on("disconnect", function () {
    if (socket.id === players.white) delete players.white;
    if (socket.id === players.black) delete players.black;
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
