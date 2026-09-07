const availableFilters = {
    "Date": {
        multiple: false, 
        checker: checkDate, 
        fields: [
            {
                label: "On", 
                name: "on", 
                type: "date"
            }
        ], 
        toString: getDateString, 
        stringPriority: 2
    }, 
    "Date Range": {
        multiple: false, 
        checker: checkDateRange, 
        fields: [
            {
                label: "From", 
                name: "form", 
                type: "date"
            }, 
            {
                label: "To", 
                name: "to", 
                type: "date"
            }
        ], 
        toString: getDateRangeString, 
        stringPriority: 2
    },
    "Billing Month": {
        multiple: false, 
        checker: checkBillingDate,  
        fields: [
            {
                label: "Year", 
                name: "year", 
                type: "year"
            }, 
            {
                label: "Starting Month", 
                name: "month", 
                type: "month"
            }
        ], 
        toString: getBillingMonthString, 
        stringPriority: 2
    }, 
    "Year": {
        multiple: false, 
        checker: checkYear,  
        fields: [
            {
                label: "Year", 
                name: "year", 
                type: "year"
            }
            
        ], 
        toString: getYearString, 
        stringPriority: 2
    }, 
    "Stakeholder": {
        multiple: true, 
        checker: checkStakeholder, 
        fields: [
            {
                label: "Name", 
                name: "name", 
                type: "stakeholder"
            }
        ], 
        toString: getStakeholderString, 
        stringPriority: 0
    }, 
    "Item": {
        multiple: true, 
        checker: checkItem, 
        fields: [
            {
                label: "Category", 
                name: "category", 
                type: "category"
            }, 
            {
                label: "Item", 
                name: "item", 
                type: "item"
            }
        ], 
        toString: getItemString, 
        stringPriority: 1
    }
}

const dateFilters = Object.keys(availableFilters).filter((key)=>availableFilters[key].maxDateFilter)

const columns = [{
        title: "Date",
        indices: [0], 
        func: populateDate
    },
    {
        title: "Share",
        indices: [1],
        func: populateShare, 
        reverseFunc: dbFormatShare
    },
    {
        title: "Item",
        indices: [2, 3],
        joinBy: " >> "
    },
    {
        title: "Quantity",
        indices: [4, 5],
        joinBy: " "
    },
    {
        title: "Price",
        indices: [6, 7],
        prefix: "₹ ",
        joinBy: " "
    },
    {
        title: "Comment",
        indices: [8],
    },
    {
        title: "Added by",
        indices: [9, 10],
        joinBy: " on ", 
        hide: true
    }, 
    {
        title: "Proof",
        indices: [11],
        func: populateProof
    }
];

const columnNames = columns.filter((col) => {
    return !col.hide
}).map((col)=> {
    return col.title
})

const billingDays = getBillingDays() 

function getBillingDays() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stakeholders");
    
    
    var range = sheet.getRange("A2");
    const stakeholders = {}

    while(range.getValue()) {
        const name = range.getValue() 
        const day = Number(range.offset(0, 1).getValue())
            
        stakeholders[name] = day
        range = range.offset(1, 0);
    }
    
    return stakeholders
}

function getDateString(filters) {
    return "on " +filters["Date"][0][0].value
}

function getDateRangeString(filters) {
    return "from " +filters["Date Range"][0][0].value+" to " +filters["Date Range"][0][1].value
}

function getBillingMonthString(filters) {
    return "of " +filters["Billing Month"][0][1].value+" of "+filters["Billing Month"][0][0].value
}

function getYearString(filters) {
    return "of " +filters["Year"][0][0].value
}

function getStakeholderString(filters) {
    return "of " +filters["Stakeholder"][0][0].value+"\'s "
}

function getItemString(filters) {
    const categories = {}

    filters["Item"].forEach((filter) => {
        if(!(filter[0].value in categories)) {
            categories[filter[0].value] = []
        }
        categories[filter[0].value].push(filter[1].value) 
    }) 
    
    Object.keys(categories).forEach((category) => {
        if(categories[category].includes("Total")) {
            categories[category] = []
        }
    }) 
    
    const allItemCategories = Object.keys(categories).filter((category) => !categories[category].length)
    
    const selectedItemCategories = Object.keys(categories).filter((category) => categories[category].length).map((category) => {
        const items = categories[category]
        var str = "item"
        if(items.length>1) str+= "s "
        
        str+=addAnd(items) +" of type "+category
        return str
        
        
    })
    
    var str = "type"
    
    if(allItemCategories.length > 1) {
        str+= "s "
    }
    str+= addAnd(allItemCategories) 
        
    return "of " + addAnd([str, ...selectedItemCategories]) +" " 
}

