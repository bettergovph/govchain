#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { pick } = require('stream-json/filters/Pick');
const { streamArray } = require('stream-json/streamers/StreamArray');

const TYPE_URL = '/govchain.procurement.v1.MsgSubmitRelease';
const DEFAULT_NODE = 'tcp://127.0.0.1:26657';
const DEFAULT_CHAIN_ID = 'govchain';
const DEFAULT_KEYRING = 'test';
const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_GAS_PER_RELEASE = 200000;
const DEFAULT_GAS_BASE = 50000;
const DEFAULT_POLL_MS = 1000;
const DEFAULT_COMMIT_TIMEOUT_MS = 60000;
const STAGE_ORDER = new Map([
  ['planning', 0],
  ['tender', 1],
  ['award', 2],
  ['contract', 3],
  ['implementation', 4],
]);

const LOG_DIR = path.join(__dirname, 'logs');
const DEFAULT_STATE_FILE = path.join(LOG_DIR, 'ocds-procurement-lifecycle-progress.jsonl');
const DEFAULT_TEMP_DIR = path.join(__dirname, 'temp', 'ocds-procurement');

class StopStream extends Error {
  constructor() {
    super('stream stopped');
    this.name = 'StopStream';
  }
}

function usage() {
  console.log(`
Usage:
  node importer/import-ocds-procurement.js <by_year-dir-or-json-file> [options]

Examples:
  node importer/import-ocds-procurement.js /root/spaceship/govchain-data/by_year --year 2000 --skip 3 --limit 25
  node importer/import-ocds-procurement.js /root/spaceship/govchain-data/by_year --years 2024-2025 --batch-size 100
  node importer/import-ocds-procurement.js /root/spaceship/govchain-data/by_year/2024.json --dry-run --limit 1000

Options:
  --from <name>                 Keyring account to sign with (default: alice)
  --creator <address>           Creator address; defaults to the --from key address
  --home <path>                 govchaind home (default: /root/spaceship/govchain/home if it exists)
  --node <url>                  CometBFT RPC node (default: tcp://127.0.0.1:26657)
  --chain-id <id>               Chain ID (default: govchain)
  --keyring-backend <backend>   Keyring backend (default: test)
  --years <list>                Years to import, e.g. 2000,2002-2005
  --year <year>                 Single year to import
  --skip <n>                    Skip n releases in the first selected file
  --limit <n>                   Stop after n releases across all selected files
  --batch-size <n>              Releases per transaction (default: 25)
  --gas-per-release <n>         Gas limit budget per release (default: 200000)
  --gas-base <n>                Gas limit base added per transaction (default: 50000)
  --gas-limit <n>               Fixed gas limit for every transaction
  --state-file <path>           Progress JSONL file (default: importer/logs/...)
  --temp-dir <path>             Temporary tx file directory
  --strict-lifecycle            Split compiled source entries into stage releases (default)
  --raw-releases                Submit each source release as-is after normalization
  --dry-run                     Normalize and count releases without signing or broadcasting
  --no-resume                   Ignore the progress log
  --keep-tx-files               Keep unsigned/signed tx JSON files
  --commit-timeout-ms <n>       Commit wait timeout per tx (default: 60000)
  --poll-ms <n>                 Commit poll interval (default: 1000)
`);
}

