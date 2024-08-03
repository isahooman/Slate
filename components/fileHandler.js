const { readJSON5, writeJSON5 } = require('./json5Parser.js');
const { logger } = require('./loggerUtil.js');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { pipeline, Readable } = require('stream');
const { createWriteStream, appendFile } = require('fs');
const pipelineAsync = promisify(pipeline);

const MAX_SIZE = 1.9 * 1024 * 1024 * 1024; // 1.9GB limit to avoid the 2GB fs limit

/**
 * Reads the contents of a file.
 * For .json5 files, it uses the `readJSON5` function.
 * For other files, it checks the file size and uses either `fs.readFile` or `readLargeFile` accordingly.
 * @param {string} filePath The path to the file to read.
 * @returns {Promise<string|object>} A promise that resolves to the file contents as a string or an object.
 * @author isahooman
 */
async function readFile(filePath) {
  logger.debug(`Reading file: ${filePath}`);
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    if (fileExtension === '.json5') {
      // If the file extension is .json5, use readJSON5
      logger.debug(`File extension is .json5, using readJSON5`);
      return readJSON5(filePath);
    } else {
      logger.debug(`File extension is not .json5, checking file size`);
      try {
        const stats = await promisify(fs.stat)(filePath);
        logger.debug(`File size: ${stats.size}`);
        if (stats.size > MAX_SIZE) {
          // If the file size exceeds the `MAX_SIZE` limit, return a message
          return `File is too large to read.`;
        } else {
          // If the file size is within the limit, use fs.readFile
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
 * For files larger than `MAX_SIZE` uses `writeLargeFile`
 * @param {string} filePath The path to the file to write to.
 * @param {string|object} data The data to write to the file.
 * @returns {Promise<void>} A promise that resolves when the data has been written to the file.
 * @author isahooman
 */
async function writeFile(filePath, data) {
  logger.debug(`Writing data to file: ${filePath}`);
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    const stats = await promisify(fs.stat)(filePath);
    // If the file size exceeds MAX_SIZE, use writeLargeFile
    if (stats.size > MAX_SIZE) {
      await writeLargeFile(filePath, data);
    } else
      // Check the file extension to determine the write method
      if (fileExtension === '.json5') {
        // If the file extension is .json5, use writeJSON5
        logger.debug(`File extension is .json5, using writeJSON5`);
        await writeJSON5(filePath, data);
      } else {
        // If the file is not .json5, use fs.appendFile
        logger.debug(`File extension is not .json5, using fs.appendFile`);
        await promisify(appendFile)(filePath, data, 'utf-8');
      }
  } catch (error) {
    logger.error(`Error writing file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Writes data to a large file using a stream.
 * Used for files larger than the `MAX_SIZE` limit.
 * @param {string} filePath The path to the file to write to.
 * @param {string|object} data The data to write to the file.
 * @returns {Promise<void>} A promise that resolves when the data has been written to the file.
 * @author isahooman
 */
async function writeLargeFile(filePath, data) {
  logger.debug(`Writing data to large file: ${filePath}`);
  try {
    // Create a write stream to write to the file.
    const writeStream = createWriteStream(filePath, { flags: 'a', encoding: 'utf-8' });
    // Create a readable stream from the data
    const readableStream = new Readable({
      read() {
        // Pushes the data to stream.
        this.push(data);
        // Ends the stream when there's no more data to push.
        this.push(null);
      },
    });

    // Send the data from the read stream to the write stream
    await pipelineAsync(readableStream, writeStream);
    logger.debug(`Finished writing data to large file: ${filePath}`);
  } catch (error) {
    logger.error(`Error writing data to large file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Reads the contents of a directory.
 * This function reads the contents of a directory without recursion.
 * It returns an array of file contents as strings
 * @param {string} directory The path to the directory to read.
 * @returns {Promise<Array<string|object>>} A promise that resolves to an array of file contents.
 * @author isahooman
 */
async function readDirectory(directory) {
  logger.debug(`Reading directory: ${directory}`);
  try {
    const files = await promisify(fs.readdir)(directory);
    // Initializes an array to store the file paths.
    const filePaths = [];

    // Iterates through each item in the directory.
    for (const file of files) {
      // Constructs the full path to the file.
      const filePath = path.join(directory, file);
      logger.debug(`Checking file: ${filePath}`);
      // Gets the file stats
      const stats = await promisify(fs.stat)(filePath);

      // Checks if the item is a directory.
      if (!stats.isDirectory()) {
        // If the file is not a directory, add the file path to the filePaths array
        logger.debug(`File is not a directory, adding to list: ${filePath}`);
        filePaths.push(filePath);
      }
    }

    logger.debug(`Finished reading directory: ${directory}`);
    // Returns the array of file paths.
    return filePaths;
  } catch (error) {
    logger.error(`Error reading directory at ${directory}: ${error.message}`);
    throw error;
  }
}

/**
 * Recursively reads a directory and its subdirectories.
 * It returns an array of file paths as strings.
 * @param {string} directory The path to the directory to read.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of file paths.
 * @author isahooman
 */
async function readRecursive(directory) {
  logger.debug(`Recursively reading directory: ${directory}`);
  try {
    const files = await promisify(fs.readdir)(directory);
    // Initialize an array to store the file paths
    const filePaths = [];

    // Iterate through each item in the directory
    for (const file of files) {
      // Construct the full path to the file
      const filePath = path.join(directory, file);
      const stats = await promisify(fs.stat)(filePath);

      // Check if the item is a directory
      if (stats.isDirectory()) {
        // If it's a directory, recursively call readRecursive to read the directory
        logger.debug(`File is a directory, recursively reading: ${filePath}`);
        filePaths.push(...await readRecursive(filePath));
      } else {
        // If it's not a directory, add the file path to the filePaths array
        logger.debug(`File is not a directory, adding to list: ${filePath}`);
        filePaths.push(filePath);
      }
    }

    logger.debug(`Finished reading directory recursively: ${directory}`);
    // Return the array of file paths
    return filePaths;
  } catch (error) {
    logger.error(`Error reading directory recursively at ${directory}: ${error.message}`);
    throw error;
  }
}

/**
 * Deletes a file.
 * @param {string} filePath The path to the file.
 * @returns {Promise<void>} A promise that resolves when the file has been deleted.
 * @author isahooman
 */
async function deleteFile(filePath) {
  logger.debug(`Deleting file: ${filePath}`);
  try {
    await promisify(fs.unlink)(filePath);
    logger.debug(`File deleted: ${filePath}`);
  } catch (error) {
    logger.error(`Error deleting file at ${filePath}: ${error.message}`);
    throw error;
  }
}

module.exports =
{
  readFile,
  writeFile,
  readDirectory,
  readRecursive,
  deleteFile,
};
