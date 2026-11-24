# [PRD] 애국어(AEGUK) — AI 기반 카메라 문헌 스캔으로 통해 고전 문헌을 학습할 수 있는 앱

## 1. 프로젝트 개요 및 아키텍처 원칙

### 1.1 핵심 목표
* **서비스 정의:** 카메라 문헌 스캔(OCR 원문 보정 + AI 현대어 번역·튜터링), 수준별 고전문학 학습, 실시간 멀티플레이 및 AI 봇 퀴즈 대결을 결합한 모바일 학습 애플리케이션.
* **MVP 개발 원칙:** 일정 지연 요소(알림, 배지 DB, 경험치, 기기 설정 DB 저장, 이미지 크롭·회전 에디터, 고어 500제)를 배제하고 **9개 핵심 테이블**과 **5대 핵심 화면**에 집중하여 실제 동작하는 완성도 높은 프로덕트를 구축한다.

### 1.2 확정 기술 스택

| 구분 | 사용 기술 | 역할 |
| :--- | :--- | :--- |
| **모바일 (Frontend)** | Expo + React Native + TypeScript | iOS/Android 크로스 플랫폼 UI, 옛한글 폰트 렌더링, 이미지 압축, Socket.IO 클라이언트 |
| **백엔드 (Backend)** | Node.js + Express | REST API 서버, 외부 OCR·AI API 보안 프록시, 실시간 게임 상태 관리 |
| **실시간 통신** | Socket.IO | 퀴즈 대기실 동기화, 문제 브로드캐스트, 서버 인메모리(`Map`) 실시간 채점 |
| **데이터베이스** | MariaDB | 9개 핵심 테이블 운영, 비식별 `UUID` 기반 사용자 식별, `JSON` 타입 활용 |
| **초기 데이터** | JSON | 고전문학 작품(`contents.json`) 및 객관식 문제(`quiz_questions.json`) 초기 시딩 |
| **촬영·번역** | OCR + AI API | 문헌 이미지 텍스트 추출 및 학습자 수준 맞춤형 현대어 풀이·튜터링 |

### 1.3 보안 및 안정성 설계 원칙 (Security & Reliability)
1. **비식별 인증(Zero-PII):** 이메일·비밀번호 등 개인식별정보를 일절 수집·저장하지 않는다. 앱 최초 실행 시 기기 로컬 저장소(`AsyncStorage`)에 `UUID v4`를 생성·보관하고 이를 `users.user_id`로 사용한다.
2. **외부 API 키 은닉(Backend Proxy):** 모든 OCR 및 LLM API 호출은 백엔드 서버를 경유하며, API Key는 서버 환경변수(`.env`)에만 보관하여 클라이언트 번들 노출을 원천 차단한다.
3. **데이터베이스 보안:** 모든 SQL 쿼리는 파라미터 바인딩(Prepared Statements)을 사용하여 SQL 인젝션을 방지한다.
4. **네트워크·토큰 과부하 방어:**
   * 업로드 이미지는 클라이언트에서 **500KB 이하 JPEG**로 압축하며, Express 요청 본문 크기 제한을 `1MB`로 설정한다.
   * AI 튜터 채팅 호출 시 전체 대화 이력 대신 **대상 원문 + 최근 6개 메시지**만 컨텍스트로 전송하고, 클라이언트 HTTP 타임아웃은 **20초**로 설정한다.
5. **옛한글 렌더링 보장:** 아래아(`ㆍ`), 반치음(`ㅿ`), 옛이응(`ㆁ`) 등 옛한글이 네모(`□`)로 깨지지 않도록 앱에 **옛한글 지원 폰트(Noto Sans KR 옛한글 / 함초롬체 계열)**를 기본 번들링하여 원문 영역에 적용한다.

---

## 2. 사용자 흐름(User Flow) 및 화면 명세

### 2.1 진입 및 단일 온보딩 플로우 (Onboarding Stack)
* **화면 전환 흐름:** `splash` → (`dashboard` 직행 또는 신규 사용자 **단일 통합 온보딩 화면** → `dashboard`)
* **공통 UX 규칙:** 모든 입력 검증 오류 및 네트워크 예외는 전역 **Toast 알림**(3.5초 자동 소멸)으로 안내하며, API 요청 중에는 중복 제출 방지를 위한 로딩 인디케이터를 표시한다.

