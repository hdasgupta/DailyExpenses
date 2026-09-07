const Group = {
    Row: {
        isColumn: false, 
        isRow: true
    }, 
    Column: {
        isColumn: true, 
        isRow: false
    }
}

const Sort = {
    asc: "asc", 
    desc:"desc"
}

const groupByColumns = {
    "Stakeholder": {
        extract: getStakeHolder, 
        similar: "Share", 
        group: Group.Row, 
        sort: Sort.asc, 
        isDate: false
    }, 
    "Year": {
        extract: getYear, 
        group: Group.Column, 
        sort: Sort.desc, 
        isDate: true
    }, 
    "Billing Month": {
        extract: getBillingMonth, 
        group: Group.Column, 
        sort: Sort.desc, 
        isDate: true
    },
    "Week": {
        extract: getWeek, 
        group: Group.Column, 
        sort: Sort.desc, 
        isDate: true
    },
    "Date": {
        extract: getDate, 
        similar: "Date", 
        group: Group.Column, 
        sort: Sort.desc, 
        isDate: true
    },
    "Category": {
        extract: getCategory, 
        similar: "Item", 
        process: removeCategory, 
        group: Group.Column, 
        sort: Sort.asc, 
        isDate: false
    }, 
    "Item": {
        extract: getItem, 
        similar: "Item", 
        group: Group.Column, 
        sort: Sort.asc, 
        isDate: false
    } 
}

function groupBy(rows, groupList) {
     const groupedData = {}
     const processColumn = {}
     const removeCols = []
     groupList.forEach((group) => {
         if(groupByColumns[group].similar) {
             if(groupByColumns[group].process) {
                 processColumn[groupByColumns[group].similar] = groupByColumns[group].process
             } else {
                 removeCols.push(groupByColumns[group].similar) 
             }
         }
     })
     
     console.log(removeCols) 
     console.log(JSON.stringify(processColumn))
    for(rowIndex in rows) {
        const row = rows[rowIndex]
 
   
        const columns = Object.entries(row)[0][1]
        console.log(JSON.stringify(row)) 
        const group = groupList. map((groupBy)=>groupByColumns[groupBy].extract(columns))
        var arrayGroupIndex = -1
        group.forEach((groupPart, index) => {
            if(Array.isArray(groupPart)) {
                arrayGroupIndex = index
            }
        })
        var groups = []
        
        if(arrayGroupIndex != -1) {
       
            for(index in group[arrayGroupIndex]) {
                const groupParts = group.map((groupPart, i) => {
                    if(i == arrayGroupIndex) {
                        return groupPart[index]
                    } else {
                        return groupPart
                    }
                })
                
                groups.push(JSON.stringify(groupParts))
            }
            
            
        } else {
            groups.push(JSON.stringify(group))
        }
        
      
        for(index in groups) {
           if(!groupedData[groups[index]]) {
                groupedData[groups[index]] = []
            }
            console.log("groups:"+JSON.stringify(groups)) 
            groupedData[groups[index]].push(processGroupRow(row, processColumn, removeCols, arrayGroupIndex!= -1? JSON.parse(groups[index])[arrayGroupIndex]:"" ))
        }
        
    }
    
    const newGroups = {}
    
    for(arrStr in groupedData) {
       const arr = JSON.parse(arrStr)
       const groupObj = []
       for(index in groupList) {
           const obj = {}
           obj[groupList[index]] = arr[index]
           groupObj.push(obj)
       }
       newGroups[JSON.stringify(groupObj)] = groupedData[arrStr]
    }
    
    return newGroups
}

function removeCategory(value) {
    return value.split(" >> ")[1]
}

function processGroupRow(row, processColumn, removeCols, stakeholder) {
     
     const newRow = {}
     
     for(rowId in row) {
         const newColumns = []
         var columns = row[rowId]
         if(stakeholder) {
             columns = processPrice(columns, stakeholder) 
         }
         console.log("Columns:"+JSON.stringify(columns)) 
         for(colIndex in columns) {
            for(colName in columns[colIndex]) {
                if(colName in processColumn) {
                    const colObj = {}
                    colObj[colName] = processColumn[colName](columns[colIndex][colName]) 
                    newColumns.push(colObj) 
                } else if(!removeCols.includes(colName)) {
                    newColumns.push(columns[colIndex]) 
                }
            }
         }
         console.log("newColumn: "+JSON.stringify(newColumns)) 
         newRow[rowId] = newColumns
     }
     return newRow
}

function processPrice(columns, stakeholder) {
    console.log(JSON.stringify(columns)) 
    columns = JSON.parse(JSON.stringify(columns)) 
    const price = Number(getGroupData(columns, "Price").split(" ")[1])
    console.log(stakeholder) 
    if(stakeholder) {
    const shareAmounts = {}
        const share = getGroupData(columns, "Share").split(" / ").forEach((shr)=> {
            const [stakeholder, shareAmount] = shr.split("(").map((s)=>s.trim())
            shareAmounts[stakeholder] = shareAmount
        })
        
        var remainingExpenses = price
        for(shareholder in shareAmounts) {
            var amount = shareAmounts[shareholder]
            if(amount.endsWith("%)")) {
                var percentage = Number(amount.slice(0, amount.length - 2)) 
                
                shareAmounts[shareholder] = remainingExpenses * percentage / 100.00
            } else if(amount == "~)") {
                shareAmounts[shareholder] = remainingExpenses
            } else {
                shareAmounts[shareholder] = Number(amount.slice(1, amount.length - 1))
                remainingExpenses -= shareAmounts[shareholder]
            }
        }
        console.log(JSON.stringify(shareAmounts))
    setGroupData(columns, "Price", "₹ " + shareAmounts[stakeholder])
    }
    return columns
}

function getDate(columns) {
    return getGroupData(columns, "Date")
}

function getWeek(columns) {
  const sunDay = getCurrentOrComingSunday(getGroupData(columns, "Date")) 
  const previousMonday = getMondayBeforeSunday(sunDay) 
  return previousMonday +" to " + sunDay;
}


function getBillingMonth(columns) {
    const billingStart = getLastFifthOfMonth(getGroupData(columns, "Date")) 
    return billingStart.slice(0, 7) 
}

function getYear(columns) {
    return getGroupData(columns, "Date").split("-")[0]
}

function getStakeHolder(columns) {
    
    return getGroupData(columns, "Share").split(" / "). map((sh)=> {
        const share = sh.split("(")
        return share[0].trim()
    })
    
}

function getCategory(columns) {
    return getGroupData(columns, "Item").split(" >> ")[0]
}

function getItem(columns) {
    return getGroupData(columns, "Item")
}

function getColumnIndex(name) {
    const keys = columns.map((column)=>column.title)
    return keys.indexOf(name)
}

function getGroupData(columns, columnName) {
    
    console.log(JSON.stringify(columns)) 
    const value = columns.filter((col) => col[columnName])[0][columnName]
    console.log(columnName+"="+value)
    return value
}

function setGroupData(columns, columnName, value) {
   const col = columns.filter((col) => col[columnName])[0]
    console.log(JSON.stringify(col)) 
    console.log(value) 
    col[columnName] = value
}


