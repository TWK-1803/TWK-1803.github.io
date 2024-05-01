// This was some minor cleanup done to the program, but for the most part, for archival reasons,
// this will largely function as the original version did even if that doesn't make it clean or readable.

const canvas = document.getElementById("myCanvas");
const canvasDiv = document.getElementById("canvas");
var ctx = canvas.getContext("2d");	
canvas.focus();

canvas.width = canvasDiv.clientWidth;
canvas.height = canvasDiv.clientHeight;

var width = canvasDiv.clientWidth;
var height = canvasDiv.clientHeight;

const d = 1500;
const MAXDISTANCE = d;
const Ia = 0.3;
const Ip = 0.7;
const Kd = 0.75;
const Ks = 0.25;
const SpecIndex = 4;
const L = [1, 1, -1];
const V = [0, 0, -d];

var zbuffer = [];

for (let r = 0; r < width; r++) {
    let tmp = [];
    for (let c = 0; c < height; c++) {
        tmp.push(MAXDISTANCE);
    }
    zbuffer.push(tmp);
}

var mode = 1;

var front1, front2, front3, front4, front5, front6, front7, front8, back1, back2, back3, back4, back5, back6, back7, back8;
var northpoly, northeastpoly, eastpoly, southeastpoly, southpoly, southwestpoly, westpoly, northwestpoly, frontpoly, backpoly;
var Cyclinder, CyclinderPointCloud, CyclinderColor, DefaultCylinderPointCloud;

// ***************************** Initialize Object ***************************

function resetPoints() {
    // Definition of the cylinder's 16 underlying points
    front1 = [-50, 120.7107, 50];
    front2 = [50, 120.7107, 50];
    front3 = [120.7107, 50, 50];
    front4 = [120.7107, -50, 50];
    front5 = [50, -120.7107, 50];
    front6 = [-50, -120.7107, 50];
    front7 = [-120.7107, -50, 50];
    front8 = [-120.7107, 50, 50];
    back1 = [-50, 120.7107, 450];
    back2 = [50, 120.7107, 450];
    back3 = [120.7107, 50, 450];
    back4 = [120.7107, -50, 450];
    back5 = [50, -120.7107, 450];
    back6 = [-50, -120.7107, 450];
    back7 = [-120.7107, -50, 450];
    back8 = [-120.7107, 50, 450];

    // Definition of all polygon faces using the meaningful point names
    // Polys are defined in clockwise order when viewed from the outside

    northpoly = [front1, back1, back2, front2];
    northeastpoly = [front2, back2, back3, front3];
    eastpoly = [front3, back3, back4, front4];
    southeastpoly = [front4, back4, back5, front5];
    southpoly = [front5, back5, back6, front6];
    southwestpoly = [front6, back6, back7, front7];
    westpoly = [front7, back7, back8, front8];
    northwestpoly = [front8, back8, back1, front1];
    frontpoly = [front1, front2, front3, front4, front5, front6, front7, front8];
    backpoly = [back1, back8, back7, back6, back5, back4, back3, back2];

    // Definition of object and coloring of each polygon
    Cylinder = [northpoly, northeastpoly, eastpoly, southeastpoly, southpoly, southwestpoly, westpoly, northwestpoly, frontpoly, backpoly];
    CylinderColor = ["black", "red", "green", "blue", "yellow", "white", "gray", "orange", "purple", "cyan"];

    // Definition of underlying point cloud. No structure, just the points.
    CylinderPointCloud = [front1, front2, front3, front4, front5, front6, front7, front8, back1, back2, back3, back4, back5, back6, back7, back8];

    DefaultCylinderPointCloud = deepCopy(CylinderPointCloud);

    // List of all relevant object data in the scene
    SceneData = [Cylinder, CylinderPointCloud, DefaultCylinderPointCloud, CylinderColor];
}

// *************************Helper/Calculation Functions*************************************************

