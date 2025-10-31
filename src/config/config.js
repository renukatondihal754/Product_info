/**
 * Configuration module
 * Centralizes all application configuration and environment variables
 */

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // AI Provider Configuration
    AI_PROVIDER: process.env.AI_PROVIDER || 'gemini', // 'openai' or 'gemini'

    // OpenAI Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

    // Google Gemini Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

    // File Upload Configuration
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB in bytes
        allowedMimeTypes: [
            'text/csv',
            'application/vnd.ms-excel',
            'application/csv',
            'text/x-csv',
            'application/x-csv',
            'text/comma-separated-values',
            'text/x-comma-separated-values'
        ]
    },

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,

    // Rate Limiting (alternative object format)
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // Scoring Configuration
    scoring: {
        // Score thresholds for intent classification
        highThreshold: 70,      // High intent: >= 70 points
        mediumThreshold: 40,    // Medium intent: 40-69 points
        // Low intent: < 40 points

        // Rule-based scoring points
        rules: {
            role: {
                decisionMaker: 20,  // CEO, CTO, VP, Director, etc.
                influencer: 10,     // Manager, Lead, Senior, etc.
                other: 0            // Other roles
            },
            industry: {
                exact: 20,          // Exact ICP match
                adjacent: 10,       // Adjacent/related industry
                other: 0            // Different industry
            },
            completeness: 10        // All required fields present
        },

        // AI-based scoring points
        ai: {
            high: 50,       // High intent from AI
            medium: 30,     // Medium intent from AI
            low: 10         // Low intent from AI
        }
    },
};