const TableType = Object.freeze({
  Normal : 0,    // 0
  Group : 1, // 1
  Summary : 2  // 2
}) 

class Table {
  constructor(heading, type, headers, rows, mergedCells = [], headingRowCount = 0, groupRows = null, chart = null, bookmarks= {}) {
    this.heading = heading;
    this.type = type;
    this.headers = headers;
    this.rows = rows;
    this.mergedCells = mergedCells;
    this.headingRowCount = headingRowCount;
    this.groupRows = groupRows;
    
    this.chart = chart
    this.bookmarks = bookmarks
  }

  transpose() {
      if(this.type == TableType.Summary) {
          
          const rowsWithHeaders = [...this.headers,...this.rows]
          const data = []
          for(let row in rowsWithHeaders) {
              for(let col in rowsWithHeaders[row]) {
                  if(!data[col]) {
                      data.push([]) 
                  }
                   data[col].push(rowsWithHeaders[row][col]) 
              }
          }
          const headers = data.slice(0, this.headingRowCount) 
          const rows = data.slice(this.headingRowCount) 
          const headingRowCount = this.headers.length
          const mergedCells = this.mergedCells.map((cell) => new MergedCell(cell.startCol, cell.startRow, cell.endCol, cell.endRow)) 
          console.log(JSON.stringify(this.mergedCells))
          console.log(JSON.stringify(mergedCells)) 
          
          const bookmarks = {}
          
          for(let bookmarkTag in this.bookmarks) {
              bookmarks[bookmarkTag] = {
                  row: this.bookmarks[bookmarkTag].col, 
                  col: this.bookmarks[bookmarkTag].row
              }
          }
          
          this.headers = headers
          this.rows = rows
          this.mergedCells = mergedCells
          this.headingRowCount = headingRowCount
          this.bookmarks = bookmarks
      }
      
  }
}

class Chart {
    constructor(data) {
        this.type = "bar";
        this.data = data;
    }
}

class ChartData {
    constructor(labels, datasets) {
        this.labels = labels;
        this.datasets = datasets;
    }
}

class ChartDataset {
    constructor(label, data) {
        this.label = label;
        this.data = data
    }
}

class Chart2Dataset {
    constructor(category, values) {
        this.category = category;
        this.values = values
    }
}

class Chart3Column {
    constructor(type, name) {
        this.type = type;
        this.name = name
    }
}

class Chart3Row {
    constructor(row) {
        this.row = row
    }
}

class Chart3 {
    constructor(columns, rows) {
        this.columns = columns
        this.rows = rows
    }
}

class MergedCell {
    constructor(startRow, startCol, endRow, endCol) {
        this.startRow = startRow;
        this.startCol = startCol;
        this.endRow = endRow;
        this.endCol = endCol;
    }
    
    toRequest(tableIndex) {
        const request = {
            mergeTableCells: {
                tableRange: {
                    tableCellLocation: {
                        tableStartLocation: {
                            index: tableIndex
                        },
                        rowIndex: this.startRow, // Starting row (0-based)
                        columnIndex: this.startCol // Starting column (0-based)
                    },
                    rowSpan: this.endRow - this.startRow + 1, // Number of rows to merge downwards (rowspan="3")
                    columnSpan: this.endCol - this. startCol + 1 // Number of columns to merge rightwards
                }
            }
        };
            
        return request  
    }
    
    toString() {
        return JSON.stringify([startRow, startCol, endRow, endCol])
    }
}

function drawTable(body, table) {
    const title = body.appendParagraph(table.heading);
     title.setHeading(DocumentApp.ParagraphHeading.HEADING2);
     title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    switch (table.type) {
        case TableType.Summary:
            if(table.headers.length> table.rows.length) 
            table.transpose() 
        case TableType.Normal:
            drawNormalOrSummaryTable(body, table)
            break;
        case TableType.Group:
            drawGroupTable(body, table)
            break;
        
        default:
            
      }
      
      body.appendPageBreak()
}