function reflect(Normal, Light) {
    let R = [];
    let N = normalize(Normal);
    let L = normalize(Light);
    let twoCosPhi = 2 * (N[0] * L[0] + N[1] * L[1] + N[2] * L[2]);
    let topush;
    if (twoCosPhi > 0) {
        for (let i = 0; i < 3; i++) {
            R.push(N[i] - (L[i] / twoCosPhi));
        }
    }
    else if (twoCosPhi == 0) {
        for (let i = 0; i < 3; i++) {
            R.push(-L[i])
        }
    }
    else {
        for (let i = 0; i < 3; i++) {
            R.push(-N[i] + (L[i] / twoCosPhi));
        }
    }
    return normalize(R);
}

function triColorHexCode(ambient, diffuse, specular) {
    let combinedColorCode = colorHexCode(ambient + diffuse + specular);
    let specularColorCode = colorHexCode(specular);
    let colorString = "#" + specularColorCode + combinedColorCode + specularColorCode;
    return colorString;
}

function colorHexCode(intensity) {
    let hexString = Math.round(255 * intensity).toString(16);
    let trimmedHexString;
    if (hexString[0] == "-") {
        trimmedHexString = "00";
    }
    else {
        trimmedHexString = hexString.substring(0,2);
        if (trimmedHexString.length == 1) {
            trimmedHexString = "0" + trimmedHexString;
        }
    }
    return trimmedHexString;
}

function getIntensity(Ia, Ip, Kd, Ks, SpecIndex, N, L, V) {
    let ambient = Ia * Kd;
    let NdotL = N[0] * L[0] + N[1] * L[1] + N[2] * L[2];
    if (NdotL < 0) {
        NdotL = 0;
    }
    let diffuse = Ip * Kd * NdotL;
    let R = reflect(N, L);
    let RdotV = R[0] * V[0] + R[1] * V[1] + R[2] * V[2];
    if (RdotV < 0) {
        RdotV = 0;
    }
    let specular = Ip * Ks * Math.pow(RdotV, SpecIndex);
    return [ambient, diffuse, specular]
}

function normalize(vector) {
    let normalizedVector = [0, 0, 0];
    let magnitude = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2) + Math.pow(vector[2], 2));
    for (let i = 0; i < 3; i++) {
        normalizedVector[i] = vector[i] / magnitude;
    }
    return normalizedVector;
}

function getNormal(poly) {
    let P = [0, 0, 0];
    let Q = [0, 0, 0];
    let N = [0, 0, 0];
    let P0 = poly[0];
    let P1 = poly[1];
    let P2 = poly[2];
    for (let i = 0; i < 3; i++) {
        P[i] = P1[i] - P0[i];
        Q[i] = P2[i] - P0[i];
    }
    N[0] = P[1] * Q[2] - P[2] * Q[1];
    N[1] = P[2] * Q[0] - P[0] * Q[2];
    N[2] = P[0] * Q[1] - P[1] * Q[0];
    return normalize(N);
}

function isVisible(poly) {
    let N = getNormal(poly);
    let ABC = N[0] * V[0] + N[1] * V[1] + N[2] * V[2];
    let D = N[0] * poly[0][0] + N[1] * poly[0][1] + N[2] * poly[0][2];

    return (ABC - D) > 0;
}

function getReference(current) {
    let xmax = current[0][0];
    let xmin = current[0][0];
    let ymax = current[0][1];
    let ymin = current[0][1];
    let zmax = current[0][2];
    let zmin = current[0][2];
    current.forEach(point => {
        if (point[0] >= xmax) 
            xmax = point[0]
        if (point[0] <= xmin)
            xmin = point[0]
        if (point[1] >= ymax)
            ymax = point[1]
        if (point[1] <= ymin)
            ymin = point[1]
        if (point[2] >= zmax)
            zmax = point[2]
        if (point[2] <= zmin)
            zmin = point[2]
    });
    return [((xmin + xmax) / 2), ((ymin + ymax) / 2), ((zmin + zmax) / 2)];
}

function getVertexNormals(prevpoly, poly, nextpoly) {
    let normal = getNormal(poly);
    let prevNormal = getNormal(prevpoly);
    let nextNormal = getNormal(nextpoly);
    let vertexNormals = [];
    
    poly.forEach(vertex => {
        let vertexNormal = [0, 0, 0];
        if (prevpoly.includes(vertex)) {
            for (let i = 0; i < 3; i++) {
                vertexNormal[i] = prevNormal[i] + normal[i];
            }
        }
        else {
            for (let i = 0; i < 3; i++) {
                vertexNormal[i] = nextNormal[i] + normal[i];
            }
        }
        vertexNormals.push(normalize(vertexNormal));
    });
    return vertexNormals
}

