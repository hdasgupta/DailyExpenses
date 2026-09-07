function exampleSave() {
    console. log(save(
        "2026-07-21", 
        "Himaghna Dasgupta|100%", 
        "xyz", 
        "pqr", 
        "1", 
        "pcs", 
        "100", 
        "cash", 
        "", 
        undefined
    )) ;
}

function exampleDelete() {
    const t = "2026-08-10T13:10:01.874";
    console.log(t) 
    console.log(JSON.stringify(deleteRow(t))) 
}

function exampleData() {
    console.log(getDataOf("2026-07-21")) 
}

function exampleDate() {
    console.log(getDates("2026-07-22"))
}

function exampleCalendar() {
    console.log(JSON.stringify(calendar()))
}

function exampleFilter() {
    console.log(JSON.stringify(sortData(getDataOf("2026-07-25").data, [{"Date":" asc"}], columnNames))) 
}

function exampleFilter1() {
    console.log(
        JSON.stringify(
            getDataOfFilter(
              
                {
                    "Stakeholder": [
                        [
                            {value:"Abhirup Nag"},
                        ]
                    ]
                }, 
                [], 
                [], 
                [], 
               
            )
        )
    )
}

function exampleFilter2() {
    console.log(
        JSON.stringify(
            getDataOfFilter(
              
                {
                    "Date": [
                        [
                            {value:"2026-08-05"},
                        ]
                    ]
                }, 
                [], 
                ["Stakeholder"], 
                [], 
               
            )
        )
    )
}

function exampleFilter3() {
    console.log(
        JSON.stringify(
            getDataOfFilter(
            
                {
                    "Date Range": [
                        [
                            {value:"2026-07-01"}, 
                            {value: "2026-08-02"}
                        ]
                    ], 
                    "Stakeholder": [
                        [
                            {value: "Souptik Mandal"}
                        ]
                    ]
                }, 
                [], 
                ["Stakeholder"], 
                ["Sum of expenses"], 
                true
            ) 
        )
    )
}

function exampleFilter4() {
    const reportTypes = ReportTypes.Weekly
    const sortObj = {}
    sortObj[reportTypes.field] = "desc";
    const obj = rowColumnBreakup(
        {
            "Date Range": [
                [
                    {value:"2026-07-01"}, 
                    {value: "2026-08-02"}
                ]
            ]
        }, 
        [{"Stakeholder":"asc"},sortObj],
        ["Stakeholder"],
        [reportTypes.field, "Category"], 
        ["Sum of expenses"]
    ) 
        
    
    console.log(
        JSON.stringify(
            obj, null, 4
        )
    )
}

function exampleFilter5() {
    console.log(
        JSON.stringify(
            getDataOfFilter(
            
                {
                    "Stakeholder": [
                        [
                            {value:"Souptik Mandal"}
                        ]
                    ]
                }, 
                [{"Month":"asc"}], 
                ["Month"], 
                [], 
                false
            ) 
        )
    )
}

function exampleChartImages() {
    console.log(
        JSON.stringify(
            
            getChartImages(
            
                {
                    "Date Range": [
                        [
                            {value:"2026-07-01"}, 
                            {value: "2026-08-02"}
                        ]
                    ]
                }, 
                [], 
                ["Stakeholder", "Month", "Year"], 
                ["Sum of expenses"], 
            ) 
        )
    )
}


function exampleSaveFilter() {
    console.log(JSON.stringify(saveReport(
        "Test Name", 
        {
            "Date Range": [
               [
                    {value:"2026-07-01"}, 
                    {value: "2026-08-02"}
                ]
            ], 
            "Stakeholder": [
                [
                    {value: "Souptik Mandal"}
               ]
            ]
        }, 
        ["Stakeholder"], 
        ["Stakeholder"], 
        ["Sum of expenses"]
    ))) 
}

function exampleBackup()  {
    backup({
        "Date Range": [
               [
                    {value:"2026-07-01"}, 
                    {value:"2026-07-31"}
                ]
            ], 
    })
}

function exampleBackupSearch()  {
    backupSearch({
        "Date Range": [
               [
                    {value:"2026-07-01"}, 
                    {value:"2026-07-31"}
                ]
            ], 
    })
}

function exampleRestore()  {
    restore({
        "Date Range": [
               [
                    {value:"2026-07-01"}, 
                    {value:"2026-07-31"}
                ]
            ], 
    })
}


function exampleLoadVars() {
    console.log(JSON.stringify(getFilterRow(getSavedFilterNames()[0])))
}

function showSavedFilters() {
    console.log(JSON.stringify(getSavedFilterNames()));
}

function methodStringify() {
    console.log(calendar.toString()) 
}

function testautoRowColumnBreakUp() {
    const reportTypes = ReportTypes.Daily;
    const groupList = ["Stakeholder", reportTypes.field]
    const dateFilter = reportTypes.filter()
    const allData = getAllData() 
    
    
    const rows = filterRows(allData, dateFilter)
    
    const data = processRows(rows, groupList.length == 0) 
    const summary = autoRowColumnBreakUp(reportTypes, data, groupList, true)    
    console.log(JSON.stringify(summary.bookmarks, null, 4))
}

function testprepareGroupByTable() {
    const reportTypes = ReportTypes.Daily;
    const groupList = ["Stakeholder", reportTypes.field]
    const dateFilter = reportTypes.filter()
    const allData = getAllData() 
    
    
    const rows = filterRows(allData, dateFilter)
    
    const data = processRows(rows, groupList.length == 0) 
    
    const output = prepareGroupByTable(reportTypes, data, groupList, true)
    console.log(JSON.stringify(output.bookmarks, null, 4))

}
