import { syncAllData } from './server/sync';

async function build() {
  try {
    console.log('🔄 Syncing data...');
    await syncAllData();
    console.log('✅ Sync complete');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