function drawNormalOrSummaryTable(body, table) {
    drawChart(body, table.chart)
    
    var tabData = [...table.headers, ...table.rows].map((row) => row.map((column) => column ? column : ""))
    
    const proofUrlIndex = table.rows[table.headers[0]].indexOf("Proof")
const urls = table.rows.map((row) => {
    
    if (proofUrlIndex != -1 && row[proofUrlIndex].startsWith("https://")) {
        return row[proofUrlIndex]
    } else {
        return ""
    }
})

const data = table.rows.map((row) => {
    if (proofUrlIndex != -1 && row[proofUrlIndex].startsWith("https://")) {
        row[proofUrlIndex] = "Link"
    }
    return row
})
    
    const tab = body.appendTable(tabData);
    
    if (proofUrlIndex != -1) {
    urls.forEach((url, index) => {
        if (url) {
            const cell = tab.getCell(index + table.headers.length, proofUrlIndex);
            const paragraph = cell.getChild(0).asParagraph();
            paragraph.setLinkUrl(url);
        }
    })
    }
    
    for(let row = 0; row < table.headers.length; row++) {
        const headerRow = tab.getRow(row);
        for(let i = 0; i < headerRow.getNumCells(); i++) {
            const cell = headerRow.getCell(i);
             cell.setBackgroundColor('#1a73e8'); // Google Blue background
            cell.getChild(0).asParagraph().setForegroundColor('#FFFFFF'); // White text
             cell.getChild(0).asParagraph().setBold(true);
             cell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);

            tab.setColumnWidth(i, 720 / headerRow.getNumCells());
        }
    }
}

function drawGroupTable(body, table) {
    if(table.rows.length == 0) {
        return
    }
    
    const proofUrlIndex = table. rows[table.headers[0]].indexOf("Proof")
    const urls = table.rows.map((row) => {

        if(proofUrlIndex != -1 && row[proofUrlIndex].startsWith("https://")) {
            return row[proofUrlIndex]
        } else {
            return ""
        }
   })

   const data = table.rows.map((row) => {
        if(proofUrlIndex != -1 && row[proofUrlIndex].startsWith("https://")) {
            row[proofUrlIndex] = "Link"
        }
        return row
    })
    
    const tab = body.appendTable(data);
    
    if(proofUrlIndex != -1) {
        urls.forEach((url, index) => {
           if(url) {
                const cell = tab.getCell(index, proofUrlIndex);
                const paragraph = cell.getChild(0).asParagraph();
                paragraph.setLinkUrl(url);
            }
        })
    }

    
    // 7. Format the Table
    // Format Header Row
    for(index in table.headers) {
        const headerRow = tab.getRow(table.headers[index]);
        for(let i = 0; i < headerRow.getNumCells(); i++) {
            const cell = headerRow.getCell(i);
            cell.setBackgroundColor('#1a73e8'); // Google Blue background
            cell.getChild(0).asParagraph().setForegroundColor('#FFFFFF'); // White text
             cell.getChild(0).asParagraph().setBold(true);
            cell.getChild(0).asParagraph().setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        }
    }
        
    console.log(table.groupRows)
   for(index in table.groupRows) {
        const headerRow = tab.getRow(table.groupRows[index]);
        for(let i = 0; i < headerRow.getNumCells(); i++) {
            const cell = headerRow.getCell(i);
            cell.setBackgroundColor("#ededb2"); // Google Blue background
             cell.getChild(0).asParagraph().setBold(true);
            
        }
    }

    console.log(table.headers) 
    // Set column widths (in points: 72 points = 1 inch)
    for(index in table.rows[0]) {
        tab.setColumnWidth(index, 150);
    }
}

function drawChart(body, chart) {
    console.log(JSON.stringify(chart))
    if(!chart) return;
    const options = {
       "method": "post",
       "contentType": "application/json",
       "payload": JSON.stringify({c: chart})
    };

    // 2. Fetch the image data from the URL
    var response = UrlFetchApp.fetch("https://quickchart.io/chart", options);
    console.log(JSON.stringify(response))
    var imageBlob = response.getBlob()

    // 3. Append the image to the end of the document
    var image = body.appendImage(imageBlob);

    // Optional: Set specific dimensions (Width, Height in pixels)
    image.setWidth(1000);
    image.setHeight(500);
    
    body.appendPageBreak()
}

function drawChart3(body, chart3, title) {
    console.log(JSON.stringify(chart3))
    var dataTable = Charts.newDataTable();
    for(column of chart3.columns) {
        dataTable = dataTable.addColumn(column.type, column.name);
    }
    for(row of chart3.rows) {
        dataTable = dataTable.addRow(row.row);
    }
    const data = dataTable.build();
    var chart = Charts.newBarChart()
      .setDataTable(data)
      .setTitle(title)
      .build();
      
    body.appendImage(chart.getAs('image/png'))
}
