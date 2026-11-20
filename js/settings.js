/**
 * ========================================================
 * 애국 AI (서당 AI) - [37 환경설정 및 JSON 백업 인프라] 모듈
 * 파일: js/settings.js
 * 3-2단계: 프로필/목표 수정, 알림/난이도/글자크기/일일문제수 설정 & JSON 백업/복원
 * ========================================================
 */

(function (window, document) {
  'use strict';

  let dom = {
    // 계정 설정
    btnEditProfile: null,
    profileValText: null,
    btnEditGoal: null,
    goalValText: null,

    // 학습 설정
    alarmToggle: null,
    difficultySelect: null,
    fontBtns: null,
    dailyQuestionsSlider: null,
    dailyQuestionsValText: null,

    // 백업 및 관리
    btnExport: null,
    btnImport: null,
    inputImportFile: null,
    btnResetAll: null,

    // 프로필/목표 수정 모달
    profileModal: null,
    inputNickname: null,
    selectGrade: null,
    selectGoal: null,
    btnSaveProfileModal: null,
    btnCloseProfileModal: null
  };

  function cacheElements() {
    dom.btnEditProfile = document.getElementById('settingProfileBtn');
    dom.profileValText = document.getElementById('settingProfileVal');
    dom.btnEditGoal = document.getElementById('settingGoalBtn');
    dom.goalValText = document.getElementById('settingGoalVal');

    dom.alarmToggle = document.getElementById('settingAlarmToggle');
    dom.difficultySelect = document.getElementById('settingDifficultySelect');
    dom.fontBtns = document.querySelectorAll('.font-size-selector .font-btn');
    dom.dailyQuestionsSlider = document.getElementById('settingDailySlider');
    dom.dailyQuestionsValText = document.getElementById('settingDailyValText');

    dom.btnExport = document.getElementById('btnExportJSON');
    dom.btnImport = document.getElementById('btnImportJSON');
    dom.inputImportFile = document.getElementById('importJsonFileInput');
    dom.btnResetAll = document.getElementById('settingResetBtn');

    dom.profileModal = document.getElementById('profileEditModal');
    dom.inputNickname = document.getElementById('editModalNickname');
    dom.selectGrade = document.getElementById('editModalGrade');
    dom.selectGoal = document.getElementById('editModalGoal');
    dom.btnSaveProfileModal = document.getElementById('btnSaveProfileEdit');
    dom.btnCloseProfileModal = document.getElementById('btnCloseProfileEdit');
  }

  /**
   * 설정 UI 상태 렌더링
   */
  function render() {
    if (!window.SeodangStorage) return;

    const allData = window.SeodangStorage.loadAll() || {};
    const profile = allData.profile || {};
    const settings = allData.settings || {
      alarmEnabled: true,
      alarmTime: '20:00',
      difficulty: '보통',
      fontSize: '기본',
      dailyQuestions: 10
    };

    // 1. 프로필 & 목표
    if (dom.profileValText) {
      dom.profileValText.textContent = `${profile.nickname || '선비'} · ${profile.grade || '중학교 2학년'} ›`;
    }
    if (dom.goalValText) {
      dom.goalValText.textContent = `${profile.goal || '고전 독해 · 한자어'} ›`;
    }

    // 2. 알림 토글 스위치
    if (dom.alarmToggle) {
      dom.alarmToggle.classList.toggle('active', Boolean(settings.alarmEnabled));
    }

    // 3. 문제 난이도
    if (dom.difficultySelect) {
      dom.difficultySelect.value = settings.difficulty || '보통';
    }

    // 4. 글자 크기
    applyFontSize(settings.fontSize || '기본');
    if (dom.fontBtns) {
      dom.fontBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-size') === settings.fontSize);
      });
    }

    // 5. 일일 문제 수
    if (dom.dailyQuestionsSlider) {
      dom.dailyQuestionsSlider.value = settings.dailyQuestions || 10;
    }
    if (dom.dailyQuestionsValText) {
      dom.dailyQuestionsValText.textContent = `${settings.dailyQuestions || 10}문제`;
    }
  }

  /**
   * 글자 크기 스타일 동적 적용
   * @param {string} size - '작게' | '기본' | '크게'
   */
  function applyFontSize(size) {
    if (size === '작게') {
      document.body.style.fontSize = '13px';
    } else if (size === '크게') {
      document.body.style.fontSize = '15.5px';
    } else {
      document.body.style.fontSize = '14px';
    }
  }

  /**
   * 프로필/목표 수정 모달 열기
   */
  function openProfileEditModal() {
    if (!dom.profileModal || !window.SeodangStorage) return;

    const profile = window.SeodangStorage.get('profile') || {};
    if (dom.inputNickname) dom.inputNickname.value = profile.nickname || '선비';
    if (dom.selectGrade) dom.selectGrade.value = profile.grade || '중학교 2학년';
    if (dom.selectGoal) dom.selectGoal.value = profile.goal || '고전 독해 · 한자어';

    dom.profileModal.style.display = 'flex';
  }

  function closeProfileEditModal() {
    if (dom.profileModal) {
      dom.profileModal.style.display = 'none';
    }
  }

  function saveProfileEdit() {
    if (!window.SeodangStorage) return;

    const newNickname = (dom.inputNickname ? dom.inputNickname.value.trim() : '') || '선비';
    const newGrade = dom.selectGrade ? dom.selectGrade.value : '중학교 2학년';
    const newGoal = dom.selectGoal ? dom.selectGoal.value : '고전 독해 · 한자어';

    if (newNickname.length < 2 || newNickname.length > 8) {
      alert('닉네임은 2자 이상 8자 이내로 입력해 주세요.');
      return;
    }

    const allData = window.SeodangStorage.loadAll() || {};
    allData.profile = allData.profile || {};
    allData.profile.nickname = newNickname;
    allData.profile.grade = newGrade;
    allData.profile.goal = newGoal;

    window.SeodangStorage.saveAll(allData);

    if (window.AegukApp && window.AegukApp.showToast) {
      window.AegukApp.showToast('프로필 및 학습 목표가 성공적으로 변경되었습니다. ✨');
    }

    closeProfileEditModal();
    render();
  }

  function bindEvents() {
    // 1. 프로필 & 목표 수정 모달 트리거
    if (dom.btnEditProfile) {
      dom.btnEditProfile.addEventListener('click', openProfileEditModal);
    }
    if (dom.btnEditGoal) {
      dom.btnEditGoal.addEventListener('click', openProfileEditModal);
    }
    if (dom.btnSaveProfileModal) {
      dom.btnSaveProfileModal.addEventListener('click', saveProfileEdit);
    }
    if (dom.btnCloseProfileModal) {
      dom.btnCloseProfileModal.addEventListener('click', closeProfileEditModal);
    }

    // 2. 알림 토글
    if (dom.alarmToggle) {
      dom.alarmToggle.addEventListener('click', function () {
        const settings = window.SeodangStorage.get('settings') || {};
        settings.alarmEnabled = !settings.alarmEnabled;
        window.SeodangStorage.set('settings', settings);
        render();

        if (window.AegukApp && window.AegukApp.showToast) {
          window.AegukApp.showToast(`학습 알림이 ${settings.alarmEnabled ? '활성화' : '해제'}되었습니다.`);
        }
      });
    }

    // 3. 문제 난이도 변경
    if (dom.difficultySelect) {
      dom.difficultySelect.addEventListener('change', function (e) {
        const settings = window.SeodangStorage.get('settings') || {};
        settings.difficulty = e.target.value;
        window.SeodangStorage.set('settings', settings);

        if (window.AegukApp && window.AegukApp.showToast) {
          window.AegukApp.showToast(`문제 난이도가 [${settings.difficulty}]로 설정되었습니다.`);
        }
      });
    }

    // 4. 글자 크기 변경
    if (dom.fontBtns) {
      dom.fontBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          const selectedSize = this.getAttribute('data-size');
          const settings = window.SeodangStorage.get('settings') || {};
          settings.fontSize = selectedSize;
          window.SeodangStorage.set('settings', settings);
          render();

          if (window.AegukApp && window.AegukApp.showToast) {
            window.AegukApp.showToast(`글자 크기가 [${selectedSize}]로 적용되었습니다.`);
          }
        });
      });
    }

    // 5. 일일 문제수 슬라이더
    if (dom.dailyQuestionsSlider) {
      dom.dailyQuestionsSlider.addEventListener('input', function (e) {
        const count = parseInt(e.target.value, 10);
        if (dom.dailyQuestionsValText) {
          dom.dailyQuestionsValText.textContent = `${count}문제`;
        }
      });

      dom.dailyQuestionsSlider.addEventListener('change', function (e) {
        const count = parseInt(e.target.value, 10);
        const settings = window.SeodangStorage.get('settings') || {};
        settings.dailyQuestions = count;
        window.SeodangStorage.set('settings', settings);

        if (window.AegukApp && window.AegukApp.showToast) {
          window.AegukApp.showToast(`일일 학습 목표가 하루 [${count}문제]로 저장되었습니다.`);
        }
      });
    }

    // 6. JSON 백업 내보내기
    if (dom.btnExport) {
      dom.btnExport.addEventListener('click', function () {
        if (window.SeodangStorage) {
          window.SeodangStorage.exportJSON();
          if (window.AegukApp && window.AegukApp.showToast) {
            window.AegukApp.showToast('전체 서당 학습 데이터가 JSON 파일로 다운로드되었습니다. 📥');
          }
        }
      });
    }

    // 7. JSON 백업 가져오기
    if (dom.btnImport && dom.inputImportFile) {
      dom.btnImport.addEventListener('click', function () {
        dom.inputImportFile.click();
      });

      dom.inputImportFile.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();

          reader.onload = function (evt) {
            const success = window.SeodangStorage.importJSON(evt.target.result);
            if (success) {
              alert('🎉 서당 학습 데이터가 성공적으로 복원되었습니다.');
              window.location.reload();
            } else {
              alert('⚠️ 유효하지 않은 애국 AI 백업 파일입니다. JSON 형식을 확인해 주세요.');
            }
          };

          reader.onerror = function () {
            alert('파일을 읽어오는 도중 오류가 발생했습니다.');
          };

          reader.readAsText(file);
          e.target.value = '';
        }
      });
    }

    // 8. 데이터 완전 초기화
    if (dom.btnResetAll) {
      dom.btnResetAll.addEventListener('click', function () {
        if (confirm('⚠️ 모든 학습 기록, 단어장, 오답노트, 배지 및 설정을 초기화하고 첫 입학 화면으로 되돌리시겠습니까?')) {
          window.SeodangStorage.clearAll();
          alert('초기화가 완료되었습니다. 서당 입학 화면으로 이동합니다.');
          window.location.reload();
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
    console.log('⚙️ [애국 AI] 3-2단계: [37 환경설정 및 JSON 백업] 모듈 초기화 완료');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AegukSettings = {
    render: render,
    openProfileEditModal: openProfileEditModal
  };

})(window, document);
