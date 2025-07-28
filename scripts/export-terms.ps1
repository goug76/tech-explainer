# Define paths
$jsonPath = "data\terms.json"
$termsOutput = "scripts\terms.txt"
$missingOutput = "scripts\missing_terms.txt"

# Load JSON
$termsData = Get-Content $jsonPath -Raw | ConvertFrom-Json

# Get all defined terms (keys in JSON)
$definedTerms = $termsData.PSObject.Properties.Name | ForEach-Object { $_.ToLower() }
$definedTerms | Sort-Object | Out-File $termsOutput -Encoding UTF8

# Collect all related terms, flatten the list
$relatedTerms = @()

foreach ($term in $termsData.PSObject.Properties) {
    $related = $term.Value.related
    if ($related) {
        $relatedTerms += $related | ForEach-Object { $_.ToLower() }
    }
}

# Remove duplicates
$uniqueRelatedTerms = $relatedTerms | Sort-Object -Unique

# Compare related terms against defined terms
$missingTerms = $uniqueRelatedTerms | Where-Object { $_ -notin $definedTerms }

# Output
$missingTerms | Sort-Object | Out-File $missingOutput -Encoding UTF8

Write-Host "✅ Generated: terms.txt and missing_terms.txt"