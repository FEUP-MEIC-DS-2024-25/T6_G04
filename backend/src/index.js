const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// Use the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

// Store the conversation history
let conversationHistory = [];

// Store Gemini responses
let geminiResponse = [];



/**
 * EVERY STRING SHOULD NOT BE SPECIFIED HERE.
 * ALL STRINGS SHOULD BE EXTERNALIZED INTO FILES.
 * YOU CAN CREATE A FOLDER NAMED "strings" OR SIMILAR.
 * THERE SHOULD BE A FILE READER INITIALIZED BEFORE ALL ELSE IN THE APP.
 * EACH DIFFERENT FILE WILL NEED TO HAVE A FILE READER (or file reader config) ASSOCIATED WITH IT.
 * 
 * ALL CURRENT STRINGS SHOULD BE REPLACED WITH THE INFORMATION FROM THIS FILE READER
 */

// Get "strings.json" file
const path = require('path');
const strings_file = require(path.join(__dirname, '..', 'strings', 'strings.json'));


/* ---------------------------------------- MULTER ---------------------------------------- */
// Multer
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');
/* ---------------------------------------------------------------------------------------- */



// Set up the URL to comunicate with Gemini
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

// Maximum character limit for the conversation history
const MAX_HISTORY_LENGTH = 300000;

// For debug purposes only
app.get('/', (req, res) => {
    //res.send('Backend is running');
    res.send(strings_file.debug.backend_running);
});


/**
 * Adds Gemini's response to the GeminiResponse history
 * @param {string} fileName - The name of the file being processed
 * @param {string} message - Gemini's response for the given file
 */
const addToGeminiResponse = (fileName, message) => {
    // Push the response as a structured object
    geminiResponse.push({ file: fileName, response: message });

    console.log("addToGeminiResponse: ", geminiResponse);

    // Ensure the total character length of GeminiResponse does not exceed MAX_HISTORY_LENGTH
    let totalLength = geminiResponse.reduce((acc, entry) => acc + entry.response.length, 0);

    while (totalLength > MAX_HISTORY_LENGTH) {
        const removedEntry = geminiResponse.shift();
        totalLength -= removedEntry.response.length;
        console.log("addToGeminiResponse3 ");
    }
    console.log("addToGeminiResponse2: ", geminiResponse);
};


// Add a message to the conversation history and truncate if necessary
const addToConversationHistory = (message) => {
	conversationHistory.push(message);
	//conversationHistory.push("<br>");

    // Calculate total characters in the conversation
    let totalLength = conversationHistory.reduce((acc, msg) => acc + msg.length, 0);

    // Remove oldest messages if total exceeds the max length
    while (totalLength > MAX_HISTORY_LENGTH) {
        const removedMsg = conversationHistory.shift();
        totalLength -= removedMsg.length;
    }
};


// Send the initial context to the conversation history
const initializeConversation = () => {
    const initialContextMessage =
        //"This is your initial context: you are going to help a team that is in the field of software engineering. All following prompts have to take this into account.";
        strings_file.initialContext;

    if (!initialContextMessage) {
        //console.error('Initial context message is missing or undefined.');
        console.error(strings_file.error_messages.initial_context_missing);
        process.exit(1); // Exit if the required string is missing
    }

    addToConversationHistory(initialContextMessage);
};


// Initialize the conversation on server start
initializeConversation();


/**
 * Source of the idea applied into code: https://aistudio.google.com/app/apikey
 * Retry logic with exponential delay backoff
 * 
curl \
-H "Content-Type: application/json" \
-d "{\"contents\":[{\"parts\":[{\"text\":\"Explain how AI works\"}]}]}" \
-X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY"
 * 
 *
 */
