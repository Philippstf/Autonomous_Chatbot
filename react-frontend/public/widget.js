(function() {
    'use strict';
    
    // Widget Configuration
    class HelferlainWidget {
        constructor() {
            this.botId = this.getBotIdFromScript();
            this.apiUrl = 'https://helferlain.up.railway.app/api';
            this.isOpen = false;
            this.messages = [];
            this.conversationId = this.generateConversationId();
            this.botConfig = null;
            
            this.init();
        }
        
        getBotIdFromScript() {
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                const src = script.src;
                if (src && src.includes('widget.js')) {
                    const url = new URL(src);
                    return url.searchParams.get('bot');
                }
            }
            return null;
        }
        
        generateConversationId() {
            return 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        async init() {
            if (!this.botId) {
                console.error('Helferlain Widget: Bot ID not found in script URL');
                return;
            }
            
            await this.loadBotConfig();
            this.injectCSS();
            this.createWidget();
            this.attachEventListeners();
        }
        
        async loadBotConfig() {
            try {
                const response = await fetch(`${this.apiUrl}/v1/public/bot/${this.botId}`);
                if (!response.ok) throw new Error('Bot not found');
                this.botConfig = await response.json();
                console.log('🔍 Helferlain Widget - Loaded config:', this.botConfig);
            } catch (error) {
                console.error('Helferlain Widget: Failed to load bot config:', error);
                this.botConfig = {
                    name: 'Chatbot',
                    description: 'Hier können Sie mit unserem Chatbot sprechen.'
                };
            }
        }
        
        injectCSS() {
            const css = `
                /* Helferlain Chat Widget Styles */
                .helferlain-widget-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .helferlain-chat-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    color: white;
                    font-size: 24px;
                }
                
                .helferlain-chat-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
                }
                
                .helferlain-chat-modal {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.3s ease-out;
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .helferlain-chat-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .helferlain-chat-title {
                    font-weight: 600;
                    font-size: 16px;
                    margin: 0;
                }
                
                .helferlain-chat-subtitle {
                    font-size: 12px;
                    opacity: 0.9;
                    margin: 2px 0 0 0;
                }
                
                .helferlain-close-button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                
                .helferlain-close-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .helferlain-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    background: #f8f9fa;
                }
                
                .helferlain-message {
                    margin-bottom: 12px;
                    display: flex;
                    align-items: flex-start;
                }
                
                .helferlain-message.user {
                    justify-content: flex-end;
                }
                
                .helferlain-message-bubble {
                    max-width: 85%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.4;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    white-space: normal;
                    text-align: left;
                }
                
                .helferlain-message.user .helferlain-message-bubble {
                    background: #667eea;
                    color: white;
                }
                
                .helferlain-message.assistant .helferlain-message-bubble {
                    background: white;
                    color: #333;
                    border: 1px solid #e0e0e0;
                }
                
                .helferlain-chat-input-container {
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    gap: 8px;
                }
                
                .helferlain-chat-input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 20px;
                    font-size: 14px;
                    outline: none;
                    resize: none;
                    font-family: inherit;
                }
                
                .helferlain-chat-input:focus {
                    border-color: #667eea;
                }
                
                .helferlain-send-button {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #667eea;
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                
                .helferlain-send-button:hover {
                    background: #5a67d8;
                }
                
                .helferlain-send-button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                
                .helferlain-typing-indicator {
                    display: none;
                    padding: 10px 14px;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 18px;
                    max-width: 80px;
                }
                
                .helferlain-typing-dots {
                    display: flex;
                    gap: 4px;
                }
                
                .helferlain-typing-dot {
                    width: 6px;
                    height: 6px;
                    background: #999;
                    border-radius: 50%;
                    animation: typing 1.5s infinite;
                }
                
                .helferlain-typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .helferlain-typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typing {
                    0%, 60%, 100% {
                        opacity: 0.3;
                    }
                    30% {
                        opacity: 1;
                    }
                }
                
                @media (max-width: 768px) {
                    .helferlain-chat-modal {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 140px);
                        max-width: 350px;
                        max-height: 500px;
                    }
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.textContent = css;
            document.head.appendChild(styleSheet);
        }
        
        createWidget() {
            const container = document.createElement('div');
            container.className = 'helferlain-widget-container';
            
            // Chat Button
            const button = document.createElement('button');
            button.className = 'helferlain-chat-button';
            button.innerHTML = '💬';
            button.setAttribute('aria-label', 'Chat öffnen');
            
            // Chat Modal
            const modal = document.createElement('div');
            modal.className = 'helferlain-chat-modal';
            
            // Header
            const header = document.createElement('div');
            header.className = 'helferlain-chat-header';
            header.innerHTML = `
                <div>
                    <div class="helferlain-chat-title">${this.botConfig?.name || 'Chatbot'}</div>
                    <div class="helferlain-chat-subtitle">Wir sind hier, um zu helfen!</div>
                </div>
                <button class="helferlain-close-button" aria-label="Chat schließen">✕</button>
            `;
            
            // Messages Container
            const messagesContainer = document.createElement('div');
            messagesContainer.className = 'helferlain-chat-messages';
            
            // Welcome Message
            this.addWelcomeMessage(messagesContainer);
            
            // Input Container
            const inputContainer = document.createElement('div');
            inputContainer.className = 'helferlain-chat-input-container';
            inputContainer.innerHTML = `
                <input 
                    type="text" 
                    class="helferlain-chat-input" 
                    placeholder="Schreiben Sie eine Nachricht..."
                    maxlength="500"
                />
                <button class="helferlain-send-button" aria-label="Nachricht senden">➤</button>
            `;
            
            modal.appendChild(header);
            modal.appendChild(messagesContainer);
            modal.appendChild(inputContainer);
            
            container.appendChild(button);
            container.appendChild(modal);
            
            document.body.appendChild(container);
            
            this.elements = {
                container,
                button,
                modal,
                messagesContainer,
                input: inputContainer.querySelector('.helferlain-chat-input'),
                sendButton: inputContainer.querySelector('.helferlain-send-button'),
                closeButton: header.querySelector('.helferlain-close-button')
            };
        }
        
        addWelcomeMessage(container) {
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'helferlain-message assistant';
            
            const botName = this.botConfig?.name || 'Chatbot';
            // Use welcome_message from bot config if available, otherwise use default
            const welcomeText = this.botConfig?.branding?.welcome_message || 
                              this.botConfig?.welcome_message ||
                              `Hallo! 👋 Ich bin ${botName}. Wie kann ich Ihnen helfen?`;
            
            const bubble = document.createElement('div');
            bubble.className = 'helferlain-message-bubble';
            bubble.textContent = welcomeText;
            
            welcomeMessage.appendChild(bubble);
            container.appendChild(welcomeMessage);
            
            this.messages.push({
                role: 'assistant',
                content: welcomeText
            });
        }
        
        attachEventListeners() {
            // Toggle Chat
            this.elements.button.addEventListener('click', () => this.toggleChat());
            this.elements.closeButton.addEventListener('click', () => this.closeChat());
            
            // Send Message
            this.elements.sendButton.addEventListener('click', () => this.sendMessage());
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.elements.container.contains(e.target)) {
                    this.closeChat();
                }
            });
            
            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeChat();
                }
            });
        }
        
        toggleChat() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }
        
        openChat() {
            this.isOpen = true;
            this.elements.modal.style.display = 'flex';
            this.elements.button.innerHTML = '✕';
            this.elements.input.focus();
            this.scrollToBottom();
        }
        
        closeChat() {
            this.isOpen = false;
            this.elements.modal.style.display = 'none';
            this.elements.button.innerHTML = '💬';
        }
        
        async sendMessage() {
            const message = this.elements.input.value.trim();
            if (!message) return;
            
            // Clear input and disable send button
            this.elements.input.value = '';
            this.elements.sendButton.disabled = true;
            
            // Add user message
            this.addMessage('user', message);
            
            // Show typing indicator
            this.showTypingIndicator();
            
            try {
                // Send to API
                const response = await fetch(`${this.apiUrl}/v1/public/bot/${this.botId}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        conversation_id: this.conversationId
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                
                // Hide typing indicator
                this.hideTypingIndicator();
                
                // Add bot response
                this.addMessage('assistant', data.response || 'Entschuldigung, ich konnte Ihre Nachricht nicht verarbeiten.');
                
            } catch (error) {
                console.error('Chat error:', error);
                this.hideTypingIndicator();
                this.addMessage('assistant', 'Entschuldigung, es gab einen Verbindungsfehler. Bitte versuchen Sie es später erneut.');
            }
            
            // Re-enable send button
            this.elements.sendButton.disabled = false;
        }
        
        addMessage(role, content) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `helferlain-message ${role}`;
            
            const bubble = document.createElement('div');
            bubble.className = 'helferlain-message-bubble';
            bubble.textContent = content;
            
            messageDiv.appendChild(bubble);
            this.elements.messagesContainer.appendChild(messageDiv);
            
            this.messages.push({ role, content });
            this.scrollToBottom();
        }
        
        showTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'helferlain-message assistant';
            indicator.innerHTML = `
                <div class="helferlain-typing-indicator" style="display: block;">
                    <div class="helferlain-typing-dots">
                        <div class="helferlain-typing-dot"></div>
                        <div class="helferlain-typing-dot"></div>
                        <div class="helferlain-typing-dot"></div>
                    </div>
                </div>
            `;
            indicator.id = 'helferlain-typing-indicator';
            this.elements.messagesContainer.appendChild(indicator);
            this.scrollToBottom();
        }
        
        hideTypingIndicator() {
            const indicator = document.getElementById('helferlain-typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
        
        scrollToBottom() {
            setTimeout(() => {
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }, 100);
        }
    }
    
    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new HelferlainWidget());
    } else {
        new HelferlainWidget();
    }
    
})();