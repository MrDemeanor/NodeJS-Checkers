// Import libraries
var express = require('express')
var socket = require('socket.io')
var bodyParser = require('body-parser')
var path = require('path')

// Create Express app
var app = express()

// Imposes constraints on our express app
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

// Create server and set to port 5000
var server = app.listen(5000, function () {
    console.log('Listening on port 5000')
})

app.get('/spectator', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/spectator.html'));
});



/*
    Allow the server to establish bidirectional communication with 
    web browser client
*/
var io = socket(server)

var playerSocket = new Set()
var spectatorSocket = new Set()

io.use(function(socket, next) {
    // var handshakeData = socket.request;
    // console.log("middleware:", handshakeData._query['person']);
    next();
  });

io.on('connection', function (socket) {

    // Let's us know that a connection has been established
    console.log('Connection made!')

    var handshakeData = socket.request;

    if(handshakeData._query['person'] == 'player') {
        if (playerSocket.size >= 2) {
            console.log('Too Big')
            socket.emit('getouttahere')
            socket.disconnect(true)
        } else {
            playerSocket.add(socket.id)
        }
    } else if(handshakeData._query['person'] == 'spectator') {
        spectatorSocket.add(socket.id)
    }

    // Updates the board 
    socket.on('updateBoard', function (data) {
        io.sockets.emit('updateBoard', data)
    })

    socket.on('disconnect', function () {
        playerSocket.delete(socket.id)
        spectatorSocket.delete(socket.id)
    })
})

// Create route that will let us write our api
var router = express.Router()

// Size will be determiend by another page
var boardSize = 10

// 2D array of player pieces. Each piece has a color, x and y coordinate, a king status and an alive status
var p1 = [boardSize + Math.floor(boardSize / 2)][5]
var p2 = [boardSize + Math.floor(boardSize / 2)][5]

// Makes all of our APIs prefix with /api
app.use('/api', router)

// API access at http://localhost:5000/api
router.get('/', function (req, res) {
    res.json({
        message: 'This API is working!'
    })
})