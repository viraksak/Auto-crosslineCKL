@echo off
title Student Exam System Server
echo ====================================================
echo   Student Exam Result System - Web Application
echo ====================================================
echo Starting local web server at http://localhost:3000...
echo Opening in browser...
timeout /t 1 >nul
start http://localhost:3000
node server.js
pause
