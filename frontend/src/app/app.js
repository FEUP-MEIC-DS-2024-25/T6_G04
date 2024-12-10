import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './styling.css';


const App = () => {
    const [file, setFile] = useState(null); // To store the selected file
    const [uploadStatus, setUploadStatus] = useState(''); // To store the upload response
    const [finalMessage, setFinalMessage] = useState(''); // To store the final output message
    const [spinner, setSpinnerVisibility] = useState(false); //To store spinner's visibilty

    // Handle file selection
    const handleFileChange = (event) => {
        setFile(event.target.files[0]); // Store the selected file in state
    };

    // Handle file upload
    const handleFileUpload = async () => {
        if (!file) {
            setUploadStatus('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('logfile', file); // Key must match the backend's `upload.single('logfile')`

        try {
            // Turn the spinner visibility on
            setSpinnerVisibility(true);

            const response = await fetch('http://localhost:3000/upload-log', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                setUploadStatus(`Error: ${errorData.error || 'Upload failed'}`);
                return;
            }

            const data = await response.json();
            setUploadStatus(data.message);
            
            // Get only the last message from the conversation (Gemini's response)
            const lastMessage = data.conversation?.[data.conversation.length - 1] || '';
            setFinalMessage(lastMessage);

            // Turn the spinner visibility off
            setSpinnerVisibility(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('An error occurred during the file upload.');
        }
    };

    // Handle Markdown Download
    const handleDownloadMarkdown = () => {
        if (!finalMessage) {
            alert('No output message available to download.');
            return;
        }

        const markdownContent = finalMessage; 
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'Patterns.md'; // Filename for the download
        link.click();

        // Clean up URL object
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Pattern Partner</h1>
            <div style={{ marginBottom: '10px' }}>
                <input type="file" accept=".txt" onChange={handleFileChange} />
            </div>
    
            {/* Button and spinner container */}
            <div className="upload-container">
                <button onClick={handleFileUpload} style={{ marginLeft: '10px' }}>
                    Upload File
                </button>
    
                {/* Display Spinner */}
                {spinner && (
                    <div className="loader"></div>
                )}
            </div>
    
            {uploadStatus && <p style={{ marginTop: '10px', color: 'black' }}>{uploadStatus}</p>}
    
            {/* Display the final message */}
            {finalMessage && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Final Output:</h2>
                    <div
                        style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            border: '1px solid #ccc',
                            padding: '10px',
                        }}
                    >
                        <ReactMarkdown>{finalMessage}</ReactMarkdown>
                    </div>
                    <button
                        onClick={handleDownloadMarkdown}
                        style={{
                            marginTop: '10px',
                            backgroundColor: 'black',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            cursor: 'pointer',
                        }}
                    >
                        Download as Markdown
                    </button>
                </div>
            )}
        </div>
    );
    
};

export default App;
