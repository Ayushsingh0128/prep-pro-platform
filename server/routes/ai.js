const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const pdfParse = require('pdf-parse');
const AIVault = require('../models/AIVault');


// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// Helper to call Gemini with retry logic for 503 errors
const callGeminiWithRetry = async (prompt, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return await result.response;
        } catch (err) {
            lastError = err;
            // Only retry if it's a 503 (High Demand) or temporary network issue
            if (err.status === 503 || err.message?.includes('high demand') || err.message?.includes('Service Unavailable')) {
                console.warn(`Gemini busy (Attempt ${i + 1}/${maxRetries}). Retrying...`);
                await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
                continue;
            }
            throw err; // Re-throw if it's not a retryable error
        }
    }
    throw lastError;
};

// Helper to robustly extract JSON from Gemini response text
// Handles: raw JSON, ```json blocks, extra text before/after JSON
const extractJSON = (text) => {
    // Remove markdown code fences
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    // Try to find a JSON object (starts with { ends with })
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    
    // Try to find a JSON array (starts with [ ends with ])
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    
    // Last resort: parse as-is
    return JSON.parse(cleaned);
};

// Multer config for PDF uploads (in memory, no disk storage needed)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// -----------------------------------------------------------
// ROUTE 1: INTERVIEW ANALYSIS (For the Mock Interview Page)
// -----------------------------------------------------------
router.post('/analyze', auth, async (req, res) => {
    try {
        const { transcript, fillerCount, gazeScore } = req.body;

        if (!transcript) {
            return res.status(400).json({ message: "No transcript provided" });
        }

        const prompt = `
            Act as a professional Interview Coach. 
            Analyze this interview transcript: "${transcript}"
            The user had ${fillerCount} filler words and a gaze tracking score of ${gazeScore}/100.
            
            Provide:
            1. A 2-sentence summary of their performance.
            2. 3 specific tips to improve their technical answers.
            3. A final 'Readiness Score' out of 100.
            
            Keep the tone encouraging but professional.
        `;

        const response = await callGeminiWithRetry(prompt);
        const feedback = response.text();

        res.json({ feedback });
    } catch (err) {
        console.error("Interview Analysis Error:", err);
        res.status(500).json({ message: "AI Analysis failed" });
    }
});

// -----------------------------------------------------------
// ROUTE 2: ATS RESUME SCAN (For the Resume Builder Page)
// -----------------------------------------------------------
router.post('/ats-scan', auth, async (req, res) => {
    try {
        const { resumeData } = req.body;

        if (!resumeData) {
            return res.status(400).json({ message: "No resume data provided" });
        }

        const targetRole = resumeData.role || 'Software Developer';

        const prompt = `
            Act as an encouraging Technical Recruiter and ATS (Applicant Tracking System) expert.
            Analyze this resume data for a "${targetRole}" role:
            ${JSON.stringify(resumeData)}

            BALANCED SCORING GUIDE:
            - 45-55: Beginner — basic info, a few projects/skills, needs more depth
            - 55-65: Developing — student/fresher with decent projects and relevant skills
            - 65-75: Good — solid projects, internship/experience, clear skills section
            - 75-85: Strong — tailored resume, quantified achievements, great keyword match
            - 85-100: Exceptional — industry-ready, highly relevant, strong metrics

            IMPORTANT: NEVER give below 45 if the resume has real content. Be encouraging and growth-focused.

            Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) in this EXACT format:
            {
              "atsScore": (integer between 45-100 for any resume with real content),
              "feedback": ["encouraging feedback point 1", "growth tip 2", "actionable suggestion 3"],
              "missingKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
              "compatibility": "A 1-sentence encouraging verdict on the candidate's potential for the ${targetRole} role."
            }
        `;

        const response = await callGeminiWithRetry(prompt);
        
        try {
            const jsonResponse = extractJSON(response.text());
            res.json(jsonResponse);
        } catch (parseError) {
            console.error("ATS Scan JSON Parsing Error:", response.text());
            res.status(500).json({ message: "AI returned invalid JSON format. Please try again." });
        }

    } catch (err) {
        console.error("ATS Scan Error:", err);
        res.status(500).json({ message: "ATS Scan failed. Check Gemini API Key." });
    }
});

