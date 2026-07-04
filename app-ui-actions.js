function adjustActiveTime(field, minutes) {
    if (field === 'timeIn' && timeIn) { timeIn.setMinutes(timeIn.getMinutes() + minutes); localStorage.setItem('saved_timeIn', timeIn.toISOString()); }
    else if (field === 'lunchOut' && lunchOut) { lunchOut.setMinutes(lunchOut.getMinutes() + minutes); localStorage.setItem('saved_lunchOut', lunchOut.toISOString()); }
    else if (field === 'lunchIn' && lunchIn) { lunchIn.setMinutes(lunchIn.getMinutes() + minutes); localStorage.setItem('saved_lunchIn', lunchIn.toISOString()); }
    updateUI();
}

function handlePrimaryAction() {
    const now = new Date();
    if (currentStage === 'Clock In') { timeIn = now; currentStage = 'Lunch Out'; localStorage.setItem('saved_timeIn', timeIn.toISOString()); }
    else if (currentStage === 'Lunch Out') { lunchOut = now; currentStage = 'Lunch In'; localStorage.setItem('saved_lunchOut', lunchOut.toISOString()); }
    else if (currentStage === 'Lunch In') { lunchIn = now; currentStage = 'Clock Out & Log Day'; localStorage.setItem('saved_lunchIn', lunchIn.toISOString()); }
    else if (currentStage === 'Clock Out & Log Day') { logDayMetrics(now); return; }
    localStorage.setItem('saved_stage', currentStage); updateUI();
}

function handleStageDropdownChange(newStage) {
    currentStage = newStage; const now = new Date();
    if (newStage === 'Clock In') { timeIn = null; lunchOut = null; lunchIn = null; localStorage.removeItem('saved_timeIn'); localStorage.removeItem('saved_lunchOut'); localStorage.removeItem('saved_lunchIn'); }
    else if (newStage === 'Lunch Out') { if (!timeIn) timeIn = now; lunchOut = null; lunchIn = null; localStorage.setItem('saved_timeIn', timeIn.toISOString()); localStorage.removeItem('saved_lunchOut'); localStorage.removeItem('saved_lunchIn'); }
    else if (newStage === 'Lunch In') { if (!timeIn) timeIn = now; if (!lunchOut) lunchOut = now; lunchIn = null; localStorage.setItem('saved_timeIn', timeIn.toISOString()); localStorage.setItem('saved_lunchOut', lunchOut.toISOString()); localStorage.removeItem('saved_lunchIn'); }
    else if (newStage === 'Clock Out & Log Day') { if (!timeIn) timeIn = now; if (!lunchOut) lunchOut = now; if (!lunchIn) lunchIn = now; localStorage.setItem('saved_timeIn', timeIn.toISOString()); localStorage.setItem('saved_lunchOut', lunchOut.toISOString()); localStorage.setItem('saved_lunchIn', lunchIn.toISOString()); }
    localStorage.setItem('saved_stage', currentStage); updateUI();
}

// Progressive step counters to easily increment units mid-shift without typing
function stepCurrentDayProductivity(amount) {
    let input = document.getElementById('prodInput');
    let currentVal = parseInt(input.value) || 0;
    input.value = Math.max(0, currentVal + amount);
    updateLiveUnits(); updateUI();
}

function logDayMetrics(finalTimeOut) {
    const units = parseInt(document.getElementById('prodInput').value) || 0;
    const fallbackIn = timeIn ? timeIn : finalTimeOut; const fallbackLOut = lunchOut ? lunchOut : fallbackIn; const fallbackLIn = lunchIn ? lunchIn : fallbackLOut;
    const exactNetMin = getExactNetMinutes(fallbackIn, fallbackLOut, fallbackLIn, finalTimeOut);
    const newLog = {
        id: Math.random().toString(36).substr(2, 9), dateString: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        timeIn: fallbackIn.toISOString(), lunchOut: fallbackLOut.toISOString(), lunchIn: fallbackLIn.toISOString(), timeOut: finalTimeOut.toISOString(),
        productivityUnits: units, netWorkMinutes: exactNetMin, varianceMinutes: exactNetMin - (targetHours * 60), weekOfYear: getWeekNumber(new Date())
    };
    weeklyLogs.unshift(newLog); saveLogs();
    
    // Completely wipe active inputs and cache memory to restart clean tomorrow
    document.getElementById('prodInput').value = ''; currentStage = 'Clock In'; timeIn = null; lunchOut = null; lunchIn = null; timeOut = null;
    localStorage.removeItem('saved_stage'); localStorage.removeItem('saved_timeIn'); localStorage.removeItem('saved_lunchOut'); localStorage.removeItem('saved_lunchIn'); localStorage.removeItem('saved_manual_units');
    updateUI();
}

function deleteHistoryEntry(id) { weeklyLogs = weeklyLogs.filter(log => log.id !== id); saveLogs(); updateUI(); }
function toggleEditView(id) { const panel = document.getElementById(`edit-${id}`); const btn = document.getElementById(`btn-${id}`); panel.style.display = (panel.style.display === 'block') ? 'none' : 'block'; btn.innerText = (panel.style.display === 'block') ? 'Done' : 'Edit'; }