| 단계 (`Step`) | 화면명 | UI 동작 및 유효성 검증 규칙 | DB 매핑 |
| :--- | :--- | :--- | :--- |
| **1. `splash`** | 스플래시 | 로컬 `user_id(UUID)` 확인(없으면 신규 생성) 후 `GET /api/users/:userId` 호출. 기존 회원이면 `dashboard`, 미등록이면 `onboarding`으로 이동 | `users.user_id` |
| **2. `onboarding`** | 맞춤 정보 설정<br>(단일 스크롤 화면) | 초기 진입 이탈 방지를 위해 아래 4개 항목을 한 화면에 배치하여 입력 후 저장:<br>① **닉네임:** 앞뒤 공백 제거 후 2~15자 필수<br>② **직업 선택:** `학생` / `일반인` 단일 선택<br>③ **학교급·학년 (조건부 노출):** `job === '학생'`일 때만 `중학교/고등학교` 및 `1~3학년` 선택 영역 활성화<br>④ **학습 목표 & 관심 분야:** 각각 다중 선택 칩 — **항목별 최소 1개 필수** | `users.name`<br>`users.job`<br>`users.school_level`<br>`users.grade`<br>`users.learning_goals`<br>`users.interests` |

### 2.2 메인 대시보드 및 5대 핵심 탭 (`dashboard`)
하단 탭 내비게이션(Bottom Tab Navigator)으로 구성하며, 각 탭은 **로딩 상태(Spinner)**와 **데이터 없음(Empty State) 안내 문구**를 반드시 포함한다.

1. **홈 (`home` 탭):**
   * 사용자 닉네임 환영 배너, 전체 작품 학습 진도율(%) 게이지, 최근 학습 작품 이어하기 카드.
   * 선택한 관심 분야(`interests`) 기반 추천 작품 목록 (학습 이력이 없을 경우 첫 추천 작품 바로가기 버튼 표시).
2. **AI 문헌 스캔 (`scan` 탭 — 2단계 보정 파이프라인):**
   * **1단계 (촬영 및 OCR 추출):** 카메라 촬영 또는 앨범 선택 → 500KB 이하 압축 → `POST /api/ai/ocr` 호출.
   * **2단계 (원문 확인 및 직접 수정):** OCR이 오인식한 옛한글·한자를 사용자가 텍스트 입력창에서 직접 수정한 뒤 **[AI 번역·해설 요청]** 버튼 클릭 (`POST /api/ai/translate`).
   * **3단계 (결과 뷰어):** 원문과 AI 현대어 풀이·핵심 고어·작품 해설 카드 대조 표시, 핵심 고어 옆 **[단어장 저장]** 버튼 및 하단 **[AI 튜터에게 질문하기]** 채팅 모달 연동.
3. **작품 학습관 (`study` 탭):**
   * 갈래(`category`)별 작품 필터링 및 목록 조회.
   * 작품 상세 뷰어: `[원문 / 현대어 / 해설 / 문장 대역 보기]` 탭 전환, **[학습 완료 체크]** 토글, **[단어 추가]** 모달, 하단 **[AI 튜터 채팅]** 모달.
4. **실시간 퀴즈 대결 (`quiz` 탭 — 멀티플레이 + 시연 안전장치):**
   * **모드 A (실시간 방 대결 — Socket.IO):** 방 만들기(6자리 `room_code` 발급) 및 방 코드 입력 입장 모달 → 대기실(`준비 완료` 토글, 방장 **[게임 시작]**).
   * **모드 B (AI 봇 스피드 대결 — 싱글 연습/시연 모드):** 동시 접속자가 없어도 즉시 시작 가능(`GET /api/quiz/solo`). 가상 AI 봇과 5문제(문제당 15초) 실시간 점수 경쟁 진행.
   * **결과 화면:** 최종 점수·순위 표시 및 점수 구간별 프론트엔드 칭호(`훈장 → 진사 → 급제 → 장원급제`) 배지 렌더링.
5. **내 단어장 (`vocab` 탭):**
   * **보기 모드 전환:** `[리스트 보기 / 플래시카드 암기]` 토글 지원. 플래시카드 모드에서는 앞면(고어) 탭 시 뒷면(문맥적 뜻 + 원문 예문 + 출처 작품명)으로 뒤집힘.
   * 개별 단어 삭제 기능 및 저장된 단어가 없을 때의 Empty State 안내 제공.