function addAnd(arr) {
    if(arr.length>1) {
        const last = arr.at(-1) 
        return arr.slice(0, arr.length-1).join(", ") + " and "+last
    } else if(arr.length) {
        return arr[0]
    }
}

function filtersToString(filters) {
    return "Filtered data "+Object.keys(filters).sort((filter1, filter2) => availableFilters[filter1].stringPriority - availableFilters[filter2].stringPriority).map((filter) => availableFilters[filter].toString(filters)).join("") 
}

function checkDate(row, filters) {
    const date = row[0].replaceAll(',', '-')
    return date == filters["Date"][0][0].value
}

function checkDateRange(row, filters) {
    const date = row[0].replaceAll(',', '-')
    return date >= filters["Date Range"][0][0].value && date <= filters["Date Range"][0][1].value
}

function checkYear(row, filters) {
    return Number(row[0].split(",")[0]) == Number(filters["Year"][0][0].value) 
}

function checkBillingDate(row, filters) {
    var day 
    if(!filters["Stakeholder"]) {
        day = 5
    }
    else {
        const stakeholder = filters["Stakeholder"][0][0].value;
        day = stakeholders[stakeholder]
    }
    if(day) {
        const year = filters["Billing Month"][0][0].value
        const month = filters["Billing Month"][0][1].value
        const startDate = new Date(year, month, day)
        const endDate = new Date(year, month, day)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(endDate.getDate() - 1)
        const date = row[0].replaceAll(',', '-')
        return date >= toYYYYMMDDFormat(startDate) && date <= toYYYYMMDDFormat(endDate)
    }    
    return false
}

function checkStakeholder(row, filters) {
    console.log(JSON.stringify(row[1]))
    const stakeholders = filters["Stakeholder"].map((st) => st[0].value);
    const currentStakeholders = row[1].map((st)=>st.name)
    return currentStakeholders.some(stakeholders.includes(st))
}

function checkItem(row, filters) {
    const category = row[2]
    const item = row[3]
    return filters["Item"].some((r)=>r[0].value == category && (r[1].value == item || r[1].value == "Total"))
}

function getMaxDate(filters) {
    return filters["Date"][0][0].value
}

function getMaxDateRange(filters) {
    return filters["Date Range"][0][1].value
}

function getMaxBillingDate(filters) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Stakeholders");
    if(!filters["Stakeholder"]) {
        return false
    }
    const stakeholder = filters["Stakeholder"][0][0].value;
    var range = sheet.getRange("A2");
    var day = 0

    while(range.getValue()) {
        if(range.getValue() == stakeholder) {
            day = Number(range.offset(0, 1).getValue())
            break;
        }
        range = range.offset(1, 0);
    }
    
    if(day) {
        const year = filters["Billing Month"][0][0].value
        const month = filters["Billing Month"][0][1].value
        
        const endDate = new Date(year, month, day)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(endDate.getDate() - 1)
        
        return toYYYYMMDDFormat(endDate)
    } else {
        return null
    }
        
}

function populateShare(values) {
    return getShare(values[0]).join(" / ");  
}

function populateDate(values) {
   return values[0].replaceAll(",", "-") 
}

function dbFormatShare(valueStr) {
    return valueStr.replacwAll(" / ", ",").replaceAll("(", ""). replaceAll(")", "") 
}

function populateProofs() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Expenses");
    
    const lastRow = sheet.getLastRow() 
    for(rowIndex = 2; rowIndex <= lastRow; rowIndex++) {
        const fileName = sheet.getRange(rowIndex, 11).getValue()+".jpg"
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByName(fileName);
  
  if (files.hasNext()) {
    const file = files.next();
    Logger.log("File Found!");
    Logger.log("File ID: " + file.getId());
    Logger.log("File URL: " + file.getUrl());
    sheet.getRange(rowIndex, 12).setValue(file.getId())
    
  } else {
    Logger.log("No file found with name: " + fileName);
    
  }
    }
    
}

function populateProof(values) {
    if(values[0]) {
    return "https://lh3.googleusercontent.com/d/"+values[0];
  } else {
    return "";
  }
}


