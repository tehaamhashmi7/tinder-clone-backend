const mongoose = require('mongoose')


const cardSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    dob: Number,
    image: {
        contentType: String,
        data: Buffer
    }
})

const Card = mongoose.model('card', cardSchema)

module.exports = Card