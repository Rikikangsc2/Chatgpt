const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('sendMessage', async (data) => {
        const { username, message } = data;
        try {
            const response = await axios.get(`https://nue-api.vercel.app/api/alicia?user=${username}&text=${message}`);
            const aliciaMessage = response.data.result;
            socket.emit('receiveMessage', { role: 'assistant', content: aliciaMessage });
        } catch (error) {
            console.error('Error calling Alicia API:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
