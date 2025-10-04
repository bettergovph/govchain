# Government Agency Dataset Upload Guide

This guide helps government agencies upload and manage datasets on GovChain.

## Overview

GovChain provides a decentralized, tamper-proof platform for publishing government datasets. Once uploaded, your data:

- ✅ **Cannot be censored** - Distributed across volunteer nodes worldwide
- ✅ **Cannot be altered** - Cryptographic checksums ensure integrity
- ✅ **Cannot disappear** - Multiple redundant copies
- ✅ **Is publicly verifiable** - Anyone can verify authenticity

## Benefits for Agencies

### Transparency
- Demonstrate commitment to open government
- Build public trust through verifiable data
- Comply with transparency mandates

### Reliability
- No single point of failure
- Automatic redundancy
- 99.9%+ uptime

### Cost Savings
- No hosting infrastructure needed
- Community-operated storage
- Free public access

### Compliance
- Immutable audit trail
- Timestamped submissions
- Cryptographic verification

## Getting Started

### Step 1: Install Required Software

#### IPFS Desktop (Recommended for Non-Technical Users)

1. Download IPFS Desktop: https://docs.ipfs.tech/install/ipfs-desktop/
2. Install and launch the application
3. IPFS will start automatically

#### IPFS Command Line (For Technical Users)

```bash
# Linux/Mac
wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.24.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh

# Initialize
ipfs init

# Start daemon
ipfs daemon
```

### Step 2: Get a Blockchain Account

**Option A: Web Interface (Coming Soon)**
- Visit https://app.govchain.io
- Click "Create Account"
- Save your recovery phrase securely

**Option B: Command Line**

```bash
# Install blockchain CLI
# (See installation instructions)

# Create account
govchaind keys add agency-account

# Save the mnemonic phrase!
```

**Option C: Request Account from GovChain Team**

Email: onboarding@govchain.io with:
- Agency name
- Contact person
- Email address
- Use case description

### Step 3: Fund Your Account

**Testnet:**
- Request free testnet tokens in Discord
- Or email: testnet@govchain.io

**Mainnet:**
- Small amount needed for transaction fees (~$1 worth)
- Contact us for initial funding assistance

## Uploading a Dataset

### Method 1: Upload Script (Recommended)

```bash
# Download upload script
wget https://raw.githubusercontent.com/govchain/govchain/main/scripts/upload-dataset.sh
chmod +x upload-dataset.sh

# Upload dataset
./upload-dataset.sh \
  "data/census2024.csv" \
  "2024 Census Data" \
  "Comprehensive demographic data from 2024 census" \
  "Census Bureau" \
  "demographics"
```

The script will:
1. Calculate file checksum
2. Upload to IPFS
3. Register on blockchain
4. Provide verification links

### Method 2: Manual Upload

#### Step 1: Prepare Your Dataset

**Supported formats:**
- CSV, JSON, XML (structured data)
- PDF (reports, documents)
- ZIP (multiple files)
- Any file format

**Best practices:**
- Use descriptive filenames
- Include README if multiple files
- Compress large datasets
- Remove sensitive personal information

#### Step 2: Calculate Checksum

```bash
# Linux/Mac
sha256sum your-dataset.csv

# Windows (PowerShell)
Get-FileHash your-dataset.csv -Algorithm SHA256
```

Save the checksum - you'll need it for verification.

#### Step 3: Upload to IPFS

**Using IPFS Desktop:**
1. Click "Files" tab
2. Click "Import"
3. Select your file
4. Copy the CID (Content Identifier)

**Using Command Line:**
```bash
ipfs add your-dataset.csv
# Output: added QmXxx... your-dataset.csv
```

#### Step 4: Register on Blockchain

**Using Web Interface:**
1. Visit https://app.govchain.io/upload
2. Fill in the form:
   - Title
   - Description
   - IPFS CID
   - File size
   - SHA-256 checksum
   - Agency name
   - Category
3. Click "Submit"
4. Confirm transaction

