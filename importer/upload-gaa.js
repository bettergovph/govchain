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

// Colors for console output
const colors = {
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  nc: '\x1b[0m' // No Color
};

// Configuration
const CATEGORY = 'GAA';
const MIME_TYPE = 'text/plain';

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
 * Calculate SHA-256 checksum of a string
 */
function calculateChecksum(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
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
  
  const entryId = `gaa-entry-${timestamp}`;
  
  try {
    const command = `govchaind tx datasets create-entry \
      "${entryId}" \
      "${title}" \
      "${description}" \
      "${ipfsCid}" \
      "${mimeType}" \
      "${fileName}" \
      "${fileUrl}" \
      "${fallbackUrl}" \
      "${fileSize}" \
      "${checksum}" \
      "${agency}" \
      "${category}" \
      "${submitter}" \
      "${timestamp}" \
      "0" \
      --from "${submitter}" \
      --chain-id govchain \
      --keyring-backend test \
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
    throw new Error(`Blockchain submission failed: ${error.message}`);
  }
}

/**
 * Process a single GAA record
 */
async function processGAARecord(record, index, submitter) {
  log(`\n${'='.repeat(50)}`, 'yellow');
  log(`Processing record ${index + 1}`, 'yellow');
  log('='.repeat(50), 'yellow');
  
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
  
  log('✅ Record uploaded successfully!', 'green');
  log(`   TX Hash: ${txHash}`, 'green');
  
  return {
    success: true,
    title,
    txHash
  };
}

/**
 * Main function
 */
async function main() {
  console.log('================================');
  console.log('GovChain GAA Upload Tool');
  console.log('================================\n');
  
  // Parse arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    log('❌ Error: Missing required argument', 'red');
    console.log('\nUsage: node upload-gaa.js <file> [submitter]');
    console.log('\nExample:');
    console.log('  node upload-gaa.js ../importer/samples/gaa.json alice\n');
    process.exit(1);
  }
  
  const filePath = args[0];
  const submitter = args[1] || 'alice';
  
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
  console.log('');
  
  // Read and parse JSON file
  let records;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    records = JSON.parse(fileContent);
    
    if (!Array.isArray(records)) {
      throw new Error('JSON file must contain an array of records');
    }
    
    log(`📊 Found ${records.length} records to process`, 'green');
  } catch (error) {
    log(`❌ Error reading file: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // Process each record
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < records.length; i++) {
    try {
      const result = await processGAARecord(records[i], i, submitter);
      results.push(result);
      successCount++;
      
      // Small delay between records to avoid overwhelming the system
      if (i < records.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      log(`❌ Failed to process record ${i + 1}: ${error.message}`, 'red');
      results.push({
        success: false,
        error: error.message
      });
      failCount++;
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  log('📊 UPLOAD SUMMARY', 'green');
  console.log('='.repeat(50));
  log(`✅ Successful: ${successCount}`, 'green');
  if (failCount > 0) {
    log(`❌ Failed: ${failCount}`, 'red');
  }
  log(`📝 Total: ${records.length}`, 'yellow');
  
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