---

## 3. MariaDB 데이터베이스 스키마 명세 (9개 핵심 테이블)

### 3.1 사용자 및 학습 영역

1. **`users` (사용자 프로필)**
   * `user_id` `CHAR(36) PRIMARY KEY` (비식별 기기 UUID)
   * `name` `VARCHAR(30) NOT NULL`
   * `job` `VARCHAR(20) NOT NULL` (`학생` | `일반인`)
   * `school_level` `VARCHAR(20) NULL` (`중학교` | `고등학교`, 일반인인 경우 `NULL`)
   * `grade` `VARCHAR(10) NULL` (`1학년`~`3학년`, 일반인인 경우 `NULL`)
   * `learning_goals` `JSON NOT NULL` (예: `["고전 문헌 독해", "시험 대비"]`)
   * `interests` `JSON NOT NULL` (예: `["훈민정음", "고려가요"]`)
   * `created_at` `DATETIME DEFAULT CURRENT_TIMESTAMP`

2. **`contents` (고전문학 학습 콘텐츠 — `contents.json` 시딩)**
   * `content_id` `INT AUTO_INCREMENT PRIMARY KEY`
   * `category` `VARCHAR(30) NOT NULL` (갈래: 시조, 가사, 고려가요, 고전소설, 언해본 등)
   * `title` `VARCHAR(100) NOT NULL`
   * `original_text` `TEXT NOT NULL`
   * `modern_text` `TEXT NOT NULL`
   * `explanation` `TEXT`
   * `period` `VARCHAR(50)`
   * `difficulty` `TINYINT DEFAULT 1` (1: 기초, 2: 중급, 3: 심화)

3. **`learning_records` (사용자별 학습 진도)**
   * `record_id` `INT AUTO_INCREMENT PRIMARY KEY`
   * `user_id` `CHAR(36) NOT NULL` (`FK -> users.user_id ON DELETE CASCADE`)
   * `content_id` `INT NOT NULL` (`FK -> contents.content_id ON DELETE CASCADE`)
   * `is_completed` `BOOLEAN DEFAULT TRUE`
   * `studied_at` `DATETIME DEFAULT CURRENT_TIMESTAMP`
   * **제약조건:** `UNIQUE KEY uq_user_content (user_id, content_id)`

4. **`saved_words` (내 단어장)**
   * `saved_id` `INT AUTO_INCREMENT PRIMARY KEY`
   * `user_id` `CHAR(36) NOT NULL` (`FK -> users.user_id ON DELETE CASCADE`)
   * `word` `VARCHAR(50) NOT NULL`
   * `meaning` `VARCHAR(255) NOT NULL`
   * `example_text` `TEXT NULL` (원문 예문)
   * `source_title` `VARCHAR(100) NULL` (출처 작품명 또는 `'문헌 스캔'`)
   * `created_at` `DATETIME DEFAULT CURRENT_TIMESTAMP`
   * **제약조건:** `UNIQUE KEY uq_user_word (user_id, word)` (동일 단어 중복 저장 방지)

### 3.2 AI 스캔 및 통합 튜터 채팅 영역

5. **`translation_records` (카메라 OCR 번역 기록)**
   * `translation_id` `INT AUTO_INCREMENT PRIMARY KEY`
   * `user_id` `CHAR(36) NOT NULL` (`FK -> users.user_id ON DELETE CASCADE`)
   * `original_text` `TEXT NOT NULL` (사용자 보정 완료된 원문)
   * `translated_text` `JSON NOT NULL` (AI 구조화 풀이 JSON)
   * `created_at` `DATETIME DEFAULT CURRENT_TIMESTAMP`
   * *(설계 규칙: 외부 파일 스토리지 부재로 인한 이미지 유실을 막기 위해 텍스트 데이터만 저장)*

6. **`ai_chat_messages` (범용 AI 튜터 대화 로그)**
   * `message_id` `INT AUTO_INCREMENT PRIMARY KEY`
   * `user_id` `CHAR(36) NOT NULL` (`FK -> users.user_id ON DELETE CASCADE`)
   * `translation_id` `INT NULL` (`FK -> translation_records.translation_id ON DELETE CASCADE`)
   * `content_id` `INT NULL` (`FK -> contents.content_id ON DELETE CASCADE`)
   * `role` `ENUM('user', 'assistant') NOT NULL`
   * `message` `TEXT NOT NULL`
   * `created_at` `DATETIME DEFAULT CURRENT_TIMESTAMP`
   * *(설계 규칙: `translation_id`와 `content_id`를 모두 `NULL` 허용으로 두어 스캔 문헌과 기본 작품 대화를 단일 테이블로 통합 관리)*

