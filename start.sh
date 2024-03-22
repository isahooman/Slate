#!/bin/bash
set +x

echo "=====================================" >> ./bot.log
date >> ./bot.log
echo "=====================================" >> ./bot.log

echo "Updating Node.js packages..."
echo "Updating Node.js packages..." >> ./bot.log
npm install > /dev/null 2>&1
echo "Node.js packages updated."
echo "Node.js packages updated." >> ./bot.log

restart_count=0
restart_time=0

while true; do
  echo "Starting..."
  node bot.js
  echo
  echo "Discord bot has stopped. Restarting..."
  echo >> bot.log
  echo "====================================" >> ./bot.log
  echo "$(date) $(date +%T)" >> ./bot.log
  echo "====================================" >> ./bot.log  
  echo "" >> bot.log

  current_time=$(( $(date +%H) * 3600 + $(date +%M) * 60 + $(date +%S) ))
  time_difference=$(( current_time - restart_time ))

  if [[ $time_difference -le 15 ]]; then
    if [[ $restart_count -ge 3 ]]; then
      echo "Bot has restarted 3 times in the last 15 seconds. Exiting..."
      exit 1
    fi
  else
    restart_count=1
    restart_time=$current_time
  fi
done