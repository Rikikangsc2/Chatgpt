const socket = io();
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');
const chatMessages = document.getElementById('chat-messages');
const username = localStorage.getItem('username');

if (!username) {
    window.location.href = '/';
}

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim()) {
        addMessage('user', message);
        socket.emit('sendMessage', { username, message });
        messageInput.value = '';
        addTypingIndicator();
    }
});

clearButton.addEventListener('click', () => {
    chatMessages.innerHTML = '';
});

socket.on('receiveMessage', (message) => {
    removeTypingIndicator();
    addMessage(message.role, message.content);
});

function addMessage(role, content) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', role);
    messageElement.textContent = content;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'typing');
    typingElement.textContent = 'Alicia is typing.';
    typingElement.id = 'typing-indicator';
    chatMessages.appendChild(typingElement);
    typingElement.style.animation = 'typing 1s steps(3) infinite';
}

function removeTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
        chatMessages.removeChild(typingElement);
    }
}

messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});