function generateEdgeTable(prevpoly, prevpoly2, poly, poly2, nextpoly, nextpoly2) {
    let edgeTable = [];
    let polyPoints = poly;
    let visited = [];
    let vertexNormals = getVertexNormals(prevpoly2, poly2, nextpoly2);

    while (polyPoints.length - visited.length >= 2) {
        let Ymin = height;
        let indx = 0;
        polyPoints.forEach(elem => {
            if (elem[1] < Ymin && !visited.includes(elem)) {
                Ymin = elem[1];
                indx = polyPoints.indexOf(elem);
            }
        });

        let Xstart1 = polyPoints[indx][0];
        let Xend1 = polyPoints[(indx + 1) % polyPoints.length][0];
        let Ystart1 = polyPoints[indx][1];
        let Yend1 = polyPoints[(indx + 1) % polyPoints.length][1];
        let Zstart1 = polyPoints[indx][2];
        let Zend1 = polyPoints[(indx + 1) % polyPoints.length][2];
        let Istart1 = getIntensity(Ia, Ip, Kd, Ks, SpecIndex, vertexNormals[indx], normalize(L), normalize(V));
        let Iend1 = getIntensity(Ia, Ip, Kd, Ks, SpecIndex, vertexNormals[(indx + 1) % vertexNormals.length], normalize(L), normalize(V));
        let Nxstart1 = vertexNormals[indx][0];
        let Nxend1 = vertexNormals[(indx + 1) % vertexNormals.length][0];
        let Nystart1 = vertexNormals[indx][1];
        let Nyend1 = vertexNormals[(indx + 1) % vertexNormals.length][1];
        let Nzstart1 = vertexNormals[indx][2];
        let Nzend1 = vertexNormals[(indx + 1) % vertexNormals.length][2];

        let Xstart2 = polyPoints[indx][0];
        let Xend2 = polyPoints[((indx - 1) % polyPoints.length + polyPoints.length) % polyPoints.length][0];
        let Ystart2 = polyPoints[indx][1];
        let Yend2 = polyPoints[((indx - 1) % polyPoints.length + polyPoints.length) % polyPoints.length][1];
        let Zstart2 = polyPoints[indx][2];
        let Zend2 = polyPoints[((indx - 1) % polyPoints.length + polyPoints.length) % polyPoints.length][2];
        let Istart2 = getIntensity(Ia, Ip, Kd, Ks, SpecIndex, vertexNormals[indx], normalize(L), normalize(V));
        let Iend2 = getIntensity(Ia, Ip, Kd, Ks, SpecIndex, vertexNormals[((indx - 1) % vertexNormals.length + vertexNormals.length) % vertexNormals.length], normalize(L), normalize(V));
        let Nxstart2 = vertexNormals[indx][0];
        let Nxend2 = vertexNormals[((indx - 1) % vertexNormals.length + vertexNormals.length) % vertexNormals.length][0];
        let Nystart2 = vertexNormals[indx][1];
        let Nyend2 = vertexNormals[((indx - 1) % vertexNormals.length + vertexNormals.length) % vertexNormals.length][1];
        let Nzstart2 = vertexNormals[indx][2];
        let Nzend2 = vertexNormals[((indx - 1) % vertexNormals.length + vertexNormals.length) % vertexNormals.length][2];

        if  (Ystart1 != Yend1 && !visited.includes(polyPoints[(indx + 1) % polyPoints.length])) {
            let dZ1 = (Zend1 - Zstart1) / (Yend1 - Ystart1);
            let dId1 = (Iend1[1] - Istart1[1]) / (Yend1 - Ystart1);
            let dIs1 = (Iend1[2] - Istart1[2]) / (Yend1 - Ystart1);
            let dNx1 = (Nxend1 - Nxstart1) / (Yend1 - Ystart1);
            let dNy1 = (Nyend1 - Nystart1) / (Yend1 - Ystart1);
            let dNz1 = (Nzend1 - Nzstart1) / (Yend1 - Ystart1);
            let dX1;
            if (Xend1 != Xstart1) {
                dX1 = (Xend1 - Xstart1) / (Yend1 - Ystart1);
            }
            else {
                dX1 = "undefined";
            }
            edgeTable.push([polyPoints[indx], polyPoints[(indx + 1) % polyPoints.length], Xstart1, Ystart1, Yend1, dX1, Zstart1, dZ1,
                            Istart1[1], dId1, Istart1[2], dIs1, Nxstart1, dNx1, Nystart1, dNy1, Nzstart1, dNz1]);
        }

        if (Ystart2 != Yend2 && polyPoints.length - visited.length >= 2 && !visited.includes(polyPoints[((indx - 1) % polyPoints.length + polyPoints.length) % polyPoints.length])) {
            let dZ2 = (Zend2 - Zstart2) / (Yend2 - Ystart2);
            let dId2 = (Iend2[1] - Istart2[1]) / (Yend2 - Ystart2);
            let dIs2 = (Iend2[2] - Istart2[2]) / (Yend2 - Ystart2);
            let dNx2 = (Nxend2 - Nxstart2) / (Yend2 - Ystart2);
            let dNy2 = (Nyend2 - Nystart2) / (Yend2 - Ystart2);
            let dNz2 = (Nzend2 - Nzstart2) / (Yend2 - Ystart2);
            let dX2;
            if (Xend2 != Xstart2) {
                dX2 = (Xend2 - Xstart2) / (Yend2 - Ystart2);
            }
            else {
                dX2 = "undefined";
            }
            edgeTable.push([polyPoints[indx], polyPoints[((indx - 1) % polyPoints.length + polyPoints.length) % polyPoints.length], Xstart2, Ystart2, Yend2, dX2,
                    Zstart2, dZ2, Istart2[1], dId2, Istart2[2], dIs2, Nxstart2, dNx2, Nystart2, dNy2, Nzstart2, dNz2]);
        }
        visited.push(polyPoints[indx]);
    }
    return edgeTable;
}

