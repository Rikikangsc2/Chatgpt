const socket = io({
    query: {
        username: localStorage.getItem('username')
    }
});

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');
const chatMessages = document.getElementById('chat-messages');

// Load chat history from localStorage
loadChatHistory();

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim()) {
        addMessage('user', message);
        socket.emit('sendMessage', { message });
        messageInput.value = '';
        addTypingIndicator();
    }
});

clearButton.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    localStorage.removeItem('chatHistory');
});

socket.on('receiveMessage', (message) => {
    removeTypingIndicator();
    addMessage('assistant', message.content, true);
});

function addMessage(role, content, animate = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', role);
    if (animate && role === 'assistant') {
        chatMessages.appendChild(messageElement);
        typeText(messageElement, content);
    } else {
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    saveChatHistory();
}

function addTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'typing');
    typingElement.textContent = 'Alicia is typing...';
    typingElement.id = 'typing-indicator';
    chatMessages.appendChild(typingElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
        chatMessages.removeChild(typingElement);
    }
}

function typeText(element, text) {
    let index = 0;
    function typing() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typing, 50);
        } else {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            saveChatHistory();
        }
    }
    typing();
}

messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

function saveChatHistory() {
    const messages = [];
    chatMessages.childNodes.forEach(node => {
        messages.push({
            role: node.classList.contains('user') ? 'user' : 'assistant',
            content: node.textContent
        });
    });
    localStorage.setItem('chatHistory', JSON.stringify(messages));
}

function loadChatHistory() {
    const messages = JSON.parse(localStorage.getItem('chatHistory')) || [];
    messages.forEach(message => {
        addMessage(message.role, message.content);
    });
}