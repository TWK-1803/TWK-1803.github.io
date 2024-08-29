const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();
canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;
ctx.font = "48px serif";

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

function sample(array, x) {
    // Shuffle the array
    const shuffledArray = array.sort(() => 0.5 - Math.random());
    // Return the first x elements
    return shuffledArray.slice(0, x);
}

var possible_cards = [
    "Ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "10c", "Jc", "Qc", "Kc",
    "Ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "Jh", "Qh", "Kh",
    "As", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "10s", "Js", "Qs", "Ks",
    "Ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "10d", "Jd", "Qd", "Kd"
];

const cardsize = 100;
const num_piles = 3;
const cards_per_pile = 7;
var order = 2;
const total_cards = num_piles*cards_per_pile;
const validColumns = ["1", "2", "3"];
var coords = [];
var cards = sample(possible_cards, total_cards)
var selections = [];
var last_selection = false;
for (let i = 0; i < num_piles; i++) {
    for (let j = 0; j < cards_per_pile; j++) {
        coords.push([i+1]);
    }
}

function moveSlice(arr, fromIndex, toIndex, sliceLength) {
    const slice = arr.splice(fromIndex, sliceLength);
    arr.splice(toIndex, 0, ...slice);
    return arr;
}

function removeDuplicates(arr) {
    return arr.filter((item, index) => 
        index === arr.findIndex(other => 
            JSON.stringify(item) === JSON.stringify(other)
        )
    );
}

// def moveSlice(arr, start, end, new_index):
//     slice_to_move = arr[start:end]
//     arr = arr[:start] + arr[end:]
//     arr = arr[:new_index] + slice_to_move + arr[new_index:]
//     return arr

function drawHeart(x, y, size) {
    ctx.beginPath();
    ctx.fillStyle = "#FF0000"
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size / 2, x - size / 2, y - size / 2, x - size / 2, y);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size / 2, x, y + size);
    ctx.bezierCurveTo(x, y + size / 2, x + size / 2, y + size / 2, x + size / 2, y);
    ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y - size / 2, x, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000000"
}

