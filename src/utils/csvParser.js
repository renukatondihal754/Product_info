/**
 * CSV Parser utility
 * Handles parsing of uploaded CSV files containing lead data
 */

const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parse CSV file and return array of lead objects
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} Array of parsed lead objects
 */
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const requiredColumns = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Normalize column names (trim whitespace, lowercase)
        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = key.trim().toLowerCase();
          normalizedData[normalizedKey] = data[key].trim();
        });

        // Validate required columns exist
        const hasAllColumns = requiredColumns.every(col =>
          col in normalizedData
        );

        if (!hasAllColumns && results.length === 0) {
          reject(new Error(`CSV must contain columns: ${requiredColumns.join(', ')}`));
          return;
        }

        // Map to expected structure
        const lead = {
          name: normalizedData.name || '',
          role: normalizedData.role || '',
          company: normalizedData.company || '',
          industry: normalizedData.industry || '',
          location: normalizedData.location || '',
          linkedin_bio: normalizedData.linkedin_bio || ''
        };

        results.push(lead);
      })
      .on('end', () => {
        // Clean up the uploaded file
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });

        if (results.length === 0) {
          reject(new Error('CSV file is empty or invalid'));
        } else {
          resolve(results);
        }
      })
      .on('error', (error) => {
        // Clean up on error
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });
        reject(error);
      });
  });
}

module.exports = { parseCSV };