#!/bin/bash

# QuickTask - Stop Script
# This script stops all running services

echo "🛑 Stopping QuickTask Application..."
echo ""

# Check if PID files exist
if [ ! -d "logs" ]; then
    echo "⚠️  No logs directory found. Services may not be running."
    exit 1
fi

# Stop Backend
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "🔧 Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "✅ Backend stopped"
    else
        echo "⚠️  Backend is not running"
    fi
    rm logs/backend.pid
fi

# Stop Analytics
if [ -f "logs/analytics.pid" ]; then
    ANALYTICS_PID=$(cat logs/analytics.pid)
    if ps -p $ANALYTICS_PID > /dev/null; then
        echo "🐍 Stopping Analytics (PID: $ANALYTICS_PID)..."
        kill $ANALYTICS_PID
        echo "✅ Analytics stopped"
    else
        echo "⚠️  Analytics is not running"
    fi
    rm logs/analytics.pid
fi

# Stop Frontend
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "⚛️  Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "✅ Frontend stopped"
    else
        echo "⚠️  Frontend is not running"
    fi
    rm logs/frontend.pid
fi

# Also kill any remaining node/python processes on these ports
echo ""
echo "🧹 Cleaning up any remaining processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:8001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo ""
echo "✅ All services stopped successfully!"