function project(point) {
    let ps = [];
    point.forEach(coord => {
        ps.push(d * parseInt(coord, 10) / (d + point[2]));
    });
    return ps;
}

function convertToDisplayCoordinates(point) {
    let displayXYZ = []
    displayXYZ.push(parseFloat(Math.round((width / 2) + point[0])));
    displayXYZ.push(parseFloat(Math.round((height / 2) - point[1])));
    displayXYZ.push(point[2]);
    return displayXYZ;
}


// *****************************Transformations**************************************************************

function translate(displacement) {
    for (let i = 0; i < SceneData[1].length; i++) {
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] += displacement[j];
        }
    }
}

function scale(scalefactor) {
    let refPoint = getReference(SceneData[1]);
    for (let i = 0; i < SceneData[1].length; i++) {
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] -= refPoint[j];
        }
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] *= scalefactor;
        }
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] += refPoint[j];
        }
    }
}

function rotateZ(degrees) {
    let refPoint = getReference(SceneData[1]);
    let count = 0;
    for (let i = 0; i < SceneData[1].length; i++) {
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] -= refPoint[j];
        }
    }
    SceneData[1].forEach(point => {
        let rotatedcoords = [];
        let dtor = degrees * (Math.PI / 180);
        rotatedcoords.push(point[0] * Math.cos(dtor) - point[1] * Math.sin(dtor));
        rotatedcoords.push(point[0] * Math.sin(dtor) + point[1] * Math.cos(dtor));
        rotatedcoords.push(point[2]);
        point = rotatedcoords;
        for (let i = 0; i < 3; i++) {
            SceneData[1][count][i] = point[i];
        }
        count++;
    });
    for (let i = 0; i < SceneData[1].length; i++) {
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] += refPoint[j];
        }
    }
}

