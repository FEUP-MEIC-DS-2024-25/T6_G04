import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './styling.css';


const App = () => {
    const [files, setFiles] = useState([]); // To store the selected file
    const [uploadStatus, setUploadStatus] = useState(''); // To store the upload response
    const [finalMessage, setFinalMessage] = useState(''); // To store the final output message
    const [spinner, setSpinnerVisibility] = useState(false); //To store spinner's visibilty

    // Handle file selection
    const handleFileChange = (e) => {
        const allowedTypes = [".txt", ".log", ".csv", ".json"]; // Add allowed formats
        const files = Array.from(e.target.files); // Access selected files
        console.log("Selected files:", files);
    
        const invalidFiles = files.filter(
            (file) =>
                !allowedTypes.includes(file.name.slice(file.name.lastIndexOf(".")).toLowerCase())
        );
    
        if (invalidFiles.length > 0) {
            alert(`Unsupported file types: ${invalidFiles.map((file) => file.name).join(", ")}`);
        } else {
            setFiles(files); // Store the valid files
            console.log("Valid files set to state:", files);
        }
    };

    // Handle file upload
    const handleFileUpload = async () => {
        console.log("Handle File Upload: Checking if there is a file to be uploaded.");
        if (files.length === 0) {
            setUploadStatus("Please select a file.");
            return;
        }
    
        console.log("Handle File Upload: Trying to fetch data.");
        setSpinnerVisibility(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append("logfiles", file); // Append each file to the FormData
            });
    
            const response = await fetch('http://localhost:3000/upload-log', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response from backend:", errorData);
                setUploadStatus(`Error: ${errorData.error || 'Upload failed'}`);
                setSpinnerVisibility(false);
                return;
            }
    
            const data = await response.json();
            console.log("Backend response:", data);
    
            setUploadStatus(data.geminiResponses.message);
    
            if (data.geminiResponses?.length > 0){
                let accumulatedResponses = "";

                for (let i = 0; i < data.geminiResponses.length; i++) {
                    const currentFile = data.geminiResponses[i].file;
                    const currentResponse = data.geminiResponses[i].response;

                    if (typeof currentFile !== "string" || typeof currentResponse !== "string") {
                        console.error("Invalid response data:", currentFile, currentResponse);
                        continue; 
                    }

                    accumulatedResponses += `\n\n|------------------------------------|\n\nFile: ${String(currentFile)}\n\nResponse:\n${String(currentResponse)}`;
                }

                setFinalMessage(accumulatedResponses || "No content available");
                console.log("Updated finalMessage:", accumulatedResponses);
                
                /*
                const { file, response } = data.geminiResponses;
                const allResponses = `File: ${file}\n\nResponse:\n${response}`;
                setFinalMessage(finalMessage + "\n\n" + allResponses);
                */
            } else {
                setFinalMessage("No Gemini responses were received.");
            }
    
            setSpinnerVisibility(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('An error occurred during the file upload.');
            setSpinnerVisibility(false);
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
                <input type="file" accept=".txt,.log,.csv,.json" multiple onChange={handleFileChange} />
            </div>
    
            {/* Button and spinner container */}
            <div className="upload-container">
                <button
                    onClick={() => {
                        console.log("Upload button clicked!");
                        handleFileUpload();
                    }}
                    style={{ marginLeft: '10px' }}
                >
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
                        <ReactMarkdown>{finalMessage || "No content available"}</ReactMarkdown>
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
