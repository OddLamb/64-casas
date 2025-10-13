export const createBoard = () => {
  const board = [];
  for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
          board[y * 8 + x] = null;
      }
  }
  // grid[y*width+x]
  board[0*8+0] = ["tower","black"];
  board[0*8+1] = ["knight","black"];
  board[0*8+2] = ["bishop","black"];
  board[0*8+3] = ["queen","black"];
  board[0*8+4] = ["king","black"];
  board[0*8+5] = ["bishop","black"];
  board[0*8+6] = ["knight","black"];
  board[0*8+7] = ["tower","black"];
  for(var x = 0; x < 8 ;x++){
    board[1*8+x] = ["pawn","black"];
  }

  board[7*8+0] = ["tower","white"];
  board[7*8+1] = ["knight","white"];
  board[7*8+2] = ["bishop","white"];
  board[7*8+3] = ["queen","white"];
  board[7*8+4] = ["king","white"];
  board[7*8+5] = ["bishop","white"];
  board[7*8+6] = ["knight","white"];
  board[7*8+7] = ["tower","white"];
  for(var x = 0; x < 8 ;x++){
    board[6*8+x] = ["pawn","white"];
  }
  return board;
}
export const getAvaiableMoves = (fromPos,board) => {
  const piece = board[fromPos];
  const pieceType = piece[0];
  const pieceColor = piece[1];
  
  const availablePos = [];

  switch (pieceType) {
    case "pawn":
      const col = fromPos % 8;
      let front = fromPos+(pieceColor === "white"? -8 : 8);

      const frontLeft = front-1;
      const frontRight = front+1;
      if(front >= 0 && front < 64){
        if(board[front] == null){
          availablePos.push(front);
        }
        if(col < 7 && board[frontRight] != null && board[frontRight][1] != pieceColor){
          availablePos.push(frontRight);
        }
        if(col > 0 && board[frontLeft] != null && board[frontLeft][1] != pieceColor){
          availablePos.push(frontLeft);
        }
      }
      break;
    case "bishop":
      const bishopDirs = [-9,-7,9,7]
      for(var dir of bishopDirs){
        let pos = fromPos+dir;
        while(true){ 
          if(pos <= 0 || pos >= 64){
            break;
          }           
          if(board[pos]){
            if(board[pos][1] != pieceColor){
              availablePos.push(pos);
            }
            break;
          }else{
            availablePos.push(pos);
          }
          
          pos+=dir;
        }
      } 
      break;
    case "tower":
      const towerDirs = [-8,1,8,-1];
      for(var dir of towerDirs){
        let pos = fromPos+dir;
        while(true){
          if(pos <= 0 || pos >= 64){
              break;
          }           
          if(board[pos]){
            if(board[pos][1] != pieceColor){
              availablePos.push(pos);
            }
            break;
          }else{
            availablePos.push(pos);
          }
          
          pos+=dir;
        }
      }
      break;
    case "queen":
      const queenDirs = [-9,-8,-7,1,7,8,9,-1];
      for(var dir of queenDirs){
        let pos = fromPos+dir;
        while(true){
          if(pos <= 0 || pos >= 64){
              break;
          }           
          if(board[pos]){
            if(board[pos][1] != pieceColor){
              availablePos.push(pos);
            }
            break;
          }else{
            availablePos.push(pos);
          }
          
          pos+=dir;
        }
      }
      break;
    case "king":
      const kingDirs = [-9,-8,-7,1,7,8,9,-1];
      for(var dir of kingDirs){
        let pos = fromPos+dir;   
        if(board[pos]){
          if(board[pos][1] != pieceColor){
            availablePos.push(pos);
          }
        }else{
          availablePos.push(pos);
        }
      }
      break;
    case "knight":
      const knightDirs = [-17,-15,-10,-6,6,10,15,17];
      for(var dir of knightDirs){
        let pos = fromPos+dir; 
        if(board[pos]){
          if(board[pos][1] != pieceColor){
            availablePos.push(pos);
          }
        }else{
          availablePos.push(pos);
        }
      }
      break;
  }
  return availablePos;
}
export const moveBoardPiece = (fromPos, toPos, board) => {
  const pieceToMove = board[fromPos];
  board[fromPos] = null;
  board[toPos] = pieceToMove;
}
export const checkMoveCorrect = (fromPos,toPos,board) => {
    const moveCorrect = getAvaiableMoves(fromPos,board).includes(toPos);
    const pieceColor = board[fromPos][1];

    // Verificando se a próxima posição o rei vai estar em cheque 
    const updatedBoard = [...board];
    moveBoardPiece(fromPos,toPos,updatedBoard); 
    const kingOnCheck = onCheck(pieceColor,updatedBoard);

    return moveCorrect && !kingOnCheck;
}
export const onCheck = (color,board) => {
  const kingPos = findPiece(color,"king",board);
  for(var i = 0;i < board.length;i++){
    const piece = board[i];
    if(piece != null){
      const pieceColor = piece[1];
      if(pieceColor != color && getAvaiableMoves(i,board).includes(kingPos)){
        return true;
      }
    }
  }
  return false;
}
export const findPiece = (color,pieceID,board) => {
  let piecePos = null;
  for(var i = 0;i<board.length;i++){
      const piece = board[i];
      if(piece != null){
          const pieceType = piece[0];
          const pieceColor = piece[1];
          if(pieceType == pieceID && pieceColor == color){
              piecePos = i;
              break;
          }
      }
  }
  return piecePos;
}
export const onCheckMate = (color, board) => {
  if(onCheck(color, board)){
    const kingPos = findPiece(color,"king",board);
    const avaiableMoves = getAvaiableMoves(kingPos,board);
    for(var i = 0;i<avaiableMoves;i++){
      const pos  = avaiableMoves[i];
      const moveBoard = [...board];
      moveBoardPiece(kingPos,pos,moveBoard);
      if(!onCheck(color,moveBoard)){
        return false;
      }
    }
    return true;
  }
  return false;
}