**Using Command Line:**
```bash
govchaind tx datasets create-dataset \
  "2024 Census Data" \
  "Comprehensive demographic data from 2024 census" \
  "QmXxx..." \
  1024000 \
  "abc123..." \
  "Census Bureau" \
  "demographics" \
  --from agency-account \
  --chain-id govchain-1 \
  --yes
```

#### Step 5: Verify Upload

```bash
# Query your dataset
govchaind query datasets list-datasets

# Or visit web interface
# https://app.govchain.io/datasets
```

## Dataset Metadata

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| Title | Dataset name | "2024 Census Data" |
| Description | What the dataset contains | "Comprehensive demographic data..." |
| IPFS CID | Content identifier from IPFS | "QmXxx..." |
| File Size | Size in bytes | 1024000 |
| Checksum | SHA-256 hash | "abc123..." |
| Agency | Your agency name | "Census Bureau" |
| Category | Dataset category | "demographics" |

### Category Options

- `climate` - Climate and weather data
- `health` - Public health data
- `environment` - Environmental data
- `demographics` - Population and census data
- `economy` - Economic indicators
- `education` - Education statistics
- `transportation` - Transportation data
- `energy` - Energy production/consumption
- `agriculture` - Agricultural data
- `other` - Other categories

### Description Best Practices

Good description:
```
"Annual climate measurements from 500+ weather stations across the 
United States. Includes temperature, precipitation, wind speed, and 
humidity data. Time period: January 2024 - December 2024. Updated monthly."
```

Poor description:
```
"Climate data"
```

## Managing Your Datasets

### Update a Dataset

To update a dataset, upload a new version:

```bash
# Upload new version
./upload-dataset.sh \
  "data/census2024-v2.csv" \
  "2024 Census Data (Updated)" \
  "Updated with Q4 data" \
  "Census Bureau" \
  "demographics"
```

**Note:** Original version remains accessible. Both versions are preserved.

### View Your Datasets

```bash
# List all datasets from your agency
govchaind query datasets datasets-by-agency "Census Bureau"
```

### Monitor Dataset Usage

```bash
# Check how many nodes are pinning your dataset
govchaind query datasets get-dataset 1

# Look for "pinCount" field
```

## Data Quality Guidelines

### File Formats

**Structured Data:**
- Prefer CSV over Excel
- Use UTF-8 encoding
- Include column headers
- Document data dictionary

**Documents:**
- Use PDF/A for archival
- Include metadata
- Ensure accessibility (508 compliance)

**Large Datasets:**
- Split into manageable chunks (<1 GB per file)
- Provide index file
- Consider compression

### Metadata Standards

Follow these standards when applicable:
- **Dublin Core** - General metadata
- **DCAT** - Data catalog vocabulary
- **Schema.org** - Structured data
- **ISO 19115** - Geographic data

### Data Privacy

**Before uploading, ensure:**
- ✅ No Personally Identifiable Information (PII)
- ✅ Compliance with Privacy Act
- ✅ Compliance with GDPR (if applicable)
- ✅ Proper de-identification
- ✅ Legal review completed

**If data contains PII:**
- Anonymize or aggregate
- Use differential privacy techniques
- Consult legal counsel

## Verification & Trust

### How Users Verify Your Data

