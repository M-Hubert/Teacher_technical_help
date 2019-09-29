const csvjson = require('csvjson')
const fs = require('fs')
const addUser = require('./userSchema')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const options = {
    delimiter : ';' ,
    quote     : '"'
};

const user = {
    add: function(){
        let result = csvjson.toObject(fs.readFileSync('./public/uploads/account.csv', { encoding : 'utf8'}), options)
        for(let i in result){
            bcrypt.hash(result[i].password, 10, (err, hash) => {
                let Users = new addUser({username: result[i].username, password: hash, email: result[i].mail, grade: result[i].grade})
                Users.save()
            })
        }
        fs.unlink('./public/uploads/account.csv', (err) => {
            console.log('file was deleted')
        })
    }
}

module.exports = user