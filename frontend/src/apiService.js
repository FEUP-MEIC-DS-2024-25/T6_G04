export const generateContent = async (prompt) => {
    const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    return data.generatedText;
};
