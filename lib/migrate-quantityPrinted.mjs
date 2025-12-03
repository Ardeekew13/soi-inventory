import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soi-inventory';

async function migrateQuantityPrinted() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('Starting migration: Adding quantityPrinted field to existing SaleItems...');
    
    const SaleItem = mongoose.connection.collection('saleitems');
    
    const result = await SaleItem.updateMany(
      { quantityPrinted: { $exists: false } },
      { $set: { quantityPrinted: 0 } }
    );
    
    console.log(`Migration complete! Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateQuantityPrinted();
