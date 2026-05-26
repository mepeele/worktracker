function stepHistoricTimestamp(id, field, mins) {
    weeklyLogs = weeklyLogs.map(log => {
        if (log.id === id) {
            let d = new Date(log[field]); d.setMinutes(d.getMinutes() + mins); log[field] = d.toISOString();
            log.netWorkMinutes = getExactNetMinutes(new Date(log.timeIn), new Date(log.lunchOut), new Date(log.lunchIn), new Date(log.timeOut));
            log.varianceMinutes = log.netWorkMinutes - (targetHours * 60);
        }
        return log;
    });
    saveLogs(); updateUI();
}

function stepHistoricProductivity(id, step) {
    weeklyLogs = weeklyLogs.map(log => { if (log.id === id) log.productivityUnits = Math.max(0, (log.productivityUnits || 0) + step); return log; });
    saveLogs(); updateUI();
}

function formatVariance(m) { return `${m >= 0 ? '+':''}${m}m`; }
function formatTimeLabel(dString) { return dString ? new Date(dString).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'; }

function updateUI() {
    if (targetHours === 8) {
        document.getElementById('toggle8').classList.add('active'); document.getElementById('toggle10').classList.remove('active');
        document.getElementById('weeklyVarianceLabel').innerText = "Running Net Minutes Variance (8hr Target)";
    } else {
        document.getElementById('toggle8').classList.remove('active'); document.getElementById('toggle10').classList.add('active');
        document.getElementById('weeklyVarianceLabel').innerText = "Running Net Minutes Variance (10hr Target)";
    }
    const btn = document.getElementById('actionBtn'); btn.innerText = currentStage;
    if(currentStage === 'Clock In') btn.style.background = 'var(--color-in)';
    else if(currentStage === 'Lunch Out') btn.style.background = 'var(--color-lunch-out)';
    else if(currentStage === 'Lunch In') btn.style.background = 'var(--color-lunch-in)';
    else btn.style.background = 'var(--color-out)';
    document.getElementById('stageSelect').value = currentStage;
    const activeShiftCard = document.getElementById('currentShiftCard');
    if (timeIn) {
        activeShiftCard.style.display = 'block';
        document.getElementById('liveInRow').style.display = 'flex'; document.getElementById('liveTimeInDisplay').innerText = formatTimeLabel(timeIn);
        document.getElementById('liveLunchOutRow').style.display = lunchOut ? 'flex' : 'none'; if(lunchOut) document.getElementById('liveLunchOutDisplay').innerText = formatTimeLabel(lunchOut);
        document.getElementById('liveLunchInRow').style.display = lunchIn ? 'flex' : 'none'; if(lunchIn) document.getElementById('liveLunchInDisplay').innerText = formatTimeLabel(lunchIn);
        const liveNetMin = getExactNetMinutes(timeIn, lunchOut, lunchIn, new Date());
        document.getElementById('liveNetDisplay').innerText = `${convertMinutesToFractionalHours(liveNetMin)} hrs`;
        const variance = liveNetMin - (targetHours * 60); const varElem = document.getElementById('liveVarianceDisplay');
        varElem.innerText = formatVariance(variance); varElem.style.color = variance >= 0 ? 'green' : 'red';
    } else { activeShiftCard.style.display = 'none'; }
    const currentWeek = getWeekNumber(new Date()); const currentWeeksLogs = weeklyLogs.filter(l => l.weekOfYear === currentWeek);
    document.getElementById('weeklyTotalDisplay').innerText = currentWeeksLogs.reduce((s, l) => s + l.productivityUnits, 0);
    const totalVariance = currentWeeksLogs.reduce((s, l) => s + l.varianceMinutes, 0);
    const weeklyVarDisplay = document.getElementById('weeklyVarianceDisplay');
    weeklyVarDisplay.innerText = formatVariance(totalVariance); weeklyVarDisplay.style.color = totalVariance >= 0 ? '#34C759' : '#FF3B30';
    const container = document.getElementById('historyFeedContainer'); container.innerHTML = '';
    weeklyLogs.forEach(log => {
        container.innerHTML += `
            <div class="card" style="border: 1px solid #E5E5EA;">
                <div class="row">
                    <div><div class="bold">${log.dateString}</div><div class="sub-text" style="font-size:11px; margin-top:2px; color:#555;">In: <b>${formatTimeLabel(log.timeIn)}</b> | Out: <b>${formatTimeLabel(log.lunchOut)}</b> | In: <b>${formatTimeLabel(log.lunchIn)}</b> | Out: <b>${formatTimeLabel(log.timeOut)}</b></div></div>
                    <div style="display:flex; align-items:center;"><button id="btn-${log.id}" class="edit-btn" onclick="toggleEditView('${log.id}')">Edit</button><button class="del-btn" onclick="deleteHistoryEntry('${log.id}')">Delete</button></div>
                </div>
                <div id="edit-${log.id}" class="edit-panel">
                    <div class="edit-row-container">
                        <div class="row"><span class="stamp-label">Productivity:</span><div style="display:flex; align-items:center; gap:10px;"><button class="live-edit-btn" onclick="stepHistoricProductivity('${log.id}', -1)">-1</button><span class="value-string-box">${log.productivityUnits}</span><button class="live-edit-btn" onclick="stepHistoricProductivity('${log.id}', 1)">+1</button></div></div>
                        <div class="row"><div class="divider" style="width:100%; margin:2px 0;"></div></div>
                        <div class="row"><span class="stamp-label">Clock In:</span><div style="display:flex; align-items:center; gap:10px;"><button class="live-edit-btn" onclick="stepHistoricTimestamp('${log.id}', 'timeIn', -1)">-1m</button><span class="value-string-box">${formatTimeLabel(log.timeIn)}</span><button class="live-edit-btn" onclick="stepHistoricTimestamp('${log.id}', 'timeIn', 1)">+1m</button></div></div>
                        <div class="row"><span class="stamp-label">Lunch Out:</span><div style="display:flex; align-items:center; gap:10px;"><button class="live-edit-btn" onclick="stepHistoricTimestamp('${log.id}', 'lunchOut', -1)">-1m</button><span class="value-string-box">${formatTimeLabel(log.lunchOut)}</span><button class="live-edit-btn" onclick="stepHistoricTimestamp('${log.id}', 'lunchOut', 1)">+1m</button></div></div>
                        <div class="row"><span class="stamp-label">Lunch In:</span><div style="display:flex; align-items:center; gap:10px;"><button class="live-edit-btn" onclick="stepHistoricTimestamp('${log.id}', 'lunchIn', -1)">-1m</button><span class="value-string-box">${formatTimeLabel(log.lunchIn)}</span><button class="live-edit-btn" onclick="stepHistoricTimestamp('${log.id}', 'lunchIn', 1)">+1m</button></div></div>
                        <div class="row"><span class="stamp-label">Clock Out:</span><div style="display:flex; align-items:center; gap:10px;"><button class="live-edit-btn" onclick="stepHistoricTimestamp('${log.id}', 'timeOut', -1)">-1m</button><span class="value-string-box">${formatTimeLabel(log.timeOut)}</span><button class="live-edit-btn" onclick="stepHistoricTimestamp('${log.id}', 'timeOut', 1)">+1m</button></div></div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="row">
                    <span class="sub-text">Net: <b style="color:var(--text-main); font-size:14px;">${convertMinutesToFractionalHours(log.netWorkMinutes)} hrs</b></span>
                    <span class="sub-text" style="color: ${log.varianceMinutes >= 0 ? 'green':'red'}">Variance: <b>${formatVariance(log.varianceMinutes)}</b></span>
                    <span class="bold" style="color: #007AFF">${log.productivityUnits} units</b></span>
                </div>
            </div>`;
    });
}
