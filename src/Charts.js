const ChartType = Object.freeze({
    Chart1 : {
        generator: generateChart, 
        addDetails: false, 
        type: "quickchart.io"
    }, 
    Chart2 : {
        generator: generateChart2, 
        addDetails: true, 
        type: "html"
    }, 
    Chart3 : {
        generator : generateChart3, 
        addDetails: false, 
        type:"google-doc"
    }
})

const rowGroupsPriority= Object.keys(groupByColumns).filter((group) => groupByColumns[group].group.isRow) 
    
const colGroupsPriority= Object.keys(groupByColumns).filter((group) => groupByColumns[group].group.isColumn) 
    
const ReportTypes = Object.freeze({
    Daily: {
        label:'Daily', 
        field: 'Date', 
        filter: getLastWeek, 
        subject: "Last 1 week's daily report"
    } ,
    Weekly: {
        label:'Weekly', 
        field: 'Week', 
        filter: getLastFourWeeks, 
        subject: "Last 4 weeks' weekly report"
    } ,
    Monthly: {
        label:'Monthly', 
        field: 'Billing Month', 
        filter: getLastQuarter, 
        subject: "Last quarter's monthly report"
    },
    Yearly: {
        label:'Yearly', 
        field: 'Year', 
        filter: getLastTwoYears, 
        subject: "Last 2 year's yearly report"
    },
});


function getGroupedChartImages(d, _groups, _xGroups2) {
  
   const _xGroups1 = _groups.filter((group) => !_xGroups2.includes(group)) 
            
   const chart = generateChart(d, _xGroups1, _xGroups2)
   
   const url = "https://quickchart.io/chart?c=" + JSON.stringify(chart);
   
   return chart
}


function getFilter(from, to) {

    const filter = {
        "Date Range": [
            [
                {
                    value: from
                },
                {
                    value: to
                },
            ]
        ]
    }
    
    return filter
}

function getLastWeek() {
    const date = new Date()
    date.setHours(5, 30, 0)
    date.setDate(date.getDate() - 1)
    const yesterDay = toYYYYMMDDFormat(date)
    date. setDate(date.getDate() -6) 
    const ThreeDaysBack = toYYYYMMDDFormat(date)
    
    return getFilter(ThreeDaysBack, yesterDay) 
}

function getLastQuarter() {
    const endDate = getLastFourthOfMonth() ;
    const startDate = oneDayAfter(getThreeMonthAgo(endDate)) 
    
    return getFilter(startDate, endDate) 
}

function getLastFourWeeks() {
    const sunDay = getLastSunday() 
    const previousMonday = getMondayBeforeSunday(sunDay) 
    const threeWeekBack = getThreeWeeksAgo(previousMonday) 
    
    return getFilter(threeWeekBack, sunDay) 
}

function getLastTwoYears() {
    const lastDate = getLastDec31() 
    const startDate = getAYearsAgo(getFirstJanOfLastYear()) 
    
    return getFilter(startDate, lastDate) 
}

function masterChart() {
    const groupIndices = _groups.map((group) => d.headers.indexOf(group));
    const expensesIndex = d.headers.indexOf("Sum of expenses");
    const labels = d.data.map((row) => groupIndices.map((index) => row[index]).join(" / ")) 
    const label = "Exenses"
    const data = d.data.map((row) => row[expensesIndex]) 
    
    const chart = new Chart(new ChartData(labels, [new ChartDataset(label, data)])) 
    return chart
}

function generateChartData(d, _groupsX, _groupsY) {
    const labels = []
   const obj = {}
   const output = {
       labels, obj}
   
   const groupIndices1 = _groupsX.map((group) => d.headers.indexOf(group));
   const groupIndices2 = _groupsY.map((group) => d.headers.indexOf(group));
   const expenseIndex = d.headers.indexOf("Sum of expenses");
   
   d.data.forEach((row) => {
      const group1 = groupIndices1.map((index) => row[index]).join(" / ")
      const group2 = groupIndices2.map((index) => row[index]).join(" / ")
      const expense = row[expenseIndex]
      
      if(!labels.includes(group2)) {
          labels.push(group2)
      }
      const group2Index = labels.indexOf(group2) 
      if(!(group1 in obj)) {
         obj[group1] = []
      }
      
      obj[group1][group2Index] = expense;
      
   }) ;
   
   
   
   Object.keys(obj).map((label) => {
       var dataset 
       for(index in labels) {
           if(obj[label][index] == undefined) {
               obj[label][index] = 0
           }
       }
    }) 
    
    return output
}

function generateChart2(d, _groups1, _groups2) {
   const output = generateChartData(d, _groups2, _groups1)
   
   const datasets = Object.keys(output.obj).map((category) => {
       const obj = {}
       for(keyIndex in output. labels) {
           obj[output.labels[keyIndex]] = output.obj[category][keyIndex]
       }
       var dataset = new Chart2Dataset(
           category, 
           obj
       ) 
       
       return dataset;
   }) ;
   
   
   return datasets
}

