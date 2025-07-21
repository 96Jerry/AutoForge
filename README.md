<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

# AutoForge

## 설명

식단표 크롤링 및 자동화 시스템

## 기능

- 식단표 웹 크롤링
- Google API 연동 (Gmail, Calendar, Gemini)
- Discord 알림
- 데이터베이스 저장 (PostgreSQL + TypeORM)

## 설치 및 설정

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 데이터베이스 설정

PostgreSQL을 설치하고 데이터베이스를 생성하세요:

```sql
CREATE DATABASE autoforge;
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 설정을 추가하세요:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=autoforge

# Google API 설정
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
GOOGLE_ACCESS_TOKEN=your_access_token
GOOGLE_REFRESH_TOKEN=your_refresh_token
GEMINI_API_KEY=your_gemini_key
GOOGLE_CALENDAR_ID=your_calendar_id

# 크롤링 설정
MENU_SITE_URL=your_menu_site_url

# Discord 설정
DISCORD_WEBHOOK_URL=your_discord_webhook
```

### 4. 실행

```bash
# 개발 모드
pnpm run start:dev

# 프로덕션 모드
pnpm run build
pnpm run start:prod
```

## API 엔드포인트

### 식단표 크롤링

- `POST /crawl/weekly-meal` - 주간 식단표 크롤링 및 저장
- `GET /crawl/current-week` - 현재 주 식단표 조회
- `GET /crawl/saved-meal-plans` - 저장된 모든 식단표 조회
- `POST /crawl/cleanup` - 임시 파일 정리

### 식단표 관리

- `GET /meal-plans` - 모든 식단표 조회
- `GET /meal-plans/current` - 현재 주 식단표 조회
- `GET /meal-plans/recent?limit=10` - 최근 식단표 조회
- `GET /meal-plans/:id` - 특정 식단표 조회
- `DELETE /meal-plans/:id` - 식단표 삭제

## 데이터베이스 스키마

### meal_plans 테이블

- `id`: 기본 키
- `title`: 식단표 제목
- `description`: 설명
- `imageUrl`: 원본 이미지 URL
- `imagePath`: 로컬 저장 경로
- `weekStartDate`: 주간 시작일
- `weekEndDate`: 주간 종료일
- `menuData`: 메뉴 분석 데이터 (JSON)
- `isAnalyzed`: 분석 완료 여부
- `createdAt`: 생성일시
- `updatedAt`: 수정일시

## 개발

### 테스트

```bash
# 단위 테스트
pnpm run test

# E2E 테스트
pnpm run test:e2e

# 크롤링 테스트
pnpm run test:crawl
```

### 빌드

```bash
pnpm run build
```

## 특징

### 중복 방지

- 동일한 주차의 식단표가 이미 존재하는 경우 재크롤링하지 않음
- 효율적인 리소스 사용

### 데이터 영구 저장

- TypeORM을 사용한 안전한 데이터 저장
- PostgreSQL 데이터베이스 활용

### API 기반 접근

- RESTful API를 통한 데이터 접근
- JSON 형태의 구조화된 응답
