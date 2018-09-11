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
})

// Create route that will let us write our api
var router = express.Router()

// Makes all of our APIs prefix with /api
app.use('/api', router)

// API access at http://localhost:5000/api
router.get('/', function(req, res) {
    res.json({
        message: 'This API is working!'
    })
})