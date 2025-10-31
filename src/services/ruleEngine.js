/**
 * Rule-based scoring engine
 * Implements business logic for initial lead scoring based on role, industry, and data completeness
 */

const config = require('../config/config');

// Decision maker keywords
const DECISION_MAKER_KEYWORDS = [
  'ceo', 'cto', 'cfo', 'coo', 'chief', 'president', 'vp', 'vice president',
  'director', 'head', 'founder', 'owner', 'partner', 'principal'
];

// Influencer keywords
const INFLUENCER_KEYWORDS = [
  'manager', 'lead', 'senior', 'sr', 'specialist', 'architect',
  'consultant', 'advisor', 'strategist', 'coordinator'
];

/**
 * Calculate rule-based score for a lead (max 50 points)
 * @param {Object} lead - Lead data
 * @param {Object} offer - Offer/product data
 * @returns {Object} Scoring breakdown with total score and details
 */
function calculateRuleScore(lead, offer) {
  const scores = {
    role: 0,
    industry: 0,
    completeness: 0
  };

  const details = {
    roleMatch: 'No match',
    industryMatch: 'No match',
    dataComplete: false
  };

  // 1. Role relevance scoring (max 20 points)
  const roleScore = scoreRole(lead.role);
  scores.role = roleScore.score;
  details.roleMatch = roleScore.type;

  // 2. Industry matching (max 20 points)
  if (offer && offer.ideal_use_cases && offer.ideal_use_cases.length > 0) {
    const industryScore = scoreIndustry(lead.industry, offer.ideal_use_cases);
    scores.industry = industryScore.score;
    details.industryMatch = industryScore.match;
  }

  // 3. Data completeness (max 10 points)
  const completenessScore = scoreCompleteness(lead);
  scores.completeness = completenessScore.score;
  details.dataComplete = completenessScore.complete;

  const total = scores.role + scores.industry + scores.completeness;

  return {
    total,
    breakdown: scores,
    details
  };
}

/**
 * Score lead's role relevance
 * @param {string} role - Lead's job role
 * @returns {Object} Score and role type
 */
function scoreRole(role) {
  if (!role) return { score: 0, type: 'Unknown' };

  const roleLower = role.toLowerCase();

  // Check for decision maker
  for (const keyword of DECISION_MAKER_KEYWORDS) {
    if (roleLower.includes(keyword)) {
      return { 
        score: config.scoring.rules.role.decisionMaker, 
        type: 'Decision Maker' 
      };
    }
  }

  // Check for influencer
  for (const keyword of INFLUENCER_KEYWORDS) {
    if (roleLower.includes(keyword)) {
      return { 
        score: config.scoring.rules.role.influencer, 
        type: 'Influencer' 
      };
    }
  }

  return { 
    score: config.scoring.rules.role.other, 
    type: 'Other' 
  };
}

/**
 * Score industry match against ideal use cases
 * @param {string} industry - Lead's industry
 * @param {Array} idealUseCases - Offer's ideal use cases
 * @returns {Object} Score and match type
 */
function scoreIndustry(industry, idealUseCases) {
  if (!industry || !idealUseCases || idealUseCases.length === 0) {
    return { score: 0, match: 'No data' };
  }

  const industryLower = industry.toLowerCase();

  // Check for exact match
  for (const useCase of idealUseCases) {
    const useCaseLower = useCase.toLowerCase();
    if (industryLower.includes(useCaseLower) || useCaseLower.includes(industryLower)) {
      return { 
        score: config.scoring.rules.industry.exact, 
        match: 'Exact ICP match' 
      };
    }
  }

  // Check for adjacent/related match (simple keyword matching)
  const adjacentKeywords = ['saas', 'software', 'technology', 'tech', 'b2b', 'enterprise'];
  const hasAdjacentMatch = adjacentKeywords.some(keyword => 
    industryLower.includes(keyword) || 
    idealUseCases.some(uc => uc.toLowerCase().includes(keyword))
  );

  if (hasAdjacentMatch) {
    return { 
      score: config.scoring.rules.industry.adjacent, 
      match: 'Adjacent industry' 
    };
  }

  return { 
    score: config.scoring.rules.industry.other, 
    match: 'Different industry' 
  };
}

/**
 * Score data completeness
 * @param {Object} lead - Lead data
 * @returns {Object} Score and completeness status
 */
function scoreCompleteness(lead) {
  const requiredFields = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
  
  const allFieldsPresent = requiredFields.every(field => 
    lead[field] && lead[field].trim().length > 0
  );

  return {
    score: allFieldsPresent ? config.scoring.rules.completeness : 0,
    complete: allFieldsPresent
  };
}

module.exports = {
  calculateRuleScore,
  scoreRole,
  scoreIndustry,
  scoreCompleteness
};