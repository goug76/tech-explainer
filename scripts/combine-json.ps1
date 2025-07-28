# Set the path to the folder containing the JSON files
$inputFolder = "data\Batch Files"
$outputFile = "data\terms.json"

# Increase depth for ConvertTo-Json (PowerShell 5.1 default is only 2)
$maxDepth = 10

# Create a combined hashtable
$combined = @{}

# Loop through each .json file in the folder
Get-ChildItem -Path $inputFolder -Filter *.json | ForEach-Object {
    $fileContent = Get-Content -Raw -Path $_.FullName | ConvertFrom-Json

    foreach ($key in $fileContent.PSObject.Properties.Name) {
        if (-not $combined.ContainsKey($key)) {
            $combined[$key] = $fileContent.$key
        } else {
            Write-Warning "Duplicate key '$key' found in '$($_.Name)'. Skipping."
        }
    }
}

# Convert to JSON (expanded depth, pretty-printed)
$json = $combined | ConvertTo-Json -Depth $maxDepth

# Force UTF8 without BOM (works well across tools like VS Code and Netlify)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outputFile, $json, $utf8NoBom)

Write-Host "✅ terms.json written successfully to: $outputFile"
