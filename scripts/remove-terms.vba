Sub RemoveTermsFromTabs_Cleanly()
    Dim ws As Worksheet
    Dim removeSheet As Worksheet
    Dim removeDict As Object
    Dim lastRow As Long
    Dim term As String
    Dim row As Long, col As Long
    Dim maxCol As Long
    Dim changed As Boolean

    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    Set removeSheet = ThisWorkbook.Sheets("RemoveList")
    Set removeDict = CreateObject("Scripting.Dictionary")

    ' Load terms to remove (case-insensitive)
    lastRow = removeSheet.Cells(removeSheet.Rows.Count, 1).End(xlUp).Row
    For row = 1 To lastRow
        term = Trim(LCase(removeSheet.Cells(row, 1).Value))
        If term <> "" Then removeDict(term) = 1
    Next row

    ' Loop through all sheets except Raw and RemoveList
    For Each ws In ThisWorkbook.Sheets
        If ws.Name <> "Raw" And ws.Name <> "RemoveList" Then
            lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
            maxCol = 10 ' columns A–J

            ' Bottom-up row scan
            For row = lastRow To 2 Step -1 ' skip header
                changed = True
                ' Repeat scan of the row until no matches are left (for shifting cells)
                Do While changed
                    changed = False
                    For col = 1 To maxCol
                        term = Trim(ws.Cells(row, col).Value)
                        If term <> "" Then
                            If removeDict.exists(LCase(term)) Then
                                ws.Cells(row, col).Delete Shift:=xlUp
                                changed = True ' rerun the row after cell shift
                                Exit For ' exit to rescan row
                            End If
                        End If
                    Next col
                Loop
            Next row
        End If
    Next ws

    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic

    MsgBox "All listed terms removed cleanly, and cells shifted up!", vbInformation
End Sub
