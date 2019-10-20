const router = require('express').Router()
const mailer = require('../modules/mailer')
const Message = require('../modules/messageSchema')
const config = require('../config.json')

router.get('/', (req, res) => {
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

router.post('/', (req, res) => {
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


module.exports = router