const retryGenerateContent = async (prompt, retries = 3, delay = 2000, isFirstCall = true) => {
    console.log('Batch ready to be added to Conversation History');

    if (isFirstCall) {
        // Add the user prompt to the local conversation history only on the first call
        conversationHistory.push(prompt);
    }

    // Log the local conversation history for debugging
    console.log('Local Conversation History:', conversationHistory);

    // Prepare the body with the entire conversation history
    const body = {
        contents: conversationHistory.map((message, index) => {
            return {
                role: index % 2 === 0 ? strings_file.roles.user : strings_file.roles.model,
                parts: [{ text: message }],
            };
        }),
    };

    console.log('Sending request body to Gemini API:', JSON.stringify(body, null, 2));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || strings_file.error_messages.unknown_error);
        }

        const data = await response.json();
        const generatedText = data.candidates[0]?.content?.parts[0]?.text || strings_file.error_messages.no_content_generated;

        // Add Gemini's response to the local conversation history
        conversationHistory.push(generatedText);

        //return localConversationHistory;
        return generatedText;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retrying... Attempts left: ${retries}`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            // Pass `false` to prevent re-adding the prompt
            return retryGenerateContent(prompt, retries - 1, delay * 2, false);
        }
        throw error;
    }
};



/* ---------------------------------------- UPLOAD FILES ---------------------------------------- */
// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/', // Directory to temporarily store uploaded files
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Ensure the uploads directory exists
const ensureUploadsDirExists = () => {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
};

// Modify processBatch to accept conversationHistory
const processBatch = async (batch, fileName, conversationHistory) => {
    if (batch.length === 0) {
        console.warn(`Batch for file ${fileName} is empty. Skipping...`);
        return;
    }

    try {
        console.log(`Processing batch for file: ${fileName}`, batch);

        const prompt = batch.join('\n');
        console.log('Prompt created:', prompt);

        // Send to Gemini
        const response = await retryGenerateContent(prompt, 3, 2000, true, conversationHistory);

        console.log(`Gemini response for file ${fileName}:`, response);//.join(''));

        // Add Gemini response for the file
        addToGeminiResponse(fileName, response);//.join(''));

        console.log("processBatch: ", geminiResponse);
    } catch (error) {
        console.error(`Error in processBatch for file ${fileName}:`, error);
        throw error;
    }
};


// Modify processLogFile to use a separate conversationHistory
const processLogFile = (filePath, processBatch, fileName) => {
    //const conversationHistory = []; 

    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        const rl = readline.createInterface({ input: stream });

        let currentBatch = [];
        const batchSize = 20000;

        rl.on('line', async (line) => {
            currentBatch.push(line);

            if (currentBatch.length >= batchSize) {
                try {
                    await processBatch(currentBatch, fileName, conversationHistory);
                    currentBatch = [];
                } catch (err) {
                    rl.close();
                    reject(err);
                }
            }
        });

        rl.on('close', async () => {
            try {
                if (currentBatch.length > 0) {
                    await processBatch(currentBatch, fileName, conversationHistory);
                }
                console.log(`Finished processing log file: ${fileName}`);
                resolve();
            } catch (err) {
                console.error(`Error processing final batch for file ${fileName}:`, err);
                reject(err);
            }
        });

        rl.on('error', (err) => {
            console.error(`Error reading log file ${fileName}:`, err);
            reject(err);
        });
    });
};


// File upload route
app.post('/upload-log', upload.array('logfiles', 10), async (req, res) => {
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
        console.error("No files uploaded.");
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        // Process each file
        for (const file of uploadedFiles) {
            const { path: tempPath, originalname } = file;
            const targetPath = path.join(__dirname, '..', 'uploads', `${Date.now()}-${originalname}`);

            // Move the file to uploads directory
            fs.renameSync(tempPath, targetPath);

            console.log(`Processing file: ${originalname}`);
            await processLogFile(targetPath, processBatch, originalname);
        }

        console.log("Final geminiResponse:", geminiResponse);//JSON.stringify(geminiResponse[geminiResponse.length -1], null, 2));

        // Send Gemini responses to the frontend
        res.status(200).json({
            message: 'Files uploaded and processed successfully',
            geminiResponses: geminiResponse || null, // Include structured responses
            //geminiResponses: geminiResponse[geminiResponse.length - 1] || null,
        });
    } catch (err) {
        console.error('Error processing files:', err);
        res.status(500).json({ error: 'Error processing one or more files.' });
    }
});





/* ---------------------------------------------------------------------------------------------- */


app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        //return res.status(400).json({ error: 'Prompt is required' });
        return res.status(400).json({ error: strings_file.error_messages.missing_prompt });
    }

    try {
		/*
        const generatedText = await retryGenerateContent(prompt);
        // Send the entire conversation history for verification

        res.json({ generatedText });
		*/
		const generatedText = await retryGenerateContent(prompt);

        // Properly join the conversation history without commas
        const formattedText = generatedText.join(''); // No commas, just concatenate all elements

        // Send the formatted text back
        res.json({ generatedText: formattedText });
    } catch (error) {
        //console.error('Error generating content:', error);
        console.error(strings_file.error_messages.error_generating_content, error);

        const errorMessage =
            error?.status === 503
                //? 'The AI model is currently unavailable due to high demand. Please try again in a few minutes.'
                ? strings_file.error_messages.service_unavailable
                : error.message || 'An unknown error occurred while generating content.';

        res.status(error?.status || 500).json({
            error: errorMessage,
        });
    }
});


app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
