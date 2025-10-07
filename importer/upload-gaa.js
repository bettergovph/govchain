#!/usr/bin/env node

/**
 * GovChain GAA Dataset Upload Script
 * Uploads GAA (General Appropriations Act) records to the blockchain
 * 
 * Usage: node upload-gaa.js <file> [submitter]
 * Example: node upload-gaa.js samples/gaa.json alice
 */

const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');
const { Transform } = require('stream');

// Colors for console output
const colors = {
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  blue: '\x1b[0;34m',
  nc: '\x1b[0m' // No Color
};

// Configuration
const CATEGORY = 'GAA';
const MIME_TYPE = 'text/plain';
const LOG_DIR = path.join(__dirname, 'logs');
const PROGRESS_LOG = path.join(LOG_DIR, 'upload-progress.jsonl');
const ERROR_LOG = path.join(LOG_DIR, 'upload-errors.log');

// Blockchain node configuration
const BLOCKCHAIN_NODE = process.env.BLOCKCHAIN_NODE || 'tcp://localhost:26657';
const CHAIN_ID = process.env.CHAIN_ID || 'govchain';
const KEYRING_BACKEND = process.env.KEYRING_BACKEND || 'test';

/**
 * Print colored message
 */
function log(message, color = 'nc') {
  console.log(`${colors[color]}${message}${colors.nc}`);
}

/**
 * Check if blockchain CLI is available
 */
function checkBlockchain() {
  try {
    execSync('which govchaind', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Escape shell argument by wrapping in single quotes and escaping internal single quotes
 */
function escapeShellArg(arg) {
  if (typeof arg !== 'string') {
    arg = String(arg);
  }
  // Replace single quotes with '\''
  return "'" + arg.replace(/'/g, "'\\''") + "'";
}

/**
 * Initialize logging directories and files
 */
function initializeLogging() {
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    log('📁 Created logs directory', 'blue');
  }
}

/**
 * Write progress entry to log
 */
function logProgress(entry) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...entry
  };

  fs.appendFileSync(PROGRESS_LOG, JSON.stringify(logEntry) + '\n');
}

/**
 * Write error to error log
 */
function logError(message, error, context = {}) {
  const timestamp = new Date().toISOString();
  const errorEntry = `[${timestamp}] ${message}
Error: ${error}
Context: ${JSON.stringify(context)}

`;

  fs.appendFileSync(ERROR_LOG, errorEntry);
}

/**
 * Read progress log and return the last successfully processed index
 */
function getLastProcessedIndex() {
  if (!fs.existsSync(PROGRESS_LOG)) {
    return -1;
  }

  try {
    const content = fs.readFileSync(PROGRESS_LOG, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return -1;
    }

    // Find the last successful entry
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const entry = JSON.parse(lines[i]);
        if (entry.status === 'success' && typeof entry.index === 'number') {
          return entry.index;
        }
      } catch (e) {
        // Skip malformed lines
        continue;
      }
    }

    return -1;
  } catch (error) {
    log(`⚠️  Warning: Could not read progress log: ${error.message}`, 'yellow');
    return -1;
  }
}

/**
 * Stream JSON array parser for large files
 * Processes one record at a time without loading entire file
 */
class JSONArrayStreamer extends Transform {
  constructor() {
    super({ objectMode: true });
    this.buffer = '';
    this.inArray = false;
    this.bracketDepth = 0;
    this.recordIndex = 0;
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    this.processBuffer();
    callback();
  }

  _flush(callback) {
    this.processBuffer();
    callback();
  }

