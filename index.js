const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = 3000;
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.use(cors());
app.use(express.json());

let userSessions = {};

app.post("/chat", async (req, res) => {
    const { userId, message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    if (!userSessions[userId]) {
        userSessions[userId] = { chatHistory: [] };
    }

    userSessions[userId].chatHistory.push({ role: "user", text: message });

    const chatHistory = userSessions[userId].chatHistory.map(chat => `${chat.role}: ${chat.text}`).join("\n");

    const fullPrompt = `
        You are CareWise, an AI-powered medical assistant. You must follow these conditions:
        - If the user mentions symptoms, analyze them and suggest **only** what they need (medicines, home remedies, or dietary tips) using **friendly and concise responses** with **emojis**. 😊💊🍵
        - If they ask for medicines, suggest appropriate ones with side effects and allergy warnings. ⚠️
        - If they ask about hospitals/doctors, provide relevant recommendations. 🏥👩‍⚕️
        - If they ask about food, suggest what’s best based on their condition. 🥗🍎
        - If their query is general, answer in a **helpful, friendly tone with emojis**.

        Also, always ensure that when providing symptom analysis or treatment advice, you include this:
        "By entering their symptoms, users can quickly receive information on effective medications, potential side effects, allergy cautions, and practical home remedies to alleviate their discomfort. CareWise empowers users to make informed decisions about their health and provides peace of mind while they decide whether to seek further medical consultation."
           IMPORTANT: Only provide information **relevant to the user's current message**. Do not give extra details.
        Here is the conversation history:
        ${chatHistory}

        Now, respond to the user’s latest message in a **friendly and engaging way with emojis**.
    `;

    try {
        const response = await model.generateContent({
            contents: [{ parts: [{ text: fullPrompt }] }]
        });

        let reply = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to assist you with medical advice! 😊";
        reply = reply.replace(/\. /g, ".\n"); // Ensure line breaks after sentences

        userSessions[userId].chatHistory.push({ role: "assistant", text: reply });

        return res.json({ reply });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));