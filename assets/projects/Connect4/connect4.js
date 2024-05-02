const WHITE = "#ffffff";
const RED = "#ff0000";
const YELLOW = "#ffff00";
const BLUE = "#0000ff";

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

class Connect4Gameboard {
    constructor() {
        this.playerTokens = ["X", "O"]
        this.turnNumber = 0;
        this.width = 7;
        this.height = 6;
        this.board = [];
        for (let r = 0; r < this.height; r++) {
            let tmp = [];
            for (let c = 0; c < this.width; c++) {
                tmp.push("-");
            }
            this.board.push(tmp);
        }
    }

    start() {
        this.resetBoard()
        this.gameLoop()
    }

    hasToken(r, c) {
        return this.board[r][c] != "-";
    }

    resetBoard() {
        this.board = [];
        for (let r = 0; r < this.height; r++) {
            let tmp = [];
            for (let c = 0; c < this.col; c++) {
                tmp.push("-");
            }
            this.board.push(tmp);
        }
        this.turnNumber = 0;
    }

    getValidMoves() {
        let possibleMoves = [0, 1, 2, 3, 4, 5, 6];
        let validMoves = [];
        possibleMoves.forEach(move => {
            if (this.isValidMove(move)) {
                validMoves.push(move+1);
            }
        });
        return validMoves;
    }

    isValidMove(column) {
        if (this.hasToken(0, column)) {
            return false;
        }
        return true;
    }

    dropInColumn(column) {
        if (this.hasToken(0, column)) {
            return;
        }
        for (let i = 0; i < this.height; i++) {
            if (i == this.height - 1) {
                this.updateBoard(i, column);
                return;
            }
            else if (this.hasToken(i + 1, column)) {
                this.updateBoard(i, column);
                return;
            }
        }
    }

    updateBoard(r, c) {
        this.board[r][c] = this.playerTokens[this.turnNumber % this.playerTokens.length];
        if (!this.isGameOver()) {
            this.turnNumber++;
        }
        else {
            disableControls();
        }
    }

    isGameOver() {
        return this.isDraw() || this.isWinner();
    }

    isWinner() {
        return (this.isHorizontalWin() || this.isVerticalWin() || this.isUpDiagonalWin() || this.isDownDiagonalWin());
    }

    isDraw() {
        return this.getValidMoves() == [];
    }

    isHorizontalWin() {
        for (let r = 0; r < this.height; r++) {
            let inARow = 0;
            for (let c = 0; c < this.width; c++) {
                if (c == 0 && this.hasToken(r, c)) {
                    inARow = 1;
                }
                else if (this.hasToken(r, c) && this.board[r][c - 1] != this.board[r][c]) {
                    inARow = 1;
                }
                else if (this.hasToken(r, c) && this.board[r][c - 1] == this.board[r][c]) {
                    inARow++;
                }
                else {
                    inARow = 0;
                }
                if (inARow == 4) {
                    return true;
                }
            }
        }
        return false;
    }

    isVerticalWin() {
        for (let c = 0; c < this.width; c++) {
            let inARow = 0;
            for (let r = 0; r < this.height; r++) {
                if (r == 0 && this.hasToken(r, c)) {
                    inARow = 1;
                }
                else if (this.hasToken(r, c) && this.board[r - 1][c] != this.board[r][c]) {
                    inARow = 1;
                }
                else if (this.hasToken(r, c) && this.board[r - 1][c] == this.board[r][c]) {
                    inARow++;
                }
                else {
                    inARow = 0;
                }
                if (inARow == 4) {
                    return true;
                }
            }
        }
        return false;
    }

    isUpDiagonalWin() {
        let startrow = 4 - 1;
        for (let i = startrow; i < this.height; i++) {
            let r = i;
            let c = 0;
            if (this.isWinInThisUpDiagonal(r, c)) {
                return true;
            }
        }
        let endcolumn = 4;
        for (let i = 1; i < endcolumn; i++) {
            let r = this.height - 1;
            let c = i;
            if (this.isWinInThisUpDiagonal(r, c)) {
                return true;
            }
        }
        return false;
    }

