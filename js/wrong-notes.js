/**
 * ========================================================
 * 애국 AI (서당 AI) - [34 오답노트] 서브 모듈
 * 파일: js/wrong-notes.js
 * 3-2단계: 오답 요약 카드, 1문항 즉석 복습 팝업 퀴즈 & 복습 완료 상태 동기화
 * ========================================================
 */

(function (window, document) {
  'use strict';

  let dom = {
    container: null,
    weeklyCount: null,
    reviewedCount: null,
    listContainer: null,

    // 즉석 복습 팝업 모달
    reviewModal: null,
    modalQuestion: null,
    modalChoicesGrid: null,
    modalFeedback: null,
    modalCloseBtn: null
  };

  let activeReviewItem = null;

  function cacheElements() {
    dom.container = document.getElementById('sub-wrong');
    if (!dom.container) return;

    dom.weeklyCount = document.getElementById('wrongCountWeekly');
    dom.reviewedCount = document.getElementById('wrongCountReviewed');
    dom.listContainer = document.getElementById('wrongNotesListContainer');

    dom.reviewModal = document.getElementById('wrongReviewModal');
    dom.modalQuestion = document.getElementById('reviewModalQuestion');
    dom.modalChoicesGrid = document.getElementById('reviewModalChoices');
    dom.modalFeedback = document.getElementById('reviewModalFeedback');
    dom.modalCloseBtn = document.getElementById('btnReviewModalClose');
  }

  /**
   * 오답노트 목록 렌더링
   */
  function render() {
    if (!dom.listContainer || !window.SeodangStorage) return;

    const wrongList = window.SeodangStorage.get('wrongNotes') || [];

    const unreviewedCount = wrongList.filter(item => !item.isReviewed).length;
    const reviewedCount = wrongList.filter(item => item.isReviewed).length;

    if (dom.weeklyCount) dom.weeklyCount.innerHTML = `${unreviewedCount}<small>문제</small>`;
    if (dom.reviewedCount) dom.reviewedCount.innerHTML = `${reviewedCount}<small>문제</small>`;

    dom.listContainer.innerHTML = '';

    if (wrongList.length === 0) {
      dom.listContainer.innerHTML = `
        <div class="empty-archive-box" style="padding: 30px 16px; text-align: center; color: var(--color-ink-light);">
          <span style="font-size: 28px; display: block; margin-bottom: 8px;">🎯</span>
          <span>기록된 오답이 없습니다. 훌륭합니다!</span>
        </div>
      `;
      return;
    }

    wrongList.forEach(item => {
      const card = document.createElement('div');
      card.className = `wrong-card ${item.isReviewed ? 'reviewed' : ''}`;
      card.innerHTML = `
        <div class="wrong-main" style="flex: 1; padding-right: 10px;">
          <h4 class="wrong-question old-hangul" style="font-size: 13.5px; font-weight: 700; margin-bottom: 5px; color: var(--color-ink-deep);">
            ${item.question}
          </h4>
          <div class="wrong-choice-row" style="display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; margin-bottom: 4px;">
            <span class="choice-wrong" style="color: var(--color-seal); font-weight: 600;">
              ❌ 나의 선택: ${item.userChoice}
            </span>
            <span class="choice-correct" style="color: var(--color-dark-green); font-weight: 700;">
              ✅ 정답: ${item.answer}
            </span>
          </div>
          <span style="font-size: 10.5px; color: var(--color-ink-light);">오답 발생일: ${item.date || '최근'}</span>
        </div>
        <div class="wrong-action-col">
          <button type="button" class="btn btn-sm ${item.isReviewed ? 'btn-secondary' : 'btn-primary'} btn-review-trigger" style="font-size: 11.5px; padding: 6px 10px; white-space: nowrap;">
            ${item.isReviewed ? '✓ 복습완료' : '✍️ 복습'}
          </button>
        </div>
      `;

      const reviewBtn = card.querySelector('.btn-review-trigger');
      reviewBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openInstantReviewModal(item);
      });

      dom.listContainer.appendChild(card);
    });
  }

  /**
   * 1문항 즉석 복습 팝업 퀴즈 열기
   */
  function openInstantReviewModal(item) {
    activeReviewItem = item;
    if (!dom.reviewModal) return;

    if (dom.modalQuestion) {
      dom.modalQuestion.textContent = item.question;
    }

    if (dom.modalFeedback) {
      dom.modalFeedback.style.display = 'none';
      dom.modalFeedback.textContent = '';
      dom.modalFeedback.className = 'quiz-feedback-alert';
    }

    // 선택지 구성: 실제 정답 + 오답 선택지 + 임의의 오답 2종
    const distractorCandidates = [
      '서로 닮지 아니하여',
      '아름답고 예쁘게',
      '나이가 적은',
      '행동을 하니라',
      '사랑하다, 귀여워하다',
      '생각하다, 헤아리다',
      '능히, 능숙하게',
      '깨끗하다, 맑다',
      '태어나다, 생기다',
      '자연을 몹시 사랑하는 병',
      '은혜를 잊지 못함'
    ];

    const choicesSet = new Set();
    choicesSet.add(item.answer);
    if (item.userChoice && item.userChoice !== '10초 시간 초과 (미응답)') {
      choicesSet.add(item.userChoice);
    }

    // 4개 채우기
    for (const d of distractorCandidates) {
      if (choicesSet.size >= 4) break;
      if (d !== item.answer) choicesSet.add(d);
    }

    // 셔플
    const shuffledChoices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

    if (dom.modalChoicesGrid) {
      dom.modalChoicesGrid.innerHTML = '';
      const symbols = ['①', '②', '③', '④'];

      shuffledChoices.forEach((choiceText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-choice-btn';
        btn.innerHTML = `
          <span class="choice-num">${symbols[idx]}</span>
          <span class="choice-text">${choiceText}</span>
        `;

        btn.addEventListener('click', function () {
          handleReviewAnswer(choiceText, btn, item);
        });

        dom.modalChoicesGrid.appendChild(btn);
      });
    }

    dom.reviewModal.style.display = 'flex';
  }

  /**
   * 복습 퀴즈 답안 검증
   */
  function handleReviewAnswer(selectedChoice, selectedBtn, item) {
    const isCorrect = (selectedChoice === item.answer);
    const buttons = dom.modalChoicesGrid.querySelectorAll('.quiz-choice-btn');
    buttons.forEach(b => b.disabled = true);

    if (isCorrect) {
      selectedBtn.classList.add('correct');
      if (dom.modalFeedback) {
        dom.modalFeedback.className = 'quiz-feedback-alert correct';
        dom.modalFeedback.textContent = '🎉 훌륭합니다! 정답을 맞혀 복습을 완료했습니다 (+30 XP)';
        dom.modalFeedback.style.display = 'block';
      }

      // 상태 영속화: isReviewed = true
      item.isReviewed = true;
      if (window.SeodangStorage) {
        const wrongList = window.SeodangStorage.get('wrongNotes') || [];
        const target = wrongList.find(w => w.id === item.id);
        if (target) {
          target.isReviewed = true;
          window.SeodangStorage.set('wrongNotes', wrongList);
        }

        // 복습 완료 10건 시 [復] (완벽 복습) 배지 해금 검사
        const badgesXP = window.SeodangStorage.get('badgesXP') || {};
        const reviewedCount = wrongList.filter(w => w.isReviewed).length;
        if (badgesXP.badges && reviewedCount >= 10) {
          const revBadge = badgesXP.badges.find(b => b.id === 'b6' || b.symbol === '復');
          if (revBadge && !revBadge.unlocked) {
            revBadge.unlocked = true;
            if (window.AegukApp && window.AegukApp.showToast) {
              window.AegukApp.showToast('🏆 [復] \'완벽 복습\' 배지를 해금하셨습니다!');
            }
          }
        }

        // +30 XP 보너스 가산
        if (badgesXP.currentXP !== undefined) {
          badgesXP.currentXP += 30;
          window.SeodangStorage.set('badgesXP', badgesXP);
        }
      }

      setTimeout(() => {
        closeInstantReviewModal();
        render();
      }, 1400);

    } else {
      selectedBtn.classList.add('wrong');
      if (dom.modalFeedback) {
        dom.modalFeedback.className = 'quiz-feedback-alert wrong';
        dom.modalFeedback.textContent = `❌ 아쉽습니다! 올바른 정답은 [${item.answer}]입니다.`;
        dom.modalFeedback.style.display = 'block';
      }

      setTimeout(() => {
        buttons.forEach(b => b.disabled = false);
      }, 1400);
    }
  }

  function closeInstantReviewModal() {
    if (dom.reviewModal) {
      dom.reviewModal.style.display = 'none';
    }
    activeReviewItem = null;
  }

  function bindEvents() {
    if (dom.modalCloseBtn) {
      dom.modalCloseBtn.addEventListener('click', closeInstantReviewModal);
    }

    if (dom.reviewModal) {
      dom.reviewModal.addEventListener('click', function (e) {
        if (e.target === dom.reviewModal) {
          closeInstantReviewModal();
        }
      });
    }

    window.addEventListener('storageUpdated', function () {
      render();
    });
  }

  function init() {
    cacheElements();
    bindEvents();
    render();
    console.log('📝 [애국 AI] 3-2단계: [34 오답노트] 모듈 초기화 완료');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AegukWrongNotes = {
    render: render,
    openInstantReviewModal: openInstantReviewModal
  };

})(window, document);
