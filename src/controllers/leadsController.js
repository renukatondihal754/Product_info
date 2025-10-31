/**
 * Leads Controller
 * Handles lead upload and management endpoints
 */

const dataStore = require('../models/dataStore');
const { parseCSV } = require('../utils/csvParser');

/**
 * POST /leads/upload
 * Upload and parse CSV file containing lead data
 */
async function uploadLeads(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Parse CSV file
    const leads = await parseCSV(req.file.path);

    // Store leads in data store
    const savedLeads = dataStore.setLeads(leads);

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${savedLeads.length} leads`,
      data: {
        count: savedLeads.length,
        leads: savedLeads
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /leads
 * Retrieve all uploaded leads
 */
async function getLeads(req, res, next) {
  try {
    const leads = dataStore.getLeads();

    if (!leads || leads.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No leads found',
        message: 'Please upload leads using POST /leads/upload first'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        count: leads.length,
        leads
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadLeads,
  getLeads
};