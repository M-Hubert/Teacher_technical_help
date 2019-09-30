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
const multer = require('multer')
const newUser = require('./modules/adduser')

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, 'account.csv')
    }
})

const upload = multer({
  storage: storage  
}).single('file')


//Option of mongoose connection.
mongoose.connect('mongodb://localhost/help_teacher', {
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

//Get default URL.
app.get('/', (req, res) => {
    req.session.connection = 'disconnect'
    req.session.userInfo = ""
    res.render('index.twig', {
        error_message: ""
    })
})

app.post('/', (req, res) => {
    if((req.body.username) && (req.body.password)){
        User.find({username: req.body.username}).then((users) => {
            if (users[0] == undefined){
                res.render('index.twig', {
                    error_message: "Ce compte n'éxiste pas."
                })
            } else {
                bcrypt.compare(req.body.password, users[0].password, function(err, response){
                    if(err){
                        res.render('index.twig', {
                            error_message: err.message
                        })
                    } else {
                        if(response){
                            req.session.connection = 'connect'
                            req.session.userInfo = users[0]
                            res.redirect('/teacher')
                        } else {
                            res.render('index.twig', {
                                error_message: "Identifiant incorrect"
                            }) 
                        }
                    }
                })
            }
        })
    } else {
        res.render('index.twig', {
            error_message: "Champs non remplis."
        })
    }
})

app.get('/teacher', (req, res) => {
    if(req.session.connection == 'connect'){
        if(req.session.userInfo.grade == 'teacher'){
            res.render('teacher.twig', {
                main_link: config.url.main
            })
        } else if (req.session.userInfo.grade == 'technical'){
            res.render('technical.twig', {
                username: req.session.userInfo.username,
                main_link: config.url.main
            })
        } else {
            res.redirect('/')
        }
    } else {
        res.redirect('/')
    }
})

//when a teacher send a help ticket
app.post('/teacher', (req, res) => {
    let choice = ''
    if (req.session.userInfo.grade === 'teacher'){
        if (req.body.explanation){
            switch (req.body.radios) {
                case "1":
                    choice = 'Problème matériel'
                    break;     
                case "2":
                    choice = 'Problème de connexion(wifi)'
                    break;
                case "3":
                    choice = 'Problème de connexion Office 365'
                    break;
                case "4":
                    choice = 'Autre'
                    break;
            }

            mailer.send(req.session.userInfo.username, choice, req.body.explanation, req.session.userInfo.email)
    
            let messages = new Message({user: req.session.userInfo.username, reason: choice, explanation: req.body.explanation, priority: 5, dated: new Date()})

            messages.save()
    
            res.render('success.twig', {
                main_link: config.url.main
            })
        } else {
            res.render('teacher.twig', {
                error_message: "champs non remplis",
                main_link: config.url.main
            })
        }

    }else if (req.session.userInfo.grade === 'technical'){
            res.render('technical.twig', {
                username: req.session.userInfo.username,
                main_link: config.url.main
            })
    } else {
        res.redirect('/')
    }
})

app.get('/addUser', (req, res) => {
    if ((req.session.connection == 'connect') && (req.session.userInfo.grade == 'technical')){
        res.render('addUsers.twig', {
            main_link: config.url.main
        })
    } else {
        res.redirect('/')
    }
})

app.post('/addUser', (req, res) => {
    upload(req, res, (err) => {
        newUser.add()
        res.redirect('/teacher')
    })
})

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

server.listen(8081, () => console.log('application en marche'))