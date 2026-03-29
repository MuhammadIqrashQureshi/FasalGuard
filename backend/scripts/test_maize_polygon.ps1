$body = @{
  latitude = 31.550
  longitude = 74.344
  city = 'Lahore'
  crop = 'maize'
  analysis_date = '2026-05-15'
  field_polygon = @(
    @{ lat = 31.545; lon = 74.340 },
    @{ lat = 31.555; lon = 74.340 },
    @{ lat = 31.555; lon = 74.348 },
    @{ lat = 31.545; lon = 74.348 }
  )
} | ConvertTo-Json -Depth 10

$res = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body

# Extract key fields
$output = [PSCustomObject]@{
  crop = $res.crop
  city = $res.city
  status = $res.status
  stage = $res.growth_stage.name
  rec_count = $res.recommendations.Count
  health_score = $res.field_report.health_score
  first_rec_type = if ($res.recommendations -and $res.recommendations.Count -gt 0) { $res.recommendations[0].type } else { 'none' }
  first_rec_priority = if ($res.recommendations -and $res.recommendations.Count -gt 0) { $res.recommendations[0].priority } else { 'none' }
}

Write-Output "=== MAIZE POLYGON TEST (Lahore, May) ==="
$output
Write-Output ""
Write-Output "Full recommendations:"
if ($res.recommendations -and $res.recommendations.Count -gt 0) {
  foreach ($rec in $res.recommendations) {
    Write-Output "  - $($rec.type) [$($rec.priority)] (category: $($rec.category))"
  }
} else {
  Write-Output "  (none)"
}
