const { readJSON5, writeJSON5 } = require('./json5Parser.js');
const { logger } = require('./loggerUtil.js');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { pipeline, Readable } = require('stream');
const { createReadStream, createWriteStream } = require('fs');

const pipelineAsync = promisify(pipeline);

const MAX_SIZE = 1.8 * 1024 * 1024 * 1024; // 1.8GB limit to avoid the 2GB fs limit

/**
 * Reads the contents of a file.
 *
 * This function handles different file types and sizes.
 * For .json5 files, it uses the `readJSON5` function.
 * For other files, it checks the file size and uses either `fs.readFile` or `readLargeFile` accordingly.
 *
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
          // If the file size exceeds MAX_SIZE, use readLargeFile
          logger.debug(`File size is larger than ${MAX_SIZE}, using readLargeFile`);
          return readLargeFile(filePath);
        } else {
          // If the file size is within the limit, use fs.readFile
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
 * Reads a large file using a stream.
 * This function is used for files larger than the `MAX_SIZE` limit.
 * It reads the file in chunks and writes the data to the `process.stdout` stream.
 *
 * @param {string} filePath The path to the file to read.
 * @returns {Promise<string>} A promise that resolves to the file contents as a string.
 * @author isahooman
 */
async function readLargeFile(filePath) {
  logger.debug(`Reading large file: ${filePath}`);
  try {
    const data = [];

    // Use pipeline to read the file
    await pipelineAsync(
      createReadStream(filePath, 'utf-8'),
      process.stdout,
    );

    // Log the successful completion of the file reading process
    logger.debug(`Finished reading large file: ${filePath}`);

    // Return the file data as a single string
    return data.join('');
  } catch (error) {
    logger.error(`Error reading large file at ${filePath}: ${error.message}`);
  }
}

/**
 * Writes data to a file.
 * For .json5 files, it uses the `writeJSON5` function.
 * For files larger than `MAX_SIZE` uses
 *
 * @param {string} filePath The path to the file to write to.
 * @param {string|object} data The data to write to the file.
 * @returns {Promise<void>} A promise that resolves when the data has been written to the file.
 *
 * @author isahooman
 */
async function writeFile(filePath, data) {
  logger.debug(`Writing data to file: ${filePath}`);
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    const stats = await promisify(fs.stat)(filePath);
    if (stats.size > MAX_SIZE) {
      // If the file size exceeds MAX_SIZE, use writeLargeFile
      logger.debug(`File size is larger than ${MAX_SIZE}, using writeLargeFile`);
      await writeLargeFile(filePath, data);
    } else {
      // Check the file extension to determine the write method
      logger.debug(`File size is smaller than ${MAX_SIZE}, checking file extension`);
      if (fileExtension === '.json5') {
        // If the file extension is .json5, use writeJSON5
        logger.debug(`File extension is .json5, using writeJSON5`);
        await writeJSON5(filePath, data);
      } else {
        // If the file extension is not .json5, use fs.writeFile
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
 * Writes data to a large file using a stream.
 * Used for files larger than the `MAX_SIZE` limit.
 *
 * @param {string} filePath The path to the file to write to.
 * @param {string|object} data The data to write to the file.
 * @returns {Promise<void>} A promise that resolves when the data has been written to the file.
 * @author isahooman
 */
async function writeLargeFile(filePath, data) {
  logger.debug(`Writing data to large file: ${filePath}`);
  try {
    const writeStream = createWriteStream(filePath, 'utf-8');
    await pipelineAsync(
      Readable.from(data),
      writeStream,
    );
    logger.debug(`Finished writing data to large file: ${filePath}`);
  } catch (error) {
    logger.error(`Error writing large file at ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Reads the contents of a directory.
 * This function recursively reads the contents of a directory and its subdirectories.
 * It returns an array of file contents as strings
 *
 * @param {string} directory The path to the directory to read.
 * @returns {Promise<Array<string|object>>} A promise that resolves to an array of file contents.
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
        // If the file is a directory, recursively read its contents
        logger.debug(`File is a directory, recursively reading: ${filePath}`);
        fileContents.push(...await readDirectory(filePath));
      } else {
        // If the file is not a directory, read its contents
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
 * Reads the file paths of all files in a directory recursively.
 *
 * This function recursively reads the contents of a directory and its subdirectories.
 * It returns an array of file paths as strings.
 *
 * @param {string} directory The path to the directory to read.
 *
 * @returns {Promise<Array<string>>} A promise that resolves to an array of file paths.
 *
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
        // If the file is a directory, recursively add its file paths
        logger.debug(`File is a directory, recursively reading: ${filePath}`);
        filePaths.push(...await readRecursive(filePath));
      } else {
        // If the file is not a directory, add its path to the list
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
 * Deletes a file.
 *
 * @param {string} filePath The path to the file.
 *
 * @returns {Promise<void>} A promise that resolves when the file has been deleted.
 *
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
