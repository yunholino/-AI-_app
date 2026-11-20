/**
 * ========================================================
 * 애국 AI (서당 AI) - [35 학습 통계] 서브 모듈
 * 파일: js/stats.js
 * 3-2단계: 연속 학습일, 7일간의 주간 학습 시간 세로 막대 차트 & 정답률/어휘수 시각화
 * ========================================================
 */

(function (window, document) {
  'use strict';

  const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

  let dom = {
    streakDaysText: null,
    weekStudyDaysText: null,
    barChartContainer: null,
    totalAccuracyText: null,
    learnedWordsCountText: null,
    reviewedWrongCountText: null
  };

  function cacheElements() {
    dom.streakDaysText = document.getElementById('statStreakDays');
    dom.weekStudyDaysText = document.getElementById('statWeekStudyDays');
    dom.barChartContainer = document.getElementById('statsWeeklyBarChart');
    dom.totalAccuracyText = document.getElementById('myStatsAccuracy');
    dom.learnedWordsCountText = document.getElementById('myStatsLearnedWords');
    dom.reviewedWrongCountText = document.getElementById('myStatsReviewedCount');
  }

  /**
   * 학습 통계 렌더링
   */
  function render() {
    if (!window.SeodangStorage) return;

    const data = window.SeodangStorage.loadAll() || {};
    const profile = data.profile || {};
    const stats = data.stats || {
      streakDays: 1,
      weekStudyDays: 1,
      weeklyStudyMinutes: [20, 35, 40, 50, 30, 60, 25],
      totalAccuracy: 82,
      learnedWordsCount: 47
    };
    const wrongList = data.wrongNotes || [];

    const streak = profile.streak || stats.streakDays || 1;
    const weekDays = stats.weekStudyDays || 1;
    const accuracy = stats.totalAccuracy !== undefined ? stats.totalAccuracy : 82;
    const wordsCount = stats.learnedWordsCount !== undefined ? stats.learnedWordsCount : 47;
    const reviewedCount = wrongList.filter(w => w.isReviewed).length;

    // 1. 연속 학습일 및 주간 학습일
    if (dom.streakDaysText) {
      dom.streakDaysText.textContent = `${streak}일`;
    }
    if (dom.weekStudyDaysText) {
      dom.weekStudyDaysText.textContent = `${weekDays}일`;
    }

    // 2. 하단 핵심 지표
    if (dom.totalAccuracyText) {
      dom.totalAccuracyText.textContent = `${accuracy}%`;
    }
    if (dom.learnedWordsCountText) {
      dom.learnedWordsCountText.textContent = `${wordsCount}개`;
    }
    if (dom.reviewedWrongCountText) {
      dom.reviewedWrongCountText.textContent = `${reviewedCount}문제`;
    }

    // 3. 주간 학습 시간 세로 막대 그래프 렌더링
    renderWeeklyBarChart(stats.weeklyStudyMinutes || [20, 35, 40, 50, 30, 60, 25]);
  }

  /**
   * 주간 7일 막대 그래프 시각화 (월~일)
   * @param {Array<number>} minutesArray 
   */
  function renderWeeklyBarChart(minutesArray) {
    if (!dom.barChartContainer) return;
    dom.barChartContainer.innerHTML = '';

    const maxMinutes = Math.max(...minutesArray, 60);

    // 오늘 요일 인덱스 (0: 일, 1: 월 ... 6: 토 -> 월요일 기준 0~6 매핑)
    const todayDayNumber = new Date().getDay();
    const todayIndex = (todayDayNumber === 0) ? 6 : todayDayNumber - 1;

    minutesArray.forEach((minutes, idx) => {
      const heightPercent = Math.max(8, Math.round((minutes / maxMinutes) * 100));
      const isToday = (idx === todayIndex);

      const col = document.createElement('div');
      col.className = `chart-col ${isToday ? 'highlight-col' : ''}`;
      col.title = `${DAY_LABELS[idx]}요일: ${minutes}분 학습${isToday ? ' (오늘)' : ''}`;

      col.innerHTML = `
        <span class="bar-val">${minutes}분</span>
        <div class="bar-track">
          <div class="bar-fill" style="height: ${heightPercent}%;"></div>
        </div>
        <span class="bar-day">${DAY_LABELS[idx]}</span>
      `;

      // 터치 또는 클릭 시 툴팁 알림
      col.addEventListener('click', function () {
        if (window.AegukApp && window.AegukApp.showToast) {
          window.AegukApp.showToast(`📊 ${DAY_LABELS[idx]}요일 학습량: 총 ${minutes}분`);
        }
      });

      dom.barChartContainer.appendChild(col);
    });
  }

  function bindEvents() {
    window.addEventListener('storageUpdated', function () {
      render();
    });
  }

  function init() {
    cacheElements();
    bindEvents();
    render();
    console.log('📊 [애국 AI] 3-2단계: [35 학습 통계] 모듈 초기화 완료');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AegukStats = {
    render: render
  };

})(window, document);
