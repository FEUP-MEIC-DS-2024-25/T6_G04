import React, { useState } from 'react';

const App = () => {
    const [file, setFile] = useState(null); // To store the selected file
    const [uploadStatus, setUploadStatus] = useState(''); // To store the upload response
    //const [conversation, setConversation] = useState([]);
    const [finalMessage, setFinalMessage] = useState(''); // To store the final output message

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
            
            // Update the conversation state
            //setConversation(data.conversation || []);
            const lastMessage = data.conversation?.[data.conversation.length - 1] || '';
            setFinalMessage(lastMessage);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('An error occurred during the file upload.');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Pattern Partner</h1>
            <div style={{ marginBottom: '10px' }}>
                <input type="file" accept=".txt" onChange={handleFileChange} />
            </div>
            <button onClick={handleFileUpload} style={{ marginLeft: '10px' }}>
                Upload File
            </button>
            {uploadStatus && <p style={{ marginTop: '10px', color: 'blue' }}>{uploadStatus}</p>}

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
                        <p>{finalMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
