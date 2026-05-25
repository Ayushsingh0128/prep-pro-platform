const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
const AIVault = require('../models/AIVault');

// Fix DNS resolution for MongoDB Atlas on this machine
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedData = [
    // --- QUIZZES ---
    {
        type: 'quiz',
        topic: 'data scientist',
        difficulty: 'medium',
        content: [
            {
                questionText: "Which of the following is an example of an unsupervised learning algorithm?",
                options: ["Linear Regression", "K-Means Clustering", "Logistic Regression", "Random Forest"],
                correctOption: 1,
                explanation: "K-Means Clustering is unsupervised as it finds patterns in unlabeled data."
            },
            {
                questionText: "What does the term 'p-value' represent in statistical hypothesis testing?",
                options: ["Probability of the hypothesis being true", "Probability of observing the data if the null hypothesis is true", "Power of the test", "Probability of Type II error"],
                correctOption: 1,
                explanation: "p-value is the probability of obtaining results at least as extreme as the observed results, assuming the null hypothesis is correct."
            },
            {
                questionText: "What is the primary purpose of cross-validation?",
                options: ["To increase training speed", "To handle missing values", "To assess the generalizability of a model", "To perform feature selection"],
                correctOption: 2,
                explanation: "Cross-validation helps estimate how a model will perform on unseen data by using different subsets for training/testing."
            }
        ]
    },
    {
        type: 'quiz',
        topic: 'software engineer',
        difficulty: 'medium',
        content: [
            {
                questionText: "Which data structure uses LIFO (Last-In-First-Out)?",
                options: ["Queue", "Stack", "Linked List", "Binary Tree"],
                correctOption: 1,
                explanation: "A Stack follows LIFO, where the last element added is the first one removed."
            },
            {
                questionText: "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
                options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
                correctOption: 2,
                explanation: "In a balanced BST, each comparison halves the search space, resulting in logarithmic time complexity."
            }
        ]
    },
    {
        type: 'quiz',
        topic: 'generic fallback',
        difficulty: 'medium',
        content: [
            {
                questionText: "What is the primary purpose of version control systems like Git?",
                options: ["To format code automatically", "To track changes and collaborate on code", "To compile code into executables", "To deploy applications to servers"],
                correctOption: 1,
                explanation: "Version control systems allow multiple developers to track changes, revert to previous states, and collaborate seamlessly."
            },
            {
                questionText: "Which of the following best describes an API?",
                options: ["A database management tool", "A set of protocols for building software and integrating systems", "A programming language used for web design", "A physical server hosting applications"],
                correctOption: 1,
                explanation: "An Application Programming Interface (API) is a set of rules allowing different software entities to communicate."
            },
            {
                questionText: "What does 'DRY' stand for in software engineering?",
                options: ["Do Repeat Yourself", "Don't Repeat Yourself", "Data Recovery Yield", "Dynamic Routing YAML"],
                correctOption: 1,
                explanation: "DRY is a principle aimed at reducing repetition of software patterns to improve maintainability."
            }
        ]
    },
    // --- INTERVIEWS ---
    {
        type: 'interview_questions',
        topic: 'data scientist',
        difficulty: 'medium',
        content: [
            { questionText: "Tell me about a challenging data project you've worked on. What was the outcome?", type: "behavioral", expectedDuration: 120 },
            { questionText: "Explain the difference between L1 and L2 regularization. When would you use one over the other?", type: "technical", expectedDuration: 180 },
            { questionText: "How do you handle missing or noisy data in a typical dataset?", type: "technical", expectedDuration: 180 },
            { questionText: "Explain the concept of 'Bias-Variance Tradeoff' in simple terms.", type: "technical", expectedDuration: 180 },
            { questionText: "Walk me through the metrics you would use to evaluate a classification model.", type: "technical", expectedDuration: 180 },
            { questionText: "Describe a situation where you had to explain technical results to a non-technical stakeholder.", type: "behavioral", expectedDuration: 150 }
        ]
    },
    {
        type: 'interview_questions',
        topic: 'software developer',
        difficulty: 'medium',
        content: [
            { questionText: "Tell me about a time you had to deal with a difficult bug. How did you resolve it?", type: "behavioral", expectedDuration: 120 },
            { questionText: "What are the core differences between a relational (SQL) and non-relational (NoSQL) database?", type: "technical", expectedDuration: 180 },
            { questionText: "Explain the concept of RESTful APIs and their key principles.", type: "technical", expectedDuration: 180 },
            { questionText: "What is 'Dependency Injection' and why is it useful in software development?", type: "technical", expectedDuration: 180 },
            { questionText: "How do you ensure your code is readable and maintainable?", type: "technical", expectedDuration: 150 },
            { questionText: "Tell me about a time you had to learn a new technology quickly for a project.", type: "behavioral", expectedDuration: 120 }
        ]
    },
    {
        type: 'interview_questions',
        topic: 'generic fallback',
        difficulty: 'medium',
        content: [
            { questionText: "Tell me about a challenging project you've worked on recently and what you learned from it.", type: "behavioral", expectedDuration: 120 },
            { questionText: "How do you approach debugging a complex issue in a codebase you aren't familiar with?", type: "technical", expectedDuration: 180 },
            { questionText: "Explain the concept of 'technical debt' and how you manage it in your projects.", type: "technical", expectedDuration: 180 },
            { questionText: "Describe a situation where you had a disagreement with a team member. How did you handle it?", type: "behavioral", expectedDuration: 150 },
            { questionText: "What are some best practices you follow to ensure the security and performance of your applications?", type: "technical", expectedDuration: 180 },
            { questionText: "Where do you see your career heading in the next 3 to 5 years?", type: "behavioral", expectedDuration: 120 }
        ]
    }
];

const seedVault = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing vault data for these topics to avoid duplicates
        const topics = seedData.map(d => d.topic);
        await AIVault.deleteMany({ topic: { $in: topics } });

        await AIVault.insertMany(seedData);
        console.log('Successfully seeded AI Vault with fallback content!');
        
        process.exit(0);
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedVault();