    isWinInThisUpDiagonal(row, col) {
        let inARow, r, c;
        r = row;
        c = col;
        while (!(r < 0) && !(c >= this.width)) {
            if ((c == 0 || r == this.height - 1) && this.hasToken(r, c)) {
                inARow = 1;
            }
            else if (this.hasToken(r, c) && this.board[r + 1][c - 1] != this.board[r][c]) {
                inARow = 1;
            }
            else if (this.hasToken(r, c) && this.board[r + 1][c - 1] == this.board[r][c]) {
                inARow += 1;
            }
            else {
                inARow = 0;
            }
            if (inARow == 4) {
                return true;
            }
            r--;
            c++;
        }
        return false;
    }

    isDownDiagonalWin() {
        let startrow = this.height - 4;
        for (let i = startrow; i > 0; i--) {
            let r = i;
            let c = 0;
            if (this.isWinInThisDownDiagonal(r, c)) {
                return true;
            }
        }

        let endcolumn = 4
        for (let i = 0; i < endcolumn; i++) {
            let r = 0;
            let c = i;
            if (this.isWinInThisDownDiagonal(r, c)) {
                return true;
            }
        }
        return false;
    }

    isWinInThisDownDiagonal(row , col) {
        let inARow, r, c;
        r = row;
        c = col;
        while (!(r >= this.height) && !(c >= this.width)) {
            if ((c == 0 || r == 0) && this.hasToken(r, c)) {
                inARow = 1;
            }
            else if (this.hasToken(r, c) && this.board[r - 1][c - 1] != this.board[r][c]) {
                inARow = 1;
            }
            else if (this.hasToken(r, c) && this.board[r - 1][c - 1] == this.board[r][c]) {
                inARow++;
            }
            else {
                inARow = 0;
            }
            if (inARow == 4) {
                return true;
            }
            r++;
            c++;
        }
        return false;
    }
}

class Connect4AIAgent {
    constructor(board, AITurnNumber) {
        this.gameboard = board;
        this.AITurnNumber = AITurnNumber - 1;
        this.width = 7;
        this.height = 6;
        this.AIIsMaximizing = true;
        this.fillValue = 9999;
        this.depth = 5;
    }

    getMove() {
        if (this.isBlank(this.gameboard.board)) {
            return 4;
        }
        let moveEvalutations = [this.fillValue, this.fillValue, this.fillValue, this.fillValue, this.fillValue, this.fillValue, this.fillValue];
        let validMoves = this.getValidMoves(this.gameboard.board);
        validMoves.forEach(move => {
            let newboard = deepCopy(this.gameboard.board);
            newboard = this.getBoardWithMove(newboard, this.gameboard.turnNumber, move);
            moveEvalutations[move] = this.alphaBeta(newboard, this.gameboard.turnNumber, this.depth, this.AIIsMaximizing);
        });
        minIndexes = this.getMinIndexes(moveEvalutations);
        this.adjustDepth();
        return minIndexes[Math.floor(Math.random() * minIndexes.length)] + 1;
    }

    alphaBeta(board, turnNumber, depth, isMaximizingPlayer, alpha=-9999, beta=9999) {
        if (depth == 0 || this.gameIsOver(board)) {
            return this.evaluateBoard(board, isMaximizingPlayer, depth);
        }
        else {
            if (isMaximizingPlayer) {
                let maxEvaluation = -9999;
                this.getValidMoves(board).forEach(move => {
                    let newboard = deepCopy(board);
                    newboard = this.getBoardWithMove(newboard, turnNumber + 1, move);
                    let evaluation = this.alphaBeta(newboard, turnNumber + 1, depth - 1, !isMaximizingPlayer, alpha, beta);
                    let maxEvaluation = Math.max(maxEvaluation, evaluation);
                    alpha = max(alpha, maxEvaluation);
                    if (beta <= alpha) {
                        return;
                    }
                });
                return maxEvaluation;
            }
            else {
                let minEvaluation = 9999;
                this.getValidMoves(board).forEach(move => {
                    let newboard = deepCopy(board);
                    newboard = this.getBoardWithMove(newboard, turnNumber + 1, move);
                    let evaluation = this.alphaBeta(newboard, turnNumber + 1, depth - 1, !isMaximizingPlayer, alpha, beta);
                    let minEvaluation = min(minEvaluation, evaluation);
                    beta = Math.min(beta, minEvaluation);
                    if (beta <= alpha) {
                        return;
                    }
                });
                return minEvaluation;
            }
        }
    }

