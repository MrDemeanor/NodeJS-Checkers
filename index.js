// Import libraries
var express = require('express')
var socket = require('socket.io')
var bodyParser = require('body-parser')
var path = require('path')

require('./twilio')

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

app.get('/spectator', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/spectator.html'));
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/home.html'))
})

app.get('/singleplayer', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/singleplayer.html'))
})

app.get('/about', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/about.html'))
})

app.get('/multiplayer/', function (req, res) {

    res.sendFile(path.join(__dirname + '/public/multiplayer.html'))

    var username = req.param('username')

    setTimeout(function () {
        if (playerSocket.size == 1) {
            player1 = username
        } else if (playerSocket.size == 2) {
            player2 = username
        }
    }, 2000)
})

app.get('/subscribe', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/subscribe.html'))
})

app.get('/subscribe/myNumber', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/thankyousubscribe.html'))

    var number = req.param('number')

    console.log('My number: ' + number)

    Twilio.subscribe(number)

})

app.get('/unsubscribe', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/unsubscribe.html'))
})

app.get('/unsubscribe/myNumber', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/thankyouunsubscribe.html'))

    var number = req.param('number')

    console.log('My number: ' + number)

    Twilio.unsubscribe(number)

})


/*
    Allow the server to establish bidirectional communication with 
    web browser client
*/
var io = socket(server)

var playerSocket = new Set()
var spectatorSocket = new Set()

var player1, player2

var player1Score = 0
var player2Score = 0

io.on('connection', function (socket) {

    // Let's us know that a connection has been established
    console.log('Connection made!')

    var handshakeData = socket.request;

    if (handshakeData._query['person'] == 'player') {
        if (playerSocket.size >= 2) {
            console.log('Too Big')
            socket.emit('getouttahere')
            socket.disconnect(true)
        } else {
            if (playerSocket.size == 0) {
                socket.emit('whosturn', {
                    turn: true,
                    player: '1',
                    color: 'rgba(66, 134, 244, 1)'
                })
            } else if (playerSocket.size == 1) {
                socket.emit('whosturn', {
                    turn: false,
                    player: '2',
                    color: 'rgba(66, 244, 98, 1)'
                })
            }
            playerSocket.add(socket.id)
        }
    } else if (handshakeData._query['person'] == 'spectator') {
        spectatorSocket.add(socket.id)
    }

    socket.on('you-lost', function() {
        io.sockets.emit('loser')
    })

    // Updates the board 
    socket.on('updateBoardt', function (data) {
        io.sockets.emit('updateBoard', data)
    })

    socket.on('switchTurn', function () {
        io.sockets.emit('turnSwitched')
    })

    socket.on('delete', function (data) {
        io.sockets.emit('deletePiece', {
            x: data.x,
            y: data.y
        })
    })

    socket.on('disconnect', function () {

        if (handshakeData._query['person'] != 'spectator') {
            io.sockets.emit('disconnected')
            player1 = null
            player2 = null
            player1Score = 0
            player2Score = 0
        }

        playerSocket.delete(socket.id)
        spectatorSocket.delete(socket.id)

    })

    socket.on('givepoint', function(data) {
        if(data.playerNumber == '1') {
            player1Score++
            if(player1Score == 13) {
                Twilio.pushWinningNotification(player1, player2)
                io.sockets.emit('gameover')
            } else {
                Twilio.pushScoreNotification(player1, player2, player1Score, player2Score)
            }
        } else if(data.playerNumber == '2') {
            player2Score++
            if(player2Score == 13) {
                // Player 2 Won
                Twilio.pushWinningNotification(player2, player1)
                io.sockets.emit('gameover')
            } else {
                Twilio.pushScoreNotification(player2, player1, player2Score, player1Score)
            }
            
        }
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
router.get('/multiplayer_size', function (req, res) {
    res.json({
        multiplayer_size: playerSocket.size
    })
})

router.get('/get_server', function(req, res) {
    res.json({
        server: server
    })
})

router.get('/add_number', function(req, res) {
    res.json({
        myClient: Twilio.subscribe('5127495923')
    })
})

router.get('/test_socket_emptiness', function(req, res) {
    res.json({
        players: playerSocket.size, 
        spectators: spectatorSocket.size
    })
})

router.get('/remove_number', function(req, res) {
    res.json({
        myClient: Twilio.subscribe('5127495923')
    })
})

router.get('/check_io', function(req, res) {
    res.json({
        io: io
    })
})