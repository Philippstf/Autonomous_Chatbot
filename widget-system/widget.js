/**
 * HelferLain Chatbot Widget
 * Universelles JavaScript Widget für Website-Integration
 * 
 * Usage:
 * <script src="https://cdn.helferlain.app/widget.js"></script>
 * <script>HelferLain.init({botId: 'your-bot-id'});</script>
 */

(function(window) {
    'use strict';
    
    // Verhindere mehrfache Initialisierung
    if (window.HelferLain && window.HelferLain.initialized) {
        console.warn('HelferLain Widget already initialized');
        return;
    }
    
    // Namespace für HelferLain Widget
    window.HelferLain = window.HelferLain || {};
    
    // Widget-Klasse
    class HelferLainWidget {
        constructor(config) {
            this.config = {
                // API Settings
                apiEndpoint: 'https://api.helferlain.app/api/v1/public',
                
                // Appearance
                theme: 'light', // 'light', 'dark', 'auto'
                mode: 'bubble', // 'bubble', 'inline', 'modal'
                position: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
                
                // Behavior
                autoOpen: false,
                showBranding: true,
                enableSound: false,
                closeOnOutsideClick: true,
                
                // Content
                welcomeMessage: null, // Wird von Bot-Config überschrieben
                placeholderText: 'Nachricht eingeben...',
                language: 'de',
                
                // Styling
                primaryColor: null, // Wird von Bot-Config überschrieben
                borderRadius: '12px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                
                // Advanced
                customCSS: null,
                maxMessages: 100,
                messageDelay: 500,
                typingDelay: 1000,
                
                // Callbacks
                onOpen: null,
                onClose: null,
                onMessage: null,
                onResponse: null,
                onError: null,
                
                // User config überschreibt defaults
                ...config
            };
            
            // State
            this.isOpen = false;
            this.isLoading = false;
            this.isTyping = false;
            this.sessionId = this.generateSessionId();
            this.messages = [];
            this.element = null;
            this.initialized = false;
            this.botConfig = null;
            
            // Bind methods
            this.handleMessage = this.handleMessage.bind(this);
            this.handleKeyPress = this.handleKeyPress.bind(this);
            this.handleOutsideClick = this.handleOutsideClick.bind(this);
        }
        
        async init() {
            if (this.initialized) {
                console.warn('HelferLain Widget already initialized');
                return;
            }
            
            try {
                this.log('Initializing HelferLain Widget...');
                
                // Bot-Konfiguration laden
                await this.loadBotConfig();
                
                // Widget DOM erstellen
                this.createWidget();
                
                // Event-Listener binden
                this.bindEvents();
                
                // CSS laden
                await this.loadStyles();
                
                // Auto-open wenn konfiguriert
                if (this.config.autoOpen) {
                    setTimeout(() => this.open(), 1000);
                }
                
                this.initialized = true;
                this.log('HelferLain Widget initialized successfully');
                this.trigger('initialized');
                
            } catch (error) {
                this.error('Widget initialization failed:', error);
                this.showError('Widget konnte nicht geladen werden.');
                this.trigger('error', error);
            }
        }
        
        async loadBotConfig() {
            this.log(`Loading bot config for: ${this.config.botId}`);
            
            const response = await this.fetchWithTimeout(
                `${this.config.apiEndpoint}/bot/${this.config.botId}`,
                { timeout: 10000 }
            );
            
            if (!response.ok) {
                throw new Error(`Bot not found (${response.status})`);
            }
            
            this.botConfig = await response.json();
            this.log('Bot config loaded:', this.botConfig.name);
            
            // Config mit Bot-Daten erweitern
            if (!this.config.welcomeMessage) {
                this.config.welcomeMessage = this.botConfig.branding?.welcome_message || 
                    `Hallo! Ich bin ${this.botConfig.name}. Wie kann ich Ihnen helfen?`;
            }
            
            if (!this.config.primaryColor) {
                this.config.primaryColor = this.botConfig.branding?.primary_color || '#1e3a8a';
            }
        }
        
        createWidget() {
            // Widget-Container erstellen
            this.element = document.createElement('div');
            this.element.id = `helferlain-widget-${this.config.botId}`;
            this.element.className = `helferlain-widget helferlain-${this.config.mode} helferlain-${this.config.position}`;
            
            // Widget-Typ-spezifische Erstellung
            switch (this.config.mode) {
                case 'bubble':
                    this.createBubbleWidget();
                    break;
                case 'inline':
                    this.createInlineWidget();
                    break;
                case 'modal':
                    this.createModalWidget();
                    break;
                default:
                    throw new Error(`Unsupported widget mode: ${this.config.mode}`);
            }
            
            // Widget in DOM einfügen
            this.insertWidget();
        }
        
        createBubbleWidget() {
            this.element.innerHTML = `
                <div class="helferlain-bubble-trigger" data-role="trigger">
                    <div class="helferlain-bubble-icon">
                        ${this.getIcon('chat')}
                    </div>
                    <div class="helferlain-notification-badge" data-role="badge" style="display: none;">
                        1
                    </div>
                </div>
                
                <div class="helferlain-chat-window" data-role="window" style="display: none;">
                    ${this.createChatInterface()}
                </div>
            `;
        }
        
        createInlineWidget() {
            this.element.innerHTML = `
                <div class="helferlain-chat-window helferlain-inline" data-role="window">
                    ${this.createChatInterface()}
                </div>
            `;
        }
        
        createModalWidget() {
            this.element.innerHTML = `
                <div class="helferlain-modal-overlay" data-role="overlay" style="display: none;">
                    <div class="helferlain-chat-window helferlain-modal" data-role="window">
                        ${this.createChatInterface()}
                    </div>
                </div>
            `;
        }
        
        createChatInterface() {
            const botAvatar = this.botConfig?.branding?.logo_url || this.getDefaultAvatar();
            
            return `
                <div class="helferlain-chat-header">
                    <div class="helferlain-bot-info">
                        <img src="${botAvatar}" alt="${this.botConfig?.name || 'Bot'}" class="helferlain-bot-avatar">
                        <div class="helferlain-bot-details">
                            <h3>${this.botConfig?.name || 'Chatbot'}</h3>
                            <p class="helferlain-status">
                                <span class="helferlain-status-dot"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    ${this.config.mode !== 'inline' ? `
                        <button class="helferlain-close-btn" data-role="close" title="Schließen">
                            ${this.getIcon('close')}
                        </button>
                    ` : ''}
                </div>
                
                <div class="helferlain-messages" data-role="messages">
                    <!-- Messages werden hier eingefügt -->
                </div>
                
                <div class="helferlain-typing-indicator" data-role="typing" style="display: none;">
                    <div class="helferlain-typing-content">
                        <div class="helferlain-typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span class="helferlain-typing-text">Bot tippt...</span>
                    </div>
                </div>
                
                <div class="helferlain-input-area">
                    <form class="helferlain-input-form" data-role="form">
                        <input 
                            type="text" 
                            data-role="input"
                            placeholder="${this.config.placeholderText}"
                            maxlength="500"
                            autocomplete="off"
                            spellcheck="false"
                        >
                        <button type="submit" data-role="send" title="Senden">
                            ${this.getIcon('send')}
                        </button>
                    </form>
                    
                    ${this.config.showBranding ? `
                        <div class="helferlain-branding">
                            Powered by <a href="https://helferlain.app" target="_blank" rel="noopener">HelferLain</a>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        insertWidget() {
            if (this.config.targetElement) {
                // Specific target element
                if (typeof this.config.targetElement === 'string') {
                    const target = document.querySelector(this.config.targetElement);
                    if (!target) {
                        throw new Error(`Target element not found: ${this.config.targetElement}`);
                    }
                    target.appendChild(this.element);
                } else {
                    this.config.targetElement.appendChild(this.element);
                }
            } else {
                // Append to body
                document.body.appendChild(this.element);
            }
        }
        
        bindEvents() {
            // Bubble trigger
            const trigger = this.element.querySelector('[data-role="trigger"]');
            if (trigger) {
                trigger.addEventListener('click', () => this.toggle());
            }
            
            // Close button
            const closeBtn = this.element.querySelector('[data-role="close"]');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
            
            // Message form
            const form = this.element.querySelector('[data-role="form"]');
            if (form) {
                form.addEventListener('submit', this.handleMessage);
            }
            
            // Input field
            const input = this.element.querySelector('[data-role="input"]');
            if (input) {
                input.addEventListener('keypress', this.handleKeyPress);
            }
            
            // Outside click für Modal/Bubble
            if (this.config.closeOnOutsideClick && this.config.mode !== 'inline') {
                document.addEventListener('click', this.handleOutsideClick);
            }
            
            // Modal overlay click
            const overlay = this.element.querySelector('[data-role="overlay"]');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) this.close();
                });
            }
        }
        
        async loadStyles() {
            return new Promise((resolve, reject) => {
                // Prüfe ob Styles bereits geladen
                if (document.querySelector('#helferlain-widget-styles')) {
                    resolve();
                    return;
                }
                
                const style = document.createElement('style');
                style.id = 'helferlain-widget-styles';
                style.textContent = this.getWidgetCSS();
                
                document.head.appendChild(style);
                
                // Custom CSS laden falls vorhanden
                if (this.config.customCSS) {
                    const customStyle = document.createElement('link');
                    customStyle.rel = 'stylesheet';
                    customStyle.href = this.config.customCSS;
                    customStyle.onload = resolve;
                    customStyle.onerror = reject;
                    document.head.appendChild(customStyle);
                } else {
                    resolve();
                }
            });
        }
        
        getWidgetCSS() {
            const primaryColor = this.config.primaryColor;
            const theme = this.config.theme === 'auto' ? 
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
                this.config.theme;
            
            const colors = theme === 'dark' ? {
                background: '#1a1a1a',
                surface: '#2d2d2d',
                surfaceHover: '#3d3d3d',
                text: '#ffffff',
                textSecondary: '#a0a0a0',
                border: '#404040',
                shadow: 'rgba(0, 0, 0, 0.3)'
            } : {
                background: '#ffffff',
                surface: '#f8f9fa',
                surfaceHover: '#e9ecef',
                text: '#2d3748',
                textSecondary: '#718096',
                border: '#e2e8f0',
                shadow: 'rgba(0, 0, 0, 0.1)'
            };
            
            return `
                /* HelferLain Widget Base Styles */
                .helferlain-widget {
                    --primary-color: ${primaryColor};
                    --background: ${colors.background};
                    --surface: ${colors.surface};
                    --surface-hover: ${colors.surfaceHover};
                    --text: ${colors.text};
                    --text-secondary: ${colors.textSecondary};
                    --border: ${colors.border};
                    --shadow: ${colors.shadow};
                    
                    font-family: ${this.config.fontFamily};
                    position: fixed;
                    z-index: 999999;
                    direction: ltr;
                }
                
                .helferlain-widget * {
                    box-sizing: border-box;
                }
                
                /* Bubble Mode Positioning */
                .helferlain-widget.helferlain-bubble.helferlain-bottom-right {
                    bottom: 20px;
                    right: 20px;
                }
                
                .helferlain-widget.helferlain-bubble.helferlain-bottom-left {
                    bottom: 20px;
                    left: 20px;
                }
                
                .helferlain-widget.helferlain-bubble.helferlain-top-right {
                    top: 20px;
                    right: 20px;
                }
                
                .helferlain-widget.helferlain-bubble.helferlain-top-left {
                    top: 20px;
                    left: 20px;
                }
                
                /* Bubble Trigger */
                .helferlain-bubble-trigger {
                    width: 60px;
                    height: 60px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 20px var(--shadow);
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .helferlain-bubble-trigger:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px var(--shadow);
                }
                
                .helferlain-bubble-icon {
                    width: 24px;
                    height: 24px;
                    color: white;
                }
                
                .helferlain-bubble-icon svg {
                    width: 100%;
                    height: 100%;
                    fill: currentColor;
                }
                
                .helferlain-notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ef4444;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                /* Chat Window */
                .helferlain-chat-window {
                    width: 350px;
                    height: 500px;
                    background: var(--background);
                    border-radius: ${this.config.borderRadius};
                    box-shadow: 0 10px 40px var(--shadow);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                    transition: all 0.3s ease;
                }
                
                .helferlain-chat-window.helferlain-opening {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                
                .helferlain-chat-window.helferlain-closing {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                
                /* Inline Mode */
                .helferlain-widget.helferlain-inline {
                    position: static;
                    width: 100%;
                    height: 100%;
                }
                
                .helferlain-chat-window.helferlain-inline {
                    position: static;
                    width: 100%;
                    height: 100%;
                    box-shadow: 0 2px 10px var(--shadow);
                    opacity: 1;
                    transform: none;
                    transition: none;
                }
                
                /* Modal Mode */
                .helferlain-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                }
                
                .helferlain-chat-window.helferlain-modal {
                    position: static;
                    transform: none;
                    opacity: 1;
                    max-width: 90vw;
                    max-height: 90vh;
                }
                
                /* Chat Header */
                .helferlain-chat-header {
                    background: var(--primary-color);
                    color: white;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .helferlain-bot-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .helferlain-bot-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .helferlain-bot-details h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .helferlain-status {
                    margin: 2px 0 0 0;
                    font-size: 12px;
                    opacity: 0.9;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .helferlain-status-dot {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                }
                
                .helferlain-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 6px;
                    transition: background-color 0.2s;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .helferlain-close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .helferlain-close-btn svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }
                
                /* Messages Area */
                .helferlain-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    scroll-behavior: smooth;
                }
                
                .helferlain-message {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    word-wrap: break-word;
                    line-height: 1.4;
                    animation: helferlain-message-in 0.3s ease;
                }
                
                @keyframes helferlain-message-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .helferlain-message.helferlain-user {
                    background: var(--primary-color);
                    color: white;
                    align-self: flex-end;
                    margin-left: auto;
                }
                
                .helferlain-message.helferlain-assistant {
                    background: var(--surface);
                    color: var(--text);
                    align-self: flex-start;
                }
                
                .helferlain-message.helferlain-error {
                    background: #fef2f2;
                    color: #dc2626;
                    border: 1px solid #fecaca;
                }
                
                .helferlain-message-content {
                    margin-bottom: 4px;
                }
                
                .helferlain-message-content a {
                    color: inherit;
                    text-decoration: underline;
                }
                
                .helferlain-message-time {
                    font-size: 11px;
                    opacity: 0.7;
                    text-align: right;
                }
                
                .helferlain-message.helferlain-assistant .helferlain-message-time {
                    text-align: left;
                }
                
                /* Typing Indicator */
                .helferlain-typing-indicator {
                    padding: 12px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .helferlain-typing-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--surface);
                    padding: 8px 12px;
                    border-radius: 12px;
                }
                
                .helferlain-typing-dots {
                    display: flex;
                    gap: 4px;
                }
                
                .helferlain-typing-dots span {
                    width: 6px;
                    height: 6px;
                    background: var(--text-secondary);
                    border-radius: 50%;
                    animation: helferlain-typing 1.4s infinite ease-in-out;
                }
                
                .helferlain-typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .helferlain-typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes helferlain-typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-8px);
                        opacity: 1;
                    }
                }
                
                .helferlain-typing-text {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                
                /* Input Area */
                .helferlain-input-area {
                    border-top: 1px solid var(--border);
                    padding: 16px 20px;
                    background: var(--background);
                }
                
                .helferlain-input-form {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                }
                
                .helferlain-input-form input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    outline: none;
                    font-size: 14px;
                    font-family: inherit;
                    background: var(--background);
                    color: var(--text);
                    transition: border-color 0.2s;
                    resize: none;
                    min-height: 44px;
                    max-height: 120px;
                }
                
                .helferlain-input-form input:focus {
                    border-color: var(--primary-color);
                }
                
                .helferlain-input-form input::placeholder {
                    color: var(--text-secondary);
                }
                
                .helferlain-input-form button {
                    width: 44px;
                    height: 44px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                
                .helferlain-input-form button:hover:not(:disabled) {
                    transform: scale(1.05);
                    box-shadow: 0 2px 8px var(--shadow);
                }
                
                .helferlain-input-form button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .helferlain-input-form button svg {
                    width: 18px;
                    height: 18px;
                    fill: currentColor;
                }
                
                /* Branding */
                .helferlain-branding {
                    text-align: center;
                    font-size: 11px;
                    color: var(--text-secondary);
                    margin-top: 8px;
                }
                
                .helferlain-branding a {
                    color: var(--primary-color);
                    text-decoration: none;
                }
                
                .helferlain-branding a:hover {
                    text-decoration: underline;
                }
                
                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .helferlain-widget.helferlain-bubble {
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        width: auto;
                    }
                    
                    .helferlain-chat-window {
                        width: 100%;
                        height: 70vh;
                        bottom: 80px;
                        right: 0;
                        left: 0;
                        border-radius: ${this.config.borderRadius} ${this.config.borderRadius} 0 0;
                    }
                    
                    .helferlain-bubble-trigger {
                        margin-left: auto;
                        width: 56px;
                        height: 56px;
                    }
                    
                    .helferlain-bubble-icon {
                        width: 20px;
                        height: 20px;
                    }
                }
                
                /* Print Media - Hide Widget */
                @media print {
                    .helferlain-widget {
                        display: none !important;
                    }
                }
                
                /* Reduced Motion */
                @media (prefers-reduced-motion: reduce) {
                    .helferlain-widget *,
                    .helferlain-widget *::before,
                    .helferlain-widget *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
                
                /* High Contrast Mode */
                @media (prefers-contrast: high) {
                    .helferlain-widget {
                        --border: #000000;
                        --shadow: rgba(0, 0, 0, 0.8);
                    }
                    
                    .helferlain-message {
                        border: 2px solid currentColor;
                    }
                }
            `;
        }
        
        // Event Handlers
        handleMessage(e) {
            e.preventDefault();
            
            const input = this.element.querySelector('[data-role="input"]');
            const message = input.value.trim();
            
            if (!message || this.isLoading) return;
            
            this.sendMessage(message);
            input.value = '';
        }
        
        handleKeyPress(e) {
            if (e.key === 'Enter' && !e.shiftKey && !this.isLoading) {
                e.preventDefault();
                this.handleMessage(e);
            }
        }
        
        handleOutsideClick(e) {
            if (this.isOpen && !this.element.contains(e.target)) {
                this.close();
            }
        }
        
        // Public API Methods
        async sendMessage(message) {
            if (this.isLoading) return;
            
            try {
                this.isLoading = true;
                this.updateSendButton(true);
                
                // User-Message anzeigen
                this.addMessage({
                    role: 'user',
                    content: message,
                    timestamp: new Date()
                });
                
                // Typing-Indicator anzeigen
                this.showTyping();
                
                // Message an API senden
                const response = await this.fetchWithTimeout(
                    `${this.config.apiEndpoint}/bot/${this.config.botId}/chat`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            conversation_id: this.sessionId
                        }),
                        timeout: 30000
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`Chat request failed (${response.status})`);
                }
                
                const data = await response.json();
                
                // Kleine Verzögerung für bessere UX
                await this.sleep(this.config.messageDelay);
                
                // Bot-Response anzeigen
                this.addMessage({
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date(),
                    sources: data.sources
                });
                
                // Callbacks
                this.trigger('message', { message, response: data });
                this.trigger('response', data);
                
                // Potentielle Modals verarbeiten
                if (data.metadata?.show_email_modal) {
                    setTimeout(() => this.showEmailModal(data.metadata), 1000);
                }
                
                if (data.metadata?.show_contact_modal) {
                    setTimeout(() => this.showContactModal(data.metadata), 1000);
                }
                
            } catch (error) {
                this.error('Message sending failed:', error);
                
                this.addMessage({
                    role: 'assistant',
                    content: 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.',
                    timestamp: new Date(),
                    isError: true
                });
                
                this.trigger('error', error);
                
            } finally {
                this.hideTyping();
                this.isLoading = false;
                this.updateSendButton(false);
                this.focusInput();
            }
        }
        
        open() {
            if (this.isOpen) return;
            
            this.log('Opening chat widget');
            
            const window = this.element.querySelector('[data-role="window"]');
            const overlay = this.element.querySelector('[data-role="overlay"]');
            
            if (overlay) {
                overlay.style.display = 'flex';
            }
            
            if (window) {
                window.style.display = 'flex';
                
                // Animation für bessere UX
                requestAnimationFrame(() => {
                    window.classList.add('helferlain-opening');
                    
                    setTimeout(() => {
                        window.classList.remove('helferlain-opening');
                    }, 300);
                });
            }
            
            this.isOpen = true;
            
            // Welcome Message anzeigen (nur beim ersten Öffnen)
            if (this.messages.length === 0 && this.config.welcomeMessage) {
                setTimeout(() => {
                    this.addMessage({
                        role: 'assistant',
                        content: this.config.welcomeMessage,
                        timestamp: new Date()
                    });
                }, 500);
            }
            
            // Focus auf Input
            setTimeout(() => this.focusInput(), 100);
            
            this.trigger('open');
        }
        
        close() {
            if (!this.isOpen) return;
            
            this.log('Closing chat widget');
            
            const window = this.element.querySelector('[data-role="window"]');
            const overlay = this.element.querySelector('[data-role="overlay"]');
            
            if (window) {
                window.classList.add('helferlain-closing');
                
                setTimeout(() => {
                    window.style.display = 'none';
                    window.classList.remove('helferlain-closing');
                    
                    if (overlay) {
                        overlay.style.display = 'none';
                    }
                }, 300);
            }
            
            this.isOpen = false;
            this.trigger('close');
        }
        
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
        
        destroy() {
            this.log('Destroying widget');
            
            // Event-Listener entfernen
            document.removeEventListener('click', this.handleOutsideClick);
            
            // Widget aus DOM entfernen
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            
            // Styles entfernen (nur wenn es das einzige Widget ist)
            const widgets = document.querySelectorAll('.helferlain-widget');
            if (widgets.length === 0) {
                const styles = document.querySelector('#helferlain-widget-styles');
                if (styles) styles.remove();
            }
            
            this.trigger('destroyed');
        }
        
        // Helper Methods
        addMessage(message) {
            this.messages.push(message);
            
            // Message-Limit beachten
            if (this.messages.length > this.config.maxMessages) {
                this.messages = this.messages.slice(-this.config.maxMessages);
                
                // Alte Messages aus DOM entfernen
                const messagesContainer = this.element.querySelector('[data-role="messages"]');
                const messageElements = messagesContainer.querySelectorAll('.helferlain-message');
                if (messageElements.length > this.config.maxMessages) {
                    messageElements[0].remove();
                }
            }
            
            const messagesContainer = this.element.querySelector('[data-role="messages"]');
            const messageElement = this.createMessageElement(message);
            
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        createMessageElement(message) {
            const div = document.createElement('div');
            div.className = `helferlain-message helferlain-${message.role}`;
            
            if (message.isError) {
                div.classList.add('helferlain-error');
            }
            
            const content = document.createElement('div');
            content.className = 'helferlain-message-content';
            content.innerHTML = this.formatMessage(message.content);
            
            const time = document.createElement('div');
            time.className = 'helferlain-message-time';
            time.textContent = this.formatTime(message.timestamp);
            
            div.appendChild(content);
            div.appendChild(time);
            
            return div;
        }
        
        formatMessage(content) {
            // Basic HTML-Escape und Link-Erkennung
            return content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
                .replace(/\n/g, '<br>');
        }
        
        formatTime(timestamp) {
            return new Date(timestamp).toLocaleTimeString(this.config.language === 'de' ? 'de-DE' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        showTyping() {
            if (this.isTyping) return;
            
            const typing = this.element.querySelector('[data-role="typing"]');
            if (typing) {
                typing.style.display = 'flex';
                this.isTyping = true;
                
                // Auto-scroll
                const messagesContainer = this.element.querySelector('[data-role="messages"]');
                messagesContainer.scrollTop = messagesContainer.scrollHeight + 100;
            }
        }
        
        hideTyping() {
            const typing = this.element.querySelector('[data-role="typing"]');
            if (typing) {
                typing.style.display = 'none';
                this.isTyping = false;
            }
        }
        
        updateSendButton(loading) {
            const button = this.element.querySelector('[data-role="send"]');
            if (button) {
                button.disabled = loading;
                
                if (loading) {
                    button.innerHTML = this.getIcon('loading');
                } else {
                    button.innerHTML = this.getIcon('send');
                }
            }
        }
        
        focusInput() {
            const input = this.element.querySelector('[data-role="input"]');
            if (input && this.isOpen) {
                input.focus();
            }
        }
        
        showEmailModal(metadata) {
            // Vereinfachte Modal-Implementierung
            const email = prompt(metadata.email_prompt || 'Email-Adresse eingeben:');
            if (email && this.validateEmail(email)) {
                this.addMessage({
                    role: 'assistant',
                    content: `Vielen Dank! Ihre Email-Adresse ${email} wurde gespeichert.`,
                    timestamp: new Date()
                });
            }
        }
        
        showContactModal(metadata) {
            // Vereinfachte Contact-Modal
            if (metadata.contact_persons && metadata.contact_persons.length > 0) {
                const contacts = metadata.contact_persons
                    .map(contact => `${contact.name} (${contact.role})`)
                    .join('\n');
                    
                this.addMessage({
                    role: 'assistant',
                    content: `Unsere Ansprechpartner:\n\n${contacts}`,
                    timestamp: new Date()
                });
            }
        }
        
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        generateSessionId() {
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        async fetchWithTimeout(url, options = {}) {
            const { timeout = 10000, ...fetchOptions } = options;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    ...fetchOptions,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
        
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        getIcon(name) {
            const icons = {
                chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
                close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
                send: '<svg viewBox="0 0 24 24"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/></svg>',
                loading: '<svg viewBox="0 0 24 24" class="helferlain-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="32" stroke-dashoffset="32"><animate attributeName="stroke-dasharray" dur="1s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/><animate attributeName="stroke-dashoffset" dur="1s" values="0;-16;-32;-32" repeatCount="indefinite"/></circle></svg>'
            };
            
            return icons[name] || '';
        }
        
        getDefaultAvatar() {
            return 'data:image/svg+xml;base64,' + btoa(`
                <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="${this.config.primaryColor}"/>
                    <circle cx="20" cy="16" r="6" fill="white"/>
                    <path d="M20 24c-8 0-12 4-12 8v4h24v-4c0-4-4-8-12-8z" fill="white"/>
                </svg>
            `);
        }
        
        // Event System
        trigger(eventName, data = null) {
            const event = new CustomEvent(`helferlain:${eventName}`, {
                detail: { widget: this, data: data }
            });
            window.dispatchEvent(event);
            
            // Callback-Handler
            const callbackName = `on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;
            if (typeof this.config[callbackName] === 'function') {
                this.config[callbackName](data);
            }
        }
        
        // Logging
        log(...args) {
            if (this.config.debug) {
                console.log('[HelferLain Widget]', ...args);
            }
        }
        
        error(...args) {
            console.error('[HelferLain Widget]', ...args);
        }
        
        showError(message) {
            this.error('Error:', message);
            
            if (this.element) {
                this.addMessage({
                    role: 'assistant',
                    content: message,
                    timestamp: new Date(),
                    isError: true
                });
            }
        }
    }
    
    // Globale HelferLain API
    window.HelferLain = {
        // Widget initialisieren
        init: function(config) {
            if (!config || !config.botId) {
                throw new Error('HelferLain Widget: botId is required');
            }
            
            const widget = new HelferLainWidget(config);
            widget.init();
            
            // Widget zur globalen Liste hinzufügen
            this.widgets.push(widget);
            
            return widget;
        },
        
        // Alle aktiven Widgets
        widgets: [],
        
        // Version
        version: '1.0.0',
        
        // Utility-Funktionen
        openAll: function() {
            this.widgets.forEach(widget => widget.open());
        },
        
        closeAll: function() {
            this.widgets.forEach(widget => widget.close());
        },
        
        destroyAll: function() {
            this.widgets.forEach(widget => widget.destroy());
            this.widgets = [];
        },
        
        // Theme switching
        setTheme: function(theme) {
            this.widgets.forEach(widget => {
                widget.config.theme = theme;
                widget.loadStyles();
            });
        },
        
        // Debug-Modus
        enableDebug: function() {
            this.widgets.forEach(widget => {
                widget.config.debug = true;
            });
        },
        
        // Initialized flag
        initialized: true
    };
    
    // Auto-Initialize bei data-bot-id Elementen
    function autoInitialize() {
        const elements = document.querySelectorAll('[data-bot-id]:not([data-helferlain-initialized])');
        
        elements.forEach(element => {
            const config = {
                botId: element.getAttribute('data-bot-id'),
                mode: element.getAttribute('data-mode') || 'bubble',
                theme: element.getAttribute('data-theme') || 'light',
                position: element.getAttribute('data-position') || 'bottom-right',
                autoOpen: element.getAttribute('data-auto-open') === 'true',
                targetElement: element.getAttribute('data-mode') === 'inline' ? element : null
            };
            
            try {
                const widget = window.HelferLain.init(config);
                element.setAttribute('data-helferlain-initialized', 'true');
                console.log('HelferLain Widget auto-initialized for bot:', config.botId);
            } catch (error) {
                console.error('HelferLain Widget auto-initialization failed:', error);
            }
        });
    }
    
    // Auto-Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitialize);
    } else {
        autoInitialize();
    }
    
    // Beobachte DOM-Änderungen für dynamisch hinzugefügte Elemente
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function(mutations) {
            let shouldAutoInit = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.hasAttribute && node.hasAttribute('data-bot-id') && 
                                !node.hasAttribute('data-helferlain-initialized')) {
                                shouldAutoInit = true;
                            }
                            
                            const childElements = node.querySelectorAll && 
                                node.querySelectorAll('[data-bot-id]:not([data-helferlain-initialized])');
                            if (childElements && childElements.length > 0) {
                                shouldAutoInit = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldAutoInit) {
                autoInitialize();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    console.log('HelferLain Widget loaded successfully (v' + window.HelferLain.version + ')');
    
})(window);