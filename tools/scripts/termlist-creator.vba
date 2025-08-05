Sub CleanAndBuildSortedRaw_CaseInsensitive()
    Dim ws As Worksheet
    Dim rawSheet As Worksheet
    Dim regex As Object
    Dim masterDict As Object
    Dim sheetDict As Object
    Dim term As String, normalized As Variant
    Dim i As Long, j As Long
    Dim lastRow As Long
    Dim destRow As Long

    ' Regex to remove (stuff in parentheses)
    Set regex = CreateObject("VBScript.RegExp")
    With regex
        .Global = True
        .IgnoreCase = True
        .Pattern = "\s*\([^)]*\)"
    End With

    ' Dictionary for master list (key = lowercase term, value = original casing)
    Set masterDict = CreateObject("Scripting.Dictionary")

    ' Clear Raw sheet
    Set rawSheet = ThisWorkbook.Sheets("Raw")
    rawSheet.Cells.Clear
    destRow = 1

    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    ' Loop all sheets except Raw and RemoveList
    For Each ws In ThisWorkbook.Sheets
        If ws.Name <> "Raw" And ws.Name <> "RemoveList" Then
            Set sheetDict = CreateObject("Scripting.Dictionary")
            lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row

            For i = 2 To lastRow ' skip headers
                For j = 1 To 10
                    term = Trim(ws.Cells(i, j).Value)

                    If term <> "" Then
                        ' Clean parentheses and trim again
                        If regex.test(term) Then term = regex.Replace(term, "")
                        term = Trim(term)

                        ' Normalize term for comparison (case-insensitive)
                        normalized = LCase(term)

                        ' If term is duplicate within sheet, clear it
                        If sheetDict.exists(normalized) Then
                            ws.Cells(i, j).ClearContents
                        Else
                            sheetDict.Add normalized, 1

                            ' Add to master list if it's new across all sheets
                            If Not masterDict.exists(normalized) Then
                                masterDict.Add normalized, term
                            End If
                        End If
                    End If
                Next j
            Next i
        End If
    Next ws

    ' Write master list (original casing) to Raw
    For Each normalized In masterDict.Keys
        rawSheet.Cells(destRow, 1).Value = masterDict(normalized)
        destRow = destRow + 1
    Next normalized

    ' Sort Raw list alphabetically (preserving original casing)
    If destRow > 1 Then
        With rawSheet.Sort
            .SortFields.Clear
            .SortFields.Add Key:=rawSheet.Range("A1:A" & destRow - 1), _
                SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNormal
            .SetRange rawSheet.Range("A1:A" & destRow - 1)
            .Header = xlNo
            .Apply
        End With
    End If

    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic

    MsgBox "Case-insensitive cleanup complete. Master list created and sorted in 'Raw'!", vbInformation
End Sub
