# Yarn and Internet Computer Deployment

This document addresses using Yarn with Internet Computer deployment for the Clypr project.

## Using Yarn with IC Deployment

The deployment scripts and configurations have been updated to use Yarn instead of npm. Here are the key points to consider:

### 1. Installing Dependencies

When setting up the project initially or installing new dependencies, use Yarn commands:

```bash
# Initial setup
cd src/frontend
yarn install

# Adding dependencies
yarn add <package-name>

# Adding dev dependencies
yarn add --dev <package-name>
```

### 2. Building for IC Deployment

The `deploy-ic.sh` script has been updated to use Yarn for building:

```bash
yarn build:ic
```

This will use the Yarn-specific build process with the IC-specific Vite configuration.

### 3. Local Development

For local development, use:

```bash
yarn dev
```

### 4. Common Issues with Yarn and IC

#### Dependency Resolution

If you encounter dependency resolution issues during build:

```bash
# Clear Yarn cache
yarn cache clean

# Reinstall dependencies with resolution
yarn install --force
```

#### Build Output Path

Ensure that the `outDir` in `vite.config.ic.ts` matches the path expected in `dfx.json`. Currently set to:

```typescript
build: {
  outDir: 'dist', // This must match the path in dfx.json
  // ...
}
```

#### Lock File Conflicts

If you switch between npm and Yarn, you might get lock file conflicts. It's recommended to:
1. Delete `package-lock.json` if it exists
2. Keep only `yarn.lock`
3. Run `yarn install` to ensure dependencies are correctly resolved

### 5. Verifying Your Setup

You can verify that Yarn is working correctly with the IC deployment by running:

```bash
# Check Yarn version
yarn --version

# Test build process
cd src/frontend
yarn build:ic
```

A successful build will create the `dist` directory with all necessary assets for IC deployment.
