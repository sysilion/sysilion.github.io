let alarmSchedule = null;
let alarmCheckInterval = null;
let firedToday = false;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  loadAlarmSchedule();
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('message', event => {
  const { type, time } = event.data;
  if (type === 'set') {
    alarmSchedule = time;
    firedToday = false;
    if (!alarmCheckInterval) {
      startAlarmCheck();
    }
  } else if (type === 'cancel') {
    alarmSchedule = null;
    firedToday = false;
    if (alarmCheckInterval) {
      clearInterval(alarmCheckInterval);
      alarmCheckInterval = null;
    }
  }
});

function loadAlarmSchedule() {
  // 페이지가 없을 때 IndexedDB 또는 localStorage를 통해 알람 정보 로드
  try {
    const stored = self.registration.scope;
    // Service Worker는 localStorage에 접근 불가하므로, 클라이언트로부터 메시지 대기
    if (alarmSchedule && !alarmCheckInterval) {
      startAlarmCheck();
    }
  } catch (error) {
    console.error('알람 정보 로드 실패', error);
  }
}

function startAlarmCheck() {
  if (alarmCheckInterval) clearInterval(alarmCheckInterval);
  alarmCheckInterval = setInterval(checkAlarm, 1000); // 1초마다 확인 (더 정확한 감지)
  checkAlarm(); // 즉시 확인
}

function checkAlarm() {
  if (!alarmSchedule) return;
  
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  // 시간과 분이 일치하고 초가 0~9 사이일 때만 알람 발동 (중복 방지)
  if (hours === alarmSchedule.hour && minutes === alarmSchedule.minute && seconds < 10) {
    if (!firedToday) {
      firedToday = true;
      triggerAlarm();
    }
  } else if (hours === 0 && minutes === 0 && seconds < 10) {
    firedToday = false;
  }
}

function triggerAlarm() {
  const label = alarmSchedule.label || '설정된 시간';
  const title = 'NTE 알람';
  const options = {
    body: `${label}에 알림이 도착했습니다.`,
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIgMTkyIj48cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgcng9IjM2IiBmaWxsPSIjN2MzYWVkIi8+PHRleHQgeD0iNTAlIiB5PSI1NCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJQcmV0ZW5kYXJkLCBzYW5zLXNlcmlmIiBmb250LXNpemU9Ijg4IiBmaWxsPSIjZmZmIj5OPC90ZXh0Pjwvc3ZnPg==',
    badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIgMTkyIj48cmVjdCB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgcng9IjM2IiBmaWxsPSIjN2MzYWVkIi8+PHRleHQgeD0iNTAlIiB5PSI1NCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJQcmV0ZW5kYXJkLCBzYW5zLXNlcmlmIiBmb250LXNpemU9Ijg4IiBmaWxsPSIjZmZmIj5OPC90ZXh0Pjwvc3ZnPg==',
    tag: 'nte-alarm',
    requireInteraction: true
  };

  self.registration.showNotification(title, options);
  
  // 열린 클라이언트에도 알림
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'alarm', label });
    });
  });
}
