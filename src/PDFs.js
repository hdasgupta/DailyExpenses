const widths = {
    "Date": 24,
    "Share": 45,
    "Item": 30,
    "Quantity": 20,
    "Price": 20,
    "Comment": 30,
    "Proof": 15,
    "Week": 35,
    "Month": 30,
    "Year": 30,
    "Stakeholder": 20,
    "Category": 20,
    "Sum of expenses": 30,
    "Involved Shares": 30
}


function generateRandomString(length = 20) {
    const randomStr = Array.from({
            length: 20
        }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' [Math.floor(Math.random() * 62)]
    ).join('');
    return randomStr
}

function getPdfBlob(fileName, titleText, tabArray) {
    // 1. Create a new Google Document with a specific filename
    var doc = DocumentApp.create(generateRandomString());

    // 2. Get the Header section and add content
    const header = doc.getHeader() || doc.addHeader();
    const headerParagraph = header.appendParagraph('Confidential - Internal Use Only');
    headerParagraph.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    headerParagraph.setFontSize(9);
    headerParagraph.setForegroundColor('#666666');



    // 3. Get the Body section of the document
    const body = doc.getBody();

    setupPage(body) 

    // 4. Add Title
    const title = body.appendParagraph(titleText);
    title.setHeading(DocumentApp.ParagraphHeading.TITLE);
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);


    if(tabArray[0].rows.length) {
        tabArray.forEach((table, tabIndex) => {
            drawTable(body, table)
        })
    
        
        // 8. Save and Close the document
        doc.saveAndClose();

        const docId = doc.getId();

        mergeCells(docId, tabArray) 
        
        doc = DocumentApp.openById(docId)
        addBookmarks(doc, tabArray)
        doc.saveAndClose()

        const file = DriveApp.getFileById(docId);

        const pdfBlob = file.getAs("application/pdf").setName(fileName + ".pdf");

        // Log the document URL to the Apps Script console
        Logger.log('Document successfully created!');
        Logger.log('URL: ' + doc.getUrl());

        Drive.Files.remove(docId)    
        
        return pdfBlob
        
    }
    
    return null
}

function mergeCells(docId, tabArray) {
    const bodyContent = Docs.Documents.get(docId).body.content;

    // Get start indices of all tables in order of appearance
    bodyContent
        .filter(element => element.table)
        .map(element => element.startIndex)
        .forEach((startIndex, tabIndex) => {
             console.log(tabIndex+" => "+ startIndex) ;
              if(tabArray[tabIndex].mergedCells.length) {
                  Docs.Documents.batchUpdate({
                      requests: tabArray[tabIndex].mergedCells.map((request) => { 
                          console.log(request) 
                          return request.toRequest(startIndex)
                      })
                  }, docId);

              }
        });
         
}

function addBookmarks(doc, tables) {
    const bookmarks = {}
    for(tableIndex in tables) {
        const table = tables[tableIndex]
        if(table.type == TableType.Group) {
            for(bookmarkTag in table.bookmarks) {
                const rowIndex = table.bookmarks[bookmarkTag];
                const bookmarkId = addBookmark(doc, tableIndex, rowIndex)
                bookmarks[bookmarkTag] = bookmarkId
            }
        }
    }
    
    console.log(JSON.stringify(bookmarks, null, 4)) 
    
    for(tableIndex in tables) {
        const table = tables[tableIndex]
        if(table.type == TableType.Summary) {
            for(bookmarkTag in table.bookmarks) {
                if(bookmarks[bookmarkTag]) {
                    const {row, col} = table.bookmarks[bookmarkTag]
                    addBookmarkLink(doc, tableIndex, row, col, bookmarks[bookmarkTag]) 
                }
                
            }
        }
    }
}

