import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve HTML/JS/CSS

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const resp = await fetch(
            "https://api.generativeai.google/v1beta2/models/gemini-1.5-chat:generateMessage",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
                },
                body: JSON.stringify({
                    prompt: {
                        messages: [
                            { role: "user", content: message }
                        ]
                    }
                })
            }
        );

        const data = await resp.json();
        const reply = data.candidates?.[0]?.content?.[0]?.text || 'Desculpe, não entendi.';
        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ reply: 'Ocorreu um erro ao tentar responder.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
