#!/usr/bin/env node

console.log('🔍 Checking build environment variables...\n');

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let hasErrors = false;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === `$${varName}` || value === 'undefined') {
    console.error(`❌ ${varName}: NOT SET or INVALID`);
    hasErrors = true;
  } else {
    // Mask sensitive data
    const masked = value.substring(0, 6) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${varName}: ${masked}`);
  }
});

console.log('\nOptional environment variables:');
[
  'NEXT_PUBLIC_BLOCKCHAIN_ENABLED',
  'NEXT_PUBLIC_DEFAULT_NETWORK',
  'NEXT_PUBLIC_CERTIFICATE_CONTRACT_POLYGON',
  'NEXT_PUBLIC_PINATA_GATEWAY'
].forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: not set`);
  }
});

if (hasErrors) {
  console.error('\n❌ Build environment is not properly configured!');
  console.error('Please set the required environment variables in Cloud Build trigger substitutions.');
  process.exit(1);
} else {
  console.log('\n✅ Build environment is properly configured!');
}