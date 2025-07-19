# Discord 웹후크 설정 가이드

Discord 채널에 매일 메뉴를 전송하기 위한 웹후크 설정 방법입니다.

## 1. Discord 웹후크 생성

### 1.1 Discord 서버 설정

1. Discord 서버에서 메뉴를 받을 채널을 선택합니다
2. 채널 설정(톱니바퀴 아이콘) 클릭
3. 좌측 메뉴에서 **연동** > **웹후크** 선택
4. **새 웹후크** 버튼 클릭

### 1.2 웹후크 설정

1. 웹후크 이름 입력 (예: "식단표 알림 봇")
2. 아바타 이미지 설정 (선택사항)
3. 채널 선택 확인
4. **웹후크 URL 복사** 버튼 클릭

## 2. 환경변수 설정

`.env` 파일에 복사한 웹후크 URL을 추가합니다:

```env
# Discord 웹후크 URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

## 3. 크론 작업 스케줄

현재 설정된 스케줄:

- **매일 아침 8시 (월~금)**: 오늘의 메뉴 전송
- **매주 월요일 8시 30분**: 주간 식단표 전송

### 스케줄 수정 방법

`src/cron/cron.service.ts` 파일에서 `@Cron` 데코레이터의 값을 수정:

```typescript
@Cron('0 0 8 * * 1-5') // 매일 | 월~금 | 8시 | 정각
```

크론 표현식 형식: `초 분 시 일 월 요일`

## 4. 테스트 API 엔드포인트

서버 실행 후 다음 엔드포인트로 테스트할 수 있습니다:

### 4.1 연결 상태 확인

```bash
GET http://localhost:3000/discord/health
```

### 4.2 간단한 메시지 테스트

```bash
POST http://localhost:3000/discord/test-message
Content-Type: application/json

{
  "message": "테스트 메시지입니다!"
}
```

### 4.3 오늘의 메뉴 테스트

```bash
POST http://localhost:3000/discord/test-today-menu
```

### 4.4 주간 메뉴 테스트

```bash
POST http://localhost:3000/discord/test-weekly-menu
```

### 4.5 임베드 메시지 테스트

```bash
POST http://localhost:3000/discord/test-embed
Content-Type: application/json

{
  "title": "테스트 제목",
  "description": "테스트 설명입니다."
}
```

## 5. 메시지 형태

### 5.1 오늘의 메뉴

- 이모지와 함께 깔끔한 형태로 전송
- 점심과 저녁 메뉴를 구분하여 표시
- 코스별로 메뉴 정리

### 5.2 주간 식단표

- 요일별로 정리된 전체 주간 메뉴
- 한눈에 보기 쉬운 형태로 구성

## 6. 문제 해결

### Discord 연결 실패

1. 웹후크 URL이 정확한지 확인
2. 웹후크가 삭제되지 않았는지 확인
3. 서버에 인터넷 연결이 정상인지 확인

### 메뉴 정보 없음

1. `MENU_SITE_URL` 환경변수 확인
2. `GEMINI_API_KEY` 환경변수 확인
3. 크롤링 대상 사이트 접근 가능 여부 확인

## 7. 커스터마이징

### 메시지 형태 변경

`src/discord/discord.service.ts` 파일에서 메시지 템플릿 수정

### 스케줄 변경

`src/cron/cron.service.ts` 파일에서 크론 표현식 수정

### 아바타/사용자명 변경

`src/discord/discord.service.ts` 파일에서 `username`과 `avatarURL` 수정