  processBuffer() {
    let pos = 0;

    while (pos < this.buffer.length) {
      const char = this.buffer[pos];

      if (!this.inArray && char === '[') {
        this.inArray = true;
        pos++;
        continue;
      }

      if (this.inArray) {
        if (char === '{') {
          // Start of a record
          const recordStart = pos;
          let recordBrackets = 0;
          let inString = false;
          let escaped = false;

          for (let i = pos; i < this.buffer.length; i++) {
            const c = this.buffer[i];

            if (escaped) {
              escaped = false;
              continue;
            }

            if (c === '\\') {
              escaped = true;
              continue;
            }

            if (c === '"') {
              inString = !inString;
              continue;
            }

            if (!inString) {
              if (c === '{') recordBrackets++;
              if (c === '}') recordBrackets--;

              if (recordBrackets === 0) {
                // Found complete record
                const recordJson = this.buffer.slice(recordStart, i + 1);
                try {
                  const record = JSON.parse(recordJson);
                  this.push({ record, index: this.recordIndex++ });
                } catch (e) {
                  log(`⚠️  Skipping malformed record at index ${this.recordIndex}: ${e.message}`, 'yellow');
                  this.recordIndex++;
                }

                // Update buffer and position
                this.buffer = this.buffer.slice(i + 1);
                pos = 0;

                // Skip comma and whitespace
                while (pos < this.buffer.length && /[,\s]/.test(this.buffer[pos])) {
                  pos++;
                }
                pos--; // Will be incremented at end of loop
                break;
              }
            }
          }

          if (recordBrackets > 0) {
            // Incomplete record, need more data
            break;
          }
        }
      }

      pos++;
    }
  }
}

/**
 * Process large JSON file using streaming
 */
async function processLargeJSONFile(filePath, submitter, sessionId, startFromIndex = 0) {
  return new Promise((resolve, reject) => {
    const results = [];
    let successCount = 0;
    let failCount = 0;
    let processedCount = 0;

    const fileStream = fs.createReadStream(filePath);
    const jsonStreamer = new JSONArrayStreamer();

    jsonStreamer.on('data', async ({ record, index }) => {
      // Skip records before startFromIndex
      if (index < startFromIndex) {
        return;
      }

      try {
        log(`\n🔄 Processing ${index + 1} (${((index + 1) / (index + 1) * 100).toFixed(1)}%)`, 'blue');

        const result = await processGAARecord(record, index, submitter, sessionId);
        results.push(result);
        successCount++;
        processedCount++;

        // Small delay between records to avoid sequence conflicts and overwhelming the system
        log('⏱️  Waiting 2 seconds before next transaction...', 'blue');
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        log(`❌ Failed to process record ${index + 1}: ${error.message}`, 'red');
        results.push({
          success: false,
          error: error.message,
          index: index
        });
        failCount++;
        processedCount++;

        // Continue processing other records instead of stopping
        log('⚠️  Continuing with next record...', 'yellow');
      }
    });

    jsonStreamer.on('end', () => {
      resolve({ results, successCount, failCount, processedCount, startFromIndex });
    });

    jsonStreamer.on('error', (error) => {
      reject(error);
    });

    fileStream.pipe(jsonStreamer);
  });
}

/**
 * Generate session ID for this upload run
 */
