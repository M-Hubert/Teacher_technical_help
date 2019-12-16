const router = require('express').Router()
const User = require('../modules/userSchema')
const bcrypt = require('bcrypt')
const config = require('../config.json')

//Get default URL.
router.get('/', (req, res) => {
    req.session.destroy()
    res.render('index.twig', {
        error_message: "",
        main_link: config.url.main,
        height: '430px'
    })
})

router.post('/', (req, res) => {
    if((req.body.username) && (req.body.password)){
        User.find({username: req.body.username}).then((users) => {
            if (users[0] == undefined){
                res.render('index.twig', {
                    error_message: "Ce compte n'éxiste pas.",
                    main_link: config.url.main,
                    height: '450px'
                })
            } else {
                bcrypt.compare(req.body.password, users[0].password, function(err, response){
                    if(err){
                        res.render('index.twig', {
                            error_message: err.message,
                            main_link: config.url.main,
                            height: '450px'
                        })
                    } else {
                        if(response){
                            req.session.connection = 'connect'
                            req.session.userInfo = users[0]
                            res.redirect('/teacher')
                        } else {
                            res.render('index.twig', {
                                error_message: "Identifiant incorrect",
                                main_link: config.url.main,
                                height: '450px'
                            }) 
                        }
                    }
                })
            }
        })
    } else {
        res.render('index.twig', {
            error_message: "Champs non remplis.",
            main_link: config.url.main,
            height: '450px'
        })
    }
})

module.exports = router