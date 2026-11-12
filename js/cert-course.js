/**
 * 컴활 자격과정 통합 허브 페이지 인터랙션 모듈
 * - 급수별(2급·1급·시험안내) 커리큘럼 카드 렌더링 및 탭 필터
 * - DB 저장소의 자료·영상 개수를 요약 카드에 반영
 */

const CERT_CURRICULUM_TRACKS = [
  {
    track: 'grade2',
    badgeClass: '',
    label: '컴활 2급 과정 · 입문~합격 (필기 2과목 + 실기 Excel)',
    steps: [
      {
        step: 'STEP 01 · 필기 이론',
        tools: '핵심요약 PDF · 용어 250선',
        title: '2급 필기 핵심 개념 & 기출 용어 정복',
        points: [
          '1과목(컴퓨터 일반)과 2과목(스프레드시트 일반) 출제 빈도 핵심 요약',
          '자주 나오는 단축키·수식 오류 메시지·함수 개념 250선 압축 학습'
        ],
        linkLabel: '필기 자료실 바로가기 (회원 전용)',
        linkHref: 'written_archive.html'
      },
      {
        step: 'STEP 02 · 필기 영상',
        tools: '무료 개념 특강 · 함수 시리즈',
        title: '함수 기초 & 필기 고득점 개념 해설 강의',
        points: [
          '조건부·찾기·텍스트·논리 함수 원리를 예제로 알기 쉽게 정리',
          '시험에 반복 출제되는 절대참조·상대참조·차트 속성 집중 복습'
        ],
        linkLabel: '필기 영상강의 보기 (회원 전용)',
        linkHref: 'written_lectures.html'
      },
      {
        step: 'STEP 03 · 실기 예제',
        tools: '공단 연습문제 · 기본서 섹션 파일',
        title: '2급 실기 4대 작업 유형별 파일 실습',
        points: [
          '기본작업(고급필터·조건부서식) → 계산작업(함수) → 분석작업(피벗·부분합) → 기타작업(매크로·차트)',
          '시나공·대한상공회의소 연습예제 ZIP 내려받아 동일 환경 반복 훈련'
        ],
        linkLabel: '실기 자료실 바로가기 (회원 전용)',
        linkHref: 'practical_archive.html'
      },
      {
        step: 'STEP 04 · 실기 풀이',
        tools: '파트별 영상 · 기출 풀이 시리즈',
        title: '기출문제 타임어택(40분) 완주 실전 영상',
        points: [
          '작업별 배점 구조에 맞춰 감점 없는 실전 풀이 순서 체득',
          '자주 틀리는 매크로 기록·차트 축 서식·계산작업 함수 연계 해설'
        ],
        linkLabel: '실기 영상강의 보기 (회원 전용)',
        linkHref: 'practical_lectures.html'
      }
    ]
  },
  {
    track: 'grade1',
    badgeClass: 'day2',
    label: '컴활 1급 과정 · 심화~실무 (필기 3과목 + 실기 Excel/Access)',
    steps: [
      {
        step: 'STEP 01 · 필기 심화',
        tools: '2025·2026 1급 핵심요약집 PDF',
        title: '1급 필기 3과목(데이터베이스 포함) 통합 정리',
        points: [
          '컴퓨터 일반 + 스프레드시트 + 데이터베이스(SQL·정규화·관계 설정) 개념 압축',
          '2027년 변경사항 및 자격 정보 요약을 함께 점검해 최신 출제 경향 대비'
        ],
        linkLabel: '필기 자료실 1급 요약 보기 (회원 전용)',
        linkHref: 'written_archive.html'
      },
      {
        step: 'STEP 02 · 실기 엑셀',
        tools: '배열수식 · 사용자 정의 함수 · VBA',
        title: '1급 스프레드시트 고난도 수식·프로시저 정복',
        points: [
          'INDEX·MATCH·배열수식(MAX/MIN/COUNT+IF) 등 고배점 계산작업 집중 연습',
          '사용자 정의 함수·폼 프로시저·외부 데이터 가져오기 실전 감각 완성'
        ],
        linkLabel: '실기 자료실 예제 받기 (회원 전용)',
        linkHref: 'practical_archive.html'
      },
      {
        step: 'STEP 03 · 실기 액세스',
        tools: '테이블 · 쿼리 · 폼 · 보고서',
        title: '데이터베이스(Access) 4단계 구조 설계',
        points: [
          '유효성 검사·입력 마스크·조회 속성으로 감점 없는 테이블/관계 구성',
          '매개변수·요약·크로스탭 쿼리 및 폼/보고서 이벤트 프로시저 핵심 패턴 연습'
        ],
        linkLabel: '실기 영상강의 학습하기 (회원 전용)',
        linkHref: 'practical_lectures.html'
      },
      {
        step: 'STEP 04 · AI 실무 확장',
        tools: 'Excel × AI 콜라보 연계',
        title: '자격증 수식을 대학·직장 실무 데이터 분석으로 확장',
        points: [
          '배운 SUMIFS·VLOOKUP·피벗테이블을 Google Forms 설문 분석과 바로 연결',
          '오류(#N/A, #VALUE!) 진단 프롬프트로 실무 파일 문제 해결력 강화'
        ],
        linkLabel: '1일차 Excel × AI 과정 보기',
        linkHref: 'ai_office_day1.html'
      }
    ]
  },
  {
    track: 'exam',
    badgeClass: 'day3',
    label: '시험 안내 · 합격 기준 · 원서 접수 연계',
    steps: [
      {
        step: 'GUIDE 01 · 합격 기준',
        tools: '대한상공회의소 국가기술자격',
        title: '필기 · 실기 과목 구성 및 합격 커트라인',
        points: [
          '필기: 매 과목 100점 만점에 과목당 40점 이상, 전 과목 평균 60점 이상 합격',
          '실기: 1급(스프레드시트·데이터베이스 각 70점 이상), 2급(스프레드시트 70점 이상)'
        ],
        linkLabel: '상공회의소 공식 접수처 확인',
        linkHref: 'recommendations.html?cat=공식 접수처'
      },
      {
        step: 'GUIDE 02 · 응시 전략',
        tools: 'CBT 기출 훈련 + 상시 시험 접수',
        title: '필기 합격 후 실기 집중 단기 합격 전략',
        points: [
          '필기는 요약 PDF + CBT 전자문제집 5개년 회독으로 1~2주 내 빠른 합격 목표',
          '필기 합격 유효기간(2년) 내에 실기 연습예제·풀이 영상을 반복해 동시 합격'
        ],
        linkLabel: '무료 CBT 기출 · 추천 사이트 이동',
        linkHref: 'recommendations.html?cat=무료 기출풀이'
      }
    ]
  }
];