function getShare(s, dbFormat) {
    if(dbFormat == undefined) {
        dbFormat = false
    }
    const dist = {
        full: [],
        fixed: [],
        avg: [],
        remaining: []
    }
    for(index in s) {
        dist[s[index].type].push(s[index])
    }

    s.length = 0

    for(index in dist.full) {
        s.push(dist.full[index])
    }
    for(index in dist.fixed) {
        s.push(dist.fixed[index])
    }
    for(index in dist.avg) {
        s.push(dist.avg[index])
    }
    for(index in dist.remaining) {
        s.push(dist.remaining[index])
    }

    const text = [];

    for(index in s) {
        switch(s[index].type) {
            case "full":
                text.push(dbFormat?`${s[index].name}|100%`:`${s[index].name} (100%)`);
                break;
            case "fixed":
                text.push(dbFormat?`${s[index].name}|${s[index].amount}`:`${s[index].name} (₹${s[index].amount})`);
                break;
            case "avg":
                text.push(dbFormat?`${s[index].name}|${(100/dist.avg.length).toFixed(2)}%`:`${s[index].name} (${(100/dist.avg.length).toFixed(2)}%)`);
                break;
            case "remaining":
                text.push(dbFormat?`${s[index].name}|~`:`${s[index].name} (~)`);
                break;
            default:
        }
    }

    return text;
}

function getFilters() {
    const filters = {};
    for(item in availableFilters) {
        const options = {}
        for (op in availableFilters[item]) {
            if(op != "checker") {
                options[op] = availableFilters[item][op];
            }
        }
        filters[item] = options;
    }
    
    return filters;
}

function verifyFilter(filters) {
    var dateFilterCount = 0;
    for(filter in filters) {
        if(dateFilters.includes(filter)) {
            dateFilterCount++
        }
    }
    
    if(dateFilterCount > 1) {
        return `Only one date filter among ${dateFilters.join(', ')} is allowed in filter criteria`
    }
    
    var keys = Object.keys(filters);
    if(keys.includes("Billing Month") && !keys.includes("Stakeholder")) {
        return "Stakeholder must be added if you choose Billing Month"
    }
    return ""
}

function getMaxFilterDate(dateFilter, filters) {
    if(dateFilter.length > 0) {
        return availableFilters[dateFilter[0]].maxDateFilter(filters).replaceAll('-', ',');
    } else {
        return null
    }
}

function getDataOf(date) {
    return getDataOfFilter({"Date":[[{value:date}]]},[],[],[])
}

function getDataOfFilter(filters, sorts, groupList, summaryList, arrayFormat = false) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Expenses");
    
    return getDataFilterOfSheet(sheet, filters, sorts, groupList, summaryList, arrayFormat)
}

function getDataFilterOfSheet(sheet, filters, sorts, groupList, summaryList, arrayFormat) {
    
    var parentSpreadsheet = sheet.getParent();
    var spreadsheetName = parentSpreadsheet.getName().toLowerCase();
    var isBackup = spreadsheetName.includes("backup");
    
    var range = sheet.getRange("A2");
    
    var dt = undefined
    if("Date" in filters && !isBackup) {
        dt = filters.Date[0][0].value
    }
    
    const dataOf = getMetaData(isBackup, sheet, filters, sorts, groupList, summaryList) 
    
    if(isEmpty(filters)) {
        var output = arrayFormat? {
            header : [
                Object. keys(columns)
            ], 
            body : []
        } : {
            data : []
        }
    
        return output;
    }
    
    
    
    const allData = getAllData(sheet) 
    
    
    const rows = filterRows(allData, filters) 
    
    const data = processRows(rows, groupList.length == 0) 
    
    
    if(groupList.length == 0) {
        const headers = columnNames
        if (sorts.length == 0) {
            if(arrayFormat) {
                var output = {
                   headers, 
                   dataOf, 
                   data: convertData(data, headers)
                }
                
                return output
            } else if (dt) {
              
                var output = {
                    dates : getDates(dt), 
                    dataOf, 
                    data
                }
                
                return output;
                
            } else {
                var output = {
                    dataOf, 
                    data
                }
    
                return output;
            }
        } else {
            if(arrayFormat) {
                var output = {
                   headers, 
                   dataOf, 
                   data: convertData(sortData(data, sorts, columnNames), headers)
                }
                
                return output
            } else if (dt) {
                var output = {
                    dates : getDates(dt), 
                    dataOf, 
                    data : sortData(data, sorts, columnNames)
                }
    
                return output;
            } else {
                var output = {
                    dataOf, 
                    data : sortData(data, sorts, columnNames)
                }
    
                return output;
            }
            
        }
        
    } else {
        var output = processGroupBy(dataOf, data, filters, groupList,  sorts)
        if(summaryList.length == 0) {
           const headers = [... (new Set([...groupList, ...columnNames]))]
            if(arrayFormat) {
                var object = {
                   headers, 
                   dataOf, 
                   data: convertGroups(output.groups, headers)
                }
                
                return object
            } else {
                return output
            }
       } else {
            const headers = [...groupList, ...summaryList]
            output = processSummary(dataOf, output, groupList, summaryList, sorts, headers)
            
            if(arrayFormat) {
                const object = {
                   headers, 
                   dataOf, 
                   data: convertSummaries(output.summaries, headers)
                }
                
                return object
            } else {
                return output
            }
        }
        
        
    }
}

