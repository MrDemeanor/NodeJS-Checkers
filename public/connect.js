// Establish connection to server on port 5000
var socket = io.connect('http://localhost:5000')

// Set the size of the canvas based on the screen resolution
var canvas = document.getElementById('gamecanvas')

if (window.innerHeight < window.innerWidth) {
    canvas.width = window.innerHeight / 1.2
    canvas.height = window.innerHeight / 1.2
} else {
    canvas.width = window.innerWidth / 1.2
    canvas.height = window.innerWidth / 1.2
}

var c = canvas.getContext('2d')

// Returns the mouse position
function returnMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

var selectedCircle = {
    x: "",
    y: ""
}

var isSelected = false

// Event listener that displays mouse coordinates
canvas.addEventListener('mousedown', function (event) {
    var mousePos = returnMousePos(canvas, event)

    var pixelData = c.getImageData(mousePos.x, mousePos.y, 1, 1).data

    var hex = "#" + ("000000" + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);

    console.log("X: " + mousePos.x + " Y:" + mousePos.y + " " + hex)
    console.log("")
    console.log("Circle Location")

    var lengthOfSquare = canvas.width / numRows

    var x = ((Math.ceil(mousePos.x / lengthOfSquare)) * lengthOfSquare) - (lengthOfSquare / 2) + .5
    console.log("X: " + x)

    var y = ((Math.ceil(mousePos.y / lengthOfSquare)) * lengthOfSquare) - (lengthOfSquare / 2) + .5
    console.log("Y: " + y)

    if (hex == "#0000ff" || hex == "#ff0000") {
        if (!isSelected) {
            isSelected = true
            c.strokeStyle = 'rgba(16, 255, 0, 1)'
            selectedCircle.x = x
            selectedCircle.y = y
            c.lineWidth = 1

            c.beginPath()
            c.arc(x, y, 10, Math.PI * 2, false)
            c.stroke()

        } else if(isSelected) {
            if (x == selectedCircle.x && y == selectedCircle.y) {
                console.log("yes")
                isSelected = false
                c.strokeStyle = 'rgba(20, 20, 20, 1)'
                c.lineWidth = 2

                selectedCircle.x = ""
                selectedCircle.y = ""

                c.beginPath()
                c.arc(x, y, 10, Math.PI * 2, false)
                c.stroke()
            }

        }

    }

})

// Variables to modify canvas properties
var isWhite = false;
var numRows = 11
var player1Color = 'red'
var player2Color = 'blue '

/* 
    Function that draws the initial gameboard, and deterines if a square on the board should have
    a game piece on it or not
*/

function draw(i, x, y, isWhite, hasCheckers, color) {
    if (i < numRows) {
        if (isWhite) {
            c.fillStyle = 'rgba(177,177,177,1)'
            c.fillRect(x, y, canvas.width / numRows, canvas.width / numRows)
            draw(i + 1, x + canvas.width / numRows, y, !isWhite, hasCheckers, color)
        } else {
            c.fillStyle = 'rgba(20,20,20,1)'
            c.fillRect(x, y, canvas.width / numRows, canvas.width / numRows)

            if (hasCheckers) {
                setTimeout(function () {
                    c.beginPath()
                    c.arc(x + (canvas.width / numRows) / 2, y + (canvas.width / numRows) / 2, 10, Math.PI * 2, false)
                    c.fillStyle = color;
                    c.fill();
                    c.stroke()
                }, 1000)

            }

            draw(i + 1, x + canvas.width / numRows, y, !isWhite, hasCheckers, color)
        }
    }
}

for (var i = 0, y = 0; i < numRows; i++ , y += canvas.width / numRows) {
    if (isWhite) {
        if (i >= 0 && i < 3) {
            draw(0, 0, y, false, true, player1Color)
        } else if (i < numRows && i >= numRows - 3) {
            draw(0, 0, y, false, true, player2Color)
        } else {
            draw(0, 0, y, false, false)
        }
        isWhite = !isWhite
    } else {
        if ((i >= 0 && i < 3)) {
            draw(0, 0, y, true, true, player1Color)
        } else if (i < numRows && i >= numRows - 3) {
            draw(0, 0, y, true, true, player2Color)
        } else {
            draw(0, 0, y, true, false)
        }
        isWhite = !isWhite
    }
}

