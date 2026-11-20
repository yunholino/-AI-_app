/**
 * ========================================================
 * 애국 AI (서당 AI) - [33 내 단어장] 서브 모듈
 * 파일: js/my-vocab.js
 * 3-2단계: 실시간 키워드 검색, 카테고리 칩 필터링, 즐겨찾기(★) & 단어 삭제
 * ========================================================
 */

(function (window, document) {
  'use strict';

  let currentCategory = '전체';
  let searchKeyword = '';

  let dom = {
    container: null,
    searchInput: null,
    filterChips: null,
    countIndicator: null,
    listContainer: null
  };

  function cacheElements() {
    dom.container = document.getElementById('sub-vocab');
    if (!dom.container) return;

    dom.searchInput = dom.container.querySelector('.search-input');
    dom.filterChips = dom.container.querySelectorAll('.filter-chips-row .chip');
    dom.countIndicator = dom.container.querySelector('.vocab-count-indicator strong');
    dom.listContainer = dom.container.querySelector('.vocab-list');
  }

  /**
   * 단어장 리스트 실시간 필터 및 렌더링
   */
  function render() {
    if (!dom.listContainer || !window.SeodangStorage) return;

    let vocabList = window.SeodangStorage.get('myVocab') || [];

    // 카운트 인디케이터
    if (dom.countIndicator) {
      dom.countIndicator.textContent = vocabList.length;
    }

    // 1. 카테고리 필터
    if (currentCategory !== '전체') {
      vocabList = vocabList.filter(item => item.category === currentCategory);
    }

    // 2. 검색어 필터
    if (searchKeyword.trim() !== '') {
      const kw = searchKeyword.trim().toLowerCase();
      vocabList = vocabList.filter(item =>
        item.word.toLowerCase().includes(kw) ||
        (item.hanja && item.hanja.toLowerCase().includes(kw)) ||
        item.meaning.toLowerCase().includes(kw) ||
        (item.source && item.source.toLowerCase().includes(kw))
      );
    }

    dom.listContainer.innerHTML = '';

    if (vocabList.length === 0) {
      dom.listContainer.innerHTML = `
        <div class="empty-archive-box" style="padding: 30px 16px; text-align: center; color: var(--color-ink-light);">
          <span style="font-size: 28px; display: block; margin-bottom: 8px;">📖</span>
          <span>조건에 일치하는 단어가 없습니다.</span>
        </div>
      `;
      return;
    }

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
          <span class="vocab-source">출전: ${item.source || '고전문학'} · ${item.date || '최근'}</span>
        </div>
        <div class="vocab-action-col" style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <button type="button" class="fav-star-btn ${item.isFavorite ? 'active' : ''}" aria-label="즐겨찾기" title="${item.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}">
            ${item.isFavorite ? '★' : '☆'}
          </button>
          <button type="button" class="btn-del-vocab" aria-label="삭제" title="단어장에서 삭제" style="background: none; border: none; color: #bdbdbd; cursor: pointer; font-size: 13px;">
            🗑️
          </button>
        </div>
      `;

      // 즐겨찾기 토글
      const starBtn = card.querySelector('.fav-star-btn');
      starBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavorite(item.id);
      });

      // 단어 삭제
      const delBtn = card.querySelector('.btn-del-vocab');
      delBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (confirm(`'${item.word}' 단어를 내 단어장에서 삭제하시겠습니까?`)) {
          deleteWord(item.id);
        }
      });

      dom.listContainer.appendChild(card);
    });
  }

  function toggleFavorite(vocabId) {
    if (!window.SeodangStorage) return;
    const list = window.SeodangStorage.get('myVocab') || [];
    const target = list.find(v => v.id === vocabId);
    if (target) {
      target.isFavorite = !target.isFavorite;
      window.SeodangStorage.set('myVocab', list);
      render();
    }
  }

  function deleteWord(vocabId) {
    if (!window.SeodangStorage) return;
    let list = window.SeodangStorage.get('myVocab') || [];
    list = list.filter(v => v.id !== vocabId);
    window.SeodangStorage.set('myVocab', list);
    if (window.AegukApp && window.AegukApp.showToast) {
      window.AegukApp.showToast('단어가 단어장에서 삭제되었습니다.');
    }
    render();
  }

  function bindEvents() {
    if (dom.searchInput) {
      dom.searchInput.removeAttribute('readonly');
      dom.searchInput.addEventListener('input', function (e) {
        searchKeyword = e.target.value;
        render();
      });
    }

    if (dom.filterChips) {
      dom.filterChips.forEach(chip => {
        chip.addEventListener('click', function () {
          dom.filterChips.forEach(c => c.classList.remove('active'));
          this.classList.add('active');
          currentCategory = this.textContent.trim();
          render();
        });
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
    console.log('📖 [애국 AI] 3-2단계: [33 내 단어장] 모듈 초기화 완료');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AegukMyVocab = {
    render: render,
    toggleFavorite: toggleFavorite,
    deleteWord: deleteWord
  };

})(window, document);
