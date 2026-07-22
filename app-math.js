function getExactNetMinutes(tIn, lOut, lIn, tOut) {
    if (!tIn || !tOut) return 0;
    
    // Create clean copies stripped entirely of seconds and milliseconds
    let cleanIn = new Date(tIn); cleanIn.setSeconds(0, 0);
    let cleanLOut = new Date(lOut); cleanLOut.setSeconds(0, 0);
    let cleanLIn = new Date(lIn); cleanLIn.setSeconds(0, 0);
    let cleanOut = new Date(tOut); cleanOut.setSeconds(0, 0);

    let rawShiftMin = Math.round((cleanOut - cleanIn) / 60000);
    let rawLunchMin = Math.round((cleanLIn - cleanLOut) / 60000);
    if (rawLunchMin < 0) rawLunchMin = 0;
    
    let calculated = rawShiftMin - rawLunchMin;
    return isNaN(calculated) ? 0 : calculated;
}

function convertMinutesToQuarterHours(minutes) {
    let rawHours = minutes / 60;
    // Snaps cleanly to the nearest 0.25 block increments
    return (Math.round(rawHours * 4) / 4).toFixed(2);
}

function getWeekNumber(d) {
    let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() - date.getUTCDay());
    let startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - startOfYear) / 86400000) + 1) / 7);
}

function clearOldWeeksLogs() {
    let currentWeek = getWeekNumber(new Date());
    let filtered = weeklyLogs.filter(log => log.weekOfYear === currentWeek);
    if (filtered.length !== weeklyLogs.length) { weeklyLogs = filtered; saveLogs(); }
}

function parseTimeStringToDate(timeStr, baseDate) {
    if (!timeStr) return null;
    const [hrs, mins] = timeStr.split(':').map(Number);
    if (isNaN(hrs) || isNaN(mins)) return null;
    let target = new Date(baseDate.getTime());
    target.setHours(hrs, mins, 0, 0);
    return target;
}
