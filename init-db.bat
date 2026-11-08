@echo off
TITLE ShopEase - Database Setup
echo ===================================================
echo   ShopEase PostgreSQL Database Initialization
echo ===================================================
echo.
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"

if not exist %PSQL% (
    echo [WARNING] psql.exe not found at standard path. Trying system PATH...
    set PSQL=psql
)

echo Creating database 'shopease' (if not already created)...
%PSQL% -U postgres -c "CREATE DATABASE shopease;"

echo Executing database schema (schema.sql)...
%PSQL% -U postgres -d shopease -f "database\schema.sql"

echo Executing seed data (seed.sql)...
%PSQL% -U postgres -d shopease -f "database\seed.sql"

echo.
echo Database setup completed successfully!
pause