### 3.3 퀴즈 및 실시간 대결 영역

7. **`quiz_questions` (퀴즈 문제 은행 — `quiz_questions.json` 시딩)**
   * `question_id` `INT AUTO_INCREMENT PRIMARY KEY`
   * `content_id` `INT NOT NULL` (`FK -> contents.content_id ON DELETE CASCADE`)
   * `question` `TEXT NOT NULL`
   * `options` `JSON NOT NULL` (4개 선택지 문자열 배열)
   * `correct_index` `TINYINT NOT NULL` (정답 보기 배열 인덱스: `0`, `1`, `2`, `3`)
   * `difficulty` `TINYINT DEFAULT 1`

8. **`game_rooms` (실시간 퀴즈 방)**
   * `room_id` `INT AUTO_INCREMENT PRIMARY KEY`
   * `host_id` `CHAR(36) NOT NULL` (`FK -> users.user_id`)
   * `room_code` `VARCHAR(10) NOT NULL UNIQUE` (6자리 영문·숫자 입장 코드)
   * `category` `VARCHAR(30) NULL`
   * `status` `ENUM('WAITING', 'PLAYING', 'FINISHED') DEFAULT 'WAITING'`
   * `created_at` `DATETIME DEFAULT CURRENT_TIMESTAMP`

9. **`game_participants` (게임 참가자 및 최종 결과)**
   * `participant_id` `INT AUTO_INCREMENT PRIMARY KEY`
   * `room_id` `INT NOT NULL` (`FK -> game_rooms.room_id ON DELETE CASCADE`)
   * `user_id` `CHAR(36) NOT NULL` (`FK -> users.user_id`)
   * `is_ready` `BOOLEAN DEFAULT FALSE`
   * `score` `INT DEFAULT 0`
   * `final_rank` `TINYINT NULL`
   * **제약조건:** `UNIQUE KEY uq_room_user (room_id, user_id)` (동일 방 중복 입장 방지)

---

## 4. 백엔드 API 및 Socket.IO 통신 규격

### 4.1 REST API 명세 (Express)

* **사용자 및 온보딩**
  * `GET /api/users/:userId` : 기기 UUID 기반 기존 사용자 등록 여부 조회 (미등록 시 `404` 반환).
  * `POST /api/users/onboarding` : 신규 사용자 프로필 및 온보딩 데이터 저장 (`INSERT` / `UPSERT`).
  * `GET /api/users/:userId/dashboard` : 사용자 정보, 학습 완료 진도율(%), 최근 학습 작품, 관심사 맞춤 추천 작품 반환.
* **작품 학습 및 단어장**
  * `GET /api/contents` : 작품 목록 조회 (`?category=` 필터 지원).
  * `GET /api/contents/:contentId` : 작품 상세(`original_text`, `modern_text`, `explanation`) 및 해당 사용자의 완료 여부 조회.
  * `POST /api/learning/complete` : 학습 완료 처리 (`ON DUPLICATE KEY UPDATE studied_at = NOW()`).
  * `GET /api/words/:userId` : 내 단어장 목록 조회.
  * `POST /api/words` : 단어 저장 (`ON DUPLICATE KEY UPDATE meaning = VALUES(meaning)`).
  * `DELETE /api/words/:savedId` : 단어 삭제.
* **OCR 스캔 보정, AI 번역 및 튜터 채팅**
  * `POST /api/ai/ocr` : 압축 이미지 수신 → OCR 원문 텍스트 추출 반환 (`{ raw_text }`).
  * `POST /api/ai/translate` : `{ userId, originalText }` 수신 → AI 구조화 풀이 생성 → `translation_records` 저장 후 결과 반환.
  * `GET /api/ai/translations/:userId` : 사용자의 과거 문헌 스캔 번역 목록 조회.
  * `GET /api/ai/chat` : 기존 AI 튜터 대화 이력 조회 (`?userId=...&contentId=...` 또는 `?userId=...&translationId=...`).
  * `POST /api/ai/chat` : 사용자 질문 저장 → 원문 + 최근 6개 대화 컨텍스트 기반 AI 응답 생성 및 저장 후 반환.
