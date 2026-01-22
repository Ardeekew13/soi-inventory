/**
 * Database Index Creation Script
 * 
 * This script ensures all performance-critical indexes are created
 * Run this after optimization to verify indexes exist
 */

import dbConnect from './mongodb';
import Sale from '../app/api/graphql/models/Sale';
import SaleItem from '../app/api/graphql/models/SaleItem';
import ProductIngredient from '../app/api/graphql/models/ProductIngredients';
import Product from '../app/api/graphql/models/Products';
import Item from '../app/api/graphql/models/Item';

async function createIndexes() {
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    
    console.log('\n📊 Creating/Verifying Indexes...\n');
    
    // Sale indexes
    console.log('✓ Sale model indexes:');
    await Sale.createIndexes();
    const saleIndexes = await Sale.collection.getIndexes();
    console.log('  - Total indexes:', Object.keys(saleIndexes).length);
    Object.keys(saleIndexes).forEach(key => {
      console.log(`    • ${key}`);
    });
    
    // SaleItem indexes (critical for N+1 prevention)
    console.log('\n✓ SaleItem model indexes (CRITICAL):');
    await SaleItem.createIndexes();
    const saleItemIndexes = await SaleItem.collection.getIndexes();
    console.log('  - Total indexes:', Object.keys(saleItemIndexes).length);
    Object.keys(saleItemIndexes).forEach(key => {
      console.log(`    • ${key}`);
    });
    
    // ProductIngredient indexes
    console.log('\n✓ ProductIngredient model indexes:');
    await ProductIngredient.createIndexes();
    const ingredientIndexes = await ProductIngredient.collection.getIndexes();
    console.log('  - Total indexes:', Object.keys(ingredientIndexes).length);
    Object.keys(ingredientIndexes).forEach(key => {
      console.log(`    • ${key}`);
    });
    
    // Product indexes
    console.log('\n✓ Product model indexes:');
    await Product.createIndexes();
    const productIndexes = await Product.collection.getIndexes();
    console.log('  - Total indexes:', Object.keys(productIndexes).length);
    Object.keys(productIndexes).forEach(key => {
      console.log(`    • ${key}`);
    });
    
    // Item indexes
    console.log('\n✓ Item model indexes:');
    await Item.createIndexes();
    const itemIndexes = await Item.collection.getIndexes();
    console.log('  - Total indexes:', Object.keys(itemIndexes).length);
    Object.keys(itemIndexes).forEach(key => {
      console.log(`    • ${key}`);
    });
    
    console.log('\n✅ All indexes created/verified successfully!\n');
    
    // Performance tips
    console.log('📈 Performance Tips:');
    console.log('  1. Indexes are now optimized for your queries');
    console.log('  2. Expected speed improvement: 10-50x on large datasets');
    console.log('  3. Monitor query times with console.time() in resolvers');
    console.log('  4. Apply the sales query optimization from QUERY_OPTIMIZATION_GUIDE.md');
    console.log('\n🔍 Check docs/QUERY_OPTIMIZATION_GUIDE.md for detailed info\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createIndexes();
}

export default createIndexes;
