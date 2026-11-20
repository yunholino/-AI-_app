/**
 * ========================================================
 * 애국 AI (서당 AI) - AI 옛글 풀이 서비스 엔진
 * 파일: js/ai-service.js
 * 2-2단계: 고전문학 Mock 분석 파이프라인 & 형태소 어휘 매핑 데이터
 * ========================================================
 */

(function (window) {
  'use strict';

  /**
   * 고전문학 AI Mock 분석 데이터셋 (3종)
   * 1. 훈민정음 언해본 서문
   * 2. 정철 〈관동별곡〉
   * 3. 〈용비어천가〉 제2장
   */
  const MOCK_AI_DATABASE = [
    {
      id: 'mock-hunmin',
      title: '훈민정음 언해본 서문 (訓民正音 諺解本)',
      author: '세종대왕 (世宗大王)',
      era: '조선 전기 (1446년)',
      // 고어 원문
      originalText: '나랏말ᄊᆞ미 中國에 달아 文字와로 서르 ᄉᆞᄆᆞᆺ디 아니ᄒᆞᆯᄊᆡ, 이런 젼ᄎᆞ로 어린 百姓이 니르고져 호ᇙ 배 이셔도 ᄆᆞᄎᆞᆷ내 제 ᄠᅳ들 시러 펴디 못ᄒᆞᇙ 노미 하니라. 내 이ᄅᆞᆯ 위ᄒᆞ야 어엿비 너겨 새로 스믈여듧 字ᄅᆞᆯ ᄆᆡᆼᄀᆞ노니 사람마다 ᄒᆡᅇᅧ 수ᄫᅵ 니겨 날로 ᄡᅮ메 뼤디 ᄒᆞ고져 ᄒᆞᇙ ᄯᆞᄅᆞ미니라.',
      // 현대어 1:1 대역 풀이
      modernText: '우리나라의 말이 중국과 달라 한자와는 서로 통하지 아니하므로, 이런 까닭에 어리석은 백성이 말하고자 하는 바가 있어도 마침내 제 뜻을 능히 펴지 못하는 사람이 많으니라. 내가 이를 가엾게 여겨 새로 스물여덟 자를 만드니, 모든 사람들로 하여금 쉽게 익혀 날마다 씀에 편안하게 하고자 할 따름이니라.',
      // 형태소 단위 주요 어휘 매핑
      morphemes: [
        {
          word: 'ᄉᆞᄆᆞᆺ디',
          hanja: '',
          meaning: '서로 통하다, 사무치다',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '동사 "ᄉᆞᄆᆞᆺ다"(통하다) + 연결어미 "-디"(부정)'
        },
        {
          word: '젼ᄎᆞ로',
          hanja: '',
          meaning: '까닭으로, 이유로',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '옛명사 "젼ᄎᆞ"(까닭) + 조사 "로"'
        },
        {
          word: '어린',
          hanja: '',
          meaning: '어리석은 (Foolish)',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '형용사 "어리다"(어리석다)의 관형사형. 현대어(나이가 적다)와 의미 변화'
        },
        {
          word: '니르고져',
          hanja: '',
          meaning: '말하고자, 표현하고자',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '동사 "니ᄅᆞ다"(이르다, 말하다) + 의도 연결어미 "-고자"'
        },
        {
          word: 'ᄠᅳ들',
          hanja: '',
          meaning: '뜻을, 생각을',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '어두자음군 ᄠ + 목적격 조사 "-을"'
        },
        {
          word: '시러',
          hanja: '',
          meaning: '능히, 쉽게 (Able to)',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '부사 "시러"(능히, 실어)'
        },
        {
          word: '노미',
          hanja: '',
          meaning: '사람이 (일반적인 사람)',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '"놈"(사람, 보통명사) + 주격조사 "-이". 의미 축소(비하) 이전 형태'
        },
        {
          word: '하니라',
          hanja: '',
          meaning: '많으니라 (Many)',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '형용사 "하다"(많다) + 종결어미. "ᄒᆞ다"(Do)와 구별 필수'
        },
        {
          word: '어엿비',
          hanja: '',
          meaning: '가엾게, 불쌍히 (Pitiful)',
          source: '훈민정음 언해본',
          category: '옛말',
          grammar: '형용사 "어엿브다"(가엽다)의 부사형. 현대어(예쁘다)와 의미 변화'
        }
      ],
      commentary: '세종대왕이 1443년에 창제하고 1446년에 반포한 훈민정음의 창제 취지를 밝힌 글입니다. 자주정신(自主), 애민정신(愛民), 실용정신(實用)이 온전히 녹아있는 불후의 명문입니다.'
    },
    {
      id: 'mock-gwandong',
      title: '관동별곡 (關東別曲) - 서사 부임 여정',
      author: '정철 (鄭澈)',
      era: '조선 중기 선조 13년 (1580년)',
      originalText: '江강湖호애 病병이 깁퍼 竹듁林님의 누엇더니, 關관東동 八팔百ᄇᆡᆨ里리의 方방面면을 맛디시니, 어와 聖셩恩은이야 가디록 罔망極극ᄒᆞ다. 延연秋츄門문 드리ᄃᆞ라 慶경會회 南남門문 ᄇᆞ라보며, 下하直직고 물너나니 玉옥節졀이 알ᄑᆡ 셧다.',
      modernText: '자연을 사랑하는 깊은 병(연하고질)이 들어 담양 창평에 은거하고 있었더니, 임금께서 강원도 팔백 리의 관찰사 직분을 맡겨 주시니, 아아 성은이야말로 갈수록 끝이 없구나. 경복궁 연추문으로 달려 들어가 경회루 남문을 바라보며 하직 인사를 드리고 물러나니, 관찰사의 상징인 옥절이 앞에 서 있구나.',
      morphemes: [
        {
          word: '江강湖호애',
          hanja: '江湖',
          meaning: '자연에, 강과 호수에',
          source: '관동별곡',
          category: '한자어',
          grammar: '대유법 (강과 호수로 자연 전체를 비유함)'
        },
        {
          word: '病병이 깁퍼',
          hanja: '病',
          meaning: '자연을 사랑하는 병이 깊어',
          source: '관동별곡',
          category: '사자성어',
          grammar: '천석고황(泉石膏肓), 연하고질(煙霞痼疾)과 일맥상통'
        },
        {
          word: '竹듁林님',
          hanja: '竹林',
          meaning: '작가의 은거지 (전남 담양 창평)',
          source: '관동별곡',
          category: '옛말',
          grammar: '대나무 숲, 속세를 떠나 은거하던 곳'
        },
        {
          word: '方방面면',
          hanja: '方面',
          meaning: '관찰사의 직무 (한 도의 정무)',
          source: '관동별곡',
          category: '한자어',
          grammar: '방면고임(方面之任)의 줄임말. 관찰사 벼슬'
        },
        {
          word: '가디록',
          hanja: '',
          meaning: '갈수록, 더욱더 (More and more)',
          source: '관동별곡',
          category: '옛말',
          grammar: '고어 부사 "가디록"(갈수록 더욱)'
        },
        {
          word: '罔망極극ᄒᆞ다',
          hanja: '罔極',
          meaning: '다함이 없다, 끝없이 넓다',
          source: '관동별곡',
          category: '한자어',
          grammar: '망극(罔極): 은혜가 너무 커서 끝을 알 수 없음'
        },
        {
          word: '玉옥節졀',
          hanja: '玉節',
          meaning: '관찰사의 신표 (옥으로 만든 패)',
          source: '관동별곡',
          category: '한자어',
          grammar: '임금이 관찰사에게 하사하는 권위의 상징'
        }
      ],
      commentary: '송강 정철이 강원도 관찰사로 부임하면서 지은 가사 문학의 백미입니다. 웅장한 호연지기와 관찰사로서의 책임감, 관동팔경의 아름다운 풍광이 뛰어난 우리말로 서술되었습니다.'
    },
    {
      id: 'mock-yongbi',
      title: '용비어천가 제2장 (龍飛御天歌 第二章)',
      author: '정인지·안지·권제 등 찬수',
      era: '조선 세종 27년 (1445년)',
      originalText: 'ᄇᆞᄅᆞ매 아니 뮐ᄊᆡ 곶 됴코 여름 하ᄂᆞ니. ᄉᆡ미 기픈 무른 ᄀᆞᄆᆞ래 아니 그츨ᄊᆡ 내히 이러 바ᄅᆞ래 가ᄂᆞ니.',
      modernText: '바람에 흔들리지 아니하므로 꽃이 아름답고 열매가 많이 열리나니. 샘이 깊은 물은 가뭄에도 마르지 아니하므로 시내를 이루어 영원한 바다로 흘러가나니.',
      morphemes: [
        {
          word: 'ᄇᆞᄅᆞ매',
          hanja: '',
          meaning: '바람에, 모진 시련에',
          source: '용비어천가',
          category: '옛말',
          grammar: 'ᄇᆞᄅᆞᆷ(바람) + 에(원인/부사격 조사)'
        },
        {
          word: '뮐ᄊᆡ',
          hanja: '',
          meaning: '흔들리므로, 움직이므로',
          source: '용비어천가',
          category: '옛말',
          grammar: '동사 "뮈다"(움직이다, 흔들리다) + 이유 원인 어미 "-ㄹᄊᆡ"'
        },
        {
          word: '됴코',
          hanja: '',
          meaning: '좋고 (Good)',
          source: '용비어천가',
          category: '옛말',
          grammar: '고어 "됴ᄒᆞ다"(좋다) vs "조ᄒᆞ다"(깨끗하다, 맑다)의 구분 주의'
        },
        {
          word: '여름',
          hanja: '',
          meaning: '열매 (Fruit)',
          source: '용비어천가',
          category: '옛말',
          grammar: '동사 "열다"(結實) + 명사파생 접미사 "-음". 계절 여름(夏)은 "녀름"'
        },
        {
          word: '하ᄂᆞ니',
          hanja: '',
          meaning: '많으니라 (Many)',
          source: '용비어천가',
          category: '옛말',
          grammar: '형용사 "하다"(많다) + 현재 시제 선어말어미 "-ᄂᆞ-"'
        },
        {
          word: 'ᄀᆞᄆᆞ래',
          hanja: '',
          meaning: '가뭄에, 메마름에',
          source: '용비어천가',
          category: '옛말',
          grammar: '명사 "ᄀᆞᄆᆞᆯ"(가뭄) + 에'
        },
        {
          word: '내히 이러',
          hanja: '',
          meaning: '시내를 이루어, 개천이 되어',
          source: '용비어천가',
          category: '옛말',
          grammar: '내ㅎ(히읗종성체언) + 이(주격) + 니다(이루다)'
        },
        {
          word: '바ᄅᆞ래',
          hanja: '',
          meaning: '바다로, 바다에',
          source: '용비어천가',
          category: '옛말',
          grammar: '명사 "바ᄅᆞᆯ"(바다) + 애(처소격 조사)'
        }
      ],
      commentary: '훈민정음으로 지어진 최초의 한글 악장이자 서사시입니다. 국본(國本)이 튼튼한 국가는 어떠한 역경에도 흔들리지 않고 무궁히 번영하리라는 비유적 진리를 노래했습니다.'
    }
  ];

  // 순환 인덱스
  let lastMockIndex = -1;

  /**
   * AI 분석 시뮬레이터 객체
   */
  const AegukAIService = {
    /**
     * 전체 데이터셋 조회
     */
    getAllSamples: function () {
      return MOCK_AI_DATABASE;
    },

    /**
     * 이미지 분석 시뮬레이션 (1.5초 딜레이 후 데이터셋 순환 반환)
     * @param {string} imageDataUrl - 2-1단계에서 추출된 이미지 데이터
     * @returns {Promise<Object>}
     */
    analyzeOldText: function (imageDataUrl) {
      return new Promise(function (resolve) {
        // 순환 선택
        lastMockIndex = (lastMockIndex + 1) % MOCK_AI_DATABASE.length;
        const resultData = MOCK_AI_DATABASE[lastMockIndex];

        // 1.5초간 서당 AI 훈장 강독 로딩 시뮬레이션
        setTimeout(function () {
          resolve({
            success: true,
            timestamp: new Date().toISOString(),
            imagePreview: imageDataUrl,
            analysis: resultData
          });
        }, 1500);
      });
    }
  };

  // 전역 네임스페이스 바인딩
  window.AegukAIService = AegukAIService;

})(window);