function generateChart3(d, _groups1, _groups2) {
   const output = generateChartData(d, _groups2, _groups1)
   
   const cols = [new Chart3Column(Charts.ColumnType.STRING, "")]
   output.labels.forEach((col) => cols.push(new Chart3Column(Charts.ColumnType.NUMBER, col))) 
   
   const rows = Object.keys(output.obj).map((category, index) => {
       const row = [category, ...output.obj[category]]
       
       
       return new Chart3Row(row) ;
   }) ;
   
   
   return new Chart3(cols, rows)
}

function generateChart(d, _groups1, _groups2) {
   const output = generateChartData(d, _groups1, _groups2)
   
   const datasets = Object.keys(output.obj).map((label) => {
       var dataset = new ChartDataset(
           label, 
           output.obj[label]
       ) 
       
       return dataset;
   }) ;
   
   const chart = new Chart(
      new ChartData (
          output.labels, 
          datasets
        ) 
   ) 
   
   console.log(JSON.stringify(chart)) 
   
   return chart
}

function splitRowColumnData(d, _groupsRow, _groupsCol, sorts, chartType) {
    var rowGroup = {}
    var columnIndex = 0
    var colGroup = {}
    
    console.log(JSON.stringify(d, null, 4))
    
    const remainingHeader = d. headers.filter((header) => !_groupsRow.includes(header) && !_groupsCol.includes(header)) 
    
    groupRowIndices = _groupsRow.map((group) => d. headers.indexOf(group)) 
    groupColIndices = _groupsCol.map((group) => d. headers.indexOf(group)) 
    remainingIndices = remainingHeader.map((header) => d. headers.indexOf(header)) 
    
    for(rowIndex in d.data) {
        var currentRowGroup = rowGroup
        var currentColGroup = colGroup
        
        const rowGroups = [rowGroup]
        const colGroups = [colGroup]
        const row = d.data[rowIndex]
        
        for(group in groupRowIndices) {
           const value = row[groupRowIndices[group]]
           if(! currentRowGroup[value]) {
               currentRowGroup[value] = {}
           }
           currentRowGroup = currentRowGroup[value]
           rowGroups.push(currentRowGroup)
        }
        
        
        for(group in groupColIndices) {
           const value = row[groupColIndices[group]]
           if(! currentColGroup[value]) {
               currentColGroup[value] = {}
           }
           currentColGroup = currentColGroup[value]
           colGroups.push(currentColGroup)
        }
        
        if(Object.keys(currentColGroup).length  == 0) {
            for(index in remainingHeader) {
                const currentHeader = remainingHeader[index]
                currentColGroup[currentHeader] = columnIndex
                columnIndex ++
            }
            
        }
        
        for(index in remainingHeader) {
            const currentHeader = remainingHeader[index]
            const value = row[remainingIndices[index]]
                currentRowGroup[currentColGroup[currentHeader]] = value
        }
     }
     
     const rowSorts = _groupsRow.map((group) => {
         const sort = sorts.filter((sort) => sort[group])
         if(sort.length) {
             return sort[0]
         } else {
             return null
         }
     }) 
     const colSorts = _groupsCol.map((group) => {
         const sort = sorts.filter((sort) => sort[group])
         if(sort.length) {
             return sort[0]
         } else {
             return null
         }
     }) 
     var colValues = []
     
     var colHeaders = createArray(_groupsCol.length + (remainingHeader.length==1?0:1), ()=>createArray(columnIndex+_groupsRow.length, ()=>"")) 
     
     var colIndex = _groupsRow.length
     var mergedCells = []
     var data = []
     
     colGroup = sortLevel(colGroup, 0, _groupsCol.length, colSorts) 
     
     rowGroup = sortLevel(rowGroup, 0, _groupsRow.length, rowSorts) 
     
     printHeader(colGroup, 0, _groupsCol.length + (remainingHeader.length==1?0:1), _groupsRow.length, colHeaders, mergedCells) 
     
     
  
     printData(rowGroup, colGroup, 0, _groupsRow.length, _groupsCol.length + (remainingHeader.length==1?0:1), 0, columnIndex+_groupsRow.length, data, mergedCells) 
     
     if(remainingHeader.length==1 && remainingHeader[0] == "Sum of expenses") {
         addTotal(colHeaders, data, mergedCells, _groupsRow.length) 
     }
      if(chartType.addDetails) {
          const obj = {}
          for(rowIndex = 0 ; rowIndex< data. length-1; rowIndex++) {
              for(colIndex = _groupsRow.length; colIndex< data[0]. length-1; colIndex++) {
                  for(headerRow=0; headerRow< _groupsCol.length; headerRow++) {
                      if(colHeaders[headerRow][colIndex]) {
                          obj[_groupsCol[headerRow]] = colHeaders[headerRow][colIndex]
                      }
                  }
                  for(headerCol=0; headerCol<_groupsRow.length; headerCol++) {
                      if(data[rowIndex][headerCol]) {
                          obj[_groupsRow[headerCol]] = data[rowIndex][headerCol]
                      }
                  }
                  
                  data[rowIndex][colIndex] = {
                      ...obj, 
                      value: data[rowIndex][colIndex]
                  }
              }
          }
      }
     
     const output = {headers: colHeaders, data, mergedCells}
     
     return output
}

