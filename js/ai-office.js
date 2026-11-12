// AI 오피스 3일 완성 연계 페이지 인터랙션 모듈

/**
 * 3일 과정 교시별 데이터 (4시간 × 3일, 교시별 50분 구성)
 */
const CURRICULUM_DAYS = [
  {
    day: 'day1',
    dayNum: 1,
    badgeClass: '',
    detailHref: 'ai_office_day1.html',
    label: '1일차 (4시간) · Excel × AI 콜라보',
    sessions: [
      {
        period: '1교시 (50분)',
        tools: 'MS Excel · Sheets · ChatGPT',
        title: '함수를 외우지 않는 AI 질문 3단 공식 & 에러 해결',
        points: [
          '사전 세팅 15분 여유 배정 + 필수 기초 함수 5종(SUM·AVERAGE·IF·COUNTIF·VLOOKUP)',
          '셀 위치 + 원하는 결과 + 조건 예시 3단 공식 및 #N/A · #VALUE! 10초 해결'
        ],
        linkLabel: 'OA MASTER 실기 자료실 (성적처리 · 셀 참조 예제)',
        linkHref: 'practical_archive.html'
      },
      {
        period: '2교시 (50분)',
        tools: 'Google Sheets · Excel',
        title: '지저분한 표 1분 청소 & 자격증 오답노트 DB 구축',
        points: [
          '중복 항목 제거, 찾기/바꾸기(Ctrl+H), 빠른 채우기(Ctrl+E) 및 =AI() 미지원 대안',
          '컴활 CBT 틀린 문제를 체크박스·진도율로 관리하는 오답노트 시트 완성'
        ],
        linkLabel: '추천 사이트 CBT 기출문제 연계',
        linkHref: 'recommendations.html'
      },
      {
        period: '3교시 (50분)',
        tools: 'Google Forms · ChatGPT',
        title: 'Google Forms 설문 수집 & AI 데이터 분석 (개인정보 보호)',
        points: [
          '객관식 중심 설문 설계 → Sheets 연결 → .xlsx 저장 (시간 부족 시 샘플 .xlsx 대체)',
          '이름·연락처·학번 및 회사 대외비 삭제 후 ChatGPT로 핵심 특징 3줄 분석'
        ],
        linkLabel: '추천 사이트 (설문·기출 참고 링크)',
        linkHref: 'recommendations.html'
      },
      {
        period: '4교시 (50분)',
        tools: 'MS Excel · Sheets',
        title: '보고서용 그래프 3종 · 기초 피벗 · 1페이지 PDF 인쇄',
        points: [
          '막대/원형/꺾은선 그래프 3종과 행·값 2칸 기초 피벗 테이블',
          '가로 방향 + 한 페이지에 모든 열 맞추기 PDF 인쇄 & Ctrl+Shift+V 호환 팁'
        ],
        linkLabel: 'OA MASTER 실기 영상강의 (차트·피벗)',
        linkHref: 'practical_lectures.html'
      }
    ]
  },
  {
    day: 'day2',
    dayNum: 2,
    badgeClass: 'day2',
    detailHref: 'ai_office_day2.html',
    label: '2일차 (4시간) · Docs/Word × AI 콜라보',
    sessions: [
      {
        period: '1교시 (50분)',
        tools: 'NotebookLM · Gemini Deep Research',
        title: 'PDF 벼락치기 퀴즈 & Deep Research 자료 조사',
        points: [
          '강의안·컴활 요약집 PDF 업로드 → Studio 학습 가이드 · 플래시카드 · 퀴즈',
          'Deep Research 대기(3~5분) 중 2교시 목차 프롬프트 병행 작성 & Docs 내보내기'
        ],
        linkLabel: 'OA MASTER 필기 자료실 (컴활 요약 PDF)',
        linkHref: 'written_archive.html'
      },
      {
        period: '2교시 (50분)',
        tools: 'Google Docs · Gemini · ChatGPT',
        title: '빈 화면 탈출! 5단 목차 설계 & 내 생각 섞인 초안 쓰기',
        points: [
          '서론-본론(3)-결론 5단 목차 설계도 5분 완성',
          '내 메모(주장) + 1일차 설문 수치 + AI 문장 다듬기로 설득력 있는 문단 생성'
        ],
        linkLabel: 'OA MASTER 필기 영상강의 복습하기',
        linkHref: 'written_lectures.html'
      },
      {
        period: '3교시 (50분)',
        tools: 'Google Docs · MS Word',
        title: '보고서 문체 · 비즈니스 메일 응용 · 표절 방지 · 참고문헌',
        points: [
          '구어체→서술형 문체 교정 + 교수님 문의/대외활동/직장 보고 메일 톤 변환 응용',
          '복붙 금지·원문 클릭 검증·활용 표기 3원칙 및 참고문헌/인용 자동 정리'
        ],
        linkLabel: '컴활 필기 자료실 (문서·요약 연계)',
        linkHref: 'written_archive.html'
      },
      {
        period: '4교시 (50분)',
        tools: 'Google Docs → MS Word',
        title: '제목 스타일 1초 자동 목차 · 1분 회의록 & PDF 마감',
        points: [
          '제목 1·2 스타일 + Docs 실시간 협업(권한·제안·@멘션) + 1분 회의록 액션아이템',
          '.docx 내려받아 MS Word에서 폰트/표 점검 후 최종 PDF 제출본 완성'
        ],
        linkLabel: 'AI 리터러시 진단 참고자료 PDF',
        linkHref: 'AI리터러시진단안내_참고자료.pdf'
      }
    ]
  },
  {
    day: 'day3',
    dayNum: 3,
    badgeClass: 'day3',
    detailHref: 'ai_office_day3.html',
    label: '3일차 (4시간) · Slides/PPT × AI 콜라보',
    sessions: [
      {
        period: '1교시 (50분)',
        tools: 'Gemini · ChatGPT',
        title: '망하지 않는 PPT 2원칙 & 10장 스토리보드 압축',
        points: [
          '1슬라이드 1메시지 · 키워드 3줄 원칙으로 보고서 문단 10초 압축',
          '10분 발표 기준 표지~결론/Q&A 8~10장 장별 구성표 확정'
        ],
        linkLabel: '실전 프롬프트 라이브러리 바로가기',
        linkHref: '#promptLibrary'
      },
      {
        period: '2교시 (50분)',
        tools: 'Gemini Canvas → Slides → PPT',
        title: '슬라이드 골격 자동 생성 & .pptx 깨진 글꼴 3초 통일',
        points: [
          'Gemini Canvas → Google Slides 내보내기 (무료 크레딧 걱정 없는 기본 경로)',
          '.pptx 변환 후 PowerPoint 글꼴 바꾸기 + 맑은 고딕·2색 팔레트 통일'
        ],
        linkLabel: '실기 자료실 추가 연습하기',
        linkHref: 'practical_archive.html'
      },
      {
        period: '3교시 (50분)',
        tools: 'MS PowerPoint · Gemini · ChatGPT',
        title: 'PowerPoint 디자이너 1초 꾸미기 & AI 표지 이미지 · 차트',
        points: [
          '글자 삽입 금지 조건을 넣은 AI 표지 일러스트 생성 & 디자이너 1클릭 배치',
          '표지 · 1일차 설문 그래프 슬라이드 · 3줄 결론 핵심 3장 완성'
        ],
        linkLabel: '실기 영상강의 보기',
        linkHref: 'practical_lectures.html'
      },
      {
        period: '4교시 (50분)',
        tools: 'PowerPoint · ChatGPT · Gemini',
        title: '발표자 노트 대본 & 예상 질문 3선 (발표·면접 Q&A)',
        points: [
          '1분 300~350자 기준 발표자 노트 구어체 대본 + [클릭]/[1초 멈춤] 마킹',
          '교수님·심사위원·면접관 예상 질문 3선 & 결론 먼저 30초 Q&A, 포트폴리오 저장'
        ],
        linkLabel: '추천 사이트 (자격·실무 참고)',
        linkHref: 'recommendations.html'
      }
    ]
  }
];