function processSummary(dataOf, output, groupList, summaryList, sorts, headers) {
     
     output = {
                dataOf, 
                summaries: 
                    sortData(
                        summarize(
                            output.groups, 
                            groupList, 
                            summaryList
                        ), 
                        sorts, 
                        headers
                    )
            }
            
     return output
}

function processGroupBy(dataOf, data, filters, groupList,  sorts) {
    const colNames = groupList
        console.log("data: "+JSON.stringify(data)) 
        var output = {
            dataOf, 
            groups: 
                groupBy(
                    data, 
                    groupList
                )
        }
        
        if("Stakeholder" in filters && groupList. includes("Stakeholder")) {
            const sh = filters["Stakeholder"][0][0].value
            
            const newGroup = {}
            for(groupId in output.groups) {
                const groupArr = JSON.parse(groupId)
                var match = false
                for(i in groupArr) {
                    for(g in groupArr[i]) {
                        if(g == "Stakeholder" && groupArr[i][g]== sh) {
                            match = true
                        }
                    }
                }
                if(match) {
                    newGroup[groupId] = output. groups[groupId]
                }
            }
            
            
                output.groups = sortGroup(newGroup, sorts, colNames) 
           
            
        
        } else {
                output.groups = sortGroup(output.groups, sorts, colNames) 
            }
            
       
    return output
}

function getAllData(sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Expenses")) {
    return sheet.getRange("A2:L"+sheet.getLastRow()).getValues()
}

function filteredData(filters) {
    return new Table("Filtered Table", TableType. Normal, [columnNames], convertData(processRows(filterRows(getAllData(), filters), false), columnNames)) 
}

function filterAllRows(filters) {
    return filterRows(getAllData(), filters) 
}

function filterRows(allData, filters) {
   
   return allData.map((rowData) => {
       if(typeof rowData[1] === 'string') 
           rowData[1] = rowData[1].split(",").map((str)=>{
                const s = str.split("|")
                const share = {};
                
                share["name"] = s[0];
                if(s[1] == "~") {
                    share["type"] = "remaining";
                } else if(s[1] == "100%") {
                    share["type"] = "full";
                } else if(s[1].endsWith("%")) {
                    share["type"] = "avg";
                } else {
                    share["type"] = "fixed";
                    share["amount"] = Number(s[1]);
                }
                
                return share
            })
            
        return rowData
   }).filter((rowData) => {
       var match = true
        for(filter in filters) {
            console.log(filter+" " + match+":"+rowData)
            if(!availableFilters[filter].checker(rowData, filters)) {
                match = false
                break
           }
           console.log(filter+" " + match+":"+rowData)
        }
        
        return match
   })
    
        
   
}

function processRows(rows, ignoreBlank) {
    return rows.map((rowData) => {
        const row = {}
        row[rowData[10].split("Z")[0]] = processRow(rowData, ignoreBlank)
        return row
    }) 
    
}