    evaluateBoard(board, isMaximizingPlayer, depth) {
        if (this.isWinner(board)) {
            if (isMaximizingPlayer) {
                return -100 - depth;
            }
            else {
                return 100 + depth;
            }
        }
        else {
            let horizontalScores = this.horizontalScores(board);
            let verticalScores = this.verticalScores(board);
            let upDiagonalScores = this.upDiagonalScores(board);
            let downDiagonalScores = this.downDiagonalScores(board);
            let player1Total = (horizontalScores[0] + verticalScores[0] + upDiagonalScores[0] + downDiagonalScores[0]);
            let player2Total = (horizontalScores[1] + verticalScores[1] + upDiagonalScores[1] + downDiagonalScores[1]);
            let totals = [player1Total, player2Total];
            if (isMaximizingPlayer) {
                return totals[(this.AITurnNumber + 1) % 2] - totals[this.AITurnNumber];
            }
            else {
                return totals[this.AITurnNumber] - totals[(this.AITurnNumber + 1) % 2];
            }
        }
    }

    getTotalScores(player1Scores, player2Scores) {
        let player1Total = 0;
        let player2Total = 0;
        player1Scores.forEach(elem => {
            if (elem == 0) { }
            else if (elem == 1) {
                player1Total += 0.1;
            }
            else if (elem == 2) {
                player1Total += 0.3;
            }
            else {
                player1Total += 0.9;
            }
        });
        player2Scores.forEach(elem => {
            if (elem == 0) { }
            else if (elem == 1) {
                player2Total += 0.1;
            }
            else if (elem == 2) {
                player2Total += 0.3;
            }
            else {
                player2Total += 0.9;
            }
        });
        return [player1Total, player2Total];
    }

    horizontalScores(board) {
        let player1Scores = [];
        let player2Scores = [];
        let player1Total = 0;
        let player2Total = 0;
        for (let r = 0; r < this.height; r++) {
            let inARow = 0
            for (let c = 0; c < this.width; c++) {
                if (c == 0 && this.hasToken(board, r, c)) {
                    inARow = 1;
                }
                else if (this.hasToken(board, r, c) && board[r][c - 1] != board[r][c]) {
                    if (board[r][c - 1] == "X") {
                        player1Scores.push(inARow);
                    }
                    else {
                        player2Scores.push(inARow);
                    }
                    inARow = 1;
                }
                else if (this.hasToken(board, r, c) && board[r][c - 1] == board[r][c]) {
                    inARow++;
                }
                else {
                    if (board[r][c - 1] == "X") {
                        player1Scores.push(inARow);
                    }
                    else {
                        player2Scores.push(inARow);
                    }
                    inARow = 0;
                }
            }
            let scores = this.getTotalScores(player1Scores, player2Scores);
            player1Total += scores[0];
            player2Total += scores[1];
            player1Scores = [];
            player2Scores = [];
        }
        return [player1Total, player2Total];
    }

    verticalScores(board) {
        let player1Scores = [];
        let player2Scores = [];
        let player1Total = 0;
        let player2Total = 0;
        for (let c = 0; c < this.width; c++) {
            let inARow = 0;
            for (let r = 0; r < this.height; r++) {
                if (r == 0 && this.hasToken(board, r, c)) {
                    inARow = 1;
                }
                else if (this.hasToken(board, r, c) && board[r - 1][c] != board[r][c]) {
                    if (board[r - 1][c] == "X") {
                        player1Scores.push(inARow);
                    }
                    else {
                        player2Scores.push(inARow);
                    }
                    inARow = 1;
                }
                else if (this.hasToken(board, r, c) && board[r - 1][c] == board[r][c]) {
                    inARow += 1;
                }
                else {
                    if (board[r - 1][c] == "X") {
                        player1Scores.push(inARow);
                    }
                    else {
                        player2Scores.push(inARow);
                    }
                    inARow = 0;
                }
            }
            let scores = this.getTotalScores(player1Scores, player2Scores);
            player1Total += scores[0];
            player2Total += scores[1];
            player1Scores = [];
            player2Scores = [];
        }
        return [player1Total, player2Total];
    }

