// Import libraries
var express = require('express')
var socket = require('socket.io')
var bodyParser = require('body-parser')

// Create Express app
var app = express()

// Imposes constraints on our express app
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())

// Create server and set to port 5000
var server = app.listen(5000, function() {
    console.log('Listening on port 5000')
})

/*
    Allow the server to establish bidirectional communication with 
    web browser client
*/
var io = socket(server)

io.on('connection', function() {
    console.log('Connection made!')

    io.emit('calculate-coordinates'); 
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
router.get('/', function(req, res) {
    res.json({
        message: 'This API is working!'
    })
})