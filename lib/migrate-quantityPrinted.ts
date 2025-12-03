import mongoose from 'mongoose';
import SaleItem from '../app/api/graphql/models/SaleItem';
import connectDB from './mongodb';

async function migrateQuantityPrinted() {
  try {
    await connectDB();
    
    console.log('Starting migration: Adding quantityPrinted field to existing SaleItems...');
    
    const result = await SaleItem.updateMany(
      { quantityPrinted: { $exists: false } },
      { $set: { quantityPrinted: 0 } }
    );
    
    console.log(`Migration complete! Updated ${result.modifiedCount} documents.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateQuantityPrinted();
