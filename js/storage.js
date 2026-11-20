/**
 * ========================================================
 * 애국 AI (서당 AI) - 중앙 데이터 저장소 모듈
 * 파일: js/storage.js
 * 1-3단계: 온보딩 프로필 영속화 및 일일 출석 스트릭 체크 엔진
 * ========================================================
 */

(function (window) {
  'use strict';

  // 로컬스토리지 저장 키
  const STORAGE_KEY = 'aeguk_seodang_data';

  /**
   * 오늘 날짜 문자열 반환 (YYYY-MM-DD 형식)
   */
  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 두 YYYY-MM-DD 날짜 간의 일수 차이 계산 (date1 - date2)
   */
  function getDateDifferenceInDays(dateStr1, dateStr2) {
    if (!dateStr1 || !dateStr2) return 999;
    const d1 = new Date(dateStr1 + 'T00:00:00');
    const d2 = new Date(dateStr2 + 'T00:00:00');
    const diffTime = d1.getTime() - d2.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // 1-3단계 기본 Mock 데이터셋
  const DEFAULT_DATA = {
    // 1. 사용자 프로필 (온보딩 전 미완료 상태 기본값)
    profile: {
      nickname: '선비',
      grade: '중학교 2학년',
      goal: '고전 독해 · 한자어',
      streak: 1,
      lastLoginDate: getTodayDateString(),
      isOnboarded: false // 첫 방문 시 입학 온보딩 모달 작동 기준
    },

    // 2. [33 내 단어장] 저장 단어 목록
    myVocab: [
      {
        id: 1,
        word: '사맛다',
        hanja: '',
        meaning: '서로 통하다',
        source: '훈민정음',
        category: '옛말',
        isFavorite: true,
        date: getTodayDateString()
      },
      {
        id: 2,
        word: '문해력',
        hanja: '文解力',
        meaning: '글을 읽고 이해하는 능력',
        source: '필수어휘',
        category: '한자어',
        isFavorite: true,
        date: getTodayDateString()
      },
      {
        id: 3,
        word: '각골난망',
        hanja: '刻骨難忘',
        meaning: '은혜를 잊지 못함',
        source: '사자성어',
        category: '사자성어',
        isFavorite: true,
        date: getTodayDateString()
      },
      {
        id: 4,
        word: '벗',
        hanja: '',
        meaning: '친구 또는 가까운 사이',
        source: '고전시가',
        category: '옛말',
        isFavorite: true,
        date: getTodayDateString()
      }
    ],

    // 3. [34 오답노트] 오답 목록
    wrongNotes: [
      {
        id: 1,
        question: '사맛다',
        userChoice: '바라보다',
        answer: '서로 통하다',
        isReviewed: false,
        date: getTodayDateString()
      },
      {
        id: 2,
        question: '각골난망',
        userChoice: '매우 놀람',
        answer: '은혜를 잊지 못함',
        isReviewed: false,
        date: getTodayDateString()
      },
      {
        id: 3,
        question: '문해력',
        userChoice: '빨리 읽는 힘',
        answer: '읽고 이해하는 능력',
        isReviewed: true,
        date: getTodayDateString()
      }
    ],

    // 4. [35 학습 통계] 지표
    stats: {
      streakDays: 1,
      weekStudyDays: 1,
      weeklyStudyMinutes: [20, 35, 40, 50, 30, 60, 25], // 월~일 분 단위
      totalAccuracy: 82,
      learnedWordsCount: 47
    },

    // 5. [36 배지·경험치] 레벨 및 배지
    badgesXP: {
      level: 7,
      title: '한글 탐험가',
      currentXP: 1240,
      nextLevelXP: 2000,
      badges: [
        { id: 'b1', symbol: '文', name: '첫 번역', desc: '첫 번역 완료', unlocked: true },
        { id: 'b2', symbol: '七', name: '7일 연속', desc: '7일 연속 출석', unlocked: true },
        { id: 'b3', symbol: '字', name: '어휘 수집가', desc: '단어 20개 저장', unlocked: true },
        { id: 'b4', symbol: '王', name: '게임 왕', desc: '퀴즈 10승 달성', unlocked: false },
        { id: 'b5', symbol: '古', name: '고전 박사', desc: '어휘 50개 마스터', unlocked: false },
        { id: 'b6', symbol: '復', name: '완벽 복습', desc: '오답 10문제 복습 완료', unlocked: false }
      ]
    },

    // 6. [37 환경설정]
    settings: {
      alarmEnabled: true,
      alarmTime: '20:00',
      difficulty: '보통',
      fontSize: '기본',
      dailyQuestions: 10
    },

    // 7. 퀴즈 전적 기록
    quizRecords: []
  };

  /**
   * 중앙 저장소 제어 객체 (SeodangStorage & AegukStorage)
   */
  const SeodangStorage = {
    /**
     * 저장소 초기화: LocalStorage에 데이터가 없으면 DEFAULT_DATA 세팅 및 스트릭 체크
     * @returns {Object}
     */
    init: function () {
      let data = this.loadAll();
      if (!data) {
        data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.saveAll(data);
      } else {
        // 기존 저장 데이터에 새로운 필드 누락 시 기본값 안전 병합
        let isUpdated = false;
        Object.keys(DEFAULT_DATA).forEach(key => {
          if (data[key] === undefined) {
            data[key] = JSON.parse(JSON.stringify(DEFAULT_DATA[key]));
            isUpdated = true;
          }
        });
        if (isUpdated) {
          this.saveAll(data);
        }
      }

      // 출석 스트릭 갱신 검사 실행
      this.checkAndUpdateStreak();

      return this.loadAll();
    },

    /**
     * 출석 스트릭 연동 엔진:
     * - 어제 접속이면 streak + 1
     * - 오늘 첫 접속이면 유지
     * - 이틀 이상 건너뛰었으면 streak = 1로 리셋
     */
    checkAndUpdateStreak: function () {
      const all = this.loadAll();
      if (!all || !all.profile) return;

      const today = getTodayDateString();
      const lastLogin = all.profile.lastLoginDate;

      // 이미 오늘 출석 체크 완료된 경우 통과
      if (lastLogin === today) {
        return;
      }

      const diffDays = getDateDifferenceInDays(today, lastLogin);

      if (diffDays === 1) {
        // 어제 접속 후 오늘 연속 출석
        all.profile.streak = (all.profile.streak || 0) + 1;
        if (all.stats) {
          all.stats.streakDays = all.profile.streak;
          all.stats.weekStudyDays = Math.min(7, (all.stats.weekStudyDays || 0) + 1);
        }
        console.log(`🔥 [애국 AI] 연속 출석 달성! 스트릭: ${all.profile.streak}일째`);
      } else if (diffDays > 1) {
        // 하루 이상 결석 -> 스트릭 1일로 재시작
        all.profile.streak = 1;
        if (all.stats) {
          all.stats.streakDays = 1;
        }
        console.log('🔄 [애국 AI] 출석 스트릭 재시작: 1일째');
      }

      all.profile.lastLoginDate = today;
      this.saveAll(all);
    },

    /**
     * 전체 데이터 읽기
     * @returns {Object|null}
     */
    loadAll: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.error('[SeodangStorage] loadAll 파싱 오류:', err);
        return null;
      }
    },

    /**
     * 전체 데이터 영속화 저장 및 갱신 이벤트 발생
     * @param {Object} data 
     */
    saveAll: function (data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('storageUpdated', { detail: data }));
        return true;
      } catch (err) {
        console.error('[SeodangStorage] saveAll 실패:', err);
        return false;
      }
    },

    /**
     * 특정 최상위 키 데이터 조회
     * @param {string} key 
     * @returns {*}
     */
    get: function (key) {
      const all = this.loadAll() || this.init();
      return all[key];
    },

    /**
     * 특정 최상위 키 데이터 갱신
     * @param {string} key 
     * @param {*} value 
     */
    set: function (key, value) {
      const all = this.loadAll() || this.init();
      all[key] = value;
      return this.saveAll(all);
    },

    /**
     * 함수형 업데이트 유틸리티
     * @param {string} key 
     * @param {Function} updaterFn 
     */
    update: function (key, updaterFn) {
      const all = this.loadAll() || this.init();
      if (typeof updaterFn === 'function') {
        all[key] = updaterFn(all[key]);
        return this.saveAll(all);
      }
      return false;
    },

    /**
     * 온보딩 마법사 완료 처리
     * @param {Object} onboardingData - { nickname, grade, goal, dailyQuestions }
     */
    completeOnboarding: function (onboardingData) {
      const all = this.loadAll() || this.init();
      
      // 프로필 정보 갱신
      all.profile.nickname = onboardingData.nickname || '선비';
      all.profile.grade = onboardingData.grade || '중학교 2학년';
      all.profile.goal = onboardingData.goal || '고전 독해 · 한자어';
      all.profile.isOnboarded = true;
      all.profile.lastLoginDate = getTodayDateString();

      // 일일 문제 수 설정 갱신
      if (onboardingData.dailyQuestions && all.settings) {
        all.settings.dailyQuestions = parseInt(onboardingData.dailyQuestions, 10) || 10;
      }

      this.saveAll(all);
      console.log('🎉 [애국 AI] 서당 입학 온보딩 완료:', all.profile);
      return all;
    },

    /**
     * 온보딩 완료 여부 확인
     * @returns {boolean}
     */
    isOnboarded: function () {
      const profile = this.get('profile');
      return Boolean(profile && profile.isOnboarded);
    },

    /**
     * 저장소 완전 초기화 (DEFAULT_DATA로 리셋)
     */
    clearAll: function () {
      try {
        const resetData = JSON.parse(JSON.stringify(DEFAULT_DATA));
        resetData.profile.isOnboarded = false; // 초기화 시 온보딩을 다시 띄움
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
        window.dispatchEvent(new CustomEvent('storageUpdated', { detail: resetData }));
        return resetData;
      } catch (err) {
        console.error('[SeodangStorage] clearAll 오류:', err);
        return null;
      }
    },

    /**
     * 전체 데이터를 JSON 파일로 내보내기 (다운로드)
     */
    exportJSON: function () {
      const data = this.loadAll() || this.init();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `aeguk_seodang_backup_${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /**
     * JSON 문자열을 검증 후 스토리지에 복원
     * @param {string} jsonString 
     * @returns {boolean}
     */
    importJSON: function (jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.profile || !parsed.myVocab || !parsed.wrongNotes) {
          throw new Error('유효한 애국 AI 백업 파일 형식이 아닙니다.');
        }
        this.saveAll(parsed);
        return true;
      } catch (err) {
        console.error('[SeodangStorage] importJSON 오류:', err);
        return false;
      }
    }
  };

  // 전역 네임스페이스 바인딩
  window.SeodangStorage = SeodangStorage;
  window.AegukStorage = SeodangStorage;

})(window);
