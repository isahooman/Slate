@ECHO OFF
setlocal enabledelayedexpansion

REM Ensure output directory exists
if not exist "output" mkdir "output"

echo ==================================== >> output/bot.log
echo %date% %time% >> output/bot.log
echo ==================================== >> output/bot.log
echo. >> output/bot.log

echo Updating Node.js packages...
echo Updating Node.js packages... >> output/bot.log
call npm install > NUL 2>&1
echo Node.js packages updated.
echo Node.js packages updated. >> output/bot.log

title Slate Discord Bot

set restart_count=0
set restart_time=0

:loop
echo Starting...
call node bot/bot.js
set exit_code=%ERRORLEVEL%

if %exit_code% EQU 0 (
    echo Bot shut down gracefully.
    echo Bot shut down gracefully. >> output/bot.log
    goto :eof
)

echo. 
echo Discord bot has stopped with exit code %exit_code%. Restarting...
echo. >> output/bot.log
echo ==================================== >> output/bot.log
echo %date% %time% >> output/bot.log
echo ==================================== >> output/bot.log

set /a restart_count+=1
set /a current_time=%time:~0,2%*3600+%time:~3,2%*60+%time:~6,2%
set /a time_difference=%current_time%-%restart_time%

if %time_difference% LEQ 15 (
    if %restart_count% GEQ 3 (
        echo Bot has restarted 3 times in the last 15 seconds. Exiting...
        goto :eof
    )
) else (
    set restart_count=1
    set /a restart_time=%current_time%
)

goto loop
