/**
 * ========================================================
 * 애국 AI (서당 AI) - 카메라 및 이미지 미디어 제어 모듈
 * 파일: js/camera.js
 * 2-1단계: 웹캠 실시간 캡처, 캔버스 스냅샷 & 파일 업로드 프리뷰
 * ========================================================
 */

(function (window, document) {
  'use strict';

  // 현재 활성화된 MediaStream 인스턴스
  let activeStream = null;

  // 현재 캡처 또는 업로드된 이미지 DataURL (2-2단계 AI 서비스 연동용)
  let currentImageDataUrl = null;

  // DOM 캐시 객체
  let dom = {
    viewfinderContainer: null,
    video: null,
    canvas: null,
    previewImg: null,
    scanOverlay: null,
    fallbackBox: null,
    fallbackMsg: null,
    fileInput: null,

    // 버튼 그룹
    btnStartStream: null,
    btnCaptureShutter: null,
    btnUploadFile: null,
    btnRetake: null,
    btnSolveAI: null,

    controlsPreCapture: null,
    controlsPostCapture: null
  };

  /**
   * DOM 요소 캐싱
   */
  function cacheElements() {
    dom.viewfinderContainer = document.getElementById('cameraViewfinder');
    dom.video = document.getElementById('cameraVideo');
    dom.canvas = document.getElementById('captureCanvas');
    dom.previewImg = document.getElementById('previewImage');
    dom.scanOverlay = document.getElementById('cameraScanOverlay');
    dom.fallbackBox = document.getElementById('cameraFallbackBox');
    dom.fallbackMsg = document.getElementById('cameraFallbackMsg');
    dom.fileInput = document.getElementById('cameraFileInput');

    dom.btnStartStream = document.getElementById('btnStartCameraStream');
    dom.btnCaptureShutter = document.getElementById('btnCaptureShutter');
    dom.btnUploadFile = document.getElementById('btnUploadFile');
    dom.btnRetake = document.getElementById('btnRetake');
    dom.btnSolveAI = document.getElementById('btnSolveAI');

    dom.controlsPreCapture = document.getElementById('controlsPreCapture');
    dom.controlsPostCapture = document.getElementById('controlsPostCapture');
  }

  /**
   * 웹캠 카메라 스트림 시작
   */
  async function startCamera() {
    // 이미 스트림이 활성화되어 있는 경우
    if (activeStream && activeStream.active) {
      showLiveVideo();
      return true;
    }

    // 브라우저 MediaDevices API 지원 여부 확인
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showFallback('현재 브라우저 환경에서는 실시간 카메라 스트림이 지원되지 않습니다. 아래 [사진 파일 올리기]를 통해 고문서 이미지를 분석해 보세요.');
      return false;
    }

    // 모바일 후면 카메라 우선, 실패 시 기본 카메라 Fallback
    const constraintsList = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: true, audio: false }
    ];

    let stream = null;
    let lastError = null;

    for (const constraints of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!stream) {
      console.warn('[AegukCamera] 카메라 권한 획득 실패:', lastError);
      let errorMsg = '카메라 접근이 거부되었거나 장치를 찾을 수 없습니다. 카메라 권한을 허용하시거나, [사진 파일 올리기]로 진행해 주세요.';
      if (lastError && lastError.name === 'NotAllowedError') {
        errorMsg = '카메라 사용 권한이 차단되어 있습니다. 브라우저 주소창의 자물쇠/권한 아이콘을 눌러 카메라를 허용해 주시거나 파일 업로드를 이용해 주세요.';
      }
      showFallback(errorMsg);
      return false;
    }

    activeStream = stream;
    if (dom.video) {
      dom.video.srcObject = stream;
      try {
        await dom.video.play();
      } catch (e) {
        console.warn('[AegukCamera] 비디오 자동 재생 지연:', e);
      }
    }

    showLiveVideo();
    console.log('📷 [애국 AI] 실시간 웹캠 뷰파인더 연결 성공');
    return true;
  }

  /**
   * 웹캠 스트림 중지 (리소스 해제)
   */
  function stopCamera() {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }
    if (dom.video) {
      dom.video.srcObject = null;
    }
  }

  /**
   * 실시간 비디오 라이브 모드 화면 렌더링
   */
  function showLiveVideo() {
    if (dom.video) dom.video.style.display = 'block';
    if (dom.previewImg) dom.previewImg.style.display = 'none';
    if (dom.canvas) dom.canvas.style.display = 'none';
    if (dom.scanOverlay) dom.scanOverlay.style.display = 'block';
    if (dom.fallbackBox) dom.fallbackBox.style.display = 'none';

    // 컨트롤 버튼 전환: 촬영 전 모드 활성화
    if (dom.controlsPreCapture) dom.controlsPreCapture.style.display = 'grid';
    if (dom.controlsPostCapture) dom.controlsPostCapture.style.display = 'none';

    if (dom.btnCaptureShutter) {
      dom.btnCaptureShutter.disabled = false;
    }
    currentImageDataUrl = null;
  }

  /**
   * 정적 이미지 미리보기 모드 (촬영 또는 업로드 후)
   * @param {string} dataUrl 
   */
  function showPreview(dataUrl) {
    currentImageDataUrl = dataUrl;

    // 비디오 일시 숨김
    if (dom.video) dom.video.style.display = 'none';
    if (dom.scanOverlay) dom.scanOverlay.style.display = 'none';
    if (dom.fallbackBox) dom.fallbackBox.style.display = 'none';

    // 프리뷰 이미지 렌더링
    if (dom.previewImg) {
      dom.previewImg.src = dataUrl;
      dom.previewImg.style.display = 'block';
    }

    // 컨트롤 버튼 전환: 촬영 후 액션 모드 활성화
    if (dom.controlsPreCapture) dom.controlsPreCapture.style.display = 'none';
    if (dom.controlsPostCapture) dom.controlsPostCapture.style.display = 'grid';

    // 카메라 스트림 일시 정지 (배터리 및 CPU 절약)
    stopCamera();
    console.log('✨ [애국 AI] 옛글 이미지 캡처/업로드 완료 (미리보기 모드 전환)');
  }

  /**
   * 카메라 에러/미지원 시 대체 화면
   * @param {string} message 
   */
  function showFallback(message) {
    if (dom.video) dom.video.style.display = 'none';
    if (dom.previewImg) dom.previewImg.style.display = 'none';
    if (dom.scanOverlay) dom.scanOverlay.style.display = 'none';
    if (dom.fallbackBox) dom.fallbackBox.style.display = 'flex';
    if (dom.fallbackMsg) dom.fallbackMsg.textContent = message;

    if (dom.controlsPreCapture) dom.controlsPreCapture.style.display = 'grid';
    if (dom.controlsPostCapture) dom.controlsPostCapture.style.display = 'none';
    if (dom.btnCaptureShutter) dom.btnCaptureShutter.disabled = true;
  }

  /**
   * 실시간 비디오 프레임 스냅샷 캡처
   */
  function capturePhoto() {
    if (!dom.video || !dom.canvas) return;

    const videoWidth = dom.video.videoWidth || 640;
    const videoHeight = dom.video.videoHeight || 480;

    dom.canvas.width = videoWidth;
    dom.canvas.height = videoHeight;

    const ctx = dom.canvas.getContext('2d');
    ctx.drawImage(dom.video, 0, 0, videoWidth, videoHeight);

    try {
      const dataUrl = dom.canvas.toDataURL('image/jpeg', 0.92);
      showPreview(dataUrl);
    } catch (err) {
      console.error('[AegukCamera] 캔버스 이미지 추출 실패:', err);
    }
  }

  /**
   * 로컬 이미지 파일 선택 업로드 핸들러
   * @param {File} file 
   */
  function handleFileSelected(file) {
    if (!file) return;

    // 이미지 파일 형식 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(jpg, png 등)만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      showPreview(dataUrl);
    };
    reader.onerror = function (err) {
      console.error('[AegukCamera] 파일 읽기 실패:', err);
      alert('이미지 파일을 읽어오는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
  }

  /**
   * 다시 찍기 (재촬영 초기화)
   */
  function retakePhoto() {
    currentImageDataUrl = null;
    startCamera();
  }

  /**
   * 이벤트 리스너 바인딩
   */
  function bindEvents() {
    // 1. 찰칵 촬영 셔터 버튼
    if (dom.btnCaptureShutter) {
      dom.btnCaptureShutter.addEventListener('click', capturePhoto);
    }

    // 2. 사진 파일 선택 버튼 -> 숨겨진 file input 트리거
    if (dom.btnUploadFile && dom.fileInput) {
      dom.btnUploadFile.addEventListener('click', function () {
        dom.fileInput.click();
      });

      dom.fileInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          handleFileSelected(e.target.files[0]);
          // 동일 파일 재선택 가능하도록 리셋
          e.target.value = '';
        }
      });
    }

    // 3. 다시 찍기 버튼
    if (dom.btnRetake) {
      dom.btnRetake.addEventListener('click', retakePhoto);
    }

    // 4. 다시 연결 시도 버튼
    if (dom.btnStartStream) {
      dom.btnStartStream.addEventListener('click', startCamera);
    }

    // 5. [AI 옛글 풀이하기] 버튼 클릭 (2-2단계 파이프라인 트리거 준비)
    if (dom.btnSolveAI) {
      dom.btnSolveAI.addEventListener('click', function () {
        if (!currentImageDataUrl) {
          alert('먼저 옛글 사진을 촬영하거나 선택해 주세요.');
          return;
        }
        // 2-2단계 AI 풀이 엔진으로 이벤트 디스패치
        window.dispatchEvent(new CustomEvent('requestAITranslation', {
          detail: { imageDataUrl: currentImageDataUrl }
        }));
      });
    }
  }

  /**
   * 카메라 모듈 초기화
   */
  function initCamera() {
    cacheElements();
    bindEvents();
    console.log('📷 애국 AI 2-1단계: 카메라 및 미디어 인터페이스 모듈 준비 완료');
  }

  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCamera);
  } else {
    initCamera();
  }

  // 전역 공개 API
  window.AegukCamera = {
    startCamera: startCamera,
    stopCamera: stopCamera,
    capturePhoto: capturePhoto,
    retakePhoto: retakePhoto,
    showPreview: showPreview,
    getCurrentImage: function () {
      return currentImageDataUrl;
    }
  };

})(window, document);
