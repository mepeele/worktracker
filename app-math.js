function getExactNetMinutes(tIn, lOut, lIn, tOut) {
    let rawShiftMin = (tOut - tIn) / 60000;
    let rawLunchMin = (lIn - lOut) / 60000;
    if (rawLunchMin < 0) rawLunchMin = 0;
    let calculated = Math.round(rawShiftMin - rawLunchMin);
    return isNaN(calculated) ? 0 : calculated;
}

function getWeekNumber(d) {
    let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Adjust to closest preceding Sunday to anchor standard week tracking
    date.setUTCDate(date.getUTCDate() - date.getUTCDay());
    let startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - startOfYear) / 86400000) + 1) / 7);
}

function clearOldWeeksLogs() {
    let currentWeek = getWeekNumber(new Date());
    let filtered = weeklyLogs.filter(log => log.weekOfYear === currentWeek);
    if (filtered.length !== weeklyLogs.length) { weeklyLogs = filtered; saveLogs(); }
}

// Converts HH:MM string from keyboard to an actual Date timestamp
function parseTimeStringToDate(timeStr, baseDate) {
    if (!timeStr) return null;
    const [hrs, mins] = timeStr.split(':').map(Number);
    if (isNaN(hrs) || isNaN(mins)) return null;
    let target = new Date(baseDate.getTime());
    target.setHours(hrs, mins, 0, 0);
    return target;
}
