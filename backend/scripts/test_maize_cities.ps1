Write-Output "Testing Maize Analysis:"
Write-Output ""

# Test maize in Faisalabad (agricultural area)
$body = @{
  latitude = 31.418
  longitude = 73.079
  city = 'Faisalabad'
  crop = 'maize'
  analysis_date = '2026-06-15'
  field_polygon = @(
    @{ lat = 31.410; lon = 73.070 },
    @{ lat = 31.426; lon = 73.070 },
    @{ lat = 31.426; lon = 73.088 },
    @{ lat = 31.410; lon = 73.088 }
  )
} | ConvertTo-Json -Depth 10

Write-Output "Request: Faisalabad, June (Vegetative/Tasseling)"
try {
  $res = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body
  
  Write-Output "Status: $($res.status)"
  Write-Output "Crop: $($res.crop)"
  Write-Output "City: $($res.city)"
  Write-Output "Stage: $($res.growth_stage.name)"
  Write-Output "Health Score: $($res.field_report.health_score)"
  Write-Output "Recommendations: $($res.recommendations.Count)"
  Write-Output ""
  
  if ($res.recommendations -and $res.recommendations.Count -gt 0) {
    Write-Output "Top 3 Recommendations:"
    $res.recommendations | Select-Object -First 3 | ForEach-Object {
      Write-Output "  [$($_.priority)] $($_.type) - $($_.category)"
      Write-Output "    Action: $($_.action.Substring(0, [math]::Min(80, $_.action.Length)))..."
    }
  }
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
  if ($_.ErrorDetails) { Write-Output "Details: $($_.ErrorDetails.Message)" }
}

Write-Output ""
Write-Output "---"
Write-Output ""

# Test maize in Multan with different date
$body2 = @{
  latitude = 30.157
  longitude = 71.524
  city = 'Multan'
  crop = 'maize'
  analysis_date = '2026-08-15'
  field_polygon = @(
    @{ lat = 30.150; lon = 71.515 },
    @{ lat = 30.164; lon = 71.515 },
    @{ lat = 30.164; lon = 71.533 },
    @{ lat = 30.150; lon = 71.533 }
  )
} | ConvertTo-Json -Depth 10

Write-Output "Request: Multan, August (Grain Filling)"
try {
  $res2 = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body2
  
  Write-Output "Status: $($res2.status)"
  Write-Output "Crop: $($res2.crop)"
  Write-Output "City: $($res2.city)"
  Write-Output "Stage: $($res2.growth_stage.name)"
  Write-Output "Health Score: $($res2.field_report.health_score)"
  Write-Output "Recommendations: $($res2.recommendations.Count)"
  Write-Output ""
  
  if ($res2.recommendations -and $res2.recommendations.Count -gt 0) {
    Write-Output "Top recommendation:"
    $rec = $res2.recommendations[0]
    Write-Output "  Type: $($rec.type)"
    Write-Output "  Category: $($rec.category)"
    Write-Output "  Priority: $($rec.priority)"
  }
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
}
