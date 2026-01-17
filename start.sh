#!/bin/bash

# QuickTask - Quick Start Script
# This script starts all services for local development

echo "🚀 Starting QuickTask Application..."
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   Run: mongod"
    echo ""
    exit 1
fi
echo "✅ MongoDB is running"
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check required ports
echo "🔍 Checking ports..."
check_port 5001 || exit 1
check_port 8001 || exit 1
check_port 5173 || exit 1
echo "✅ All ports are available"
echo ""

# Start Backend
echo "🔧 Starting Backend (Port 5000)..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
cd ..

# Wait for backend to be ready
sleep 3

# Start Analytics Service
echo "🐍 Starting Analytics Service (Port 8001)..."
cd analytics
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
python app.py > ../logs/analytics.log 2>&1 &
ANALYTICS_PID=$!
echo "✅ Analytics started (PID: $ANALYTICS_PID)"
cd ..

# Wait for analytics to be ready
sleep 3

# Start Frontend
echo "⚛️  Starting Frontend (Port 5173)..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
cd ..

# Wait for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
echo ""
echo "🔍 Verifying services..."

if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ Analytics is healthy"
else
    echo "❌ Analytics health check failed"
fi

if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 QuickTask is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Frontend:  http://localhost:5173"
echo "🔧 Backend:   http://localhost:5001"
echo "🐍 Analytics: http://localhost:8001"
echo "📚 API Docs:  http://localhost:8001/docs"
echo ""
echo "🔑 Test Credentials:"
echo "   Email:    john@example.com"
echo "   Password: password123"
echo ""
echo "📝 Process IDs:"
echo "   Backend:   $BACKEND_PID"
echo "   Analytics: $ANALYTICS_PID"
echo "   Frontend:  $FRONTEND_PID"
echo ""
echo "To stop all services, run: ./stop.sh"
echo "Or press Ctrl+C and run: kill $BACKEND_PID $ANALYTICS_PID $FRONTEND_PID"
echo ""
echo "📋 Logs are available in the logs/ directory"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save PIDs to file for stop script
mkdir -p logs
echo "$BACKEND_PID" > logs/backend.pid
echo "$ANALYTICS_PID" > logs/analytics.pid
echo "$FRONTEND_PID" > logs/frontend.pid

# Keep script running
wait
