// --- Core Database & Data Management Module (Local Storage) ---
// Generated automatically via GitHub Update action

const DEFAULT_WRITTEN_ARCHIVE = [
  {
    "id": "wa-1",
    "title": "[핵심요약] 2026년 컴퓨터활용능력 1급 필기 핵심 요약집",
    "description": "컴퓨터활용능력 1급 필기 시험 대비 핵심 이론 요약집입니다. 컴퓨터 일반, 스프레드시트 일반, 데이터베이스 일반 전체 내용을 한눈에 볼 수 있도록 정리했습니다.",
    "fileName": "2026_컴활1급_필기_핵심요약.pdf",
    "fileSize": "4.8 MB",
    "date": "2026-06-15",
    "author": "관리자"
  },
  {
    "id": "wa-2",
    "title": "[기출문제] 2025년 사무자동화산업기사 필기 기출문제 및 해설",
    "description": "2025년에 시행된 사무자동화산업기사 필기 기출문제집과 오답 정리를 포함한 상세 해설 파일입니다. PDF 포맷으로 인쇄에 최적화되어 있습니다.",
    "fileName": "2025_사무자동화_필기_기출해설.zip",
    "fileSize": "12.4 MB",
    "date": "2026-05-20",
    "author": "관리자"
  },
  {
    "id": "wa-3",
    "title": "[벼락치기] 컴활 2급 필기 3일 합격 암기노트",
    "description": "시간이 부족한 수험생들을 위한 단기 합격용 요약노트입니다. 출제 빈도가 가장 높은 상위 100가지 개념만을 엄선하여 정리했습니다.",
    "fileName": "컴활2급_필기_3일합격_노트.pdf",
    "fileSize": "2.1 MB",
    "date": "2026-06-01",
    "author": "관리자"
  }
];

const DEFAULT_WRITTEN_VIDEO = [
  {
    "id": "wv-1",
    "title": "컴활2급대비 함수사용법(1)",
    "description": "컴퓨터활용능력 2급에 출제되는 함수 제대로 알아봅시다!",
    "youtubeId": "NA6cU9s1GLU",
    "date": "2026-07-07",
    "author": "관리자",
    "tag": "2급"
  },
  {
    "id": "wv-2",
    "title": "컴활2급대비 함수사용법(2)",
    "description": "컴퓨터활용능력 2급에 출제되는 함수 제대로 알아봅시다!",
    "youtubeId": "4Nazc-vY0TI",
    "date": "2026-07-07",
    "author": "관리자",
    "tag": "2급"
  },
  {
    "id": "wv-3",
    "title": "컴활2급대비 함수사용법(3)",
    "description": "컴퓨터활용능력 2급에 출제되는 함수 제대로 알아봅시다!",
    "youtubeId": "1UWeDaNNn_E",
    "date": "2026-07-07",
    "author": "관리자",
    "tag": "2급"
  }
];

const DEFAULT_PRACTICAL_ARCHIVE = [
  {
    "id": "pa-1",
    "title": "[실습파일] 컴퓨터활용능력 1급 실기 스프레드시트 기출 예제",
    "description": "컴활 1급 실기 시험 대비 엑셀 실습 파일입니다. 계산작업, 분석작업, 매크로, 프로시저 코딩 문제를 직접 해결할 수 있는 데이터 파일이 포함되어 있습니다.",
    "fileName": "컴활1급_실기_엑셀_실습예제.zip",
    "fileSize": "1.2 MB",
    "date": "2026-06-18",
    "author": "관리자"
  },
  {
    "id": "pa-2",
    "title": "[공식문제] 사무자동화산업기사 실기 공단 공개문제 6선",
    "description": "산업인력공단에서 배포한 사무자동화 실기(엑셀, 액세스, 파워포인트) 공식 공개문제 파일과 해설 문서입니다. 시험장에 가기 전 반드시 마스터해야 하는 필수 자료입니다.",
    "fileName": "사무자동화_실기_공개문제_6선.zip",
    "fileSize": "8.7 MB",
    "date": "2026-04-28",
    "author": "관리자"
  },
  {
    "id": "pa-3",
    "title": "[함수정리] 컴활 실기 단골 출제 함수 공식 요약표",
    "description": "VLOOKUP, INDEX, MATCH 등 시험에 매번 나오는 엑셀 핵심 함수들의 문법과 적용 방식, 기출 패턴을 표 형식으로 구성한 요약본입니다.",
    "fileName": "컴활실기_필수함수_공식표.pdf",
    "fileSize": "1.5 MB",
    "date": "2026-06-12",
    "author": "관리자"
  }
];

