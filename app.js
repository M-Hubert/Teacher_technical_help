const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const session = require('express-session')
const config = require('./config.json')
const User = require('./modules/userSchema')
const Message = require('./modules/messageSchema')
const mailer = require('./modules/mailer')
const passport = require('passport')

//Option of mongoose connection.
mongoose.connect(config.mongoDB.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//When mongoose is connected.
mongoose.connection
    .once('open', () => console.log('connected to mongoDB'))
    .on('error', (error) => console.warn('erreur mongo '+error))

//Body-parser parameters.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Public files.
app.use(express.static('public'))

//Params for users session.
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session());

app.use('/microsoft', require('./routes/Microsoft-routes'))
app.use('/teacher', require('./routes/teacher-routes'))
app.use('/addUser', require('./routes/addUser-routes'))
app.use('/', require('./routes/index-routes'))

//when a technical teacher login
io.sockets.on('connection', function(socket) {
    Message.find({}).then((response) =>{
        socket.emit('message', response)
    })
    //delete help ticket
    socket.on('delete_ticket', function(data) {
        Message.deleteOne({user: data.user, reason: data.reason, dated: data.dated}, (err) => {
            Message.find({}).then((response) =>{
                socket.emit('message', response)
            })
        })
    })
    //update priority
    socket.on('new_priority', function(data) {
        Message.updateOne({user: data.user, reason: data.reason, dated: data.dated}, {priority: parseInt(data.priority)}, (err, raw) => {
            Message.find({}).then((response) =>{
                socket.emit('message', response)
            })
        })
    })
})

app.get('/users/:username/:pass/:mail/:grade', (req, res) => {
    bcrypt.hash(req.params.pass, 10, (err, hash) => {
        let users = new User({username: req.params.username, password: hash, email: req.params.mail, grade: req.params.grade})
        users.save().then((doc) => {
            console.log('finish user '+ doc)
            res.json('hello')
        })
    })
})

server.listen(8081, () => console.log('application en marche'))