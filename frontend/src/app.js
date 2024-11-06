import React, { useState } from 'react';
import { generateContent } from './apiService';

const App = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');

    const handleGenerate = async () => {
        try {
            const result = await generateContent(prompt);
            setResponse(result);
        } catch (error) {
            console.error('Error generating content:', error);
            setResponse('Error generating content');
        }
    };

    return (
        <div>
        <h1>Gemini Content Generator</h1>
        <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt"
        />
        <button onClick={handleGenerate}>Generate</button>
        <div>
            <h2>Response:</h2>
            <p>{response}</p>
        </div>
        </div>
    );
};

export default App;
