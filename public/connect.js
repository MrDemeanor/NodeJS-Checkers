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

// Variables to modify canvas properties
var isWhite = false;
var numRows = 9
var player1Color = 'pink'
var player2Color = 'yellow'

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
                c.beginPath()
                c.arc(x + (canvas.width / numRows) / 2, y + (canvas.width / numRows) / 2, 10, Math.PI * 2, false)
                c.fillStyle = color;
                c.fill();
                c.stroke()
            }

            draw(i + 1, x + canvas.width / numRows, y, !isWhite, hasCheckers, color)
        }
    }
}

for (var i = 0, y = 0; i < numRows; i++ , y += canvas.width / numRows) {
    if (isWhite) {
        if (i >= 0 && i < 3) {
            draw(0, 0, y, false, true, player1Color)
        } else if(i < numRows && i >= numRows - 3) {
            draw(0, 0, y, false, true, player2Color)
        } else {
            draw(0, 0, y, false, false)
        }
        isWhite = !isWhite
    } else {
        if ((i >= 0 && i < 3)) {
            draw(0, 0, y, true, true, player1Color)
        } else if(i < numRows && i >= numRows - 3) {
            draw(0, 0, y, true, true, player2Color)
        } else {
            draw(0, 0, y, true, false)
        }
        isWhite = !isWhite
    }
}