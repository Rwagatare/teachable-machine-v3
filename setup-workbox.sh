#!/bin/bash

# Workbox PWA Setup Script for Teachable Machine
echo "🚀 Setting up Workbox for improved Lighthouse performance..."

# Install Workbox CLI and related dependencies
echo "📦 Installing Workbox dependencies..."
npm install --save-dev workbox-cli workbox-webpack-plugin

# Install Workbox runtime libraries  
echo "📦 Installing Workbox runtime libraries..."
npm install --save workbox-precaching workbox-routing workbox-strategies workbox-expiration workbox-background-sync

# Install additional performance tools
echo "📦 Installing performance tools..."
npm install --save-dev lighthouse webpack webpack-cli @babel/core @babel/preset-env babel-loader

echo "✅ Workbox setup complete!"
echo ""
echo "🔧 To build with Workbox optimization:"
echo "   npm run build-pwa"
echo ""
echo "📊 To run Lighthouse performance test:"
echo "   npm run lighthouse"
echo ""
echo "🎯 Expected improvements:"
echo "   • Performance Score: 49 → 90+"
echo "   • FCP: Faster with precaching"
echo "   • LCP: Optimized resource loading"
echo "   • TBT: Reduced with code splitting"
echo "   • PWA Score: 100/100"