/**
 * 수업·과제·예비직장인 실무에 바로 복사해 쓰는 핵심 프롬프트 목록
 */
const PROMPT_ITEMS = [
  {
    category: 'day1',
    tag: '1일차 · 엑셀 수식 (S08)',
    title: '셀 위치·결과·조건 3단 함수 질문',
    text: '엑셀 B2:B30에는 점수, C2:C30에는 출석일수가 있어. 점수가 80점 이상이면서 출석일수가 15일 이상인 학생 수만 세고 싶은데, 어떤 함수를 쓰면 돼? 바로 복사해 붙일 수 있는 수식과 초보자용 단계별 설명을 같이 적어줘.',
    tip: '오류가 나면 입력한 수식과 오류 이름(#N/A, #VALUE!)을 함께 붙여 물어보세요.'
  },
  {
    category: 'day1',
    tag: '1일차 · 오류 해결 (S11)',
    title: '엑셀 수식 오류(#N/A · #VALUE!) 10초 진단',
    text: '내 엑셀 수식은 [=VLOOKUP(A2, 기준표!$A$2:$C$20, 3, 0)]인데 #N/A 오류가 나. 데이터 형식 불일치나 절대참조($) 누락 가능성을 포함해 가장 흔한 원인 2가지와 수정된 수식을 초보자 눈높이로 알려줘.',
    tip: '수식을 지우지 말고 [입력한 수식 + 오류 코드 + 셀 구조]를 함께 물어보세요.'
  },
  {
    category: 'day1',
    tag: '1일차 · 자격증 오답노트 (S14)',
    title: '컴활 오답노트 표 양식 생성',
    text: '컴퓨터활용능력 자격증 공부를 위한 오답노트 표 양식을 만들어줘. 열은 [날짜, 과목/파트, 틀린 문제 요약, 내가 고른 오답, 핵심 개념, 복습 완료 여부]로 구성해서 구글 시트나 엑셀에 바로 붙여넣을 수 있게 표로 출력해줘.',
    tip: 'Google Sheets 삽입 > 체크박스와 COUNTIF를 연결하면 복습 진도율이 자동 계산됩니다.'
  },
  {
    category: 'day1',
    tag: '1일차 · 설문 파일 분석 (S17)',
    title: '설문 결과 3줄 요약 & 그래프 추천',
    text: '첨부한 설문조사 엑셀 파일을 분석해줘. 어려운 통계 용어는 빼고 초보자도 바로 이해할 수 있게 ① 가장 눈에 띄는 결과 특징 3가지, ② 보고서에 넣기 좋은 그래프 종류 2가지, ③ 그래프를 만들 때 어떤 열과 어떤 열을 묶어서 그리면 좋을지 표로 정리해줘.',
    tip: '업로드 전 이름·학번·연락처 등 개인정보와 회사 대외비 열은 반드시 삭제하세요.'
  },
  {
    category: 'day2',
    tag: '2일차 · PDF 퀴즈 대비 (S24)',
    title: '강의안 PDF 벼락치기 퀴즈 생성',
    text: '내가 올린 PDF 요약 자료 범위 안에서만 객관식 5문제와 1줄 해설을 출제해 줘. 외부 지식을 섞지 말고, 정답 번호와 내가 올린 자료의 몇 번째 핵심 포인트인지 근거도 함께 적어줘.',
    tip: 'NotebookLM에서는 업로드한 자료 안에서만 근거를 인용하므로 환각(거짓 정보)을 줄일 수 있습니다.'
  },
  {
    category: 'day2',
    tag: '2일차 · 5단 목차 설계 (S27)',
    title: '빈 화면 탈출! 5단 보고서 목차 생성',
    text: '대학생 리포트 주제 [주제 입력]에 대해 서론 - 본론 1(배경·현황) - 본론 2(1일차 설문 데이터 분석) - 본론 3(해결 방안·제언) - 결론의 5단 목차를 짜주고, 각 소제목 아래 내가 채워야 할 핵심 질문 1개씩만 적어줘.',
    tip: 'Deep Research가 자료를 찾는 3~5분 동안 먼저 목차를 설계해 두면 작업 속도가 2배 빨라집니다.'
  },
  {
    category: 'day2',
    tag: '2일차 · 보고서 문체 & 메일 (S29)',
    title: '보고서 문체 교정 (+비즈니스 메일 응용)',
    text: '아래 내가 쓴 초안의 핵심 의미와 수치는 바꾸지 말고, 대학생 과제 보고서에 어울리는 객관적이고 매끄러운 문체(~다/~이다)로만 다듬어줘. 어색한 표현을 왜 수정했는지도 간단히 알려줘.',
    tip: '예비직장인 응용: "교수님 문의 메일 / 직장 상사 보고 이메일 톤으로 다듬어줘"로 대상만 바꾸어 활용!'
  },
  {
    category: 'day2',
    tag: '2일차 · 팀플 & 실무 회의록 (S33)',
    title: '조별과제·실무 1분 회의록 정리',
    text: '아래 회의 메모를 정리해줘. 논의 내용을 [핵심 결정사항 / 담당자 / 마감일] 3열 액션아이템 표로 만들고, 아직 결론이 나지 않아 추가 확인이 필요한 항목만 아래에 2줄로 따로 정리해줘.',
    tip: 'Google Docs 문서 탭(Tabs)과 제안 모드를 함께 쓰면 버전 충돌 없이 협업할 수 있습니다.'
  },
  {
    category: 'day3',
    tag: '3일차 · PPT 압축 & 스토리보드 (S38)',
    title: '보고서 ➔ PPT 3줄 키워드 압축',
    text: '아래 보고서 내용을 PPT 슬라이드 1장에 넣을 수 있게 줄여줘. ① 맨 위에 들어갈 핵심 제목 1줄(15자 이내), ② 화면 본문에 들어갈 짧은 키워드 요약 3줄(각 20자 이내), ③ 내가 입으로 설명할 보충 내용은 따로 분리해서 적어줘.',
    tip: '한 슬라이드에는 메시지 1개만 남기고, 긴 설명은 발표자 노트로 분리하세요.'
  },
  {
    category: 'day3',
    tag: '3일차 · 표지 일러스트 (S44)',
    title: '글자 없는 깔끔한 AI 표지 이미지',
    text: "대학생 발표 PPT 표지에 쓸 깔끔하고 모던한 일러스트 그려줘. 주제는 '[발표 주제]'이고, 흰색 바탕에 차분한 남색(#0e4987) 톤의 미니멀한 플랫 디자인으로 그려줘. 이미지 안에 글자는 절대 넣지 마.",
    tip: 'PowerPoint 홈 > 디자이너와 함께 쓰면 클릭 1번으로 표지 레이아웃이 완성됩니다.'
  },
  {
    category: 'day3',
    tag: '3일차 · 발표 대본 (S47)',
    title: '1분 300~350자 발표자 노트 구어체 대본',
    text: '아래 PPT 슬라이드 1장 분량에 맞는 발표 대본을 1분 내외(한글 공백 포함 300~350자)로 작성해 줘. 보고서 문어체가 아니라 청중에게 자연스럽게 말하듯 구어체(~했습니다, ~보실 수 있습니다)로 쓰고, 화면 전환 지점은 [클릭], 강조 전 호흡은 [1초 멈춤]으로 표시해 줘.',
    tip: '작성한 대본은 PowerPoint 하단 발표자 노트에 붙여넣고 발표자 도구로 보며 연습하세요.'
  },
  {
    category: 'day3',
    tag: '3일차 · 발표·면접 Q&A (S48)',
    title: '교수님·면접관 예상 질문 3선 대비',
    text: '너는 꼼꼼한 대학 교수님(또는 실무 면접관·심사위원)이야. 아래 내 발표 대본과 슬라이드 내용을 보고, 발표가 끝난 뒤 가장 물어보고 싶은 현실적인 질문 3가지를 뽑아줘. 그리고 각 질문에 30초 내외로 깔끔하게 답할 수 있는 모범 답변 예시도 함께 알려줘.',
    tip: '답변 구조: 결론 먼저 → 1일차/조사 근거 1개 → 마무리 순서로 30초 안에 답변하세요.'
  }
];

