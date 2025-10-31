/**
 * Offer Controller
 * Handles offer/product management endpoints
 */

const dataStore = require('../models/dataStore');

/**
 * POST /offer
 * Store product/offer information
 */
async function createOffer(req, res, next) {
  try {
    const { name, value_props, ideal_use_cases } = req.body;

    const offerData = {
      name: name.trim(),
      value_props: value_props.map(vp => vp.trim()),
      ideal_use_cases: ideal_use_cases.map(uc => uc.trim())
    };

    const savedOffer = dataStore.setOffer(offerData);

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: savedOffer
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /offer
 * Retrieve current offer information
 */
async function getOffer(req, res, next) {
  try {
    const offer = dataStore.getOffer();

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'No offer found',
        message: 'Please create an offer using POST /offer first'
      });
    }

    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOffer,
  getOffer
};