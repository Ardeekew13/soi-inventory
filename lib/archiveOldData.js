const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017/soi-inventory';

// Sale Schema
const saleSchema = new mongoose.Schema({
  totalAmount: Number,
  costOfGoods: Number,
  grossProfit: Number,
  status: String,
  voidReason: String,
  orderNo: String,
  customerName: String,
  orderType: String,
  tableNumber: String,
  isDeleted: Boolean,
}, { timestamps: true });

// Sale Item Schema
const saleItemSchema = new mongoose.Schema({
  saleId: mongoose.Schema.Types.ObjectId,
  productId: mongoose.Schema.Types.ObjectId,
  productName: String,
  quantity: Number,
  price: Number,
  subtotal: Number,
  costOfGoods: Number,
}, { timestamps: true });

// Cash Drawer Schema
const cashDrawerSchema = new mongoose.Schema({
  openedBy: String,
  openedAt: Date,
  closedAt: Date,
  openingBalance: Number,
  closingBalance: Number,
  expectedBalance: Number,
  status: String,
  transactions: Array,
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
const SaleItem = mongoose.model('SaleItem', saleItemSchema);
const CashDrawer = mongoose.model('CashDrawer', cashDrawerSchema);

// Archive models (same structure, different collection names)
const ArchivedSale = mongoose.model('ArchivedSale', saleSchema, 'archived_sales');
const ArchivedSaleItem = mongoose.model('ArchivedSaleItem', saleItemSchema, 'archived_sale_items');
const ArchivedCashDrawer = mongoose.model('ArchivedCashDrawer', cashDrawerSchema, 'archived_cash_drawers');

async function archiveOldData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB\n');

    // Calculate date 2 years ago
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    console.log(`📅 Archiving data older than: ${twoYearsAgo.toISOString()}\n`);

    // 1. Find old sales
    const oldSales = await Sale.find({ 
      createdAt: { $lt: twoYearsAgo },
      status: 'COMPLETED' // Only archive completed sales
    });

    console.log(`📦 Found ${oldSales.length} old sales to archive`);

    if (oldSales.length === 0) {
      console.log('✅ No data to archive');
      await mongoose.connection.close();
      return;
    }

    // 2. Copy sales to archive
    for (const sale of oldSales) {
      const archivedSale = new ArchivedSale(sale.toObject());
      await archivedSale.save();
    }
    console.log(`✅ Archived ${oldSales.length} sales`);

    // 3. Find and archive sale items
    const oldSaleIds = oldSales.map(s => s._id);
    const oldSaleItems = await SaleItem.find({ saleId: { $in: oldSaleIds } });
    
    for (const item of oldSaleItems) {
      const archivedItem = new ArchivedSaleItem(item.toObject());
      await archivedItem.save();
    }
    console.log(`✅ Archived ${oldSaleItems.length} sale items`);

    // 4. Find and archive old cash drawers
    const oldDrawers = await CashDrawer.find({
      closedAt: { $lt: twoYearsAgo },
      status: 'CLOSED'
    });

    for (const drawer of oldDrawers) {
      const archivedDrawer = new ArchivedCashDrawer(drawer.toObject());
      await archivedDrawer.save();
    }
    console.log(`✅ Archived ${oldDrawers.length} cash drawers`);

    // 5. Delete from original collections (optional - uncomment to actually delete)
    // UNCOMMENT THESE LINES TO ACTUALLY DELETE OLD DATA:
    /*
    await Sale.deleteMany({ _id: { $in: oldSaleIds } });
    await SaleItem.deleteMany({ saleId: { $in: oldSaleIds } });
    await CashDrawer.deleteMany({ _id: { $in: oldDrawers.map(d => d._id) } });
    console.log('🗑️  Deleted old data from main collections');
    */

    console.log('\n📊 Archive Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Sales archived: ${oldSales.length}`);
    console.log(`Sale items archived: ${oldSaleItems.length}`);
    console.log(`Cash drawers archived: ${oldDrawers.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Note: Data has been copied to archive collections.');
    console.log('   Original data has NOT been deleted yet.');
    console.log('   Uncomment the delete lines in the script to remove old data.\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  archiveOldData();
}

module.exports = { archiveOldData };
