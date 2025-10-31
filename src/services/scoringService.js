/**
 * Scoring Service
 * Orchestrates the complete scoring pipeline combining rule-based and AI scoring
 */

const ruleEngine = require('./ruleEngine');
const aiService = require('./aiService');
const config = require('../config/config');

/**
 * Score all leads using rule-based + AI approach
 * @param {Array} leads - Array of lead objects
 * @param {Object} offer - Offer/product data
 * @returns {Promise<Array>} Array of scored leads
 */
async function scoreLeads(leads, offer) {
  if (!leads || leads.length === 0) {
    throw new Error('No leads to score');
  }

  if (!offer) {
    throw new Error('Offer data is required for scoring');
  }

  console.log(`Starting to score ${leads.length} leads...`);

  const scoredLeads = [];

  // Process leads sequentially to avoid rate limiting
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    console.log(`Scoring lead ${i + 1}/${leads.length}: ${lead.name}`);

    try {
      const scoredLead = await scoreSingleLead(lead, offer);
      scoredLeads.push(scoredLead);
    } catch (error) {
      console.error(`Error scoring lead ${lead.name}:`, error.message);
      
      // Add lead with error handling
      scoredLeads.push({
        ...lead,
        intent: 'Medium',
        score: 40,
        reasoning: 'Error during scoring, assigned default medium intent',
        error: error.message
      });
    }

    // Small delay to avoid rate limiting (especially important for AI APIs)
    if (i < leads.length - 1) {
      await sleep(500); // 500ms delay between requests
    }
  }

  console.log('Scoring complete!');
  return scoredLeads;
}

/**
 * Score a single lead
 * @param {Object} lead - Lead data
 * @param {Object} offer - Offer data
 * @returns {Promise<Object>} Scored lead
 */
async function scoreSingleLead(lead, offer) {
  // Step 1: Calculate rule-based score (max 50 points)
  const ruleScore = ruleEngine.calculateRuleScore(lead, offer);

  // Step 2: Get AI-based intent classification (max 50 points)
  const aiResult = await aiService.classifyIntent(offer, lead);

  // Step 3: Combine scores
  const totalScore = ruleScore.total + aiResult.score;

  // Step 4: Determine final intent label
  const finalIntent = determineIntent(totalScore);

  // Step 5: Build comprehensive reasoning
  const reasoning = buildReasoning(ruleScore, aiResult, lead);

  return {
    name: lead.name,
    role: lead.role,
    company: lead.company,
    industry: lead.industry,
    location: lead.location,
    intent: finalIntent,
    score: totalScore,
    reasoning,
    // Optional: Include breakdown for debugging
    _debug: {
      ruleScore: ruleScore.total,
      aiScore: aiResult.score,
      ruleBreakdown: ruleScore.breakdown,
      ruleDetails: ruleScore.details,
      aiIntent: aiResult.intent,
      aiReasoning: aiResult.reasoning
    }
  };
}

/**
 * Determine final intent label based on total score
 * @param {number} score - Total score (0-100)
 * @returns {string} Intent label
 */
function determineIntent(score) {
  if (score >= config.scoring.highThreshold) {
    return 'High';
  } else if (score >= config.scoring.mediumThreshold) {
    return 'Medium';
  } else {
    return 'Low';
  }
}

/**
 * Build human-readable reasoning combining rule and AI insights
 * @param {Object} ruleScore - Rule-based score breakdown
 * @param {Object} aiResult - AI classification result
 * @param {Object} lead - Lead data
 * @returns {string} Combined reasoning
 */
function buildReasoning(ruleScore, aiResult, lead) {
  const parts = [];

  // Role relevance
  if (ruleScore.details.roleMatch !== 'Other' && ruleScore.details.roleMatch !== 'Unknown') {
    parts.push(`${ruleScore.details.roleMatch} role`);
  }

  // Industry match
  if (ruleScore.details.industryMatch !== 'No match' && ruleScore.details.industryMatch !== 'No data') {
    parts.push(ruleScore.details.industryMatch.toLowerCase());
  }

  // Data completeness
  if (ruleScore.details.dataComplete) {
    parts.push('complete profile');
  }

  // AI reasoning
  if (aiResult.reasoning) {
    parts.push(aiResult.reasoning);
  }

  // Fallback if no parts
  if (parts.length === 0) {
    return `Standard fit assessment for ${lead.role} at ${lead.company}`;
  }

  return parts.join(', ');
}

/**
 * Helper function to add delay
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  scoreLeads,
  scoreSingleLead
};