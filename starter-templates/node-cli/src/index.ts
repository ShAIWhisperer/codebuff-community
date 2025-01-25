#!/usr/bin/env node

async function main() {
  console.log('Hello from your CLI app!')
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
