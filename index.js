const express = require("express");



const cors = require("cors");



const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();



const app = express();

const PORT = 3000;

const API_KEY ='AIzaSyBa1rUNG9UcKa4YZbrd7QLJlsYhIazG_z8';



const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });



app.use(cors());

app.use(express.json());



let userSessions = {};

app.get('/', (req, res) => {

  res.send("🚀 Server is running!");

});



app.post("/chat", async (req, res) => {

    let { userId, message } = req.body;

    

    if (!message) {

        return res.status(400).json({ error: "Message is required" });

    }



    if (!userId) {

        userId = "default_user";

    }



    if (!userSessions[userId]) {

        userSessions[userId] = { chatHistory: [] };

    }



    userSessions[userId].chatHistory.push({ role: "user", text: message });



    const chatHistory = userSessions[userId].chatHistory

        .map(chat => `${chat.role}: ${chat.text}`)

        .join("\n");



    const fullPrompt = `

        You are CareWise, an AI-powered medical assistant. Follow these rules:

        - If symptoms are mentioned, analyze them and suggest **only** relevant remedies (medicines, home remedies, or dietary tips) using **friendly and concise responses** with **emojis** 😊💊🍵.

        - If the user asks for medicines, provide names along with **side effects** and **allergy warnings** ⚠️.

        - If asked about hospitals/doctors, give relevant recommendations 🏥👩‍⚕️.

        - If they ask about food, suggest items based on their health 🥗🍎.

        - Respond in a **friendly, engaging tone with emojis**.



        Always include this statement:

        "By entering their symptoms, users can quickly receive information on effective medications, potential side effects, allergy cautions, and practical home remedies to alleviate their discomfort. CareWise empowers users to make informed decisions about their health and provides peace of mind while they decide whether to seek further medical consultation."



        **Chat history so far:**

        ${chatHistory}



        Now, respond to the latest user message in a **friendly way with emojis**.

    `;



    try {

        const response = await model.generateContent({

            contents: [{ parts: [{ text: fullPrompt }] }]

        });



        let reply = "I'm here to assist you with medical advice! 😊";

        try {

            reply = response.response.candidates[0].content.parts[0].text || reply;

        } catch (err) {

            console.error("Response parsing error:", err);

        }



        userSessions[userId].chatHistory.push({ role: "assistant", text: reply });



        return res.json({ reply });

    } catch (error) {

        console.error("Error:", error);

        return res.status(500).json({ error: "Something went wrong" });

    }

});



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