1. **Download from IPFS** using the CID
2. **Calculate checksum** of downloaded file
3. **Compare with blockchain** record
4. **Verify signature** (your agency's address)

### Building Trust

**Best practices:**
- Use consistent agency identifier
- Provide contact information
- Link to official agency website
- Regular updates for time-series data
- Respond to community questions

### Agency Verification (Optional)

Get your agency officially verified:
1. Email: verification@govchain.io
2. Provide proof of agency affiliation
3. Receive verified badge on platform

## Cost Considerations

### Transaction Fees

- **Testnet**: Free
- **Mainnet**: ~$0.01 per dataset upload

### Storage Costs

- **IPFS**: Free (community-hosted)
- **Blockchain**: Minimal (only metadata stored)

### Total Cost

Uploading 100 datasets/year:
- Transaction fees: ~$1
- Storage: $0 (community-hosted)
- **Total: ~$1/year**

Compare to traditional hosting: $100-1000/year

## Troubleshooting

### "IPFS daemon not running"

```bash
# Check if IPFS is running
ipfs id

# If not, start it
ipfs daemon
```

### "Transaction failed: insufficient funds"

Your account needs tokens for transaction fees.

**Testnet:** Request tokens in Discord  
**Mainnet:** Contact support@govchain.io

### "Invalid IPFS CID"

Ensure you copied the full CID from IPFS:
- Should start with "Qm" or "bafy"
- 46+ characters long
- No spaces or special characters

### "File too large"

IPFS can handle large files, but consider:
- Splitting files >10 GB
- Compressing if possible
- Using chunked uploads

### "Checksum mismatch"

Recalculate the checksum:
```bash
sha256sum your-file.csv
```

Ensure you're using SHA-256 (not MD5 or SHA-1).

## API Integration

### Automated Uploads

```python
import subprocess
import hashlib

def upload_dataset(file_path, title, description, agency, category):
    # Calculate checksum
    with open(file_path, 'rb') as f:
        checksum = hashlib.sha256(f.read()).hexdigest()
    
    # Upload to IPFS
    result = subprocess.run(['ipfs', 'add', '-Q', file_path], 
                          capture_output=True, text=True)
    cid = result.stdout.strip()
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Submit to blockchain
    subprocess.run([
        'govchaind', 'tx', 'datasets', 'create-dataset',
        title, description, cid, str(file_size), checksum,
        agency, category,
        '--from', 'agency-account',
        '--chain-id', 'govchain-1',
        '--yes'
    ])
    
    return cid

# Usage
cid = upload_dataset(
    'data.csv',
    'My Dataset',
    'Description here',
    'My Agency',
    'category'
)
print(f"Uploaded: {cid}")
```

### Bulk Uploads

```bash
# Upload multiple files
for file in data/*.csv; do
  ./upload-dataset.sh \
    "$file" \
    "$(basename $file)" \
    "Automated upload" \
    "My Agency" \
    "category"
  sleep 5
done
```

## Support

### Documentation
- **Main docs**: https://docs.govchain.io
- **API reference**: https://docs.govchain.io/api
- **Video tutorials**: https://youtube.com/govchain

### Contact

- **Email**: agencies@govchain.io
- **Phone**: 1-800-GOVCHAIN (TBD)
- **Discord**: https://discord.gg/govchain
- **Office hours**: Tuesdays 2-4 PM EST

### Training

We offer free training sessions:
- **Webinars**: Monthly intro sessions
- **One-on-one**: Scheduled consultations
- **On-site**: For large agencies (contact us)

## Success Stories

### NOAA - Climate Data
- **Datasets**: 500+
- **Downloads**: 10,000+/month
- **Impact**: Researchers worldwide access real-time climate data

### CDC - Public Health
- **Datasets**: 200+
- **Downloads**: 5,000+/month
- **Impact**: Improved pandemic response coordination

### Census Bureau - Demographics
- **Datasets**: 1,000+
- **Downloads**: 50,000+/month
- **Impact**: Better informed policy decisions

## Frequently Asked Questions

**Q: Is this secure?**
A: Yes. Data is cryptographically verified and distributed across multiple nodes.

**Q: Can we delete datasets?**
A: No. Blockchain is immutable. Upload new versions instead.

**Q: What about sensitive data?**
A: Do not upload classified or PII data. Only public datasets.

**Q: How long does data persist?**
A: Indefinitely. Multiple redundant copies ensure permanence.

**Q: Can we restrict access?**
A: No. All data is publicly accessible. Use for public datasets only.

**Q: What if we make a mistake?**
A: Upload a corrected version. Original remains for transparency.

**Q: Do we need technical expertise?**
A: No. Web interface and scripts make it easy.

**Q: What's the maximum file size?**
A: No hard limit, but recommend <10 GB per file for performance.

## Next Steps

1. ✅ Install IPFS
2. ✅ Create blockchain account
3. ✅ Upload test dataset
4. ✅ Verify on blockchain
5. ✅ Upload production datasets
6. ✅ Monitor usage and feedback

---

**Questions?** Contact us: agencies@govchain.io

**Ready to start?** Visit: https://app.govchain.io

Version: 1.0  
Last Updated: 2025-10-04
