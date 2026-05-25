const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTry = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-pro"
];

async function testModels() {
    for (const modelName of modelsToTry) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'OK'");
            const response = await result.response;
            console.log(`Success with ${modelName}: ${response.text()}`);
            break; // Stop at first success
        } catch (e) {
            console.error(`Failed with ${modelName}: ${e.message}`);
        }
    }
}

testModels();
