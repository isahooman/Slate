@ECHO OFF

TITLE Slate Discord Bot

echo ==================================== >> bot.log
echo %date% %time% >> bot.log
echo ==================================== >> bot.log
echo. >> bot.log

echo Updating Node.js packages...
echo Updating Node.js packages... >> bot.log
call npm install > NUL 2>&1
echo Node.js packages updated.
echo Node.js packages updated. >> bot.log

:loop
echo Starting...
call node bot.js
echo. 
echo Discord bot has stopped. Restarting...
echo. >> bot.log
echo ==================================== >> bot.log
echo %date% %time% >> bot.log
echo ==================================== >> bot.log
goto loop