function addBookmarkLink(doc, tableIndex, rowIndex, colIndex, bookmarkId) {
  const body = doc.getBody();
  const targetTable = body.getTables()[tableIndex]; // Assuming work is inside the first table

  // 1. Get the target cell containing existing text that cannot be changed
  const linkCell = targetTable.getRow(rowIndex).getCell(colIndex); // Source Cell (Row 0, Cell 0)
  const cellParagraph = linkCell.getChild(0).asParagraph();
  const cellText = cellParagraph.editAsText();
  const fullTextLength = cellText.getText().length;
  console.log("text= "+cellText.getText()) 

  // 2. Wrap the existing text in the source cell with the bookmark link
  // (Index range 0 to fullTextLength - 1 wraps all text in the cell without altering characters)
  if (fullTextLength > 0) {
    cellText.setLinkUrl(0, fullTextLength - 1, "#bookmark=" + bookmarkId);
  }
 
}


function addBookmark(doc, tableIndex, rowIndex) {
  const body = doc.getBody();
  
  // 1. Get target table and row (e.g., Row index 2, Cell 0)
  const table = body.getTables()[tableIndex];
  
  const targetRow = table.getRow(rowIndex);
  
  const targetCell = targetRow.getCell(0);
   
  // 2. Set bookmark position inside the target cell paragraph
  const position = doc.newPosition(targetCell.getChild(0), 0);
  
  const bookmark = doc.addBookmark(position);
  
  // 3. Get the bookmark ID generated by the API
  const bookmarkId = bookmark.getId(); 
  
  return bookmarkId;
}

function getTables(doc) {
    const body = doc.getBody();
  const tables = [];
  
  const numChildren = body.getNumChildren();
  for (let i = 0; i < numChildren; i++) {
    const child = body.getChild(i);
    if (child.getType() === DocumentApp.ElementType.TABLE) {
      tables.push(child.asTable());
    }
  }
  
  return tables; // Returns an array of Table objects
}

function createFormattedGoogleDoc(reportType, fileName, filterTexts, tabArray) {
    
    return getPdfBlob(fileName, reportType.subject, tabArray)
}

function email(fileName, pdfBlob) {
    console.log(JSON.stringify(pdfBlob)) 
    if(pdfBlob) {
        getEmailUsers().forEach((email) => {
            MailApp.sendEmail({
                to: email,
                subject: fileName,
                body:"Please find attachment...", 
                attachments: [pdfBlob]
            });
            
            
        })
        
    } else {
        getEmailUsers().forEach((email) => {

            MailApp.sendEmail({
                to: email,
                subject: "No expenses recorded as " + reportType + " expenses.",
                body: "No expenses recorded",
                attachments: []
            });
        })
    }
}

function setupPage(body) {
    body.setPageWidth(792); // 11 inches
    body.setPageHeight(612);
    body.setMarginTop(36);
    body.setMarginBottom(36);
    body.setMarginLeft(36);
    body.setMarginRight(36);
}

function blobToBase64(blob) {
  var bytes = blob.getBytes();
  var base64String = Utilities.base64Encode(bytes)
  return base64String
}

function getFileName(filters, sorts, groups, summaries)  {
    var str = filtersToString(filters)
    if(groups.length) {
        str += " group by " + addAnd(groups) 
        if(summaries.length) {
            str+= " summary of "+addAnd(summaries) 
        }
    }
    if(sorts.length) {
        str += " sorted by "+ addAnd(sorts.map((sort) => {
            const [key, value] = Object.entries(sort)[0]
            return key +" in "+value+"ending"
        })) + " order"
    }
    
    return str
}



function downloadPdf(filters, sorts, groups, summaries) {
    const str = getFileName(filters, sorts, groups, summaries) 
    const blob =  getPdfBlob(str, str, getGenericTables(filters, sorts, groups, summaries))
    const base64Data = blobToBase64(blob);
    const output = {}
    output[str] = base64Data;
    
    return output
}

function getGenericTables(filters, sorts, groups, summaries) {
    const allData = getAllData() 
    
    var rows = filterRows(allData, filters)
    
    const data = processRows(rows, groups.length == 0) 
    
    if(groups.length) {
        if(summaries.length) {
            const gt = groupTable(data, filters, sorts, groups, summaries.length == 1 && summaries[0]=="Sum of expenses")
            var output = processGroupBy(undefined, data, filters, groups,  sorts)
            const splited = splitGroups(groups)
            return [rowColumnBreakupSummary(output, sorts, splited.groupsRow, splited.groupsCol, summaries, groups, summaries.length == 1 && summaries[0]=="Sum of expenses"), gt]
            
        } else {
            rows = convertData(data, columnNames)
            return [groupTable(data, filters, sorts, groups), new Table("", TableType.Normal, [columnNames], rows, []) ]
        }
    } else {
        
        if(sorts.length) {
            rows = convertData(sortData(data, sorts, columnNames), columnNames)
            
        } else {
            rows = convertData(data, columnNames)
        }
        return [new Table("", TableType.Normal, [columnNames], rows, [])]
    }
}