// -----------------------------------------------------------
// ROUTE 3: DETAILED RESUME ANALYSIS (For Resume Analysis Page)
// Accepts both: pasted text (JSON body) or PDF file upload
// -----------------------------------------------------------
router.post('/analyze-resume', auth, upload.single('resumeFile'), async (req, res) => {
    try {
        let resumeText = '';
        const targetRole = req.body.targetRole || 'Software Developer';
        const targetCompany = req.body.targetCompany || '';

        // 1. Get resume text from either PDF file or body text
        if (req.file) {
            // PDF was uploaded — extract text
            const pdfData = await pdfParse(req.file.buffer);
            resumeText = pdfData.text;
        } else if (req.body.resumeText) {
            resumeText = req.body.resumeText;
        } else {
            return res.status(400).json({ message: "Please provide resume text or upload a PDF file." });
        }

        if (resumeText.trim().length < 50) {
            return res.status(400).json({ message: "Resume text is too short. Please provide a complete resume." });
        }

        // 2. Build the detailed analysis prompt
        const companyContext = targetCompany ? ` at ${targetCompany}` : '';
        const prompt = `
            You are an expert ATS (Applicant Tracking System) scanner and encouraging career counselor.
            Your goal is to help candidates improve, not discourage them.
            
            Analyze this resume for a "${targetRole}"${companyContext} role:
            
            ---BEGIN RESUME---
            ${resumeText}
            ---END RESUME---
            
            Respond ONLY with a valid JSON object (no markdown, no backticks, no explanation) in this EXACT format:
            {
              "atsScore": (number 0-100, use the BALANCED scoring guide below),
              "sectionScores": {
                "contactInfo": (number 0-100),
                "summary": (number 0-100),
                "experience": (number 0-100),
                "skills": (number 0-100),
                "education": (number 0-100),
                "formatting": (number 0-100)
              },
              "foundKeywords": ["list of relevant keywords found in resume, max 10"],
              "missingKeywords": ["list of important missing keywords for this role, max 8"],
              "recommendations": [
                "5 specific, actionable recommendations to improve the resume"
              ],
              "strengths": [
                "3 things the resume does well"
              ],
              "verdict": "A 2-sentence encouraging verdict that acknowledges the candidate's strengths and outlines 1-2 key areas to grow"
            }

            BALANCED SCORING GUIDE (follow strictly):
            - 45-55: Beginner resume — has basic info, a couple of projects or skills, but needs more depth
            - 55-65: Developing resume — student or fresher with decent projects, skills, and some experience
            - 65-75: Good resume — solid projects, relevant skills, internship/experience, clear formatting
            - 75-85: Strong resume — well-tailored, quantified achievements, great keyword match
            - 85-100: Exceptional — industry-ready, highly tailored, strong metrics and relevant experience
            
            IMPORTANT RULES:
            - NEVER give a score below 45 if the resume has real content (projects, skills, education)
            - NEVER give a score below 40 for any resume that has been thoughtfully written
            - Be encouraging — a student or fresher with projects deserves at least 55+
            - Focus recommendations on GROWTH, not failures
            - Keywords should be specific to the "${targetRole}" role
            - Strengths should genuinely highlight what the candidate is doing well
            - The verdict tone must be positive and motivating, like a mentor speaking to a mentee
        `;

        const response = await callGeminiWithRetry(prompt);
        
        try {
            const jsonResponse = extractJSON(response.text());
            res.json(jsonResponse);
        } catch (parseError) {
            console.error("Resume Analysis JSON Parsing Error:", response.text());
            res.status(500).json({ message: "AI returned invalid format. Please try again." });
        }

    } catch (err) {
        console.error("Resume Analysis Error:", err);
        res.status(500).json({ message: "Resume analysis failed. Check API key and try again." });
    }
});