const DEFAULT_PRACTICAL_VIDEO = [
  {
    "id": "pv-1",
    "title": "컴퓨터활용능력2급 실기대비(1)-기본작업",
    "description": "[컴퓨터활용능력 2급 실기]\n컴퓨터활용능력2급 실기대비(1)-기본작업\n\n컴활2급 실기 연습문제 [기본작업]을 함께 해 봅니다.\n(연습문제 출처 : 대한상공회의소)",
    "youtubeId": "zlSm9i7hai8",
    "date": "2026-07-07",
    "author": "관리자",
    "tag": "2급"
  },
  {
    "id": "pv-2",
    "title": "컴퓨터활용능력2급 실기대비(2)-계산작업",
    "description": "[컴퓨터활용능력 2급 실기]\n컴퓨터활용능력2급 실기대비(2)-계산작업\n\n컴활2급 실기 연습문제 [계산작업]을 함께 해 봅니다.\n(연습문제 출처 : 대한상공회의소)",
    "youtubeId": "YbfNFEq0klI",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "id": "pv-3",
    "title": "컴퓨터활용능력2급 실기대비(3)-분석작업",
    "description": "[컴퓨터활용능력 2급 실기]\n컴퓨터활용능력2급 실기대비(3)-분석작업\n\n컴활2급 실기 연습문제 [분석작업]을 함께 해 봅니다.\n(연습문제 출처 : 대한상공회의소)",
    "youtubeId": "g-fQld8phtU",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴퓨터활용능력2급 실기대비(4)-기타작업",
    "description": "[컴퓨터활용능력 2급 실기]\n컴퓨터활용능력2급 실기대비(4)-기타작업\n\n컴활2급 실기 연습문제 [기타작업]을 함께 해 봅니다.\n(연습문제 출처 : 대한상공회의소)",
    "youtubeId": "xD_uGPf1psk",
    "id": "pr-1783386781182",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(1)-기본작업",
    "description": "컴퓨터활용능력2급 기출문제 풀이(1)-Part 1. 기본작업",
    "youtubeId": "we12lT4FtX8",
    "id": "pr-1783387704761",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(1)-계산작업①",
    "description": "컴퓨터활용능력2급 기출문제 풀이(1)-Part 2. 계산작업①",
    "youtubeId": "HmS5YSTh2CE",
    "id": "pr-1783387730928",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(1)-계산작업②",
    "description": "컴퓨터활용능력2급 기출문제 풀이(1)-Part 2. 계산작업②",
    "youtubeId": "2DFDtS-lH54",
    "id": "pr-1783387759312",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(1)-분석작업",
    "description": "컴퓨터활용능력2급 기출문제 풀이(1)-Part 3. 분석작업",
    "youtubeId": "NIDOurJH9Io",
    "id": "pr-1783387781178",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(1)-기타작업 中 매크로",
    "description": "컴퓨터활용능력2급 기출문제 풀이(1)-Part 4. 기타작업 中 매크로",
    "youtubeId": "ee42PSBPIIw",
    "id": "pr-1783387817842",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(1)-기타작업 中 차트",
    "description": "컴퓨터활용능력2급 기출문제 풀이(1)-Part 4. 기타작업 中 차트",
    "youtubeId": "4VXr0mZJ5dw",
    "id": "pr-1783387843236",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(2)-기본작업",
    "description": "컴퓨터활용능력2급 기출문제 풀이(2)-Part 1. 기본작업",
    "youtubeId": "9_2pFnBMrQ4",
    "id": "pr-1783387904195",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(2)-계산작업",
    "description": "컴퓨터활용능력2급 기출문제 풀이(2)-Part 2. 계산작업",
    "youtubeId": "gpv-ggIBJ1Y",
    "id": "pr-1783387930562",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(2)-분석작업",
    "description": "컴퓨터활용능력2급 기출문제 풀이(2)-Part 3. 분석작업",
    "youtubeId": "3GBweEizEkE",
    "id": "pr-1783387950061",
    "date": "2026-07-07",
    "author": "관리자"
  },
  {
    "title": "컴활2급 기출문제풀이(2)-기타작업",
    "description": "컴퓨터활용능력2급 기출문제 풀이(2)-Part 4. 기타작업",
    "youtubeId": "U955kn_6LYY",
    "id": "pr-1783387978827",
    "date": "2026-07-07",
    "author": "관리자"
  }
];

