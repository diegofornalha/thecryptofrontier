const { execSync } = require('child_process');

console.log('🚀 Deploying Sanity Studio...');
console.log('Project ID: uvuq2a47');
console.log('Dataset: production');

try {
  // Try to deploy with auto-confirm
  execSync('npx sanity deploy --studio-host thecryptofrontier-v2', {
    stdio: 'inherit',
    cwd: '/home/sanity/thecryptofrontier'
  });
  
  console.log('\n✅ Deploy completed!');
  console.log('Studio URL: https://thecryptofrontier-v2.sanity.studio');
} catch (error) {
  console.error('❌ Deploy failed:', error.message);
}