# PowerShell script to train ML models
# Usage: .\train_models.ps1

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "  ML Model Training Script" -ForegroundColor Yellow
Write-Host ("=" * 60) -ForegroundColor Cyan

# Get JWT token
$token = Read-Host "Enter your JWT token (from login)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ Token is required!" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$apiUrl = "http://localhost:3000/api"

# Check backend connection
Write-Host "`n🔍 Checking backend connection..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$apiUrl/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Start it with: cd backend && npm run dev" -ForegroundColor Gray
    exit 1
}

# Check ML service connection
Write-Host "`n🔍 Checking ML service connection..." -ForegroundColor Yellow
try {
    $mlHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET -ErrorAction Stop
    Write-Host "✅ ML service is running" -ForegroundColor Green
} catch {
    Write-Host "❌ ML service is not running!" -ForegroundColor Red
    Write-Host "   Start it with: cd ml-service && python main.py" -ForegroundColor Gray
    exit 1
}

# Check current model status
Write-Host "`n📊 Checking current model status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$apiUrl/ml/status" -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "`nCurrent Status:" -ForegroundColor Cyan
    Write-Host "  Categorizer trained: $($status.data.categorizer.trained)" -ForegroundColor Gray
    Write-Host "  Forecaster trained: $($status.data.forecaster.trained)" -ForegroundColor Gray
    
    if ($status.data.categorizer.trained) {
        Write-Host "  Categories: $($status.data.categorizer.categories.Count)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Could not check model status" -ForegroundColor Yellow
}

# Ask for confirmation
Write-Host "`n❓ Train ML models now? (yes/no): " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne "yes") {
    Write-Host "`n❌ Cancelled." -ForegroundColor Red
    exit 0
}

# Train models
Write-Host "`n🤖 Training ML models..." -ForegroundColor Yellow
Write-Host "   This may take 30-60 seconds..." -ForegroundColor Gray

try {
    $response = Invoke-RestMethod `
        -Uri "$apiUrl/ml/train/all" `
        -Method POST `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "`n✅ Training complete!" -ForegroundColor Green
    
    # Display results
    Write-Host "`n📊 Training Results:" -ForegroundColor Cyan
    Write-Host "  Categorizer:" -ForegroundColor White
    Write-Host "    - Accuracy: $($response.data.categorizer.accuracy * 100)%" -ForegroundColor Gray
    Write-Host "    - Transactions: $($response.data.categorizer.num_transactions)" -ForegroundColor Gray
    Write-Host "    - Categories: $($response.data.categorizer.num_categories)" -ForegroundColor Gray
    
    Write-Host "`n  Forecaster:" -ForegroundColor White
    Write-Host "    - Categories trained: $($response.data.forecaster.categories_trained)" -ForegroundColor Gray
    Write-Host "    - Total categories: $($response.data.forecaster.total_categories)" -ForegroundColor Gray
    
    # Check for model files
    Write-Host "`n📁 Checking for model files..." -ForegroundColor Yellow
    
    $modelsPath = "ml-service\models"
    if (Test-Path $modelsPath) {
        $modelDirs = Get-ChildItem -Path $modelsPath -Directory
        
        if ($modelDirs.Count -gt 0) {
            Write-Host "✅ Model files created:" -ForegroundColor Green
            foreach ($dir in $modelDirs) {
                $files = Get-ChildItem -Path $dir.FullName -Filter "*.pkl"
                Write-Host "  📂 $($dir.Name)/" -ForegroundColor Cyan
                foreach ($file in $files) {
                    $sizeKB = [math]::Round($file.Length / 1KB, 2)
                    Write-Host "     - $($file.Name) ($sizeKB KB)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "⚠️  No model directories found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Models directory not found" -ForegroundColor Yellow
    }
    
    # Test prediction
    Write-Host "`n🧪 Testing auto-categorization..." -ForegroundColor Yellow
    
    $testTransaction = @{
        description = "Coffee at Starbucks"
        amount = -5.50
        date = (Get-Date).ToString("yyyy-MM-dd")
        type = "expense"
        source = "manual"
    }
    
    try {
        $testResult = Invoke-RestMethod `
            -Uri "$apiUrl/transactions" `
            -Method POST `
            -Headers $headers `
            -Body ($testTransaction | ConvertTo-Json) `
            -ErrorAction Stop
        
        Write-Host "✅ Test transaction created and categorized!" -ForegroundColor Green
        Write-Host "   Predicted category: $($testResult.data.category)" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Could not test prediction: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Training failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    
    if ($_.Exception.Message -like "*50*") {
        Write-Host "`n💡 Tip: You need at least 50 transactions with categories to train." -ForegroundColor Yellow
        Write-Host "   Use the sample data generator: python ml-service\generate_and_train.py" -ForegroundColor Gray
    }
    
    exit 1
}

Write-Host "`n" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  🎉 Training Complete!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Create new transactions - they'll auto-categorize!" -ForegroundColor Gray
Write-Host "   2. View expense forecast in Analytics" -ForegroundColor Gray
Write-Host "   3. Share model files with friends" -ForegroundColor Gray
Write-Host ""
