var board = ["-","-","-","-","-","-","-","-","-"];
var boardstring = asString(board);
var aiIsFirst = true;

const game = document.getElementById("game");
var moveCount = 0;
var clickAllowed = true;

resetGame();

game.addEventListener("click", function (e) {
    if (clickAllowed){
        let index = Array.prototype.indexOf.call(game.children, e.target);
        if (e.target.textContent) { return };
        playMove(index);
        if(!gameIsOver()) {
            playMove(getAIMove(boardstring));
        }
    }
});

function aiIsFirstChange(){
    aiIsFirst = !aiIsFirst;
    resetGame();
}

function resetGame(){
    board = ["-","-","-","-","-","-","-","-","-"];
    boardstring = asString(board);
    validMoves = [0,1,2,3,4,5,6,7,8];
    moveCount = 0;
    clickAllowed = true;
    document.getElementById("feedback").innerHTML = "Play a move";
    for(let x of Array.from(game.children)) {
        x.textContent = "";
    }
    if (aiIsFirst) {
        playMove(getAIMove(boardstring));
    }
}

function playMove(move){
    if (move != undefined) {
        board[move] = "XO"[moveCount % 2];
        boardstring = asString(board);
        game.children[move].textContent = "XO"[moveCount++ % 2];
        document.getElementById("feedback").innerHTML = "Playing in square " + (parseInt(move, 10) + 1);
        if (gameIsOver()){
            if (getWinner() == "-"){
                document.getElementById("feedback").innerHTML = "Game is a Draw";
            }
            else if (getWinner() == "X"){
                document.getElementById("feedback").innerHTML = "X Wins";
            }
            if (getWinner() == "O"){
                document.getElementById("feedback").innerHTML = "O Wins";
            }
            clickAllowed = false;
        }
    }
}

function gameIsOver() {
    return !boardstring.includes("-") || getWinner() != "-";
}

function getWinner(){
    if (board[0] != "-" && board[0] == board[3] && board[0] == board[6]) { return board[0]; }
    if (board[1] != "-" && board[1] == board[4] && board[1] == board[7]) { return board[1]; }
    if (board[2] != "-" && board[2] == board[5] && board[2] == board[8]) { return board[2]; }
    if (board[0] != "-" && board[0] == board[1] && board[0] == board[2]) { return board[0]; }
    if (board[3] != "-" && board[3] == board[4] && board[3] == board[5]) { return board[3]; }
    if (board[6] != "-" && board[6] == board[7] && board[6] == board[8]) { return board[0]; }
    if (board[0] != "-" && board[0] == board[4] && board[0] == board[8]) { return board[0]; }
    if (board[2] != "-" && board[2] == board[4] && board[2] == board[6]) { return board[2]; }
    return "-"
}