// -----------------------------------------------------------
// ROUTE 4: AI QUIZ GENERATION (For the Pro Quiz System)
// -----------------------------------------------------------
router.post('/generate-quiz', auth, upload.single('resumeFile'), async (req, res) => {
    try {
        const { topic, difficulty, count } = req.body;

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const questionCount = count || 10;
        const diffLevel = difficulty || 'medium';

        const diffDescriptions = {
            easy: 'basic conceptual questions suitable for beginners. Focus on definitions, simple syntax, and fundamental concepts.',
            medium: 'intermediate questions that test practical knowledge. Include scenario-based questions and common patterns.',
            hard: 'advanced questions that test deep understanding. Include tricky edge cases, performance implications, and architecture decisions.'
        };

        let resumeContext = "";
        if (req.file) {
            try {
                const pdfData = await pdfParse(req.file.buffer);
                resumeContext = `\nCRITICAL CONTEXT: The candidate has provided their resume. You MUST tailor the questions to test the specific skills, projects, and technologies mentioned in their resume related to ${topic}:\n\n---BEGIN RESUME---\n${pdfData.text}\n---END RESUME---\n`;
            } catch (err) {
                console.error("Error parsing resume for quiz:", err);
            }
        }

        const prompt = `
            You are an expert technical interviewer and quiz master.
            Generate exactly ${questionCount} multiple-choice questions about "${topic}" at ${diffLevel} difficulty level.
            ${resumeContext}
            Difficulty guidance: ${diffDescriptions[diffLevel] || diffDescriptions.medium}
            
            CRITICAL: Respond ONLY with a valid JSON array (no markdown, no backticks, no explanation).
            Each object in the array must have this exact structure:
            {
                "questionText": "The question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctOption": 0,
                "explanation": "Brief 1-2 sentence explanation of why the correct answer is right."
            }
            
            Rules:
            - correctOption is the 0-based index (0, 1, 2, or 3) of the correct answer in the options array
            - Each question MUST have exactly 4 options
            - Questions should be diverse and cover different sub-topics within ${topic}
            - Options should be plausible (no obviously wrong answers)
            - Explanations should be educational and concise
            - Do NOT repeat questions
            - Generate exactly ${questionCount} questions
        `;

        const response = await callGeminiWithRetry(prompt);
        
        try {
            const questions = extractJSON(response.text());
            
            // Validate structure
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('Invalid questions array');
            }
            
            // Sanitize and validate each question
            const validatedQuestions = questions.map((q, i) => ({
                questionText: q.questionText || `Question ${i + 1}`,
                options: Array.isArray(q.options) && q.options.length === 4 
                    ? q.options 
                    : ["Option A", "Option B", "Option C", "Option D"],
                correctOption: typeof q.correctOption === 'number' && q.correctOption >= 0 && q.correctOption <= 3 
                    ? q.correctOption 
                    : 0,
                explanation: q.explanation || "No explanation available."
            }));

            res.json({ 
                topic, 
                difficulty: diffLevel, 
                questions: validatedQuestions 
            });

            // Cache in background (don't await)
            AIVault.findOneAndUpdate(
                { type: 'quiz', topic, difficulty: diffLevel },
                { content: validatedQuestions },
                { upsert: true, new: true }
            ).catch(err => console.error("Vault Cache Error:", err));

        } catch (parseError) {
            console.error("Quiz Generation Parse Error:", response.text());
            // Fallback to Vault on parse error
            let cachedBody = await AIVault.findOne({ type: 'quiz', topic, difficulty: diffLevel });
            if (!cachedBody) {
                console.log(`Specific fallback not found for ${topic}, trying generic fallback...`);
                cachedBody = await AIVault.findOne({ type: 'quiz', topic: 'generic fallback', difficulty: diffLevel });
            }

            if (cachedBody) {
                console.log(`Fallback: Serving cached quiz for ${topic}`);
                return res.json({ topic, difficulty: diffLevel, questions: cachedBody.content, cached: true });
            }
            res.status(500).json({ message: "AI returned invalid quiz format and no cache available." });
        }

    } catch (err) {
        console.error("Quiz Generation Error:", err);
        // Fallback to Vault on AI service error
        const { topic, difficulty } = req.body;
        const diffLevel = difficulty || 'medium';
        let cachedBody = await AIVault.findOne({ type: 'quiz', topic, difficulty: diffLevel });
        if (!cachedBody) {
            console.log(`Specific fallback not found for ${topic}, trying generic fallback...`);
            cachedBody = await AIVault.findOne({ type: 'quiz', topic: 'generic fallback', difficulty: diffLevel });
        }

        if (cachedBody) {
            console.log(`Fallback: Serving cached quiz for ${topic}`);
            return res.json({ topic, difficulty: diffLevel, questions: cachedBody.content, cached: true });
        }
        res.status(500).json({ message: "AI Service busy and no local cache available for this topic." });
    }
});

