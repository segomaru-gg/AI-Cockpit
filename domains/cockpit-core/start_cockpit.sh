#!/bin/bash
echo "Starting AI-Cockpit Remote Access..."
echo "URL: https://cockpit.aeternum-gg.jp"
echo "Press Ctrl+C to stop."
echo ""
/opt/homebrew/bin/cloudflared tunnel run cockpit
