const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    grade: String
})

const user = mongoose.model('users', userSchema)

module.exports = user