function getMetaData(isBackup, sheet, filters, sorts, groupList, summaryList) {
    
    var dataOf = [
        {
            Source: isBackup? "Backup Database":" Main Database"
        }, 
        {
            Filters: Object.keys(filters).map(
                (filter) => filter + " [" + filters[filter].map(
                    (filterItem) => "( "+ filterItem. map(
                        (logic, index) => availableFilters[filter].fields[index].label +" "+logic.value
                    ).join(" and ")+" )"
                ).join(" or ") +" ]"
            ).join(" and ")
        }, 
        {
            Sorts: sorts.map((sort) => Object. keys(sort).map((key) => key + " ("+ sort[key] +") "). join("")). join(", ")
        }, 
        {
            GroupBy: groupList.join(", ")
        }, 
        {
            Summaries: summaryList.join(", ") 
        }
    ]
    
    dataOf = dataOf.filter((subDataOf) => subDataOf[Object.keys(subDataOf)[0]]) 
   
   
   return dataOf
}

function convertToArrayData(row, headers) {
    return headers.map((header)=> { 
      
      const columnData = row.filter((obj)=> {
        return obj[header]
    })
      return columnData.length? columnData[0][header].toString().replaceAll("₹"," Rs. "):""
    })
}

function convertData(data, headers) {
 
    return data.map((rowWithId)=>convertToArrayData(Object.entries(rowWithId)[0][1], headers)) 
}

function convertGroups(groups, headers) {
    const rows = []
    for(groupIndex in groups) {
        for(groupId in groups[groupIndex]) {
            const group = JSON.parse(groupId)
            const keys = Object.keys(group)
            const _rows = groups[groupIndex][groupId]
      
            for(index in _rows) {
                const rowObj = _rows[index]
                const row = Object.entries(rowObj)[0][1]
               
                 rows.push(convertToArrayData([...group, ...row], headers))
            }
        
        }
    }
    
    return rows
}

function convertSummaries(summaries, headers) {
   
   
    return summaries.map((row) => convertToArrayData(row, headers))
}

function processRow(data, ignoreBlank = true) {
    const row = [];


    for(index in columns) {
        if(!columns[index].hide) {
            const title = columns[index].title
            var content = ""
            const values = columns[index].indices.map((i) => {
                return data[i]
            })

            if(columns[index].func) {
           
                content = columns[index].func(values)
         
            } else {
                 const joinBy = columns[index].joinBy || "";
                 if(columns[index].prefix) {
                     content += columns[index].prefix;
                 }
                
                 content += values.join(joinBy)
            
                
            }
            if(content.trim() || !ignoreBlank) {
                 const column = {}
        
                 column[title]= content
        
                 row. push(column)
            }
        }
       
    }
    return row
}

function sortData(data, sorts, columnNames) {  

    return data.sort((row1, row2) => {
    
        const columns1 = Array.isArray(row1)? row1:Object.entries(row1)[0][1]
        const columns2 = Array.isArray(row2)? row2:Object.entries(row2)[0][1]
        
        const sortIndices = sorts.map((sort)=>columnNames.indexOf(Object.keys(sort)[0])) 
    
        
        const values1 = sortIndices.map((sortIndex)=>Object.entries(columns1[sortIndex])[0][1])
        const values2 = sortIndices.map((sortIndex)=>Object.entries(columns2[sortIndex])[0][1])
        
        var compare = 0
        
        for(index in sorts) {
            for(sortBy in sorts[index]) {
                var currentCompare;
  
                switch(sorts[index][sortBy]) {
                    case "asc":
                        if(typeof values1[index] === "number") {
                            currentCompare = (values1[index]-values2[index]);
                        } /*else if(sortBy=="Month") {
                            currentCompare = months.indexOf(values1[index]) - months.indexOf(values2[index])
                        }*/ else {
                            currentCompare = values1[index].localeCompare(values2[index])
                        }
                        break;
                
                    case "desc":
                        if(typeof values1[index] === "number") {
                            currentCompare = (values2[index]-values1[index]);
                        } /*else if(sortBy=="Month") {
                            currentCompare = months.indexOf(values2[index]) - months.indexOf(values1[index])
                        } */else {
                            currentCompare = values2[index].localeCompare(values1[index])
                        }
                        break;
                
                    default:
                        currentCompare =  0
                }
           
                compare = compare || currentCompare
            }
        
        
        }
        return compare
    })
 
}

function sortGroup(groups, sorts, columnNames) {  
     const sortedGroups = sortData(Object.keys(groups).map((groupId) => JSON.parse(groupId)), sorts, columnNames) 
    const newGroup = []
    sortedGroups.forEach((group) => {
        const groupId = JSON. stringify(group) ;
        const obj = {}
        obj[groupId] = groups[groupId]
        newGroup.push(obj) 
    })
    
    return newGroup
}

