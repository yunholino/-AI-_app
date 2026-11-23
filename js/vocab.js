/**
 * ========================================================
 * 애국 AI (서당 AI) - 플래시카드 & 문학 대역 뷰어 모듈
 * 파일: js/vocab.js
 * 2-3단계: 3D 플래시카드 회전, 암기 상태 동기화 & 고전문학 대역 뷰어
 * ========================================================
 */

(function (window, document) {
  'use strict';

  // 플래시카드 상태
  let cardQueue = [];
  let currentIndex = 0;
  let isCardFlipped = false;
  let masteredCount = 0;

  // 대역 뷰어 상태
  let currentLiteratureIndex = 0;

  // DOM 캐시
  let dom = {
    // 세그먼트 컨트롤
    segFlashcard: null,
    segParallel: null,
    flashcardSection: null,
    parallelSection: null,

    // 3D 플래시카드 DOM
    flashcardCard: null,
    cardProgressText: null,
    cardProgressBar: null,
    cardBadge: null,
    cardWord: null,
    cardExampleOriginal: null,
    cardHanja: null,
    cardMeaning: null,
    cardGrammar: null,
    cardExampleModern: null,
    btnVocabAgain: null,
    btnVocabMaster: null,
    flashcardCompleteBox: null,
    btnRestartCards: null,

    // 문학 대역 뷰어 DOM
    litSelectButtons: null,
    litTitleText: null,
    parallelGridContainer: null
  };

  /**
   * DOM 캐싱
   */
  function cacheElements() {
    dom.segFlashcard = document.getElementById('segBtnFlashcard');
    dom.segParallel = document.getElementById('segBtnParallel');
    dom.flashcardSection = document.getElementById('studyFlashcardSection');
    dom.parallelSection = document.getElementById('studyParallelSection');

    // 플래시카드
    dom.flashcardCard = document.getElementById('flashcardCard');
    dom.cardProgressText = document.getElementById('cardProgressText');
    dom.cardProgressBar = document.getElementById('cardProgressBar');
    dom.cardBadge = document.getElementById('cardCategoryBadge');
    dom.cardWord = document.getElementById('cardMainWord');
    dom.cardExampleOriginal = document.getElementById('cardExampleOriginal');
    dom.cardHanja = document.getElementById('cardBackHanja');
    dom.cardMeaning = document.getElementById('cardBackMeaning');
    dom.cardGrammar = document.getElementById('cardBackGrammar');
    dom.cardExampleModern = document.getElementById('cardBackExampleModern');
    dom.btnVocabAgain = document.getElementById('btnVocabAgain');
    dom.btnVocabMaster = document.getElementById('btnVocabMaster');
    dom.flashcardCompleteBox = document.getElementById('flashcardCompleteBox');
    dom.btnRestartCards = document.getElementById('btnRestartCards');

    // 대역 뷰어
    dom.litSelectButtons = document.querySelectorAll('.lit-selector-btn');
    dom.litTitleText = document.getElementById('litCurrentTitle');
    dom.parallelGridContainer = document.getElementById('parallelGridContainer');
  }

  /**
   * 플래시카드 큐 초기화
   */
  function initFlashcardQueue() {
    if (!window.AegukVocabData || !window.AegukVocabData.vocabs) return;
    cardQueue = [...window.AegukVocabData.vocabs];
    currentIndex = 0;
    masteredCount = 0;
    isCardFlipped = false;
    renderCurrentCard();
  }

  /**
   * 현재 카드 렌더링
   */
  function renderCurrentCard() {
    if (!dom.flashcardCard) return;

    // 회전 상태 초기화 (앞면으로 리셋)
    isCardFlipped = false;
    dom.flashcardCard.classList.remove('is-flipped');

    // 모든 카드를 학습 완료한 경우
    if (currentIndex >= cardQueue.length) {
      showCompletionView();
      return;
    }

    if (dom.flashcardCompleteBox) dom.flashcardCompleteBox.style.display = 'none';
    dom.flashcardCard.style.display = 'block';
    if (dom.btnVocabAgain) dom.btnVocabAgain.disabled = false;
    if (dom.btnVocabMaster) dom.btnVocabMaster.disabled = false;
    // 완료 화면에서 돌아올 때 고정 버튼 다시 표시
    const fixedActions = document.getElementById('flashcardFixedActions');
    if (fixedActions) fixedActions.classList.add('visible');

    const currentItem = cardQueue[currentIndex];

    // 프로그레스 인디케이터
    const progressPercent = Math.round(((currentIndex) / cardQueue.length) * 100);
    if (dom.cardProgressText) {
      dom.cardProgressText.textContent = `어휘 ${currentIndex + 1} / ${cardQueue.length}`;
    }
    if (dom.cardProgressBar) {
      dom.cardProgressBar.style.width = `${progressPercent}%`;
    }

    // 앞면 바인딩
    if (dom.cardBadge) dom.cardBadge.textContent = `${currentItem.category} #${String(currentItem.id).padStart(2, '0')}`;
    if (dom.cardWord) dom.cardWord.textContent = currentItem.word;
    if (dom.cardExampleOriginal) {
      dom.cardExampleOriginal.innerHTML = `"${currentItem.exampleOriginal}"`;
    }

    // 뒷면 바인딩
    if (dom.cardHanja) dom.cardHanja.textContent = currentItem.hanja ? `(${currentItem.hanja})` : '';
    if (dom.cardMeaning) dom.cardMeaning.textContent = currentItem.meaning;
    if (dom.cardGrammar) dom.cardGrammar.textContent = currentItem.grammarTip;
    if (dom.cardExampleModern) {
      dom.cardExampleModern.innerHTML = `"${currentItem.exampleModern}"`;
    }
  }

  /**
   * 플래시카드 뒤집기 (3D 회전 토글)
   */
  function toggleCardFlip() {
    if (!dom.flashcardCard) return;
    isCardFlipped = !isCardFlipped;
    dom.flashcardCard.classList.toggle('is-flipped', isCardFlipped);
  }

  /**
   * [외웠어요 ✅] 액션 처리:
   * - MY [35 학습 통계]의 '학습한 어휘' 카운트(stats.learnedWordsCount) 1 증가
   * - 다음 카드로 이동
   */
  function handleMasterCard() {
    masteredCount++;

    // LocalStorage stats.learnedWordsCount 1 증가
    if (window.SeodangStorage) {
      const stats = window.SeodangStorage.get('stats') || {};
      stats.learnedWordsCount = (stats.learnedWordsCount || 0) + 1;
      window.SeodangStorage.set('stats', stats);

      if (window.AegukApp && window.AegukApp.showToast) {
        window.AegukApp.showToast(`외운 어휘가 1개 추가되었습니다! (누적: ${stats.learnedWordsCount}개) ✅`);
      }
    }

    // 다음 카드로 이동
    currentIndex++;
    renderCurrentCard();
  }

  /**
   * [다시 볼래요 🔄] 액션 처리:
   * - 현재 카드를 큐의 맨 뒤로 보내어 재학습
   */
  function handleAgainCard() {
    const currentItem = cardQueue[currentIndex];
    // 현재 항목을 큐 맨 뒤에 한 번 더 푸시
    cardQueue.push(currentItem);

    if (window.AegukApp && window.AegukApp.showToast) {
      window.AegukApp.showToast(`'${currentItem.word}'을(를) 잠시 후 다시 복습합니다 🔄`);
    }

    currentIndex++;
    renderCurrentCard();
  }

  /**
   * 모든 카드 학습 완료 화면
   */
  function showCompletionView() {
    if (dom.flashcardCard) dom.flashcardCard.style.display = 'none';
    if (dom.flashcardCompleteBox) dom.flashcardCompleteBox.style.display = 'block';
    // 완료 시 고정 버튼 숨기기
    const fixedActions = document.getElementById('flashcardFixedActions');
    if (fixedActions) fixedActions.classList.remove('visible');

    if (dom.cardProgressBar) {
      dom.cardProgressBar.style.width = '100%';
    }
    if (dom.cardProgressText) {
      dom.cardProgressText.textContent = `완료! (외운 어휘 ${masteredCount}개)`;
    }

    if (window.AegukApp && window.AegukApp.showToast) {
      window.AegukApp.showToast('🎉 오늘의 필수 고어 어휘 학습을 모두 완료했습니다!');
    }
  }

  // ========================================================
  // 고전문학 1:1 대역 뷰어 모듈
  // ========================================================

  /**
   * 대역 뷰어 렌더링
   * @param {number} litIndex 
   */
  function renderParallelLiterature(litIndex) {
    if (!window.AegukVocabData || !window.AegukVocabData.literatures) return;
    const litList = window.AegukVocabData.literatures;
    if (!litList[litIndex]) return;

    currentLiteratureIndex = litIndex;
    const litData = litList[litIndex];

    // 제목 표시
    if (dom.litTitleText) {
      dom.litTitleText.textContent = litData.title;
    }

    // 셀렉터 버튼 활성화 동기화
    if (dom.litSelectButtons) {
      dom.litSelectButtons.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === litIndex);
      });
    }

    // 1:1 대역 행 렌더링
    if (!dom.parallelGridContainer) return;
    dom.parallelGridContainer.innerHTML = '';

    litData.rows.forEach((row, idx) => {
      const rowElem = document.createElement('div');
      rowElem.className = 'parallel-dual-card';
      rowElem.innerHTML = `
        <div class="parallel-line line-original">
          <span class="line-badge badge-orig">원문 ${idx + 1}</span>
          <p class="line-text old-hangul">${row.original}</p>
        </div>
        <div class="parallel-line line-modern">
          <span class="line-badge badge-trans">풀이</span>
          <p class="line-text">${row.translation}</p>
        </div>
      `;
      dom.parallelGridContainer.appendChild(rowElem);
    });
  }

  /**
   * 서브 탭 모드 전환 (플래시카드 ↔ 대역 뷰어)
   * @param {string} mode - 'flashcard' | 'parallel'
   */
  function switchStudySubMode(mode) {
    const isFlashcard = mode === 'flashcard';

    if (dom.segFlashcard) dom.segFlashcard.classList.toggle('active', isFlashcard);
    if (dom.segParallel) dom.segParallel.classList.toggle('active', !isFlashcard);

    if (dom.flashcardSection) dom.flashcardSection.style.display = isFlashcard ? 'block' : 'none';
    if (dom.parallelSection) dom.parallelSection.style.display = isFlashcard ? 'none' : 'block';

    if (!isFlashcard) {
      renderParallelLiterature(currentLiteratureIndex);
    }
  }

  /**
   * 이벤트 바인딩
   */
  function bindEvents() {
    // 1. 상단 모드 전환 세그먼트 버튼
    if (dom.segFlashcard) {
      dom.segFlashcard.addEventListener('click', () => switchStudySubMode('flashcard'));
    }
    if (dom.segParallel) {
      dom.segParallel.addEventListener('click', () => switchStudySubMode('parallel'));
    }

    // 2. 플래시카드 클릭 -> 3D 회전
    if (dom.flashcardCard) {
      dom.flashcardCard.addEventListener('click', toggleCardFlip);
    }

    // 3. 플래시카드 하단 버튼
    if (dom.btnVocabAgain) {
      dom.btnVocabAgain.addEventListener('click', handleAgainCard);
    }
    if (dom.btnVocabMaster) {
      dom.btnVocabMaster.addEventListener('click', handleMasterCard);
    }

    // 4. 완료 후 처음부터 다시 학습 버튼
    if (dom.btnRestartCards) {
      dom.btnRestartCards.addEventListener('click', initFlashcardQueue);
    }

    // 5. 문학 대역 뷰어 작품 선택 버튼
    if (dom.litSelectButtons) {
      dom.litSelectButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => renderParallelLiterature(idx));
      });
    }
  }

  /**
   * 초기화
   */
  function initVocabModule() {
    cacheElements();
    bindEvents();
    initFlashcardQueue();
    renderParallelLiterature(0);
    console.log('📖 애국 AI 2-3단계: 3D 플래시카드 & 문학 대역 뷰어 모듈 준비 완료');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVocabModule);
  } else {
    initVocabModule();
  }

  // 외부 공개 API
  window.AegukVocab = {
    initFlashcardQueue: initFlashcardQueue,
    switchStudySubMode: switchStudySubMode,
    renderParallelLiterature: renderParallelLiterature
  };

})(window, document);
