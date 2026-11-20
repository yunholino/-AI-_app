/**
 * ========================================================
 * 애국 AI (서당 AI) - 메인 애플리케이션 라우터 & 컨트롤러
 * 파일: js/app.js
 * 1-2단계: 5대 탭 SPA 라우팅 & MY 서브뷰 네비게이션 & 스토리지 바인딩
 * ========================================================
 */

(function (window, document) {
  'use strict';

  /**
   * DOM 요소 캐시
   */
  const elements = {
    // 헤더 요소
    headerUserName: null,
    headerStreakCount: null,
    headerMyBtn: null,

    // 메인 네비게이션 및 탭 콘텐츠
    navItems: null,
    tabPanes: null,

    // MY 서브 네비게이션 및 서브 뷰
    mySubBtns: null,
    mySubViews: null,

    // 퀵 액션 카드
    quickActionItems: null
  };

  /**
   * DOM 요소 초기화
   */
  function cacheElements() {
    elements.headerUserName = document.getElementById('headerUserName');
    elements.headerStreakCount = document.getElementById('headerStreakCount');
    elements.headerMyBtn = document.getElementById('headerMyBtn');

    elements.navItems = document.querySelectorAll('.bottom-nav .nav-item');
    elements.tabPanes = document.querySelectorAll('.main-content .tab-pane');

    elements.mySubBtns = document.querySelectorAll('.my-sub-nav .my-sub-btn');
    elements.mySubViews = document.querySelectorAll('#tab-my .my-sub-view');

    elements.quickActionItems = document.querySelectorAll('.quick-actions-grid .quick-action-item');
  }

  /**
   * 상단 헤더 프로필 & 스트릭 렌더링
   */
  function renderHeader() {
    if (!window.SeodangStorage) return;
    const profile = window.SeodangStorage.get('profile');
    if (!profile) return;

    if (elements.headerUserName) {
      elements.headerUserName.textContent = profile.nickname || '선비';
    }
    if (elements.headerStreakCount) {
      const streak = profile.streak !== undefined ? profile.streak : 0;
      elements.headerStreakCount.textContent = `${streak}일째`;
    }
  }

  /**
   * 메인 5대 탭 전환 함수 (SPA 라우터)
   * @param {string} targetTabId - 'tab-home' | 'tab-study' | 'tab-camera' | 'tab-game' | 'tab-my'
   */
  function switchMainTab(targetTabId) {
    if (!targetTabId) return;

    // 1. 탭 콘텐츠(.tab-pane) 전환
    elements.tabPanes.forEach(pane => {
      if (pane.id === targetTabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // 2. 하단 네비게이션 버튼(.nav-item) active 상태 동기화
    elements.navItems.forEach(btn => {
      if (btn.getAttribute('data-target') === targetTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 스크롤 상단으로 부드럽게 이동
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }

  /**
   * MY 마이페이지 5대 서브 뷰 전환 함수
   * @param {string} targetSubId - 'sub-vocab' | 'sub-wrong' | 'sub-stats' | 'sub-badges' | 'sub-settings'
   */
  function switchMySubView(targetSubId) {
    if (!targetSubId) return;

    // 1. MY 서브 뷰(.my-sub-view) 전환
    elements.mySubViews.forEach(view => {
      if (view.id === targetSubId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // 2. 서브 탭 버튼(.my-sub-btn) active 상태 동기화
    elements.mySubBtns.forEach(btn => {
      if (btn.getAttribute('data-sub') === targetSubId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * 이벤트 리스너 바인딩
   */
  function bindEvents() {
    // 1. 하단 고정 네비게이션 탭 클릭
    elements.navItems.forEach(btn => {
      btn.addEventListener('click', function () {
        const targetTabId = this.getAttribute('data-target');
        switchMainTab(targetTabId);
      });
    });

    // 2. 상단 헤더의 MY 바로가기 버튼 클릭 -> MY 탭으로 이동
    if (elements.headerMyBtn) {
      elements.headerMyBtn.addEventListener('click', function () {
        switchMainTab('tab-my');
      });
    }

    // 3. MY 내부 5대 서브 뷰 탭 클릭
    elements.mySubBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const subId = this.getAttribute('data-sub');
        switchMySubView(subId);
      });
    });

    // 4. [홈] 탭 퀵 액션 카드 클릭 시 해당 탭으로 즉시 화면 이동
    elements.quickActionItems.forEach((item, index) => {
      item.addEventListener('click', function () {
        if (index === 0) {
          switchMainTab('tab-camera'); // 옛글 사진 촬영
        } else if (index === 1) {
          switchMainTab('tab-study');  // 플래시카드 암기
        } else if (index === 2) {
          switchMainTab('tab-game');   // 10초 스피드 퀴즈
        }
      });
    });

    // 5. 스토리지 변경 시 헤더 실시간 반영
    window.addEventListener('storageUpdated', function () {
      renderHeader();
    });
  }

  /**
   * 앱 구동 시 초기 진입점
   */
  function initApp() {
    // DOM 캐싱
    cacheElements();

    // 1. 중앙 스토리지 초기화 (Mock 데이터 보장)
    if (window.SeodangStorage) {
      window.SeodangStorage.init();
    }

    // 2. 상단 헤더 렌더링
    renderHeader();

    // 3. 이벤트 바인딩
    bindEvents();

    console.log('🏛️ 애국 AI (서당 AI) 1-2단계: SPA 탭 라우터 및 중앙 저장소 연동 완료');
  }

  // DOM 로드 완료 시 앱 구동
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // 외부(콘솔 또는 후속 스크립트)에서 접근 가능한 라우팅 API 공개
  window.AegukApp = {
    switchMainTab: switchMainTab,
    switchMySubView: switchMySubView,
    renderHeader: renderHeader
  };

})(window, document);
