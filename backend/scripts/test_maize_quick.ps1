$body = @{
  latitude = 31.550
  longitude = 74.344
  city = 'Lahore'
  crop = 'maize'
  analysis_date = '2026-05-15'
} | ConvertTo-Json -Depth 10

$res = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body

# Extract key fields
$output = [PSCustomObject]@{
  crop = $res.crop
  city = $res.city
  stage = $res.growth_stage.name
  status = $res.status
  rec_count = $res.recommendations.Count
  first_rec_type = if ($res.recommendations -and $res.recommendations.Count -gt 0) { $res.recommendations[0].type } else { 'none' }
  first_rec_priority = if ($res.recommendations -and $res.recommendations.Count -gt 0) { $res.recommendations[0].priority } else { 'none' }
}

Write-Output "=== MAIZE ANALYSIS TEST (Lahore, May) ==="
$output | Format-Table -AutoSize
Write-Output ""
Write-Output "Full recommendations count: $($res.recommendations.Count)"
if ($res.recommendations -and $res.recommendations.Count -gt 0) {
  Write-Output ""
  Write-Output "Recommendation Details:"
  $res.recommendations | Format-Table -Property type, priority, category -AutoSize
}
