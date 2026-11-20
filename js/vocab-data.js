/**
 * ========================================================
 * 애국 AI (서당 AI) - 필수 고전 어휘 및 문학 대역 데이터셋
 * 파일: js/vocab-data.js
 * 2-3단계: 고전문학 필수 어휘 16선 & 기출 문학 1:1 대역 데이터
 * ========================================================
 */

(function (window) {
  'use strict';

  /**
   * 필수 고어 어휘 및 사자성어 16선 데이터셋
   */
  const VOCAB_DATASET = [
    {
      id: 1,
      word: 'ᄉᆞᄆᆞᆺ디',
      hanja: '',
      meaning: '서로 통하다, 사무치다',
      category: '옛말',
      exampleOriginal: '나랏말ᄊᆞ미 中國에 달아 文字와로 서르 ᄉᆞᄆᆞᆺ디 아니ᄒᆞᆯᄊᆡ',
      exampleModern: '우리나라의 말이 중국과 달라 한자와는 서로 통하지 아니하므로',
      grammarTip: '동사 "ᄉᆞᄆᆞᆺ다"의 부정 연결어미형. [통하지 아니하므로]로 해석합니다.'
    },
    {
      id: 2,
      word: '어엿브다',
      hanja: '',
      meaning: '가엽다, 불쌍하다 (Pitiful)',
      category: '옛말',
      exampleOriginal: '내 이ᄅᆞᆯ 위ᄒᆞ야 어엿비 너겨 새로 스믈여듧 字ᄅᆞᆯ ᄆᆡᆼᄀᆞ노니',
      exampleModern: '내가 이를 가엾게 여겨 새로 스물여덟 자를 만드니',
      grammarTip: '현대어에서는 "예쁘다(Cute)"의 뜻이나, 중세국어에서는 "불쌍하다"는 뜻의 의미 이동 단어입니다.'
    },
    {
      id: 3,
      word: '어리다',
      hanja: '',
      meaning: '어리석다 (Foolish)',
      category: '옛말',
      exampleOriginal: '이런 젼ᄎᆞ로 어린 百姓이 니르고져 호ᇙ 배 이셔도',
      exampleModern: '이런 까닭에 어리석은 백성이 말하고자 하는 바가 있어도',
      grammarTip: '현대어의 "나이가 적다"가 아닌 "지혜롭지 못하고 어리석다"는 뜻의 대표적인 의미 이동 어휘입니다.'
    },
    {
      id: 4,
      word: '하다',
      hanja: '',
      meaning: '많다, 크다 (Many / Great)',
      category: '옛말',
      exampleOriginal: 'ᄆᆞᄎᆞᆷ내 제 ᄠᅳ들 시러 펴디 못ᄒᆞᇙ 노미 하니라',
      exampleModern: '마침내 제 뜻을 능히 펴지 못하는 사람이 많으니라',
      grammarTip: '아래아가 없는 "하다"는 [많다], 아래아가 있는 "ᄒᆞ다"는 현대어의 [행하다(Do)]입니다.'
    },
    {
      id: 5,
      word: '됴ᄒᆞ다',
      hanja: '',
      meaning: '좋다 (Good)',
      category: '옛말',
      exampleOriginal: 'ᄇᆞᄅᆞ매 아니 뮐ᄊᆡ 곶 됴코 여름 하ᄂᆞ니',
      exampleModern: '바람에 흔들리지 아니하므로 꽃이 아름답고(좋고) 열매가 많나니',
      grammarTip: '"됴ᄒᆞ다"는 현대어의 [좋다(Good)], "조ᄒᆞ다"는 현대어의 [깨끗하다(Clean)]를 의미합니다.'
    },
    {
      id: 6,
      word: '조ᄒᆞ다',
      hanja: '',
      meaning: '깨끗하다, 맑다 (Clean / Pure)',
      category: '옛말',
      exampleOriginal: '고즌 므스 일로 퓌여셔 쉬이 디고, 플은 어이ᄒᆞ야 프ᄅᆞᄂᆞᆫ ᄃᆞᆺ 누르ᄂᆞ니',
      exampleModern: '꽃은 무슨 일로 피어서 쉽게 지고, 풀은 어찌하여 푸른 듯하다가 누레지는가',
      grammarTip: '고전문학에서 "조흔 물", "조흔 마음"은 [깨끗한 물], [맑은 마음]으로 풀이합니다.'
    },
    {
      id: 7,
      word: '여름',
      hanja: '',
      meaning: '열매 (Fruit / Result)',
      category: '옛말',
      exampleOriginal: '곶 됴코 여름 하ᄂᆞ니',
      exampleModern: '꽃이 좋고 열매가 많이 열리나니',
      grammarTip: '동사 "열다"(結實)에 명사파생 접미사 "-음"이 결합된 형태입니다. 계절 여름(夏)은 "녀름"입니다.'
    },
    {
      id: 8,
      word: '괴다',
      hanja: '',
      meaning: '사랑하다 (Love / Cherish)',
      category: '옛말',
      exampleOriginal: '님 괴샤미 ᄂᆞᆫᄀᆞᆯ곤 ᄉᆞᄅᆞᆼ이 어디 잇가',
      exampleModern: '임께서 나를 사랑하심 같은 사랑이 세상 어디에 있겠는가',
      grammarTip: '남녀 간의 지극한 사랑을 뜻하며, 시조와 가사 문학에서 빈출되는 절대 필수 고어입니다.'
    },
    {
      id: 9,
      word: '혜다',
      hanja: '',
      meaning: '생각하다, 헤아리다 (Ponder)',
      category: '옛말',
      exampleOriginal: '밤즁만 ᄒᆞᆫ ᄭᅮᆷ에 혜오미 ᄀᆞ이 업다',
      exampleModern: '한밤중 한바탕 꿈에 생각이 끝이 없구나',
      grammarTip: '명사형은 "혜옴"(생각). 시름과 깊은 사색을 표현할 때 쓰입니다.'
    },
    {
      id: 10,
      word: '삼기다',
      hanja: '',
      meaning: '생기다, 태어나다 (Be born / Made)',
      category: '옛말',
      exampleOriginal: '이 몸 삼기실 제 님을 조차 삼기시니',
      exampleModern: '이 몸이 태어날 때에 임을 따라 태어나니',
      grammarTip: '하늘에 의해 생겨나거나 태어남을 의미하며, 정철의 〈사미인곡〉 첫 행에 등장합니다.'
    },
    {
      id: 11,
      word: '각골난망',
      hanja: '刻骨難忘',
      meaning: '은혜를 뼈에 새겨 잊지 못함',
      category: '사자성어',
      exampleOriginal: '나라를 구한 선열들의 숭고한 충절은 각골난망이어라.',
      exampleModern: '목숨 바쳐 나라를 지킨 높은 은혜를 뼈에 깊이 새겨 영원히 잊지 못하리로다.',
      grammarTip: '새길 각(刻), 뼈 골(骨), 어려울 난(難), 잊을 망(忘). 결초보은(結草報恩)과 유사어.'
    },
    {
      id: 12,
      word: '천석고황',
      hanja: '泉石膏肓',
      meaning: '자연의 절경을 너무나 사랑하는 고질병',
      category: '사자성어',
      exampleOriginal: '江강湖호애 病병이 깁퍼 (천석고황, 연하고질)',
      exampleModern: '자연을 몹시 사랑하여 벼슬길을 잊고 자연 속에 살고자 하는 마음',
      grammarTip: '샘 천(泉), 돌 석(石), 기름 고(膏), 명치끝 황(肓). 고질병처럼 굳어진 자연 사랑.'
    },
    {
      id: 13,
      word: '맥수지탄',
      hanja: '麥秀之嘆',
      meaning: '고국의 멸망을 슬퍼하는 탄식',
      category: '사자성어',
      exampleOriginal: '폐허가 된 옛 궁터에 보리만 무성하니 맥수지탄을 금할 길 없다.',
      exampleModern: '화려했던 옛 도읍이 보리밭으로 변한 것을 보고 느끼는 쓸쓸한 탄식',
      grammarTip: '보리 맥(麥), 빼어날 수(秀), 갈 지(之), 탄식할 탄(嘆). 기자(箕子)의 고사에서 유래.'
    },
    {
      id: 14,
      word: '연하고질',
      hanja: '煙霞痼疾',
      meaning: '안개와 노을(자연)을 깊이 사랑하는 고질병',
      category: '사자성어',
      exampleOriginal: '속세를 멀리하고 산수 간에 묻혀 사니 연하고질이 도졌음이라.',
      exampleModern: '산수를 사랑하는 마음이 깊어 마음의 병이 될 정도라는 문학적 표현',
      grammarTip: '연기 연(煙), 노을 하(霞), 고질병 고(痼), 병 질(疾). 천석고황과 동의어.'
    },
    {
      id: 15,
      word: '문해력',
      hanja: '文解力',
      meaning: '글을 읽고 의미를 정확히 이해하는 능력',
      category: '한자어',
      exampleOriginal: '고전문학의 형태소를 분해하여 읽는 훈련은 문해력 증진의 첩경이다.',
      exampleModern: '옛글의 맥락을 분석하고 비판적으로 해석하는 능력',
      grammarTip: '글월 문(文), 풀 해(解), 힘 력(力). 현대 수능 및 내신 국어의 핵심 역량.'
    },
    {
      id: 16,
      word: '오매불망',
      hanja: '寤寐不忘',
      meaning: '자나 깨나 잊지 못하고 사모함',
      category: '사자성어',
      exampleOriginal: '오매불망 님을 향한 일편단심은 변할 줄 모르네.',
      exampleModern: '잠을 잘 때나 깨어 있을 때나 오직 임 생각뿐이라 결코 잊지 못하네.',
      grammarTip: '깰 오(寤), 잘 매(寐), 아니 불(不), 잊을 망(忘). 전전반측(輾轉反側)과 긴밀한 맥락.'
    }
  ];

  /**
   * 고전문학 1:1 대역 데이터셋 2종 (관동별곡 & 제망매가)
   */
  const PARALLEL_LITERATURE_DATASET = [
    {
      id: 'lit-gwandong',
      title: '정철 〈관동별곡 (關東別曲)〉 기경',
      author: '정철',
      rows: [
        {
          original: '江강湖호애 病병이 깁퍼 竹듁林님의 누엇더니',
          translation: '자연을 사랑하는 고질병(연하고질)이 깊어 은거지인 전남 창평 대나무 숲에 누워 지냈더니'
        },
        {
          original: '關관東동 八팔百ᄇᆡᆨ里리의 方방面면을 맛디시니',
          translation: '임금께서 강원도 팔백 리의 관찰사 직분을 흔쾌히 맡겨 주시니'
        },
        {
          original: '어와 聖셩恩은이야 가디록 罔망極극ᄒᆞ다',
          translation: '아아, 성은이야말로 갈수록 끝이 없구나'
        },
        {
          original: '延연秋츄門문 드리ᄃᆞ라 慶경會회 南남門문 ᄇᆞ라보며',
          translation: '경복궁 서문인 연추문으로 달려 들어가 경회루 남문을 바라보며'
        },
        {
          original: '下하直직고 물너나니 玉옥節졀이 알ᄑᆡ 셧다',
          translation: '임금께 하직 인사를 올리고 물러나니 관찰사의 신표인 옥절이 앞에 서 있구나'
        },
        {
          original: '平평丘구驛역 ᄆᆞᆯ을 ᄀᆞᄅᆞ 墨흑水슈로 ᄃᆞ라드니',
          translation: '양주 평구역에서 말을 갈아 타고 여주 흑수로 달려 들어가니'
        },
        {
          original: '蟾셤江강은 어ᄃᆡ메오, 雉치岳악이 여긔로다',
          translation: '섬강은 어디인가? 치악산이 바로 여기로구나'
        }
      ]
    },
    {
      id: 'lit-jemangmae',
      title: '월명사 10구체 향가 〈제망매가 (祭亡妹歌)〉',
      author: '월명사 (月明師)',
      rows: [
        {
          original: '生死路隱 此矣有阿米 次肹伊遣 (생사 길흔 이ᅌᅦ 이샤매 머믓거리오)',
          translation: '삶과 죽음의 길은 이승에 있음에 두려워 머뭇거리고'
        },
        {
          original: '吾隱去內如辭叱都 毛如云遣去奴隱尼 (나ᄂᆞᆫ 가ᄂᆞ다 말도 몯다 니르고 가닛고)',
          translation: '‘나는 간다’는 작별의 말조차 다하지 못하고 가 버렸는가'
        },
        {
          original: '於內秋察早隱風未 此矣彼矣浮良落奴隱葉如 (어느 ᄀᆞᄉᆞᆯ 이른 ᄇᆞᄅᆞ매 이ᅌᅦ 뎌ᅌᅦ ᄠᅥ디릴 닙ᄀᆞᆮ)',
          translation: '어느 가을 이른 바람에 이곳저곳에 어지러이 떨어지는 나뭇잎처럼'
        },
        {
          original: '一等隱枝良出古 去奴隱處震不知隱 (ᄒᆞᄃᆞᆫ 가재 나고 가논 고ᄃᆞᆯ 모ᄅᆞ온뎌)',
          translation: '한 가지(한 부모)에서 태어나고도 누이가 가는 곳을 알지 못하겠구나'
        },
        {
          original: '阿也 彌陀刹良逢乎吾 道修良待是古如 (아아 彌陀刹애 맛보올 내 道 닷가 기디리로다)',
          translation: '아아! 극락정토(미타찰)에서 다시 만날 나이기에, 불도를 닦으며 기다리겠노라'
        }
      ]
    }
  ];

  window.AegukVocabData = {
    vocabs: VOCAB_DATASET,
    literatures: PARALLEL_LITERATURE_DATASET
  };

})(window);
