$ErrorActionPreference = 'Stop'

$health = Invoke-RestMethod -Method Get -Uri "http://localhost:5001/health"

$cities = @(
  @{ name = 'Faisalabad'; lat = 31.418; lon = 73.079 },
  @{ name = 'Lahore';     lat = 31.550; lon = 74.344 },
  @{ name = 'Multan';     lat = 30.157; lon = 71.524 },
  @{ name = 'Sargodha';   lat = 32.083; lon = 72.671 },
  @{ name = 'Bahawalpur'; lat = 29.395; lon = 71.672 }
)

$dates = @(
  '2026-03-15',
  '2026-05-15',
  '2026-07-15',
  '2026-08-15',
  '2026-10-15'
)

$rows = @()

foreach ($c in $cities) {
  foreach ($d in $dates) {
    $body = @{
      latitude = $c.lat
      longitude = $c.lon
      city = $c.name
      crop = 'maize'
      analysis_date = $d
    } | ConvertTo-Json -Depth 10

    try {
      $res = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/satellite/analyze" -ContentType "application/json" -Body $body
      $stage = if ($res.growth_stage) { $res.growth_stage.name } else { '' }
      $topType = if ($res.recommendations -and $res.recommendations.Count -gt 0) { $res.recommendations[0].type } else { '' }
      $topAction = if ($res.recommendations -and $res.recommendations.Count -gt 0) { $res.recommendations[0].action } else { '' }

      $rows += [PSCustomObject]@{
        city = $c.name
        date = $d
        status = $res.status
        stage = $stage
        top_recommendation = $topType
        top_action = $topAction
      }
    }
    catch {
      $err = $_.Exception.Message
      if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
        $err = $_.ErrorDetails.Message
      }

      $rows += [PSCustomObject]@{
        city = $c.name
        date = $d
        status = 'error'
        stage = ''
        top_recommendation = ''
        top_action = $err
      }
    }
  }
}

Write-Output ("ML health: " + $health.status)
$rows | Sort-Object city, date | ConvertTo-Json -Depth 8
