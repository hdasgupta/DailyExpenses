function toYYYYMMDDFormat(date) {
    return date.toISOString().split('T')[0];
}

function calendar(month, year) {
    const today = new Date()
    if(!month) {
        month = today.getMonth()
    }
    if(!year) {
        year = today.getFullYear()
    }
    const day = new Date(year, month, 1)
    var week = [{}, {}, {}, {}, {}, {}, {}]
    const dates = []
    var cal = {}
    day.setHours(5, 30, 0)
    while(day.getMonth() == month) {
        const weekDay = (day.getDay()+6)%7;
        const prev = new Date(day.getTime());
        const next = new Date(day.getTime());
        if(weekDay == 0 && day.getDate()> 1) {
            dates. push(week)
            week = [{}, {}, {}, {}, {}, {}, {}]
        }
        
        prev.setDate(day.getDate() - 1);
        next.setDate(day.getDate() + 1);
        
        week[weekDay]["day"] = day.getDate()
        week[weekDay]["currDay"] = toYYYYMMDDFormat(day);
        week[weekDay]["prevDay"] = toYYYYMMDDFormat(prev);
        week[weekDay]["nextDay"] = toYYYYMMDDFormat(next);
        
        day.setDate(day.getDate() + 1)
    }
    dates.push(week)
    
    cal["dates"]= dates
    cal["prev"] = {
        month: (month - 1) < 0 ? 11 : (month - 1), 
        year: (month - 1) < 0? (year - 1) : year
    }
    cal["next"] = {
        month: (month +1) > 11 ? 0 : (month + 1), 
        year: (month + 1) > 11 ? (year + 1) : year
    }
    
    return cal
}

function getLastSunday(date = new Date()) {
  const d = new Date(date);
  d.setHours(5, 30, 0, 0) 
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // If today is Sunday (0), go back 7 days to get the *previous* Sunday.
  // Otherwise, subtract the current day count.
  const diff = day === 0 ? 7 : day;
  
  d.setDate(d.getDate() - diff);
  return toYYYYMMDDFormat(d);
}

function getCurrentOrComingSunday(date = new Date()) {
  const d = new Date(date);
  d.setHours(5, 30, 0, 0) 
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // If today is Sunday (0), diff is 0.
  // Otherwise, calculate days remaining until Sunday (7 - day).
  const diff = day === 0 ? 0 : 7 - day;
  
  d.setDate(d.getDate() + diff);
  return toYYYYMMDDFormat(d);
}

function getMondayBeforeSunday(sundayDate) {
  const d = new Date(sundayDate);
  d.setHours(5, 30, 0, 0) 
  d.setDate(d.getDate() - 6);
  return toYYYYMMDDFormat(d);
}

function getThreeWeeksAgo(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - 21);
  return toYYYYMMDDFormat(d);
}

function getLastFifthOfMonth(date = new Date()) {
  const d = new Date(date);
  
  // If today is before the 5th, go to previous month
  if (d.getDate() < 5) {
    d.setMonth(d.getMonth() - 1);
  }
  
  d.setDate(5);
  return toYYYYMMDDFormat(d);
}

function getThreeMonthAgo(date = new Date()) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 3);
  return toYYYYMMDDFormat(d);
}

function getLastFourthOfMonth(date = new Date()) {
  const d = new Date(date);
  
  // If today is before the 4th, step back to previous month
  if (d.getDate() < 4) {
    d.setMonth(d.getMonth() - 1);
  }
  
  d.setDate(4);
  return toYYYYMMDDFormat(d);
}

function getCurrentOrComingFourth(date = new Date()) {
  const d = new Date(date);
  
  // If today is past the 4th, move to next month
  if (d.getDate() > 4) {
    d.setMonth(d.getMonth() + 1);
  }
  
  d.setDate(4);
  return toYYYYMMDDFormat(d);
}

function oneDayAfter(date = new Date()) {
    const d = new Date(date);
    
    d.setDate(d.getDate() +1) 
    
    return toYYYYMMDDFormat(d);
}

function getFirstJanOfLastYear(date = new Date()) {
  const previousYear = date.getFullYear() - 1;
  return toYYYYMMDDFormat(new Date(previousYear, 0, 1)); // Month index 0 = January, Day = 1
}

function getLastDec31(date = new Date()) {
  const previousYear = date.getFullYear() - 1;
  return toYYYYMMDDFormat(new Date(previousYear, 11, 31)); // Month index 11 = December, Day = 31
}

function getAYearsAgo(date = new Date()) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - 1);
  return toYYYYMMDDFormat(d) ;
}

function getPreviousDay(offset) {
    const prevday = new Date();
    prevday.setDate(prevday.getDate() - offset);
    return toYYYYMMDDFormat(prevday) ;
}

function getFewWeeksAgo(date = new Date(), count) {
  const d = new Date(date);
  d.setDate(d.getDate() - (count*7));
  return toYYYYMMDDFormat(d);
}


function getFewMonthAgo(date = new Date(), count) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - count);
  return toYYYYMMDDFormat(d);
}

function getFewYearsAgo(date = new Date(), count) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - count);
  return toYYYYMMDDFormat(d) ;
}