* **싱글(AI 봇) 퀴즈 조회**
  * `GET /api/quiz/solo` : `?category=` 필터 기준 `quiz_questions`에서 무작위 5문항 추출 반환.

### 4.2 실시간 퀴즈 Socket.IO 규격
* **게임 상수 및 방장 규칙:**
  * 한 게임당 **총 5문제**, 문제당 제한시간은 **15초**로 고정한다.
  * 방 생성(`create_room`) 시 `game_rooms` 레코드 생성과 동시에 **방장(`host_id`)을 `game_participants`에 `is_ready = TRUE` 상태로 자동 등록**한다.
* **인메모리 처리 규칙:** 진행 중인 라운드 상태, 타이머, 실시간 점수 합산은 Node.js 서버 메모리(`Map<roomCode, RoomState>`)에서 처리하며, 5라운드 종료 시 `game_rooms.status = 'FINISHED'` 및 `game_participants`의 `score`·`final_rank`를 MariaDB에 일괄 반영한다.
* **소켓 이벤트 목록:**
  * Client → Server: `create_room`, `join_room`, `toggle_ready`, `start_game`, `submit_answer`
  * Server → Client: `room_updated`, `new_question`, `answer_result`, `game_finished`, `error_message`

---

## 5. AI 프롬프트 및 JSON 시드 데이터 규격

### 5.1 AI 번역·해설 시스템 프롬프트 출력 규격
사용자의 `school_level`과 `grade`(일반인의 경우 성인 교양 수준)를 시스템 프롬프트에 주입하고, 응답은 반드시 아래 JSON 스키마로만 반환하도록 강제한다.

```json
{
  "modern_text": "원문의 문맥과 운율을 살린 자연스러운 현대어 풀이",
  "key_vocabulary": [
    {
      "word": "고어 단어",
      "meaning": "문맥적 뜻풀이",
      "example_text": "해당 단어가 포함된 원문 구절"
    }
  ],
  "explanation": "화자의 정서, 핵심 표현법, 문학사적 의의 요약"
}
```

### 5.2 초기 시드 데이터 구조 (`data/`)
* `data/contents.json`: 대표 고전문학 10편 이상(가시리, 청산별곡, 동동, 관동별곡, 사미인곡, 훈민정음 언해본 등).
* `data/quiz_questions.json`: 각 작품(`content_id`)당 3~5문항씩 총 30~50문항의 4지선다 문제(`options` 4개 배열 + `correct_index` `0~3`).

---

## 6. 단계별 개발 로드맵 (Phase 1 ~ Phase 5)

AI 코딩 툴에 아래 순서대로 한 단계씩 지시하여 기능을 구현하고 검증한다.

1. **Phase 1 (DB 및 서버 골격):** Express 서버 초기화, MariaDB 9개 테이블 생성 SQL 및 `contents.json`·`quiz_questions.json` 자동 시딩 스크립트 구현.
2. **Phase 2 (비식별 인증·단일 온보딩 및 앱 내비게이션):** 옛한글 지원 폰트 번들링, 기기 `UUID` 자동 생성, `GET /api/users/:userId`, `POST /api/users/onboarding` API 구현 및 단일 통합 온보딩(조건부 `grade` 영역 포함)·5대 하단 탭 뼈대 연결.
3. **Phase 3 (작품 학습관·진도율·플래시카드 단어장):** `contents`, `learning_records`, `saved_words` REST API 구현 및 홈 대시보드·작품 학습 뷰어(문장 대역 보기 포함)·내 단어장(리스트/플래시카드 전환) 연동.
4. **Phase 4 (2단계 OCR 스캔·AI 번역·범용 튜터 채팅):** 이미지 500KB 압축 업로드(`POST /api/ai/ocr`), 원문 보정 후 AI 번역(`POST /api/ai/translate`), 최근 6개 메시지 컨텍스트 제한 AI 채팅 구현 및 스캔·학습관 채팅 UI 연동.
5. **Phase 5 (실시간 멀티 및 AI 봇 퀴즈 대결):** Socket.IO 방 생성(방장 자동 등록)·입장, 서버 인메모리 5문제/15초 채점 엔진, 최종 순위 DB 저장 및 싱글 AI 봇 대결(`GET /api/quiz/solo`)·칭호 결과 화면 연동.