function parseArgs(argv) {
  const options = {
    from: 'alice',
    creator: '',
    home: fs.existsSync('/root/spaceship/govchain/home') ? '/root/spaceship/govchain/home' : '',
    node: process.env.BLOCKCHAIN_NODE || DEFAULT_NODE,
    chainId: process.env.CHAIN_ID || DEFAULT_CHAIN_ID,
    keyringBackend: process.env.KEYRING_BACKEND || DEFAULT_KEYRING,
    years: new Set(),
    skip: 0,
    limit: Number.POSITIVE_INFINITY,
    batchSize: DEFAULT_BATCH_SIZE,
    gasPerRelease: DEFAULT_GAS_PER_RELEASE,
    gasBase: DEFAULT_GAS_BASE,
    gasLimit: 0,
    stateFile: DEFAULT_STATE_FILE,
    tempDir: DEFAULT_TEMP_DIR,
    strictLifecycle: true,
    dryRun: false,
    resume: true,
    keepTxFiles: false,
    commitTimeoutMs: DEFAULT_COMMIT_TIMEOUT_MS,
    pollMs: DEFAULT_POLL_MS,
  };

  const inputs = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const readValue = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`);
      }
      i += 1;
      return value;
    };

    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--strict-lifecycle') {
      options.strictLifecycle = true;
    } else if (arg === '--raw-releases') {
      options.strictLifecycle = false;
    } else if (arg === '--no-resume') {
      options.resume = false;
    } else if (arg === '--keep-tx-files') {
      options.keepTxFiles = true;
    } else if (arg === '--from') {
      options.from = readValue();
    } else if (arg === '--creator') {
      options.creator = readValue();
    } else if (arg === '--home') {
      options.home = readValue();
    } else if (arg === '--node') {
      options.node = readValue();
    } else if (arg === '--chain-id') {
      options.chainId = readValue();
    } else if (arg === '--keyring-backend') {
      options.keyringBackend = readValue();
    } else if (arg === '--year') {
      options.years = parseYears(readValue());
    } else if (arg === '--years') {
      options.years = parseYears(readValue());
    } else if (arg === '--skip' || arg === '--start-index') {
      options.skip = parseNonNegativeInt(readValue(), arg);
    } else if (arg === '--limit') {
      options.limit = parsePositiveInt(readValue(), arg);
    } else if (arg === '--batch-size') {
      options.batchSize = parsePositiveInt(readValue(), arg);
    } else if (arg === '--gas-per-release') {
      options.gasPerRelease = parsePositiveInt(readValue(), arg);
    } else if (arg === '--gas-base') {
      options.gasBase = parseNonNegativeInt(readValue(), arg);
    } else if (arg === '--gas-limit') {
      options.gasLimit = parsePositiveInt(readValue(), arg);
    } else if (arg === '--state-file') {
      options.stateFile = readValue();
    } else if (arg === '--temp-dir') {
      options.tempDir = readValue();
    } else if (arg === '--commit-timeout-ms') {
      options.commitTimeoutMs = parsePositiveInt(readValue(), arg);
    } else if (arg === '--poll-ms') {
      options.pollMs = parsePositiveInt(readValue(), arg);
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      inputs.push(arg);
    }
  }

  if (inputs.length === 0) {
    usage();
    throw new Error('Missing input path');
  }

  return { inputs, options };
}

function parsePositiveInt(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function parseNonNegativeInt(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return parsed;
}

function parseYears(value) {
  const years = new Set();

  for (const part of value.split(',')) {
    const token = part.trim();
    if (!token) continue;

    const range = token.match(/^(\d{4})-(\d{4})$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (end < start) throw new Error(`Invalid year range: ${token}`);
      for (let year = start; year <= end; year += 1) {
        years.add(String(year));
      }
      continue;
    }

    if (!/^\d{4}$/.test(token)) {
      throw new Error(`Invalid year: ${token}`);
    }
    years.add(token);
  }

  return years;
}

function collectFiles(inputs, options) {
  const files = [];

  for (const input of inputs) {
    const resolved = path.resolve(input);
    const stat = fs.statSync(resolved);

    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(resolved).sort()) {
        const match = entry.match(/^(\d{4})\.json$/);
        if (!match) continue;
        if (options.years.size > 0 && !options.years.has(match[1])) continue;
        files.push(path.join(resolved, entry));
      }
    } else {
      const match = path.basename(resolved).match(/^(\d{4})\.json$/);
      if (options.years.size > 0 && (!match || !options.years.has(match[1]))) continue;
      files.push(resolved);
    }
  }

  if (files.length === 0) {
    throw new Error('No year JSON files matched the input/options');
  }

  return files;
}

function ensureDirs(options) {
  fs.mkdirSync(path.dirname(options.stateFile), { recursive: true });
  fs.mkdirSync(options.tempDir, { recursive: true });
}

function runGovchaind(args, options = {}) {
  const result = spawnSync('govchaind', args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const command = `govchaind ${args.join(' ')}`;
    throw new Error(`${command} failed with exit ${result.status}\n${result.stderr || result.stdout}`);
  }

  return result.stdout;
}

function govchainBaseArgs(options) {
  const args = [];
  if (options.home) args.push('--home', options.home);
  return args;
}

function getCreatorAddress(options) {
  if (options.creator) return options.creator;

  const args = [
    'keys',
    'show',
    options.from,
    '--keyring-backend',
    options.keyringBackend,
    '--address',
    ...govchainBaseArgs(options),
  ];

  return runGovchaind(args).trim();
}

function waitForCommit(txhash, options) {
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < options.commitTimeoutMs) {
    const result = spawnSync(
      'govchaind',
      ['query', 'tx', txhash, '--node', options.node, '--output', 'json', ...govchainBaseArgs(options)],
      { encoding: 'utf8', maxBuffer: 1024 * 1024 * 20 }
    );

    if (result.status === 0) {
      const tx = JSON.parse(result.stdout);
      const code = Number(tx.code || 0);
      if (code !== 0) {
        throw new Error(`Committed tx ${txhash} failed with code ${code}: ${tx.raw_log || ''}`);
      }
      return tx;
    }

    lastError = result.stderr || result.stdout || `query tx exit ${result.status}`;
    sleep(options.pollMs);
  }

  throw new Error(`Timed out waiting for tx ${txhash} to commit. Last error: ${lastError}`);
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function readResumePosition(filePath, options) {
  if (!options.resume || !fs.existsSync(options.stateFile)) return { index: 0, stage: '' };

  const absoluteFile = path.resolve(filePath);
  let resume = { index: -1, stage: '' };

  const lines = fs.readFileSync(options.stateFile, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (entry.status === 'committed' && entry.file === absoluteFile) {
        const lastIndex = Number.isInteger(entry.lastIndex)
          ? entry.lastIndex
          : Number.isInteger(entry.nextIndex)
            ? entry.nextIndex - 1
            : undefined;

        if (!Number.isInteger(lastIndex) || lastIndex < 0) continue;

        const stage = typeof entry.lastLifecycleStage === 'string' ? entry.lastLifecycleStage : '';
        const stageRank = STAGE_ORDER.get(stage) ?? Number.MAX_SAFE_INTEGER;
        const resumeRank = STAGE_ORDER.get(resume.stage) ?? Number.MAX_SAFE_INTEGER;
        const isNewer = lastIndex > resume.index || (lastIndex === resume.index && stageRank > resumeRank);

        if (isNewer) {
          if (stage === 'contract' || stage === 'implementation' || stage === '') {
            resume = { index: lastIndex + 1, stage: '' };
          } else {
            resume = { index: lastIndex, stage };
          }
        }
      }
    } catch {
      // Ignore partial/corrupt progress lines.
    }
  }

  return resume.index < 0 ? { index: 0, stage: '' } : resume;
}

function appendProgress(entry, options) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...entry,
  });
  fs.appendFileSync(options.stateFile, `${line}\n`);
}

function createTx(messages, gasLimit) {
  return {
    body: {
      messages,
      memo: '',
      timeout_height: '0',
      extension_options: [],
      non_critical_extension_options: [],
    },
    auth_info: {
      signer_infos: [],
      fee: {
        amount: [],
        gas_limit: String(gasLimit),
        payer: '',
        granter: '',
      },
    },
    signatures: [],
  };
}

function writeBatchTx(batch, context) {
  const { options, creator, batchNumber } = context;
  const messages = batch.map(({ release }) => ({
    '@type': TYPE_URL,
    creator,
    release,
  }));

  const gasLimit = options.gasLimit || (options.gasBase + messages.length * options.gasPerRelease);
  const tx = createTx(messages, gasLimit);
  const unsignedPath = path.join(options.tempDir, `ocds-batch-${process.pid}-${batchNumber}.unsigned.json`);
  const signedPath = path.join(options.tempDir, `ocds-batch-${process.pid}-${batchNumber}.signed.json`);

  fs.writeFileSync(unsignedPath, JSON.stringify(tx));
  return { unsignedPath, signedPath, gasLimit };
}

function broadcastBatch(batch, context) {
  const { options, batchNumber } = context;
  const first = batch[0];
  const last = batch[batch.length - 1];
  const { unsignedPath, signedPath, gasLimit } = writeBatchTx(batch, context);

  runGovchaind([
    'tx',
    'sign',
    unsignedPath,
    '--from',
    options.from,
    '--keyring-backend',
    options.keyringBackend,
    '--chain-id',
    options.chainId,
    '--node',
    options.node,
    '--output-document',
    signedPath,
    ...govchainBaseArgs(options),
  ]);

  const broadcast = runGovchaind([
    'tx',
    'broadcast',
    signedPath,
    '--node',
    options.node,
    '--output',
    'json',
    ...govchainBaseArgs(options),
  ]);

  const parsed = JSON.parse(broadcast);
  const code = Number(parsed.code || 0);
  if (code !== 0) {
    throw new Error(`CheckTx failed for batch ${batchNumber}: code ${code} ${parsed.raw_log || ''}`);
  }

  const txhash = parsed.txhash;
  const committed = waitForCommit(txhash, options);

  if (!options.keepTxFiles) {
    fs.rmSync(unsignedPath, { force: true });
    fs.rmSync(signedPath, { force: true });
  }

  appendProgress({
    status: 'committed',
    file: path.resolve(first.file),
    batchNumber,
    count: batch.length,
    firstIndex: first.index,
    lastIndex: last.index,
    nextIndex: last.index + 1,
    firstSourceReleaseId: first.sourceReleaseId,
    lastSourceReleaseId: last.sourceReleaseId,
    firstLifecycleStage: first.lifecycleStage,
    lastLifecycleStage: last.lifecycleStage,
    firstRelease: `${first.release.ocid}/${first.release.id}`,
    lastRelease: `${last.release.ocid}/${last.release.id}`,
    txhash,
    height: committed.height,
    gasLimit,
  }, options);

  return { txhash, height: committed.height, gasLimit };
}

async function streamReleases(filePath, onRelease) {
  return new Promise((resolve, reject) => {
    let failed = false;
    let settled = false;
    const pipeline = chain([
      fs.createReadStream(filePath),
      parser(),
      pick({ filter: 'releases' }),
      streamArray(),
    ]);

    pipeline.on('data', async ({ key, value }) => {
      pipeline.pause();
      try {
        const shouldContinue = await onRelease(value, key);
        if (shouldContinue === false) {
          pipeline.destroy(new StopStream());
          return;
        }
      } catch (error) {
        failed = true;
        pipeline.destroy(error);
        if (!settled) {
          settled = true;
          reject(error);
        }
        return;
      }
      pipeline.resume();
    });

    pipeline.on('end', () => {
      if (!failed && !settled) {
        settled = true;
        resolve();
      }
    });
    pipeline.on('error', (error) => {
      if (error instanceof StopStream) {
        if (!settled) {
          settled = true;
          resolve();
        }
        return;
      }

      if (!failed && !settled) {
        settled = true;
        reject(error);
      }
    });
  });
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clean(value) {
  if (Array.isArray(value)) {
    const values = value
      .map(clean)
      .filter((item) => item !== undefined && !isEmptyObject(item) && !isEmptyArray(item));
    return values.length > 0 ? values : undefined;
  }

  if (isObject(value)) {
    const out = {};
    for (const [key, raw] of Object.entries(value)) {
      const cleaned = clean(raw);
      if (cleaned !== undefined && !isEmptyObject(cleaned) && !isEmptyArray(cleaned)) {
        out[key] = cleaned;
      }
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }

  if (value === null || value === undefined) return undefined;
  return value;
}

function isEmptyObject(value) {
  return isObject(value) && Object.keys(value).length === 0;
}

function isEmptyArray(value) {
  return Array.isArray(value) && value.length === 0;
}

function stringValue(value) {
  if (value === null || value === undefined) return undefined;
  const text = String(value);
  return text.length > 0 ? text : undefined;
}

function timestampValue(value) {
  const text = stringValue(value);
  if (!text || text === '-' || text === '—') return undefined;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function boolValue(value) {
  return typeof value === 'boolean' ? value : undefined;
}

function intValue(value) {
  if (value === null || value === undefined || value === '') return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Math.trunc(number);
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function value(valueObject) {
  if (!isObject(valueObject)) return undefined;
  return clean({
    amount: stringValue(valueObject.amount),
    currency: stringValue(valueObject.currency),
  });
}

function period(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    startDate: timestampValue(raw.startDate),
    endDate: timestampValue(raw.endDate),
    maxExtentDate: timestampValue(raw.maxExtentDate),
    durationInDays: intValue(raw.durationInDays),
  });
}

function identifier(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    scheme: stringValue(raw.scheme),
    id: stringValue(raw.id),
    legalName: stringValue(raw.legalName),
    uri: stringValue(raw.uri),
  });
}

function address(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    streetAddress: stringValue(raw.streetAddress),
    locality: stringValue(raw.locality),
    region: stringValue(raw.region),
    postalCode: stringValue(raw.postalCode),
    countryName: stringValue(raw.countryName),
  });
}

function contactPoint(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    name: stringValue(raw.name),
    email: stringValue(raw.email),
    telephone: stringValue(raw.telephone),
    faxNumber: stringValue(raw.faxNumber),
    url: stringValue(raw.url),
  });
}

function classification(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    scheme: stringValue(raw.scheme),
    id: stringValue(raw.id),
    description: stringValue(raw.description),
    uri: stringValue(raw.uri),
  });
}

function unit(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    scheme: stringValue(raw.scheme),
    id: stringValue(raw.id),
    name: stringValue(raw.name),
    value: value(raw.value),
    uri: stringValue(raw.uri),
  });
}

function item(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    description: stringValue(raw.description),
    classification: classification(raw.classification),
    additionalClassifications: arrayValue(raw.additionalClassifications).map(classification),
    quantity: stringValue(raw.quantity),
    unit: unit(raw.unit),
  });
}

function document(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    documentType: stringValue(raw.documentType),
    title: stringValue(raw.title),
    description: stringValue(raw.description),
    url: stringValue(raw.url),
    datePublished: timestampValue(raw.datePublished),
    dateModified: timestampValue(raw.dateModified),
    format: stringValue(raw.format),
    language: stringValue(raw.language),
    contentHash: stringValue(raw.contentHash),
    contentHashMethod: stringValue(raw.contentHashMethod),
    ipfsCid: stringValue(raw.ipfsCid),
  });
}

function milestone(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    title: stringValue(raw.title),
    type: stringValue(raw.type),
    description: stringValue(raw.description),
    code: stringValue(raw.code),
    dueDate: timestampValue(raw.dueDate),
    dateMet: timestampValue(raw.dateMet),
    dateModified: timestampValue(raw.dateModified),
    status: stringValue(raw.status),
  });
}

function organizationReference(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    name: stringValue(raw.name),
  });
}

function organization(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    name: stringValue(raw.name),
    identifier: identifier(raw.identifier),
    additionalIdentifiers: arrayValue(raw.additionalIdentifiers).map(identifier),
    address: address(raw.address),
    contactPoint: contactPoint(raw.contactPoint),
    roles: arrayValue(raw.roles).map(stringValue).filter(Boolean),
    onChainAddress: stringValue(raw.onChainAddress),
    isVerified: boolValue(raw.isVerified),
  });
}

function amendment(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    date: timestampValue(raw.date),
    rationale: stringValue(raw.rationale),
    description: stringValue(raw.description),
    amendsReleaseId: stringValue(raw.amendsReleaseId),
    releaseId: stringValue(raw.releaseId),
  });
}

function relatedProcess(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    relationship: arrayValue(raw.relationship).map(stringValue).filter(Boolean),
    title: stringValue(raw.title),
    scheme: stringValue(raw.scheme),
    identifier: stringValue(raw.identifier),
    uri: stringValue(raw.uri),
  });
}

function budget(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    description: stringValue(raw.description),
    amount: value(raw.amount),
    project: stringValue(raw.project),
    projectId: stringValue(raw.projectId),
    uri: stringValue(raw.uri),
  });
}

function planning(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    rationale: stringValue(raw.rationale),
    budget: budget(raw.budget),
    documents: arrayValue(raw.documents).map(document),
    milestones: arrayValue(raw.milestones).map(milestone),
  });
}

function tender(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    title: stringValue(raw.title),
    description: stringValue(raw.description),
    status: stringValue(raw.status),
    procuringEntity: organizationReference(raw.procuringEntity),
    items: arrayValue(raw.items).map(item),
    value: value(raw.value),
    minValue: value(raw.minValue),
    procurementMethod: stringValue(raw.procurementMethod),
    procurementMethodDetails: stringValue(raw.procurementMethodDetails),
    procurementMethodRationale: stringValue(raw.procurementMethodRationale),
    mainProcurementCategory: stringValue(raw.mainProcurementCategory),
    additionalProcurementCategories: arrayValue(raw.additionalProcurementCategories).map(stringValue).filter(Boolean),
    awardCriteria: stringValue(raw.awardCriteria),
    awardCriteriaDetails: stringValue(raw.awardCriteriaDetails),
    submissionMethod: arrayValue(raw.submissionMethod).map(stringValue).filter(Boolean),
    submissionMethodDetails: stringValue(raw.submissionMethodDetails),
    tenderPeriod: period(raw.tenderPeriod),
    enquiryPeriod: period(raw.enquiryPeriod),
    hasEnquiries: boolValue(raw.hasEnquiries),
    eligibilityCriteria: stringValue(raw.eligibilityCriteria),
    awardPeriod: period(raw.awardPeriod),
    contractPeriod: period(raw.contractPeriod),
    numberOfTenderers: intValue(raw.numberOfTenderers),
    tenderers: arrayValue(raw.tenderers).map(organizationReference),
    documents: arrayValue(raw.documents).map(document),
    milestones: arrayValue(raw.milestones).map(milestone),
    amendments: arrayValue(raw.amendments).map(amendment),
  });
}

function award(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    title: stringValue(raw.title),
    description: stringValue(raw.description),
    status: stringValue(raw.status),
    date: timestampValue(raw.date),
    value: value(raw.value),
    suppliers: arrayValue(raw.suppliers).map(organizationReference),
    items: arrayValue(raw.items).map(item),
    contractPeriod: period(raw.contractPeriod),
    documents: arrayValue(raw.documents).map(document),
    amendments: arrayValue(raw.amendments).map(amendment),
  });
}

function spendingTransaction(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    source: stringValue(raw.source),
    date: timestampValue(raw.date),
    value: value(raw.value),
    payer: organizationReference(raw.payer),
    payee: organizationReference(raw.payee),
    uri: stringValue(raw.uri),
    txHash: stringValue(raw.txHash),
  });
}

function implementation(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    transactions: arrayValue(raw.transactions).map(spendingTransaction),
    milestones: arrayValue(raw.milestones).map(milestone),
    documents: arrayValue(raw.documents).map(document),
  });
}

function contract(raw) {
  if (!isObject(raw)) return undefined;
  return clean({
    id: stringValue(raw.id),
    awardId: stringValue(raw.awardID ?? raw.awardId),
    title: stringValue(raw.title),
    description: stringValue(raw.description),
    status: stringValue(raw.status),
    period: period(raw.period),
    value: value(raw.value),
    items: arrayValue(raw.items).map(item),
    dateSigned: timestampValue(raw.dateSigned),
    documents: arrayValue(raw.documents).map(document),
    implementation: implementation(raw.implementation),
    relatedProcesses: arrayValue(raw.relatedProcesses).map(relatedProcess),
    milestones: arrayValue(raw.milestones).map(milestone),
    amendments: arrayValue(raw.amendments).map(amendment),
  });
}

function normalizeRelease(raw) {
  const release = clean({
    ocid: stringValue(raw.ocid),
    id: stringValue(raw.id),
    date: timestampValue(raw.date),
    tag: arrayValue(raw.tag).map(stringValue).filter(Boolean),
    initiationType: stringValue(raw.initiationType),
    language: stringValue(raw.language),
    parties: arrayValue(raw.parties).map(organization),
    buyer: organizationReference(raw.buyer),
    planning: planning(raw.planning),
    tender: tender(raw.tender),
    awards: arrayValue(raw.awards).map(award),
    contracts: arrayValue(raw.contracts).map(contract),
    relatedProcesses: arrayValue(raw.relatedProcesses).map(relatedProcess),
  });

  if (!release || !release.ocid || !release.id) {
    throw new Error(`Release is missing ocid/id: ${JSON.stringify({ ocid: raw.ocid, id: raw.id })}`);
  }

  return release;
}

function buildLifecycleReleases(raw) {
  const ocid = stringValue(raw.ocid);
  const sourceId = stringValue(raw.id);
  if (!ocid || !sourceId) {
    throw new Error(`Source release is missing ocid/id: ${JSON.stringify({ ocid: raw.ocid, id: raw.id })}`);
  }

  const base = {
    ocid,
    initiationType: stringValue(raw.initiationType) || 'tender',
    language: stringValue(raw.language),
    parties: arrayValue(raw.parties).map(organization),
    buyer: organizationReference(raw.buyer),
    relatedProcesses: arrayValue(raw.relatedProcesses).map(relatedProcess),
  };
  const sourceDate = timestampValue(raw.date);
  const releases = [];

  const planningValue = planning(raw.planning);
  if (planningValue) {
    releases.push(stageRelease(base, sourceId, 'planning', sourceDate, {
      planning: planningValue,
    }));
  }

  const tenderValue = tender(raw.tender);
  if (tenderValue) {
    releases.push(stageRelease(base, sourceId, 'tender', firstTimestamp(
      tenderValue.tenderPeriod?.startDate,
      tenderValue.tenderPeriod?.endDate,
      sourceDate,
    ), {
      tender: tenderValue,
    }));
  }

  const awardValues = arrayValue(raw.awards).map(award).filter(Boolean);
  if (awardValues.length > 0) {
    releases.push(stageRelease(base, sourceId, 'award', firstTimestamp(
      ...awardValues.map((entry) => entry.date),
      sourceDate,
    ), {
      awards: awardValues,
    }));
  }

  const contractValues = arrayValue(raw.contracts).map(contract).filter(Boolean);
  const contractStageValues = contractValues
    .map(withoutImplementation)
    .filter((entry) => entry && hasMeaningfulContractData(entry));
  if (contractStageValues.length > 0) {
    releases.push(stageRelease(base, sourceId, 'contract', firstTimestamp(
      ...contractStageValues.map((entry) => entry.dateSigned),
      sourceDate,
    ), {
      contracts: contractStageValues,
    }));
  }

  const implementationStageValues = contractValues
    .map(implementationContract)
    .filter(Boolean);
  if (implementationStageValues.length > 0) {
    releases.push(stageRelease(base, sourceId, 'implementation', firstTimestamp(
      ...implementationStageValues.flatMap(implementationDates),
      sourceDate,
    ), {
      contracts: implementationStageValues,
    }));
  }

  if (releases.length === 0) {
    return [normalizeRelease(raw)];
  }

  return releases;
}

function stageRelease(base, sourceId, stage, date, fields) {
  return clean({
    ...base,
    id: lifecycleReleaseId(sourceId, stage),
    date,
    tag: [stage],
    ...fields,
  });
}

function lifecycleReleaseId(sourceId, stage) {
  return `${cleanReleaseId(sourceId)}-${stage}`;
}

function cleanReleaseId(value) {
  return String(value)
    .trim()
    .replace(/[#/?\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'release';
}

function firstTimestamp(...values) {
  const timestamps = values.filter(Boolean).sort();
  return timestamps[0];
}

function withoutImplementation(entry) {
  if (!entry) return undefined;
  const copy = JSON.parse(JSON.stringify(entry));
  delete copy.implementation;
  return clean(copy);
}

function hasMeaningfulContractData(entry) {
  if (!entry) return false;
  const keys = Object.keys(entry).filter((key) => key !== 'id' && key !== 'awardId');
  return Boolean(entry.id || keys.length > 0);
}

function implementationContract(entry) {
  if (!entry?.implementation) return undefined;
  return clean({
    id: entry.id,
    awardId: entry.awardId,
    title: entry.title,
    status: entry.status,
    implementation: entry.implementation,
  });
}

function implementationDates(entry) {
  if (!entry?.implementation) return [];
  const transactions = arrayValue(entry.implementation.transactions).map((transaction) => transaction?.date);
  const milestones = arrayValue(entry.implementation.milestones).flatMap((milestoneValue) => [
    milestoneValue?.dateMet,
    milestoneValue?.dateModified,
    milestoneValue?.dueDate,
  ]);
  const documents = arrayValue(entry.implementation.documents).flatMap((documentValue) => [
    documentValue?.datePublished,
    documentValue?.dateModified,
  ]);
  return [...transactions, ...milestones, ...documents].filter(Boolean);
}

async function importFile(file, context) {
  const { options } = context;
  const absoluteFile = path.resolve(file);
  const resumePosition = readResumePosition(absoluteFile, options);
  const manualSkip = context.fileOrdinal === 0 ? options.skip : 0;
  const resume = manualSkip > resumePosition.index
    ? { index: manualSkip, stage: '' }
    : resumePosition;
  let batch = [];
  let seen = 0;
  let imported = 0;
  let skipped = 0;

  console.log(`Processing ${absoluteFile}`);
  if (resume.index > 0 || resume.stage) {
    console.log(`Resuming at source index ${resume.index}${resume.stage ? ` after ${resume.stage}` : ''}`);
  }

  await streamReleases(absoluteFile, async (raw, index) => {
    if (context.remaining <= 0) return false;

    seen = index + 1;
    if (index < resume.index) {
      skipped += 1;
      return;
    }

    const releases = options.strictLifecycle ? buildLifecycleReleases(raw) : [normalizeRelease(raw)];
    for (const release of releases) {
      if (context.remaining <= 0) return false;

      const lifecycleStage = arrayValue(release.tag)[0] || '';
      if (index === resume.index && resume.stage && stageRank(lifecycleStage) <= stageRank(resume.stage)) {
        skipped += 1;
        continue;
      }

      batch.push({
        file: absoluteFile,
        index,
        sourceReleaseId: stringValue(raw.id),
        lifecycleStage,
        release,
      });

      if (batch.length >= options.batchSize) {
        const count = await flushBatch(batch, context);
        imported += count;
        batch = [];
        if (context.remaining <= 0) return false;
      }
    }

    return true;
  });

  if (batch.length > 0 && context.remaining > 0) {
    const count = await flushBatch(batch, context);
    imported += count;
  }

  console.log(`Finished ${path.basename(file)}: seen=${seen}, skipped=${skipped}, imported=${imported}`);
  return imported;
}

function stageRank(stage) {
  return STAGE_ORDER.get(stage) ?? Number.MAX_SAFE_INTEGER;
}

async function flushBatch(batch, context) {
  if (context.remaining <= 0) return 0;

  if (batch.length > context.remaining) {
    batch.splice(context.remaining);
  }

  context.batchNumber += 1;
  const first = batch[0];
  const last = batch[batch.length - 1];

  if (context.options.dryRun) {
    const bytes = batch.reduce((sum, item) => sum + Buffer.byteLength(JSON.stringify(item.release)), 0);
    console.log(
      `Dry run batch ${context.batchNumber}: count=${batch.length}, first=${first.release.ocid}/${first.release.id}, last=${last.release.ocid}/${last.release.id}, bytes=${bytes}`
    );
  } else {
    const result = broadcastBatch(batch, context);
    console.log(
      `Committed batch ${context.batchNumber}: count=${batch.length}, height=${result.height}, tx=${result.txhash}, first=${first.release.ocid}/${first.release.id}, last=${last.release.ocid}/${last.release.id}`
    );
  }

  context.remaining -= batch.length;
  context.totalImported += batch.length;
  return batch.length;
}

async function main() {
  const { inputs, options } = parseArgs(process.argv.slice(2));
  ensureDirs(options);

  const files = collectFiles(inputs, options);
  const creator = getCreatorAddress(options);
  const context = {
    options,
    creator,
    remaining: options.limit,
    totalImported: 0,
    batchNumber: 0,
    fileOrdinal: 0,
  };

  console.log('OpenGovChain OCDS procurement importer');
  console.log(`Creator: ${creator}`);
  console.log(`Files: ${files.length}`);
  console.log(`Batch size: ${options.batchSize}`);
  console.log(`Lifecycle mode: ${options.strictLifecycle ? 'strict stage releases' : 'raw source releases'}`);
  console.log(`Mode: ${options.dryRun ? 'dry-run' : 'broadcast'}`);
  console.log(`State file: ${options.stateFile}`);

  for (let i = 0; i < files.length && context.remaining > 0; i += 1) {
    context.fileOrdinal = i;
    await importFile(files[i], context);
  }

  console.log(`Done. Imported/validated ${context.totalImported} releases.`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