/**
 * 급수·단계별 컴활 커리큘럼 카드를 렌더링합니다.
 * @param {string} filterTrack - 'all' | 'grade2' | 'grade1' | 'exam'
 */
function renderCertCurriculum(filterTrack = 'all') {
  const container = document.getElementById('certCurriculumContainer');
  if (!container) return;

  const targetTracks = filterTrack === 'all'
    ? CERT_CURRICULUM_TRACKS
    : CERT_CURRICULUM_TRACKS.filter((item) => item.track === filterTrack);

  container.innerHTML = targetTracks.map((group) => `
    <div style="margin-bottom: 28px;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--neutral-900); display:flex; align-items:center; gap:10px;">
          <span class="session-badge ${group.badgeClass}">${group.track === 'grade2' ? '2급' : group.track === 'grade1' ? '1급' : '안내'}</span>
          ${group.label}
        </h3>
      </div>
      <div class="day-grid">
        ${group.steps.map((step) => `
          <article class="session-card">
            <div class="session-top">
              <span class="session-badge ${group.badgeClass}">${step.step}</span>
              <span class="session-tools">${step.tools}</span>
            </div>
            <h3>${step.title}</h3>
            <ul class="session-list">
              ${step.points.map((pt) => `<li>• ${pt}</li>`).join('')}
            </ul>
            <div class="session-link-bar">
              <a href="${step.linkHref}">
                <i class="fas fa-arrow-circle-right"></i> ${step.linkLabel}
              </a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * DB 저장소에 등록된 필기/실기 자료 및 영상 개수를 요약 카드에 표시합니다.
 */
function renderModuleCounts() {
  if (!window.DB) return;

  const countMap = [
    { id: 'countWrittenArchive', key: 'written_archive', unit: '개 자료' },
    { id: 'countWrittenVideo', key: 'written_video', unit: '개 강의' },
    { id: 'countPracticalArchive', key: 'practical_archive', unit: '개 예제' },
    { id: 'countPracticalVideo', key: 'practical_video', unit: '개 강의' }
  ];

  countMap.forEach(({ id, key, unit }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const list = window.DB.getAll(key);
    if (Array.isArray(list) && list.length > 0) {
      el.textContent = `등록 ${list.length}${unit}`;
    }
  });
}

/**
 * URL 쿼리(?track=grade2|grade1|exam)에서 초기 트랙 필터를 읽어옵니다.
 * @returns {string} 트랙 식별자 또는 'all'
 */
function getInitialTrackFromQuery() {
  const validTracks = ['grade2', 'grade1', 'exam'];
  const params = new URLSearchParams(window.location.search);
  const trackParam = params.get('track');
  return validTracks.includes(trackParam) ? trackParam : 'all';
}

document.addEventListener('DOMContentLoaded', () => {
  const initialTrack = getInitialTrackFromQuery();
  renderModuleCounts();
  renderCertCurriculum(initialTrack);

  const tabs = document.querySelectorAll('.day-tab[data-track]');
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.track === initialTrack);
    tab.addEventListener('click', () => {
      tabs.forEach((btn) => btn.classList.remove('active'));
      tab.classList.add('active');
      renderCertCurriculum(tab.dataset.track || 'all');
    });
  });
});