const DEFAULT_RECOMMEND_SITES = [
  {
    "id": "rc-1",
    "title": "대한상공회의소 자격평가사업단",
    "description": "컴퓨터활용능력 1급/2급 상시 및 정기 시험의 원서 접수, 합격 확인, 자격증 발급을 신청할 수 있는 공식 공식 기관 사이트입니다.",
    "siteUrl": "http://license.korcham.net",
    "category": "공식 접수처",
    "tag": "상공회의소"
  },
  {
    "id": "rc-2",
    "title": "한국산업인력공단 Q-Net",
    "description": "사무자동화산업기사 원서 접수, 시험 정보 안내, 기출 서식 확인, 합격자 발표 및 경력 증명 처리를 수행하는 국가기술자격 허브 사이트입니다.",
    "siteUrl": "https://www.q-net.or.kr",
    "category": "공식 접수처",
    "tag": "큐넷"
  },
  {
    "id": "rc-3",
    "title": "시나공 IT 자격증 카페",
    "description": "길벗 출판사에서 운영하는 IT 자격증 전문 커뮤니티로, 무료 핵심요약 PDF 교재, 기출 해설, 질문 답변 게시판을 제공합니다.",
    "siteUrl": "https://cafe.naver.com/sinagongit",
    "category": "학습 커뮤니티",
    "tag": "시나공"
  },
  {
    "id": "rc-4",
    "title": "영진닷컴 이기적 자격증",
    "description": "영진닷컴 출판사에서 제공하는 무료 동영상 강의 자료실 및 모의고사 문제 풀이 사이트입니다. 교재 구입 시 연계된 추가 온라인 혜택을 이용할 수 있습니다.",
    "siteUrl": "https://license.youngjin.com",
    "category": "인터넷 강의",
    "tag": "이기적"
  },
  {
    "id": "rc-5",
    "title": "CBT 기출문제 전자문제집",
    "description": "각종 자격증 필기 시험 기출문제를 다운로드 없이 브라우저 상에서 바로 풀어보고 모의고사를 칠 수 있는 온라인 기출 훈련소 사이트입니다.",
    "siteUrl": "https://www.comcbt.com",
    "category": "무료 기출풀이",
    "tag": "CBT"
  }
];

// Database utility functions
const DB = {
  init() {
    if (!localStorage.getItem("written_archive")) {
      localStorage.setItem("written_archive", JSON.stringify(DEFAULT_WRITTEN_ARCHIVE));
    }
    if (!localStorage.getItem("written_video")) {
      localStorage.setItem("written_video", JSON.stringify(DEFAULT_WRITTEN_VIDEO));
    }
    if (!localStorage.getItem("practical_archive")) {
      localStorage.setItem("practical_archive", JSON.stringify(DEFAULT_PRACTICAL_ARCHIVE));
    }
    if (!localStorage.getItem("practical_video")) {
      localStorage.setItem("practical_video", JSON.stringify(DEFAULT_PRACTICAL_VIDEO));
    }
    if (!localStorage.getItem("recommend_sites")) {
      localStorage.setItem("recommend_sites", JSON.stringify(DEFAULT_RECOMMEND_SITES));
    }
    if (!localStorage.getItem("emailjs_settings")) {
      localStorage.setItem("emailjs_settings", JSON.stringify({
        publicKey: "",
        serviceId: "",
        templateId: "",
        adminEmail: "admin@oamaster.co.kr"
      }));
    }
  },
  getAll(key) {
    this.init();
    return JSON.parse(localStorage.getItem(key)) || [];
  },
  getById(key, id) {
    const list = this.getAll(key);
    return list.find(item => item.id === id);
  },
  save(key, item) {
    const list = this.getAll(key);
    if (item.id) {
      const index = list.findIndex(i => i.id === item.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...item, date: new Date().toISOString().split('T')[0] };
      }
    } else {
      item.id = key.substring(0, 2) + '-' + Date.now();
      item.date = new Date().toISOString().split('T')[0];
      item.author = "관리자";
      list.push(item);
    }
    localStorage.setItem(key, JSON.stringify(list));
    return item;
  },
  delete(key, id) {
    let list = this.getAll(key);
    list = list.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  },
  moveUp(key, id) {
    const list = this.getAll(key);
    const index = list.findIndex(item => item.id === id);
    if (index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    }
    return false;
  },
  moveDown(key, id) {
    const list = this.getAll(key);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1 && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    }
    return false;
  },
  getEmailJSSettings() {
    this.init();
    return JSON.parse(localStorage.getItem("emailjs_settings"));
  },
  saveEmailJSSettings(settings) {
    localStorage.setItem("emailjs_settings", JSON.stringify(settings));
    return true;
  }
};

window.DB = DB;
DB.init();
