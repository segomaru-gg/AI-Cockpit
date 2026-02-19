#!/bin/bash

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.template to .env and fill in your Discord credentials."
    exit 1
fi

echo "Starting Discord Bot..."
/opt/homebrew/bin/node scripts/discord-bot.js
