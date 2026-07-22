function setSchedule(hours) {
    targetHours = hours; 
    localStorage.setItem('target_hours', hours);
    
    weeklyLogs.forEach(log => {
        log.varianceMinutes = log.netWorkMinutes - (hours * 60);
    });
    saveLogs(); 

    document.getElementById('toggle8').classList.toggle('active', hours === 8);
    document.getElementById('toggle10').classList.toggle('active', hours === 10);
    document.getElementById('weeklyVarianceLabel').innerText = `Running Net Minutes Variance (${hours}hr Target)`;
    updateUI();
}

function formatTimeToHHMM(dateObj) {
    if (!dateObj) return "";
    let h = String(dateObj.getHours()).padStart(2, '0');
    let m = String(dateObj.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

function updateUI() {
    const actionBtn = document.getElementById('actionBtn');
    const stageSelect = document.getElementById('stageSelect');
    
    const targetHoursFromStorage = parseInt(localStorage.getItem('target_hours')) || 8;
    document.getElementById('toggle8').classList.toggle('active', targetHoursFromStorage === 8);
    document.getElementById('toggle10').classList.toggle('active', targetHoursFromStorage === 10);
    document.getElementById('weeklyVarianceLabel').innerText = `Running Net Minutes Variance (${targetHoursFromStorage}hr Target)`;

    actionBtn.innerText = currentStage;
    stageSelect.value = currentStage;

    if (currentStage === 'Clock In') { actionBtn.style.background = "var(--color-in)"; }
    else if (currentStage === 'Lunch Out') { actionBtn.style.background = "var(--color-l-out)"; }
    else if (currentStage === 'Lunch In') { actionBtn.style.background = "var(--color-l-in)"; }
    else { actionBtn.style.background = "var(--color-out)"; }

    const curCard = document.getElementById('currentShiftCard');
    const rIn = document.getElementById('liveInRow');
    const rLOut = document.getElementById('liveLunchOutRow');
    const rLIn = document.getElementById('liveLunchInRow');

    let hasActiveData = false;
    if (timeIn) { rIn.style.display = "flex"; document.getElementById('liveTimeInDisplay').value = formatTimeToHHMM(timeIn); hasActiveData = true; } else { rIn.style.display = "none"; }
    if (lunchOut) { rLOut.style.display = "flex"; document.getElementById('liveLunchOutDisplay').value = formatTimeToHHMM(lunchOut); hasActiveData = true; } else { rLOut.style.display = "none"; }
    if (lunchIn) { rLIn.style.display = "flex"; document.getElementById('liveLunchInDisplay').value = formatTimeToHHMM(lunchIn); hasActiveData = true; } else { rLIn.style.display = "none"; }
    curCard.style.display = hasActiveData ? "block" : "none";

    let tempOut = new Date();
    let computedIn = timeIn ? timeIn : tempOut;
    let computedLOut = lunchOut ? lunchOut : computedIn;
    let computedLIn = lunchIn ? lunchIn : computedLOut;
    let currentNetMin = getExactNetMinutes(computedIn, computedLOut, computedLIn, tempOut);

    document.getElementById('liveNetDisplay').innerText = convertMinutesToQuarterHours(currentNetMin) + " hrs";
    let activeVariance = currentNetMin - (targetHours * 60);
    let varElement = document.getElementById('liveVarianceDisplay');
    if (activeVariance >= 0) { varElement.innerText = `+${activeVariance}m`; varElement.style.color = "var(--color-in)"; }
    else { varElement.innerText = `${activeVariance}m`; varElement.style.color = "var(--color-out)"; }

    let calculatedWeeklyUnits = 0;
    let totalWeeklyVarianceMinutes = 0;
    weeklyLogs.forEach(log => {
        calculatedWeeklyUnits += (log.productivityUnits || 0);
        totalWeeklyVarianceMinutes += (log.varianceMinutes || 0);
    });

    document.getElementById('weeklyTotalDisplay').innerText = calculatedWeeklyUnits;
    let weeklyVarField = document.getElementById('weeklyVarianceDisplay');
    if (totalWeeklyVarianceMinutes >= 0) { weeklyVarField.innerText = `+${totalWeeklyVarianceMinutes}m`; weeklyVarField.style.color = "var(--color-in)"; }
    else { weeklyVarField.innerText = `${totalWeeklyVarianceMinutes}m`; weeklyVarField.style.color = "var(--color-out)"; }

    renderHistoryFeed();
}

function renderHistoryFeed() {
    const container = document.getElementById('historyFeedContainer');
    container.innerHTML = '';
    if (weeklyLogs.length === 0) { container.innerHTML = '<div class="sub-text" style="text-align:center; padding:20px;">No days tracked yet this week.</div>'; return; }
    
    weeklyLogs.forEach(log => {
        let nHrs = convertMinutesToQuarterHours(log.netWorkMinutes);
        let vText = log.varianceMinutes >= 0 ? `+${log.varianceMinutes}m` : `${log.varianceMinutes}m`;
        let vColor = log.varianceMinutes >= 0 ? "var(--color-in)" : "var(--color-out)";
        let tInStr = formatTimeToHHMM(new Date(log.timeIn));
        let lOutStr = formatTimeToHHMM(new Date(log.lunchOut));
        let lInStr = formatTimeToHHMM(new Date(log.lunchIn));
        let tOutStr = formatTimeToHHMM(new Date(log.timeOut));

        let logCard = document.createElement('div');
        logCard.className = 'card';
        logCard.style.borderLeft = `4px solid ${vColor}`;
        logCard.innerHTML = `
            <div class="row">
                <span class="bold">${log.dateString}</span>
                <span class="bold" style="color: ${vColor};">${vText}</span>
            </div>
            <div class="row" style="margin-top: 6px;">
                <span class="sub-text">Net Worked: ${nHrs} hrs</span>
                <span class="sub-text" style="color: #007AFF; font-weight:600;">Units: ${log.productivityUnits}</span>
            </div>
            <div class="row" style="margin-top:4px; font-size:12px; color:var(--text-muted);">
                <span>Punches: ${tInStr} → ${lOutStr} → ${lInStr} → ${tOutStr}</span>
                <button id="btn-${log.id}" class="live-edit-btn" style="color:var(--text-muted); background:none; border:none; text-decoration:underline; padding:0;" onclick="toggleEditView('${log.id}')">Edit</button>
            </div>
            <div id="edit-${log.id}" class="edit-panel" style="display:none; margin-top:12px; padding-top:12px; border-top:1px dashed #E5E5EA;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span class="sub-text bold">Modify Day Record</span>
                    <button class="live-edit-btn" style="background:#FF3B30; color:#FFF; font-size:11px;" onclick="deleteHistoryEntry('${log.id}')">Delete Entire Entry</button>
                </div>
                <div class="row" style="gap:6px; font-size:12px; margin-bottom:8px;">
                    <label>Units: <input type="number" style="width:50px;" value="${log.productivityUnits}" onchange="modifyHistoryField('${log.id}', 'productivityUnits', this.value)"></label>
                    <label>In: <input type="time" value="${tInStr}" onchange="modifyHistoryTimeField('${log.id}', 'timeIn', this.value)"></label>
                </div>
                <div class="row" style="gap:6px; font-size:12px;">
                    <label>L-Out: <input type="time" value="${lOutStr}" onchange="modifyHistoryTimeField('${log.id}', 'lunchOut', this.value)"></label>
                    <label>L-In: <input type="time" value="${lInStr}" onchange="modifyHistoryTimeField('${log.id}', 'lunchIn', this.value)"></label>
                    <label>Out: <input type="time" value="${tOutStr}" onchange="modifyHistoryTimeField('${log.id}', 'timeOut', this.value)"></label>
                </div>
            </div>
        `;
        container.appendChild(logCard);
    });
}

function modifyHistoryField(id, key, val) {
    let entry = weeklyLogs.find(l => l.id === id);
    if (!entry) return;
    entry[key] = parseInt(val) || 0;
    saveLogs(); updateUI();
}

function modifyHistoryTimeField(id, key, timeString) {
    let entry = weeklyLogs.find(l => l.id === id);
    if (!entry) return;
    let parsedDate = parseTimeStringToDate(timeString, new Date(entry[key]));
    if (!parsedDate) return;
    entry[key] = parsedDate.toISOString();
    
    let tIn = new Date(entry.timeIn);
    let lOut = new Date(entry.lunchOut);
    let lIn = new Date(entry.lunchIn);
    let tOut = new Date(entry.timeOut);
    
    entry.netWorkMinutes = getExactNetMinutes(tIn, lOut, lIn, tOut);
    entry.varianceMinutes = entry.netWorkMinutes - (targetHours * 60);
    saveLogs(); updateUI();
}
