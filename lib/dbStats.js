const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017/soi-inventory';

async function getDatabaseStats() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get database stats
    const dbStats = await db.stats();
    
    console.log('📊 DATABASE STATISTICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Database: ${dbStats.db}`);
    console.log(`Collections: ${dbStats.collections}`);
    console.log(`Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total Size: ${((dbStats.dataSize + dbStats.indexSize) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Documents: ${dbStats.objects.toLocaleString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get collection stats
    const collections = await db.listCollections().toArray();
    
    console.log('📦 COLLECTION STATISTICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Collection'.padEnd(25) + 'Documents'.padEnd(12) + 'Size (MB)'.padEnd(12) + 'Avg Doc (KB)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let totalDocs = 0;
    let totalSize = 0;

    for (const collection of collections) {
      const collName = collection.name;
      const coll = db.collection(collName);
      const docCount = await coll.countDocuments();
      
      // Estimate size based on document count and sample
      let avgDocSize = 0;
      let size = 0;
      
      if (docCount > 0) {
        const sample = await coll.findOne();
        if (sample) {
          const sampleSize = JSON.stringify(sample).length;
          avgDocSize = sampleSize / 1024; // Convert to KB
          size = (sampleSize * docCount) / 1024 / 1024; // Convert to MB
        }
      }

      totalDocs += docCount;
      totalSize += size;

      console.log(
        collName.padEnd(25) +
        docCount.toLocaleString().padEnd(12) +
        size.toFixed(2).padEnd(12) +
        avgDocSize.toFixed(2)
      );
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TOTAL'.padEnd(25) + totalDocs.toLocaleString().padEnd(12) + totalSize.toFixed(2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get specific collection details
    console.log('📈 KEY METRICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Sales
    const salesCount = await db.collection('sales').countDocuments();
    const completedSales = await db.collection('sales').countDocuments({ status: 'COMPLETED' });
    const parkedSales = await db.collection('sales').countDocuments({ status: 'PARKED' });
    console.log(`Total Sales: ${salesCount.toLocaleString()}`);
    console.log(`  - Completed: ${completedSales.toLocaleString()}`);
    console.log(`  - Parked: ${parkedSales.toLocaleString()}`);

    // Products & Items
    const productsCount = await db.collection('products').countDocuments();
    const itemsCount = await db.collection('items').countDocuments();
    console.log(`\nProducts: ${productsCount.toLocaleString()}`);
    console.log(`Items: ${itemsCount.toLocaleString()}`);

    // Cash Drawers
    const drawersCount = await db.collection('cashdrawers').countDocuments();
    const openDrawers = await db.collection('cashdrawers').countDocuments({ status: 'OPEN' });
    console.log(`\nCash Drawers: ${drawersCount.toLocaleString()}`);
    console.log(`  - Open: ${openDrawers.toLocaleString()}`);

    // Users
    const usersCount = await db.collection('users').countDocuments();
    const activeUsers = await db.collection('users').countDocuments({ isActive: true });
    console.log(`\nUsers: ${usersCount.toLocaleString()}`);
    console.log(`  - Active: ${activeUsers.toLocaleString()}`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Storage projection
    const totalSizeMB = (dbStats.dataSize + dbStats.indexSize) / 1024 / 1024;
    const freeSpaceMB = 512 - totalSizeMB; // MongoDB Atlas free tier
    const daysToFull = Math.floor(freeSpaceMB / (0.2)); // Assuming 200KB/day growth

    console.log('🎯 STORAGE PROJECTION (MongoDB Atlas Free Tier)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Current Usage: ${totalSizeMB.toFixed(2)} MB / 512 MB (${((totalSizeMB/512)*100).toFixed(1)}%)`);
    console.log(`Free Space: ${freeSpaceMB.toFixed(2)} MB`);
    console.log(`Estimated Days to Full: ~${daysToFull} days (${(daysToFull/365).toFixed(1)} years)`);
    console.log(`  Based on 100 transactions/day @ 2KB each`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  getDatabaseStats();
}

module.exports = { getDatabaseStats };