function addTotal(headers, data, mergedCells, groupRowCount) {
    headers.forEach((header, index) => {
        if(index) {
            header.push("") 
        } else {
            header.push("Total") 
        }
    }) 
    
    if(headers.length > 1) {
        //mergedCells.push(0, headers[0].length -1, headers.length - 1, headers[0].length -1) 
    }
    
    data.push(createArray(headers[0].length, () => "")) 
    
    data[data.length - 1][0] = "Total"
    if(groupRowCount>1) {
        mergedCells.push(data.length + header.length - 1, 0, data.length+header.length-1, groupRowCount - 1)
    }
    true
    for(let row= 0; row < data.length;row++) {
        var rowTotal = 0
       
         
        if(row==data.length - 1) {
            for(let col=groupRowCount; col< data[row].length -1; col++) {
                var colTotal = 0
                for(let r= 0; r < data.length-1;r++) {
                    if(isNumber(data[r][col])) {
                        colTotal += Number(data[r][col]) 
                    }
                }
                data[row][col] = colTotal
            }
        } else {
            data[row].push("")
        }
        for(let col=groupRowCount; col< data[row].length -1; col++) {
            if(isNumber(data[row][col])) {
                rowTotal += Number(data[row][col]) 
            }
        }
        data[row][data[row].length -1] = rowTotal
    }
}

function isNumber(val) {
  return !isNaN(val) && !isNaN(parseFloat(val));
}

function sortLevel(group, level, maxLevel, sorts) {
   
    if(level >= maxLevel) 
        return group
    const newGroup = {}
    if(sorts[level]) {
         const keys = Object.keys(group) 
         if(Object.entries(sorts[level])[0][1]== "asc") {
             keys.sort((a, b) => a.localeCompare(b))
         } else {
             keys.sort((a, b) => b.localeCompare(a))
         }
         
        
         for(key in keys) {
             newGroup[keys[key]] = sortLevel(group[keys[key]], level + 1, maxLevel, sorts)
         }
    } else {
        const keys = Object.keys(group) 
      
        for(key in keys) {
             
             newGroup[keys[key]] = sortLevel(group[keys[key]], level + 1, maxLevel, sorts)
         }
    }
    
    return newGroup
}

function printHeader(colHeader, level, maxLevel, startIndex, colValues, mergedCells) {
    if(level >= maxLevel) 
        return startIndex
     for(colName in colHeader) {
         console.log(level+","+maxLevel) 
         colValues[level][startIndex] = colName
         const endIndex = printHeader(colHeader[colName], level+ 1 , maxLevel, startIndex, colValues, mergedCells) 
         if(startIndex!= endIndex) {
             mergedCells.push(new MergedCell(level, startIndex, level, endIndex)) 
         }
         startIndex = endIndex + 1
     }
     return startIndex - 1
}

function createArray(size, initialValueFn) {
    const arr = []
    for(let i = 0; i<size; i++) {
        arr.push(initialValueFn()) 
    }
 
    return arr
}

function printData(rowGroup, colGroup, rowLevel, maxRowLevel, maxColLevel, rowIndex, colCount, data, mergedCells) {
    
    if(rowLevel > maxRowLevel) {
        return rowIndex
    }
    
    if(rowLevel== maxRowLevel) {
         printColData(colGroup, 0, maxColLevel, maxRowLevel, data[rowIndex], rowGroup) 
         return rowIndex + 1
    }
    for(rowName in rowGroup) {
        
         while(data.length <= rowIndex) {
             data.push(createArray(colCount,()=>"-")) 
         }
         data[rowIndex][rowLevel] = rowName
         
         var endIndex = printData(rowGroup[rowName], colGroup, rowLevel + 1, maxRowLevel, maxColLevel, rowIndex,  colCount, data, mergedCells) 
         if(rowIndex!= endIndex-1) {
             mergedCells.push(new MergedCell(rowIndex, rowLevel, endIndex-1, rowLevel)) 
         }
         rowIndex = endIndex 
    }
    return rowIndex - 1
}

