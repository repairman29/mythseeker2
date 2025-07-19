#!/usr/bin/env node

/**
 * MythSeeker Performance Testing Script
 * Tests build performance, bundle size, and runtime metrics
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance thresholds
const THRESHOLDS = {
  buildTime: 30000, // 30 seconds
  bundleSize: 1024 * 1024, // 1MB
  typeCheckTime: 5000, // 5 seconds
  lintTime: 10000, // 10 seconds
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function measureTime(fn, name) {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  const duration = end - start;
  
  log(`⏱️  ${name}: ${duration}ms`, duration > THRESHOLDS[name] ? 'yellow' : 'green');
  return { duration, result };
}

function getBundleSize() {
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('dist directory not found. Run npm run build first.');
  }

  let totalSize = 0;
  const files = [];

  function calculateSize(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        calculateSize(fullPath);
      } else if (stat.isFile() && item.endsWith('.js')) {
        const size = stat.size;
        totalSize += size;
        files.push({
          name: path.relative(distPath, fullPath),
          size: size,
          sizeKB: (size / 1024).toFixed(2)
        });
      }
    }
  }

  calculateSize(distPath);
  return { totalSize, files };
}

function runPerformanceTests() {
  log('🚀 Starting MythSeeker Performance Tests...', 'bold');

  try {
    // Test 1: Type Check Performance
    log('\n📋 Test 1: TypeScript Type Checking', 'blue');
    const typeCheck = measureTime(() => {
      execSync('npm run type-check', { stdio: 'pipe' });
    }, 'typeCheckTime');

    // Test 2: Linting Performance
    log('\n🧹 Test 2: ESLint Linting', 'blue');
    const linting = measureTime(() => {
      execSync('npm run lint', { stdio: 'pipe' });
    }, 'lintTime');

    // Test 3: Build Performance
    log('\n🏗️  Test 3: Production Build', 'blue');
    const build = measureTime(() => {
      execSync('npm run build', { stdio: 'pipe' });
    }, 'buildTime');

    // Test 4: Bundle Size Analysis
    log('\n📦 Test 4: Bundle Size Analysis', 'blue');
    const bundleAnalysis = getBundleSize();
    
    log(`📊 Total Bundle Size: ${(bundleAnalysis.totalSize / 1024).toFixed(2)}KB`, 
        bundleAnalysis.totalSize > THRESHOLDS.bundleSize ? 'yellow' : 'green');
    
    log('\n📁 Bundle Breakdown:', 'blue');
    bundleAnalysis.files
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .forEach(file => {
        log(`  ${file.name}: ${file.sizeKB}KB`);
      });

    // Test 5: Memory Usage
    log('\n💾 Test 5: Memory Usage', 'blue');
    const memUsage = process.memoryUsage();
    log(`  Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    log(`  Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`);
    log(`  External: ${(memUsage.external / 1024 / 1024).toFixed(2)}MB`);

    // Summary
    log('\n📈 Performance Summary:', 'bold');
    const allTests = [
      { name: 'Type Check', duration: typeCheck.duration, threshold: THRESHOLDS.typeCheckTime },
      { name: 'Linting', duration: linting.duration, threshold: THRESHOLDS.lintTime },
      { name: 'Build', duration: build.duration, threshold: THRESHOLDS.buildTime },
    ];

    let allPassed = true;
    allTests.forEach(test => {
      const status = test.duration <= test.threshold ? '✅' : '⚠️';
      const color = test.duration <= test.threshold ? 'green' : 'yellow';
      log(`${status} ${test.name}: ${test.duration}ms (threshold: ${test.threshold}ms)`, color);
      
      if (test.duration > test.threshold) {
        allPassed = false;
      }
    });

    if (bundleAnalysis.totalSize > THRESHOLDS.bundleSize) {
      log(`⚠️  Bundle Size: ${(bundleAnalysis.totalSize / 1024).toFixed(2)}KB (threshold: ${(THRESHOLDS.bundleSize / 1024).toFixed(2)}KB)`, 'yellow');
      allPassed = false;
    } else {
      log(`✅ Bundle Size: ${(bundleAnalysis.totalSize / 1024).toFixed(2)}KB`, 'green');
    }

    if (allPassed) {
      log('\n🎉 All performance tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n⚠️  Some performance thresholds exceeded. Consider optimization.', 'yellow');
      process.exit(1);
    }

  } catch (error) {
    log(`❌ Performance test failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
runPerformanceTests(); 