function rotateY(degrees) {
    let refPoint = getReference(SceneData[1]);
    let count = 0;
    for (let i = 0; i < SceneData[1].length; i++) {
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] -= refPoint[j];
        }
    }
    SceneData[1].forEach(point => {
        let rotatedcoords = [];
        let dtor = degrees * (Math.PI / 180);
        rotatedcoords.push(point[0] * Math.cos(dtor) + point[2] * Math.sin(dtor));
        rotatedcoords.push(point[1]);
        rotatedcoords.push(point[2] * Math.cos(dtor) - point[0] * Math.sin(dtor));
        point = rotatedcoords;
        for (let i = 0; i < 3; i++) {
            SceneData[1][count][i] = point[i];
        }
        count++;
    });
    for (let i = 0; i < SceneData[1].length; i++) {
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] += refPoint[j];
        }
    }
}

function rotateX(degrees) {
    let refPoint = getReference(SceneData[1]);
    let count = 0;
    for (let i = 0; i < SceneData[1].length; i++) {
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] -= refPoint[j];
        }
    }
    SceneData[1].forEach(point => {
        let rotatedcoords = [];
        let dtor = degrees * (Math.PI / 180);
        rotatedcoords.push(point[0]);
        rotatedcoords.push(point[1] * Math.cos(dtor) - point[2] * Math.sin(dtor));
        rotatedcoords.push(point[1] * Math.sin(dtor) + point[2] * Math.cos(dtor));
        point = rotatedcoords;
        for (let i = 0; i < 3; i++) {
            SceneData[1][count][i] = point[i];
        }
        count++;
    });
    for (let i = 0; i < SceneData[1].length; i++) {
        for (let j = 0; j < 3; j++) {
            SceneData[1][i][j] += refPoint[j];
        }
    }
}

// **********************************Draw Scene**************************************************************

function drawLine(p1, p2, color) {
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
    ctx.closePath();
}

function drawScene(mode) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    zbuffer = [];
    for (let r = 0; r < width; r++) {
        let tmp = [];
        for (let c = 0; c < height; c++) {
            tmp.push(MAXDISTANCE);
        }
        zbuffer.push(tmp);
    }

    drawObject(mode, SceneData[0], "red", SceneData[3]);
}

function drawObject(mode, Shape, edgeColor, faceColors) {
    for (let i = 0; i < Shape.length; i++) {
        if (i <= 7) {
            drawPoly(mode,Shape[((i - 1) % 8 + 8) % 8], Shape[i], Shape[((i + 1) % 8 + 8) % 8], edgeColor, faceColors[i]);
        }
        else {
            drawPoly(mode, Shape[i], Shape[i], Shape[i], edgeColor, faceColors[i]);
        }
    }
}

function drawPoly(mode, prevpoly, poly, nextpoly, edgeColor, faceColor) {
    if (isVisible(poly)) {
        fillPoly(mode, prevpoly, poly, nextpoly, edgeColor, faceColor);
    }
}

