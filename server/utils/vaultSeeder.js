const AIVault = require('../models/AIVault');

const seedData = [
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
            }
        ]
    },
    {
        type: 'interview_questions',
        topic: 'data scientist',
        difficulty: 'medium',
        content: [
            { questionText: "Explain the difference between L1 and L2 regularization.", type: "technical", expectedDuration: 180 },
            { questionText: "How do you handle missing or noisy data in a dataset?", type: "technical", expectedDuration: 180 }
        ]
    },
    {
        type: 'interview_questions',
        topic: 'software developer',
        difficulty: 'medium',
        content: [
            { questionText: "What are the core differences between a relational (SQL) and non-relational (NoSQL) database?", type: "technical", expectedDuration: 180 },
            { questionText: "Tell me about a time you had to deal with a difficult bug.", type: "behavioral", expectedDuration: 120 }
        ]
    }
];

const seedVaultIfNeeded = async () => {
    try {
        const count = await AIVault.countDocuments();
        if (count === 0) {
            console.log('🌱 AI Vault is empty. Seeding default content...');
            await AIVault.insertMany(seedData);
            console.log('✅ AI Vault seeded successfully!');
        }
    } catch (err) {
        console.error('❌ Error seeding AI Vault:', err);
    }
};

module.exports = seedVaultIfNeeded;