// -----------------------------------------------------------
// ROUTE 5: AI INTERVIEW QUESTION GENERATION
// -----------------------------------------------------------
router.post('/generate-interview-questions', auth, upload.single('resumeFile'), async (req, res) => {
    try {
        const { role, difficulty } = req.body;
        const roleTitle = role || 'Software Developer';
        const diffLevel = difficulty || 'medium';

        const diffGuide = {
            easy: 'Focus on fundamental concepts, basic definitions, and simple scenarios. Questions should be approachable for freshers.',
            medium: 'Mix of conceptual and practical questions. Include some scenario-based questions that test real-world understanding.',
            hard: 'Advanced questions testing deep expertise. Include system design thinking, edge cases, optimization, and complex scenarios.'
        };

        let resumeContext = "";
        if (req.file) {
            try {
                const pdfData = await pdfParse(req.file.buffer);
                resumeContext = `\nCRITICAL CONTEXT: The candidate has provided their resume. You MUST tailor both the behavioral and technical questions to test the specific experiences, projects, and tech stack mentioned in their resume:\n\n---BEGIN RESUME---\n${pdfData.text}\n---END RESUME---\n`;
            } catch (err) {
                console.error("Error parsing resume for interview:", err);
            }
        }

        const prompt = `
            You are an expert technical interviewer at a top tech company.
            Generate exactly 6 interview questions for a "${roleTitle}" role at ${diffLevel} difficulty.
            ${resumeContext}
            Distribution: 2 behavioral/HR questions + 4 technical questions.
            Difficulty: ${diffGuide[diffLevel] || diffGuide.medium}
            
            CRITICAL: Respond ONLY with a valid JSON array (no markdown, no backticks).
            Each object must have:
            {
                "questionText": "The interview question",
                "type": "behavioral" or "technical",
                "expectedDuration": 180
            }
            
            Rules:
            - expectedDuration is in seconds (behavioral: 120s, technical: 180-240s)
            - Questions should be role-specific for "${roleTitle}"
            - Behavioral questions: teamwork, challenges, leadership, growth
            - Technical questions: specific to the role's tech stack
            - Be realistic — these should sound like actual interview questions
            - Start with 1 behavioral, then alternate
        `;

        const response = await callGeminiWithRetry(prompt);
        
        try {
            const questions = extractJSON(response.text());
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('Invalid questions');
            }
            res.json({ role: roleTitle, difficulty: diffLevel, questions });

            // Cache in background
            AIVault.findOneAndUpdate(
                { type: 'interview_questions', topic: roleTitle, difficulty: diffLevel },
                { content: questions },
                { upsert: true, new: true }
            ).catch(err => console.error("Vault Cache Error:", err));

        } catch (parseError) {
            console.error("Interview Q Parse Error:", response.text());
            // Fallback to Vault
            let cachedBody = await AIVault.findOne({ type: 'interview_questions', topic: roleTitle, difficulty: diffLevel });
            if (!cachedBody) {
                console.log(`Specific fallback not found for ${roleTitle}, trying generic fallback...`);
                cachedBody = await AIVault.findOne({ type: 'interview_questions', topic: 'generic fallback', difficulty: diffLevel });
            }

            if (cachedBody) {
                console.log(`Fallback: Serving cached interview for ${roleTitle}`);
                return res.json({ role: roleTitle, difficulty: diffLevel, questions: cachedBody.content, cached: true });
            }
            res.status(500).json({ message: "AI returned invalid format and no cache available." });
        }
    } catch (err) {
        console.error("Interview Q Generation Error:", err);
        // Fallback to Vault
        const { role, difficulty } = req.body;
        const roleTitle = role || 'Software Developer';
        const diffLevel = difficulty || 'medium';
        
        let cachedBody = await AIVault.findOne({ type: 'interview_questions', topic: roleTitle, difficulty: diffLevel });
        if (!cachedBody) {
            console.log(`Specific fallback not found for ${roleTitle}, trying generic fallback...`);
            cachedBody = await AIVault.findOne({ type: 'interview_questions', topic: 'generic fallback', difficulty: diffLevel });
        }

        if (cachedBody) {
            console.log(`Fallback: Serving cached interview for ${roleTitle}`);
            return res.json({ role: roleTitle, difficulty: diffLevel, questions: cachedBody.content, cached: true });
        }
        res.status(500).json({ message: "AI Service busy and no local cache available for this topic." });
    }
});


