const BLACK = "#141414";
const GRAY = "#777777";


const canvasDiv = document.getElementById("canvas");
const worldcanvas = document.getElementById("myCanvas");
const destctx = worldcanvas.getContext("2d");

const imgcanvas = document.getElementById("loadedimg");
const sourcectx = imgcanvas.getContext("2d", { willReadFrequently : true });

worldcanvas.width = canvasDiv.clientWidth;
worldcanvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

const NORTH = 0;
const EAST  = 1;
const SOUTH = 2;
const WEST  = 3;
var TILESIZE = parseInt(document.getElementById("tilesize").value, 10);     // Measured in pixels
var WORLD_X = Math.floor(width/TILESIZE);                                   // Measured in tiles
var WORLD_Y = Math.floor(height/TILESIZE);
const STOP_THRESHOLD = 15;                                                  // Number of short resets before failing out
const MAX_IMG_WIDTH = 500;
const MAX_IMG_HEIGHT = 500;

var world;
var doneGenerating = false;
var isRunning = true
var IMAGE_X;
var IMAGE_Y;
var tileData;
var tileSprites;
var tileWeights;
var tileRules;

document.getElementById('imageLoader').addEventListener('change', function (e) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            if ((img.height <= MAX_IMG_HEIGHT && img.width <= MAX_IMG_WIDTH) && (img.height > TILESIZE && img.width > TILESIZE)) { 
                document.getElementById("feedback").innerHTML = "";
                imgcanvas.width = img.width;
                imgcanvas.height = img.height;
                sourcectx.drawImage(img, 0, 0); // Draw the image onto the canvas
                IMAGE_X = Math.floor(img.width/TILESIZE);
                IMAGE_Y = Math.floor(img.height/TILESIZE);
                resetSim();
            }
            else if (img.height < TILESIZE || img.width < TILESIZE) {
                document.getElementById("feedback").innerHTML = "Tile size larger than input image dimension";
                document.getElementById('imageLoader').value = '';
            }
            else {
                document.getElementById("feedback").innerHTML = "Image too large";
                document.getElementById('imageLoader').value = '';
            }
        }
    }
    reader.readAsDataURL(e.target.files[0]);
});