    upDiagonalScores(board) {
        let player1Total = 0;
        let player2Total = 0;
        let startrow = 4 - 1;
        for (let i = startrow; i < this.height; i++) {
            let r = i;
            let c = 0;
            let scores = this.scoresInThisUpDiagonal(board, r, c);
            player1Total += scores[0];
            player2Total += scores[1];
        }
        endcolumn = 4;
        for (let i = 1; i < endcolumn; i++) {
            let r = this.height - 1;
            let c = i;
            let scores = this.scoresInThisUpDiagonal(board, r, c);
            player1Total += scores[0];
            player2Total += scores[1];
        }
        return [player1Total, player2Total];
    }

    scoresInThisUpDiagonal(board, row, col) {
        let player1Scores = [];
        let player2Scores = [];
        let inARow = 0;
        let r = row;
        let c = col;
        while (!(r < 0) && !(c >= this.width)) {
            if (c == 0 || r == this.height - 1) {
                if (this.hasToken(board, r, c)) {
                    inARow = 1;
                }
            }
            else if (this.hasToken(board, r, c) && board[r + 1][c - 1] != board[r][c]) {
                if (board[r + 1][c - 1] == "X") {
                    player1Scores.push(inARow);
                }
                else {
                    player2Scores.push(inARow);
                }
                inARow = 1;
            }
            else if (this.hasToken(board, r, c) && board[r + 1][c - 1] == board[r][c]) {
                inARow++;
            }
            else {
                if (board[r + 1][c - 1] == "X") {
                    player1Scores.push(inARow);
                }
                else {
                    player2Scores.push(inARow);
                }
                inARow = 0;
            }
            r--;
            c++;
        }
        return this.getTotalScores(player1Scores, player2Scores);
    }

    downDiagonalScores(board) {
        let player1Total = 0;
        let player2Total = 0;
        let startrow = this.height - 4;
        for (let i = startrow; i > 0; i--) {
            let r = i;
            let c = 0;
            let scores = this.scoresInThisUpDiagonal(board, r, c);
            player1Total += scores[0];
            player2Total += scores[1];
        }

        let endcolumn = 4;
        for (let i = 0; i < endcolumn; i++) {
            let r = 0;
            let c = i;
            let scores = this.scoresInThisUpDiagonal(board, r, c);
            player1Total += scores[0];
            player2Total += scores[1];
        }
        return [player1Total, player2Total];
    }

    scoresInThisDownDiagonal(board, row , col) {
        let player1Scores = [];
        let player2Scores = [];
        let r = row; 
        let c = col;
        let inARow = 0;
        while (!(r >= this.height) && !(c >= this.width)) {
            if ((c == 0 || r == 0) && this.hasToken(board, r, c)) {
                inARow = 1;
            }
            else if (this.hasToken(board, r, c) && board[r - 1][c - 1] != board[r][c]) {
                if (board[r - 1][c - 1] == "X") {
                    player1Scores.push(inARow);
                }
                else {
                    player2Scores.push(inARow);
                }
                inARow = 1;
            }
            else if (this.hasToken(board, r, c) && board[r - 1][c - 1] == board[r][c]) {
                inARow++;
            }
            else {
                if (board[r - 1][c - 1] == "X") {
                    player1Scores.push(inARow);
                }
                else {
                    player2Scores.push(inARow);
                }
                inARow = 0;
            }
            r++;
            c++;
        }
        return this.getTotalScores(player1Scores, player2Scores);
    }

    getMinIndexes(list) {
        minIndexes = [];
        minValue = Math.min(...list);
        for (let i = 0; i < list.length; i++) {
            if (list[i] == minValue) {
                minIndexes.push(i);
            }
        }
        return minIndexes;
    }

    adjustDepth() {
        if (this.gameboard.turnNumber >= 10 && this.gameboard.turnNumber % 2 == 0) {
            this.depth++;
        }
    }

