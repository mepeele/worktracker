let currentStage = 'Clock In', timeIn = null, lunchOut = null, lunchIn = null, timeOut = null, weeklyLogs = [], targetHours = 8;

window.onload = function() {
    if(localStorage.getItem('weekly_logs')) weeklyLogs = JSON.parse(localStorage.getItem('weekly_logs'));
    if(localStorage.getItem('target_hours')) targetHours = parseInt(localStorage.getItem('target_hours'));
    if(localStorage.getItem('saved_stage')) {
        currentStage = localStorage.getItem('saved_stage');
        if(localStorage.getItem('saved_timeIn')) timeIn = new Date(localStorage.getItem('saved_timeIn'));
        if(localStorage.getItem('saved_lunchOut')) lunchOut = new Date(localStorage.getItem('saved_lunchOut'));
        if(localStorage.getItem('saved_lunchIn')) lunchIn = new Date(localStorage.getItem('saved_lunchIn'));
    }
    if(localStorage.getItem('saved_manual_units')) {
        document.getElementById('prodInput').value = localStorage.getItem('saved_manual_units');
    }
    clearOldWeeksLogs(); updateUI();
};

function saveLogs() { localStorage.setItem('weekly_logs', JSON.stringify(weeklyLogs)); }
function updateLiveUnits() { localStorage.setItem('saved_manual_units', document.getElementById('prodInput').value); }
