const fs = require('fs');
const JSON5 = require('json5');

/**
 * Read and parse a JSON5 file.
 * @param {string} filePath Path to the JSON5 file.
 * @returns {object} Parsed content.
 * @author isahooman
 */
function readJSON5(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON5.parse(data);
  } catch (error) {
    process.stderr.write(`Error reading JSON5 file at ${filePath}: ${error.message}\n`);
    throw error;
  }
}

/**
 * Write data to a JSON5 file with custom formatting.
 * @param {string} filePath Path to the JSON5 file.
 * @param {object} data Data to write to the file.
 * @author isahooman
 */
function writeJSON5(filePath, data) {
  try {
    const replacer = (key, value) =>
      typeof value === 'object' && value !== null ?
        Object.keys(value).length === 0 ? '{\n}' : '' :
        value;

    const json5Data = JSON5.stringify(data, null, 2, replacer);
    fs.writeFileSync(filePath, json5Data, 'utf-8');
  } catch (error) {
    process.stderr.write(`Error writing JSON5 file at ${filePath}: ${error.message}\n`);
    throw error;
  }
}

module.exports = {
  readJSON5,
  writeJSON5,
};
