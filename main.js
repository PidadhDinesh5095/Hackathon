
        async function sendMessage() {
            const userMessage = document.getElementById("userMessage").value;
            if (!userMessage) {
                alert("Please type a message.");
                return;
            }

            const chatbox = document.getElementById("chatbox");
            chatbox.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;

            document.getElementById("userMessage").value = "";

            // Show loading effect
            const loadingMessage = document.createElement("p");
            loadingMessage.classList.add("loading");
            loadingMessage.textContent = "AI is typing...";
            chatbox.appendChild(loadingMessage);

            try {
                const response = await fetch("http://localhost:3000/chat", { // Fixed port number
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: userMessage }) // Fixed key
                });

                const data = await response.json();
                chatbox.removeChild(loadingMessage); // Remove loading message
                chatbox.innerHTML += `<p><strong>AI:</strong> ${data.reply}</p>`;
            } catch (error) {
                chatbox.removeChild(loadingMessage); // Remove loading message
                chatbox.innerHTML += `<p><strong>AI:</strong> Sorry, an error occurred.</p>`;
            }
        }
  