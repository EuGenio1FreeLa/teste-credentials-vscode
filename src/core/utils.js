// =============================
// SHARED UTILS
// =============================

/**
 * Returns the active spreadsheet instance.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getActiveSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Returns a sheet by name from a spreadsheet.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet
 * @param {string} name
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function getSheetByName(spreadsheet, name) {
  return spreadsheet.getSheetByName(name);
}

/**
 * Shows a UI alert (if possible).
 * @param {string} message
 */
function showAlert(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    Logger.log('Alert: ' + message);
  }
}

/**
 * Formats a date as yyyy-MM-dd (default) or custom format.
 * @param {Date} date
 * @param {string} [format] - e.g. 'yyyy-MM-dd'
 * @returns {string}
 */
function formatDate(date, format = 'yyyy-MM-dd') {
  if (!(date instanceof Date)) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  if (format === 'yyyy-MM-dd') return `${yyyy}-${mm}-${dd}`;
  // Add more formats as needed
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = {
  getActiveSpreadsheet,
  getSheetByName,
  showAlert,
  formatDate
};