/**
 * 일차별 커리큘럼 카드를 렌더링합니다.
 * @param {string} filterDay - 'all' 또는 'day1' | 'day2' | 'day3'
 */
function renderCurriculum(filterDay = 'all') {
  const container = document.getElementById('curriculumContainer');
  if (!container) return;

  const isDedicatedDayPage = Boolean(document.body.dataset.aiDay);
  const targetDays = filterDay === 'all'
    ? CURRICULUM_DAYS
    : CURRICULUM_DAYS.filter((d) => d.day === filterDay);

  container.innerHTML = targetDays.map((dayObj) => `
    <div style="margin-bottom: 26px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h3 style="font-size: 18px; color: var(--neutral-900); margin: 0;">${dayObj.label}</h3>
        ${!isDedicatedDayPage && dayObj.detailHref
          ? `<a href="${dayObj.detailHref}" class="day-detail-link">${dayObj.dayNum}일차 전용 페이지 <i class="fas fa-arrow-right"></i></a>`
          : ''}
      </div>
      <div class="day-grid">
        ${dayObj.sessions.map((s) => `
          <article class="session-card">
            <div class="session-top">
              <span class="session-badge ${dayObj.badgeClass}">${s.period}</span>
              <span class="session-tools">${s.tools}</span>
            </div>
            <h3>${s.title}</h3>
            <ul class="session-list">
              ${s.points.map((pt) => `<li>• ${pt}</li>`).join('')}
            </ul>
            <div class="session-link-bar">
              <span>연계 자료</span>
              <a href="${s.linkHref}">${s.linkLabel} <i class="fas fa-arrow-right"></i></a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * 프롬프트 라이브러리 카드를 렌더링합니다.
 * @param {string} category - 'all' | 'day1' | 'day2' | 'day3'
 */
function renderPrompts(category = 'all') {
  const grid = document.getElementById('promptGrid');
  if (!grid) return;

  const items = category === 'all'
    ? PROMPT_ITEMS
    : PROMPT_ITEMS.filter((p) => p.category === category);

  grid.innerHTML = items.map((p, idx) => `
    <article class="prompt-card">
      <div class="prompt-card-head">
        <span class="prompt-title">${p.title}</span>
        <span class="prompt-tag">${p.tag}</span>
      </div>
      <div class="prompt-text" id="promptText-${idx}">${p.text}</div>
      <p class="prompt-tip">${p.tip}</p>
      <button type="button" class="btn-copy-prompt" data-copy-idx="${idx}">
        <i class="fas fa-copy"></i> 프롬프트 복사
      </button>
    </article>
  `).join('');

  grid.querySelectorAll('.btn-copy-prompt').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const idx = Number(btn.getAttribute('data-copy-idx'));
      const text = items[idx]?.text || '';
      await copyPromptText(text);
    });
  });
}

