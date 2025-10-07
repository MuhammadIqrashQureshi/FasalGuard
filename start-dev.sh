#!/bin/bash

echo "Starting FasalGuard Development Environment..."
echo

echo "Installing backend dependencies..."
cd backend
npm install
echo

echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend..."
cd ..
npm start &
FRONTEND_PID=$!

echo "Both servers are running!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
