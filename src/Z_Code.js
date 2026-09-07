const Path = {
     dashboard: {
         html: "Dashboard", 
         serverData: getDashboardData(), 
         title:"Daily Expenses Dashboard"
     }, 
     index: {
         html: "Index", 
         title: "Daily Expenses", 
         serverData: getServerData() 
     }
 }
var path
function getServerData() {
    const serverData = {
        today : getToday(), 
        stakeholders : getStakeholders(), 
        name : getFullUserName(), 
        permissions : getPermissions(), 
        notes : getNotes(), 
        availableFilters : getFilters(), 
        options, 
        columns : columns.map((column)=>column.title), 
        groupCols: groupByColumns, 
        summaries, 
        logoBase64: getLogo(), 
        widths, 
        getDates: getDates.toString(), 
        getShare: getShare.toString(), 
        calendar: calendar.toString(), 
        verify: verify.toString(), 
        verifyShare: verifyShare.toString(), 
        dateFilters, 
        verifyFilter: verifyFilter.toString() , 
        chartClasses: [
            TableType.toString(), 
            Table.toString(), 
            MergedCell.toString(), 
            Chart.toString(), 
            ChartData.toString(), 
            ChartDataset.toString()
        ], 
        chartFuncs: [
            
        ], 
        chartVars: {
            Group, 
            Sort, 
            groupByColumns, 
            summaries, 
            rowGroupsPriority, 
            colGroupsPriority, 
            ReportTypes, 
        }
    }
    return serverData
} 

function getDashboardData() {
    const dashboardData = {
        screens: ["home", "summary", "detail"], 
        dashboards: DashboardArray, 
        preloadData : getPreloadedData(), 
        name : getFullUserName(), 
        permissions : getPermissions(),
        notes : getNotes(), 
        cls: [
            Table, 
            Chart, 
            ChartData, 
            ChartDataset, 
            MergedCell, 
            Chart2Dataset, 
            Chart3Column, 
            Chart3Row, 
            Chart3
        ], 
        vars:{
            columnNames, 
            billingDays, 
            Group, 
            Sort, 
            rowGroupsPriority, 
            colGroupsPriority, 
            TableType, 
        }, 
        funcs: [
            checkDate, 
            getDateString, 
            checkDateRange, 
            getDateRangeString, 
            checkBillingDate, 
            getBillingMonthString, 
            checkYear, 
            getYearString, 
            checkStakeholder, 
            getStakeholderString, 
            checkItem, 
            getItemString, 
            populateDate, 
            getShare, 
            populateShare, 
            dbFormatShare, 
            populateProof, 
            filterRows, 
            processRows, 
            processRow, 
            prepareGroupByTable, 
            groupTable, 
            processGroupBy, 
            splitGroups, 
            rowColumnBreakupSummary, 
            convertData, 
            sortData, 
            processSummary, 
            convertSummaries, 
            breakup, 
            summarize, 
            getSummaryExpense, 
            sum, 
            roundOf,
            getSummaryStakeholder, 
            join, 
            getSummaryCategory, 
            getSummaryItem, 
            convertToArrayData, 
            splitRowColumnData, 
            createArray, 
            sortLevel, 
            printHeader, 
            printData, 
            addTotal, 
            isNumber, 
            printColData, 
            getStakeHolder, 
            getYear, 
            getBillingMonth, 
            getWeek, 
            getDate, 
            getCategory, 
            removeCategory, 
            getItem, 
            groupBy, 
            processGroupRow,
            processPrice, 
            getGroupData, 
            setGroupData, 
            toYYYYMMDDFormat, 
            getCurrentOrComingSunday, 
            getMondayBeforeSunday, 
            getLastFifthOfMonth, 
            getColumnIndex, 
            sortGroup, 
            getGroupedChartImages, 
            getFilter, 
            masterChart, 
            generateChartData, 
            generateChart, 
            generateChart2, 
            generateChart3, 
        ]
    }
    dashboardData.vars.availableFilters = {}
    
    Object.keys(availableFilters).forEach((key) =>{
        const {multiple, checker, fields, toString, stringPriority} = availableFilters[key]
        dashboardData.vars.availableFilters[key] = {
            multiple, 
            checker: checker.toString(), 
            fields, 
            toString: toString.toString(), 
            stringPriority
        }
    }) 
    
    dashboardData.vars.columns = []
    
    columns.forEach(({title, indices, func, reverseFunc, prefix, joinBy, hide}) =>{
        
        dashboardData.vars.columns.push({
            title, 
            indices, 
            func: func?.toString(), 
            reverseFunc: reverseFunc?.toString(), 
            prefix, 
            joinBy, 
            hide
        }) 
    }) 
    
    dashboardData.vars.summaries = {}
    
    Object.keys(summaries).forEach((key) =>{
        const {extractor, summarizer} = summaries[key]
        
        const {initial, reducer, unique, finalFunc} = summarizer
        
        dashboardData.vars.summaries[key] = {
            extractor: extractor. toString(), 
            summarizer: {
                initial, 
                reducer : reducer.toString(), 
                unique, 
                finalFunc: finalFunc?.toString() 
            }
        }
        
        
    }) 
    
    dashboardData.vars.groupByColumns = {}
    
    Object.keys(groupByColumns).forEach((key) =>{
        const {extract, similar, process, group, sort, isDate} = groupByColumns[key]
        
        dashboardData.vars.groupByColumns[key] = {
            extract: extract.toString(), 
            similar, 
            process: process?.toString(), 
            group, 
            sort, 
            isDate
        }
    }) 
    
    dashboardData.vars.ChartType = {}
    
    Object.keys(ChartType).forEach((key) => {
        const {generator, addDetails} = ChartType[key]
        dashboardData.vars.ChartType[key] = {
            generator: generator.toString(), 
            addDetails
        }
    })
    
    dashboardData.cls = dashboardData.cls.map((c) => c.toString())
    
    dashboardData.funcs = dashboardData.funcs.map((func) => func.toString()) 
    
    return dashboardData
}
 
function doGet(e) {
    const paths = (e.pathInfo||"").split("/")
    var pathInfo = paths[0]|| "index";
    path = Path[pathInfo]
    if(e.pathInfo) {
        path.serverData.screen = path.serverData.screens[paths.length - 1]
        
        path.serverData.screenUrl = paths.length ==2 ? paths[1]: undefined
    }
    
    const html = path. html;
    const template = HtmlService.createTemplateFromFile(html);
    
    Object.assign(template, path.serverData);

    const output = template. evaluate();

    output.setTitle(
        path.title
    );
    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');;

    console.log("doGet ended");
    return output;
}

function include(filename) {
  const template = HtmlService.createTemplateFromFile(filename);
  
  // Assign passed variables to the partial template context
  Object.assign(template, path.serverData);
  
  return template.evaluate().getContent();
}
