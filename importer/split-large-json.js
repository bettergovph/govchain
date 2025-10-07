#!/usr/bin/env node

/**
 * JSON File Splitter for Large GAA Datasets
 * Splits large JSON arrays into smaller, manageable chunks
 * 
 * Usage: node split-large-json.js <input-file> [chunk-size] [output-prefix]
 * Example: node split-large-json.js GAA-2025.json 1000 gaa-chunk
 */

const fs = require('fs');
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

/**
 * Print colored message
 */
function log(message, color = 'nc') {
  console.log(`${colors[color]}${message}${colors.nc}`);
}

/**
 * Get file size in human readable format
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Streaming JSON splitter
 */
class JSONSplitter extends Transform {
  constructor(chunkSize, outputPrefix) {
    super({ objectMode: true });
    this.chunkSize = chunkSize;
    this.outputPrefix = outputPrefix;
    this.currentChunk = [];
    this.chunkIndex = 0;
    this.recordIndex = 0;
    this.buffer = '';
    this.inArray = false;
    this.totalRecords = 0;
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    this.processBuffer();
    callback();
  }

  _flush(callback) {
    this.processBuffer();
    if (this.currentChunk.length > 0) {
      this.writeChunk();
    }
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
      
      if (this.inArray && char === '{') {
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
          
          if (c === '\\\\') {
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
                this.addRecord(record);
              } catch (e) {
                log(`⚠️  Skipping malformed record at position ${this.recordIndex}: ${e.message}`, 'yellow');
              }
              
              this.recordIndex++;
              this.totalRecords++;
              
              // Update buffer and position
              this.buffer = this.buffer.slice(i + 1);
              pos = 0;
              
              // Skip comma and whitespace
              while (pos < this.buffer.length && /[,\\s]/.test(this.buffer[pos])) {
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
      
      pos++;
    }
  }

  addRecord(record) {
    this.currentChunk.push(record);
    
    if (this.currentChunk.length >= this.chunkSize) {
      this.writeChunk();
    }
  }

  writeChunk() {
    if (this.currentChunk.length === 0) return;
    
    const filename = `${this.outputPrefix}-${String(this.chunkIndex + 1).padStart(3, '0')}.json`;
    const content = JSON.stringify(this.currentChunk, null, 2);
    
    fs.writeFileSync(filename, content);
    
    log(`✅ Created ${filename} with ${this.currentChunk.length} records`, 'green');
    
    this.chunkIndex++;
    this.currentChunk = [];
  }

  getTotalRecords() {
    return this.totalRecords;
  }

  getChunkCount() {
    return this.chunkIndex;
  }
}

/**
 * Split large JSON file
 */
async function splitJSONFile(inputFile, chunkSize, outputPrefix) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(inputFile);
    const splitter = new JSONSplitter(chunkSize, outputPrefix);
    
    splitter.on('finish', () => {
      resolve({
        totalRecords: splitter.getTotalRecords(),
        chunkCount: splitter.getChunkCount()
      });
    });
    
    splitter.on('error', reject);
    
    fileStream.pipe(splitter);
  });
}

/**
 * Main function
 */
async function main() {
  console.log('================================');
  console.log('JSON File Splitter for GAA Data');
  console.log('================================\\n');
  
  // Parse arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    log('❌ Error: Missing required argument', 'red');
    console.log('\\nUsage: node split-large-json.js <input-file> [chunk-size] [output-prefix]');
    console.log('\\nExample:');
    console.log('  node split-large-json.js GAA-2025.json 1000 gaa-chunk');
    console.log('  node split-large-json.js samples/large-file.json 500 small-batch\\n');
    console.log('Default values:');
    console.log('  chunk-size: 1000 records per file');
    console.log('  output-prefix: split-chunk\\n');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const chunkSize = parseInt(args[1]) || 1000;
  const outputPrefix = args[2] || 'split-chunk';
  
  // Validate input file
  if (!fs.existsSync(inputFile)) {
    log(`❌ Error: File not found: ${inputFile}`, 'red');
    process.exit(1);
  }
  
  // Validate chunk size
  if (chunkSize < 1 || chunkSize > 10000) {
    log('❌ Error: Chunk size must be between 1 and 10,000', 'red');
    process.exit(1);
  }
  
  const fileSize = getFileSize(inputFile);
  
  log(`📄 Input file: ${inputFile}`, 'yellow');
  log(`📊 File size: ${fileSize}`, 'yellow');
  log(`📦 Chunk size: ${chunkSize} records per file`, 'yellow');
  log(`🏷️  Output prefix: ${outputPrefix}`, 'yellow');
  console.log('');
  
  // Confirm before proceeding
  console.log('This will create multiple smaller JSON files in the current directory.');
  
  // Check if we're in interactive mode
  if (process.stdin.isTTY) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('Continue? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y') {
      log('Cancelled.', 'yellow');
      process.exit(0);
    }
  }
  
  console.log('');
  log('🚀 Starting file split...', 'blue');
  
  try {
    const result = await splitJSONFile(inputFile, chunkSize, outputPrefix);
    
    console.log('');
    console.log('='.repeat(50));
    log('✅ SPLIT COMPLETE', 'green');
    console.log('='.repeat(50));
    log(`📊 Total records processed: ${result.totalRecords}`, 'green');
    log(`📦 Files created: ${result.chunkCount}`, 'green');
    log(`📁 File pattern: ${outputPrefix}-001.json to ${outputPrefix}-${String(result.chunkCount).padStart(3, '0')}.json`, 'green');
    
    console.log('\\nNext steps:');
    console.log('1. Upload individual chunks:');
    console.log(`   node upload-gaa.js ${outputPrefix}-001.json alice`);
    console.log('\\n2. Process all chunks with a loop:');
    console.log(`   for file in ${outputPrefix}-*.json; do`);
    console.log('     node upload-gaa.js "$file" alice');
    console.log('   done');
    console.log('');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { splitJSONFile };