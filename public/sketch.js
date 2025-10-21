const socket = io();
let canvas = null;      
const initMatch = document.querySelector("#initMatch");
const imageCache = {};
const soundCache = {};

let defaultFont = null;

const player = {
    board: [],
    color: null,
    turn: null,
    selectedPiece: null
}
let selectedPiece = null

let onMatch = false;
let loadingMatch = false;

initMatch.addEventListener("click",()=>{
    loadingMatch = true;
    socket.emit("enter-match");
});
socket.on("switch-turn",(data)=>{
    player.turn = data.turn;
    updateTurnSpan();
});
socket.on("entered-match",(data)=>{
    player.color = data.color;
    player.board = data.board;
    player.turn = data.turn;
    onMatch = true;
    loadingMatch = false;

    updateTurnSpan();
});
socket.on("update-board",(data)=>{   
    player.board = data.board
})
socket.on("end-match",(data) =>{
    const matchEndBanner = document.querySelector(".matchEndBanner");
    matchEndBanner.innerHTML = `<div class="description">
      <h1>Cheque Mate!</h1>
      <p>Vencedor: ${data.winner == "white"? "Brancas" : "Pretas"}</p>
      </div>
      <img src="./assets/checkmate.png">
      <button onclick='quitMatch()'>Fechar</button>`;
    matchEndBanner.style.display = "block";
});
socket.on("quit-match",(data)=>{
    quitMatch();
    create_notification(data);
});
const removeNotification = (btn) => {
    btn.parentElement.remove();
}
const quitMatch = () => {
    document.querySelector(".matchEndBanner").style.display = "none";
    player.color = null;
    player.board = [];
    player.turn = null;
    onMatch = false;
    loadingMatch = false;
    updateTurnSpan();
}
const create_notification = (text) => {
    document.querySelector("#notifications-container").innerHTML+=
    `
    <div class="notification">
      <p>- ${text}</p>
      <button onclick="removeNotification(this)">✕</button>
    </div>
    `
}
const updateTurnSpan = () =>{
    const turnSpan = document.querySelector("#turn");
    if(onMatch){
        const turnText = player.turn==player.color?"Seu turno":"Turno do oponente";
        turnSpan.textContent = turnText;
        turnSpan.style.visibility = "visible";
    }else{
        turnSpan.style.visibility = "hidden";
    }
}
const pointSquare = (pointX, pointY, sqrX, sqrY, sqrWid, sqrHei) => {
    return pointX >= sqrX && pointX <= sqrX + sqrWid &&
           pointY >= sqrY && pointY <= sqrY + sqrHei;
}
const getPos = (x, y, color=player.color) =>{ 
    return color == "white" ? y*8+x : 63-(y*8+x);
}
const drawBoard = () => {
    const tileSize = canvas.width/8;
    stroke("#ffffffff")
    strokeWeight(3)
    const darkColor = "#573213";
    const lighterColor = "#fac69b"
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const cellColor = (x + y) % 2 == 0 ? darkColor : lighterColor;
            fill(cellColor);
            rect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
    noStroke();
    textSize(20)
    textAlign(LEFT,BOTTOM)
    const textMargin = 5;
    for(let y = 0; y <= 8; y++){
        const textColor = y % 2 == 0 ? darkColor : lighterColor;
        const textX = textMargin
        const textY = y * tileSize-textMargin;
        const cood = player.color == "white" ? 8-y+1 : y;
        fill(textColor);
        text(cood, textX, textY)
    }
    const letters = ["A","B","C","D","E","F","G","H"];
    textAlign(RIGHT,TOP)
    for(let x = 0; x <= 8; x++){
        const textColor = x % 2 != 0 ? darkColor : lighterColor;
        const textX = x * tileSize - textMargin + tileSize;
        const textY = textMargin;
        const cood = player.color == "white" ? letters[x] : letters[7-x];
        fill(textColor);
        text(cood, textX, textY)
    }
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const pos = getPos(x, y);
            const piece = player.board[pos];

            if(piece){
                const pieceName = `${piece[1]}-${piece[0]}`
                image(imageCache[pieceName],
                        x*tileSize,
                        y*tileSize-(pos===selectedPiece?32:0),
                        tileSize,tileSize);
            }
        }
    }
}
const movePiece = (from, to) =>{
    socket.emit("move-piece",{
        "from": from,
        "to": to
    });
    soundCache["move-sfx"].play()
}
const drawBackground = () => {

    const speed = 2;
    const t = millis()/1000*speed;
    const rows = 8;
    const cols = 8;
    const twid = canvas.width/cols;
    const thei = canvas.height/rows;
    const waveLenght = twid/4;

    stroke("gray")
    for(var x = -1; x < cols+1;x++){
        const offsetY = sin(t+x)*waveLenght
        for(var y = -1; y < rows+1;y++){
            const offsetX = cos(t+y)*waveLenght; 
            const pointX = x*twid+offsetX;
            const pointY = y*thei+offsetY;
            if(x <= cols){
                const nextOffsetX = cos(t+y)*waveLenght; 
                const nextOffsetY = sin(t+x+1)*waveLenght;
                const nextPointX = (x+1)*twid+nextOffsetX;
                const nextPointY = y*thei+nextOffsetY;
                
                line(pointX,pointY,nextPointX,nextPointY)
            }
            if(y <= rows){
                const nextOffsetX = cos(t+y+1)*waveLenght; 
                const nextOffsetY = sin(t+x)*waveLenght;
                const nextPointX = x*twid+nextOffsetX;
                const nextPointY = (y+1)*thei+nextOffsetY;

                line(pointX,pointY,nextPointX,nextPointY)
            }
        }
    }
    stroke("black")
}
function preload(){
    defaultFont = loadFont("assets/Rubintek-DYz13.ttf")
    soundCache["move-sfx"] = loadSound("assets/move.mp3")
    imageCache["black-bishop"] = loadImage("assets/black-bishop.png")
    imageCache["black-king"] = loadImage("assets/black-king.png")
    imageCache["black-knight"] = loadImage("assets/black-knight.png")
    imageCache["black-pawn"] = loadImage("assets/black-pawn.png")
    imageCache["black-queen"] = loadImage("assets/black-queen.png")
    imageCache["black-tower"] = loadImage("assets/black-tower.png")

    imageCache["white-bishop"] = loadImage("assets/white-bishop.png")
    imageCache["white-king"] = loadImage("assets/white-king.png")
    imageCache["white-knight"] = loadImage("assets/white-knight.png")
    imageCache["white-pawn"] = loadImage("assets/white-pawn.png")
    imageCache["white-queen"] = loadImage("assets/white-queen.png")
    imageCache["white-tower"] = loadImage("assets/white-tower.png")
}
function setup(){
    const canvasSize = constrain(windowWidth,0,800)
    canvas = createCanvas(canvasSize,canvasSize);
    canvas.parent("canvas-container");
    textFont(defaultFont);
    smooth();
}
function mouseClicked(){
    const matchEndBanner = document.querySelector(".matchEndBanner");
    const myTurn = player.turn == player.color;

    if(myTurn && matchEndBanner.style.display == "none" && mouseButton == LEFT){
        const tileSize = canvas.width/8;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piecePos = getPos(x, y);
                const piece = player.board[piecePos];
                const hovering = pointSquare(mouseX,mouseY,x*tileSize,y*tileSize,tileSize,tileSize);
                if(hovering){
                    const from = getPos(selectedPiece % 8,Math.floor(selectedPiece / 8),"white");
                    const to = getPos(piecePos % 8,Math.floor(piecePos / 8),"white");
                    if(piece){
                        if(piece[1] == player.color){
                            selectedPiece = piecePos;
                        }else{
                            movePiece(from, to);
                            selectedPiece = null;
                        }
                    }else if(selectedPiece != null){
                        movePiece(from, to);
                        selectedPiece = null;
                    }
                }
            }
        }
    }
}
function draw(){
    background("#2a2a2aff");
    if(!onMatch){
        drawBackground();
    }
    if(loadingMatch){
        fill(255,255,255);
        textAlign(CENTER);
        const loadingSize = constrain(canvas.width/8,0,80)
        textSize(loadingSize);
        const t = new Date().getMilliseconds()/1000;
        let loadingText = "Buscando uma partida..";
        if(cos(t*Math.PI*2) > 0){
            loadingText+="."
        }
        text(loadingText,canvas.width/2,canvas.height/2);
        
    }
    if(onMatch){
        drawBoard();
    }
}