// Not my implementation
var sha256 = function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value>>>amount) | (value<<(32 - amount));
    };
    
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j; // Used as a counter across the whole file
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty]*8;
    
    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = sha256.h = sha256.h || [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];
    /*/
    var hash = [], k = [];
    var primeCounter = 0;
    //*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
            k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
        }
    }
    
    ascii += '\x80' //.push Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j>>8) return; // ASCII check: only accept characters in range 0-255
        words[i>>2] |= j << ((3 - i)%4)*8;
    }
    words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
    words[words[lengthProperty]] = (asciiBitLength)
    
    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);
        
        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            // Used below if 
            var w15 = w[i - 15], w2 = w[i - 2];

            // Iterate
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                + ((e&hash[5])^((~e)&hash[6])) // ch
                + k[i]
                // Expand the message schedule if needed
                + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
                    )|0
                );
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
            
            hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1)|0;
        }
        
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i])|0;
        }
    }
    
    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i]>>(j*8))&255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
};

function toHexString(bytes) {
    return Array.from(bytes, (byte) => {
        return ('0' + (byte & 0xff).toString(16)).slice(-2);
    }).join('');
}

function getHashData(x, y) {
    let imageData = sourcectx.getImageData(x, y, TILESIZE, TILESIZE);
    let buffer = new Uint8Array(imageData.data.buffer);
    return sha256(toHexString(buffer));
}


//Pull subset of pixels from the larger picture, assuming tilesize, and hash them to allow for easy comparisons between tiles
function getTileHashAtXY(c, r) {
    return getHashData(c*TILESIZE, r*TILESIZE);
}

// Find the valid adjacencies
function getNeighbors(c, r) {
    let neighbors = [[],[],[],[]];
    if (r > 0) {
        neighbors[NORTH].push(getTileHashAtXY(c, r-1));
    }
    if (c < IMAGE_X - 1) {
        neighbors[EAST].push(getTileHashAtXY(c+1, r));
    }
    if (r < IMAGE_Y - 1) {
        neighbors[SOUTH].push(getTileHashAtXY(c, r+1));
    }
    if (c > 0) {
        neighbors[WEST].push(getTileHashAtXY(c-1, r));
    }
    return neighbors;
}

// Break the input into tiles and generate the rules to govern the WFC
function generateTileData() {
    let tileSprites = {};
    let tileWeights = {};
    let tileRules = {};

    for (let r = 0; r < IMAGE_Y; r++) {
        for (let c = 0; c < IMAGE_X; c++) {
            let hash = getTileHashAtXY(c, r);
            if (!(hash in tileSprites)) {
                tileSprites[hash] = [c*TILESIZE, r*TILESIZE];
                tileWeights[hash] = 1;
                tileRules[hash] = getNeighbors(c, r);
            }
            else {
                tileWeights[hash]++;
                let neighbors = getNeighbors(c, r);
                for (let i = 0; i < neighbors.length; i++) {
                    if (neighbors[i].length != 0 && !(tileRules[hash][i].includes(neighbors[i][0]))) {
                        tileRules[hash][i].push(neighbors[i][0]);
                    }
                }
            }
        }
    }

    return [tileSprites, tileWeights, tileRules]
}

function tilesizeChange() {
    t = document.getElementById("tilesize").value;

    if (t == "" || t < 5){
        document.getElementById("tilesize").value = 5;
    }
    else if (t > 500){
        document.getElementById("tilesize").value = 500;
    }
    TILESIZE = parseInt(document.getElementById("tilesize").value, 10);
}

function weightedChoice(items, weights) {
    var i;

    for (i = 1; i < weights.length; i++)
        weights[i] += weights[i - 1];
    
    var random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return [items[i]];
}

function drawRectangle(p, color) {
    destctx.beginPath();
    destctx.fillStyle = color;
    destctx.moveTo(p[0], p[1]);
    destctx.lineTo(p[0]+TILESIZE, p[1]);
    destctx.lineTo(p[0]+TILESIZE, p[1]+TILESIZE);
    destctx.lineTo(p[0], p[1]+TILESIZE);
    destctx.lineTo(p[0], p[1]);
    destctx.fill();
    destctx.closePath();
}

class Stack {
    constructor() {
        this.items = [];
    }

    is_empty() {
        return this.items.length == 0;
    }

    push(item) {
        this.items.push(item);
    }

    pop() { 
        if (!this.is_empty()) {
            return this.items.pop();
        }
        else {
            throw "pop from empty stack";
        }
    }

    size() {
        return this.items.length;
    }
}
        
class Tile {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.possibilities = Object.keys(tileRules);
        this.entropy = this.possibilities.length;
        this.neighbours = {};
    }

    addNeighbour(direction, tile) {
        this.neighbours[direction] = tile;
    }

    getNeighbour(direction) {
        return this.neighbours[direction];
    }

    getDirections() {
        return Object.keys(this.neighbours);
    }

    getPossibilities() {
        return this.possibilities;
    }

    collapse() {
        let weights = this.possibilities.map(possibility => tileWeights[possibility]);
        this.possibilities = weightedChoice(this.possibilities, weights);
        this.entropy = 0;
    }

    constrain(neighbourPossibilities, direction) {
        let reduced = false;

        if (this.entropy > 0) {
            let connectors = [[]];
            neighbourPossibilities.forEach(neighbourPossibility => {
                connectors.push(tileRules[neighbourPossibility][direction]);
            });

            if (connectors != [[]]) {
                [...this.possibilities].forEach(possibility => {
                    let found = false;
                    connectors.forEach(connector => {
                        if (connector.includes(possibility)) {
                            found = true;
                        }
                    });
                    if (!found) { 
                        let idx = this.possibilities.indexOf(possibility);
                        this.possibilities.splice(idx, 1);
                        reduced = true;
                    }
    
                });
            }
            else {
                this.possibilities = Object.keys(tileRules);
            }
            this.entropy = this.possibilities.length;
        }
        return reduced;
    }
    
    reset() {
        this.possibilities = Object.keys(tileRules);
        this.entropy = this.possibilities.length;
    }
}

class World {

    constructor(sizeX, sizeY) {
        this.cols = sizeX;
        this.rows = sizeY;

        this.numresets = 0;
        this.resetcounter = 0;

        this.tileRows = [];
        for (let y = 0; y < this.rows; y++) {
            let tiles = [];
            for (let x = 0; x < this.cols; x++) {
                let tile = new Tile(x, y);
                tiles.push(tile);
            }
            this.tileRows.push(tiles);
        }

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (y > 0) {
                    this.tileRows[y][x].addNeighbour(NORTH, this.tileRows[y - 1][x]);
                }
                if (x < this.cols - 1) {
                    this.tileRows[y][x].addNeighbour(EAST, this.tileRows[y][x + 1]);
                }
                if (y < this.rows - 1) {
                    this.tileRows[y][x].addNeighbour(SOUTH, this.tileRows[y + 1][x]);
                }
                if (x > 0) {
                    this.tileRows[y][x].addNeighbour(WEST, this.tileRows[y][x - 1]);
                }
            }
        }
    }

    getEntropy(x, y) {
        return this.tileRows[y][x].entropy;
    }

    getType(x, y) {
        return this.tileRows[y][x].possibilities[0];
    }

    getLowestEntropy() {
        let lowestEntropy = Object.keys(tileRules).length;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let tileEntropy = this.tileRows[y][x].entropy;
                if (tileEntropy > 0) {
                    if (tileEntropy < lowestEntropy) {
                        lowestEntropy = tileEntropy;
                    }
                }
            }
        }
        return lowestEntropy;
    }

    getTilesLowestEntropy() {
        let lowestEntropy = Object.keys(tileRules).length;
        let tileList = [];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let tileEntropy = this.tileRows[y][x].entropy;
                if (tileEntropy > 0) {
                    if (tileEntropy < lowestEntropy) {
                        tileList = [];
                        lowestEntropy = tileEntropy;
                    }
                    if (tileEntropy == lowestEntropy) {
                        tileList.push(this.tileRows[y][x]);
                    }
                }
            }
        }
        return tileList;
    }

    waveFunctionCollapse() {
        let tilesLowestEntropy = this.getTilesLowestEntropy();

        if (tilesLowestEntropy.length == 0) {
            return 0;
        }

        let tileToCollapse = tilesLowestEntropy[Math.floor(Math.random() * tilesLowestEntropy.length)];
        tileToCollapse.collapse();

        let stack = new Stack();
        stack.push(tileToCollapse);

        while(!stack.is_empty()) {
            let tile = stack.pop();
            let tilePossibilities = tile.getPossibilities();
            let directions = tile.getDirections();

            directions.forEach(direction => {
                let neighbour = tile.getNeighbour(direction);
                if (neighbour.entropy != 0) {
                    let reduced = neighbour.constrain(tilePossibilities, direction);
                    if (reduced && !(stack.items.includes(neighbour))) {
                        stack.push(neighbour);    // When possibilities were reduced need to propagate further
                    }
                }
            });
        }
        this.resetcounter++;
        return 1;
    }

    draw() {
        destctx.clearRect(0, 0, worldcanvas.width, worldcanvas.height);

        let lowest_entropy = this.getLowestEntropy();
        for (let y = 0; y < WORLD_Y; y++) {
            for (let x = 0; x < WORLD_X; x++) {
                let tile_entropy = this.getEntropy(x, y);
                let tile_type = this.getType(x, y);
                if (!tile_type) {
                    this.reset();
                    this.draw();
                }
                else if (tile_entropy > 0) {
                    if (tile_entropy == lowest_entropy) {
                        drawRectangle([x*TILESIZE, y*TILESIZE], GRAY);
                    }
                    else {
                        drawRectangle([x*TILESIZE, y*TILESIZE], BLACK);
                    }
                }
                else {
                    let pos = tileSprites[tile_type];
                    destctx.drawImage(imgcanvas, pos[0], pos[1], TILESIZE, TILESIZE, x*TILESIZE, y*TILESIZE, TILESIZE, TILESIZE);
                }
            }
        }
    }
    
    reset() {   
        for (let r = 0; r < this.tileRows.length; r++) {
            for (let c = 0; c < this.tileRows[0].length; c++) {
                this.tileRows[r][c].reset();
            }
        }

        this.numresets += this.resetcounter <= 2 ? 1 : 0;
        this.resetcounter = 0;
    }
}

function resetSim() {
    worldcanvas.width = canvasDiv.clientWidth;
    worldcanvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    TILESIZE = parseInt(document.getElementById("tilesize").value, 10);     // Measured in pixels
    WORLD_X = Math.floor(width/TILESIZE);                                 // Measured in tiles
    WORLD_Y = Math.floor(height/TILESIZE);

    doneGenerating = false;
    isRunning = true;
    tileData = generateTileData();
    tileSprites = tileData[0];
    tileWeights = tileData[1];
    tileRules = tileData[2];
    world = new World(WORLD_X, WORLD_Y);

    mainLoop();
}

function updateSim() {
    result = world.waveFunctionCollapse();
    if (result == 0) {
        doneGenerating = true;
    }
    
    if (world.numresets > STOP_THRESHOLD) {
        document.getElementById("feedback").innerHTML = "Tileset reset too often with little progress. Unlikely to resolve";
        isRunning = false;
    }
    world.draw();
}

function mainLoop() {
    if( document.getElementById('imageLoader').value != '') {
        if (isRunning && !doneGenerating) {
            updateSim();
        }
        requestAnimationFrame(mainLoop);
    }
}

mainLoop();