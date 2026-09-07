const FOLDER_ID = getNotes()["FolderId"];

function save(timeStamp, date, share, category, item, qty, unit, price, expenseType, comment, base64Data) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Expenses");
        const currentTime = new Date();
        const user = getUser();
        const data = [date.replaceAll('-', ','), share, category, item, qty, unit, price, expenseType, comment, user, currentTime.toISOString()];
        const row = timeStamp? getRowIndex(sheet, timeStamp) : sheet.getLastRow() + 1;
        const error = verify(share, item, qty, unit, price)
        
        if(!error) {
            if(base64Data != null) {
                data. push(saveProof(base64Data, data[data.length - 1]+".jpg")) 
            }
            for(index in data) {
       
                const column = convertNumToLetter(Number(index) + 1);
                const range = sheet. getRange(column + row)
                range.setValue(data[index])
            }
            
           sortFixedRange(sheet);
            
            
    
            const output = {}

            data[0] = data[0].replaceAll(',', '-')
    
            output["row_"+row] = data
            
            return ""
        } else {
            return error
        }
    } catch(e) {
        return e.message;
    }
    
}

async function sortFixedRange(sheet) {
  
  const range = sheet.getRange("A2:K" + sheet. getLastRow());

  // Sort by Column 1 (A) Ascending, then Column 2 (B) Descending
  range.sort([
    { column: 1, ascending: true }
  ]);
}

function saveProof(base64Data, fileName) {
    if(base64Data == null) {
    
        return false
    }
    var data = Utilities.base64Decode(base64Data.split(',')[1]);
    var blob = Utilities.newBlob(data, MimeType.JPEG, fileName);
    var folder = DriveApp.getFolderById(FOLDER_ID);
    deleteProof(fileName) 
    var file = folder.createFile(blob);
    
    return file.getId() 
}

function verify(share, item, qty, unit, price) {
    if(!share) {
        return "You must have share"
    }
    if(!item) {
        return "Item can't be blank"
    }
    if(!qty && item != "Total") {
        return "Quantity can't be zero or blank"
    }
    if(Number(qty) <= 0 && item != "Total") {
        return "Quantity can't be zero or negative"
    }
    if(!unit && item != "Total") {
        return "Unit can't be blank"
    }
    if(! price) {
        return "Price can't be zero or blank"
    }
    if(Number(price) <= 0) {
        return "Price can't be zero or negative"
    }
    
    return ""
}
function flattenShare(share) {
    var fixedShare = [];
    var avgShare = []
    if(!verifyShare(share).success) {
        return "<error>";
    }
    for(index in share) {
        switch(share[index].type){
            case "fixed":
                fixedShare.push(share[index].name + "|" + share[index].amount);
                break;
            case "remaining":
                fixedShare.push(share[index].name + "|~");
                break;
            case "full":
            case "avg":
                avgShare.push(share[index].name);
                break;
            default:
                
        }
        
    }
    const avg = (100.00/avgShare.length).toFixed(2);
    var str = fixedShare.join(",")
    if(str && avgShare.length) {
        str += ","
    }
    str += avgShare.map((name)=>{
        return name + "|" + avg + "%";
    }).join(",")
    
    return str;
}

function verifyShare(share) {
    const dist = {
        full: 0,
        fixed: 0,
        remaining: 0,
        avg: 0
    };
    const names = {};
    const verification = {
        success: true, 
        message: " Verification Successful"
    }
    for(index in share) {
        dist[share[index].type]++
        
        if(!names[share[index].name]) {
            names[share[index].name] = 1;
        } else {
            names[share[index].name]++
        }
        
        if(share[index].type == "fixed") {
            if(!share[index].amount || share[index].amount<= 0) {
                verification.success = false;
                verification.message = "Fixed share amount must be a positive value"
        
                return verification;
            }
        }
    }
    
    for(name in names) {
        if(names[name]>1) {
            verification.success = false;
            verification.message = `Name "${name}" appeared more than once`
        
            return verification;
        }
    }
    
    if(share.length == 0) {
        verification.success = false;
            verification.message = "No share added";
        
            return verification;
    }
    
    if(dist.full > 1) {
        verification.success = false;
        verification.message = "Full Share can't be distributed to more than one person"
        
        return verification;
    }
    
    if(dist.fixed > 0) {
    
        if(dist.remaining > 1) {
            verification.success = false;
        verification.message = "Remaining share can't be distributed to more than one person"
        
        return verification;
        }
        
        if(dist.fixed == 1 && (dist.remaining + dist.avg) == 0) {
            verification.success = false;
        verification.message = "if you have 1 fixed share, you must have atleast 1 remaining or average share"
        
        return verification;
        }
    }
    
    if(dist.full == 1 && (dist.fixed + dist.remaining + dist.avg) > 0 ) {
        verification.success = false;
        verification.message = "if you have full share, you cant have other share"
        
        return verification;
    }
    
    if(dist.remaining > 1) {
        verification.success = false;
        verification.message = "Remaining share can't be more than 1"
        
        return verification;
    }
    
    if(dist.remaining == 1) {
        if(dist.fixed == 0) {
            verification.success = false;
        verification.message = "Remaining share without fixed share not possible"
        
        return verification;
        }
        
        if(dist.avg > 0) {
            verification.success = false;
        verification.message = "Remaining and average share can't stay together"
        
        return verification;
        }
    }
    
    
    return verification;
}


function deleteRow(timeStamp) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Expenses");
    console.log("timeStamp = "+timeStamp) 
    const rowIndex = getRowIndex(sheet, timeStamp) 
    console.log("rowIndex = "+rowIndex) 
    if(rowIndex> 0) {
    
        const output = {
            success: true, 
            message: "Delete Successful", 
            timeStamp: timeStamp
        }
        const fileName = timeStamp + "Z.jpg"
        deleteProof(fileName)
    
        sheet.deleteRow(rowIndex);
        
        return output;
   } else {
        const output = {
            success: false, 
            message: "Data not found", 
            timeStamp: timeStamp
        }
        
        return output;
   }
    
}

function getRowIndex(sheet, timeStamp) {
    var rowIndex = 2
    var range = sheet.getRange("K"+rowIndex) 
    
    while(range.getValue()) {
        console.log(range.getValue() +" "+timeStamp) 
        if(range.getValue().split("Z")[0]=== timeStamp) {
            return rowIndex;
        }
        rowIndex++
        range = sheet.getRange("K"+rowIndex)
    }
    return -1
}

function deleteProof(fileName) {
   var folder = DriveApp.getFolderById(FOLDER_ID);
   var files = folder.getFilesByName(fileName);
  
  if(files.hasNext()) {
    var file = files.next();
    Drive.Files.remove(file.getId())
  
  }
}
