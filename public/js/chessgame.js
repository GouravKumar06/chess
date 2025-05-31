
// const socket = io();
// const chess = new Chess();

// const boardElement = document.querySelector(".chessboard");

// let draggerPiece = null
// let sourceSquare = null;
// let playerRole = null;

// const renderBoard = () => {
//     const board = chess.board();
//     boardElement.innerHTML = "";
//     board.forEach((row,rowIndex)=>{
//         row.forEach((square,squareIndex)=>{
//             const box = document.createElement("div");
//             box.classList.add("square",(rowIndex+squareIndex)%2===0?"light":"dark");      //adding classes to box element
            
//             box.dataset.row = rowIndex;      
//             box.dataset.col = squareIndex;

//             if(square){
//                 const pieceElement = document.createElement("div");
//                 pieceElement.classList.add("piece",square.color === "w"?"white":"black");
                
//                 pieceElement.innerText = getPieceUnicode(square);
//                 pieceElement.draggable = playerRole === square.color;

//                 pieceElement.addEventListener("dragstart",(e) => {
//                     if(pieceElement.draggable){
//                         draggerPiece = pieceElement;
//                         sourceSquare = {
//                             row: rowIndex,
//                             col: squareIndex
//                         };
//                         e.dataTransfer.setData("text/plain", "")
//                     }
//                 });

//                 pieceElement.addEventListener("dragend",() => {
//                     draggerPiece = null;
//                     sourceSquare = null;
//                 });

//                 box.appendChild(pieceElement);
//             }

//             box.addEventListener("dragover",(e) => {
//                 e.preventDefault();
//             });

//             box.addEventListener("drop",(e) => {
//                 e.preventDefault();
//                 if(draggerPiece){
//                     const targetSquare = {
//                         row: parseInt(box.dataset.row),
//                         col: parseInt(box.dataset.col)
//                     };

//                     handleMove(sourceSquare,targetSquare);
//                 }
//             });
//             boardElement.appendChild(box);
//         })
//     })

//     if(playerRole === "b"){
//         boardElement.classList.add("flipped");
//     }else{
//         boardElement.classList.remove("flipped");
//     }
// }

// const handleMove = (sourceSquare,targetSquare) => {
//     const move = chess.move({
//         from: `${String.fromCharCode(97 + sourceSquare.col)}${8 - sourceSquare.row}`,
//         to: `${String.fromCharCode(97 + targetSquare.col)}${8 - targetSquare.row}`,
//         promotion: "q"
//     });

//     if(move){
//         socket.emit("makeMove",move);
//         renderBoard();
//     }
// }

// const getPieceUnicode = (piece) => {
//   const unicodeMap = {
//     w: {
//       p: "♙",
//       r: "♖",
//       n: "♘",
//       b: "♗",
//       q: "♕",
//       k: "♔",
//     },
//     b: {
//       p: "♙",
//       r: "♜",
//       n: "♞",
//       b: "♝",
//       q: "♛",
//       k: "♚",
//     },
//   };

//   return unicodeMap[piece.color][piece.type] || "";
// };


// socket.on("playerRole",function(role){
//     playerRole = role;
//     renderBoard();
// })

// socket.on("spectatorRole",function(role){
//     playerRole = role;
//     renderBoard();
// })


// socket.on("boardState", function (fen) {
//   chess.load(fen);
//   renderBoard();
// });

// socket.on('move',function(move){
//     chess.move(move);
//     renderBoard();
// })



const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");
let draggerPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const box = document.createElement("div");
      box.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );
      box.dataset.row = rowIndex;
      box.dataset.col = squareIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggerPiece = pieceElement;
            sourceSquare = {
              row: rowIndex,
              col: squareIndex,
            };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggerPiece = null;
          sourceSquare = null;
        });

        box.appendChild(pieceElement);
      }

      box.addEventListener("dragover", (e) => e.preventDefault());

      box.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggerPiece) {
          const targetSquare = {
            row: parseInt(box.dataset.row),
            col: parseInt(box.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(box);
    });
  });

  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }

  // update turn display
  const status = chess.game_over()
    ? "Game Over"
    : `Current Turn: ${chess.turn() === "w" ? "White" : "Black"}`;
  document.getElementById("gameStatus").innerText = status;
};

const handleMove = (sourceSquare, targetSquare) => {
  const move = chess.move({
    from: `${String.fromCharCode(97 + sourceSquare.col)}${
      8 - sourceSquare.row
    }`,
    to: `${String.fromCharCode(97 + targetSquare.col)}${8 - targetSquare.row}`,
    promotion: "q",
  });

  if (move) {
    socket.emit("makeMove", move);
    renderBoard();
  }
};

const getPieceUnicode = (piece) => {
  const unicodeMap = {
    w: { p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔" },
    b: { p: "♙", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" },
  };
  return unicodeMap[piece.color][piece.type] || "";
};

// socket events
socket.on("playerRole", function (role) {
  playerRole = role;
  document.getElementById("playerInfo").innerText =
    role === "w" ? "You are playing as White" : "You are playing as Black";
  renderBoard();
});

socket.on("spectatorRole", function () {
  playerRole = "s";
  document.getElementById("playerInfo").innerText =
    "You are watching as Spectator";
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});

socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});

socket.on("gameOver", function (winner) {
  const resultText = winner === "Draw" ? "It's a draw!" : `${winner} wins!`;
  document.getElementById("gameStatus").innerText = resultText;
});
