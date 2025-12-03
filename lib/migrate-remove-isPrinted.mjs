import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017/soi-inventory';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const SaleItem = mongoose.connection.collection('saleitems');

    // Find all documents
    const allItems = await SaleItem.find({}).toArray();
    console.log(`Found ${allItems.length} sale items`);

    // Remove isPrinted field from all documents
    const result = await SaleItem.updateMany(
      {},
      { $unset: { isPrinted: "" } }
    );

    // Add quantityPrinted field to documents that don't have it
    const result2 = await SaleItem.updateMany(
      { quantityPrinted: { $exists: false } },
      { $set: { quantityPrinted: 0 } }
    );

    console.log(`Updated ${result.modifiedCount} documents (removed isPrinted)`);
    console.log(`Updated ${result2.modifiedCount} documents (added quantityPrinted)`);

    // Verify
    const updated = await SaleItem.find({}).toArray();
    console.log('\nSample updated documents:');
    updated.slice(0, 3).forEach(item => {
      console.log({
        _id: item._id,
        quantity: item.quantity,
        quantityPrinted: item.quantityPrinted,
        isPrinted: item.isPrinted // should be undefined
      });
    });

    await mongoose.disconnect();
    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
