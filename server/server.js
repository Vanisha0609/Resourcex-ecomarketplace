require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai"); // Use OpenAI directly, NOT { Configuration, OpenAIApi }

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure .env contains this key
});

console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "Not Found");

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));


