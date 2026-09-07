const summaries = {
    "Sum of expenses": {
        extractor: getSummaryExpense, 
        summarizer: {
            initial: 0,
            reducer: sum, 
            unique: false, 
            finalFunc: roundOf
        }
    }, 
    "Involved Shares": {
        extractor: getSummaryStakeholder,
        summarizer: {
            initial: "", 
            reducer: join, 
            unique: true
        }
    }, 
    "Used Categories": {
        extractor: getSummaryCategory,
        summarizer: {
            initial: "", 
            reducer: join, 
            unique: true
        }
    }, 
    "Used items": {
        extractor: getSummaryItem,
        summarizer: {
            initial: "", 
            reducer: join, 
            unique: true
        }
    }
}

function roundOf(number) {
    return Math.round(number)
}

function getSummaryExpense(groupArr, columns) {
    console.log("columns: "+JSON.stringify(columns))
    const price = Number(getGroupData(columns, "Price").split(" ")[1])
    const shareholderGroup = groupArr.filter((group)=> Object.keys(group)[0] == "Stakeholder")
    
    
        return price
   
    
}

function getSummaryStakeholder(groupArr, columns) {
    return getGroupData(columns, "Share").split(" / ").map((sh)=>sh.split("(")[0].trim())
}

function getSummaryCategory(groupArr, columns) {
    return getGroupData(columns, "Item").split(" >> ")[0]
}

function getSummaryItem(groupArr, columns) {
    return getGroupData(columns, "Item")
}

function sum(acc, curr) {
    return acc + curr
}

function join(acc, curr) {
    return acc == ""? curr : (acc+ ", " + curr)
}

function summarize(groupedData, groupList, summaryList) {
    const summariesArr = []
    const removeCols = []
     groupList.forEach((group) => {
         if(groupByColumns[group].similar) {
             if(groupByColumns[group].process) {
                 
             } else {
                 removeCols.push(groupByColumns[group].similar) 
             }
         }
     })
     
    for(groupIndex in groupedData) {
        for(group in groupedData[groupIndex]) {
            const groupArr = JSON.parse(group)
            const rows = groupedData[groupIndex][group]
            const columnsArr = rows.map((row) => {
                const columns = Object.entries(row)[0][1]
                return columns
            }) 
            console.log(JSON.stringify(groupArr))
            const summaryValues = summaryList.map((summary)=> {
                var values = columnsArr.map((columns) => {
                    
                    return summaries[summary].extractor(groupArr, columns)
                 })
               
                if(Array.isArray(values[0])) {
                    values = values.flat()
                }
            
                if(summaries[summary].summarizer.unique) {
                    const set = new Set(values)
                    values = [...set]
                }
            
                const value =  values.reduce(summaries[summary].summarizer.reducer, summaries[summary].summarizer.initial)
                const obj = {}
                 if(summaries[summary].summarizer.finalFunc) {
                    obj[summary] = summaries[summary].summarizer.finalFunc(value)
                } else {
                    obj[summary] = value
                }
            
            
                return obj
            })
        
            
        summariesArr.push([...groupArr, ...summaryValues])
        }
    }
    return summariesArr
}