// -----------------------------------------------------------
// ROUTE 6: POST-INTERVIEW AI ANALYSIS
// -----------------------------------------------------------
router.post('/analyze-interview', auth, async (req, res) => {
    try {
        const { role, transcript, fillerCount, gazeScore, duration, questionCount } = req.body;

        if (!transcript || transcript.trim().length < 20) {
            return res.json({ 
                feedback: "Not enough speech data to analyze. Try speaking more during the interview.",
                overallScore: 30
            });
        }

        const prompt = `
            You are a professional interview coach at a top tech company.
            
            Analyze this mock interview for a "${role || 'Software Developer'}" position:
            
            Transcript: "${transcript}"
            
            Metrics:
            - Filler words used: ${fillerCount}
            - Eye contact/gaze stability: ${gazeScore}% (100 = perfect eye contact)
            - Interview duration: ${duration} seconds
            - Questions answered: ${questionCount || 6}
            
            Provide a detailed analysis. Respond ONLY with valid JSON (no markdown, no backticks):
            {
                "overallScore": (number 0-100, be realistic),
                "communicationScore": (number 0-100),
                "technicalScore": (number 0-100),
                "confidenceScore": (number 0-100),
                "eyeContactScore": (number 0-100),
                "summary": "A 2-3 sentence overall assessment",
                "strengths": ["strength 1", "strength 2", "strength 3"],
                "improvements": ["improvement 1", "improvement 2", "improvement 3"],
                "tips": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
            }
            
            Rules:
            - Be encouraging but honest
            - Scores should reflect realistic performance
            - High filler count = lower communication score
            - Low gaze score = lower eye contact and confidence scores
            - Tips should be specific and actionable
        `;

        const response = await callGeminiWithRetry(prompt);
        
        try {
            const analysis = extractJSON(response.text());
            res.json(analysis);
        } catch (parseError) {
            console.error("Interview Analysis Parse Error:", response.text());
            // Return the raw text as feedback if JSON parsing fails
            res.json({ 
                overallScore: 50, 
                feedback: response.text(),
                summary: "Analysis completed but formatting was different than expected."
            });
        }
    } catch (err) {
        console.error("Interview Analysis Error:", err);
        res.status(500).json({ message: "AI analysis failed." });
    }
});

module.exports = router;