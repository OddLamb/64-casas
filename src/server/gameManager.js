import { createBoard, checkMoveCorrect, moveBoardPiece, onCheckMate} from "../chess/board.js";
import { v4 } from "uuid";

export class GameManager{
    constructor(io){
        this.io = io;
        this.rooms = {};
        this.players = {};
        this.pendingPlayer = null;
    }
    send(event,data,playerID){
        this.io.to(this.players[playerID].socketID).emit(event,data);
    }
    broadcast(event,data,playersIDs){
        for(var i = 0;i < playersIDs.length;i++){
            const playerID = playersIDs[i];
            this.send(event,data,playerID);
        }
    }
    movePiece(fromPos,toPos,roomID){
        const match = this.rooms[roomID];
        const board = match.board;
        const players = match.players;
        
        moveBoardPiece(fromPos,toPos,board);
        this.broadcast("update-board",{
            board: board
        },players);
    }
    switchTurns(roomID){
        const match = this.rooms[roomID];
        const turn = match.turn;

        const players = match.players;
        const newTurn = turn == "white" ? "black" : "white";
        
        match.turn = newTurn;
        this.broadcast("switch-turn",{
            turn: newTurn
        },players);
    }
    handleSocket(socket){
        const playerID = v4();
        this.players[playerID] = {
            socketID: socket.id,
            roomID: null,
        }; 
        const player = this.players[playerID];
        socket.on("enter-match",(data) => {
            if(player.roomID == null){
                if(this.pendingPlayer){
                    if(this.pendingPlayer != playerID){
                        player.roomID = this.players[this.pendingPlayer].roomID;
                        const board = createBoard();

                        this.rooms[player.roomID] = {
                            players: [this.pendingPlayer, playerID],
                            turn: "white",
                            board: board
                        };

                        const pendingColor = Math.random() > .5 ? "white" : "black";
                        const playerColor = pendingColor == "white" ? "black" : "white";
                        const enteredMatchData = {turn: "white", board: board}

                        this.send("entered-match",{color: playerColor,...enteredMatchData},playerID);
                        this.send("entered-match",{color: pendingColor,...enteredMatchData},this.pendingPlayer);

                        console.log(`Partida iniciada com o jogador ${playerID} e ${this.pendingPlayer}`);
                        
                        this.pendingPlayer = null;
                    }else{
                        console.log(`O jogador ${socket.id} já está esperando por uma partida`)
                    }
                }else{
                    this.pendingPlayer = playerID,
                    player.roomID = v4();
                    console.log(`O jogador ${socket.id} está esperando por uma partida`)
                }
            }else{
                console.log(`O jogador ${socket.id} já está em uma partida`)
            }
        });
        
        socket.on("move-piece",(data)=>{
            const fromPos = data.from;
            const toPos = data.to;

            const match = this.rooms[player.roomID];
            const board = match.board;
            const piece = board[fromPos];

            if(piece != null){ 
                if(checkMoveCorrect(fromPos,toPos,board)){
                    this.movePiece(fromPos,toPos,player.roomID);
                    this.switchTurns(player.roomID);
                    console.log(`O jogador ${socket.id} moveu a peça em ${data.from} para ${data.to}`);

                    const opponentColor = piece[1] == "white" ? "black" : "white";
                    if(onCheckMate(opponentColor,board)){
                        const players = match.players;
                        this.broadcast("end-match",{"winner": piece[1]},players);
                        this.clearMatch(player.roomID);
                    }
                }else{
                    console.log(`O jogador ${socket.id} tentou mover uma peça para uma posição inadequada`)
                }

            }else{
                console.log(`O jogador ${socket.id} tentou mover uma peça que não existe`)
            }
        }); 
        socket.on("disconnect", (reason) => {
            if(this.pendingPlayer && this.pendingPlayer == socket.id){
                this.pendingPlayer = null;
            }else{
                if(player.roomID != null){   
                    const match = this.rooms[player.roomID];
                    const players = match.players;
                    
                    this.broadcast("quit-match","O oponente saiu da partida inesperadamente",players.filter((player) => player != playerID));
                    this.clearMatch(player.roomID);
                }
            }
            delete this.players[playerID];
            console.log(`O jogador ${socket.id} se desconectou: ${reason}`);
        });
    }
    clearMatch(roomID){
        const room = this.rooms[roomID];
        const players = room.players;
        for(var i = 0;i<players.length;i++){
            const playerID = players[i];
            this.players[playerID].roomID = null;
        }
        delete this.rooms[roomID];
        console.log(`Partida de número ${roomID} foi encerrada`)
    }
}