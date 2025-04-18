#!/bin/bash
set +x

echo "=====================================" >> ./output/bot.log
date >> ./output/bot.log
echo "=====================================" >> ./output/bot.log

echo "Updating Node.js packages..."
echo "Updating Node.js packages..." >> ./output/bot.log
npm install > /dev/null 2>&1
echo "Node.js packages updated."
echo "Node.js packages updated." >> ./output/bot.log

restart_count=0
restart_time=0

while true; do
  echo "Starting..."
  node bot/bot.js
  exit_code=$?
  
  if [ $exit_code -eq 0 ]; then
    echo "Bot shut down gracefully."
    echo "Bot shut down gracefully." >> ./output/bot.log
    exit 0
  fi

  echo
  echo "Discord bot has stopped with exit code $exit_code. Restarting..."
  echo >> bot.log
  echo "====================================" >> ./output/bot.log
  echo "$(date) $(date +%T)" >> ./output/bot.log
  echo "====================================" >> ./output/bot.log  
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