/**
 * 클립보드로 프롬프트 텍스트를 복사하고 토스트 알림을 표시합니다.
 * @param {string} text - 복사할 문자열
 */
async function copyPromptText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    if (typeof window.showToast === 'function') {
      window.showToast('프롬프트가 클립보드에 복사되었습니다.', 'success');
    }
  } catch (err) {
    if (typeof window.showToast === 'function') {
      window.showToast('복사 중 오류가 발생했습니다. 직접 드래그하여 복사해 주세요.', 'error');
    }
  }
}

/**
 * 현재 페이지(data-ai-day 속성) 또는 URL 쿼리(?day=day1|day2|day3)에서 초기 일차를 판별합니다.
 */
function getInitialDayFromContext() {
  const bodyDay = document.body?.dataset?.aiDay;
  if (bodyDay === 'day1' || bodyDay === 'day2' || bodyDay === 'day3') {
    return bodyDay;
  }

  const params = new URLSearchParams(window.location.search);
  const day = params.get('day');
  if (day === 'day1' || day === 'day2' || day === 'day3') {
    return day;
  }
  return 'all';
}

document.addEventListener('DOMContentLoaded', () => {
  const initialDay = getInitialDayFromContext();

  document.querySelectorAll('.day-tab').forEach((t) => {
    t.classList.toggle('active', t.getAttribute('data-day') === initialDay);
  });
  document.querySelectorAll('.prompt-filter-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-cat') === initialDay);
  });

  renderCurriculum(initialDay);
  renderPrompts(initialDay);

  document.querySelectorAll('.day-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.day-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderCurriculum(tab.getAttribute('data-day') || 'all');
    });
  });

  document.querySelectorAll('.prompt-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.prompt-filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderPrompts(btn.getAttribute('data-cat') || 'all');
    });
  });
});