function printColData(colGroup, colLevel, maxColumnLevel, startIndex, currentRow, rowData) {
     if(colLevel > maxColumnLevel) {
         return startIndex
     }
     if(colLevel == maxColumnLevel) {
         if(typeof colGroup === "number") {
             currentRow[startIndex] = rowData[colGroup]
         } else {
         
            currentRow[startIndex] = rowData[Object.entries(colGroup)[0][1]]
         }
         return startIndex+ 1
     }
     for(column in colGroup) {
         
         startIndex = printColData(colGroup[column], colLevel + 1, maxColumnLevel, startIndex, currentRow, rowData)
     }
     return startIndex
}

function splitGroups(groups) {
    var groupsRow = rowGroupsPriority.filter((row) => groups.includes(row)) 
    var groupsCol = colGroupsPriority.filter((col) => groups.includes(col)) 
    if(!groupsRow.length) {
        if(groupsCol.length >1) {
            groupsRow = groupsCol.filter((col) => !groupByColumns[col].isDate) 
            groupsCol = groupsCol.filter((col) => groupByColumns[col].isDate) 
        }
    }
    if(!groupsCol.length) {
        if(groupsRow.length > 1) {
           groupsCol = groupsRow.slice(1) 
           groupsRow = groupsRow.slice(0, 1)
        }
    }
    const output = {groupsRow, groupsCol}
    
    return output
}

function autoRowColumnBreakUp(reportType, data, groups, addBookmarkLink = false) {
    
    return autoRowColumnBreakUpByFilter(data, reportType.filter(), groups, addBookmarkLink) 
}

function autoRowColumnBreakUpByFilter(data, filters, groups, addBookmarkLink = false) {
    
    
    const splited = splitGroups(groups)
    
    const sorts = groups.map((group) => {
        const sort = {}
        sort[group] = groupByColumns[group].sort
        
        return sort
    }) 
    
    
    
    return rowColumnBreakup(data, filters, sorts, splited.groupsRow, splited.groupsCol, groups, addBookmarkLink)
    
}

function breakup(summary, groups, groupList, addBookmarkLink= false, chartType = ChartType.Chart3) {
    const splited = splitGroups(groups)
    if(!splited.groupsRow.length || !splited.groupsCol.length) {
        return new Table("Summary", TableType. Summary, [summary.headers], summary.data) 
    }
    const sorts = groups.map((group) => {
        const sort = {}
        sort[group] = groupByColumns[group].sort
        
        return sort
    }) 
    const splitedData = splitRowColumnData(summary, splited.groupsRow, splited.groupsCol, sorts, chartType) 
    
    const bookmarks = {}
    console.log("addBookmarkLink", addBookmarkLink) 
    if(addBookmarkLink && splited.groupsRow.length==1 && splited.groupsCol.length==1) {
        for(let rowIndex = 0; rowIndex < splitedData.data.length -1; rowIndex++) {
            const row = splitedData.data[rowIndex]
            for(let colIndex = 1; colIndex < row. length - 1; colIndex++) {
               const bookmarkKey = groupList.map((group) => {
                   if(splited.groupsRow.includes(group)) return row[0]
                   else return splitedData.headers[0][colIndex]
               }). join(".") 
               
               bookmarks[bookmarkKey] = {
                   row: rowIndex+splited.groupsRow.length, 
                   col: colIndex
               }
            }
        }
    }
    
    return new Table(`Summary [(${splited.groupsRow.join(' / ')}) vs (${splited.groupsCol.join(' / ')})]`, TableType.Summary, splitedData.headers, splitedData.data, splitedData.mergedCells, splited.groupsRow.length, null,  summary.headers.includes("Sum of expenses")?chartType.generator(summary, splited.groupsRow, splited.groupsCol): null, bookmarks) 
}

function rowColumnBreakup(data, filters, sorts, groupsRow, groupsCol, groups, addBookmarkLink= false) {

    const groupList = [...groupsRow, ...groupsCol]
    const summaryList = ["Sum of expenses"]
    var output = processGroupBy(undefined, data, filters, groupList,  sorts)
    return rowColumnBreakupSummary(output, sorts, groupsRow, groupsCol, summaryList, groups, addBookmarkLink)
}

function rowColumnBreakupSummary(groupOutput, sorts, groupRow, groupCol, summaryList, groups, addBookmarkLink= false, chartType= ChartType.Chart1) {
    const groupList = [...groupRow, ...groupCol]
    const headers = [...groupList, ...summaryList]
    output = processSummary(undefined, groupOutput, groupList, summaryList, sorts, headers)
    
    const summary = {
                   headers, 
                   data: convertSummaries(output.summaries, headers)
                }
                
    return breakup(summary, [...groupRow, ...groupCol], groups, addBookmarkLink, chartType)
}
