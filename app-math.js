function setSchedule(hours) {
    targetHours = hours; localStorage.setItem('target_hours', hours);
    weeklyLogs = weeklyLogs.map(log => { log.varianceMinutes = log.netWorkMinutes - (targetHours * 60); return log; });
    saveLogs(); updateUI();
}

function convertMinutesToFractionalHours(m) { return (Math.round((m / 60) * 4) / 4).toFixed(2); }

// FIXED: Converts raw milliseconds to precise whole minutes before calculating the differences
function getExactNetMinutes(tIn, lOut, lIn, tOut) {
    if (!tIn || !tOut) return 0;
    
    // Convert timestamps to absolute minutes from epoch to avoid boundary rounding bugs
    const minIn = Math.floor(new Date(tIn).getTime() / 60000);
    const minOut = Math.floor(new Date(tOut).getTime() / 60000);
    const totalShiftMinutes = Math.max(0, minOut - minIn);
    
    let lunchDuration = 30; // Default flat deduction
    
    if (lOut && lIn) {
        const minLunchOut = Math.floor(new Date(lOut).getTime() / 60000);
        const minLunchIn = Math.floor(new Date(lIn).getTime() / 60000);
        const actualLunchMinutes = Math.max(0, minLunchIn - minLunchOut);
        
        // Only override the 30-minute standard deduction if your actual lunch run went over 30 minutes
        if (actualLunchMinutes > 30) {
            lunchDuration = actualLunchMinutes;
        }
    }
    
    return Math.max(0, totalShiftMinutes - lunchDuration);
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    return Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7);
}

function clearOldWeeksLogs() { const current = getWeekNumber(new Date()); weeklyLogs = weeklyLogs.filter(log => log.weekOfYear === current); saveLogs(); }