function getData(reportTypes) {
    const groupList = ["Stakeholder", reportTypes.field]
    const dateFilter = reportTypes.filter()
    const allData = getAllData() 
    
    
    const rows = filterRows(allData, dateFilter)
    
    const data = processRows(rows, groupList.length == 0) 
    console.log(data)
    
    const output = prepareGroupByTable(reportTypes, data, groupList, true)

    const summaries1 = autoRowColumnBreakUp(reportTypes, data, groupList, true)
    
    console.log(groupList) 
    
    const summaries2 = autoRowColumnBreakUp(reportTypes, data, [reportTypes.field, "Category"])

    const summaries3 = autoRowColumnBreakUp(reportTypes, data, [...groupList, "Category"])

    console.log(JSON.stringify(summaries))
    
    const heading = reportTypes.subject+ " from "+ dateFilter["Date Range"][0][0].value + " to "+dateFilter["Date Range"][0][1].value

    email(heading, createFormattedGoogleDoc(reportTypes, heading, [], [summaries1, summaries2, summaries3, output])) 
}

function groupTable(dt, filters, sorts, groupList, addBookmarks= false) {
    const data = []
    const removeCols = []
     groupList.forEach((group) => {
         if(groupByColumns[group].similar) {
             if(groupByColumns[group].similar) {
                  removeCols.push(groupByColumns[group].similar) 
             }
         }
     })
     const cols = columnNames.filter((col) => !removeCols.includes(col)) 
     
     const groups = processGroupBy(
        undefined, 
        dt, 
        filters, 
        groupList,  
        sorts
    ).groups
    
    console.log("groups: "+JSON.stringify(groups)) 


    const mergedCells = []
    const headers = []
    const groupRows = []
    var rowIndex = 0
    const bookmarks = {}

    for(index in groups) {
        for(groupId in groups[index]) {
            const group = JSON.parse(groupId)
            const d = convertData(groups[index][groupId], cols)
            const bookmarkKeyObj = {}
            const bookmarkRow = rowIndex
            for(index in group) {
            for(key in group[index]) {
                const row = createArray(d[0].length, () => "")
                row[0] = key
                row[2] = group[index][key]
                if(addBookmarks) 
                    bookmarkKeyObj[key] = group[index][key]
                data.push(row)
                groupRows.push(rowIndex)
                mergedCells.push(new MergedCell(rowIndex, 0, rowIndex, 1))
                mergedCells.push(new MergedCell(rowIndex, 2, rowIndex, d[0].length-1))
                rowIndex++
            }
            }
            if(addBookmarks) {
                const bookmarkKey =  groupList.map((g) => bookmarkKeyObj[g]).join(".") 
                
                bookmarks[bookmarkKey] = bookmarkRow
            }
            
            data.push(cols)
            headers.push(rowIndex)
            d.forEach((row) => data.push(row))
            rowIndex += d.length + 1

        }
    }
    
    return new Table("Detail Grouped Data", TableType.Group, headers, data, mergedCells, 0, groupRows, null, bookmarks) 
}

function prepareGroupByTable(reportTypes, data, groups, addBookmarks = false) {
    const sortObj = {}
    
    sortObj[reportTypes.field] = "desc";
    
    return groupTable(data, reportTypes.filter(), [
            sortObj, 
            {
                "Stakeholder": "asc",
            },
            
        ], groups, addBookmarks)
}

function getDailyData() {
    getData(ReportTypes.Daily)
}


function getWeeklyData() {
    getData(ReportTypes.Weekly)
}

function getMonthlyData() {
    getData(ReportTypes.Monthly)
}

function getYearlyData() {
    getData(ReportTypes.Yearly)
}

