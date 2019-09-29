const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageSchema = new Schema({
    user: String,
    reason: String,
    explanation: String,
    priority: Number,
    dated: String
})

const message = mongoose.model('message', messageSchema)

module.exports = message