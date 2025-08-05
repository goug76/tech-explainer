Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Load or initialize terms.json
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $scriptDir "terms.json"
$terms = @{}

if (Test-Path $jsonPath) {
    try {
        $jsonText = Get-Content $jsonPath -Raw
        Write-Host "terms.json content length: $($jsonText.Length)"
        
        if (-not [string]::IsNullOrWhiteSpace($jsonText)) {
            $parsed = $jsonText | ConvertFrom-Json
            if ($parsed.PSObject.Properties.Count -gt 0) {
                $terms = $parsed
                Write-Host "Loaded terms:"
                $terms.PSObject.Properties.Name | ForEach-Object { Write-Host "- $_" }
            } else {
                Write-Host "Parsed JSON is empty or has no top-level keys."
            }
        } else {
            Write-Host "terms.json is empty."
        }
    } catch {
        Write-Host "ERROR: Failed to parse terms.json - $_"
        [System.Windows.Forms.MessageBox]::Show("Failed to parse terms.json. See console.")
    }
} else {
    Write-Host "terms.json not found at $jsonPath"
    [System.Windows.Forms.MessageBox]::Show("terms.json file not found.")
}

function Show-TermEditor {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Tech Decoded Term Editor"
    $form.Size = New-Object System.Drawing.Size(860, 620)
    $form.StartPosition = "CenterScreen"

    # Term Selector
    $comboBox = New-Object System.Windows.Forms.ComboBox
    $comboBox.Location = [System.Drawing.Point]::new(10, 10)
    $comboBox.Size = [System.Drawing.Size]::new(400, 25)
    $comboBox.DropDownStyle = 'DropDown'
    if ($terms -and $terms.Keys.Count -gt 0) {
        $comboBox.Items.AddRange(($terms.Keys | Sort-Object))
    }
    $form.Controls.Add($comboBox)

    # JSON Box
    $jsonBox = New-Object System.Windows.Forms.TextBox
    $jsonBox.Location = [System.Drawing.Point]::new(420, 40)
    $jsonBox.Size = [System.Drawing.Size]::new(410, 480)
    $jsonBox.Multiline = $true
    $jsonBox.ScrollBars = 'Vertical'
    $jsonBox.Font = New-Object System.Drawing.Font("Consolas", 9)
    $form.Controls.Add($jsonBox)

    # Fields
    $fieldNames = @("eli5", "boss", "sysadmin", "emoji", "use_case", "jargon_score", "level", "categories", "related")
    $fieldBoxes = @{}

    for ($i = 0; $i -lt $fieldNames.Count; $i++) {
        $label = New-Object System.Windows.Forms.Label
        $label.Text = $fieldNames[$i]
        $label.Location = [System.Drawing.Point]::new(10, 45 + ($i * 50))
        $label.Size = [System.Drawing.Size]::new(100, 30)
        $form.Controls.Add($label)

        $box = New-Object System.Windows.Forms.TextBox
        $box.Location = [System.Drawing.Point]::new(120, 40 + ($i * 50))
        $box.Size = [System.Drawing.Size]::new(280, 30)
        $form.Controls.Add($box)
        $fieldBoxes[$fieldNames[$i]] = $box
    }

    # Populate fields on selection
    $comboBox.Add_SelectedIndexChanged({
        $term = $comboBox.Text
        if ($terms.ContainsKey($term)) {
            $data = $terms[$term]
            foreach ($name in $fieldNames) {
                $val = $data.$name
                if ($val -is [System.Collections.IEnumerable] -and $val -isnot [string]) {
                    $fieldBoxes[$name].Text = ($val -join ", ")
                } else {
                    $fieldBoxes[$name].Text = "$val"
                }
            }
        }
    })

    # Parse JSON button
    $btnParse = New-Object System.Windows.Forms.Button
    $btnParse.Text = "Parse JSON"
    $btnParse.Location = [System.Drawing.Point]::new(420, 530)
    $btnParse.Size = [System.Drawing.Size]::new(180, 30)
    $btnParse.Add_Click({
        try {
            $clean = $jsonBox.Text -replace '[“”]', '"' -replace '[‘’]', "'" -replace '[\u200B-\u200D\uFEFF]', ''
            $parsed = $clean | ConvertFrom-Json
            $termKey = $parsed.PSObject.Properties.Name[0]
            $termData = $parsed.$termKey

            if (-not $comboBox.Items.Contains($termKey)) {
                [void]$comboBox.Items.Add($termKey)
            }
            $comboBox.Text = $termKey

            foreach ($name in $fieldNames) {
                $val = $termData.$name
                if ($val -is [System.Collections.IEnumerable] -and $val -isnot [string]) {
                    $fieldBoxes[$name].Text = ($val -join ", ")
                } else {
                    $fieldBoxes[$name].Text = "$val"
                }
            }
        } catch {
            [System.Windows.Forms.MessageBox]::Show("Invalid JSON format. Validate first.")
        }
    })
    $form.Controls.Add($btnParse)

    # Save button
    $btnSave = New-Object System.Windows.Forms.Button
    $btnSave.Text = "Save"
    $btnSave.Location = [System.Drawing.Point]::new(620, 530)
    $btnSave.Size = [System.Drawing.Size]::new(100, 30)
    $btnSave.Add_Click({
        $key = $comboBox.Text.Trim()
        if (-not $key) {
            [System.Windows.Forms.MessageBox]::Show("Please enter or select a term key.")
            return
        }

        $newEntry = @{}
        foreach ($name in $fieldNames) {
            $text = $fieldBoxes[$name].Text.Trim()
            if ($name -in @("categories", "related")) {
                $newEntry[$name] = $text -split "\s*,\s*"
            } elseif ($name -eq "jargon_score") {
                $newEntry[$name] = [int]$text
            } else {
                $newEntry[$name] = $text
            }
        }

        $terms[$key] = $newEntry

        $terms | ConvertTo-Json | Set-Content -Encoding UTF8 -Path $jsonPath

        if (-not $comboBox.Items.Contains($key)) {
            [void]$comboBox.Items.Add($key)
        }

        [System.Windows.Forms.MessageBox]::Show("Saved successfully.")
    })
    $form.Controls.Add($btnSave)

    $form.ShowDialog()
}

Show-TermEditor
