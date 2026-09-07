var BACKUP_FOLDER_ID = getNotes().BackupFolderId;
function backup(filters) {
    const data = getDataOfFilter(filters, [], [], [], false).data
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Expenses");
    var backupSheetId = getNotes().BackupFileId;
  var backupSpreadsheet = SpreadsheetApp.openById(backupSheetId);
  
  // 2. Select the specific tab/sheet by name
  var backupSheet = backupSpreadsheet.getSheetByName("Expenses");

    for(row in data) {
        for(timeStamp in data[row]) {
            const rowIndex = getRowIndex(sheet, timeStamp) 
            const backupRowIndex = backupSheet. getLastRow() + 1;
            backupSheet.getRange("A"+backupRowIndex+":KL"+backupRowIndex).setValues(sheet.getRange("A"+rowIndex+":L"+rowIndex).getValues()) 
            sheet.deleteRow(rowIndex)
            moveProofToBackup(timeStamp+"Z.jpg")
        }
    }
    
    sortFixedRange(backupSheet)
    return true
}

function move(srcFilderId, destFolderId, fileName) {
    var folder = DriveApp.getFolderById(srcFilderId);
    var files = folder.getFilesByName(fileName);
  
    if(files.hasNext()) {
        var file = files.next();
        var targetFolder = DriveApp.getFolderById(destFolderId);

        // Move the file to the target destination
        file.moveTo(targetFolder);
  
    }
}

function moveProofToBackup(fileName) {
    
    move(FOLDER_ID, BACKUP_FOLDER_ID, fileName) 

}

function restoreProofFromBackup(fileName) {
    
    move(BACKUP_FOLDER_ID,  FOLDER_ID, fileName) 

}

function backupSearch(filters) {
    var backupSheetId = getNotes().BackupFileId;
  var backupSpreadsheet = SpreadsheetApp.openById(backupSheetId);
  
  // 2. Select the specific tab/sheet by name
  var backupSheet = backupSpreadsheet.getSheetByName("Expenses");
    return getDataFilterOfSheet(backupSheet, filters, [], [], [], false)
}

function restore(filters) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Expenses");
    var backupSheetId = getNotes().BackupFileId;
  var backupSpreadsheet = SpreadsheetApp.openById(backupSheetId);
  
  // 2. Select the specific tab/sheet by name
  var backupSheet = backupSpreadsheet.getSheetByName("Expenses");

    const data = backupSearch(filters).data
    for(rowIndex in data) {
        for(timeStamp in data[rowIndex]) {
            
           const backupRowIndex = getRowIndex(backupSheet, timeStamp) 
           
           const rowIndex = sheet.getLastRow() + 1;
           sheet.getRange("A"+rowIndex+":L"+rowIndex).setValues(backupSheet.getRange("A"+backupRowIndex+":L"+backupRowIndex).getValues());
           backupSheet.deleteRow(backupRowIndex)
           restoreProofFromBackup(sheet.getRange("K"+rowIndex).getValue()+".jpg")
        }
    }
    
    sortFixedRange(sheet)
    return true
}

function purge(filter) {
    var backupSheetId = getNotes().BackupFileId;
  var backupSpreadsheet = SpreadsheetApp.openById(backupSheetId);
  
  // 2. Select the specific tab/sheet by name
  var backupSheet = backupSpreadsheet.getSheetByName("Expenses");
  const data = backupSearch(filter).data
  
  for(rowIndex in data) {
        for(timeStamp in data[rowIndex]) {
            
           const backupRowIndex = getRowIndex(backupSheet, timeStamp) 
           
           backupSheet.deleteRow(backupRowIndex)
           deleteProofFromBackup(timeStamp+"Z.jpg")
        }
    }
}

function deleteProofFromBackup(fileName) {
   var folder = DriveApp.getFolderById(BACKUP_FOLDER_ID);
   var files = folder.getFilesByName(fileName);
  
  if(files.hasNext()) {
    var file = files.next();
    Drive.Files.remove(file.getId())
  
  }
}
