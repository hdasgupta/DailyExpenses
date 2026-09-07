
const months = [
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December"
];

const options = {
    "year": getYearOptions(), 
    "month": getMonthOptions(), 
    "stakeholder": getStakeholders().map((name)=>{
        const option = {
            value: name, 
            label: name
        }
        return option
    }), 
    "category": getCategories().map((category)=>{
        const option = {
            value: category, 
            label: category
        }
        
        return option
    }), 
}






function getYearOptions() {
    const year = new Date().getFullYear()
    const length = 6
    return Array.from({ length }, (_, i) => year - 5 + i).map((y) => {
        const option = {
            value: y, 
            label: y
        }
        return option
    });
}

function getMonthOptions() {
    return months.map((month, index)=>{
        const option = {
            value: index, 
            label: month
        }
        return option
    })
}




function getStakeholders() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stakeholders");
    
    return sheet.getRange("A2:C"+sheet.getLastRow()). getValues().filter((row) => row[2]).map((row) => row[0]) 
    
}

function getUser() {
    return Session.getActiveUser().getEmail();
}

function getUsers() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
    
    return sheet.getRange("A2:A"+sheet.getLastRow()).getValues(). map((row) => row[0]) 
    
}

function getEmailUsers() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
    var rowIndex = 2;
    var users = []
    return sheet.getRange("A2:C"+sheet.getLastRow()). getValues().filter((row) => row[2]).map((row) => row[0])
    
}

function getRole() {
    const user = getUser();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
    var rowIndex = 2;
    const role = sheet.getRange("A2:B"+sheet.getLastRow()). getValues(). filter((row) => row[0] == user)
    if(role.length) {
        return role[0][1]
    }
    
    return "Guest";
}

function getFullUserName() {
  try {
    var people = People.People.get('people/me', {
      personFields: 'names'
    });
    
    var fullName = people.names[0].displayName;
    
    console.log(fullName)
    
    return fullName + " ("+ getRole()+")";
  } catch (e) {
    console.log(e.message)
    return getRole(); // Fallback to email
  }
}

function getRoles() {
    const roles = {}
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Roles");
    
    sheet.getRange("A2:B"+sheet.getLastRow()). getValues(). forEach((row) => roles[row[0]] = row[1].split(",")) 
    
    return roles;
}

function getPermissions() {
    return getRoles()[getRole()]
}

function getDates(currentDate) {
    var date;
    if(currentDate) {
        date = new Date(currentDate)
    } else {
        date = new Date()
    }
    //date.setHours(5, 30, 0)
    const tomorrow = new Date(date.getTime())
    const yesterday = new Date(date.getTime())
    
    tomorrow.setDate(tomorrow.getDate() + 1)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const dateObj = {
        prevDay: toYYYYMMDDFormat(yesterday), 
        currDay: toYYYYMMDDFormat(date), 
        nextDay: toYYYYMMDDFormat(tomorrow)
    }
    
    return dateObj;
}

function getNotes() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Notes");
    var rowIndex = 1;
    const notes = {}
    
    sheet. getRange("A1:B"+sheet.getLastRow()). getValues(). forEach((row) => notes[row[0]] = row[1]) 
    
    console.log(JSON.stringify(notes))
    return notes;
}

function getLogo() {
  
  const fileId = getNotes().LogoBase64FileId;
  
  // Get the file blob from Drive
  const file = DriveApp.getFileById(fileId);
  const blob = file.getBlob();
  
  // Convert blob directly to Base64 string
  const base64String = "data:" + blob.getContentType() + ";base64," + Utilities.base64Encode(blob.getBytes());
  
  return base64String;

}

function getToday() {
    const dateObj = getDates(); 
    const today = {
        yest: dateObj.prevDay, 
        today: dateObj. currDay, 
        tomm: dateObj.nextDay
    }
    
    return today
}

function getCategories() {
    const categories = []
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ItemList");
    
    var currentRange = sheet.getRange("A1")
    while(currentRange.getValue()) {
        categories.push(currentRange.getValue())
        currentRange = currentRange.offset(0, 1)
    }
    
    return categories;
}

function getItems(category) {
    const categories = getCategories();
    const columnIndex = categories.indexOf(category) + 1;
    const items = ["Total"];
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ItemList");
    var currentRange = sheet.getRange(convertNumToLetter(columnIndex) + "2")
    while(currentRange.getValue()) {
        items.push(currentRange.getValue())
        currentRange = currentRange.offset(1, 0)
    }
    items.push("Other");
    ;
    
    return items;
}

function getVariable(name) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Variables");
    var currentRange = sheet.getRange("A1")
    const values = [];
    while(currentRange.getValue()) {
        if(currentRange.getValue() == name) {
            break;
        }
        currentRange = currentRange.offset(0, 1)
    }
    
    if(currentRange.getValue() == name) {
        currentRange = currentRange.offset(1, 0);
        while(currentRange.getValue()) {
            values.push(currentRange.getValue())
            currentRange = currentRange.offset(1, 0)
        }
    }
    
    return values;
}

function getUnits() {
    const units = getVariable("Unit");
    units.push("Other");
    return units;
}

function getExpenseTypes() {
    return getVariable("Expenses Type")
}

function convertNumToLetter(colNum) {
    var temp;
    var letter = "";
    console. log()
    while (colNum > 0) {
        temp = (colNum - 1) % 26;
        letter = String.fromCharCode(65 + temp) + letter;
        colNum = (colNum - temp - 1) / 26;
    }
    return letter;
}


function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