function fillPoly(mode, prevpoly, poly, nextpoly, edgeColor, faceColor) {
    let fc = faceColor;
    if (mode == 1) {
        for (let i = 0; i < poly.length; i++) {
            let start = convertToDisplayCoordinates(project(poly[i]));
            let end = convertToDisplayCoordinates(project(poly[(i + 1) % poly.length]));
            drawLine([start[0], start[1]], [end[0], end[1]], edgeColor);
        }
        return;
    }

    if (mode == 3) {
        let N = getNormal(poly);
        let intensity = getIntensity(Ia, Ip, Kd, Ks, SpecIndex, N, normalize(L), normalize(V));
        fc = triColorHexCode(intensity[0], intensity[1], intensity[2]);
    }

    let displaycoords = [];
    let prevcoords = [];
    let nextcoords = [];
    for (let i = 0; i < poly.length; i++) {
        displaycoords.push(convertToDisplayCoordinates(project(poly[i])));
        prevcoords.push(convertToDisplayCoordinates(project(prevpoly[i])));
        nextcoords.push(convertToDisplayCoordinates(project(nextpoly[i])));
    }

    let edgeTable = generateEdgeTable(prevcoords, prevpoly, displaycoords, poly, nextcoords, nextpoly);

    if (edgeTable == []) {
        return;
    }

    let firstFillLine;
    let lastFillLine;

    try {
        firstFillLine = edgeTable[0][3];
    }
    catch {
        firstFillLine = 0.0;
    }
    try {
        lastFillLine = edgeTable[edgeTable.length - 1][4];
    }
    catch {
        lastFillLine = height;
    }

    let I = 0;
    let J = 1;
    let Next = 2;
    let EdgeIX = edgeTable[I][2];
    let EdgeIZ = edgeTable[I][6];
    let EdgeIId = edgeTable[I][8];
    let EdgeIIs = edgeTable[I][10];
    let EdgeINx = edgeTable[I][12];
    let EdgeINy = edgeTable[I][14];
    let EdgeINz = edgeTable[I][16];

    let EdgeJX = edgeTable[J][2];
    let EdgeJZ = edgeTable[J][6];
    let EdgeJId = edgeTable[J][8];
    let EdgeJIs = edgeTable[J][10];
    let EdgeJNx = edgeTable[J][12];
    let EdgeJNy = edgeTable[J][14];
    let EdgeJNz = edgeTable[J][16];

    for (let r = parseInt(firstFillLine, 10); r < parseInt(lastFillLine, 10) + 1; r++) {
        let LeftX, LeftZ, LeftId, LeftIs, LeftNx, LeftNy, LeftNz;
        let RightX, RightZ, RightId, RightIs, RightNx, RightNy, RightNz;
        if (EdgeIX < EdgeJX) {
            LeftX = EdgeIX;
            LeftZ = EdgeIZ;
            LeftId = EdgeIId;
            LeftIs = EdgeIIs;
            LeftNx = EdgeINx;
            LeftNy = EdgeINy;
            LeftNz = EdgeINz;

            RightX = EdgeJX;
            RightZ = EdgeJZ;
            RightId = EdgeJId;
            RightIs = EdgeJIs;
            RightNx = EdgeJNx;
            RightNy = EdgeJNy;
            RightNz = EdgeJNz;
        }

        else {
            LeftX = EdgeJX;
            LeftZ = EdgeJZ;
            LeftId = EdgeJId;
            LeftIs = EdgeJIs;
            LeftNx = EdgeJNx;
            LeftNy = EdgeJNy;
            LeftNz = EdgeJNz;

            RightX = EdgeIX;
            RightZ = EdgeIZ;
            RightId = EdgeIId;
            RightIs = EdgeIIs;
            RightNx = EdgeINx;
            RightNy = EdgeINy;
            RightNz = EdgeINz;
        }

        let Z = LeftZ;
        let ambient = Ia * Kd;
        let diffuse = LeftId;
        let specular = LeftIs;
        let Nx = LeftNx;
        let Ny = LeftNy;
        let Nz = LeftNz;

        let dZFillLine, dIdFillLine, dIsFillLine, dNxFillLine, dNyFillLine, dNzFillLine;

        if (RightX - LeftX != 0) {
            dZFillLine = (RightZ - LeftZ) / (RightX - LeftX);
            dIdFillLine = (RightId - LeftId) / (RightX - LeftX);
            dIsFillLine = (RightIs - LeftIs) / (RightX - LeftX);
            dNxFillLine = (RightNx - LeftNx) / (RightX - LeftX);
            dNyFillLine = (RightNy - LeftNy) / (RightX - LeftX);
            dNzFillLine = (RightNz - LeftNz) / (RightX - LeftX);
        }
        else {
            dZFillLine = 0;
            dIdFillLine = 0;
            dIsFillLine = 0;
            dNxFillLine = 0;
            dNyFillLine = 0;
            dNzFillLine = 0;
        }

        for (let c = parseInt(LeftX, 10); c < parseInt(RightX, 10) + 1; c++) {
            try {
                if (Z < zbuffer[r][c]) {
                    if (mode == 4) {
                        fc = triColorHexCode(ambient, diffuse, specular);
                        drawLine([c, r], [c + 1, r], fc);
                    }
                    else if (mode == 5) {
                        let intensity = getIntensity(Ia, Ip, Kd, Ks, SpecIndex, normalize([Nx, Ny, Nz]), normalize(L), normalize(V));
                        fc = triColorHexCode(intensity[0], intensity[1], intensity[2]);
                        drawLine([c, r], [c + 1, r], fc);
                    }
                    else {
                        drawLine([c, r], [c + 1, r], fc);
                    }
                    zbuffer[r][c] = Z;
                }
                Z += dZFillLine;
                diffuse += dIdFillLine;
                specular += dIsFillLine;
                Nx += dNxFillLine;
                Ny += dNyFillLine;
                Nz += dNzFillLine;
            }
            catch { }
        }
        if (edgeTable[I][5] == "undefined") {
            EdgeIX += 0;
        }
        else {
            EdgeIX += edgeTable[I][5];
        }
        if (edgeTable[J][5] == "undefined") {
            EdgeJX += 0;
        }
        else {
            EdgeJX += edgeTable[J][5];
        }

        EdgeIZ += edgeTable[I][7];
        EdgeJZ += edgeTable[J][7];

        EdgeIId += edgeTable[I][9];
        EdgeIIs += edgeTable[I][11];
        EdgeJId += edgeTable[J][9];
        EdgeJIs += edgeTable[J][11];

        EdgeINx += edgeTable[I][13];
        EdgeINy += edgeTable[I][15];
        EdgeINz += edgeTable[I][17];
        EdgeJNx += edgeTable[J][13];
        EdgeJNy += edgeTable[J][15];
        EdgeJNz += edgeTable[J][17];

        if ((r >= edgeTable[I][4]) && (r < lastFillLine)) {
            I = Next;
            EdgeIX = edgeTable[I][2];
            EdgeIZ = edgeTable[I][6];
            EdgeIId = edgeTable[I][8];
            EdgeIIs = edgeTable[I][10];
            EdgeINx = edgeTable[I][12];
            EdgeINy = edgeTable[I][14];
            EdgeINz = edgeTable[I][16];
            Next++;
        }
        if ((r >= edgeTable[J][4]) && (r < lastFillLine)) {
            J = Next;
            EdgeJX = edgeTable[J][2];
            EdgeJZ = edgeTable[J][6];
            EdgeJId = edgeTable[J][8];
            EdgeJIs = edgeTable[J][10];
            EdgeJNx = edgeTable[J][12];
            EdgeJNy = edgeTable[J][14];
            EdgeJNz = edgeTable[J][16];
            Next++;
        }
    }
}

