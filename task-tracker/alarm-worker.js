let schedule = null;
let firedToday = false;

function parseSchedule(data) {
    if (!data || typeof data.hour !== 'number' || typeof data.minute !== 'number') return null;
    return { hour: data.hour, minute: data.minute, label: data.label || '' };
}

function nowMatches() {
    if (!schedule) return false;
    const now = new Date();
    return now.getHours() === schedule.hour && now.getMinutes() === schedule.minute;
}

function checkAlarm() {
    if (!schedule) return;
    const now = new Date();
    if (nowMatches()) {
        if (!firedToday) {
            firedToday = true;
            postMessage({ type: 'alarm', label: schedule.label });
        }
    } else if (now.getHours() === 0 && now.getMinutes() === 0) {
        firedToday = false;
    }
}

onmessage = event => {
    const { type, time } = event.data;
    if (type === 'set') {
        schedule = parseSchedule(time);
        firedToday = false;
    }
    if (type === 'cancel') {
        schedule = null;
        firedToday = false;
    }
};

setInterval(checkAlarm, 1000 * 10);
