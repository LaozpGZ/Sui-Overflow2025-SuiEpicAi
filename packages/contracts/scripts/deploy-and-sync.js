#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  // 1. 部署合约
  console.log('Publishing Move contract...');
  execSync('sui client publish --gas-budget 100000000', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  // 2. 同步 packageId 到前端
  console.log('Syncing packageId to frontend .env.local...');
  execSync('node scripts/copy-package-id.js', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  console.log('Deploy and sync completed!');
} catch (e) {
  console.error('Error during deploy and sync:', e);
  process.exit(1);
} 