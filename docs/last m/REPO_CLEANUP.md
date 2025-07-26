# Repository Cleanup Guide

This guide explains how to clean up the repository before final submission, removing internal team files and any sensitive information.

## Files to Remove from Repository

### Internal Documentation
- [ ] DEVELOPMENT_PROGRESS.md
- [ ] REPO_CLEANUP.md (this file, after using it)
- [ ] Any brainstorming documents
- [ ] Team-specific notes
- [ ] Files with timestamps or specific dates

### Development Files
- [ ] Any configuration files with credentials
- [ ] Unused dependencies
- [ ] Temporary test files
- [ ] Large binary files not needed for demo

## How to Remove Files From Git History

### Option 1: Using git-filter-repo (Recommended)

This is the most efficient and recommended approach:

```bash
# Install git-filter-repo
pip install git-filter-repo

# Create a fresh clone for safety
cd /tmp
git clone https://github.com/abdushakurob/clypr.git clypr-clean
cd clypr-clean

# Remove specific files from the entire history
git filter-repo --path docs/DEVELOPMENT_PROGRESS.md --path docs/REPO_CLEANUP.md --invert-paths

# Verify the changes look correct
git log

# Force push to update the repository
git push origin --force
```

### Option 2: Using BFG Repo-Cleaner

If you prefer using BFG:

1. Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
2. Create a mirror clone of your repo:
   ```bash
   git clone --mirror https://github.com/abdushakurob/clypr.git clypr.git
   ```
3. Create a text file `files-to-remove.txt` with file paths to remove, one per line
4. Run BFG:
   ```bash
   java -jar bfg.jar --delete-files-by-name files-to-remove.txt clypr.git
   ```
5. Clean up and push:
   ```bash
   cd clypr.git
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push
   ```

## Files to Keep

Make sure to keep these essential files:

- README.md with installation and usage instructions
- LICENSE file
- Core source code files
- Public documentation files
- Architecture diagrams and designs
- User guides

## Post-Cleanup Verification

After cleaning the repository:

1. Clone a fresh copy to verify that internal files are gone
2. Check the GitHub repository to ensure the files no longer appear
3. Make sure the project still builds and functions correctly
4. Update any references to removed files in remaining documentation

## Future Best Practices

For future projects:

1. Use `.gitignore` from the beginning to exclude sensitive files
2. Store team-specific files outside the main repository
3. Use environment variables for sensitive information
4. Consider using a private repository for internal documents
