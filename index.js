const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
//const fetch = require('node-fetch')


// ------------------------------------------ 

initializeApp(app, http)
initializeIo(io)

// ------------------------------------------ 



function initializeApp(app, http) {

    app.get('/', (req, res) => {
        const location = __dirname + '/index.html'
        console.log('sending file to location howdy', location)
        res.sendFile(location)
    })

    //app.use(express.static('public'))
    const dir = process.cwd() + '/'
    // this means u dont have to alias it to some weird directory ... you can alias it to the current directory and push all the files together. 
    // define a current location ... everything is happening inside of public now. ... the location has changed again.
    app.use(express.static(dir))

    http.listen(port, () => {
      console.log(`Socket.IO server running at http://localhost:${port}/`)
    })
}


function initializeIo() {
    io.on('connection', (socket) => {
      socket.on('connect', () => {
          console.log('connected')
          console.log(socket.rooms)
      })

      socket.on('disconnecting', () => {
          console.log('disconnecting')
          console.log(socket.rooms)
      })

      socket.on('data', e => {
        console.log(e)
        io.emit('data', e)
      })

      socket.on('private', (id, message) => {
          socket.to(id).emit('private', message)
      })
    })
}