// ****************************Interface/Management******************************************

window.addEventListener('resize', event => {
    reset();
});

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

function setMode() {
    let tmp = document.getElementById("shadingmode").value;
    switch(tmp) {
        case "Wireframe Only": mode = 1; break;
        case "Polygon Shading": mode = 2; break;
        case "Flat Shading": mode = 3; break;
        case "Gouraud Shading": mode = 4; break;
        case "Phong Shading": mode = 5; break;
    }
    drawScene(mode);
}

function reset() {
    canvas.width = canvasDiv.clientWidth;
    canvas.height = canvasDiv.clientHeight;

    width = canvasDiv.clientWidth;
    height = canvasDiv.clientHeight;

    resetPoints();
    drawScene(mode);
}

function larger() {
    scale(1.1);
    drawScene(mode);
}

function smaller() {
    scale(0.9);
    drawScene(mode);
}

function forward() {
    translate([0, 0, 5]);
    drawScene(mode);
}

function backward() {
    translate([0, 0, -5]);
    drawScene(mode);
}

function left() {
    translate([-5, 0, 0]);
    drawScene(mode);
}

function right() {
    translate([5, 0, 0]);
    drawScene(mode);
}

function up() {
    translate([0, 5, 0]);
    drawScene(mode);
}

function down() {
    translate([0, -5, 0]);
    drawScene(mode);
}

function xPlus() {
    rotateX(5);
    drawScene(mode);
}

function xMinus() {
    rotateX(-5);
    drawScene(mode);
}

function yPlus() {
    rotateY(5);
    drawScene(mode);
}

function yMinus() {
    rotateY(-5);
    drawScene(mode);
}

function zPlus() {
    rotateZ(5);
    drawScene(mode);
}

function zMinus() {
    rotateZ(-5);
    drawScene(mode);
}

reset();
drawScene(mode);