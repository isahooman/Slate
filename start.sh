#!/bin/bash

echo "====================================" >> bot.log
echo "$(date) $(date +%T)" >> bot.log
echo "====================================" >> bot.log
echo >> bot.log

echo "Updating Node.js packages..."
echo "Updating Node.js packages..." >> bot.log
npm install > /dev/null 2>&1
echo "Node.js packages updated."
echo "Node.js packages updated." >> bot.log

while true; do
  echo "Starting..."
  node bot.js
  echo
  echo "Discord bot has stopped. Restarting..."
  echo >> bot.log
  echo "====================================" >> bot.log
  echo "$(date) $(date +%T)" >> bot.log
  echo "====================================" >> bot.log
done
