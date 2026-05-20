# Universal Task Tracker

## 파일 구성
- `nte/index.html` : 메인 사용자 인터페이스. 체크리스트, 탭, 드래그 순서 조절, 알람 UI, PWA 설치 버튼을 포함합니다.
- `nte/alarm-worker.js` : 웹 워커로 알람 시점을 주기적으로 확인하고 메인 스레드에 알림 이벤트를 보냅니다.
- `nte/manifest.json` : PWA 설치를 위한 앱 메타데이터를 정의합니다.
- `nte/sw.js` : 서비스 워커 초기 등록 스크립트입니다.

## 코드 설명

### `nte/index.html`
- `localStorage`에 다음 값을 저장합니다:
  - `tasks` : 할 일 목록과 순서 정보
  - `lastDailyReset`, `lastWeeklyReset` : 자동 리셋 기준
  - `alarmSchedule` : 알람 예약 시간
- 주요 UI 기능:
  - `switchTab()` : 일간/주간/고정 탭 전환
  - `render()` : 현재 탭에 맞게 할 일 목록을 표시하고 진행률을 계산
  - `toggleTask()` : 항목 완료 상태 토글
  - `addTask()` : 새 항목 추가
  - `deleteTask()` : 항목 삭제
  - `startEdit()` : 더블 클릭 시 항목 이름 편집
  - `dragstart`, `dragover`, `drop` 이벤트를 통해 항목 순서 이동
- 데이터 import/export 기능:
  - `exportData()` : 현재 데이터(JSON)를 파일로 내보내기
  - `importData()` : JSON 파일을 선택하여 데이터 가져오기
- 자동 초기화 정보:
  - `getResetInfo()` : 현재 탭에 맞는 다음 초기화 시각을 계산
  - `daily` : 매일 00:00
  - `weekly` : 다음 월요일 00:00
- 알람 기능 처리:
  - `initAlarmWorker()` : `alarm-worker.js`를 로드
  - `setAlarm()` / `cancelAlarm()` : 알람 예약 및 취소
  - `showAlarmNotification()` : 알림 권한이 허용된 경우 Notification API로 알림 표시
  - `playAlarmSound()` : 간단한 오디오 알람 재생
- PWA 설치 처리:
  - `beforeinstallprompt` 이벤트를 받아 `promptInstall()`로 설치를 실행
  - 설치 가능 여부에 따라 설치 버튼을 표시

### `nte/alarm-worker.js`
- 워커는 10초 간격으로 현재 시간이 예약 시간과 일치하는지 확인합니다.
- 한 번 알람을 발송하면 같은 날에는 중복 알림을 방지합니다.
- 다음 날 00:00에 다시 알람 발송 상태를 초기화합니다.
- 메인 스레드로 `postMessage({ type: 'alarm', label })`를 전송합니다.

### `nte/manifest.json`
- 앱 이름, 시작 URL, 표시 모드, 테마 색상을 정의합니다.
- 설치 가능한 PWA로 브라우저가 인식하게 합니다.

### `nte/sw.js`
- 서비스 워커 설치 및 활성화를 처리합니다.
- 현재는 단순히 모든 요청을 네트워크에서 가져오는 동작만 수행합니다.

## 사용 정보
- `nte/index.html`을 브라우저에서 직접 열어 기본 기능을 테스트할 수 있습니다.
- PWA 설치와 서비스 워커는 HTTPS 또는 `localhost` 환경에서 더 안정적으로 동작합니다.
- `file://`으로 열면 앱 UI는 사용 가능하지만 서비스 워커/설치 버튼 동작이 제한될 수 있습니다.
