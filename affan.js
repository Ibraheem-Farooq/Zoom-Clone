// Required modules
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const socketio = require('socket.io');

// Serve static files
app.use(express.static(__dirname));

// HTTPS setup using mkcert
const key = fs.readFileSync('localhost-key.pem');
const cert = fs.readFileSync('localhost.pem');

// Create HTTPS server
const expressServer = https.createServer({ key, cert }, app);

// Create Socket.IO server
const io = socketio(expressServer, {
    cors: {
        origin: ['https://192.168.0.111'], // Allow requests from this origin
        methods: ["GET", "POST"]
    }
});

// Variables for storing data
var mapSocketWithNames = {};
let adminOfRoom = {};
var vote_counts = {};

// Main namespace for the meet functionality
io.of('/stream').on('connection', (socket) => {
    socket.on('subscribe', (data) => {
        socket.join(data.socketId);

        if (!socket.adapter.rooms[data.room]) {
            socket.join(data.room);
            adminOfRoom[data.room] = data.socketId;
            socket.emit('iAmAdmin');
        } else {
            socket.to(adminOfRoom[data.room]).emit('request-admin', data);
        }

        if (!vote_counts[data.room]) {
            vote_counts[data.room] = 0;
        }

        mapSocketWithNames[data.socketId] = data.username;
    });

    // More event handlers for meet functionality can be added here...
});

// User dashboard namespace
io.of('/user').on('connection', (socket) => {
    // More event handlers for user dashboard can be added here...
});

// Start the HTTPS server
const port = process.env.PORT || 8181;
expressServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Example of how to use mkcert
// Make sure you have mkcert installed globally
// Run: npm install mkcert -g
// Then run: mkcert -install
// After that, you can generate certificates for your domain
// For example: mkcert example.com "*.example.com" localhost 127.0.0.1 ::1
// Replace the generated key and cert files in the HTTPS setup above