function asString(b){
    let result = "";
    for(let i = 0; i < b.length; i++){
        result += b[i];
    }
    return result;
}
function getAIMove(){
    if (boardstring == "---------") { return 0; }
    else if (boardstring == "XO-------") { return 4; }
    else if (boardstring == "XOO-X----") { return 8; }
    else if (boardstring == "XO-OX----") { return 8; }
    else if (boardstring == "XO--XO---") { return 8; }
    else if (boardstring == "XO--X-O--") { return 8; }
    else if (boardstring == "XO--X--O-") { return 8; }
    else if (boardstring == "XO--X---O") { return 6; }
    else if (boardstring == "XOO-X-X-O") { return 3; }
    else if (boardstring == "XO-OX-X-O") { return 2; }
    else if (boardstring == "XO--XOX-O") { return 2; }
    else if (boardstring == "XO--X-XOO") { return 2; }
    else if (boardstring == "X-O------") { return 8; }
    else if (boardstring == "XOO-----X") { return 4; }
    else if (boardstring == "X-OO----X") { return 4; }
    else if (boardstring == "X-O-O---X") { return 6; }
    else if (boardstring == "XOO-O-X-X") { return 3; }
    else if (boardstring == "X-OOO-X-X") { return 7; }
    else if (boardstring == "X-O-OOX-X") { return 3; }
    else if (boardstring == "X-O-O-XOX") { return 3; }
    else if (boardstring == "X-O--O--X") { return 4; }
    else if (boardstring == "X-O---O-X") { return 4; }
    else if (boardstring == "X-O----OX") { return 4; }
    else if (boardstring == "X--O-----") { return 4; }
    else if (boardstring == "X-OOX----") { return 8; }
    else if (boardstring == "X--OXO---") { return 8; }
    else if (boardstring == "X--OX-O--") { return 8; }
    else if (boardstring == "X--OX--O-") { return 8; }
    else if (boardstring == "X--OX---O") { return 2; }
    else if (boardstring == "XOXOX---O") { return 6; }
    else if (boardstring == "X-XOXO--O") { return 1; }
    else if (boardstring == "X-XOX-O-O") { return 1; }
    else if (boardstring == "X-XOX--OO") { return 1; }
    else if (boardstring == "X---O----") { return 8; }
    else if (boardstring == "XO--O---X") { return 7; }
    else if (boardstring == "XOO-O--XX") { return 6; }
    else if (boardstring == "XO-OO--XX") { return 6; }
    else if (boardstring == "XO--OO-XX") { return 6; }
    else if (boardstring == "XO--O-OXX") { return 2; }
    else if (boardstring == "XOXOO-OXX") { return 4; }
    else if (boardstring == "XOX-OOOXX") { return 3; }
    else if (boardstring == "X--OO---X") { return 5; }
    else if (boardstring == "XO-OOX--X") { return 2; }
    else if (boardstring == "X-OOOX--X") { return 6; }
    else if (boardstring == "XOOOOXX-X") { return 7; }
    else if (boardstring == "X-OOOXXOX") { return 1; }
    else if (boardstring == "X--OOXO-X") { return 2; }
    else if (boardstring == "X--OOX-OX") { return 2; }
    else if (boardstring == "X---OO--X") { return 3; }
    else if (boardstring == "XO-XOO--X") { return 6; }
    else if (boardstring == "X-OXOO--X") { return 6; }
    else if (boardstring == "X--XOOO-X") { return 2; }
    else if (boardstring == "XOXXOOO-X") { return 7; }
    else if (boardstring == "X-XXOOOOX") { return 1; }
    else if (boardstring == "X--XOO-OX") { return 6; }
    else if (boardstring == "X---O-O-X") { return 2; }
    else if (boardstring == "XOX-O-O-X") { return 5; }
    else if (boardstring == "X-XOO-O-X") { return 1; }
    else if (boardstring == "X-X-OOO-X") { return 1; }
    else if (boardstring == "X-X-O-OOX") { return 1; }
    else if (boardstring == "X---O--OX") { return 1; }
    else if (boardstring == "XXO-O--OX") { return 6; }
    else if (boardstring == "XXO-O-XOX") { return 6; }
    else if (boardstring == "XXO-O-XOX") { return 6; }
    else if (boardstring == "XX-OO--OX") { return 2; }
    else if (boardstring == "XX--OO-OX") { return 2; }
    else if (boardstring == "XX--O-OOX") { return 2; }
    else if (boardstring == "X----O---") { return 4; }
    else if (boardstring == "X-O-XO---") { return 8; }
    else if (boardstring == "X---XOO--") { return 8; }
    else if (boardstring == "X---XO-O-") { return 8; }
    else if (boardstring == "X---XO--O") { return 2; }
    else if (boardstring == "XOX-XO--O") { return 6; }
    else if (boardstring == "X-X-XOO-O") { return 1; }
    else if (boardstring == "X-X-XO-OO") { return 1; }
    else if (boardstring == "X-----O--") { return 8; }
    else if (boardstring == "XO----O-X") { return 4; }
    else if (boardstring == "X--O--O-X") { return 4; }
    else if (boardstring == "X----OO-X") { return 4; }
    else if (boardstring == "X-----OOX") { return 4; }
    else if (boardstring == "X------O-") { return 4; }
    else if (boardstring == "X-O-X--O-") { return 8; }
    else if (boardstring == "X---X-OO-") { return 8; }
    else if (boardstring == "X---X--OO") { return 6; }
    else if (boardstring == "X-O-X-XOO") { return 3; }
    else if (boardstring == "X--OX-XOO") { return 2; }
    else if (boardstring == "X---XOXOO") { return 2; }
    else if (boardstring == "X-------O") { return 2; }
    else if (boardstring == "XOX-----O") { return 6; }
    else if (boardstring == "XOXO--X-O") { return 4; }
    else if (boardstring == "XOX-O-X-O") { return 3; }
    else if (boardstring == "XOX--OX-O") { return 3; }
    else if (boardstring == "XOX---XOO") { return 3; }
    else if (boardstring == "X-XO----O") { return 1; }
    else if (boardstring == "X-X-O---O") { return 1; }
    else if (boardstring == "X-X--O--O") { return 1; }
    else if (boardstring == "X-X---O-O") { return 1; }
    else if (boardstring == "X-X----OO") { return 1; }
    else if (boardstring == "X--------") { return 4; }
    else if (boardstring == "XX--O----") { return 2; }
    else if (boardstring == "XXOXO----") { return 6; }
    else if (boardstring == "XXO-OX---") { return 6; }
    else if (boardstring == "XXO-O-X--") { return 3; }
    else if (boardstring == "XXOOOXX--") { return 7; }
    else if (boardstring == "XXOOO-XX-") { return 5; }
    else if (boardstring == "XXOOO-X-X") { return 5; }
    else if (boardstring == "XXO-O--X-") { return 6; }
    else if (boardstring == "XXO-O---X") { return 6; }
    else if (boardstring == "X-X-O----") { return 1; }
    else if (boardstring == "XOXXO----") { return 7; }
    else if (boardstring == "XOX-OX---") { return 7; }
    else if (boardstring == "XOX-O-X--") { return 7; }
    else if (boardstring == "XOX-O--X-") { return 3; }
    else if (boardstring == "XOXOOX-X-") { return 8; }
    else if (boardstring == "XOXOO-XX-") { return 5; }
    else if (boardstring == "XOXOO--XX") { return 5; }
    else if (boardstring == "XOX-O---X") { return 7; }
    else if (boardstring == "X--XO----") { return 6; }
    else if (boardstring == "XX-XO-O--") { return 2; }
    else if (boardstring == "X-XXO-O--") { return 1; }
    else if (boardstring == "XOXXOXO--") { return 7; }
    else if (boardstring == "XOXXO-OX-") { return 5; }
    else if (boardstring == "XOXXO-O-X") { return 7; }
    else if (boardstring == "X--XOXO--") { return 2; }
    else if (boardstring == "X--XO-OX-") { return 2; }
    else if (boardstring == "X--XO-O-X") { return 2; }
    else if (boardstring == "X---OX---") { return 1; }
    else if (boardstring == "XO-XOX---") { return 7; }
    else if (boardstring == "XO--OXX--") { return 7; }
    else if (boardstring == "XO--OX-X-") { return 6; }
    else if (boardstring == "XOX-OXOX-") { return 8; }
    else if (boardstring == "XO-XOXOX-") { return 2; }
    else if (boardstring == "XO--OXOXX") { return 2; }
    else if (boardstring == "XO--OX--X") { return 7; }
    else if (boardstring == "X---O-X--") { return 3; }
    else if (boardstring == "XX-OO-X--") { return 5; }
    else if (boardstring == "X-XOO-X--") { return 5; }
    else if (boardstring == "X--OOXX--") { return 7; }
    else if (boardstring == "XX-OOXXO-") { return 2; }
    else if (boardstring == "X-XOOXXO-") { return 1; }
    else if (boardstring == "X--OOXXOX") { return 1; }
    else if (boardstring == "X--OO-XX-") { return 5; }
    else if (boardstring == "X--OO-X-X") { return 5; }
    else if (boardstring == "X---O--X-") { return 3; }
    else if (boardstring == "XX-OO--X-") { return 5; }
    else if (boardstring == "X-XOO--X-") { return 5; }
    else if (boardstring == "X--OOX-X-") { return 2; }
    else if (boardstring == "XXOOOX-X-") { return 6; }
    else if (boardstring == "X-OOOXXX-") { return 8; }
    else if (boardstring == "X-OOOX-XX") { return 6; }
    else if (boardstring == "X--OO--XX") { return 5; }
    else if (boardstring == "X---O---X") { return 1; }
    else if (boardstring == "XO-XO---X") { return 7; }
    else if (boardstring == "XO--O-X-X") { return 7; }
    else if (boardstring == "XO--O--XX") { return 6; }
    else if (boardstring == "XOX-O-OXX") { return 5; }
    else if (boardstring == "XO-XO-OXX") { return 2; }
    else if (boardstring == "-X-------") { return 4; }
    else if (boardstring == "-XX-O----") { return 0; }
    else if (boardstring == "OXXXO----") { return 8; }
    else if (boardstring == "OXX-OX---") { return 8; }
    else if (boardstring == "OXX-O-X--") { return 8; }
    else if (boardstring == "OXX-O--X-") { return 8; }
    else if (boardstring == "OXX-O---X") { return 5; }
    else if (boardstring == "OXXXOO--X") { return 6; }
    else if (boardstring == "OXX-OOX-X") { return 3; }
    else if (boardstring == "OXX-OO-XX") { return 3; }
    else if (boardstring == "-X-XO----") { return 2; }
    else if (boardstring == "-XOXOX---") { return 6; }
    else if (boardstring == "-XOXO-X--") { return 0; }
    else if (boardstring == "OXOXOXX--") { return 8; }
    else if (boardstring == "OXOXO-XX-") { return 8; }
    else if (boardstring == "OXOXO-X-X") { return 7; }
    else if (boardstring == "-XOXO--X-") { return 6; }
    else if (boardstring == "-XOXO---X") { return 6; }
    else if (boardstring == "-X--OX---") { return 0; }
    else if (boardstring == "OX-XOX---") { return 8; }
    else if (boardstring == "OX--OXX--") { return 8; }
    else if (boardstring == "OX--OX-X-") { return 8; }
    else if (boardstring == "OX--OX--X") { return 2; }
    else if (boardstring == "OXOXOX--X") { return 6; }
    else if (boardstring == "OXO-OXX-X") { return 7; }
    else if (boardstring == "OXO-OX-XX") { return 6; }
    else if (boardstring == "-X--O-X--") { return 3; }
    else if (boardstring == "-XXOO-X--") { return 5; }
    else if (boardstring == "-X-OOXX--") { return 8; }
    else if (boardstring == "XX-OOXX-O") { return 2; }
    else if (boardstring == "-XXOOXX-O") { return 0; }
    else if (boardstring == "-X-OOXXXO") { return 0; }
    else if (boardstring == "-X-OO-XX-") { return 5; }
    else if (boardstring == "-X-OO-X-X") { return 5; }
    else if (boardstring == "-X--O--X-") { return 0; }
    else if (boardstring == "OX-XO--X-") { return 8; }
    else if (boardstring == "OX--O-XX-") { return 8; }
    else if (boardstring == "OX--O--XX") { return 6; }
    else if (boardstring == "OXX-O-OXX") { return 3; }
    else if (boardstring == "OX-XO-OXX") { return 2; }
    else if (boardstring == "OX--OXOXX") { return 2; }
    else if (boardstring == "-X--O---X") { return 3; }
    else if (boardstring == "XX-OO---X") { return 5; }
    else if (boardstring == "-XXOO---X") { return 5; }
    else if (boardstring == "-X-OOX--X") { return 2; }
    else if (boardstring == "XXOOOX--X") { return 6; }
    else if (boardstring == "-XOOOXX-X") { return 7; }
    else if (boardstring == "-XOOOX-XX") { return 6; }
    else if (boardstring == "-X-OO--XX") { return 5; }
    else if (boardstring == "--X------") { return 4; }
    else if (boardstring == "--XXO----") { return 1; }
    else if (boardstring == "-OXXOX---") { return 7; }
    else if (boardstring == "-OXXO-X--") { return 7; }
    else if (boardstring == "-OXXO--X-") { return 8; }
    else if (boardstring == "XOXXO--XO") { return 6; }
    else if (boardstring == "-OXXOX-XO") { return 0; }
    else if (boardstring == "-OXXO-XXO") { return 0; }
    else if (boardstring == "-OXXO---X") { return 7; }
    else if (boardstring == "--X-OX---") { return 8; }
    else if (boardstring == "X-X-OX--O") { return 1; }
    else if (boardstring == "XOXXOX--O") { return 7; }
    else if (boardstring == "XOX-OXX-O") { return 7; }
    else if (boardstring == "XOX-OX-XO") { return 3; }
    else if (boardstring == "-XX-OX--O") { return 0; }
    else if (boardstring == "--XXOX--O") { return 0; }
    else if (boardstring == "--X-OXX-O") { return 0; }
    else if (boardstring == "--X-OX-XO") { return 0; }
    else if (boardstring == "--X-O-X--") { return 1; }
    else if (boardstring == "-OX-OXX--") { return 7; }
    else if (boardstring == "-OX-O-XX-") { return 8; }
    else if (boardstring == "XOX-O-XXO") { return 3; }
    else if (boardstring == "-OX-OXXXO") { return 0; }
    else if (boardstring == "-OX-O-X-X") { return 7; }
    else if (boardstring == "--X-O--X-") { return 3; }
    else if (boardstring == "-XXOO--X-") { return 5; }
    else if (boardstring == "--XOOX-X-") { return 8; }
    else if (boardstring == "X-XOOX-XO") { return 1; }
    else if (boardstring == "-XXOOX-XO") { return 0; }
    else if (boardstring == "--XOOXXXO") { return 0; }
    else if (boardstring == "--XOO-XX-") { return 5; }
    else if (boardstring == "--XOO--XX") { return 5; }
    else if (boardstring == "--X-O---X") { return 5; }
    else if (boardstring == "X-X-OO--X") { return 3; }
    else if (boardstring == "-XX-OO--X") { return 3; }
    else if (boardstring == "--XXOO--X") { return 7; }
    else if (boardstring == "X-XXOO-OX") { return 1; }
    else if (boardstring == "-XXXOO-OX") { return 0; }
    else if (boardstring == "--XXOOXOX") { return 1; }
    else if (boardstring == "--X-OOX-X") { return 3; }
    else if (boardstring == "--X-OO-XX") { return 3; }
    else if (boardstring == "---X-----") { return 4; }
    else if (boardstring == "---XOX---") { return 0; }
    else if (boardstring == "O-XXOX---") { return 8; }
    else if (boardstring == "O--XOXX--") { return 8; }
    else if (boardstring == "O--XOX-X-") { return 8; }
    else if (boardstring == "O--XOX--X") { return 2; }
    else if (boardstring == "O-OXOXX-X") { return 1; }
    else if (boardstring == "O-OXOX-XX") { return 1; }
    else if (boardstring == "---XO-X--") { return 0; }
    else if (boardstring == "OX-XO-X--") { return 8; }
    else if (boardstring == "O-XXO-X--") { return 8; }
    else if (boardstring == "O--XO-XX-") { return 8; }
    else if (boardstring == "O--XO-X-X") { return 7; }
    else if (boardstring == "OX-XO-XOX") { return 2; }
    else if (boardstring == "O-XXO-XOX") { return 1; }
    else if (boardstring == "O--XOXXOX") { return 1; }
    else if (boardstring == "---XO--X-") { return 0; }
    else if (boardstring == "O-XXO--X-") { return 8; }
    else if (boardstring == "O--XO--XX") { return 6; }
    else if (boardstring == "OX-XO-OXX") { return 2; }
    else if (boardstring == "O-XXO-OXX") { return 5; }
    else if (boardstring == "O--XOXOXX") { return 2; }
    else if (boardstring == "---XO---X") { return 7; }
    else if (boardstring == "X--XO--OX") { return 1; }
    else if (boardstring == "-X-XO--OX") { return 2; }
    else if (boardstring == "XXOXO--OX") { return 6; }
    else if (boardstring == "-XOXOX-OX") { return 6; }
    else if (boardstring == "-XOXO-XOX") { return 0; }
    else if (boardstring == "--XXO--OX") { return 1; }
    else if (boardstring == "---XOX-OX") { return 1; }
    else if (boardstring == "---XO-XOX") { return 1; }
    else if (boardstring == "----X----") { return 0; }
    else if (boardstring == "OX--X----") { return 7; }
    else if (boardstring == "OXX-X--O-") { return 6; }
    else if (boardstring == "OXXXX-OO-") { return 8; }
    else if (boardstring == "OXX-XXOO-") { return 3; }
    else if (boardstring == "OXX-X-OOX") { return 3; }
    else if (boardstring == "OX-XX--O-") { return 5; }
    else if (boardstring == "OXXXXO-O-") { return 6; }
    else if (boardstring == "OX-XXOXO-") { return 2; }
    else if (boardstring == "OX-XXO-OX") { return 2; }
    else if (boardstring == "OX--XX-O-") { return 3; }
    else if (boardstring == "OXXOXX-O-") { return 6; }
    else if (boardstring == "OX-OXXXO-") { return 2; }
    else if (boardstring == "OX-OXX-OX") { return 6; }
    else if (boardstring == "OX--X-XO-") { return 2; }
    else if (boardstring == "OXOXX-XO-") { return 5; }
    else if (boardstring == "OXO-XXXO-") { return 3; }
    else if (boardstring == "OXO-X-XOX") { return 5; }
    else if (boardstring == "OX--X--OX") { return 6; }
    else if (boardstring == "OX-XX-OOX") { return 5; }
    else if (boardstring == "OX--XXOOX") { return 3; }
    else if (boardstring == "O-X-X----") { return 6; }
    else if (boardstring == "OXX-X-O--") { return 3; }
    else if (boardstring == "O-XXX-O--") { return 5; }
    else if (boardstring == "OXXXXOO--") { return 7; }
    else if (boardstring == "O-XXXOOX-") { return 1; }
    else if (boardstring == "O-XXXOO-X") { return 1; }
    else if (boardstring == "O-X-XXO--") { return 3; }
    else if (boardstring == "O-X-X-OX-") { return 3; }
    else if (boardstring == "O-X-X-O-X") { return 3; }
    else if (boardstring == "O--XX----") { return 5; }
    else if (boardstring == "OX-XXO---") { return 7; }
    else if (boardstring == "O-XXXO---") { return 6; }
    else if (boardstring == "O--XXOX--") { return 2; }
    else if (boardstring == "OXOXXOX--") { return 7; }
    else if (boardstring == "O-OXXOXX-") { return 1; }
    else if (boardstring == "O-OXXOX-X") { return 1; }
    else if (boardstring == "O--XXO-X-") { return 1; }
    else if (boardstring == "OOXXXO-X-") { return 6; }
    else if (boardstring == "OO-XXOXX-") { return 2; }
    else if (boardstring == "OO-XXO-XX") { return 2; }
    else if (boardstring == "O--XXO--X") { return 2; }
    else if (boardstring == "OXOXXO--X") { return 7; }
    else if (boardstring == "O-OXXO-XX") { return 1; }
    else if (boardstring == "O---XX---") { return 3; }
    else if (boardstring == "OX-OXX---") { return 6; }
    else if (boardstring == "O-XOXX---") { return 6; }
    else if (boardstring == "O--OXXX--") { return 2; }
    else if (boardstring == "OXOOXXX--") { return 7; }
    else if (boardstring == "O-OOXXXX-") { return 1; }
    else if (boardstring == "O-OOXXX-X") { return 1; }
    else if (boardstring == "O--OXX-X-") { return 6; }
    else if (boardstring == "O--OXX--X") { return 6; }
    else if (boardstring == "O---X-X--") { return 2; }
    else if (boardstring == "OXO-X-X--") { return 7; }
    else if (boardstring == "O-OXX-X--") { return 1; }
    else if (boardstring == "O-O-XXX--") { return 1; }
    else if (boardstring == "O-O-X-XX-") { return 1; }
    else if (boardstring == "O-O-X-X-X") { return 1; }
    else if (boardstring == "O---X--X-") { return 1; }
    else if (boardstring == "OOX-X--X-") { return 6; }
    else if (boardstring == "OOXXX-OX-") { return 5; }
    else if (boardstring == "OOX-XXOX-") { return 3; }
    else if (boardstring == "OOX-X-OXX") { return 3; }
    else if (boardstring == "OO-XX--X-") { return 2; }
    else if (boardstring == "OO--XX-X-") { return 2; }
    else if (boardstring == "OO--X-XX-") { return 2; }
    else if (boardstring == "OO--X--XX") { return 2; }
    else if (boardstring == "O---X---X") { return 2; }
    else if (boardstring == "OXO-X---X") { return 7; }
    else if (boardstring == "OXOXX--OX") { return 5; }
    else if (boardstring == "OXO-XX-OX") { return 3; }
    else if (boardstring == "O-OXX---X") { return 1; }
    else if (boardstring == "O-O-XX--X") { return 1; }
    else if (boardstring == "O-O-X--XX") { return 1; }
    else if (boardstring == "-----X---") { return 4; }
    else if (boardstring == "----OXX--") { return 1; }
    else if (boardstring == "-O-XOXX--") { return 7; }
    else if (boardstring == "-O--OXXX-") { return 8; }
    else if (boardstring == "XO--OXXXO") { return 3; }
    else if (boardstring == "-O-XOXXXO") { return 0; }
    else if (boardstring == "-O--OXX-X") { return 7; }
    else if (boardstring == "----OX-X-") { return 2; }
    else if (boardstring == "X-O-OX-X-") { return 6; }
    else if (boardstring == "-XO-OX-X-") { return 6; }
    else if (boardstring == "--OXOX-X-") { return 6; }
    else if (boardstring == "--O-OXXX-") { return 8; }
    else if (boardstring == "X-O-OXXXO") { return 3; }
    else if (boardstring == "-XO-OXXXO") { return 0; }
    else if (boardstring == "--OXOXXXO") { return 0; }
    else if (boardstring == "--O-OX-XX") { return 6; }
    else if (boardstring == "----OX--X") { return 2; }
    else if (boardstring == "X-O-OX--X") { return 6; }
    else if (boardstring == "-XO-OX--X") { return 6; }
    else if (boardstring == "--OXOX--X") { return 6; }
    else if (boardstring == "--O-OXX-X") { return 7; }
    else if (boardstring == "X-O-OXXOX") { return 1; }
    else if (boardstring == "-XO-OXXOX") { return 0; }
    else if (boardstring == "--OXOXXOX") { return 1; }
    else if (boardstring == "------X--") { return 4; }
    else if (boardstring == "----O-XX-") { return 8; }
    else if (boardstring == "X---O-XXO") { return 3; }
    else if (boardstring == "XX-OO-XXO") { return 5; }
    else if (boardstring == "X-XOO-XXO") { return 5; }
    else if (boardstring == "X--OOXXXO") { return 1; }
    else if (boardstring == "-X--O-XXO") { return 0; }
    else if (boardstring == "--X-O-XXO") { return 0; }
    else if (boardstring == "---XO-XXO") { return 0; }
    else if (boardstring == "----OXXXO") { return 0; }
    else if (boardstring == "----O-X-X") { return 7; }
    else if (boardstring == "X---O-XOX") { return 1; }
    else if (boardstring == "-X--O-XOX") { return 3; }
    else if (boardstring == "XX-OO-XOX") { return 5; }
    else if (boardstring == "-XXOO-XOX") { return 5; }
    else if (boardstring == "-X-OOXXOX") { return 2; }
    else if (boardstring == "--X-O-XOX") { return 1; }
    else if (boardstring == "----OXXOX") { return 1; }
    else if (boardstring == "-------X-") { return 4; }
    else if (boardstring == "----O--XX") { return 6; }
    else if (boardstring == "X---O-OXX") { return 2; }
    else if (boardstring == "-X--O-OXX") { return 2; }
    else if (boardstring == "--X-O-OXX") { return 5; }
    else if (boardstring == "X-X-OOOXX") { return 3; }
    else if (boardstring == "-XX-OOOXX") { return 3; }
    else if (boardstring == "--XXOOOXX") { return 1; }
    else if (boardstring == "---XO-OXX") { return 2; }
    else if (boardstring == "----OXOXX") { return 2; }
    else if (boardstring == "--------X") { return 4; }
}