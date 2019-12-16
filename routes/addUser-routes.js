const router = require('express').Router()
const multer = require('multer')
const config = require('../config.json')
const newUser = require('../modules/adduser')

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, 'account.csv')
    }
})

const upload = multer({
  storage: storage  
}).single('file')

router.get('/', (req, res) => {
    if ((req.session.connection == 'connect') && (req.session.userInfo.grade == 'technical')){
        res.render('addUsers.twig', {
            main_link: config.url.main
        })
    } else {
        res.redirect('/')
    }
})

router.post('/', (req, res) => {
    upload(req, res, (err) => {
        newUser.add()
        res.redirect('/teacher')
        console.log(err)
    })
})

module.exports = router