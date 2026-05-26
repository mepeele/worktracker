function setSchedule(hours) {
    targetHours = hours; localStorage.setItem('target_hours', hours);
    weeklyLogs = weeklyLogs.map(log => { log.varianceMinutes = log.netWorkMinutes - (targetHours * 60); return log; });
    saveLogs(); updateUI();
}

function convertMinutesToFractionalHours(m) { return (Math.round((m / 60) * 4) / 4).toFixed(2); }

function getExactNetMinutes(tIn, lOut, lIn, tOut) {
    if (!tIn || !tOut) return 0;
    const diff = Math.max(0, Math.floor((tOut - tIn) / 60000));
    let lunch = 30;
    if (lOut && lIn) { const act = Math.floor((lIn - lOut) / 60000); if (act > 30) lunch = act; }
    return Math.max(0, diff - lunch);
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    return Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7);
}

function clearOldWeeksLogs() { const current = getWeekNumber(new Date()); weeklyLogs = weeklyLogs.filter(log => log.weekOfYear === current); saveLogs(); }
