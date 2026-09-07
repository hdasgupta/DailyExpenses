
const Filters = {
    Date: getDateFilters, 
    Week: getWeekFilters, 
    BillingMonth: getBillingMonthFilters, 
    Year: getYearFilters
}
const Dashboards = {
    ByDay: {
        title:"Daily Expenses", 
        url: "by-day", 
        filters: {
                getDateFilter: Filters.Date, 
                count: 7
        },
        sorts: {
            "Stakeholder": "asc", 
            "Date" : "desc"
        }, 
        groups: [
            "Stakeholder", 
            "Date"
        ], 
        preload: true, 
        
    }, 
    ByWeek: {
        title:"Weekly Expenses", 
        url: "by-week", 
        filters:
            {
                getDateFilter: Filters.Week, 
                count: 4
            }, 
       
        sorts: {
            "Stakeholder": "asc", 
            "Week" : "desc"
        }, 
        groups: [
            "Stakeholder", 
            "Week"
        ], 
        preload: true, 
        
    }, 
    ByBillingMonth: {
        title:"Monthly Expenses", 
        url: "by-billing-month", 
        filters:
            {
                getDateFilter: Filters.BillingMonth, 
                count: 3
            }, 
      
        sorts: {
            "Stakeholder": "asc", 
            "Billing Month" : "desc"
        }, 
        groups: [
            "Stakeholder", 
            "Billing Month"
        ], 
        
        preload: true, 
    }, 
    ByYear: {
        title:"Yearly Expenses", 
        url: "by-year", 
        filters:
            {
                getDateFilter: Filters.Year, 
                count: 2
            }, 
        
        sorts: {
            "Stakeholder": "asc", 
            "Year" : "desc"
        }, 
        groups: [
            "Stakeholder", 
            "Year"
        ], 
        preload: true, 
        
    }, 
    ByDayAndCategory: {
        title:"Categorywise Daily expenses", 
        url: "by-day-and-category", 
        filters:
            {
                getDateFilter: Filters.Date, 
                count: 7
            }, 
       
        sorts: {
            "Stakeholder": "asc", 
            "Date" : "desc", 
            "Category": "desc",
        }, 
        groups: [
            "Stakeholder", 
            "Date", 
            "Category"
        ], 
        preload: true, 
        
    }, 
    ByWeekAndCategory: {
        title:"Categorywise Weekly expenses", 
        url: "by-week-and-category", 
        filters:
            {
                getDateFilter: Filters.Week, 
                count: 4
            }, 
       
        sorts: {
            "Stakeholder": "asc", 
            "Week" : "desc", 
            "Category": "desc",
        }, 
        groups: [
            "Stakeholder", 
            "Week", 
            "Category"
        ], 
        preload: true, 
        
    }, 
    ByBillingMonthAndCategory: {
        title:"Categorywise Monthly expenses", 
        url: "by-billing-month-and-category", 
        filters:
            {
                getDateFilter: Filters.BillingMonth, 
                count: 3
            }, 
        
        sorts: {
            "Stakeholder": "asc", 
            "Billing Month" : "desc", 
            "Category": "desc",
        }, 
        groups: [
            "Stakeholder", 
            "Billing Month", 
            "Category"
        ], 
        preload: true, 
        
    }, 
    ByYearAndCategory: {
        title:"Categorywise yearly expenses", 
        url: "by-year-and-category", 
        filters:
            {
                getDateFilter: Filters.Year, 
                count: 2
            }, 
       
        sorts: {
            "Stakeholder": "asc", 
            "Year" : "desc", 
            "Category": "desc",
        }, 
        groups: [
            "Stakeholder", 
            "Year", 
            "Category"
        ], 
        preload: true, 
        
    }, 
    ByDayVsCategory: {
        title:"Daily expenses by Categories", 
        url: "by-day-vs-category", 
        filters: 
            {
                getDateFilter: Filters.Date, 
                count: 7
            }, 
        
        sorts: {
            "Date" : "desc", 
            "Category": "desc",
        }, 
        groups: [
            "Date", 
            "Category"
        ], 
        
        preload: true, 
    }, 
    ByWeekVsCategory: {
        title:"Weekly expenses by Categories", 
        url: "by-week-vs-category", 
        filters: 
            {
                getDateFilter: Filters.Week, 
                count: 4
            }, 
        
        sorts: {
            "Week" : "desc", 
            "Category": "desc",
        }, 
        groups: [
            "Week", 
            "Category"
        ], 
        
        preload: true, 
    }, 
    ByBillingMonthVsCategory: {
        title:"Monthly expenses by Categories", 
        url: "by-billing-month-vs-category", 
        filters: 
            {
                getDateFilter: Filters.BillingMonth, 
                count: 3
            }, 
       
        sorts: {
            "Billing Month" : "desc", 
            "Category": "desc",
        }, 
        groups: [
            "Billing Month", 
            "Category"
        ], 
        preload: true, 
        
    }, 
    ByYearVsCategory: {
        title:"Yearly expenses by Categories", 
        url: "by-year-vs-category", 
        filters:
            {
                getDateFilter: Filters.Year, 
                count: 2
            }, 
        
        sorts: {
            "Year" : "desc", 
            "Category": "desc",
        }, 
        groups: [
            "Year", 
            "Category"
        ], 
        preload: true, 
        
    }, 
}

const DashboardArray = Object.keys(Dashboards).map((key) => {
    var {title, url, filters, sorts, groups, preload} = Dashboards[key]
    filters = filters.getDateFilter(filters.count) 
    sorts = Object.keys(sorts).map((key) => {
        const sort = {}
        sort[key] = sorts[key]
        return sort
    }) 
    const summaries = ["Sum of expenses"]
    
    const output = {key, title, url, filters, sorts, groups, summaries, preload}
    
    return output
}) 

function getPreloadDateFilters() {
    const preloadDashboard = DashboardArray.filter((dashboard) => dashboard.preload) 
    
    const from = preloadDashboard.map((dashboard) => dashboard.filters["Date Range"][0][0].value).sort((a, b) => a.localeCompare(b))[0]
    
    const to = preloadDashboard.map((dashboard) => dashboard.filters["Date Range"][0][1].value).sort((a, b) => b.localeCompare(a))[0]
    
    const filter = {
        "Date Range": [
            [
                {value: from}, 
                {value: to}, 
            ]
        ]
    }
    return filter
}

function getPreloadedData() {
    const allData = getAllData() 
    
    
    const rows = filterRows(allData, getPreloadDateFilters())
    
    return rows
}

function getDateFilters(count) {
    const filter = {
        "Date Range": [
            [
                {value: getPreviousDay(count)}, 
                {value: getPreviousDay(1)}, 
            ]
        ]
    }
    return filter
}

function getWeekFilters(count) {
    const filter = {
        "Date Range": [
            [
                {value: getFewWeeksAgo(getMondayBeforeSunday(getLastSunday()), count-1) }, 
                {value:  getLastSunday()}, 
            ]
        ]
    }
    return filter
}

function getBillingMonthFilters(count) {
    const filter = {
        "Date Range": [
            [
                {value: getFewMonthAgo(getLastFifthOfMonth(getLastFourthOfMonth()), count-1) }, 
                {value:  getLastFourthOfMonth()}, 
            ]
        ]
    }
    return filter
}

function getYearFilters(count) {
    const filter = {
        "Date Range": [
            [
                {value: getFewYearsAgo(getFirstJanOfLastYear(), count - 1)}, 
                {value: getLastDec31()}, 
            ]
        ]
    }
    return filter
}
