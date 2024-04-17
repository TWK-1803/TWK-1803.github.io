// Cursed file. Do not let the front end devs see this garbage.

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textarea = document.getElementById("output");


document.getElementById('imageLoader').addEventListener('change', function (e) {
    var reader = new FileReader();
    reader.onload = function (event) {
      var img = new Image();
      img.src = event.target.result;
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0); // Draw the image onto the canvas
        readImage();
      };
    };
    reader.readAsDataURL(e.target.files[0]);
});
  
function download() {
    let text = document.getElementById("output").value;
    if (text != "") {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', "AsciiImg.txt");
    
        element.style.display = 'none';
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
    }
}

function readImage(){
    let canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height); 

    let finalimage = "";
    let grayscalevalues = Array.from("@B%&#*okbdpqwmWZOLCJUYXzcvuxrjft/|(1[?-+<>i!lI:;\"\`. ");
    let totallength = canvas.width * canvas.height * 4;
    let rowcount = 0;

    textarea.value = "";
    for (let i = 0; i < totallength; i+=4) {
        let grayscale = Math.floor((0.299*canvasData.data[i] + 0.587*canvasData.data[i+1] + 0.114*canvasData.data[i+2])/5);
        finalimage += grayscalevalues[grayscale];
        rowcount++;
        if (rowcount == canvas.width) {
            rowcount = 0;
            finalimage += "\n";
            textarea.value += finalimage;
            finalimage = "";
        }
    }
}