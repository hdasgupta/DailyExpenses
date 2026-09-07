function saveReport(name, filters, sorts, groups, summaries, overwrite = false) {
    const obj = {}
    const rowIndex = searchName(name)
    if(rowIndex != -1 && !overwrite) {
        var alternativeNameSuffixIndex = 2
        var alternativeName = ""
        do {
            alternativeName = name + " ["+alternativeNameSuffixIndex+"]"
            alternativeNameSuffixIndex++
        } while(searchName(alternativeName) != -1)
        obj["overwrite"] = name
        obj["alternativeName"] = alternativeName
    } else {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SavedFilters");
        const lastRowIndex = overwrite ? rowIndex :  sheet.getLastRow() + 1
        sheet.getRange("A"+lastRowIndex).setValue(name)
        sheet.getRange("B"+lastRowIndex).setValue(JSON.stringify(filters))
        sheet.getRange("C"+lastRowIndex).setValue(JSON.stringify(sorts))
        sheet.getRange("D"+lastRowIndex).setValue(JSON.stringify(groups))
        sheet.getRange("E"+lastRowIndex).setValue(JSON.stringify(summaries))
        
        obj["savedName"] = name
    }
     
    return obj
}

function searchName(name) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SavedFilters");
    var rowIndex = 2;
    
    while(sheet.getRange("A" + rowIndex).getValue()) {
        if(sheet.getRange("A" + rowIndex).getValue() == name) {
            return rowIndex
        }
        rowIndex++;
    }
    
    return -1
}

function getSavedFilterNames() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SavedFilters");
    var rowIndex = 2;
    const filterNames = []
    
    while(sheet.getRange("A" + rowIndex).getValue()) {
        filterNames.push(sheet.getRange("A" + rowIndex).getValue())
        rowIndex++;
    }
    
    return filterNames
}

function removeFilterRow(name) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SavedFilters");
    
    sheet.deleteRow(searchName(name))
    
    return getSavedFilterNames()
}

function getFilterRow(name) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SavedFilters");
    const rowIndex = searchName(name)
    const obj = {}
    obj["filters"] = JSON.parse(sheet.getRange("B"+rowIndex).getValue())
    obj["sorts"] = JSON.parse(sheet.getRange("C"+rowIndex).getValue())
    obj["groups"] = JSON.parse(sheet.getRange("D"+rowIndex).getValue())
    obj["summaries"] = JSON.parse(sheet.getRange("E"+rowIndex).getValue())
    return obj
}