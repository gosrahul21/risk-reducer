Write-Host "Starting Full Stack Development Environment..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting both servers..." -ForegroundColor Yellow

# Start backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm start"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Press any key to close this window" -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
