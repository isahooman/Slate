const { readJSON5, writeJSON5 } = require('./json5Parser.js');
const { logger } = require('./loggerUtil.js');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { createReadStream, createWriteStream } = require('fs');

const pipelineAsync = promisify(pipeline);

const MAX_SIZE = 1.8 * 1024 * 1024 * 1024; // 1.8gb small limit to avoid the 2gb fs limit

/**
 * Reads a file and returns its contents as a string or object.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string|object>} - A promise that returns the file contents as a string or object.
 * @author isahooman
 */
async function readFile(filePath) {
  logger.debug(`Reading file: ${filePath}`);
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    if (fileExtension === '.json5') {
      logger.debug(`File extension is .json5, using readJSON5`);
      return readJSON5(filePath);
    } else {
      logger.debug(`File extension is not .json5, checking file size`);
      try {
        await promisify(fs.access)(filePath, fs.constants.R_OK);
        logger.debug(`File exists and is readable, checking file size`);
        const stats = await promisify(fs.stat)(filePath);
        logger.debug(`File size: ${stats.size}`);
        if (stats.size > MAX_SIZE) {
          logger.debug(`File size is larger than ${MAX_SIZE}, using readLargeFile`);
          return readLargeFile(filePath);
        } else {
          logger.debug(`File size is smaller than ${MAX_SIZE}, using fs.readFile`);
          const data = await promisify(fs.readFile)(filePath, 'utf-8');
          return data;
        }
      } catch (error) {
        logger.error(`Error accessing file at ${filePath}: ${error.message}`);
        throw error;
      }
    }
  } catch (error) {
    logger.error(`Error reading file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Writes data to a file.
 * @param {string} filePath - The path to the file.
 * @param {string|object} data - The data to write to the file.
 * @returns {Promise<void>} - A promise that resolves when the write operation is complete.
 * @author isahooman
 */
async function writeFile(filePath, data) {
  logger.debug(`Writing data to file: ${filePath}`);
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    const stats = await promisify(fs.stat)(filePath);
    if (stats.size > MAX_SIZE) {
      logger.debug(`File size is larger than ${MAX_SIZE}, using writeLargeFile`);
      writeLargeFile(filePath, data);
    } else {
      logger.debug(`File size is smaller than ${MAX_SIZE}, checking file extension`);
      if (fileExtension === '.json5') {
        logger.debug(`File extension is .json5, using writeJSON5`);
        writeJSON5(filePath, data);
      } else {
        logger.debug(`File extension is not .json5, using fs.writeFile`);
        await promisify(fs.writeFile)(filePath, data, 'utf-8');
      }
    }
  } catch (error) {
    logger.error(`Error writing file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Recursively reads files and directories.
 * @param {string} directory - The directory to read.
 * @returns {Promise<Array<string|object>>} - A promise that resolves to an array of file contents.
 * @author isahooman
 */
async function readDirectory(directory) {
  logger.debug(`Reading directory: ${directory}`);
  try {
    const files = await promisify(fs.readdir)(directory);
    const fileContents = [];

    for (const file of files) {
      const filePath = path.join(directory, file);
      logger.debug(`Checking file: ${filePath}`);
      const stats = await promisify(fs.stat)(filePath);

      if (stats.isDirectory()) {
        logger.debug(`File is a directory, recursively reading: ${filePath}`);
        fileContents.push(...await readDirectory(filePath));
      } else {
        logger.debug(`File is not a directory, reading file: ${filePath}`);
        fileContents.push(await readFile(filePath));
      }
    }

    logger.debug(`Finished reading directory: ${directory}`);
    return fileContents;
  } catch (error) {
    logger.error(`Error reading directory at ${directory}: ${error.message}`);
    throw error;
  }
}

/**
 * Reads a large file using streams.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<string>} - A promise that resolves to the file contents as a string.
 * @author isahooman
 */
async function readLargeFile(filePath) {
  logger.debug(`Reading large file: ${filePath}`);
  try {
    const data = [];
    await pipelineAsync(
      createReadStream(filePath, 'utf-8'),
      process.stdout,
    );
    logger.debug(`Finished reading large file: ${filePath}`);
    return data.join('');
  } catch (error) {
    logger.error(`Error reading large file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Writes data to a large file using streams.
 * @param {string} filePath - The path to the file.
 * @param {string} data - The data to write to the file.
 * @returns {Promise<void>} - A promise that resolves when the write operation is complete.
 * @author isahooman
 */
// eslint-disable-next-line no-unused-vars
async function writeLargeFile(filePath, data) {
  logger.debug(`Writing data to large file: ${filePath}`);
  try {
    await pipelineAsync(
      createWriteStream(filePath, 'utf-8'),
      process.stdin,
    );
    logger.debug(`Finished writing data to large file: ${filePath}`);
  } catch (error) {
    logger.error(`Error writing large file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Recursively reads a directory and its subdirectories.
 * @param {string} directory - The directory to read.
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of file paths.
 * @author isahooman
 */
async function readRecursive(directory) {
  logger.debug(`Reading directory recursively: ${directory}`);
  try {
    const files = await promisify(fs.readdir)(directory);
    const filePaths = [];

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await promisify(fs.stat)(filePath);

      if (stats.isDirectory()) {
        logger.debug(`File is a directory, recursively reading: ${filePath}`);
        filePaths.push(...await readRecursive(filePath));
      } else {
        logger.debug(`File is not a directory, adding to list: ${filePath}`);
        filePaths.push(filePath);
      }
    }

    logger.debug(`Finished reading directory recursively: ${directory}`);
    return filePaths;
  } catch (error) {
    logger.error(`Error reading directory recursively at ${directory}: ${error.message}`);
    throw error;
  }
}

/**
 * Writes data to a temporary file.
 * @param {string} filePath - The path to the temporary file.
 * @param {string} data - The data to write to the file.
 * @returns {Promise<void>} - A promise that resolves when the write operation is complete.
 * @author isahooman
 */
async function writeTempFile(filePath, data) {
  logger.debug(`Writing data to temporary file: ${filePath}`);
  try {
    await promisify(fs.writeFile)(filePath, data, 'utf-8');
    logger.debug(`Finished writing data to temporary file: ${filePath}`);
  } catch (error) {
    logger.error(`Error writing temporary file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Deletes a temporary file.
 * @param {string} filePath - The path to the temporary file.
 * @returns {Promise<void>} - A promise that resolves when the delete operation is complete.
 * @author isahooman
 */
async function deleteTempFile(filePath) {
  logger.debug(`Deleting temporary file: ${filePath}`);
  try {
    await promisify(fs.unlink)(filePath);
    logger.debug(`Finished deleting temporary file: ${filePath}`);
  } catch (error) {
    logger.error(`Error deleting temporary file at ${filePath}: ${error.message}`);
    throw error;
  }
}

module.exports =
{
  readFile,
  writeFile,
  readDirectory,
  readRecursive,
  writeTempFile,
  deleteTempFile,
};
