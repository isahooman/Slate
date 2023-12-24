@ECHO OFF
echo Updating Node.js packages...
call npm install >> log.txt 2>&1
echo Node.js packages updated.

:loop
echo Starting Role Manager
call node bot.js
echo Discord bot has stopped. Restarting...
echo. >> log.txt
echo ==================================== >> log.txt
echo %date% %time% >> log.txt
type log.txt | find /v /c "" >> log.txt
echo ==================================== >> log.txt
type log.txt | find /v /c "" >> log.txt
type log.txt | find /v /c "" >> log.txt
echo. >> log.txt
timeout /t 5
goto loop