    getValidMoves(board) {
        let possibleMoves = [0, 1, 2, 3, 4, 5, 6];
        let validMoves = [];
        possibleMoves.forEach(move => {
            if (this.isValidMove(board, move)) {
                validMoves.push(move);
            }
        });
        return validMoves;
    }

    isValidMove(board, column) {
        if (this.hasToken(board, 0, column)) {
            return false;
        }
        if (column < 0 || column >= board[0].length) {
            return false;
        }
        return true;
    }

    getBoardWithMove(board, turnNumber, move) {
        for (let i = 0; i < board.length; i++) {
            if (i == board.length - 1) {
                return this.updateBoard(board, turnNumber, i, move);
            }
            else if (this.hasToken(board, i + 1, move)) {
                return this.updateBoard(board, turnNumber, i, move);
            }
        }
    }

    updateBoard(board, turnNumber, r, c) {
        board[r][c] = this.gameboard.playerTokens[turnNumber % this.gameboard.playerTokens.length];
        return board;
    }

    hasToken(board, r, c) {
        return board[r][c] != "-";
    }

    gameIsOver(board) {
        return this.isWinner(board) || this.isDraw(board);
    }

    isWinner(board) {
        return (this.isHorizontalWin(board) || this.isVerticalWin(board) || this.isUpDiagonalWin(board) || this.isDownDiagonalWin(board));
    }

    isDraw(board) {
        return this.getValidMoves(board) == [];
    }

    isBlank(board) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                if (board[i][j] != "-") {
                    return false;
                }
            }
        }
        return true;
    }

    isHorizontalWin(board) {
        for (let r = 0; r < this.height; r++) {
            let inARow = 0
            for (let c = 0; c < this.width; c++) {
                if (c == 0 && this.hasToken(board, r, c)) {
                    inARow = 1;
                }
                else if (this.hasToken(board, r, c) && board[r][c - 1] != board[r][c]) {
                    inARow = 1;
                }
                else if (this.hasToken(board, r, c) && board[r][c - 1] == board[r][c]) {
                    inARow++;
                }
                else {
                    inARow = 0;
                }
                if (inARow == 4) {
                    return true;
                }
            }
        }
        return false;
    }

    isVerticalWin(board) {
        for (let c = 0; c < this.width; c++) {
            let inARow = 0;
            for (let r = 0; r < this.height; r++) {
                if (r == 0 && this.hasToken(board, r, c)) {
                    inARow = 1;
                }
                else if (this.hasToken(board, r, c) && board[r - 1][c] != board[r][c]) {
                    inARow = 1;
                }
                else if (this.hasToken(board, r, c) && board[r - 1][c] == board[r][c]) {
                    inARow++;
                }
                else {
                    inARow = 0;
                }
                if (inARow == 4) {
                    return true;
                }
            }
        }
        return false;
    }

    isUpDiagonalWin(board) {
        let startrow = 4 - 1;
        for (let i = startrow; i < this.height; i++) {
            let r = i;
            let c = 0;
            if (this.isWinInThisUpDiagonal(board, r, c)) {
                return true;
            }
        }

        let endcolumn = 4;
        for (let i = 1; i < endcolumn; i++) {
            let r = this.height - 1;
            let c = i;
            if (this.isWinInThisUpDiagonal(board, r, c)) {
                return true;
            }
        }
        return false;
    }

    isWinInThisUpDiagonal(board, row, col) {
        let r = row;
        let c = col;
        let inARow = 0;
        while (!(r < 0) && !(c >= this.width)) {
            if ((c == 0 || r == this.height - 1) && this.hasToken(board, r, c)) {
                inARow = 1;
            }
            else if (this.hasToken(board, r, c) && board[r + 1][c - 1] != board[r][c]) {
                inARow = 1;
            }
            else if (this.hasToken(board, r, c) && board[r + 1][c - 1] == board[r][c]) {
                inARow++;
            }
            else {
                inARow = 0;
            }
            if (inARow == 4) {
                return true;
            }
            r--;
            c++;
        }
        return false;
    }

    isDownDiagonalWin(board) {
        let startrow = this.height - 4;
        for (let i = startrow; i > 0; i--) {
            let r = i;
            let c = 0;
            if (this.isWinInThisDownDiagonal(board, r, c)) {
                return true;
            }
        }

        let endcolumn = 4;
        for (let i = 0; i < endcolumn; i++) {
            let r = 0;
            let c = i;
            if (this.isWinInThisDownDiagonal(board, r, c)) {
                return true;
            }
        }
        return false;
    }

    isWinInThisDownDiagonal(board, r, c) {
        let inARow = 0;
        while (!(r >= this.height) && !(c >= this.width)) {
            if ((c == 0 || r == 0) && this.hasToken(board, r, c)) {
                inARow = 1;
            }
            else if (this.hasToken(board, r, c) && board[r - 1][c - 1] != board[r][c]) {
                inARow = 1;
            }
            else if (this.hasToken(board, r, c) && board[r - 1][c - 1] == board[r][c]) {
                inARow++;
            }
            else {
                inARow = 0;
            }
            if (inARow == 4) {
                return true;
            }
            r++;
            c++;
        }
        return false;
    }
}

