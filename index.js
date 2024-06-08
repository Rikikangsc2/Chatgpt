const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use(express.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.post('/register', (req, res) => {
    const { username } = req.body;
    if (username) {
        req.session.username = username;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Username is required' });
    }
});

app.get('/chat', (req, res) => {
    if (req.session.username) {
        res.sendFile(__dirname + '/public/chat.html');
    } else {
        res.redirect('/');
    }
});

io.on('connection', (socket) => {
    const username = socket.handshake.query.username;

    if (!username) {
        socket.disconnect(true);
        return;
    }

    console.log('New client connected:', username);

    socket.on('sendMessage', async (data) => {
        const { message } = data;
        try {
            const response = await axios.get(`https://nue-api.vercel.app/api/alicia?user=${username}&text=${message}`);
            const aliciaMessage = response.data.result;
            socket.emit('receiveMessage', { role: 'assistant', content: aliciaMessage });
        } catch (error) {
            console.error('Error calling Alicia API:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', username);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
