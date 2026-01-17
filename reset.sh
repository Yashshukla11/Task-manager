#!/bin/bash

echo "🔄 Resetting QuickTask Application..."
echo ""

# Kill all node and python processes related to the app
echo "🛑 Stopping all services..."
pkill -f "node.*backend" 2>/dev/null
pkill -f "python.*analytics" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

echo "✅ All services stopped"
echo ""
echo "🚀 Now start services manually:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Analytics:"
echo "  cd analytics && source venv/bin/activate && python app.py"
echo ""
echo "Terminal 3 - Frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Then in browser:"
echo "  1. Press F12"
echo "  2. Console tab"
echo "  3. Type: localStorage.clear()"
echo "  4. Press Enter"
echo "  5. Refresh page"
echo "  6. Login: john@example.com / password123"
