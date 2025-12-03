#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   SOI Inventory - Start Both Services     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the soi-inventory root directory"
    exit 1
fi

# Start print server in background
echo "🖨️  Starting Print Server..."
cd print-server
if [ ! -d "node_modules" ]; then
    echo "📦 Installing print server dependencies..."
    npm install --silent
fi

# Start print server in background
npm start > print-server.log 2>&1 &
PRINT_PID=$!
cd ..

echo "✅ Print Server started (PID: $PRINT_PID)"
echo "   📄 Logs: print-server/print-server.log"
echo "   🏥 Health: http://localhost:9100/health"
echo ""

# Wait a moment for print server to start
sleep 2

# Start Next.js app
echo "🚀 Starting POS Application..."
echo ""
npm run dev

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $PRINT_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

trap cleanup INT TERM
