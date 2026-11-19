// AI 오피스 연계 페이지 인터랙션 모듈

/**
 * 교시별 커리큘럼 데이터
 */
const CURRICULUM_DAYS = [
  {
    day: 'day1',
    dayNum: 1,
    badgeClass: '',
    detailHref: 'ai_office_day1.html',
    label: 'Excel & Sheets × AI 콜라보',
    sessions: [
      {
        period: 'Case Study 01',
        tools: 'Excel · Sheets · ChatGPT',
        title: '외우지 않는 AI 질문 공식 & 에러 해결',
        summary: 'AI 질문법으로 필수 함수 생성 및 #N/A·#VALUE! 오류 해결'
      },
      {
        period: 'Case Study 02',
        tools: 'Forms · Sheets · ChatGPT',
        title: '구글 폼 설문 연동 & ChatGPT 분석',
        summary: '설문 응답 시트 자동 연동 및 개인정보 삭제 후 AI 3줄 분석'
      }
    ]
  },
  {
    day: 'day2',
    dayNum: 2,
    badgeClass: 'day3',
    detailHref: 'ai_office_day2.html',
    label: 'PPT & Slides × AI 콜라보',
    disabled: false,
    sessions: [
      {
        period: 'Case Study 01',
        tools: 'Google NotebookLM · Gemini 1.5 Pro',
        title: 'Google NotebookLM 완벽 사용 및 대학생 학업·발표 가이드',
        summary: '소스 접지 팩트체크 리서치, 슬라이드 7장 기획안 & 30초 구술 스크립트 도출'
      },
      {
        period: 'Case Study 02',
        tools: 'Custom Skill Builder · Gamma · Canva',
        title: '스마트한 기획·행정 & 슬라이드 맞춤형 AI 스킬 제작 및 활용',
        summary: 'PPT 생성 스킬 5단계 업데이트, 행사 분 단위 큐시트 & 5컷 카드뉴스 자동화'
      }
    ]
  },
  {
    day: 'day3',
    dayNum: 3,
    badgeClass: 'day2',
    detailHref: 'ai_office_day3.html',
    label: 'Docs & Word × AI 콜라보 (준비중)',
    disabled: true,
    sessions: [
      {
        period: 'Case Study 01',
        tools: 'NotebookLM · Deep Research · Google Docs',
        title: '전공·자격증 벼락치기 리서치 & 논리적 보고서 목차·초안 완성',
        summary: 'PDF 교재·논문 3분 핵심 요약·퀴즈 생성 및 서론-본론-결론 5단 목차와 설문 데이터 결합 초안 도출'
      },
      {
        period: 'Case Study 02',
        tools: 'Google Docs · MS Word · AI 문체 교정',
        title: '학술 문체 교정 & 자동 목차·참고문헌 완벽 제출 서식 마감',
        summary: '표절·환각 방지 문맥 첨삭, 교수님/비즈니스 메일 변환 및 1초 자동 목차 스타일 지정 후 최종 PDF 저장'
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
    tag: '1교시: 수식 질문',
    title: '셀 위치·결과·조건 3단 함수 생성',
    text: `[역할]: 엑셀 및 구글 시트 전문가
[상황]: 엑셀 성적표를 만들고 있어. 2행부터 31행까지 데이터가 있어.
- C열은 출석일수(15일 만점), D열은 중간고사(100점 만점), E열은 기말고사(100점 만점)야.
[요청]:
1. F2 셀에 들어갈 총점 계산 수식을 작성해줘. (반영비율: 중간 40% + 기말 40% + 출석 20점 만점 환산: C2/15*20)
2. G2 셀에 들어갈 등급 수식을 작성해줘. (F2 총점 기준 90점 이상 "A", 80점 이상 "B", 70점 이상 "C", 그 외 "F")
3. H2 셀에 들어갈 상태 판정 수식을 작성해줘. (출석 C2가 10회 미만이거나 총점 F2가 60점 미만이면 "면담대상", 아니면 "정상")
4. 초보자가 수식을 아래로 드래그할 때 주의할 점도 1줄로 알려줘.`,
    tip: '내 시트의 열 위치와 구하려는 목표를 구체적으로 알려줄수록 정확한 수식이 나옵니다.'
  },
  {
    category: 'day1',
    tag: '1교시: 에러 해결',
    title: '수식 오류(#N/A · #VALUE! · #REF!) 10초 자가진단',
    text: `내 엑셀/시트 수식은 [=XLOOKUP(A2, 학생명부!$A$2:$A$50, 학생명부!$B$2:$B$50)]인데 #N/A 오류가 발생해.
A열 학번 데이터의 형식 불일치(숫자 vs 텍스트)나 보이지 않는 공백 가능성을 포함해 가장 흔한 원인 2가지와, 오류를 방지하는 IFERROR 감싸기 수정 수식을 알려줘.`,
    tip: '수식을 지우지 말고 [입력한 수식 + 오류 코드 + 셀 구조]를 함께 물어보세요.'
  },
  {
    category: 'day1',
    tag: '2교시: 데이터 정제',
    title: '카톡·메모장 비정형 텍스트 ➔ 정형 DB 표 변환',
    text: `아래 텍스트는 동아리 단톡방의 수입/지출 메모야.
이 내용을 엑셀/구글 시트에 복사해서 바로 붙여넣을 수 있도록 [구분(수입/지출)], [날짜(YYYY-MM-DD)], [항목], [금액(숫자만)], [비고] 열로 구성된 깔끔한 마크다운 테이블(표)로 변환해줘.
- 날짜 연도는 2026년으로 통일해줘.
- 금액 열은 쉼표나 '원' 글자 없이 순수 숫자만 넣어줘 (예: 20000).
- 입금자나 세부 특이사항은 [비고] 열에 넣어줘.

[텍스트 데이터]:
3/2 김민준 회비 입금 20,000원
3/3 OT 장소 대관료 지출 85,000원 (영수증 처리: 이서연)
3/5 박도윤 회비 입금 20000원 (지각비 2000원 포함해서 22,000원 입금됨)
3/7 다과 구매 (다이소) 14,300원
3/8 최유진 회비 20,000 납부완료`,
    tip: '표로 변환된 결과를 복사한 뒤 시트에서 Ctrl+V를 누르면 열과 행에 맞춰 바로 붙여넣어집니다.'
  },
  {
    category: 'day1',
    tag: '3교시: 설문 분석',
    title: 'Google Forms 설문 핵심 요약 & 학술 리포트 문장',
    text: `[역할]: 대학 소논문 및 연구 보고서 전문 데이터 분석가
[데이터]: 대학생 100명을 대상으로 조사한 '생성형 AI 학업 활용 실태' 설문 데이터 요약본이야.
- 응답자 분포: 저학년(1~2학년) 40%, 고학년(3~4학년) 60%
- 활용 빈도: 주 5회 이상(38%), 주 3~4회(32%), 주 1~2회(20%), 미사용(10%)
- 주요 목적: 과제 자료 조사(45%), 보고서 초안(25%), 코딩/수식 보조(18%), 번역(12%)
- 주관식 애로사항 주요 키워드: '할루시네이션/거짓정보(42%)', '프롬프트 작성 어려움(31%)', 'AI 표절 윤리 기준 모호(27%)'

[요청 과업]:
1. 위 데이터에서 발견할 수 있는 '주요 특징 3가지'를 학술적 어조로 브리핑해줘.
2. 학년(저학년 vs 고학년)에 따른 사용 목적 차이에 대한 합리적 가설 2가지를 제시해줘.
3. 소논문/과제 리포트의 [결론 및 제언] 파트에 그대로 넣을 수 있는 정돈된 학술 보고서 문단(줄글 형태, 약 400자 내외)을 작성해줘.`,
    tip: '업로드 전 이름·학번·연락처 등 개인정보(PII) 열은 반드시 삭제하세요.'
  },
  {
    category: 'day1',
    tag: '4교시: 차트 시각화',
    title: '보고서용 최적 차트 추천 & 직관적인 헤드라인 3선',
    text: `엑셀 차트를 만들어 과제 보고서에 넣으려고 해.
- 데이터: 2023년부터 2026년까지 대학생들이 가장 선호하는 취업 준비 방식 추이 (인턴십, 자격증, 공모전, 어학성적)
- 주요 추세: 어학성적 중요도 응답은 감소하는 반면, 실무 인턴십 경험 선호도가 25%에서 58%로 급증함.

[요청]:
1. 이 데이터를 가장 효과적으로 전달할 수 있는 최적의 차트 유형을 고르고 이유를 설명해줘.
2. 단순히 '취업 준비 방식 추이'라고 쓰지 않고, 데이터의 핵심 메시지가 한눈에 드러나는 설득력 있는 차트 제목 3가지를 추천해줘.`,
    tip: '차트 제목에 단순 항목명 대신 "핵심 발견점(인사이트)"을 적으면 보고서 점수가 2배 올라갑니다.'
  },
  {
    category: 'day2',
    tag: 'PPT 압축 & 스토리보드',
    title: '데이터·보고서 ➔ PPT 3줄 키워드 압축',
    text: '아래 내용을 PPT 슬라이드 1장에 넣을 수 있게 줄여줘. ① 맨 위에 들어갈 핵심 제목 1줄(15자 이내), ② 화면 본문에 들어갈 짧은 키워드 요약 3줄(각 20자 이내), ③ 내가 입으로 설명할 보충 내용은 따로 분리해서 적어줘.',
    tip: '한 슬라이드에는 메시지 1개만 남기고, 긴 설명은 발표자 노트로 분리하세요.'
  },
  {
    category: 'day2',
    tag: '표지 일러스트 생성',
    title: '글자 없는 깔끔한 AI 표지 이미지',
    text: "대학생 발표 PPT 표지에 쓸 깔끔하고 모던한 일러스트 그려줘. 주제는 '[발표 주제]'이고, 흰색 바탕에 차분한 남색(#0e4987) 톤의 미니멀한 플랫 디자인으로 그려줘. 이미지 안에 글자는 절대 넣지 마.",
    tip: 'PowerPoint 홈 > 디자이너와 함께 쓰면 클릭 1번으로 표지 레이아웃이 완성됩니다.'
  },
  {
    category: 'day2',
    tag: '발표 대본 작성',
    title: '1분 300~350자 발표자 노트 구어체 대본',
    text: '아래 PPT 슬라이드 1장 분량에 맞는 발표 대본을 1분 내외(한글 공백 포함 300~350자)로 작성해 줘. 보고서 문어체가 아니라 청중에게 자연스럽게 말하듯 구어체(~했습니다, ~보실 수 있습니다)로 쓰고, 화면 전환 지점은 [클릭], 강조 전 호흡은 [1초 멈춤]으로 표시해 줘.',
    tip: '작성한 대본은 PowerPoint 하단 발표자 노트에 붙여넣고 발표자 도구로 보며 연습하세요.'
  },
  {
    category: 'day2',
    tag: '발표·면접 Q&A 대비',
    title: '교수님·면접관 예상 질문 3선 대비',
    text: '너는 꼼꼼한 대학 교수님(또는 실무 면접관·심사위원)이야. 아래 내 발표 대본과 슬라이드 내용을 보고, 발표가 끝난 뒤 가장 물어보고 싶은 현실적인 질문 3가지를 뽑아줘. 그리고 각 질문에 30초 내외로 깔끔하게 답할 수 있는 모범 답변 예시도 함께 알려줘.',
    tip: '답변 구조: 결론 먼저 → 설문·데이터 근거 1개 → 마무리 순서로 30초 안에 답변하세요.'
  },
  {
    category: 'day3',
    tag: 'PDF 퀴즈 대비',
    title: '강의안 PDF 벼락치기 퀴즈 생성',
    text: '내가 올린 PDF 요약 자료 범위 안에서만 객관식 5문제와 1줄 해설을 출제해 줘. 외부 지식을 섞지 말고, 정답 번호와 내가 올린 자료의 몇 번째 핵심 포인트인지 근거도 함께 적어줘.',
    tip: 'NotebookLM에서는 업로드한 자료 안에서만 근거를 인용하므로 환각(거짓 정보)을 줄일 수 있습니다.'
  },
  {
    category: 'day3',
    tag: '5단 목차 설계',
    title: '빈 화면 탈출! 5단 보고서 목차 생성',
    text: '대학생 리포트 주제 [주제 입력]에 대해 서론 - 본론 1(배경·현황) - 본론 2(설문 데이터 분석) - 본론 3(해결 방안·제언) - 결론의 5단 목차를 짜주고, 각 소제목 아래 내가 채워야 할 핵심 질문 1개씩만 적어줘.',
    tip: 'Deep Research가 자료를 찾는 3~5분 동안 먼저 목차를 설계해 두면 작업 속도가 2배 빨라집니다.'
  },
  {
    category: 'day3',
    tag: '보고서 문체 & 메일',
    title: '보고서 문체 교정 (+비즈니스 메일 응용)',
    text: '아래 내가 쓴 초안의 핵심 의미와 수치는 바꾸지 말고, 대학생 과제 보고서에 어울리는 객관적이고 매끄러운 문체(~다/~이다)로만 다듬어줘. 어색한 표현을 왜 수정했는지도 간단히 알려줘.',
    tip: '예비직장인 응용: "교수님 문의 메일 / 직장 상사 보고 이메일 톤으로 다듬어줘"로 대상만 바꾸어 활용!'
  },
  {
    category: 'day3',
    tag: '팀플 & 실무 회의록',
    title: '조별과제·실무 1분 회의록 정리',
    text: '아래 회의 메모를 정리해줘. 논의 내용을 [핵심 결정사항 / 담당자 / 마감일] 3열 액션아이템 표로 만들고, 아직 결론이 나지 않아 추가 확인이 필요한 항목만 아래에 2줄로 따로 정리해줘.',
    tip: 'Google Docs 문서 탭(Tabs)과 제안 모드를 함께 쓰면 버전 충돌 없이 협업할 수 있습니다.'
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
  const isAuth = typeof window.isMemberAuthenticated === 'function' && window.isMemberAuthenticated();
  if (!isDedicatedDayPage && !isAuth) {
    if (typeof window.renderMemberGateBox === 'function') {
      window.renderMemberGateBox(container, {
        title: '회원가입 및 로그인 후 세부 커리큘럼과 실습 전용 페이지를 확인할 수 있습니다',
        description: '허브 페이지에서 핵심 AI 도구와 과정 개요를 확인하신 뒤, 로그인하시면 전체 세부 교시 내용과 연계 실습 페이지를 이용하실 수 있습니다.',
        buttonLabel: '회원가입 / 로그인하고 커리큘럼 보기',
        theme: 'written'
      });
    }
    return;
  }

  const targetDays = filterDay === 'all'
    ? CURRICULUM_DAYS
    : CURRICULUM_DAYS.filter((d) => d.day === filterDay);

  const courseConfig = typeof window.getCourseAccessConfig === 'function'
    ? window.getCourseAccessConfig()
    : { day1: true, day2: false, day3: false };
  const isAdminUser = typeof window.isAdmin === 'function' && window.isAdmin();

  container.innerHTML = targetDays.map((dayObj) => {
    const isDayOpen = dayObj.day === 'day1' || Boolean(courseConfig[dayObj.day] || isAdminUser);
    const displayLabel = isDayOpen ? dayObj.label.replace(' (준비중)', '') : dayObj.label;
    // 공개 설정 시에는 부가 표시 없이 깨끗하게 노출, 비공개 상태에서 관리자 열람 시에만 관리자전용 배지 표시
    const adminBadge = (isAdminUser && dayObj.day !== 'day1' && !courseConfig[dayObj.day])
      ? `<span style="font-size:11px; font-weight:700; background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:10px; margin-left:6px;"><i class="fas fa-lock"></i> 관리자전용</span>`
      : '';

    return `
    <div style="margin-bottom: 26px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h3 style="font-size: 18px; color: var(--neutral-900); margin: 0; display:flex; align-items:center; gap:8px;">
          ${dayObj.day === 'day1' ? '<i class="fas fa-table" style="color:var(--theme-practical);"></i>' : (dayObj.day === 'day2' ? '<i class="fas fa-desktop" style="color:#2563eb;"></i>' : '<i class="fas fa-file-word" style="color:#4f46e5;"></i>')}
          ${displayLabel} ${adminBadge}
        </h3>
        ${!isDedicatedDayPage && dayObj.detailHref
        ? (!isDayOpen
          ? `<span style="font-size: 12.5px; background: #f1f5f9; color: #64748b; padding: 4px 12px; border-radius: 6px; font-weight: 700; border: 1px solid #e2e8f0;"><i class="fas fa-lock"></i> 과정 준비중</span>`
          : `<a href="${dayObj.detailHref}" class="day-detail-link">세부 실습 페이지 <i class="fas fa-arrow-right"></i></a>`)
        : ''}
      </div>
      <div class="${dayObj.sessions.length === 2 ? 'day-grid day-grid-2col' : 'day-grid'}">
        ${dayObj.sessions.map((s) => `
          <article class="session-card">
            <div class="session-top">
              <span class="session-badge ${dayObj.badgeClass}">${s.period}</span>
              <span class="session-tools">${s.tools}</span>
            </div>
            <h3 title="${s.title}">${s.title}</h3>
            <p class="session-summary" title="${s.summary}">${s.summary}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `;
  }).join('');
}

/**
 * 프롬프트 라이브러리 카드를 렌더링합니다.
 * @param {string} category - 'all' | 'day1' | 'day2' | 'day3'
 */
function renderPrompts(category = 'all') {
  const grid = document.getElementById('promptGrid');
  if (!grid) return;

  const isDedicatedDayPage = Boolean(document.body.dataset.aiDay);
  const isAuth = typeof window.isMemberAuthenticated === 'function' && window.isMemberAuthenticated();
  if (!isDedicatedDayPage && !isAuth) {
    grid.style.display = 'block';
    if (typeof window.renderMemberGateBox === 'function') {
      window.renderMemberGateBox(grid, {
        title: '회원가입 및 로그인 후 실전 AI 프롬프트 12종과 원클릭 복사 기능을 사용할 수 있습니다',
        description: '엑셀 수식 질문, 오류 진단, 보고서 목차·문체 교정, 발표 대본·예상 Q&A 프롬프트 전체를 로그인 후 바로 복사해 사용하세요.',
        buttonLabel: '회원가입 / 로그인하고 프롬프트 복사하기',
        theme: 'written'
      });
    }
    return;
  }

  grid.style.display = '';

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

let activeAiDay = 'all';
let activePromptCat = 'all';

document.addEventListener('DOMContentLoaded', () => {
  const initialDay = getInitialDayFromContext();
  activeAiDay = initialDay;
  activePromptCat = initialDay;

  document.querySelectorAll('.day-tab').forEach((t) => {
    t.classList.toggle('active', t.getAttribute('data-day') === initialDay);
  });
  document.querySelectorAll('.prompt-filter-btn').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-cat') === initialDay);
  });

  renderCurriculum(activeAiDay);
  renderPrompts(activePromptCat);

  const guardTabClick = (msg) => {
    const isDedicatedDayPage = Boolean(document.body.dataset.aiDay);
    const isAuth = typeof window.isMemberAuthenticated === 'function' && window.isMemberAuthenticated();
    if (!isDedicatedDayPage && !isAuth) {
      if (typeof window.requireMemberLogin === 'function') {
        window.requireMemberLogin(msg);
      }
      return false;
    }
    return true;
  };

  document.querySelectorAll('.day-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetDay = tab.getAttribute('data-day') || 'all';
      const courseConfig = typeof window.getCourseAccessConfig === 'function'
        ? window.getCourseAccessConfig()
        : { day1: true, day2: false, day3: false };
      const isAdminUser = typeof window.isAdmin === 'function' && window.isAdmin();

      // 만약 준비중인 탭(비공개 & 비관리자)인 경우 알림 후 리턴
      if (targetDay !== 'all' && targetDay !== 'day1' && !courseConfig[targetDay] && !isAdminUser) {
        const courseName = targetDay === 'day2' ? 'PPT & Slides' : 'Docs & Word';
        if (window.showToast) window.showToast(`${courseName} 과정은 현재 준비 중입니다.`);
        else alert(`${courseName} 과정은 현재 준비 중입니다.`);
        return;
      }

      if (!guardTabClick('🔒 회원가입 및 로그인 후 일차별 세부 커리큘럼 필터를 이용하실 수 있습니다.')) return;
      document.querySelectorAll('.day-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeAiDay = targetDay;
      renderCurriculum(activeAiDay);
    });
  });

  document.querySelectorAll('.prompt-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!guardTabClick('🔒 회원가입 및 로그인 후 프롬프트 라이브러리 필터와 복사 기능을 이용하실 수 있습니다.')) return;
      document.querySelectorAll('.prompt-filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activePromptCat = btn.getAttribute('data-cat') || 'all';
      renderPrompts(activePromptCat);
    });
  });

  window.addEventListener('oaAuthReady', () => {
    renderCurriculum(activeAiDay);
    renderPrompts(activePromptCat);
  });

  window.addEventListener('courseAccessChanged', () => {
    renderCurriculum(activeAiDay);
    if (typeof window.updateAdminCourseAccess === 'function') {
      window.updateAdminCourseAccess();
    }
  });

  // 우측 하단 플로팅 퀵메뉴 초기화
  initQuickNav();
});

/**
 * 우측 하단 고정 AI × OA 퀵메뉴 네비게이션을 생성 및 초기화합니다.
 */
function initQuickNav() {
  if (document.getElementById('quickNavWrapper')) return;

  const quickNav = document.createElement('div');
  quickNav.id = 'quickNavWrapper';
  quickNav.className = 'quick-nav-wrapper';
  quickNav.innerHTML = `
    <div class="quick-nav-panel" id="quickNavPanel" aria-label="AI × OA 필수 서비스 바로가기">
      <div class="quick-nav-panel-head">
        <span class="quick-nav-panel-title"><i class="fas fa-external-link-alt"></i> 서비스 바로가기</span>
        <span class="quick-nav-panel-badge">새 탭 열기</span>
      </div>
      <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" class="quick-nav-link" title="Gemini 바로가기">
        <div class="quick-nav-link-left">
          <span class="quick-nav-icon gemini"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:block;"><path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"/></svg></span>
          <div class="quick-nav-info">
            <span class="quick-nav-name">Gemini</span>
            <span class="quick-nav-sub">Google 대화형 AI</span>
          </div>
        </div>
        <i class="fas fa-arrow-up-right-from-square quick-nav-external"></i>
      </a>
      <a href="https://workspace.google.com/" target="_blank" rel="noopener noreferrer" class="quick-nav-link" title="Google Workspace 바로가기">
        <div class="quick-nav-link-left">
          <span class="quick-nav-icon workspace"><i class="fab fa-google-drive"></i></span>
          <div class="quick-nav-info">
            <span class="quick-nav-name">Google Workspace</span>
            <span class="quick-nav-sub">문서 · 시트 · 드라이브</span>
          </div>
        </div>
        <i class="fas fa-arrow-up-right-from-square quick-nav-external"></i>
      </a>
      <a href="https://notebooklm.google/" target="_blank" rel="noopener noreferrer" class="quick-nav-link" title="NotebookLM 바로가기">
        <div class="quick-nav-link-left">
          <span class="quick-nav-icon notebook"><i class="fas fa-book-open"></i></span>
          <div class="quick-nav-info">
            <span class="quick-nav-name">NotebookLM</span>
            <span class="quick-nav-sub">문서 분석 · 연구 노트</span>
          </div>
        </div>
        <i class="fas fa-arrow-up-right-from-square quick-nav-external"></i>
      </a>
      <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" class="quick-nav-link" title="ChatGPT 바로가기">
        <div class="quick-nav-link-left">
          <span class="quick-nav-icon chatgpt"><i class="fas fa-comments"></i></span>
          <div class="quick-nav-info">
            <span class="quick-nav-name">ChatGPT</span>
            <span class="quick-nav-sub">OpenAI 실무 AI 보조</span>
          </div>
        </div>
        <i class="fas fa-arrow-up-right-from-square quick-nav-external"></i>
      </a>
      <a href="https://www.microsoft365.com/" target="_blank" rel="noopener noreferrer" class="quick-nav-link" title="MS Office 365 바로가기">
        <div class="quick-nav-link-left">
          <span class="quick-nav-icon ms365"><i class="fab fa-microsoft"></i></span>
          <div class="quick-nav-info">
            <span class="quick-nav-name">MS Office 365</span>
            <span class="quick-nav-sub">Excel · PPT · Word</span>
          </div>
        </div>
        <i class="fas fa-arrow-up-right-from-square quick-nav-external"></i>
      </a>
      <a href="https://claude.com/ko/claude-for-microsoft-365" target="_blank" rel="noopener noreferrer" class="quick-nav-link" title="Claude for Microsoft 365 바로가기">
        <div class="quick-nav-link-left">
          <span class="quick-nav-icon claude"><i class="fas fa-brain"></i></span>
          <div class="quick-nav-info">
            <span class="quick-nav-name">Claude for MS 365</span>
            <span class="quick-nav-sub">오피스 연동 AI 에이전트</span>
          </div>
        </div>
        <i class="fas fa-arrow-up-right-from-square quick-nav-external"></i>
      </a>
      <a href="https://workspace.google.com/experiments/?ref=blog.chatdaeri.com&hl=en" target="_blank" rel="noopener noreferrer" class="quick-nav-link" title="구글 워크스페이스 Labs 바로가기">
        <div class="quick-nav-link-left">
          <span class="quick-nav-icon sheets-ai"><i class="fas fa-flask"></i></span>
          <div class="quick-nav-info">
            <span class="quick-nav-name">구글 워크스페이스 Labs</span>
            <span class="quick-nav-sub">시트 AI() 신기능 실험실</span>
          </div>
        </div>
        <i class="fas fa-arrow-up-right-from-square quick-nav-external"></i>
      </a>
      <a href="https://9core1.github.io/AI_literacy/" target="_blank" rel="noopener noreferrer" class="quick-nav-link" title="AI 리터러시 진단 바로가기">
        <div class="quick-nav-link-left">
          <span class="quick-nav-icon literacy"><i class="fas fa-chart-pie"></i></span>
          <div class="quick-nav-info">
            <span class="quick-nav-name">AI 리터러시 진단</span>
            <span class="quick-nav-sub">대학생 5대 역량 진단</span>
          </div>
        </div>
        <i class="fas fa-arrow-up-right-from-square quick-nav-external"></i>
      </a>
    </div>
    <button type="button" class="quick-nav-trigger" id="quickNavTrigger" aria-label="AI·OA 퀵메뉴 열기/닫기" aria-expanded="false">
      <i class="fas fa-layer-group trigger-icon"></i>
      <span>AI · OA 퀵메뉴</span>
      <i class="fas fa-chevron-up toggle-arrow"></i>
    </button>
  `;

  document.body.appendChild(quickNav);

  const trigger = document.getElementById('quickNavTrigger');

  const toggleQuickNav = (forceState) => {
    const isCurrentlyActive = quickNav.classList.contains('active');
    const willBeActive = typeof forceState === 'boolean' ? forceState : !isCurrentlyActive;
    quickNav.classList.toggle('active', willBeActive);
    trigger.setAttribute('aria-expanded', String(willBeActive));
  };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleQuickNav();
  });

  // 바깥 영역 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!quickNav.contains(e.target)) {
      toggleQuickNav(false);
    }
  });

  // ESC 키 누를 때 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quickNav.classList.contains('active')) {
      toggleQuickNav(false);
    }
  });
}

/**
 * 인포그래픽 이미지 라이트박스(크게 보기 모달)를 열고 이미지를 표시합니다.
 * @param {string} src - 원본 이미지 경로
 * @param {string} title - 이미지 제목 또는 설명
 */
function openImageModal(src, title) {
  let modal = document.getElementById('imageZoomModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageZoomModal';
    modal.className = 'image-zoom-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', title || '이미지 확대보기');
    modal.innerHTML = `
      <div class="image-zoom-header">
        <div class="image-zoom-title" id="imageZoomTitle"></div>
        <button type="button" class="image-zoom-close" id="imageZoomClose" aria-label="닫기">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="image-zoom-content" id="imageZoomContainer">
        <img id="imageZoomImg" src="" alt="">
      </div>
    `;
    document.body.appendChild(modal);

    // 모달 배경 및 닫기 버튼 클릭 시 닫기
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'imageZoomContainer') {
        closeImageModal();
      }
    });

    const closeBtn = document.getElementById('imageZoomClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeImageModal);
    }

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeImageModal();
      }
    });
  }

  const imgEl = document.getElementById('imageZoomImg');
  const titleEl = document.getElementById('imageZoomTitle');
  if (imgEl) {
    imgEl.src = src;
    imgEl.alt = title || '확대 이미지';
  }
  if (titleEl) {
    titleEl.innerHTML = `<i class="fas fa-image"></i> ${title || '인포그래픽 확대보기'}`;
  }

  // 표시 애니메이션
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
}

/**
 * 이미지 라이트박스 모달을 닫습니다.
 */
function closeImageModal() {
  const modal = document.getElementById('imageZoomModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// 전역 바인딩
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

/**
 * 프롬프트 템플릿 원클릭 복사 함수
 * @param {HTMLButtonElement} btn 
 */
async function copyPromptText(btn) {
  const box = btn.closest('.prompt-template-card') || btn.closest('.prompt-box');
  if (!box) return;
  const textEl = box.querySelector('.prompt-code-content');
  if (!textEl) return;
  const text = textEl.innerText.trim();

  const originalHtml = btn.innerHTML;
  const showCopied = () => {
    btn.innerHTML = '<i class="fas fa-check" style="color:#ffffff;"></i> 복사 완료!';
    btn.style.background = '#10b981';
    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.style.background = '';
    }, 2000);
  };

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      showCopied();
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopied();
    }
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    alert('프롬프트 복사에 실패했습니다. 직접 복사해주세요.');
  }
}

/**
 * 3초 자가 점검 체크리스트 인터랙티브 토글 함수
 * @param {HTMLElement} el 
 */
function togglePromptCheck(el) {
  const icon = el.querySelector('i');
  const isChecked = el.classList.toggle('checked');
  if (isChecked) {
    if (icon) {
      icon.className = 'fas fa-check-square';
    }
  } else {
    if (icon) {
      icon.className = 'far fa-check-square';
    }
  }
}

/**
 * 5대 안전 유의사항 단일 상세 패널 탭 선택 함수
 * @param {number} idx 1~5 탭 인덱스
 */
function selectSafetyTab(idx) {
  // 1. 모든 탭 카드 active 해제 후 해당 탭에 active 부여
  const tabs = document.querySelectorAll('.safety-tab-card');
  tabs.forEach((tab, i) => {
    const isCurrent = (i + 1 === idx);
    tab.classList.toggle('active', isCurrent);
    tab.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    const indicator = tab.querySelector('.safety-tab-indicator');
    if (indicator) {
      indicator.innerHTML = isCurrent 
        ? '<i class="fas fa-check-circle" style="color:var(--theme-practical);"></i> 선택됨' 
        : '<i class="fas fa-arrow-down"></i> 클릭하여 확인';
    }
  });

  // 2. 모든 상세 패널 숨기고 해당 패널만 표시 (페이드 전환)
  const panels = document.querySelectorAll('.safety-panel-content');
  panels.forEach((panel, i) => {
    panel.classList.toggle('active', (i + 1 === idx));
  });

  // 3. 모바일 환경에서 상세 패널로 부드럽게 스크롤
  if (window.innerWidth < 768) {
    const detailPanel = document.getElementById('safetyDetailPanel');
    if (detailPanel) {
      setTimeout(() => {
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }
}

// 하위 호환
function toggleSafetyAccordion(idx) {
  selectSafetyTab(idx);
}

window.copyPromptText = copyPromptText;
window.togglePromptCheck = togglePromptCheck;
window.selectSafetyTab = selectSafetyTab;
window.toggleSafetyAccordion = toggleSafetyAccordion;



