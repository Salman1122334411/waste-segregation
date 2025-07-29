document.addEventListener('DOMContentLoaded', () => {
    // Chatbot functionality
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const typingIndicator = document.getElementById('typingIndicator');
    const sendBtn = document.getElementById('sendBtn');

    // Handle Enter key press
    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }

    // Add message to chat
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('p');
        messageContent.innerHTML = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message to backend
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';

        // Show typing indicator
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
        }

        try {
            // Send message to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            
            // Hide typing indicator
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }

            // Add bot response to chat
            addMessage(data.response, 'bot');

        } catch (error) {
            console.error('Error:', error);
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    // Event listeners for sending message
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    if (userInput) {
        userInput.addEventListener('keypress', handleKeyPress);
    }

    // Integrate with auth.js to show user's name (optional)
    function greetUser() {
        // Ensure getCurrentUserId and getUserData are globally available from auth.js
        if (typeof getCurrentUserId === 'function' && typeof getUserData === 'function') {
            const currentUserId = getCurrentUserId();
            if (currentUserId) {
                const userData = getUserData(currentUserId);
                if (userData && userData.email) {
                    const userName = userData.email.split('@')[0]; // Use part of email as name
                    // Modify initial welcome message or add a new one
                    const initialBotMessage = chatMessages.querySelector('.bot-message p');
                    if (initialBotMessage) {
                        initialBotMessage.textContent = `Hello ${userName}! I'm your AI Assistant. How can I help you today?`;
                    }
                }
            }
        }
    }

    // Call greetUser when the DOM is loaded
    greetUser();

    // Automatically focus the user input field
    if (userInput) {
        userInput.focus();
    }
}); 