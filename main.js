function toggleButton() {
            const input = document.getElementById("userMessage");
            const button = document.getElementById("sendButton");

            if (input.value.trim() !== "") {
                button.classList.add("enabled");
                button.disabled = false;
                button.innerText = "Send";
            } else {
                button.classList.remove("enabled");
                button.disabled = true;
                button.innerText = "Ask";
            }
        }

        async function sendMessage() {
            const input = document.getElementById("userMessage");
            const button = document.getElementById("sendButton");
            const chatbox = document.getElementById("chatbox");
            const statement = document.getElementById("chat-statement");
            const userId = "unique_user";  

            if (!input.value.trim()) return;

            if (statement) statement.style.display = "none";

            const userMessage = document.createElement("div");
            userMessage.className = "message user";
            userMessage.innerText = input.value;
            chatbox.prepend(userMessage);

            const loadingMessage = document.createElement("div");
            loadingMessage.className = "message ai loading";
            loadingMessage.innerText = "AI is typing...";
            chatbox.prepend(loadingMessage);

            const userText = input.value;
            input.value = "";
            toggleButton();

            try {
                const response = await fetch("http://localhost:3000/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, message: userText })
                });

                const data = await response.json();
                chatbox.removeChild(loadingMessage);

                const aiMessage = document.createElement("div");
                aiMessage.className = "message ai";
                aiMessage.innerText = data.reply;
                chatbox.prepend(aiMessage);
            } catch (error) {
                chatbox.removeChild(loadingMessage);
                alert("Server error. Please try again.");
            }
        }
