/**
 * ========================================================
 * 애국 AI (서당 AI) - [36 배지·경험치] 서브 모듈
 * 파일: js/badges.js
 * 3-2단계: 레벨/XP 게이지, 2x3 전통 인장 배지 그리드 & 배지 상세 설명 모달
 * ========================================================
 */

(function (window, document) {
  'use strict';

  let dom = {
    levelTitle: null,
    xpRatioText: null,
    xpBarFill: null,
    badgeGrid: null,

    // 배지 상세 모달
    badgeModal: null,
    modalSeal: null,
    modalName: null,
    modalDesc: null,
    modalCriteria: null,
    modalStatusTag: null,
    modalCloseBtn: null
  };

  function cacheElements() {
    dom.levelTitle = document.getElementById('badgeLevelTitle');
    dom.xpRatioText = document.getElementById('badgeXpRatio');
    dom.xpBarFill = document.getElementById('badgeXpBar');
    dom.badgeGrid = document.getElementById('badgeGrid2x3');

    dom.badgeModal = document.getElementById('badgeDetailModal');
    dom.modalSeal = document.getElementById('badgeModalSeal');
    dom.modalName = document.getElementById('badgeModalName');
    dom.modalDesc = document.getElementById('badgeModalDesc');
    dom.modalCriteria = document.getElementById('badgeModalCriteria');
    dom.modalStatusTag = document.getElementById('badgeModalStatusTag');
    dom.modalCloseBtn = document.getElementById('btnBadgeModalClose');
  }

  /**
   * 배지 해금 조건 자동 검사 & 데이터 동기화
   */
  function checkAutoBadgeUnlocks(storageData) {
    if (!storageData || !storageData.badgesXP || !Array.isArray(storageData.badgesXP.badges)) return false;

    let isChanged = false;
    const badges = storageData.badgesXP.badges;
    const profile = storageData.profile || {};
    const stats = storageData.stats || {};
    const myVocab = storageData.myVocab || [];
    const wrongNotes = storageData.wrongNotes || [];

    // [七] 7일 연속 출석
    const streak = profile.streak || stats.streakDays || 1;
    const bSeven = badges.find(b => b.id === 'b2' || b.symbol === '七');
    if (bSeven && !bSeven.unlocked && streak >= 7) {
      bSeven.unlocked = true;
      isChanged = true;
    }

    // [字] 어휘 수집가: 단어 20개 저장
    const bWord = badges.find(b => b.id === 'b3' || b.symbol === '字');
    if (bWord && !bWord.unlocked && myVocab.length >= 20) {
      bWord.unlocked = true;
      isChanged = true;
    }

    // [古] 고전 박사: 학습 어휘 50개 마스터
    const bDoctor = badges.find(b => b.id === 'b5' || b.symbol === '古');
    if (bDoctor && !bDoctor.unlocked && (stats.learnedWordsCount || 0) >= 50) {
      bDoctor.unlocked = true;
      isChanged = true;
    }

    // [復] 완벽 복습: 오답 10문제 복습 완료
    const reviewedCount = wrongNotes.filter(w => w.isReviewed).length;
    const bReview = badges.find(b => b.id === 'b6' || b.symbol === '復');
    if (bReview && !bReview.unlocked && reviewedCount >= 10) {
      bReview.unlocked = true;
      isChanged = true;
    }

    return isChanged;
  }

  /**
   * 배지 및 경험치 UI 렌더링
   */
  function render() {
    if (!window.SeodangStorage) return;

    let data = window.SeodangStorage.loadAll() || {};

    // 자동 해금 검사
    if (checkAutoBadgeUnlocks(data)) {
      window.SeodangStorage.saveAll(data);
    }

    const badgesXP = data.badgesXP || {
      level: 7,
      title: '한글 탐험가',
      currentXP: 1240,
      nextLevelXP: 2000,
      badges: []
    };

    // 1. 상단 레벨 카드
    if (dom.levelTitle) {
      dom.levelTitle.textContent = `LEVEL ${badgesXP.level} ${badgesXP.title}`;
    }

    if (dom.xpRatioText) {
      dom.xpRatioText.textContent = `${badgesXP.currentXP.toLocaleString()} / ${badgesXP.nextLevelXP.toLocaleString()} XP`;
    }

    if (dom.xpBarFill) {
      const pct = Math.min(100, Math.round((badgesXP.currentXP / badgesXP.nextLevelXP) * 100));
      dom.xpBarFill.style.width = `${pct}%`;
    }

    // 2. 2x3 배지 그리드
    if (!dom.badgeGrid || !Array.isArray(badgesXP.badges)) return;
    dom.badgeGrid.innerHTML = '';

    badgesXP.badges.forEach(b => {
      const item = document.createElement('div');
      item.className = `badge-item ${b.unlocked ? 'unlocked' : 'locked'}`;
      item.innerHTML = `
        <div class="badge-circle">${b.symbol}</div>
        <strong class="badge-name">${b.name}</strong>
        <span class="badge-status">${b.unlocked ? '획득 완료' : '미획득 (자물쇠)'}</span>
      `;

      item.addEventListener('click', function () {
        openBadgeDetailModal(b);
      });

      dom.badgeGrid.appendChild(item);
    });
  }

  /**
   * 배지 상세 설명 모달 팝업
   */
  function openBadgeDetailModal(badge) {
    if (!dom.badgeModal) return;

    if (dom.modalSeal) {
      dom.modalSeal.textContent = badge.symbol;
      dom.modalSeal.className = `badge-modal-seal ${badge.unlocked ? 'unlocked' : 'locked'}`;
    }

    if (dom.modalName) {
      dom.modalName.textContent = `[${badge.symbol}] ${badge.name}`;
    }

    if (dom.modalDesc) {
      dom.modalDesc.textContent = badge.desc || '서당 훈장이 수여하는 명예로운 배지입니다.';
    }

    if (dom.modalCriteria) {
      const criteriaMap = {
        'b1': '고문서 사진을 촬영하여 AI 옛글 첫 번역 풀이를 완료하면 수여됩니다.',
        'b2': '서당에 7일 연속 출석하여 스트릭을 유지하면 수여됩니다.',
        'b3': '내 단어장에 20개 이상의 필수 고전 어휘를 수집하여 저장하면 수여됩니다.',
        'b4': '10초 타임어택 퀴즈 대전에서 가상 AI 학우에게 첫 승리를 거두면 수여됩니다.',
        'b5': '3D 플래시카드에서 50개 이상의 고전 어휘를 외우고 마스터하면 수여됩니다.',
        'b6': '오답노트에 기록된 오답 문제를 10문항 이상 다시 복습 완료하면 수여됩니다.'
      };
      dom.modalCriteria.textContent = criteriaMap[badge.id] || badge.desc;
    }

    if (dom.modalStatusTag) {
      if (badge.unlocked) {
        dom.modalStatusTag.className = 'badge-status-tag tag-unlocked';
        dom.modalStatusTag.textContent = '🏆 획득 완료';
      } else {
        dom.modalStatusTag.className = 'badge-status-tag tag-locked';
        dom.modalStatusTag.textContent = '🔒 도전 중 (미획득)';
      }
    }

    dom.badgeModal.style.display = 'flex';
  }

  function closeBadgeDetailModal() {
    if (dom.badgeModal) {
      dom.badgeModal.style.display = 'none';
    }
  }

  function bindEvents() {
    if (dom.modalCloseBtn) {
      dom.modalCloseBtn.addEventListener('click', closeBadgeDetailModal);
    }

    if (dom.badgeModal) {
      dom.badgeModal.addEventListener('click', function (e) {
        if (e.target === dom.badgeModal) {
          closeBadgeDetailModal();
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
    console.log('🏆 [애국 AI] 3-2단계: [36 배지·경험치] 모듈 초기화 완료');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AegukBadges = {
    render: render,
    openBadgeDetailModal: openBadgeDetailModal
  };

})(window, document);