function drawDiamond(x, y, size) {
    ctx.beginPath();
    ctx.fillStyle = "#FF0000"
    ctx.moveTo(x, y - size / 3);
    ctx.lineTo(x - size / 2, y + size / 3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x + size / 2, y + size / 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000000"
}

function drawClub(x, y, size) {
    ctx.beginPath();
    ctx.fillStyle = "#000000"
    ctx.moveTo(x + size / 18, y + size / 3);
    ctx.lineTo(x + size / 6, y + size);
    ctx.lineTo(x - size / 6, y + size);
    ctx.lineTo(x - size / 18, y + size / 3);
    ctx.arc(x - size / 4, y + size / 3, size / 3, 0, Math.PI * 2);
    ctx.arc(x, y, size / 3, 0, Math.PI * 2);
    ctx.arc(x + size / 4, y + size / 3, size / 3, 0, Math.PI * 2);
    ctx.closePath()
    ctx.fill()
}

function drawSpade(x, y, size) {
    ctx.beginPath();
    ctx.fillStyle = "#000000"
    ctx.moveTo(x, y + size / 3);
    ctx.bezierCurveTo(x, y + 5 * size / 6, x - size / 2, y + 5 * size / 6, x - size / 2, y + size / 3);
    ctx.bezierCurveTo(x - size / 2, y - size / 6, x, y - size / 6, x, y - 2 * size / 3);
    ctx.bezierCurveTo(x, y - size / 6, x + size / 2, y - size / 6, x + size / 2, y + size / 3);
    ctx.bezierCurveTo(x + size / 2, y + 5 * size / 6, x, y + 5 * size / 6, x, y + size / 3);
    ctx.lineTo(x + size / 6, y + size);
    ctx.lineTo(x - size / 6, y + size);
    ctx.lineTo(x, y + size / 3);
    ctx.fill();
}

function drawCardTop(x, y, card) {
    ctx.beginPath();
    ctx.strokeStyle = "#000000"
    ctx.moveTo(x - cardsize / 1.5, y - cardsize / 3);
    ctx.lineTo(x + cardsize / 1.5, y - cardsize / 3);
    ctx.lineTo(x + cardsize / 1.5, y + cardsize / 3);
    ctx.lineTo(x - cardsize / 1.5, y + cardsize / 3);
    ctx.lineTo(x - cardsize / 1.5, y - cardsize / 3);
    ctx.stroke()
    if (card.length == 2) {
        switch(card[1]){
            case "d": drawDiamond(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "c": drawClub(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "s": drawSpade(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "h": drawHeart(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            default: break;
        }
        ctx.fillText(card[0], x - cardsize / 1.6, y + cardsize / 6);
    }
    else {
        switch(card[2]){
            case "d": drawDiamond(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "c": drawClub(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "s": drawSpade(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "h": drawHeart(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            default: break;
        }
        ctx.fillText(card[0]+card[1], x - cardsize / 1.6, y + cardsize / 6);
    }
}

function drawFullCard(x, y, card) {
    ctx.beginPath();
    ctx.strokeStyle = "#000000"
    ctx.moveTo(x - cardsize / 1.5, y - cardsize / 3);
    ctx.lineTo(x + cardsize / 1.5, y - cardsize / 3);
    ctx.lineTo(x + cardsize / 1.5, y + 1.5 * cardsize);
    ctx.lineTo(x - cardsize / 1.5, y + 1.5 * cardsize);
    ctx.lineTo(x - cardsize / 1.5, y - cardsize / 3);
    ctx.stroke()
    if (card.length == 2) {
        switch(card[1]){
            case "d": drawDiamond(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "c": drawClub(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "s": drawSpade(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "h": drawHeart(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            default: break;
        }
        ctx.fillText(card[0], x - cardsize / 1.6, y + cardsize / 6);
    }
    else {
        switch(card[2]){
            case "d": drawDiamond(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "c": drawClub(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "s": drawSpade(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            case "h": drawHeart(x + cardsize / 2.25, y - cardsize / 10, cardsize / 3); break;
            default: break;
        }
        ctx.fillText(card[0]+card[1], x - cardsize / 1.6, y + cardsize / 6);
    }
}

function drawCards() {
    ctx.clearRect(0, 0, width, height)
    for (let i = 0; i < num_piles; i++) {
        for (let j = 0; j < cards_per_pile - 1; j++) {
            drawCardTop((i + 1) * width / num_piles - width / num_piles / 2, (j + 1) * 2 * cardsize / 3 + cardsize / 2, cards[i * cards_per_pile + j])
        }
    }
    for (let i = 0; i < num_piles; i++) {
        drawFullCard((i + 1) * width / num_piles - width / num_piles / 2, (cards_per_pile) * 2 * cardsize / 3 + cardsize / 2, cards[i * cards_per_pile + cards_per_pile - 1])
    }
}

window.addEventListener('resize', event => {
    reset();
});

function disableControls() {
    let controlDiv = document.getElementById("controls");
    Array.from(controlDiv.children).forEach((element) => {
        if (element.id != "home" && element.id != "reset") {
            element.disabled = true;
        }
    });
}

function enableControls() {
    let controlDiv = document.getElementById("controls");
    Array.from(controlDiv.children).forEach((element) => {
        if (element.id != "home" && element.id != "reset") {
            element.disabled = false;
        }
    });
}

function pick1() {
    trick("1");
}

function pick2() {
    trick("2");
}

function pick3() {
    trick("3");
}

function reset() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;
    ctx.font = "48px serif";

    document.getElementById("feedback").innerHTML = "Pick a card and select the column it is in below.";

    order = parseInt(sample(validColumns, 1)[0], 10);
    coords = [];
    cards = sample(possible_cards, total_cards);
    selections = [];
    last_selection = false;
    for (let i = 0; i < num_piles; i++) {
        for (let j = 0; j < cards_per_pile; j++) {
            coords.push([i+1]);
        }
    }
    drawCards();
}

function trick(column) {
    let selection = column;
    let s = parseInt(selection, 10);
    selections.push(s);
    let visit_order = [];
    for (let i = 0; i < total_cards; i++){
        visit_order.push(i);
    }
    if (s != order) {
        visit_order = moveSlice(visit_order, (s-1)*cards_per_pile, (order-1)*cards_per_pile, cards_per_pile);
    }
    let temp = [];
    let tempc = [];
    for (let i = 0; i < total_cards; i++){
        temp.push([]);
        tempc.push("");
    }
    let index = 0;
    let count = 0;
    while (index < total_cards-1) {
        temp[index] = [...coords[visit_order[count]], count%num_piles + 1];
        tempc[index] = cards[visit_order[count]];
        index = index+cards_per_pile == total_cards-1 ? total_cards-1 : (index+cards_per_pile)%(total_cards-1);
        count++;
    }
    temp[index] = [...coords[visit_order[count]], count%num_piles + 1];
    tempc[index] = cards[visit_order[count]];
    let selectionIndex = temp.findIndex(e => JSON.stringify(selections) === JSON.stringify(e.slice(0, e.length - 1)));
    if (selectionIndex == -1) {
        document.getElementById("feedback").innerHTML = "Not Possible. Try again.";
        selections = selections.slice(0, selections.length - 1);
    }
    else {
        coords = temp.slice(0);
        cards = tempc.slice(0);
        if (last_selection) {
            document.getElementById("feedback").innerHTML = "Your card is the...";
            ctx.clearRect(0, 0, width, height);
            drawFullCard(width / 2, height / 2 - cardsize, cards[selectionIndex]);
        }
        else {
            if (removeDuplicates(coords).length == coords.length) {
                last_selection = true;
            }
            document.getElementById("feedback").innerHTML = "Select the column that your card is in now.";
            ctx.clearRect(0, 0, width, height);
            drawCards();
        }
        
        // let selectionIndex = cards.findIndex(e => JSON.stringify(b) === JSON.stringify(e))
        // selectionIndex = next((i for i, t in enumerate(temp) if t[:len(selections)] == selections), -1)
    }
}

drawCards();