function generateSessionId() {
  return `gaa-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get file size in a human-readable format
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;

  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file is too large for regular processing
 */
function isFileTooLarge(filePath) {
  const stats = fs.statSync(filePath);
  const maxSize = 100 * 1024 * 1024; // 100MB threshold
  return stats.size > maxSize;
}

/**
 * Calculate SHA-256 checksum of a string
 */
function calculateChecksum(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get account sequence number from blockchain
 */
function getAccountSequence(account) {
  try {
    const address = execSync(`govchaind keys show ${escapeShellArg(account)} --address --keyring-backend ${escapeShellArg(KEYRING_BACKEND)}`, {
      encoding: 'utf-8'
    }).trim();

    const result = execSync(`govchaind query auth account ${escapeShellArg(address)} --node ${escapeShellArg(BLOCKCHAIN_NODE)} --output json`, {
      encoding: 'utf-8'
    });

    const accountInfo = JSON.parse(result);
    const sequence = parseInt(accountInfo.account?.sequence || '0');
    log(`📋 Current account sequence for ${account}: ${sequence}`, 'blue');
    return sequence;
  } catch (error) {
    log(`⚠️  Warning: Could not fetch account sequence for ${account}: ${error.message}`, 'yellow');
    return null;
  }
}

/**
 * Submit entry to blockchain
 */
function submitToBlockchain(params) {
  const {
    title,
    description,
    ipfsCid,
    mimeType,
    fileName,
    fileUrl,
    fallbackUrl,
    fileSize,
    checksum,
    agency,
    category,
    submitter,
    timestamp
  } = params;

  log('⛓️  Submitting to blockchain...', 'yellow');

  // Get current account sequence for proper transaction ordering
  const currentSequence = getAccountSequence(submitter);
  let sequenceFlag = '';

  if (currentSequence !== null) {
    sequenceFlag = `--sequence ${currentSequence}`;
    log(`🔢 Using sequence number: ${currentSequence}`, 'blue');
  } else {
    log('⚠️  Proceeding without explicit sequence (blockchain will auto-determine)', 'yellow');
  }

  try {
    const command = `govchaind tx datasets create-entry \
      ${escapeShellArg(title)} \
      ${escapeShellArg(description)} \
      ${escapeShellArg(ipfsCid)} \
      ${escapeShellArg(mimeType)} \
      ${escapeShellArg(fileName)} \
      ${escapeShellArg(fileUrl)} \
      ${escapeShellArg(fallbackUrl)} \
      ${escapeShellArg(fileSize)} \
      ${escapeShellArg(checksum)} \
      ${escapeShellArg(agency)} \
      ${escapeShellArg(category)} \
      ${escapeShellArg(submitter)} \
      ${escapeShellArg(timestamp)} \
      ${escapeShellArg('0')} \
      --from ${escapeShellArg(submitter)} \
      --node ${escapeShellArg(BLOCKCHAIN_NODE)} \
      --chain-id ${escapeShellArg(CHAIN_ID)} \
      --keyring-backend ${escapeShellArg(KEYRING_BACKEND)} \
      ${sequenceFlag} \
      --gas auto \
      --gas-adjustment 1.5 \
      --yes \
      --output json`;

    const result = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000
    });

    const txResult = JSON.parse(result);

    if (txResult.txhash) {
      log('✓ Transaction submitted successfully', 'green');
      log(`📋 Transaction hash: ${txResult.txhash}`, 'green');
      return txResult.txhash;
    } else {
      throw new Error('No transaction hash returned');
    }
  } catch (error) {
    // Check if it's a sequence mismatch error
    if (error.message.includes('account sequence mismatch') || error.message.includes('incorrect account sequence')) {
      log('⚠️  Sequence mismatch detected - this is common in rapid transaction submission', 'yellow');
      log('🔄 The blockchain will auto-correct on the next transaction', 'yellow');
      throw new Error(`Sequence mismatch: ${error.message}. Try running again or use --resume to continue from last successful transaction.`);
    }
    throw new Error(`Blockchain submission failed: ${error.message}`);
  }
}

/**
 * Process a single GAA record
 */
async function processGAARecord(record, index, submitter, sessionId) {
  log(`\n${'='.repeat(50)}`, 'yellow');
  log(`Processing record ${index + 1}`, 'yellow');
  log('='.repeat(50), 'yellow');

  // Log start of processing
  logProgress({
    sessionId,
    index,
    status: 'started',
    record_preview: {
      DSC: record.DSC,
      UACS_DPT_DSC: record.UACS_DPT_DSC,
      UACS_SOBJ_DSC: record.UACS_SOBJ_DSC
    }
  });

  try {
    // Build title from DSC + UACS_SOBJ_DSC
    const dsc = record.DSC || '';
    const uacsSobjDsc = record.UACS_SOBJ_DSC || '';
    const title = `${dsc} ${uacsSobjDsc}`.trim() || 'GAA Record';

    // Agency from UACS_DPT_DSC
    const agency = record.UACS_DPT_DSC || 'Unknown Agency';

    // Description is the entire record as JSON
    const description = JSON.stringify(record);

    // Calculate checksum of the JSON record
    const checksum = calculateChecksum(description);

    log(`📝 Title: ${title}`, 'yellow');
    log(`🏛️  Agency: ${agency}`, 'yellow');
    log(`📁 Category: ${CATEGORY}`, 'yellow');
    log(`🔐 Checksum: ${checksum}`, 'yellow');

    // Prepare blockchain submission parameters
    const timestamp = Math.floor(Date.now() / 1000);
    const fileName = `gaa-record-${index + 1}.json`;
    const fileSize = Buffer.byteLength(description, 'utf8');

    const params = {
      title,
      description,
      ipfsCid: '',
      mimeType: MIME_TYPE,
      fileName: '',
      fileUrl: '',
      fallbackUrl: '',
      fileSize: '0',
      checksum,
      agency,
      category: CATEGORY,
      submitter,
      timestamp: timestamp.toString()
    };

    // Submit to blockchain
    const txHash = submitToBlockchain(params);

    // Log successful completion
    const successEntry = {
      sessionId,
      index,
      status: 'success',
      txHash,
      title,
      agency,
      checksum,
      timestamp,
      processingTime: Date.now()
    };

    logProgress(successEntry);

    log('✅ Record uploaded successfully!', 'green');
    log(`   TX Hash: ${txHash}`, 'green');

    return {
      success: true,
      title,
      txHash,
      index
    };

  } catch (error) {
    // Log failure
    const errorEntry = {
      sessionId,
      index,
      status: 'failed',
      error: error.message,
      timestamp: Date.now()
    };

    logProgress(errorEntry);
    logError(`Failed to process record ${index + 1}`, error.message, {
      sessionId,
      index,
      record_preview: {
        DSC: record.DSC,
        UACS_DPT_DSC: record.UACS_DPT_DSC
      }
    });

    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('================================');
  console.log('GovChain GAA Upload Tool');
  console.log('================================\n');

  // Initialize logging
  initializeLogging();

  log(`🌐 Blockchain Node: ${BLOCKCHAIN_NODE}`, 'yellow');
  log(`⛓️  Chain ID: ${CHAIN_ID}`, 'yellow');
  console.log('');

  // Parse arguments
  const args = process.argv.slice(2);

  if (args.length < 1) {
    log('❌ Error: Missing required argument', 'red');
    console.log('\nUsage: node upload-gaa.js <file> [submitter] [--resume]');
    console.log('\nExample:');
    console.log('  node upload-gaa.js samples/gaa.json alice');
    console.log('  node upload-gaa.js samples/gaa.json alice --resume\n');
    process.exit(1);
  }

  const filePath = args[0];
  const submitter = args[1] || 'alice';
  const shouldResume = args.includes('--resume');

  // Generate session ID
  const sessionId = generateSessionId();

  // Validate file exists
  if (!fs.existsSync(filePath)) {
    log(`❌ Error: File not found: ${filePath}`, 'red');
    process.exit(1);
  }

  // Check prerequisites
  if (!checkBlockchain()) {
    log('❌ Error: govchaind not found', 'red');
    console.log('Please build the blockchain first by running:');
    console.log('  cd blockchain && ignite chain build\n');
    process.exit(1);
  }

  log(`📄 File: ${filePath}`, 'yellow');
  log(`🔑 Submitter: ${submitter}`, 'yellow');
  log(`🏷️  Session ID: ${sessionId}`, 'blue');

  // Check file size and determine processing method
  const fileSize = getFileSize(filePath);
  const useLargeFileProcessing = isFileTooLarge(filePath);

  log(`📊 File size: ${fileSize}`, useLargeFileProcessing ? 'yellow' : 'green');

  if (useLargeFileProcessing) {
    log(`🔄 Large file detected - using streaming processor`, 'blue');
  }

  // Check for resume capability
  let startFromIndex = 0;
  if (shouldResume) {
    const lastProcessedIndex = getLastProcessedIndex();
    if (lastProcessedIndex >= 0) {
      startFromIndex = lastProcessedIndex + 1;
      log(`🔄 Resuming from record ${startFromIndex + 1} (last successful: ${lastProcessedIndex + 1})`, 'blue');
    } else {
      log('🔄 Resume requested but no previous progress found, starting from beginning', 'yellow');
    }
  }

  console.log('');

  // Process file based on size
  let results, successCount, failCount, processedCount, totalRecords;
  let records = []; // Initialize records array for scope availability

  if (useLargeFileProcessing) {
    // Use streaming processor for large files
    log('🌊 Starting streaming file processor...', 'blue');

    try {
      const streamResult = await processLargeJSONFile(filePath, submitter, sessionId, startFromIndex);
      results = streamResult.results;
      successCount = streamResult.successCount;
      failCount = streamResult.failCount;
      processedCount = streamResult.processedCount;
      totalRecords = startFromIndex + processedCount; // Approximate

      log(`📊 Processed ${processedCount} records from stream`, 'green');
    } catch (error) {
      log(`❌ Error processing large file: ${error.message}`, 'red');
      logError('Failed to process large file with streaming', error.message, { filePath, sessionId });
      process.exit(1);
    }

  } else {
    // Use traditional in-memory processing for smaller files
    log('📊 Loading file into memory...', 'blue');

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      records = JSON.parse(fileContent);

      if (!Array.isArray(records)) {
        throw new Error('JSON file must contain an array of records');
      }

      totalRecords = records.length;
      log(`📊 Found ${totalRecords} records to process`, 'green');
      if (startFromIndex > 0) {
        log(`📊 Processing ${totalRecords - startFromIndex} remaining records`, 'green');
      }
    } catch (error) {
      log(`❌ Error reading file: ${error.message}`, 'red');
      logError('Failed to read input file', error.message, { filePath, sessionId });
      process.exit(1);
    }

    // Log session start
    logProgress({
      sessionId,
      status: 'session_started',
      filePath,
      submitter,
      totalRecords,
      startFromIndex,
      resumeMode: shouldResume
    });

    // Process each record starting from the appropriate index
    results = [];
    successCount = 0;
    failCount = 0;

    for (let i = startFromIndex; i < records.length; i++) {
      try {
        log(`\n🔄 Processing ${i + 1}/${records.length} (${((i + 1) / records.length * 100).toFixed(1)}%)`, 'blue');

        const result = await processGAARecord(records[i], i, submitter, sessionId);
        results.push(result);
        successCount++;

        // Small delay between records to avoid sequence conflicts and overwhelming the system
        if (i < records.length - 1) {
          log('⏱️  Waiting 2 seconds before next transaction...', 'blue');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        log(`❌ Failed to process record ${i + 1}: ${error.message}`, 'red');
        results.push({
          success: false,
          error: error.message,
          index: i
        });
        failCount++;

        // Continue processing other records instead of stopping
        log('⚠️  Continuing with next record...', 'yellow');
      }
    }

    processedCount = successCount + failCount;
  }
  let skippedCount = startFromIndex;

  // Log session completion
  logProgress({
    sessionId,
    status: 'session_completed',
    totalRecords: totalRecords || records.length,
    processedRecords: successCount + failCount,
    skippedRecords: skippedCount,
    successCount,
    failCount,
    completionTime: new Date().toISOString()
  });

  // Final summary
  console.log('\n' + '='.repeat(50));
  log('📊 UPLOAD SUMMARY', 'green');
  console.log('='.repeat(50));
  if (skippedCount > 0) {
    log(`⏭️  Skipped (resume): ${skippedCount}`, 'blue');
  }
  log(`✅ Successful: ${successCount}`, 'green');
  if (failCount > 0) {
    log(`❌ Failed: ${failCount}`, 'red');
  }
  log(`📝 Total processed: ${processedCount}`, 'yellow');
  if (useLargeFileProcessing) {
    log(`🌊 Used streaming processor for large file`, 'blue');
  }

  console.log('\n📁 Log files:');
  console.log(`  Progress: ${PROGRESS_LOG}`);
  if (failCount > 0) {
    console.log(`  Errors: ${ERROR_LOG}`);
  }

  if (failCount > 0) {
    console.log('\n🔄 To retry failed records, run:');
    console.log(`  node upload-gaa.js ${filePath} ${submitter} --resume`);
  }

  console.log('\nVerify on blockchain:');
  console.log('  govchaind query datasets list-entry');
  console.log(`  govchaind query datasets entries-by-category ${CATEGORY}`);
  console.log('');

  process.exit(failCount > 0 ? 1 : 0);
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { processGAARecord, calculateChecksum };
