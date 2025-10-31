/**
 * CSV Exporter utility
 * Converts scored leads data to CSV format for export
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of scored lead objects
 * @returns {string} CSV formatted string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Define headers
  const headers = ['Name', 'Role', 'Company', 'Industry', 'Location', 'Intent', 'Score', 'Reasoning'];
  
  // Create CSV rows
  const csvRows = [headers.join(',')];

  data.forEach(lead => {
    const row = [
      escapeCSVField(lead.name),
      escapeCSVField(lead.role),
      escapeCSVField(lead.company),
      escapeCSVField(lead.industry),
      escapeCSVField(lead.location),
      escapeCSVField(lead.intent),
      lead.score,
      escapeCSVField(lead.reasoning)
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Escape special characters in CSV fields
 * @param {string} field - Field value to escape
 * @returns {string} Escaped field value
 */
function escapeCSVField(field) {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringField = String(field);
  
  // If field contains comma, newline, or quote, wrap in quotes and escape existing quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}

module.exports = { convertToCSV };