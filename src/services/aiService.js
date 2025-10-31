/**
 * AI Service
 * Handles integration with AI providers (OpenAI, Gemini) for intent classification
 */

const config = require('../config/config');

// Initialize OpenAI client if configured
let openaiClient = null;
if (config.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require('openai');
    openaiClient = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  } catch (err) {
    // OpenAI client not installed/configured
    openaiClient = null;
  }
}

// Initialize Gemini client if configured
let geminiClient = null;
if (config.GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    geminiClient = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  } catch (err) {
    // Gemini client not installed/configured
    console.error('Failed to initialize Gemini client:', err.message);
    geminiClient = null;
  }
}

/**
 * Call OpenAI API for intent classification
 * @param {string} prompt - The prompt to send to OpenAI
 * @returns {Promise<string>} - The response text
 */
async function callOpenAI(prompt) {
  if (!openaiClient) throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY in .env');

  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0].message.content;
}

/**
 * Call Google Gemini API for intent classification
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The response text
 */
async function callGemini(prompt) {
  if (!geminiClient) {
    throw new Error('Gemini client not initialized. Please set GEMINI_API_KEY in .env');
  }

  try {
    // Use gemini-1.5-flash model (fast and cost-effective)
    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Gemini request failed: ${error.message}`);
  }
}

/**
 * Call the configured AI provider
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The response text
 */
async function callProvider(prompt) {
  if (config.AI_PROVIDER === 'openai') {
    return callOpenAI(prompt);
  } else if (config.AI_PROVIDER === 'gemini') {
    return callGemini(prompt);
  } else {
    throw new Error(`Unsupported AI_PROVIDER: ${config.AI_PROVIDER}. Use 'openai' or 'gemini'`);
  }
}

function buildIntentPrompt(product, prospect) {
  // Safely handle arrays that might be undefined
  const valueProps = Array.isArray(product.value_props) ? product.value_props.join(', ') : 'N/A';
  const useCases = Array.isArray(product.ideal_use_cases) ? product.ideal_use_cases.join(', ') : 'N/A';

  return `Analyze this B2B prospect's buying intent for our product.

PRODUCT/OFFER: ${product.name} | Value props: ${valueProps} | Ideal use cases: ${useCases}
PROSPECT: ${prospect.name}, role: ${prospect.role}, company: ${prospect.company}, industry: ${prospect.industry}, location: ${prospect.location}
BIO: ${prospect.linkedin_bio}

Classify intent (High/Medium/Low) with a short reasoning.`;
}

/**
 * Classify prospect's buying intent using AI
 * @param {Object} product - Product/offer data
 * @param {Object} prospect - Prospect/lead data
 * @returns {Promise<Object>} Classification result with intent, score, and reasoning
 */
async function classifyIntent(product, prospect) {
  const prompt = buildIntentPrompt(product, prospect);
  const raw = await callProvider(prompt);

  // Basic parse: look for High/Medium/Low and return reasoning
  const intentMatch = raw.match(/(High|Medium|Low)/i);
  const intent = intentMatch ? intentMatch[1].charAt(0).toUpperCase() + intentMatch[1].slice(1).toLowerCase() : 'Medium';
  const reasoning = raw.trim();

  // Map intent to score based on config
  let score;
  if (intent === 'High') {
    score = config.scoring.ai.high;
  } else if (intent === 'Low') {
    score = config.scoring.ai.low;
  } else {
    score = config.scoring.ai.medium;
  }

  return { intent, score, reasoning, raw };
}

module.exports = {
  classifyIntent,
  // exported for tests if needed
  _callProvider: callProvider,
};