/**
 * ========================================================
 * 애국 AI (서당 AI) - 10초 타임어택 퀴즈 대전 & 게이미피케이션 엔진
 * 파일: js/quiz-engine.js
 * 3-1단계: 가상 AI 봇 대결, 10초 카운트다운 타이머, 오답노트 자동 적립 & XP/배지 해금
 * ========================================================
 */

(function (window, document) {
  'use strict';

  // 1게임당 출제 문항 수 및 제한 시간(초)
  const TOTAL_QUESTIONS_PER_GAME = 5;
  const TIME_LIMIT_SECONDS = 10;
  const XP_PER_CORRECT = 50;
  const XP_WIN_BONUS = 100;

  /**
   * 고전 국어 퀴즈 문제 은행 (24문항 풀)
   * 1. 고어 어휘 뜻 맞히기
   * 2. 원문 빈칸 완성
   * 3. 필수 사자성어
   */
  const QUIZ_QUESTION_BANK = [
    {
      id: 'q1',
      category: '옛말',
      source: '훈민정음 언해본',
      question: '훈민정음 서문의 "서르 ᄉᆞᄆᆞᆺ디 아니ᄒᆞᆯᄊᆡ"에서 밑줄 친 「ᄉᆞᄆᆞᆺ디」의 현대어 의미는?',
      choices: ['서로 닮지 아니하여', '서로 통하지 아니하므로', '서로 믿지 못하므로', '서로 사랑하지 아니하여'],
      answer: '서로 통하지 아니하므로',
      explanation: '「ᄉᆞᄆᆞᆺ다」는 \'서로 통하다\'라는 뜻의 고어로, 현대어 \'사무치다\'의 어원입니다.'
    },
    {
      id: 'q2',
      category: '옛말',
      source: '훈민정음 언해본',
      question: '"내 이ᄅᆞᆯ 위ᄒᆞ야 어엿비 너겨"에서 중세국어 「어엿비」의 의미로 가장 알맞은 것은?',
      choices: ['아름답고 예쁘게', '가엾고 불쌍하게', '기특하고 대견하게', '엄숙하고 공손하게'],
      answer: '가엾고 불쌍하게',
      explanation: '중세국어의 「어엿브다」는 \'불쌍하다\'는 뜻의 의미 이동 어휘입니다. (현대어: 예쁘다)'
    },
    {
      id: 'q3',
      category: '옛말',
      source: '훈민정음 언해본',
      question: '"어린 百姓이 니르고져 호ᇙ 배 이셔도"에서 「어린」의 당시 뜻은?',
      choices: ['나이가 적은', '지혜가 모자라고 어리석은', '몸집이 왜소한', '가난하고 힘없는'],
      answer: '지혜가 모자라고 어리석은',
      explanation: '중세국어의 「어리다」는 \'어리석다(Foolish)\'의 뜻이며, 나중에 \'나이가 적다\'로 의미가 이동했습니다.'
    },
    {
      id: 'q4',
      category: '옛말',
      source: '훈민정음 언해본',
      question: '"제 ᄠᅳ들 시러 펴디 못ᄒᆞᇙ 노미 하니라"에서 아래아가 없는 「하니라」의 뜻은?',
      choices: ['행동을 하니라', '많으니라', '크나크니라', '쉽지 아니하니라'],
      answer: '많으니라',
      explanation: '아래아가 없는 「하다」는 \'많다, 크다\'를 뜻하며, 아래아가 있는 「ᄒᆞ다」가 현대어의 \'행하다(Do)\'입니다.'
    },
    {
      id: 'q5',
      category: '옛말',
      source: '용비어천가',
      question: '"ᄇᆞᄅᆞ매 아니 뮐ᄊᆡ 곶 됴코 여름 하ᄂᆞ니"에서 「여름」의 고어 뜻은?',
      choices: ['더운 계절(夏)', '열매(結實)', '푸른 들판', '맑은 바람'],
      answer: '열매(結實)',
      explanation: '동사 \'열다(結)\'에 명사형 접미사 \'-음\'이 붙어 \'열매\'를 뜻합니다. 계절 여름은 \'녀름\'이었습니다.'
    },
    {
      id: 'q6',
      category: '옛말',
      source: '시조 및 가사',
      question: '고전문학에 자주 등장하는 고어 「괴다」의 의미로 옳은 것은?',
      choices: ['사랑하다, 귀여워하다', '괴롭히다, 학대하다', '의심하여 엿보다', '생각에 잠기다'],
      answer: '사랑하다, 귀여워하다',
      explanation: '「괴다」는 남녀 간의 지극한 사랑을 뜻하며, 명사형은 \'괴옴(사랑)\'입니다.'
    },
    {
      id: 'q7',
      category: '옛말',
      source: '고전시가',
      question: '고시조 "밤즁만 ᄒᆞᆫ ᄭᅮᆷ에 혜오미 ᄀᆞ이 업다"에서 「혜다」의 의미는?',
      choices: ['은혜를 베풀다', '생각하다, 헤아리다', '눈물을 흘리다', '한숨을 쉬다'],
      answer: '생각하다, 헤아리다',
      explanation: '「혜다」는 \'생각하다, 헤아리다\'의 뜻이며, 명사형은 \'혜옴\'입니다.'
    },
    {
      id: 'q8',
      category: '옛말',
      source: '훈민정음 언해본',
      question: '"ᄆᆞᄎᆞᆷ내 제 ᄠᅳ들 시러 펴디 못ᄒᆞᇙ"에서 부사 「시러」의 뜻은?',
      choices: ['싫증을 내며', '능히, 능숙하게', '수레에 실어', '반드시 기필코'],
      answer: '능히, 능숙하게',
      explanation: '「시러」는 \'능히, 족히 (Able to)\'의 뜻을 가진 고유어 부사입니다.'
    },
    {
      id: 'q9',
      category: '옛말',
      source: '용비어천가',
      question: '고어 「됴ᄒᆞ다」와 「조ᄒᆞ다」의 구별 중 「조ᄒᆞ다」의 올바른 현대어 풀이는?',
      choices: ['좋다 (Good)', '깨끗하다, 맑다 (Clean)', '조용하다 (Silent)', '부지런하다 (Diligent)'],
      answer: '깨끗하다, 맑다 (Clean)',
      explanation: '중세국어에서 \'됴ᄒᆞ다\'는 [좋다(Good)], \'조ᄒᆞ다\'는 [깨끗하다(Clean)]를 의미합니다.'
    },
    {
      id: 'q10',
      category: '옛말',
      source: '용비어천가',
      question: '"ᄇᆞᄅᆞ매 아니 뮐ᄊᆡ"에서 동사 「뮈다」의 뜻은?',
      choices: ['밀어붙이다', '미워하다', '흔들리다, 움직이다', '물러서다'],
      answer: '흔들리다, 움직이다',
      explanation: '「뮈다」는 \'움직이다, 흔들리다\'라는 뜻입니다. 원문은 \'바람에 흔들리지 아니하므로\'로 풀이합니다.'
    },
    {
      id: 'q11',
      category: '옛말',
      source: '관동별곡',
      question: '정철 〈관동별곡〉 "어와 聖셩恩은이야 가디록 罔망極극ᄒᆞ다"에서 「가디록」의 뜻은?',
      choices: ['갈수록 더욱더', '가지도록 풍족히', '가까이 다가와', '가소롭고 어이없게'],
      answer: '갈수록 더욱더',
      explanation: '「가디록」은 \'갈수록, 더욱더 (More and more)\'를 의미하는 고어 부사입니다.'
    },
    {
      id: 'q12',
      category: '옛말',
      source: '사미인곡',
      question: '"이 몸 삼기실 제 님을 조차 삼기시니"에서 「삼기다」의 의미는?',
      choices: ['삼키다', '섬기다', '태어나다, 생기다', '맹세하다'],
      answer: '태어나다, 생기다',
      explanation: '「삼기다」는 조물주에 의해 \'생겨나다, 태어나다\'를 뜻합니다.'
    },
    {
      id: 'q13',
      category: '사자성어',
      source: '필수 고사성어',
      question: '자연의 아름다운 경치를 몹시 사랑하여 마치 깊은 병처럼 굳어졌음을 뜻하는 성어는?',
      choices: ['맥수지탄 (麥秀之嘆)', '천석고황 (泉石膏肓)', '각골난망 (刻骨難忘)', '오매불망 (寤寐不忘)'],
      answer: '천석고황 (泉石膏肓)',
      explanation: '천석고황(泉石膏肓)과 연하고질(煙霞痼疾)은 자연을 지극히 사랑하는 마음의 병을 뜻합니다.'
    },
    {
      id: 'q14',
      category: '사자성어',
      source: '필수 고사성어',
      question: '남에게 입은 크나큰 은혜를 뼈에 깊이 새겨 결코 잊지 못함을 이르는 말은?',
      choices: ['각골난망 (刻骨難忘)', '풍수지탄 (風樹之嘆)', '함흥차사 (咸興差使)', '동상이몽 (同床異夢)'],
      answer: '각골난망 (刻骨難忘)',
      explanation: '각골난망(새길 각, 뼈 골, 어려울 난, 잊을 망)은 뼈에 새겨 은혜를 잊지 못한다는 뜻입니다.'
    },
    {
      id: 'q15',
      category: '사자성어',
      source: '필수 고사성어',
      question: '자나 깨나 잊지 못하고 오직 한 사람이나 일을 사모함을 뜻하는 사자성어는?',
      choices: ['오매불망 (寤寐不忘)', '맥수지탄 (麥秀之嘆)', '새옹지마 (塞翁之馬)', '감언이설 (甘言利說)'],
      answer: '오매불망 (寤寐不忘)',
      explanation: '오매불망(깰 오, 잘 매, 아니 불, 잊을 망)은 잠잘 때나 깨어 있을 때나 잊지 못함을 뜻합니다.'
    },
    {
      id: 'q16',
      category: '사자성어',
      source: '필수 고사성어',
      question: '고국의 멸망을 슬퍼하여 폐허가 된 옛 궁궐 터에 무성한 보리밭을 보며 한식함을 뜻하는 성어는?',
      choices: ['망양지탄 (望洋之嘆)', '맥수지탄 (麥秀之嘆)', '풍수지탄 (風樹之嘆)', '백년하청 (百年河淸)'],
      answer: '맥수지탄 (麥秀之嘆)',
      explanation: '맥수지탄(보리 맥, 빼어날 수, 갈 지, 탄식할 탄)은 나라의 멸망을 슬퍼하는 탄식입니다.'
    },
    {
      id: 'q17',
      category: '원문 빈칸',
      source: '훈민정음 언해본',
      question: '[빈칸 추론] "나랏말ᄊᆞ미 中國에 달아 文字와로 서르 [   ?   ] 아니ᄒᆞᆯᄊᆡ"',
      choices: ['ᄉᆞᄆᆞᆺ디', '어엿비', '어린', '하ᄂᆞ니'],
      answer: 'ᄉᆞᄆᆞᆺ디',
      explanation: '훈민정음 첫 머리로, 한자와 우리말이 서로 통하지 아니하므로의 「ᄉᆞᄆᆞᆺ디」가 정답입니다.'
    },
    {
      id: 'q18',
      category: '원문 빈칸',
      source: '용비어천가',
      question: '[빈칸 추론] "ᄇᆞᄅᆞ매 아니 뮐ᄊᆡ 곶 됴코 [   ?   ] 하ᄂᆞ니"',
      choices: ['여름', '겨울', '가디록', '됴ᄒᆞ다'],
      answer: '여름',
      explanation: '바람에 흔들리지 않으므로 꽃이 좋고 열매(여름)가 많다는 뜻입니다.'
    },
    {
      id: 'q19',
      category: '원문 빈칸',
      source: '관동별곡',
      question: '[빈칸 추론] "江강湖호애 病병이 깁퍼 [   ?   ]님의 누엇더니"',
      choices: ['竹듁林님', '延연秋츄門문', '慶경會회', '平평丘구驛역'],
      answer: '竹듁林님',
      explanation: '송강 정철이 창평에 은거하던 대나무 숲을 의미하는 「竹林(죽림)」이 정답입니다.'
    },
    {
      id: 'q20',
      category: '옛말',
      source: '훈민정음 언해본',
      question: '"이런 젼ᄎᆞ로 어린 百姓이 니르고져"에서 고어 「젼ᄎᆞ로」의 의미는?',
      choices: ['까닭으로, 이유로', '전체적으로', '순서대로 차례로', '신속하게 바삐'],
      answer: '까닭으로, 이유로',
      explanation: '「젼ᄎᆞ」는 까닭 또는 이유를 뜻하는 순우리말 명사입니다.'
    }
  ];

  /**
   * 퀴즈 엔진 내부 상태 객체
   */
  const gameState = {
    isRunning: false,
    currentQuestionIndex: 0,
    currentQuestions: [],
    userScore: 0,
    botScore: 0,
    timerInterval: null,
    timeRemaining: TIME_LIMIT_SECONDS,
    isWaitingNextQuestion: false,
    wrongQuestionsThisSession: [],
    botActionTimeout: null
  };

  /**
   * DOM 캐시
   */
  let dom = {
    tabGame: null,
    lobbyView: null,
    arenaView: null,
    btnStartBattle: null,

    // 배틀 헤더
    userScoreText: null,
    userScoreBar: null,
    botScoreText: null,
    botScoreBar: null,
    roundIndicator: null,
    userAvatarName: null,

    // 타이머
    timerBar: null,
    timerCountText: null,

    // 문제 및 선택지
    categoryBadge: null,
    sourceText: null,
    questionText: null,
    choicesContainer: null,
    feedbackAlert: null,

    // 결과 모달
    resultModal: null,
    resultTitle: null,
    resultSubtitle: null,
    userFinalScore: null,
    botFinalScore: null,
    resultXpBadge: null,
    wrongNoteNotice: null,
    badgeUnlockNotice: null,
    levelUpNotice: null,
    btnRestartGame: null,
    btnGoWrongNotes: null
  };

  /**
   * DOM 요소 캐싱
   */
  function cacheElements() {
    dom.tabGame = document.getElementById('tab-game');
    dom.lobbyView = document.getElementById('quizLobbyView');
    dom.arenaView = document.getElementById('quizArenaView');
    dom.btnStartBattle = document.getElementById('btnStartQuizBattle');

    dom.userScoreText = document.getElementById('quizUserScoreText');
    dom.userScoreBar = document.getElementById('quizUserScoreBar');
    dom.botScoreText = document.getElementById('quizBotScoreText');
    dom.botScoreBar = document.getElementById('quizBotScoreBar');
    dom.roundIndicator = document.getElementById('quizRoundIndicator');
    dom.userAvatarName = document.getElementById('quizUserAvatarName');

    dom.timerBar = document.getElementById('quizTimerBar');
    dom.timerCountText = document.getElementById('quizTimerCountText');

    dom.categoryBadge = document.getElementById('quizCategoryBadge');
    dom.sourceText = document.getElementById('quizSourceText');
    dom.questionText = document.getElementById('quizQuestionText');
    dom.choicesContainer = document.getElementById('quizChoicesGrid');
    dom.feedbackAlert = document.getElementById('quizFeedbackAlert');

    dom.resultModal = document.getElementById('quizResultModal');
    dom.resultTitle = document.getElementById('quizResultTitle');
    dom.resultSubtitle = document.getElementById('quizResultSubtitle');
    dom.userFinalScore = document.getElementById('quizResultUserScore');
    dom.botFinalScore = document.getElementById('quizResultBotScore');
    dom.resultXpBadge = document.getElementById('quizResultXpBadge');
    dom.wrongNoteNotice = document.getElementById('quizWrongNoteNotice');
    dom.badgeUnlockNotice = document.getElementById('quizBadgeUnlockNotice');
    dom.levelUpNotice = document.getElementById('quizLevelUpNotice');
    dom.btnRestartGame = document.getElementById('btnQuizRestart');
    dom.btnGoWrongNotes = document.getElementById('btnQuizGoWrongNotes');
  }

  /**
   * 배열 셔플 (Fisher-Yates 알고리즘)
   */
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * 신규 1게임(5문항) 준비 및 배틀 시작
   */
  function startBattle() {
    if (!window.SeodangStorage) return;

    // 문제 은행에서 5문항 랜덤 추출
    const shuffledBank = shuffleArray(QUIZ_QUESTION_BANK);
    gameState.currentQuestions = shuffledBank.slice(0, TOTAL_QUESTIONS_PER_GAME).map(q => {
      return {
        ...q,
        shuffledChoices: shuffleArray(q.choices)
      };
    });

    gameState.isRunning = true;
    gameState.currentQuestionIndex = 0;
    gameState.userScore = 0;
    gameState.botScore = 0;
    gameState.wrongQuestionsThisSession = [];
    gameState.isWaitingNextQuestion = false;

    // 프로필 닉네임 동기화
    const profile = window.SeodangStorage.get('profile') || {};
    if (dom.userAvatarName) {
      dom.userAvatarName.textContent = profile.nickname || '나(선비)';
    }

    // 뷰 전환: 로비 숨김 -> 아레나 표시
    if (dom.lobbyView) dom.lobbyView.style.display = 'none';
    if (dom.arenaView) dom.arenaView.style.display = 'block';
    if (dom.resultModal) dom.resultModal.style.display = 'none';

    updateScoreBoards();
    loadQuestion(0);

    console.log('⚔️ [애국 AI] 10초 타임어택 퀴즈 대전 시작!');
  }

  /**
   * 점수 현황 및 게이지 바 업데이트
   */
  function updateScoreBoards() {
    const maxScore = TOTAL_QUESTIONS_PER_GAME;
    const userPct = Math.round((gameState.userScore / maxScore) * 100);
    const botPct = Math.round((gameState.botScore / maxScore) * 100);

    if (dom.userScoreText) dom.userScoreText.textContent = `${gameState.userScore}점`;
    if (dom.userScoreBar) dom.userScoreBar.style.width = `${userPct}%`;

    if (dom.botScoreText) dom.botScoreText.textContent = `${gameState.botScore}점`;
    if (dom.botScoreBar) dom.botScoreBar.style.width = `${botPct}%`;
  }

  /**
   * 특정 문항 로드 & 10초 타이머 및 가상 AI 봇 작동
   */
  function loadQuestion(index) {
    if (index >= TOTAL_QUESTIONS_PER_GAME) {
      finishBattle();
      return;
    }

    gameState.currentQuestionIndex = index;
    gameState.isWaitingNextQuestion = false;
    const currentQ = gameState.currentQuestions[index];

    // 라운드 인디케이터
    if (dom.roundIndicator) {
      dom.roundIndicator.textContent = `제 ${index + 1} / ${TOTAL_QUESTIONS_PER_GAME} 문`;
    }

    // 카테고리, 출전, 문제 문구 바인딩
    if (dom.categoryBadge) dom.categoryBadge.textContent = currentQ.category;
    if (dom.sourceText) dom.sourceText.textContent = `[${currentQ.source}]`;
    if (dom.questionText) dom.questionText.textContent = currentQ.question;

    // 피드백 알림 영역 초기화
    if (dom.feedbackAlert) {
      dom.feedbackAlert.style.display = 'none';
      dom.feedbackAlert.className = 'quiz-feedback-alert';
      dom.feedbackAlert.textContent = '';
    }

    // 4지선다 버튼 생성
    if (dom.choicesContainer) {
      dom.choicesContainer.innerHTML = '';
      const symbols = ['①', '②', '③', '④'];

      currentQ.shuffledChoices.forEach((choiceText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-choice-btn';
        btn.innerHTML = `
          <span class="choice-num">${symbols[idx]}</span>
          <span class="choice-text">${choiceText}</span>
        `;

        btn.addEventListener('click', function () {
          if (gameState.isWaitingNextQuestion) return;
          handleUserAnswer(choiceText, btn, currentQ);
        });

        dom.choicesContainer.appendChild(btn);
      });
    }

    // AI 가상 봇 실시간 응답 스케줄링
    scheduleBotAnswer(currentQ);

    // 10초 카운트다운 타이머 시작
    startTimer(currentQ);
  }

  /**
   * AI 가상 봇 응답 시뮬레이션:
   * - 3.5초 ~ 8.0초 사이에 응답 시도
   * - 약 75%의 정답률
   */
  function scheduleBotAnswer(questionObj) {
    if (gameState.botActionTimeout) {
      clearTimeout(gameState.botActionTimeout);
    }

    // 3500ms ~ 7500ms 사이 랜덤 시점
    const botAnswerDelay = Math.floor(Math.random() * 4000) + 3500;

    gameState.botActionTimeout = setTimeout(() => {
      if (!gameState.isRunning) return;

      // 75% 확률로 정답 선택
      const isBotCorrect = Math.random() < 0.75;
      if (isBotCorrect) {
        gameState.botScore++;
        updateScoreBoards();
      }
    }, botAnswerDelay);
  }

  /**
   * 10초 타임어택 카운트다운 타이머
   */
  function startTimer(questionObj) {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
    }

    gameState.timeRemaining = TIME_LIMIT_SECONDS;
    updateTimerUI();

    const intervalStepMs = 100; // 0.1초 단위 갱신

    gameState.timerInterval = setInterval(() => {
      gameState.timeRemaining -= intervalStepMs / 1000;

      if (gameState.timeRemaining <= 0) {
        gameState.timeRemaining = 0;
        updateTimerUI();
        clearInterval(gameState.timerInterval);
        handleTimeOut(questionObj);
      } else {
        updateTimerUI();
      }
    }, intervalStepMs);
  }

  /**
   * 타이머 게이지 바 및 카운트 텍스트 갱신
   */
  function updateTimerUI() {
    const pct = Math.max(0, Math.min(100, (gameState.timeRemaining / TIME_LIMIT_SECONDS) * 100));

    if (dom.timerBar) {
      dom.timerBar.style.width = `${pct}%`;
      // 남은 시간에 따른 색상 변화 (10초~5초: 초록, 5초~2.5초: 주황, 2.5초 이하: 빨강)
      if (gameState.timeRemaining <= 2.5) {
        dom.timerBar.style.backgroundColor = 'var(--color-seal)';
      } else if (gameState.timeRemaining <= 5) {
        dom.timerBar.style.backgroundColor = '#f57c00';
      } else {
        dom.timerBar.style.backgroundColor = 'var(--color-dark-green)';
      }
    }

    if (dom.timerCountText) {
      dom.timerCountText.textContent = `${gameState.timeRemaining.toFixed(1)}초`;
    }
  }

  /**
   * 유저의 선택지 클릭 처리
   */
  function handleUserAnswer(userChoice, selectedBtn, questionObj) {
    gameState.isWaitingNextQuestion = true;
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);

    const isCorrect = (userChoice === questionObj.answer);
    const choiceButtons = dom.choicesContainer.querySelectorAll('.quiz-choice-btn');

    // 모든 버튼 비활성화 및 스타일 적용
    choiceButtons.forEach(btn => {
      btn.disabled = true;
      const text = btn.querySelector('.choice-text').textContent;
      if (text === questionObj.answer) {
        btn.classList.add('correct');
      }
    });

    if (isCorrect) {
      selectedBtn.classList.add('correct');
      gameState.userScore++;
      updateScoreBoards();
      showFeedback(true, '🎉 정답입니다! (+50 XP)');
    } else {
      selectedBtn.classList.add('wrong');
      showFeedback(false, `❌ 오답! 정답: ${questionObj.answer}`);
      recordWrongNote(questionObj, userChoice);
    }

    // 1.5초 후 다음 문제로 자동 진행
    setTimeout(() => {
      loadQuestion(gameState.currentQuestionIndex + 1);
    }, 1500);
  }

  /**
   * 10초 제한시간 초과 처리
   */
  function handleTimeOut(questionObj) {
    if (gameState.isWaitingNextQuestion) return;
    gameState.isWaitingNextQuestion = true;

    // 정답 버튼 하이라이트
    const choiceButtons = dom.choicesContainer.querySelectorAll('.quiz-choice-btn');
    choiceButtons.forEach(btn => {
      btn.disabled = true;
      const text = btn.querySelector('.choice-text').textContent;
      if (text === questionObj.answer) {
        btn.classList.add('correct');
      }
    });

    showFeedback(false, `⏰ 10초 시간 초과! 정답: ${questionObj.answer}`);
    recordWrongNote(questionObj, '10초 시간 초과 (미응답)');

    setTimeout(() => {
      loadQuestion(gameState.currentQuestionIndex + 1);
    }, 1600);
  }

  /**
   * 피드백 배너 출력
   */
  function showFeedback(isCorrect, message) {
    if (!dom.feedbackAlert) return;
    dom.feedbackAlert.textContent = message;
    dom.feedbackAlert.className = `quiz-feedback-alert ${isCorrect ? 'correct' : 'wrong'}`;
    dom.feedbackAlert.style.display = 'block';
  }

  /**
   * 오답노트 자동 적립 파이프라인 (MY [34 오답노트] 연동)
   * { id, question, userChoice, answer, isReviewed: false, date }
   */
  function recordWrongNote(questionObj, userChoice) {
    if (!window.SeodangStorage) return;

    const wrongList = window.SeodangStorage.get('wrongNotes') || [];

    const newWrongEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      question: questionObj.question,
      userChoice: userChoice,
      answer: questionObj.answer,
      isReviewed: false,
      date: new Date().toISOString().slice(0, 10)
    };

    // 최근 오답이 맨 위로 오도록 unshift
    wrongList.unshift(newWrongEntry);
    window.SeodangStorage.set('wrongNotes', wrongList);

    // 이번 세션 오답 리스트 기록
    gameState.wrongQuestionsThisSession.push(newWrongEntry);

    console.log(`📝 [애국 AI] 오답노트 자동 적립 완료: '${questionObj.question}' (선택: ${userChoice})`);
  }

  /**
   * 퀴즈 종료 및 경험치/배지/통계 영속화 처리
   */
  function finishBattle() {
    gameState.isRunning = false;
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    if (gameState.botActionTimeout) clearTimeout(gameState.botActionTimeout);

    const userScore = gameState.userScore;
    const botScore = gameState.botScore;
    const isWin = userScore > botScore;
    const isDraw = userScore === botScore;

    // 1. 경험치(XP) 계산: 정답수 * 50 XP + 승리 보너스 100 XP
    let earnedXP = userScore * XP_PER_CORRECT;
    if (isWin) {
      earnedXP += XP_WIN_BONUS;
    }

    // 2. LocalStorage 데이터 업데이트 (badgesXP, stats, profile)
    let isLevelUp = false;
    let unlockedNewBadge = null;

    if (window.SeodangStorage) {
      const storageData = window.SeodangStorage.loadAll() || {};

      // 2-1. 경험치 가산 및 레벨업 체크
      const badgesXP = storageData.badgesXP || {
        level: 7,
        title: '한글 탐험가',
        currentXP: 1240,
        nextLevelXP: 2000,
        badges: []
      };

      badgesXP.currentXP += earnedXP;

      // 2,000 XP 도달 시 레벨업 (LEVEL 7 -> LEVEL 8)
      if (badgesXP.currentXP >= badgesXP.nextLevelXP) {
        badgesXP.level += 1;
        badgesXP.currentXP = badgesXP.currentXP - badgesXP.nextLevelXP;
        badgesXP.nextLevelXP += 1000;
        if (badgesXP.level === 8) {
          badgesXP.title = '서당 훈장';
        }
        isLevelUp = true;
      }

      // 2-2. 배지 해금 검사:
      // - 첫 승리 시 [王] (게임 왕) 배지 해금
      // - 7일 연속 출석 시 [七] (7일 연속) 배지 해금
      if (Array.isArray(badgesXP.badges)) {
        // [王] 배지
        if (isWin) {
          const kingBadge = badgesXP.badges.find(b => b.id === 'b4' || b.symbol === '王');
          if (kingBadge && !kingBadge.unlocked) {
            kingBadge.unlocked = true;
            unlockedNewBadge = kingBadge;
          }
        }

        // [七] 배지 (스트릭 7일 이상)
        const currentStreak = (storageData.profile && storageData.profile.streak) || 1;
        if (currentStreak >= 7) {
          const sevenBadge = badgesXP.badges.find(b => b.id === 'b2' || b.symbol === '七');
          if (sevenBadge && !sevenBadge.unlocked) {
            sevenBadge.unlocked = true;
          }
        }
      }

      storageData.badgesXP = badgesXP;

      // 2-3. 정답률 및 통계 갱신
      if (storageData.stats) {
        // 기존 통계 기반 누적 정답률 시뮬레이션
        const pastCorrect = Math.round((storageData.stats.totalAccuracy || 80) * 0.5); // 가중치
        const newCorrect = pastCorrect + userScore;
        const totalSample = 50 + TOTAL_QUESTIONS_PER_GAME;
        storageData.stats.totalAccuracy = Math.min(100, Math.max(0, Math.round((newCorrect / totalSample) * 100)));
      }

      // 2-4. 퀴즈 전적 기록 추가
      if (!Array.isArray(storageData.quizRecords)) {
        storageData.quizRecords = [];
      }
      storageData.quizRecords.unshift({
        date: new Date().toISOString().slice(0, 10),
        userScore: userScore,
        botScore: botScore,
        result: isWin ? 'WIN' : (isDraw ? 'DRAW' : 'LOSE'),
        earnedXP: earnedXP
      });

      window.SeodangStorage.saveAll(storageData);
    }

    // 3. 결과 모달 UI 렌더링
    renderResultModal({
      userScore,
      botScore,
      isWin,
      isDraw,
      earnedXP,
      isLevelUp,
      unlockedNewBadge,
      wrongCount: gameState.wrongQuestionsThisSession.length
    });
  }

  /**
   * 결과 모달 표시 및 안내 바인딩
   */
  function renderResultModal(result) {
    if (!dom.resultModal) return;

    // 승패 텍스트 및 스타일
    if (result.isWin) {
      if (dom.resultTitle) dom.resultTitle.textContent = '🎉 쾌도난마 대승리! (大勝利)';
      if (dom.resultSubtitle) dom.resultSubtitle.textContent = '가상 서당 학우와의 10초 타임어택 대결에서 멋지게 승리하셨습니다!';
    } else if (result.isDraw) {
      if (dom.resultTitle) dom.resultTitle.textContent = '🤝 막상막하 무승부! (無勝負)';
      if (dom.resultSubtitle) dom.resultSubtitle.textContent = '치열한 접전 끝에 가상 학우와 호각을 이루었습니다.';
    } else {
      if (dom.resultTitle) dom.resultTitle.textContent = '📖 절치부심 다음 기회에! (惜敗)';
      if (dom.resultSubtitle) dom.resultSubtitle.textContent = '가상 학우의 실력이 만만치 않았습니다. 오답을 복습해 보세요!';
    }

    if (dom.userFinalScore) dom.userFinalScore.textContent = `${result.userScore}점`;
    if (dom.botFinalScore) dom.botFinalScore.textContent = `${result.botScore}점`;
    if (dom.resultXpBadge) dom.resultXpBadge.textContent = `+${result.earnedXP} XP 획득!`;

    // 오답노트 안내
    if (dom.wrongNoteNotice) {
      if (result.wrongCount > 0) {
        dom.wrongNoteNotice.textContent = `📝 오답노트에 ${result.wrongCount}문제가 자동으로 추가되었습니다.`;
        dom.wrongNoteNotice.style.display = 'block';
      } else {
        dom.wrongNoteNotice.textContent = '✨ 만점 달성! 오답노트에 추가된 문제가 없습니다.';
        dom.wrongNoteNotice.style.display = 'block';
      }
    }

    // 레벨업 안내
    if (dom.levelUpNotice) {
      if (result.isLevelUp) {
        dom.levelUpNotice.textContent = '🎊 축하합니다! LEVEL 8 [서당 훈장]으로 승급하셨습니다!';
        dom.levelUpNotice.style.display = 'block';
      } else {
        dom.levelUpNotice.style.display = 'none';
      }
    }

    // 배지 해금 안내
    if (dom.badgeUnlockNotice) {
      if (result.unlockedNewBadge) {
        dom.badgeUnlockNotice.textContent = `🏆 신규 배지 [${result.unlockedNewBadge.symbol}] '${result.unlockedNewBadge.name}' 획득!`;
        dom.badgeUnlockNotice.style.display = 'block';
      } else {
        dom.badgeUnlockNotice.style.display = 'none';
      }
    }

    dom.resultModal.style.display = 'flex';
  }

  /**
   * 이벤트 바인딩
   */
  function bindEvents() {
    if (dom.btnStartBattle) {
      dom.btnStartBattle.addEventListener('click', startBattle);
    }

    // 결과 모달: 다시 도전하기
    if (dom.btnRestartGame) {
      dom.btnRestartGame.addEventListener('click', () => {
        if (dom.resultModal) dom.resultModal.style.display = 'none';
        startBattle();
      });
    }

    // 결과 모달: 오답노트 보러가기
    if (dom.btnGoWrongNotes) {
      dom.btnGoWrongNotes.addEventListener('click', () => {
        if (dom.resultModal) dom.resultModal.style.display = 'none';
        if (dom.arenaView) dom.arenaView.style.display = 'none';
        if (dom.lobbyView) dom.lobbyView.style.display = 'block';

        if (window.AegukApp && window.AegukApp.switchMainTab && window.AegukApp.switchMySubView) {
          window.AegukApp.switchMainTab('tab-my');
          window.AegukApp.switchMySubView('sub-wrong');
        }
      });
    }
  }

  /**
   * 엔진 초기화
   */
  function initQuizEngine() {
    cacheElements();
    bindEvents();
    console.log('⚔️ 애국 AI 3-1단계: 10초 타임어택 퀴즈 대전 엔진 준비 완료');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuizEngine);
  } else {
    initQuizEngine();
  }

  // 전역 공개 API
  window.AegukQuizEngine = {
    startBattle: startBattle,
    getQuestionsBank: function () {
      return QUIZ_QUESTION_BANK;
    }
  };

})(window, document);
