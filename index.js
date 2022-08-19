const express = require('express')
const server = require('./db')


// App config

const app = express()
const port = process.env.PORT || 1003
app.use(express.json())

// DB config

server()

// Routing

app.use('/api/user', require('./routes/user'))

app.listen(port, console.log(`Application started on port ${port}`))