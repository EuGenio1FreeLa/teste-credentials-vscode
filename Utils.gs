// =============================
// FUNÇÕES UTILITÁRIAS DO SISTEMA
// =============================

/**
 * Registra informações para debug
 */
function logInfo(message, context) {
  context = context || {};
  var timestamp = new Date().toISOString();
  var contextStr = Object.keys(context).length > 0 ? (' | Contexto: ' + JSON.stringify(context)) : '';
  Logger.log('[INFO] ' + timestamp + ' - ' + message + contextStr);
}

/**
 * Registra erros para debug
 */
function logError(message, error, context) {
  context = context || {};
  var timestamp = new Date().toISOString();
  var errorDetails = error ? (' | Erro: ' + (error.message || error)) : '';
  var contextStr = Object.keys(context).length > 0 ? (' | Contexto: ' + JSON.stringify(context)) : '';
  Logger.log('[ERROR] ' + timestamp + ' - ' + message + errorDetails + contextStr);
}

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
 * Formats a date for display in Brazilian format DD/MM/YYYY
 * @param {Date} data - The date to format
 * @returns {string} Formatted date
 */
function formatarData(data) {
  if (!(data instanceof Date)) {
    data = new Date(data);
  }
  return data.getDate().toString().padStart(2, '0') + '/' + 
         (data.getMonth() + 1).toString().padStart(2, '0') + '/' + 
         data.getFullYear();
}

/**
 * Formats a date as yyyy-MM-dd (default) or custom format.
 * @param {Date} date
 * @param {string} [format] - e.g. 'yyyy-MM-dd'
 * @returns {string}
 */
function formatDate(date, format) {
  format = format || 'yyyy-MM-dd';
  if (!(date instanceof Date)) return '';
  var yyyy = date.getFullYear();
  var mm = String(date.getMonth() + 1).padStart(2, '0');
  var dd = String(date.getDate()).padStart(2, '0');
  if (format === 'yyyy-MM-dd') return yyyy + '-' + mm + '-' + dd;
  // Add more formats as needed
  return yyyy + '-' + mm + '-' + dd;
}
