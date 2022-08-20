const express = require('express')
const server = require('./db')
const cors = require('cors')


// App config

const app = express()
const port = process.env.PORT || 1003
app.use(express.json())
app.use(cors())
app.use(express.static(__dirname+'/uploads/'))

// DB config

server()

// Routing

app.use('/api/user', require('./routes/user'))

app.listen(port, console.log(`Application started on port ${port}`))