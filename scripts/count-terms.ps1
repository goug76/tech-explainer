# PowerShell Script: Count total terms and aliases in terms.json

# Set path to terms.json (adjust if needed)
$termsFile = "data\terms.json"

# Check if the file exists
if (-Not (Test-Path $termsFile)) {
    Write-Error "File not found: $termsFile"
    exit 1
}

# Load and parse JSON
$jsonText = Get-Content $termsFile -Raw
$termsData = $jsonText | ConvertFrom-Json

# Initialize counters
$totalTerms = 0
$totalAliases = 0

foreach ($term in $termsData.PSObject.Properties.Name) {
    $entry = $termsData.$term
    $totalTerms++

    if ($entry.aliases -and $entry.aliases.Count -gt 0) {
        $totalAliases += $entry.aliases.Count
    }
}

# Output results
Write-Host "Total Terms: " + $totalTerms
Write-Host "Total Aliases: " + $totalAliases
