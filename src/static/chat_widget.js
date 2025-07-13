// Embeddable chat widget JavaScript
(function () {
    const scriptTag = document.getElementById('chat-widget-script')

    // CSS styles for the chat widget
    const styles = `
    #chat-widget {
        display: none
        position: fixed
        bottom: 20px
        right: 20px
        width: 320px
        height: 480px
        border-radius: 12px
        box-shadow: 0 4px 24px rgba(0,0,0,0.18)
        overflow: hidden
        background: #fff
        border: 1px solid #e0e0e0
        z-index: 1100
        font-family: 'Segoe UI', Arial, sans-serif
    }
    #chat-header {
        background: linear-gradient(90deg, #0078d4 60%, #005fa3 100%)
        color: #fff
        padding: 14px 16px
        font-size: 18px
        font-weight: 600
        text-align: left
        position: relative
        letter-spacing: 1px
    }
    #close-btn {
        position: absolute
        right: 16px
        top: 12px
        font-size: 22px
        cursor: pointer
        color: #fff
        transition: color 0.2s
    }
    #close-btn:hover {
        color: #ff5252
    }
    #chat-history {
        padding: 12px 10px 12px 10px
        height: 340px
        overflow-y: auto
        background: #f8fafd
        border-top: 1px solid #e0e0e0
        border-bottom: 1px solid #e0e0e0
        display: flex
        flex-direction: column
        gap: 8px
    }
    .message.bot {
        align-self: flex-start
        background: #e3f0fc
        color: #222
        border-radius: 16px 16px 16px 4px
        padding: 8px 14px
        max-width: 80%
        font-size: 15px
        box-shadow: 0 1px 2px rgba(0,0,0,0.04)
    }
    .message.user {
        align-self: flex-end
        background: #0078d4
        color: #fff
        border-radius: 16px 16px 4px 16px
        padding: 8px 14px
        max-width: 80%
        font-size: 15px
        box-shadow: 0 1px 2px rgba(0,0,0,0.04)
    }
    #chat-input-container {
        display: flex
        padding: 10px
        background: #f8fafd
        border-top: 1px solid #e0e0e0
    }
    #chat-input {
        flex: 1
        padding: 8px 10px
        border: 1px solid #ccc
        border-radius: 4px
        font-size: 15px
        outline: none
        transition: border 0.2s
    }
    #chat-input:focus {
        border: 1.5px solid #0078d4
    }
    #send-btn {
        padding: 8px 18px
        background: #0078d4
        color: #fff
        border: none
        border-radius: 4px
        font-size: 15px
        font-weight: 500
        cursor: pointer
        margin-left: 8px
        transition: background 0.2s
    }
    #send-btn:active {
        background: #005fa3
    }
    #chat-icon {
        position: fixed
        bottom: 20px
        right: 20px
        font-size: 38px
        cursor: pointer
        z-index: 1050
        background: #0078d4
        color: #fff
        border-radius: 50%
        width: 56px
        height: 56px
        display: flex
        align-items: center
        justify-content: center
        box-shadow: 0 2px 8px rgba(0,0,0,0.12)
        transition: background 0.2s
    }
    #chat-icon:hover {
        background: #005fa3
    }
    .loading-dots {
        display: inline-block
        width: 32px
        text-align: left
        margin-left: 4px
    }
    .loading-dots span {
        display: inline-block
        width: 6px
        height: 6px
        margin-right: 2px
        background: #0078d4
        border-radius: 50%
        opacity: 0.6
        animation: loading-bounce 1.2s infinite both
    }
    .loading-dots span:nth-child(2) {
        animation-delay: 0.2s
    }
    .loading-dots span:nth-child(3) {
        animation-delay: 0.4s
    }
    @keyframes loading-bounce {
        0%, 80%, 100% { transform: scale(0.8) opacity: 0.6 }
        40% { transform: scale(1.2) opacity: 1 }
    }
    `

    // HTML structure for the chat widget
    const widgetHTML = `
    <div id="chat-widget">
        <div id="chat-header">ZenLight
            <span id="close-btn">&times</span>
        </div>
        <div id="chat-history"></div>
        <div id="chat-input-container">
            <input type="text" id="chat-input" placeholder="Type your message..." autocomplete="off">
            <button id="send-btn">Send</button>
        </div>
    </div>
    <div id="chat-icon">💬</div>`

    // Append CSS styles to the head
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)

    // Append the HTML structure to the body
    const widgetDiv = document.createElement("div")
    widgetDiv.innerHTML = widgetHTML
    document.body.appendChild(widgetDiv)

    // JavaScript logic for the chat widget
    const chatWidget = document.getElementById('chat-widget')
    const chatIcon = document.getElementById('chat-icon')
    const closeBtn = document.getElementById('close-btn')
    const sendBtn = document.getElementById('send-btn')
    const chatInput = document.getElementById('chat-input')
    const chatHistory = document.getElementById('chat-history')
    // Use only timestamp for sessionId
    let sessionId = 'session-' + Date.now()

    // Show chat widget when clicking chat icon
    chatIcon.addEventListener('click', function () {
        chatWidget.style.display = 'block'
        chatIcon.style.display = 'none'
        chatInput.focus()
    })

    // Hide chat widget when clicking close button
    closeBtn.addEventListener('click', function () {
        chatWidget.style.display = 'none'
        chatIcon.style.display = 'flex'
    })

    // Handle send button or enter key press
    const handleUserMessage = () => {
        const userMessage = chatInput.value.trim()
        if (userMessage === '') return

        addMessageToHistory('user', userMessage) // Add user's message to chat history
        chatInput.value = ''
        chatInput.focus()

        // Show loading dots while waiting for response
        const loadingDiv = addLoadingDots()

        // Call backend API to get response
        fetchChatResponse(userMessage, loadingDiv)
    }

    sendBtn.addEventListener('click', handleUserMessage)
    chatInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            handleUserMessage()
        }
    })

    // Function to add a message to the chat history
    const addMessageToHistory = (sender, message) => {
        const messageDiv = document.createElement('div')
        messageDiv.classList.add('message', sender === 'user' ? 'user' : 'bot')
        messageDiv.textContent = message
        chatHistory.appendChild(messageDiv)
        chatHistory.scrollTop = chatHistory.scrollHeight // Auto-scroll to bottom
    }

    // Function to add loading dots to chat history
    const addLoadingDots = () => {
        const loadingDiv = document.createElement('div')
        loadingDiv.classList.add('message', 'bot')
        loadingDiv.innerHTML = `<span class="loading-dots"><span></span><span></span><span></span></span>`
        chatHistory.appendChild(loadingDiv)
        chatHistory.scrollTop = chatHistory.scrollHeight
        return loadingDiv
    }

    // Function to call backend API with user message
    const fetchChatResponse = async (userMessage, loadingDiv) => {
        let didRespond = false
        // Set a 5-second timeout
        const timeoutId = setTimeout(() => {
            if (!didRespond) {
                loadingDiv.remove()
                addMessageToHistory('bot', 'Error: No response from server. Please try again.')
                didRespond = true
            }
        }, 5000)
        try {
            const response = await fetch('http://127.0.0.1:5000/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    session_id: sessionId
                }),
            })
            if (!didRespond) {
                clearTimeout(timeoutId)
                loadingDiv.remove()
                if (response.ok) {
                    const data = await response.json()
                    if (data.status === 'success') {
                        addMessageToHistory('bot', data.response)
                    } else {
                        addMessageToHistory('bot', 'Error: ' + (data.response || 'Unknown error.'))
                    }
                } else {
                    addMessageToHistory('bot', 'Error: Failed to fetch response.')
                }
                didRespond = true
            }
        } catch (error) {
            if (!didRespond) {
                clearTimeout(timeoutId)
                loadingDiv.remove()
                addMessageToHistory('bot', 'Error: Network issue, please try again.')
                didRespond = true
            }
        }
    }
})()
