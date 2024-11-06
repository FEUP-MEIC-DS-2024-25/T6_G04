const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/generate', async (req, res) => {
	const { prompt } = req.body;

	if (!prompt) {
		return res.status(400).json({ error: 'Prompt is required' });
	}

	try {
		const result = await model.generateContent([prompt]);
		const response = await result.response;
		res.json({ generatedText: response.text() });
	} catch (error) {
		console.error('Error generating content:', error);
		res.status(500).json({ error: 'Failed to generate content' });
	}
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
