@echo off
echo ISFamilyHub Docker Management

:menu
echo.
echo 1. Build and Start All Services
echo 2. Stop All Services
echo 3. View Logs
echo 4. Clean Up (Remove containers and images)
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto build
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto logs
if "%choice%"=="4" goto cleanup
if "%choice%"=="5" goto exit

:build
echo Building and starting all services...
docker-compose up --build -d
echo Services started! Frontend: http://localhost:3000
goto menu

:stop
echo Stopping all services...
docker-compose down
goto menu

:logs
echo Showing logs...
docker-compose logs -f
goto menu

:cleanup
echo Cleaning up containers and images...
docker-compose down --rmi all --volumes
goto menu

:exit
echo Goodbye!
pause