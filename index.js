const express = require('express')
const server = require('./db')
const cors = require('cors')


// App config




const app = express()
const port = process.env.PORT || 1003
app.use(express.json({limit: '50mb'}))
app.use(express.static(__dirname+'/uploads/'))

app.use(cors({
    origin: '*',
    methods:['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-type', 'Accept', 'auth-token', 'Authorization'],
    exposedHeaders: ['Link']
}))

// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//     allowedHeaders: ['Content-type', 'Accept', 'auth-token', 'Authorization'],
//     exposedHeaders: ['Link']
// }))



// DB config

server()

// Routing

app.use('/api/user', require('./routes/user'))



app.listen(port, console.log(`Application started on port ${port}`))