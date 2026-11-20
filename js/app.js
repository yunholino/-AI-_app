/**
 * ========================================================
 * 애국 AI (서당 AI) - 메인 애플리케이션 라우터 & 컨트롤러
 * 파일: js/app.js
 * 1-3단계: 온보딩 3단계 마법사 모달 & 출석 스트릭 실시간 연동
 * ========================================================
 */

(function (window, document) {
  'use strict';

  /**
   * DOM 요소 캐시
   */
  const elements = {
    // 1. 헤더 요소
    headerUserName: null,
    headerUserRole: null,
    headerStreakCount: null,
    headerMyBtn: null,

    // 2. 메인 네비게이션 및 탭 콘텐츠
    navItems: null,
    tabPanes: null,

    // 3. MY 서브 네비게이션 및 서브 뷰
    mySubBtns: null,
    mySubViews: null,

    // 4. MY 프로필 헤더 및 환경설정 연동 요소
    myAvatarText: null,
    myProfileUsername: null,
    myProfileGrade: null,
    myProfileGoal: null,
    settingProfileBtn: null,
    settingProfileVal: null,
    settingGoalBtn: null,
    settingGoalVal: null,
    settingResetBtn: null,

    // 5. 퀵 액션 카드
    quickActionItems: null,

    // 6. 입학 온보딩 모달 요소
    onboardingModal: null,
    stepDots: [],
    stepLines: [],
    stepContents: [],
    btnNextStep1: null,
    btnPrevStep2: null,
    btnNextStep2: null,
    btnPrevStep3: null,
    btnCompleteOnboarding: null,
    onboardingNickname: null,
    nicknameErrorTip: null,
    gradeRadios: null,
    goalRadios: null,
    dailyQuestionRadios: null
  };

  /**
   * 현재 온보딩 단계 (1, 2, 3)
   */
  let currentOnboardingStep = 1;

  /**
   * DOM 요소 캐싱
   */
  function cacheElements() {
    // 헤더
    elements.headerUserName = document.getElementById('headerUserName');
    elements.headerUserRole = document.getElementById('headerUserRole');
    elements.headerStreakCount = document.getElementById('headerStreakCount');
    elements.headerMyBtn = document.getElementById('headerMyBtn');

    // 5대 메인 탭
    elements.navItems = document.querySelectorAll('.bottom-nav .nav-item');
    elements.tabPanes = document.querySelectorAll('.main-content .tab-pane');

    // MY 서브 탭
    elements.mySubBtns = document.querySelectorAll('.my-sub-nav .my-sub-btn');
    elements.mySubViews = document.querySelectorAll('#tab-my .my-sub-view');

    // MY 프로필 & 설정
    elements.myAvatarText = document.getElementById('myAvatarText');
    elements.myProfileUsername = document.getElementById('myProfileUsername');
    elements.myProfileGrade = document.getElementById('myProfileGrade');
    elements.myProfileGoal = document.getElementById('myProfileGoal');
    elements.settingProfileBtn = document.getElementById('settingProfileBtn');
    elements.settingProfileVal = document.getElementById('settingProfileVal');
    elements.settingGoalBtn = document.getElementById('settingGoalBtn');
    elements.settingGoalVal = document.getElementById('settingGoalVal');
    elements.settingResetBtn = document.getElementById('settingResetBtn');

    // 퀵 액션
    elements.quickActionItems = document.querySelectorAll('.quick-actions-grid .quick-action-item');

    // 온보딩 모달
    elements.onboardingModal = document.getElementById('onboardingModal');
    elements.stepDots = [
      document.getElementById('stepDot1'),
      document.getElementById('stepDot2'),
      document.getElementById('stepDot3')
    ];
    elements.stepLines = [
      document.getElementById('stepLine1'),
      document.getElementById('stepLine2')
    ];
    elements.stepContents = [
      document.getElementById('onboardingStep1'),
      document.getElementById('onboardingStep2'),
      document.getElementById('onboardingStep3')
    ];

    elements.btnNextStep1 = document.getElementById('btnNextStep1');
    elements.btnPrevStep2 = document.getElementById('btnPrevStep2');
    elements.btnNextStep2 = document.getElementById('btnNextStep2');
    elements.btnPrevStep3 = document.getElementById('btnPrevStep3');
    elements.btnCompleteOnboarding = document.getElementById('btnCompleteOnboarding');

    elements.onboardingNickname = document.getElementById('onboardingNickname');
    elements.nicknameErrorTip = document.getElementById('nicknameErrorTip');

    elements.gradeRadios = document.querySelectorAll('input[name="userGrade"]');
    elements.goalRadios = document.querySelectorAll('input[name="userGoal"]');
    elements.dailyQuestionRadios = document.querySelectorAll('input[name="userDailyQuestions"]');
  }

  /**
   * 상단 헤더 및 MY 프로필 UI 통합 렌더링
   */
  function renderAllProfileUI() {
    if (!window.SeodangStorage) return;
    const profile = window.SeodangStorage.get('profile');
    if (!profile) return;

    const nickname = profile.nickname || '선비';
    const grade = profile.grade || '중학교 2학년';
    const goal = profile.goal || '고전 독해 · 한자어';
    const streak = profile.streak !== undefined ? profile.streak : 1;

    // 1. 상단 헤더 반영
    if (elements.headerUserName) {
      elements.headerUserName.textContent = nickname;
    }
    if (elements.headerUserRole) {
      elements.headerUserRole.textContent = nickname.slice(0, 2);
    }
    if (elements.headerStreakCount) {
      elements.headerStreakCount.textContent = `${streak}일째`;
    }

    // 2. MY 탭 프로필 카드 반영
    if (elements.myAvatarText) {
      elements.myAvatarText.textContent = nickname.slice(0, 2);
    }
    if (elements.myProfileUsername) {
      elements.myProfileUsername.textContent = `${nickname}`;
    }
    if (elements.myProfileGrade) {
      elements.myProfileGrade.textContent = grade;
    }
    if (elements.myProfileGoal) {
      elements.myProfileGoal.textContent = `목표: ${goal}`;
    }

    // 3. [37 환경설정] 계정 값 반영
    if (elements.settingProfileVal) {
      elements.settingProfileVal.textContent = `${nickname} · ${grade}`;
    }
    if (elements.settingGoalVal) {
      elements.settingGoalVal.textContent = goal;
    }
  }

  /**
   * 메인 5대 탭 전환 함수 (SPA 라우터)
   * @param {string} targetTabId - 'tab-home' | 'tab-study' | 'tab-camera' | 'tab-game' | 'tab-my'
   */
  function switchMainTab(targetTabId) {
    if (!targetTabId) return;

    elements.tabPanes.forEach(pane => {
      if (pane.id === targetTabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    elements.navItems.forEach(btn => {
      if (btn.getAttribute('data-target') === targetTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 카메라 탭 진입 / 이탈 시 미디어 스트림 제어
    if (window.AegukCamera) {
      if (targetTabId === 'tab-camera') {
        if (!window.AegukCamera.getCurrentImage()) {
          window.AegukCamera.startCamera();
        }
      } else {
        window.AegukCamera.stopCamera();
      }
    }

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

    elements.mySubViews.forEach(view => {
      if (view.id === targetSubId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    elements.mySubBtns.forEach(btn => {
      if (btn.getAttribute('data-sub') === targetSubId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * 온보딩 모달 열기
   */
  function openOnboardingModal() {
    if (!elements.onboardingModal) return;
    
    // 기존 설정값이 있으면 폼에 기본 채우기
    const profile = window.SeodangStorage ? window.SeodangStorage.get('profile') : null;
    if (profile) {
      if (elements.onboardingNickname && profile.nickname) {
        elements.onboardingNickname.value = profile.nickname;
      }
      if (profile.grade) {
        elements.gradeRadios.forEach(r => {
          if (r.value === profile.grade) {
            r.checked = true;
            r.closest('.option-card').classList.add('active');
          } else {
            r.closest('.option-card').classList.remove('active');
          }
        });
      }
      if (profile.goal) {
        elements.goalRadios.forEach(r => {
          if (r.value === profile.goal) {
            r.checked = true;
            r.closest('.option-card').classList.add('active');
          } else {
            r.closest('.option-card').classList.remove('active');
          }
        });
      }
    }

    goToOnboardingStep(1);
    elements.onboardingModal.style.display = 'flex';
  }

  /**
   * 온보딩 모달 닫기
   */
  function closeOnboardingModal() {
    if (!elements.onboardingModal) return;
    elements.onboardingModal.style.display = 'none';
  }

  /**
   * 온보딩 특정 스텝으로 전환 (1, 2, 3)
   * @param {number} stepNumber 
   */
  function goToOnboardingStep(stepNumber) {
    currentOnboardingStep = stepNumber;

    // 1. 스텝 콘텐츠 전환
    elements.stepContents.forEach((content, index) => {
      if (index === stepNumber - 1) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    // 2. 인디케이터 점과 선 상태 업데이트
    elements.stepDots.forEach((dot, index) => {
      if (!dot) return;
      dot.classList.remove('active', 'completed');
      if (index + 1 === stepNumber) {
        dot.classList.add('active');
      } else if (index + 1 < stepNumber) {
        dot.classList.add('completed');
      }
    });

    elements.stepLines.forEach((line, index) => {
      if (!line) return;
      if (index + 1 < stepNumber) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });

    // 3단계 진입 시 닉네임 인풋에 포커스
    if (stepNumber === 3 && elements.onboardingNickname) {
      setTimeout(() => elements.onboardingNickname.focus(), 150);
    }
  }

  /**
   * 옵션 카드 라디오 클릭 스타일 헬퍼
   */
  function setupOptionCards(radioSelector, parentClass) {
    const radios = document.querySelectorAll(radioSelector);
    radios.forEach(radio => {
      radio.addEventListener('change', function () {
        radios.forEach(r => {
          const card = r.closest(parentClass);
          if (card) {
            card.classList.toggle('active', r.checked);
          }
        });
      });
    });
  }

  /**
   * 온보딩 완료 처리
   */
  function handleCompleteOnboarding() {
    const nicknameInput = elements.onboardingNickname ? elements.onboardingNickname.value.trim() : '';

    // 유효성 검사: 2글자 이상 8글자 이하
    if (!nicknameInput || nicknameInput.length < 2 || nicknameInput.length > 8) {
      if (elements.nicknameErrorTip) {
        elements.nicknameErrorTip.textContent = '⚠️ 닉네임은 공백 없이 2자 이상 8자 이내로 입력해 주세요.';
        elements.nicknameErrorTip.classList.add('error');
      }
      if (elements.onboardingNickname) {
        elements.onboardingNickname.focus();
      }
      return;
    }

    // 선택된 학년
    let selectedGrade = '중학생';
    elements.gradeRadios.forEach(r => {
      if (r.checked) selectedGrade = r.value;
    });

    // 선택된 학습 목표
    let selectedGoal = '고전 독해 · 한자어';
    elements.goalRadios.forEach(r => {
      if (r.checked) selectedGoal = r.value;
    });

    // 선택된 일일 문제 수
    let selectedDailyQuestions = 10;
    elements.dailyQuestionRadios.forEach(r => {
      if (r.checked) selectedDailyQuestions = r.value;
    });

    // 스토리지에 온보딩 데이터 영속화
    if (window.SeodangStorage) {
      window.SeodangStorage.completeOnboarding({
        nickname: nicknameInput,
        grade: selectedGrade,
        goal: selectedGoal,
        dailyQuestions: selectedDailyQuestions
      });
    }

    // 모달 닫기 및 화면 갱신
    closeOnboardingModal();
    renderAllProfileUI();
  }

  /**
   * 이벤트 바인딩
   */
  function bindEvents() {
    // 1. 하단 메인 탭 전환
    elements.navItems.forEach(btn => {
      btn.addEventListener('click', function () {
        const targetTabId = this.getAttribute('data-target');
        switchMainTab(targetTabId);
      });
    });

    // 2. 헤더 MY 바로가기
    if (elements.headerMyBtn) {
      elements.headerMyBtn.addEventListener('click', function () {
        switchMainTab('tab-my');
      });
    }

    // 3. MY 내부 5대 서브 뷰 전환
    elements.mySubBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const subId = this.getAttribute('data-sub');
        switchMySubView(subId);
      });
    });

    // 4. 홈 퀵 액션 카드 클릭 이동
    elements.quickActionItems.forEach((item, index) => {
      item.addEventListener('click', function () {
        if (index === 0) switchMainTab('tab-camera');
        else if (index === 1) switchMainTab('tab-study');
        else if (index === 2) switchMainTab('tab-game');
      });
    });

    // 5. 온보딩 모달 인터랙션
    setupOptionCards('input[name="userGrade"]', '.option-card');
    setupOptionCards('input[name="userGoal"]', '.option-card');
    setupOptionCards('input[name="userDailyQuestions"]', '.target-chip');

    if (elements.btnNextStep1) {
      elements.btnNextStep1.addEventListener('click', () => goToOnboardingStep(2));
    }
    if (elements.btnPrevStep2) {
      elements.btnPrevStep2.addEventListener('click', () => goToOnboardingStep(1));
    }
    if (elements.btnNextStep2) {
      elements.btnNextStep2.addEventListener('click', () => goToOnboardingStep(3));
    }
    if (elements.btnPrevStep3) {
      elements.btnPrevStep3.addEventListener('click', () => goToOnboardingStep(2));
    }
    if (elements.btnCompleteOnboarding) {
      elements.btnCompleteOnboarding.addEventListener('click', handleCompleteOnboarding);
    }

    // 닉네임 인풋 엔터키로 완료 지원
    if (elements.onboardingNickname) {
      elements.onboardingNickname.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCompleteOnboarding();
        }
      });
    }

    // 6. [37 환경설정] 프로필 & 목표 클릭 시 온보딩 재오픈 (수정 모드)
    if (elements.settingProfileBtn) {
      elements.settingProfileBtn.addEventListener('click', () => {
        openOnboardingModal();
        goToOnboardingStep(1);
      });
    }
    if (elements.settingGoalBtn) {
      elements.settingGoalBtn.addEventListener('click', () => {
        openOnboardingModal();
        goToOnboardingStep(2);
      });
    }

    // 7. [37 환경설정] 데이터 초기화 버튼 연동
    if (elements.settingResetBtn) {
      elements.settingResetBtn.addEventListener('click', function () {
        const confirmed = window.confirm(
          '⚠️ 정말 모든 학습 데이터와 설정을 초기화하시겠습니까?\n초기화 시 첫 입학 온보딩 화면으로 리셋됩니다.'
        );
        if (confirmed && window.SeodangStorage) {
          window.SeodangStorage.clearAll();
          window.location.reload();
        }
      });
    }

    // 8. 전역 스토리지 변경 수신
    window.addEventListener('storageUpdated', function () {
      renderAllProfileUI();
    });
  }

  /**
   * 앱 구동 초기 진입점
   */
  function initApp() {
    cacheElements();

    // 1. 중앙 스토리지 초기화 및 스트릭 체크
    if (window.SeodangStorage) {
      window.SeodangStorage.init();
    }

    // 2. 전체 프로필 UI 동기화
    renderAllProfileUI();

    // 3. 온보딩 완료 여부 검사: 미완료 시 모달 자동 팝업
    if (window.SeodangStorage && !window.SeodangStorage.isOnboarded()) {
      openOnboardingModal();
    } else {
      closeOnboardingModal();
    }

    // 4. 이벤트 바인딩
    bindEvents();

    console.log('🏛️ 애국 AI (서당 AI) 1-3단계: 온보딩 마법사 모달 & 스트릭 체크 시스템 구축 완료');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // 외부 공개 API
  window.AegukApp = {
    switchMainTab: switchMainTab,
    switchMySubView: switchMySubView,
    renderAllProfileUI: renderAllProfileUI,
    openOnboardingModal: openOnboardingModal,
    closeOnboardingModal: closeOnboardingModal
  };

})(window, document);
