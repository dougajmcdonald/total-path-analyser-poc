#!/usr/bin/env node

import chalk from 'chalk'
import { spawn } from 'child_process'
import { readFileSync, readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Colors for output
const colors = {
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  bold: chalk.bold
}

// Find all packages with test scripts (recursively)
function findPackagesWithTests() {
  const packages = []
  const packagesDir = join(rootDir, 'packages')
  
  function scanDirectory(dirPath, relativePath = '') {
    try {
      const items = readdirSync(dirPath)
      
      for (const item of items) {
        const itemPath = join(dirPath, item)
        const itemRelativePath = relativePath ? join(relativePath, item) : item
        
        if (statSync(itemPath).isDirectory()) {
          // Check if this directory has a package.json
          const packageJsonPath = join(itemPath, 'package.json')
          
          try {
            if (statSync(packageJsonPath).isFile()) {
              try {
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
                
                // Check if package has test scripts
                if (packageJson.scripts && (
                  packageJson.scripts.test || 
                  packageJson.scripts['test:watch'] || 
                  packageJson.scripts['test:coverage']
                )) {
                  packages.push({
                    name: packageJson.name,
                    path: itemPath,
                    scripts: packageJson.scripts
                  })
                }
              } catch (err) {
                console.warn(colors.warning(`Warning: Could not read package.json for ${itemRelativePath}`))
              }
            } else {
              // Recursively scan subdirectories
              scanDirectory(itemPath, itemRelativePath)
            }
          } catch (err) {
            // package.json doesn't exist, recursively scan subdirectories
            scanDirectory(itemPath, itemRelativePath)
          }
        }
      }
    } catch (err) {
      // Skip directories we can't read
      console.warn(colors.warning(`Warning: Could not read directory ${relativePath || dirPath}: ${err.message}`))
    }
  }
  
  try {
    scanDirectory(packagesDir)
  } catch (err) {
    console.error(colors.error('Error reading packages directory:', err.message))
    process.exit(1)
  }
  
  return packages
}

// Run tests for a single package
function runPackageTests(packageInfo) {
  return new Promise((resolve) => {
    console.log(colors.info(`\n🧪 Running tests for ${colors.bold(packageInfo.name)}...`))
    console.log(colors.info(`📁 Package path: ${packageInfo.path}`))
    
    const testCommand = packageInfo.scripts.test || 'echo "No test script found"'
    console.log(colors.info(`▶️  Command: pnpm test`))
    console.log('─'.repeat(60))
    
    const child = spawn('pnpm', ['test'], {
      cwd: packageInfo.path,
      stdio: 'inherit',
      shell: true
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(colors.success(`✅ Tests passed for ${packageInfo.name}`))
        resolve({ success: true, package: packageInfo.name })
      } else {
        console.log(colors.error(`❌ Tests failed for ${packageInfo.name} (exit code: ${code})`))
        resolve({ success: false, package: packageInfo.name, code })
      }
    })
    
    child.on('error', (err) => {
      console.log(colors.error(`❌ Error running tests for ${packageInfo.name}:`, err.message))
      resolve({ success: false, package: packageInfo.name, error: err.message })
    })
  })
}

// Main function
async function main() {
  console.log(colors.bold('🔍 Discovering packages with test scripts...'))
  
  const packages = findPackagesWithTests()
  
  if (packages.length === 0) {
    console.log(colors.warning('⚠️  No packages with test scripts found.'))
    console.log(colors.info('💡 Add a "test" script to package.json in any package to run tests.'))
    process.exit(0)
  }
  
  console.log(colors.info(`📦 Found ${packages.length} package(s) with test scripts:`))
  packages.forEach(pkg => {
    console.log(colors.info(`   • ${pkg.name}`))
  })
  
  console.log(colors.bold('\n🚀 Running tests for all packages...'))
  
  const results = []
  for (const packageInfo of packages) {
    const result = await runPackageTests(packageInfo)
    results.push(result)
  }
  
  // Summary
  console.log(colors.bold('\n📊 Test Results Summary:'))
  console.log('═'.repeat(60))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  results.forEach(result => {
    if (result.success) {
      console.log(colors.success(`✅ ${result.package}`))
    } else {
      console.log(colors.error(`❌ ${result.package}`))
      if (result.code) {
        console.log(colors.error(`   Exit code: ${result.code}`))
      }
      if (result.error) {
        console.log(colors.error(`   Error: ${result.error}`))
      }
    }
  })
  
  console.log('═'.repeat(60))
  console.log(colors.info(`Total packages: ${results.length}`))
  console.log(colors.success(`Passed: ${successful.length}`))
  console.log(colors.error(`Failed: ${failed.length}`))
  
  if (failed.length > 0) {
    console.log(colors.bold('\n💥 Some tests failed!'))
    process.exit(1)
  } else {
    console.log(colors.bold('\n🎉 All tests passed!'))
    process.exit(0)
  }
}

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error(colors.error('Uncaught Exception:', err.message))
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(colors.error('Unhandled Rejection at:', promise, 'reason:', reason))
  process.exit(1)
})

// Run the main function
main().catch(err => {
  console.error(colors.error('Error:', err.message))
  process.exit(1)
})
