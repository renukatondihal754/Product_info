/**
 * Scoring Controller
 * Handles lead scoring and results endpoints
 */

const dataStore = require('../models/dataStore');
const scoringService = require('../services/scoringService');
const { convertToCSV } = require('../utils/csvExporter');

/**
 * POST /score
 * Run scoring pipeline on uploaded leads
 */
async function scoreLeads(req, res, next) {
  try {
    // Get offer from store
    const offer = dataStore.getOffer();
    if (!offer) {
      return res.status(400).json({
        success: false,
        error: 'No offer found',
        message: 'Please create an offer using POST /offer before scoring'
      });
    }

    // Get leads from store
    const leads = dataStore.getLeads();
    if (!leads || leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No leads found',
        message: 'Please upload leads using POST /leads/upload before scoring'
      });
    }

    // Run scoring pipeline
    const scoredLeads = await scoringService.scoreLeads(leads, offer);

    // Store scored leads
    dataStore.setScoredLeads(scoredLeads);

    res.status(200).json({
      success: true,
      message: `Successfully scored ${scoredLeads.length} leads`,
      data: {
        count: scoredLeads.length,
        summary: {
          high: scoredLeads.filter(l => l.intent === 'High').length,
          medium: scoredLeads.filter(l => l.intent === 'Medium').length,
          low: scoredLeads.filter(l => l.intent === 'Low').length
        },
        leads: scoredLeads
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /results
 * Retrieve scored leads
 */
async function getResults(req, res, next) {
  try {
    const scoredLeads = dataStore.getScoredLeads();

    if (!scoredLeads || scoredLeads.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No results found',
        message: 'Please run scoring using POST /score first'
      });
    }

    // Remove debug info from response unless explicitly requested
    const includeDebug = req.query.debug === 'true';
    const results = scoredLeads.map(lead => {
      if (includeDebug) {
        return lead;
      } else {
        const { _debug, ...cleanLead } = lead;
        return cleanLead;
      }
    });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /results/export
 * Export results as CSV
 */
async function exportResults(req, res, next) {
  try {
    const scoredLeads = dataStore.getScoredLeads();

    if (!scoredLeads || scoredLeads.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No results found',
        message: 'Please run scoring using POST /score first'
      });
    }

    // Remove debug info from export
    const exportData = scoredLeads.map(lead => {
      const { _debug, ...cleanLead } = lead;
      return cleanLead;
    });

    // Convert to CSV
    const csv = convertToCSV(exportData);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=scored-leads.csv');

    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  scoreLeads,
  getResults,
  exportResults
};