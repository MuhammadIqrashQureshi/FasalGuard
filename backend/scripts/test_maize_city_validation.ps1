Write-Output "Testing Maize City Validation:"
Write-Output ""

$body = @{
  latitude = 31.5
  longitude = 74.3
  city = 'InvalidCity'
  crop = 'maize'
  analysis_date = '2026-05-15'
} | ConvertTo-Json

try {
  $res = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body
  Write-Output "ERROR: Should have rejected invalid city, but got response"
  Write-Output $res
} catch {
  $msg = $_.ErrorDetails.Message
  if ($msg -match "not configured for maize|not one of:|Faisalabad|Lahore|Multan|Sargodha|Bahawalpur") {
    Write-Output "PASS: Properly rejected with error message:"
    Write-Output $msg
  } else {
    Write-Output "ERROR: Got unexpected error:"
    Write-Output $msg
  }
}
