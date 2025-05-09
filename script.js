const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const GOOGLE_GEMINI_API_KEY = 'AIzaSyCFxaPjEKh6IjqPHnJkPD0yTjbIjmd3cSY'; // <--- Updated API Key
const GOOGLE_GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;


function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    // Use innerHTML to render potential markdown from the API response
    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to get a response from the Google Gemini API
async function getBotResponse(userMessage) {
    // Check if the API key is set (though it's now hardcoded from the user query)
    if (!GOOGLE_GEMINI_API_KEY || GOOGLE_GEMINI_API_KEY === 'YOUR_GOOGLE_GEMINI_API_KEY') {
        console.error("Google Gemini API key is not set correctly.");
        return "Error: Google Gemini API key is not configured.";
    }

    try {
        const response = await fetch(GOOGLE_GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Gemini API expects content in this format
                contents: [
                    {
                        role: "user",
                        parts: [{ text: userMessage }]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", response.status, errorData);
            // Provide more specific error messages if available
            if (errorData && errorData.error && errorData.error.message) {
                 return `Error: API returned status ${response.status}. Message: ${errorData.error.message}`;
            }
            return `Error: Unable to get response from API. Status: ${response.status}`;
        }

        const data = await response.json();
        // Extract the bot's message from the Gemini response format
        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.warn("API Response did not contain expected message format:", data);
             // Check for potential 'promptFeedback' which might indicate issues
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                return `Response blocked due to: ${data.promptFeedback.blockReason}`;
            }
            return "Error: Invalid response format from API.";
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        return `Error: Failed to connect to API. ${error.message}`;
    }
}

// Event listener for the send button
sendButton.addEventListener('click', async () => {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, 'user');
        userInput.value = ''; // Clear the input field

        // Optional: Display a typing indicator
        // const typingIndicator = addMessage("Bot is thinking...", 'bot'); // Add and store the element

        // Get and display bot response from the API
        const botResponse = await getBotResponse(userMessage);

        // Optional: Remove the typing indicator before adding the actual response
        // if (typingIndicator && typingIndicator.parentNode) {
        //     typingIndicator.parentNode.removeChild(typingIndicator);
        // }

        addMessage(botResponse, 'bot');
    }
});

// Event listener for pressing Enter key in the input field
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        sendButton.click(); // Trigger the button click event
    }
});
