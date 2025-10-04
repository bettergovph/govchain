# Contributing to GovChain

Thank you for your interest in contributing to GovChain! This document provides guidelines for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors must:

- Be respectful and considerate
- Welcome newcomers and help them learn
- Focus on what's best for the community
- Show empathy towards others

## Ways to Contribute

### 1. Code Contributions
- Fix bugs
- Add features
- Improve performance
- Enhance documentation

### 2. Documentation
- Write tutorials
- Improve API docs
- Translate documentation
- Create video guides

### 3. Testing
- Report bugs
- Test new features
- Write test cases
- Improve test coverage

### 4. Community
- Answer questions in Discord
- Help onboard new users
- Organize events
- Spread awareness

### 5. Infrastructure
- Run validator nodes
- Operate IPFS pinners
- Provide feedback on operations

## Getting Started

### 1. Set Up Development Environment

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/govchain.git
cd govchain

# Add upstream remote
git remote add upstream https://github.com/govchain/govchain.git

# Install dependencies
./scripts/install-prerequisites.sh

# Initialize blockchain
./scripts/init-blockchain.sh
```

### 2. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes

Follow our coding standards (see below).

### 4. Test Your Changes

```bash
# Run tests
cd govchain
go test ./...

# Test indexer
cd ../indexer
go test ./...

# Manual testing
./scripts/quick-start.sh
```

### 5. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add feature: description of changes"
```

### 6. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
# Fill out the PR template
```

## Coding Standards

### Go Code

**Style:**
- Follow [Effective Go](https://golang.org/doc/effective_go.html)
- Use `gofmt` for formatting
- Run `golint` before committing

**Example:**
```go
// Good
func CreateDataset(ctx sdk.Context, title string) error {
    if title == "" {
        return errors.New("title cannot be empty")
    }
    // Implementation
    return nil
}

// Bad
func createDataset(ctx sdk.Context,title string)error{
if title==""{
return errors.New("title cannot be empty")
}
return nil
}
```

**Naming:**
- Use camelCase for variables
- Use PascalCase for exported functions
- Use descriptive names

**Comments:**
- Document all exported functions
- Explain complex logic
- Use godoc format

### JavaScript Code

**Style:**
- Use ES6+ features
- 2-space indentation
- Semicolons required

**Example:**
```javascript
// Good
async function searchDatasets(query) {
  const response = await fetch(`/search?q=${query}`);
  return response.json();
}

// Bad
function searchDatasets(query){
fetch('/search?q='+query).then(r=>r.json())
}
```

### Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(indexer): add filtering by date range

Implement date range filtering in search API to allow
users to find datasets within specific time periods.

Closes #123
```

```
fix(blockchain): validate IPFS CID format

Add proper validation for IPFS CID to prevent
invalid submissions.

Fixes #456
```

## Pull Request Guidelines

### Before Submitting

- ✅ Code follows style guidelines
- ✅ Tests pass
- ✅ Documentation updated
- ✅ Commit messages are clear
- ✅ Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated checks** run (CI/CD)
2. **Maintainer review** (1-2 reviewers)
3. **Feedback addressed**
4. **Approval and merge**

**Timeline:**
- Initial review: 1-3 days
- Follow-up reviews: 1-2 days

## Development Workflow

### Feature Development

```bash
# 1. Create issue on GitHub
# 2. Discuss approach
# 3. Create branch
git checkout -b feature/issue-123

# 4. Develop feature
# 5. Test thoroughly
# 6. Submit PR
# 7. Address feedback
# 8. Merge
```

### Bug Fixes

```bash
# 1. Reproduce bug
# 2. Create issue with reproduction steps
# 3. Create branch
git checkout -b fix/issue-456

# 4. Fix bug
# 5. Add test to prevent regression
# 6. Submit PR
```

### Documentation

```bash
# 1. Identify documentation gap
# 2. Create branch
git checkout -b docs/improve-api-reference

# 3. Write/update documentation
# 4. Submit PR
```

## Testing Guidelines

### Unit Tests

```go
func TestCreateDataset(t *testing.T) {
    // Setup
    ctx := sdk.NewContext(...)
    keeper := NewKeeper(...)
    
    // Execute
    err := keeper.CreateDataset(ctx, "Test Dataset", ...)
    
    // Assert
    assert.NoError(t, err)
    assert.Equal(t, "Test Dataset", dataset.Title)
}
```

### Integration Tests

```bash
# Start all services
./scripts/quick-start.sh

# Run integration tests
go test ./tests/integration/...
```

### Manual Testing

1. Start local environment
2. Upload test dataset
3. Search for dataset
4. Download and verify
5. Check blockchain state

## Project Structure

```
govchain/
├── govchain/              # Blockchain
│   ├── x/datasets/        # Custom module
│   │   ├── keeper/        # State management
│   │   ├── types/         # Type definitions
│   │   └── client/        # CLI/API
│   └── proto/             # Protocol buffers
├── indexer/               # Search service
│   └── main.go
├── web/                   # Frontend
│   └── index.html
├── scripts/               # Helper scripts
├── docs/                  # Documentation
└── tests/                 # Test suites
```

## Issue Guidelines

### Reporting Bugs

**Template:**
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Go version: [e.g., 1.21]
- GovChain version: [e.g., 1.0.0]

**Additional context**
Any other information
```

### Feature Requests

**Template:**
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution**
What you'd like to happen

**Describe alternatives**
Other solutions considered

**Additional context**
Mockups, examples, etc.
```

## Communication

### Discord

- **#general** - General discussion
- **#development** - Development questions
- **#pull-requests** - PR notifications
- **#issues** - Issue tracking

### GitHub Discussions

- **Ideas** - Feature proposals
- **Q&A** - Questions and answers
- **Show and tell** - Share your work

### Community Calls

- **When**: First Wednesday of each month
- **Time**: 6 PM UTC
- **Where**: Discord voice channel

## Recognition

Contributors are recognized in:

- **README.md** - Contributors section
- **Release notes** - Contributor credits
- **Website** - Hall of fame
- **Discord** - Contributor role

### Levels

- **Contributor** - 1+ merged PR
- **Regular Contributor** - 5+ merged PRs
- **Core Contributor** - 20+ merged PRs
- **Maintainer** - Trusted with merge access

## License

By contributing, you agree that your contributions will be licensed under:

- **Blockchain code**: Apache 2.0
- **Indexer**: MIT
- **Web interface**: MIT
- **Documentation**: Creative Commons

## Questions?

- **Discord**: https://discord.gg/govchain
- **Email**: dev@govchain.io
- **GitHub Discussions**: https://github.com/govchain/govchain/discussions

---

**Thank you for contributing to government transparency! 🏛️**
