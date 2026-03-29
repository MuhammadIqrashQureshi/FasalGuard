Write-Output "Testing Maize City Validation with valid vs. invalid cities:"
Write-Output ""

# Test 1: Valid city Lahore
Write-Output "Test 1: Valid city (Lahore)"
$body1 = @{
  latitude = 31.5
  longitude = 74.3
  city = 'Lahore'
  crop = 'maize'
  analysis_date = '2026-05-15'
} | ConvertTo-Json

try {
  $res1 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body1
  Write-Output "  Status: $($res1.status)"
  Write-Output "  Crop field returned: $($res1.crop)"
  Write-Output "  PASS"
} catch {
  Write-Output "  ERROR: $($_.ErrorDetails.Message)"
}

Write-Output ""

# Test 2: Invalid city (should fail validation in Python)
Write-Output "Test 2: Invalid city (Gujrat - not in maize allowlist, only in rice)"
$body2 = @{
  latitude = 32.5
  longitude = 74.0
  city = 'Gujrat'
  crop = 'maize'
  analysis_date = '2026-05-15'
} | ConvertTo-Json

try {
  $res2 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body2
  Write-Output "  Status: $($res2.status)"
  Write-Output "  ERROR: Should have been rejected but got response with status: $($res2.status)"
} catch {
  $errMsg = $_.ErrorDetails.Message
  if ($errMsg -match "not configured for maize|Faisalabad.*Lahore.*Multan.*Sargodha.*Bahawalpur") {
    Write-Output "  PASS: Got expected validation error"
    Write-Output "  Message: $errMsg"
  } else {
    Write-Output "  Got error: $errMsg"
  }
}

Write-Output ""

# Test 3: No city provided for maize
Write-Output "Test 3: No city provided (should fail)"
$body3 = @{
  latitude = 31.5
  longitude = 74.3
  crop = 'maize'
  analysis_date = '2026-05-15'
} | ConvertTo-Json

try {
  $res3 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body3
  Write-Output "  ERROR: Should have been rejected"
} catch {
  if ($_.ErrorDetails.Message -match "city is required for maize") {
    Write-Output "  PASS: Got expected error about missing city"
  } else {
    Write-Output "  Got error: $($_.ErrorDetails.Message)"
  }
}
