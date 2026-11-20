/**
 * ========================================================
 * 애국 AI (서당 AI) - 중앙 데이터 저장소 모듈
 * 파일: js/storage.js
 * 1-2단계: LocalStorage CRUD 및 데이터 모델 정의
 * ========================================================
 */

(function (window) {
  'use strict';

  // 로컬스토리지 저장 키
  const STORAGE_KEY = 'aeguk_seodang_data';

  // 1-2단계 명세에 정의된 초기 Mock 데이터셋
  const DEFAULT_DATA = {
    // 1. 사용자 프로필
    profile: {
      nickname: '선비',
      grade: '중학교 2학년',
      goal: '고전 독해 · 한자어',
      streak: 12,
      lastLoginDate: '2026-11-20'
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
        date: '2026-11-20'
      },
      {
        id: 2,
        word: '문해력',
        hanja: '文解力',
        meaning: '글을 읽고 이해하는 능력',
        source: '필수어휘',
        category: '한자어',
        isFavorite: true,
        date: '2026-11-20'
      },
      {
        id: 3,
        word: '각골난망',
        hanja: '刻骨難忘',
        meaning: '은혜를 잊지 못함',
        source: '사자성어',
        category: '사자성어',
        isFavorite: true,
        date: '2026-11-20'
      },
      {
        id: 4,
        word: '벗',
        hanja: '',
        meaning: '친구 또는 가까운 사이',
        source: '고전시가',
        category: '옛말',
        isFavorite: true,
        date: '2026-11-20'
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
        date: '2026-11-20'
      },
      {
        id: 2,
        question: '각골난망',
        userChoice: '매우 놀람',
        answer: '은혜를 잊지 못함',
        isReviewed: false,
        date: '2026-11-20'
      },
      {
        id: 3,
        question: '문해력',
        userChoice: '빨리 읽는 힘',
        answer: '읽고 이해하는 능력',
        isReviewed: true,
        date: '2026-11-20'
      }
    ],

    // 4. [35 학습 통계] 지표
    stats: {
      streakDays: 12,
      weekStudyDays: 5,
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
     * 저장소 초기화: LocalStorage에 데이터가 없으면 DEFAULT_DATA 세팅
     * @returns {Object} 로드된 전체 데이터
     */
    init: function () {
      let data = this.loadAll();
      if (!data) {
        data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.saveAll(data);
      } else {
        // 기존 저장 데이터에 새로운 키가 누락된 경우 기본값 병합 보장
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
      return data;
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
        // 데이터 변경을 전역에 알리는 커스텀 이벤트
        window.dispatchEvent(new CustomEvent('storageUpdated', { detail: data }));
        return true;
      } catch (err) {
        console.error('[SeodangStorage] saveAll 실패:', err);
        return false;
      }
    },

    /**
     * 특정 최상위 키 데이터 조회 (예: 'profile', 'myVocab')
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
     * @param {Function} updaterFn - (currentValue) => newValue
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
     * 저장소 완전 초기화 (DEFAULT_DATA로 리셋)
     */
    clearAll: function () {
      try {
        const resetData = JSON.parse(JSON.stringify(DEFAULT_DATA));
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
     * @returns {boolean} 성공 여부
     */
    importJSON: function (jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        // 필수 최상위 키 무결성 검증
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

  // 전역 네임스페이스 바인딩 (두 명칭 완벽 호환)
  window.SeodangStorage = SeodangStorage;
  window.AegukStorage = SeodangStorage;

})(window);
