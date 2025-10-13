import { Server } from "socket.io";
import { GameManager } from "../server/gameManager.js";

export function initSocket(server) {
  const io = new Server(server, {});
  const gameManager = new GameManager(io);

  io.on("connection", (socket) => {
    console.log(`O jogador ${socket.id} se conectou`);
    gameManager.handleSocket(socket);
  });
}