function draw() {

}

window.addEventListener('resize', event => {
    resetSim();
});

function drawBackground() {
    ctx.beginPath();
    ctx.fillStyle = BLUE;
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.closePath();
}

function drawCircle(p, r, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fill()
    ctx.closePath();
}

function drawBoard() {
    drawBackground();
    var vspacing = height / 6;
    var hspacing = width / 7;
    var radius = 50;
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            let color;
            switch(board.board[r][c]) {
                case "-": color = WHITE; break;
                case "X": color = RED; break;
                case "O": color = YELLOW; break;
            }
            drawCircle([c * hspacing + hspacing / 2, r * vspacing + vspacing / 2], radius, color);
        }
    }
}

function deepCopy(inputArray) {
	const copy = [];
	inputArray.forEach((item) => {
		if (Array.isArray(item)) {
			copy.push(deepCopy(item));
		} else {
			copy.push(item);
		}
	});
	return copy;
}

function play1() {
    board.dropInColumn(0);
    drawBoard();
    if (!board.getValidMoves().includes(1)) {
        disableElement("column1");
    }
}

function play2() {
    board.dropInColumn(1);
    drawBoard();
    if (!board.getValidMoves().includes(2)) {
        disableElement("column2");
    }
}

function play3() {
    board.dropInColumn(2);
    drawBoard();
    if (!board.getValidMoves().includes(3)) {
        disableElement("column3");
    }
}

function play4() {
    board.dropInColumn(3);
    drawBoard();
    if (!board.getValidMoves().includes(4)) {
        disableElement("column4");
    }
}

function play5() {
    board.dropInColumn(4);
    drawBoard();
    if (!board.getValidMoves().includes(5)) {
        disableElement("column5");
    }
}

function play6() {
    board.dropInColumn(5);
    drawBoard();
    if (!board.getValidMoves().includes(6)) {
        disableElement("column6");
    }
}

function play7() {
    board.dropInColumn(6);
    drawBoard();
    if (!board.getValidMoves().includes(7)) {
        disableElement("column7");
    }
}

function disableElement(idname) {
    let elem = document.getElementById(idname);
    elem.disabled = true;
}

function disableControls() {
    let controlDiv = document.getElementById("controls");
    document.getElementById("feedback").innerHTML = board.isDraw() ? "Draw!" : "Player "+(board.turnNumber % 2 +1)+ " Wins!";
    Array.from(controlDiv.children).forEach((element) => {
        if (element.id != "home" && element.id != "reset") {
            element.disabled = true; 
        }
    });
}

function enableControls() {
    let controlDiv = document.getElementById("controls");
    document.getElementById("feedback").innerHTML = "";
    Array.from(controlDiv.children).forEach((element) => {
         element.disabled = false; 
    });
}

function resetSim() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    let aiFirst = document.getElementById("aifirst").checked ? 0 : 1;
    board = new Connect4Gameboard();
    ai = new Connect4AIAgent(board, aiFirst);

    enableControls();

    drawBoard();
}

var board = new Connect4Gameboard();
var ai = new Connect4AIAgent(board, 0);

resetSim();