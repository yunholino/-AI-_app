/**
 * ========================================================
 * 애국 AI (서당 AI) - 메인 애플리케이션 라우터 & 컨트롤러
 * 파일: js/app.js
 * 2-2단계: AI 옛글 풀이 파이프라인 & 형태소 툴팁 & '내 단어장' 저장 실시간 연동
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
    dailyQuestionRadios: null,

    // 7. AI 풀이 결과 & 로딩 요소 (2-2단계)
    aiLoadingCard: null,
    aiResultContainer: null,
    resultEraBadge: null,
    resultAuthor: null,
    resultTitle: null,
    resultOriginalText: null,
    resultModernText: null,
    resultCommentaryText: null,
    morphemeChipsGrid: null,

    // 8. 형태소 툴팁 모달 & 토스트 (2-2단계)
    morphemeModalOverlay: null,
    btnCloseMorphemeTooltip: null,
    tooltipCatBadge: null,
    tooltipWord: null,
    tooltipHanja: null,
    tooltipMeaning: null,
    tooltipGrammar: null,
    tooltipSource: null,
    btnSaveToMyVocab: null,
    seodangToast: null,
    toastMessage: null,

    // 9. [33 내 단어장] 서브 화면 동적 요소 (2-2단계)
    vocabSearchInput: null,
    vocabFilterChips: null,
    vocabCountIndicator: null,
    vocabListContainer: null
  };

  // 현재 온보딩 단계
  let currentOnboardingStep = 1;

  // 현재 툴팁에 띄워진 형태소 데이터 객체
  let currentActiveMorpheme = null;

  // 단어장 필터링 상태 (카테고리 & 검색어)
  let vocabCurrentCategory = '전체';
  let vocabSearchKeyword = '';
  let toastTimer = null;

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

    // AI 풀이 결과 & 로딩
    elements.aiLoadingCard = document.getElementById('aiLoadingCard');
    elements.aiResultContainer = document.getElementById('aiResultContainer');
    elements.resultEraBadge = document.getElementById('resultEraBadge');
    elements.resultAuthor = document.getElementById('resultAuthor');
    elements.resultTitle = document.getElementById('resultTitle');
    elements.resultOriginalText = document.getElementById('resultOriginalText');
    elements.resultModernText = document.getElementById('resultModernText');
    elements.resultCommentaryText = document.getElementById('resultCommentaryText');
    elements.morphemeChipsGrid = document.getElementById('morphemeChipsGrid');

    // 형태소 툴팁 모달 & 토스트
    elements.morphemeModalOverlay = document.getElementById('morphemeModalOverlay');
    elements.btnCloseMorphemeTooltip = document.getElementById('btnCloseMorphemeTooltip');
    elements.tooltipCatBadge = document.getElementById('tooltipCatBadge');
    elements.tooltipWord = document.getElementById('tooltipWord');
    elements.tooltipHanja = document.getElementById('tooltipHanja');
    elements.tooltipMeaning = document.getElementById('tooltipMeaning');
    elements.tooltipGrammar = document.getElementById('tooltipGrammar');
    elements.tooltipSource = document.getElementById('tooltipSource');
    elements.btnSaveToMyVocab = document.getElementById('btnSaveToMyVocab');
    elements.seodangToast = document.getElementById('seodangToast');
    elements.toastMessage = document.getElementById('toastMessage');

    // [33 내 단어장] 동적 컨테이너
    elements.vocabSearchInput = document.querySelector('#sub-vocab .search-input');
    elements.vocabFilterChips = document.querySelectorAll('#sub-vocab .filter-chips-row .chip');
    elements.vocabCountIndicator = document.querySelector('#sub-vocab .vocab-count-indicator strong');
    elements.vocabListContainer = document.querySelector('#sub-vocab .vocab-list');
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

    // 헤더 반영
    if (elements.headerUserName) elements.headerUserName.textContent = nickname;
    if (elements.headerUserRole) elements.headerUserRole.textContent = nickname.slice(0, 2);
    if (elements.headerStreakCount) elements.headerStreakCount.textContent = `${streak}일째`;

    // MY 탭 프로필 카드 반영
    if (elements.myAvatarText) elements.myAvatarText.textContent = nickname.slice(0, 2);
    if (elements.myProfileUsername) elements.myProfileUsername.textContent = `${nickname}`;
    if (elements.myProfileGrade) elements.myProfileGrade.textContent = grade;
    if (elements.myProfileGoal) elements.myProfileGoal.textContent = `목표: ${goal}`;

    // 환경설정 탭 반영
    if (elements.settingProfileVal) elements.settingProfileVal.textContent = `${nickname} · ${grade}`;
    if (elements.settingGoalVal) elements.settingGoalVal.textContent = goal;

    // 홈 탭 및 MY 통계 지표 실시간 동기화
    const stats = window.SeodangStorage.get('stats') || {};
    const learnedWords = stats.learnedWordsCount !== undefined ? stats.learnedWordsCount : 47;
    const accuracy = stats.totalAccuracy !== undefined ? stats.totalAccuracy : 82;

    const homeStreak = document.getElementById('homeSummaryStreak');
    if (homeStreak) homeStreak.textContent = `${streak}일`;

    const homeWords = document.getElementById('homeSummaryLearnedWords');
    if (homeWords) homeWords.textContent = `${learnedWords}개`;

    const homeAcc = document.getElementById('homeSummaryAccuracy');
    if (homeAcc) homeAcc.textContent = `${accuracy}%`;

    const myAcc = document.getElementById('myStatsAccuracy');
    if (myAcc) myAcc.textContent = `${accuracy}%`;

    const myWords = document.getElementById('myStatsLearnedWords');
    if (myWords) myWords.textContent = `${learnedWords}개`;

    const statStreak = document.getElementById('statStreakDays');
    if (statStreak) statStreak.textContent = `${streak}일`;

    // 3-1단계: 오답노트 & 배지/XP 화면 동기화
    renderWrongNotesList();
    renderBadgesAndXP();
  }

  /**
   * 메인 5대 탭 전환 함수 (SPA 라우터)
   * @param {string} targetTabId - 'tab-home' | 'tab-study' | 'tab-camera' | 'tab-game' | 'tab-my'
   */
  function switchMainTab(targetTabId) {
    if (!targetTabId) return;

    elements.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === targetTabId);
    });

    elements.navItems.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-target') === targetTabId);
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

    // 플래시카드 고정 버튼: 학습 탭 활성 시에만 표시
    const flashcardFixedActions = document.getElementById('flashcardFixedActions');
    if (flashcardFixedActions) {
      if (targetTabId === 'tab-study') {
        flashcardFixedActions.classList.add('visible');
      } else {
        flashcardFixedActions.classList.remove('visible');
      }
    }
  }

  /**
   * MY 마이페이지 5대 서브 뷰 전환 함수
   * @param {string} targetSubId - 'sub-vocab' | 'sub-wrong' | 'sub-stats' | 'sub-badges' | 'sub-settings'
   */
  function switchMySubView(targetSubId) {
    if (!targetSubId) return;

    elements.mySubViews.forEach(view => {
      view.classList.toggle('active', view.id === targetSubId);
    });

    elements.mySubBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-sub') === targetSubId);
    });

    // 서브 화면 전환 시 최신 상태 동기화 (3-2단계 5대 모듈 연동)
    if (targetSubId === 'sub-vocab') {
      if (window.AegukMyVocab) window.AegukMyVocab.render();
      else renderMyVocabList();
    } else if (targetSubId === 'sub-wrong') {
      if (window.AegukWrongNotes) window.AegukWrongNotes.render();
      else renderWrongNotesList();
    } else if (targetSubId === 'sub-stats') {
      if (window.AegukStats) window.AegukStats.render();
    } else if (targetSubId === 'sub-badges') {
      if (window.AegukBadges) window.AegukBadges.render();
      else renderBadgesAndXP();
    } else if (targetSubId === 'sub-settings') {
      if (window.AegukSettings) window.AegukSettings.render();
    }
  }

  /**
   * 온보딩 모달 열기
   */
  function openOnboardingModal() {
    if (!elements.onboardingModal) return;
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
   * 온보딩 스텝 전환
   */
  function goToOnboardingStep(stepNumber) {
    currentOnboardingStep = stepNumber;

    elements.stepContents.forEach((content, index) => {
      content.classList.toggle('active', index === stepNumber - 1);
    });

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
      line.classList.toggle('active', index + 1 < stepNumber);
    });

    if (stepNumber === 3 && elements.onboardingNickname) {
      setTimeout(() => elements.onboardingNickname.focus(), 150);
    }
  }

  /**
   * 라디오 옵션 카드 헬퍼
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

    if (!nicknameInput || nicknameInput.length < 2 || nicknameInput.length > 8) {
      if (elements.nicknameErrorTip) {
        elements.nicknameErrorTip.textContent = '⚠️ 닉네임은 공백 없이 2자 이상 8자 이내로 입력해 주세요.';
        elements.nicknameErrorTip.classList.add('error');
      }
      if (elements.onboardingNickname) elements.onboardingNickname.focus();
      return;
    }

    let selectedGrade = '중학생';
    elements.gradeRadios.forEach(r => { if (r.checked) selectedGrade = r.value; });

    let selectedGoal = '고전 독해 · 한자어';
    elements.goalRadios.forEach(r => { if (r.checked) selectedGoal = r.value; });

    let selectedDailyQuestions = 10;
    elements.dailyQuestionRadios.forEach(r => { if (r.checked) selectedDailyQuestions = r.value; });

    if (window.SeodangStorage) {
      window.SeodangStorage.completeOnboarding({
        nickname: nicknameInput,
        grade: selectedGrade,
        goal: selectedGoal,
        dailyQuestions: selectedDailyQuestions
      });
    }

    closeOnboardingModal();
    renderAllProfileUI();
  }

  // ========================================================
  // 2-2단계: AI 옛글 풀이 엔진 및 형태소 툴팁 파이프라인
  // ========================================================

  /**
   * 토스트 알림 띄우기
   * @param {string} msg 
   */
  function showToast(msg) {
    if (!elements.seodangToast || !elements.toastMessage) return;
    elements.toastMessage.textContent = msg;
    elements.seodangToast.style.display = 'flex';

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      elements.seodangToast.style.display = 'none';
    }, 2800);
  }

  /**
   * AI 옛글 풀이 요청 핸들러
   * @param {string} imageDataUrl 
   */
  async function handleAITranslationRequest(imageDataUrl) {
    if (!window.AegukAIService) return;

    // 1. 로딩 스피너 활성화 및 기존 결과창 숨김
    if (elements.aiLoadingCard) elements.aiLoadingCard.style.display = 'block';
    if (elements.aiResultContainer) elements.aiResultContainer.style.display = 'none';

    // 뷰파인더 아래로 부드럽게 스크롤 이동
    if (elements.aiLoadingCard) {
      elements.aiLoadingCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    try {
      // 1.5초 분석 시뮬레이션 실행
      const response = await window.AegukAIService.analyzeOldText(imageDataUrl);
      const data = response.analysis;

      // 2. 결과 데이터 바인딩
      if (elements.resultEraBadge) elements.resultEraBadge.textContent = data.era;
      if (elements.resultAuthor) elements.resultAuthor.textContent = data.author;
      if (elements.resultTitle) elements.resultTitle.textContent = data.title;
      if (elements.resultOriginalText) elements.resultOriginalText.textContent = `"${data.originalText}"`;
      if (elements.resultModernText) elements.resultModernText.textContent = data.modernText;
      if (elements.resultCommentaryText) elements.resultCommentaryText.textContent = data.commentary;

      // 3. 형태소 칩 동적 생성
      renderMorphemeChips(data.morphemes);

      // 4. 로딩 종료 후 결과 카드 표시
      if (elements.aiLoadingCard) elements.aiLoadingCard.style.display = 'none';
      if (elements.aiResultContainer) {
        elements.aiResultContainer.style.display = 'flex';
        elements.aiResultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      showToast(`'${data.title}' 강독 및 풀이가 완료되었습니다.`);
    } catch (err) {
      console.error('[AegukApp] AI 풀이 처리 중 오류:', err);
      if (elements.aiLoadingCard) elements.aiLoadingCard.style.display = 'none';
      alert('AI 옛글 풀이 도중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }

  /**
   * 형태소 단어 칩 리스트 렌더링
   * @param {Array} morphemes 
   */
  function renderMorphemeChips(morphemes) {
    if (!elements.morphemeChipsGrid) return;
    elements.morphemeChipsGrid.innerHTML = '';

    morphemes.forEach((item, index) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'morpheme-chip old-hangul';
      chip.innerHTML = `<span>${item.word}</span> <span class="chip-star">★</span>`;
      chip.title = `${item.word} 클릭하여 풀이 보기 및 단어장에 저장`;

      chip.addEventListener('click', function () {
        openMorphemeTooltip(item);
      });

      elements.morphemeChipsGrid.appendChild(chip);
    });
  }

  /**
   * 형태소 상세 해설 툴팁 모달 열기
   * @param {Object} item - { word, hanja, meaning, source, category, grammar }
   */
  function openMorphemeTooltip(item) {
    currentActiveMorpheme = item;

    if (elements.tooltipCatBadge) elements.tooltipCatBadge.textContent = item.category || '옛말';
    if (elements.tooltipWord) elements.tooltipWord.textContent = item.word;
    if (elements.tooltipHanja) elements.tooltipHanja.textContent = item.hanja ? `(${item.hanja})` : '';
    if (elements.tooltipMeaning) elements.tooltipMeaning.textContent = item.meaning;
    if (elements.tooltipGrammar) elements.tooltipGrammar.textContent = item.grammar || '핵심 문법 사항';
    if (elements.tooltipSource) elements.tooltipSource.textContent = `출전: ${item.source || '고전문학'}`;

    // 이미 단어장에 저장된 단어인지 확인
    const myVocabList = window.SeodangStorage ? window.SeodangStorage.get('myVocab') || [] : [];
    const isAlreadySaved = myVocabList.some(v => v.word === item.word);

    if (elements.btnSaveToMyVocab) {
      if (isAlreadySaved) {
        elements.btnSaveToMyVocab.textContent = '✓ 이미 저장된 단어입니다';
        elements.btnSaveToMyVocab.classList.add('saved');
        elements.btnSaveToMyVocab.disabled = true;
      } else {
        elements.btnSaveToMyVocab.textContent = '★ 내 단어장에 저장';
        elements.btnSaveToMyVocab.classList.remove('saved');
        elements.btnSaveToMyVocab.disabled = false;
      }
    }

    if (elements.morphemeModalOverlay) {
      elements.morphemeModalOverlay.style.display = 'flex';
    }
  }

  /**
   * 형태소 툴팁 모달 닫기
   */
  function closeMorphemeTooltip() {
    if (elements.morphemeModalOverlay) {
      elements.morphemeModalOverlay.style.display = 'none';
    }
    currentActiveMorpheme = null;
  }

  /**
   * 형태소 단어를 LocalStorage의 'myVocab'에 영속화 저장
   */
  function saveCurrentMorphemeToVocab() {
    if (!currentActiveMorpheme || !window.SeodangStorage) return;

    const myVocab = window.SeodangStorage.get('myVocab') || [];
    const isExist = myVocab.some(v => v.word === currentActiveMorpheme.word);

    if (isExist) {
      showToast(`'${currentActiveMorpheme.word}'은(는) 이미 단어장에 저장되어 있습니다.`);
      return;
    }

    // 신규 단어 객체 생성
    const newWordEntry = {
      id: Date.now(),
      word: currentActiveMorpheme.word,
      hanja: currentActiveMorpheme.hanja || '',
      meaning: currentActiveMorpheme.meaning,
      source: currentActiveMorpheme.source || 'AI 촬영 풀이',
      category: currentActiveMorpheme.category || '옛말',
      isFavorite: true,
      date: new Date().toISOString().slice(0, 10)
    };

    // 최신 단어가 맨 위로 오도록 unshift
    myVocab.unshift(newWordEntry);
    window.SeodangStorage.set('myVocab', myVocab);

    // 버튼 상태 갱신
    if (elements.btnSaveToMyVocab) {
      elements.btnSaveToMyVocab.textContent = '✓ 저장 완료';
      elements.btnSaveToMyVocab.classList.add('saved');
      elements.btnSaveToMyVocab.disabled = true;
    }

    // 토스트 안내 팝업
    showToast(`'${newWordEntry.word}'이(가) [33 내 단어장]에 저장되었습니다! ★`);

    // 단어장 UI 실시간 리렌더링
    renderMyVocabList();

    // 0.8초 후 모달 자동 닫기
    setTimeout(closeMorphemeTooltip, 800);
  }

  // ========================================================
  // [33 내 단어장] 실시간 동적 렌더링 & 필터링 모듈
  // ========================================================

  /**
   * MY [33 내 단어장] 리스트 실시간 동적 렌더링
   */
  function renderMyVocabList() {
    if (!elements.vocabListContainer || !window.SeodangStorage) return;

    let vocabList = window.SeodangStorage.get('myVocab') || [];

    // 카운트 인디케이터 업데이트
    if (elements.vocabCountIndicator) {
      elements.vocabCountIndicator.textContent = vocabList.length;
    }

    // 1. 카테고리 필터링
    if (vocabCurrentCategory !== '전체') {
      vocabList = vocabList.filter(item => item.category === vocabCurrentCategory);
    }

    // 2. 검색어 필터링
    if (vocabSearchKeyword.trim() !== '') {
      const kw = vocabSearchKeyword.trim().toLowerCase();
      vocabList = vocabList.filter(item =>
        item.word.toLowerCase().includes(kw) ||
        (item.hanja && item.hanja.toLowerCase().includes(kw)) ||
        item.meaning.toLowerCase().includes(kw) ||
        (item.source && item.source.toLowerCase().includes(kw))
      );
    }

    // 리스트 비우기
    elements.vocabListContainer.innerHTML = '';

    // 빈 결과 안내
    if (vocabList.length === 0) {
      elements.vocabListContainer.innerHTML = `
        <div class="empty-archive-box">
          <span>조건에 일치하는 단어가 없습니다.</span>
        </div>
      `;
      return;
    }

    // 단어 카드 아이템 렌더링
    vocabList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'vocab-card';
      card.innerHTML = `
        <div class="vocab-main">
          <div class="vocab-word-row">
            <h4 class="vocab-word old-hangul">${item.word} ${item.hanja ? `<span class="hanja">(${item.hanja})</span>` : ''}</h4>
            <span class="vocab-cat-badge">${item.category || '옛말'}</span>
          </div>
          <p class="vocab-meaning">${item.meaning}</p>
          <span class="vocab-source">출전: ${item.source || '고전문학'}</span>
        </div>
        <button class="fav-star-btn ${item.isFavorite ? 'active' : ''}" aria-label="즐겨찾기">
          ${item.isFavorite ? '★' : '☆'}
        </button>
      `;

      // 즐겨찾기 별 토글 이벤트
      const starBtn = card.querySelector('.fav-star-btn');
      starBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleVocabFavorite(item.id);
      });

      elements.vocabListContainer.appendChild(card);
    });
  }

  /**
   * 단어 즐겨찾기(★) 토글
   * @param {number} vocabId 
   */
  function toggleVocabFavorite(vocabId) {
    if (!window.SeodangStorage) return;
    const list = window.SeodangStorage.get('myVocab') || [];
    const target = list.find(v => v.id === vocabId);
    if (target) {
      target.isFavorite = !target.isFavorite;
      window.SeodangStorage.set('myVocab', list);
      renderMyVocabList();
    }
  }

  // ========================================================
  // [34 오답노트] & [36 배지·경험치] 실시간 동적 렌더링 (3-1단계 연동)
  // ========================================================

  /**
   * MY [34 오답노트] 목록 렌더링
   */
  function renderWrongNotesList() {
    const listContainer = document.getElementById('wrongNotesListContainer');
    if (!listContainer || !window.SeodangStorage) return;

    const wrongList = window.SeodangStorage.get('wrongNotes') || [];

    const unreviewedCount = wrongList.filter(w => !w.isReviewed).length;
    const reviewedCount = wrongList.filter(w => w.isReviewed).length;

    const countWeekly = document.getElementById('wrongCountWeekly');
    if (countWeekly) countWeekly.innerHTML = `${unreviewedCount}<small>문제</small>`;

    const countRev = document.getElementById('wrongCountReviewed');
    if (countRev) countRev.innerHTML = `${reviewedCount}<small>문제</small>`;

    listContainer.innerHTML = '';

    if (wrongList.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-archive-box">
          <span>기록된 오답이 없습니다. 훌륭합니다! 🎯</span>
        </div>
      `;
      return;
    }

    wrongList.forEach(item => {
      const card = document.createElement('div');
      card.className = `wrong-card ${item.isReviewed ? 'reviewed' : ''}`;
      card.innerHTML = `
        <div class="wrong-main" style="flex: 1;">
          <h4 class="wrong-question old-hangul" style="font-size: 13.5px; font-weight: 700; margin-bottom: 4px;">
            ${item.question}
          </h4>
          <div class="wrong-choice-row" style="display: flex; flex-direction: column; gap: 2px; font-size: 11.5px; margin-bottom: 4px;">
            <span class="choice-wrong" style="color: var(--color-seal); font-weight: 600;">
              ❌ 나의 선택: ${item.userChoice}
            </span>
            <span class="choice-correct" style="color: var(--color-dark-green); font-weight: 700;">
              ✅ 정답: ${item.answer}
            </span>
          </div>
          <span style="font-size: 10px; color: var(--color-ink-light);">학습일: ${item.date || '최근'}</span>
        </div>
        <button type="button" class="btn btn-sm ${item.isReviewed ? 'btn-secondary' : 'btn-primary'} btn-review-item" style="font-size: 11px; padding: 5px 9px;">
          ${item.isReviewed ? '✓ 복습완료' : '다시 복습'}
        </button>
      `;

      const reviewBtn = card.querySelector('.btn-review-item');
      if (!item.isReviewed) {
        reviewBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          item.isReviewed = true;
          window.SeodangStorage.set('wrongNotes', wrongList);
          showToast(`'${item.question.slice(0, 10)}...' 문제를 복습 완료했습니다! ✅`);
          renderWrongNotesList();
        });
      }

      listContainer.appendChild(card);
    });
  }

  /**
   * MY [36 배지·경험치] 화면 렌더링
   */
  function renderBadgesAndXP() {
    if (!window.SeodangStorage) return;
    const badgesXP = window.SeodangStorage.get('badgesXP') || {
      level: 7,
      title: '한글 탐험가',
      currentXP: 1240,
      nextLevelXP: 2000,
      badges: []
    };

    const levelTitle = document.getElementById('badgeLevelTitle');
    if (levelTitle) levelTitle.textContent = `LEVEL ${badgesXP.level} ${badgesXP.title}`;

    const xpRatio = document.getElementById('badgeXpRatio');
    if (xpRatio) xpRatio.textContent = `${badgesXP.currentXP.toLocaleString()} / ${badgesXP.nextLevelXP.toLocaleString()} XP`;

    const xpBar = document.getElementById('badgeXpBar');
    if (xpBar) {
      const pct = Math.min(100, Math.round((badgesXP.currentXP / badgesXP.nextLevelXP) * 100));
      xpBar.style.width = `${pct}%`;
    }

    const grid = document.getElementById('badgeGrid2x3');
    if (grid && Array.isArray(badgesXP.badges)) {
      grid.innerHTML = '';
      badgesXP.badges.forEach(b => {
        const item = document.createElement('div');
        item.className = `badge-item ${b.unlocked ? 'unlocked' : 'locked'}`;
        item.title = `${b.name} (${b.desc})`;
        item.innerHTML = `
          <div class="badge-seal-icon">${b.symbol}</div>
          <strong class="badge-name">${b.name}</strong>
          <span class="badge-status">${b.unlocked ? '획득 완료' : '미획득 (도전 중)'}</span>
        `;

        item.addEventListener('click', function () {
          if (b.unlocked) {
            showToast(`🏆 [${b.symbol}] '${b.name}': ${b.desc} (획득 완료)`);
          } else {
            showToast(`🔒 [${b.symbol}] '${b.name}': ${b.desc}을(를) 달성하여 해금하세요!`);
          }
        });

        grid.appendChild(item);
      });
    }
  }

  /**
   * 단어장 검색 및 필터 칩 이벤트 바인딩
   */
  function setupVocabSearchAndFilter() {
    // 실시간 검색 인풋 (readonly 해제 및 이벤트 연결)
    if (elements.vocabSearchInput) {
      elements.vocabSearchInput.removeAttribute('readonly');
      elements.vocabSearchInput.addEventListener('input', function (e) {
        vocabSearchKeyword = e.target.value;
        renderMyVocabList();
      });
    }

    // 카테고리 필터 칩 클릭
    if (elements.vocabFilterChips) {
      elements.vocabFilterChips.forEach(chip => {
        chip.addEventListener('click', function () {
          elements.vocabFilterChips.forEach(c => c.classList.remove('active'));
          this.classList.add('active');
          vocabCurrentCategory = this.textContent.trim();
          renderMyVocabList();
        });
      });
    }
  }

  /**
   * 이벤트 바인딩
   */
  function bindEvents() {
    // 메인 네비게이션
    elements.navItems.forEach(btn => {
      btn.addEventListener('click', function () {
        switchMainTab(this.getAttribute('data-target'));
      });
    });

    if (elements.headerMyBtn) {
      elements.headerMyBtn.addEventListener('click', () => {
        switchMainTab('tab-my');
        switchMySubView('sub-settings');
      });
    }

    // MY 서브 탭
    elements.mySubBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        switchMySubView(this.getAttribute('data-sub'));
      });
    });

    // 홈 퀵 액션
    elements.quickActionItems.forEach((item, index) => {
      item.addEventListener('click', function () {
        if (index === 0) switchMainTab('tab-camera');
        else if (index === 1) switchMainTab('tab-study');
        else if (index === 2) switchMainTab('tab-game');
      });
    });

    // 온보딩 모달
    setupOptionCards('input[name="userGrade"]', '.option-card');
    setupOptionCards('input[name="userGoal"]', '.option-card');
    setupOptionCards('input[name="userDailyQuestions"]', '.target-chip');

    if (elements.btnNextStep1) elements.btnNextStep1.addEventListener('click', () => goToOnboardingStep(2));
    if (elements.btnPrevStep2) elements.btnPrevStep2.addEventListener('click', () => goToOnboardingStep(1));
    if (elements.btnNextStep2) elements.btnNextStep2.addEventListener('click', () => goToOnboardingStep(3));
    if (elements.btnPrevStep3) elements.btnPrevStep3.addEventListener('click', () => goToOnboardingStep(2));
    if (elements.btnCompleteOnboarding) elements.btnCompleteOnboarding.addEventListener('click', handleCompleteOnboarding);

    if (elements.onboardingNickname) {
      elements.onboardingNickname.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCompleteOnboarding();
        }
      });
    }

    // 환경설정 연동 (settings.js에서 처리하므로 중복 바인딩 제거)
    // settingProfileBtn, settingGoalBtn은 settings.js의 openProfileEditModal로 처리됨
    if (elements.settingResetBtn) {
      elements.settingResetBtn.addEventListener('click', function () {
        if (confirm('⚠️ 모든 학습 기록과 설정을 초기화하고 첫 입학 화면으로 되돌리시겠습니까?')) {
          window.SeodangStorage.clearAll();
          window.location.reload();
        }
      });
    }

    // 데이터 백업 & 복원 버튼
    const btnExport = document.getElementById('btnExportJSON');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        if (window.SeodangStorage) window.SeodangStorage.exportJSON();
      });
    }

    const btnImport = document.getElementById('btnImportJSON');
    const inputImport = document.getElementById('importJsonFileInput');
    if (btnImport && inputImport) {
      btnImport.addEventListener('click', () => inputImport.click());
      inputImport.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = function (evt) {
            const success = window.SeodangStorage.importJSON(evt.target.result);
            if (success) {
              alert('🎉 서당 학습 데이터가 성공적으로 복원되었습니다.');
              window.location.reload();
            } else {
              alert('⚠️ 올바른 백업 JSON 파일 형식이 아닙니다.');
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // 2-2단계: AI 풀이 요청 커스텀 이벤트 수신
    window.addEventListener('requestAITranslation', function (e) {
      if (e.detail && e.detail.imageDataUrl) {
        handleAITranslationRequest(e.detail.imageDataUrl);
      }
    });

    // 형태소 툴팁 모달 닫기 & 단어장 저장
    if (elements.btnCloseMorphemeTooltip) {
      elements.btnCloseMorphemeTooltip.addEventListener('click', closeMorphemeTooltip);
    }
    if (elements.morphemeModalOverlay) {
      elements.morphemeModalOverlay.addEventListener('click', function (e) {
        if (e.target === elements.morphemeModalOverlay) {
          closeMorphemeTooltip();
        }
      });
    }
    if (elements.btnSaveToMyVocab) {
      elements.btnSaveToMyVocab.addEventListener('click', saveCurrentMorphemeToVocab);
    }

    // 단어장 실시간 검색 & 필터
    setupVocabSearchAndFilter();

    // 스토리지 변경 수신
    window.addEventListener('storageUpdated', function () {
      renderAllProfileUI();
      renderMyVocabList();
    });
  }

  /**
   * 앱 구동 초기 진입점
   */
  function initApp() {
    cacheElements();

    if (window.SeodangStorage) {
      window.SeodangStorage.init();
    }

    renderAllProfileUI();
    if (window.AegukMyVocab) window.AegukMyVocab.render();
    if (window.AegukWrongNotes) window.AegukWrongNotes.render();
    if (window.AegukStats) window.AegukStats.render();
    if (window.AegukBadges) window.AegukBadges.render();
    if (window.AegukSettings) window.AegukSettings.render();

    if (window.SeodangStorage && !window.SeodangStorage.isOnboarded()) {
      openOnboardingModal();
    } else {
      closeOnboardingModal();
    }

    bindEvents();
    console.log('🏛️ 애국 AI (서당 AI) 3-2단계: MY 마이페이지 5대 서브뷰 및 통계 시각화·JSON 백업 인프라 최종 완성');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  window.AegukApp = {
    switchMainTab: switchMainTab,
    switchMySubView: switchMySubView,
    renderAllProfileUI: renderAllProfileUI,
    renderMyVocabList: renderMyVocabList,
    renderWrongNotesList: renderWrongNotesList,
    renderBadgesAndXP: renderBadgesAndXP,
    showToast: showToast
  };

})(window, document);
