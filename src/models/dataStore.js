/**
 * In-memory data store
 * For production, this should be replaced with a proper database (MongoDB, PostgreSQL)
 */

class DataStore {
  constructor() {
    this.offer = null;
    this.leads = [];
    this.scoredLeads = [];
  }

  // Offer methods
  setOffer(offerData) {
    this.offer = {
      ...offerData,
      createdAt: new Date()
    };
    return this.offer;
  }

  getOffer() {
    return this.offer;
  }

  // Leads methods
  setLeads(leadsData) {
    this.leads = leadsData.map((lead, index) => ({
      id: index + 1,
      ...lead,
      uploadedAt: new Date()
    }));
    return this.leads;
  }

  getLeads() {
    return this.leads;
  }

  // Scored leads methods
  setScoredLeads(scoredLeadsData) {
    this.scoredLeads = scoredLeadsData;
    return this.scoredLeads;
  }

  getScoredLeads() {
    return this.scoredLeads;
  }

  // Clear methods
  clearAll() {
    this.offer = null;
    this.leads = [];
    this.scoredLeads = [];
  }

  clearLeads() {
    this.leads = [];
    this.scoredLeads = [];
  }
}

// Export singleton instance
module.exports = new DataStore();