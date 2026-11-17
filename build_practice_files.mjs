// 스타일과 서식이 적용된 프리미엄 실습 엑셀 파일(.xlsx) 생성 스크립트
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colToLetter(colNum) {
  let temp = colNum;
  let letter = '';
  while (temp > 0) {
    let mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

/**
 * OpenXML 스타일 및 열 너비가 적용된 .xlsx 생성 함수
 */
function createStyledXlsx(outputPath, sheets, themeColor = '0F766E') {
  const tempDir = path.join(__dirname, `_temp_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  // 1. [Content_Types].xml
  let sheetOverrides = sheets.map((_, i) =>
    `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  ).join('\n  ');

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  ${sheetOverrides}
</Types>`;
  fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), contentTypesXml, 'utf8');

  // 2. _rels/.rels
  fs.mkdirSync(path.join(tempDir, '_rels'), { recursive: true });
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  fs.writeFileSync(path.join(tempDir, '_rels', '.rels'), rootRelsXml, 'utf8');

  // 3. xl 디렉토리 준비
  fs.mkdirSync(path.join(tempDir, 'xl', '_rels'), { recursive: true });
  fs.mkdirSync(path.join(tempDir, 'xl', 'worksheets'), { recursive: true });

  // 4. Shared Strings
  const sharedStrings = [];
  const stringMap = new Map();

  function getStringId(str) {
    const s = String(str);
    if (stringMap.has(s)) {
      return stringMap.get(s);
    }
    const id = sharedStrings.length;
    sharedStrings.push(s);
    stringMap.set(s, id);
    return id;
  }

  // 5. xl/styles.xml 정의
  // xfId 매핑:
  // 0: 기본 (맑은 고딕 10)
  // 1: 대제목 (14pt Bold, 짙은 틸 #0F766E)
  // 2: 부제목/안내문 (10pt, 이탤릭/회색 #64748B)
  // 3: 테이블 메인 헤더 (10.5pt Bold, 흰색 글자, 배경 #0F766E, 가운데 정렬, 테두리)
  // 4: 테이블 서브 헤더 (10pt Bold, #1E293B 글자, 배경 #F1F5F9, 가운데 정렬, 테두리)
  // 5: 데이터 - 일반 텍스트 좌측 정렬 (테두리)
  // 6: 데이터 - 숫자 우측 정렬 (테두리)
  // 7: 데이터 - 코드/날짜/이름 가운데 정렬 (테두리)
  // 8: 데이터 - 합격/수입 강조 (녹색 글자, 연녹색 배경 #DCFCE7, 가운데 정렬, 테두리)
  // 9: 데이터 - 경고/지출 강조 (빨간 글자, 연빨강 배경 #FEE2E2, 가운데 정렬, 테두리)
  // 10: 요약/합계 행 (10pt Bold, 배경 #F0FDFA, 우측 정렬, 테두리)
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="7">
    <font><sz val="10"/><name val="맑은 고딕"/><color rgb="FF1E293B"/></font>
    <font><b/><sz val="14"/><name val="맑은 고딕"/><color rgb="FF${themeColor}"/></font>
    <font><i/><sz val="9.5"/><name val="맑은 고딕"/><color rgb="FF64748B"/></font>
    <font><b/><sz val="10.5"/><name val="맑은 고딕"/><color rgb="FFFFFFFF"/></font>
    <font><b/><sz val="10"/><name val="맑은 고딕"/><color rgb="FF0F172A"/></font>
    <font><b/><sz val="10"/><name val="맑은 고딕"/><color rgb="FF15803D"/></font>
    <font><b/><sz val="10"/><name val="맑은 고딕"/><color rgb="FFB91C1C"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF${themeColor}"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF0FDFA"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="11">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="6" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
  </cellXfs>
</styleSheet>`;
  fs.writeFileSync(path.join(tempDir, 'xl', 'styles.xml'), stylesXml, 'utf8');

  // 6. 시트 XML 생성
  sheets.forEach((sheetObj, sheetIdx) => {
    // 열 너비 태그 생성
    let colsXml = '';
    if (sheetObj.colWidths && sheetObj.colWidths.length > 0) {
      colsXml = '<cols>\n';
      sheetObj.colWidths.forEach((w, cIdx) => {
        colsXml += `    <col min="${cIdx + 1}" max="${cIdx + 1}" width="${w}" customWidth="1"/>\n`;
      });
      colsXml += '  </cols>';
    }

    let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews>
    <sheetView tabSelected="${sheetIdx === 0 ? '1' : '0'}" workbookViewId="0">
      <pane state="frozen" topLeftCell="A1"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="22"/>
  ${colsXml}
  <sheetData>`;

    sheetObj.rows.forEach((row, rowIdx) => {
      const rowNum = rowIdx + 1;
      let rowCellsXml = '';
      let rowHeight = 22;

      // row 전체에 스타일 규칙이 있는 경우 또는 셀별 객체 파싱
      row.forEach((cellItem, colIdx) => {
        const colLetter = colToLetter(colIdx + 1);
        const cellRef = `${colLetter}${rowNum}`;

        let cellVal = cellItem;
        let styleId = 0; // 기본 스타일

        if (cellItem && typeof cellItem === 'object' && cellItem.v !== undefined) {
          cellVal = cellItem.v;
          styleId = cellItem.s || 0;
        }

        if (cellVal === null || cellVal === undefined || cellVal === '') {
          if (styleId > 0) {
            rowCellsXml += `<c r="${cellRef}" s="${styleId}"/>`;
          }
        } else if (typeof cellVal === 'number') {
          const sAttr = styleId ? ` s="${styleId}"` : ' s="6"';
          rowCellsXml += `<c r="${cellRef}"${sAttr}><v>${cellVal}</v></c>`;
        } else if (typeof cellVal === 'string' && cellVal.startsWith('=')) {
          const formula = escapeXml(cellVal.substring(1));
          const sAttr = styleId ? ` s="${styleId}"` : ' s="6"';
          rowCellsXml += `<c r="${cellRef}"${sAttr}><f>${formula}</f></c>`;
        } else {
          const strId = getStringId(cellVal);
          const sAttr = styleId ? ` s="${styleId}"` : '';
          rowCellsXml += `<c r="${cellRef}" t="s"${sAttr}><v>${strId}</v></c>`;
        }
      });

      if (rowIdx === 0) rowHeight = 32;
      else if (row.some(c => c && c.s === 3)) rowHeight = 26;

      if (rowCellsXml) {
        sheetXml += `\n    <row r="${rowNum}" ht="${rowHeight}" customHeight="1">${rowCellsXml}</row>`;
      }
    });

    sheetXml += `\n  </sheetData>
</worksheet>`;
    fs.writeFileSync(path.join(tempDir, 'xl', 'worksheets', `sheet${sheetIdx + 1}.xml`), sheetXml, 'utf8');
  });

  // 7. xl/sharedStrings.xml
  const sstItems = sharedStrings.map((s) => `<si><t>${escapeXml(s)}</t></si>`).join('\n  ');
  const sharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">
  ${sstItems}
</sst>`;
  fs.writeFileSync(path.join(tempDir, 'xl', 'sharedStrings.xml'), sharedStringsXml, 'utf8');

  // 8. xl/workbook.xml
  const sheetsXml = sheets.map((s, i) =>
    `<sheet name="${escapeXml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
  ).join('\n    ');

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${sheetsXml}
  </sheets>
</workbook>`;
  fs.writeFileSync(path.join(tempDir, 'xl', 'workbook.xml'), workbookXml, 'utf8');

  // 9. xl/_rels/workbook.xml.rels
  let wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdSst" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`;

  sheets.forEach((_, i) => {
    wbRelsXml += `\n  <Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`;
  });
  wbRelsXml += `\n</Relationships>`;
  fs.writeFileSync(path.join(tempDir, 'xl', '_rels', 'workbook.xml.rels'), wbRelsXml, 'utf8');

  // 10. PowerShell ZipFile로 압축
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  const psScript = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${tempDir.replace(/'/g, "''")}', '${outputPath.replace(/'/g, "''")}')`;
  execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript}"`);

  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`[스타일 적용 완료] ${path.basename(outputPath)} (${fs.statSync(outputPath).size} bytes)`);
}

// ==========================================
// 파일 1: 01_성적_출결_평가표_실습.xlsx (서식 적용)
// ==========================================
const file1ColWidths = [14, 12, 16, 14, 14, 14, 16, 18, 5, 12, 10];

const file1Sheet1Rows = [
  [{ v: '📊 [1교시 실습] 대학생 출결 및 중간/기말 성적 평가표', s: 1 }],
  [{ v: '※ 실습 목표: AI에게 3단 공식으로 질문하여 F열 총점, G열 등급, H열 상태판정 수식을 완성하세요.', s: 2 }],
  [],
  [
    { v: '학번', s: 3 }, { v: '성명', s: 3 }, { v: '출석(15회 만점)', s: 3 },
    { v: '중간고사(100점)', s: 3 }, { v: '기말고사(100점)', s: 3 }, { v: '총점(수식)', s: 3 },
    { v: '등급(XLOOKUP/IF)', s: 3 }, { v: '상태판정(IF+OR)', s: 3 },
    '',
    { v: '등급 기준표', s: 4 }, { v: '', s: 4 }
  ],
  [
    { v: '20260101', s: 7 }, { v: '김철수', s: 7 }, { v: 15, s: 6 }, { v: 92, s: 6 }, { v: 88, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 },
    '',
    { v: '기준점수', s: 4 }, { v: '등급', s: 4 }
  ],
  [
    { v: '20260102', s: 7 }, { v: '이영희', s: 7 }, { v: 14, s: 6 }, { v: 85, s: 78 }, { v: 78, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 },
    '',
    { v: 0, s: 6 }, { v: 'F', s: 7 }
  ],
  [
    { v: '20260103', s: 7 }, { v: '박민수', s: 7 }, { v: 8, s: 6 }, { v: 55, s: 6 }, { v: 60, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 },
    '',
    { v: 70, s: 6 }, { v: 'C', s: 7 }
  ],
  [
    { v: '20260104', s: 7 }, { v: '최지은', s: 7 }, { v: 15, s: 6 }, { v: 95, s: 6 }, { v: 98, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 },
    '',
    { v: 80, s: 6 }, { v: 'B', s: 7 }
  ],
  [
    { v: '20260105', s: 7 }, { v: '정재훈', s: 7 }, { v: 13, s: 6 }, { v: 72, s: 6 }, { v: 70, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 },
    '',
    { v: 90, s: 6 }, { v: 'A', s: 7 }
  ],
  [
    { v: '20260106', s: 7 }, { v: '강수진', s: 7 }, { v: 15, s: 6 }, { v: 88, s: 6 }, { v: 92, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260107', s: 7 }, { v: '윤도현', s: 7 }, { v: 9, s: 6 }, { v: 65, s: 6 }, { v: 58, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260108', s: 7 }, { v: '한승우', s: 7 }, { v: 14, s: 6 }, { v: 82, s: 6 }, { v: 85, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260109', s: 7 }, { v: '조유리', s: 7 }, { v: 15, s: 6 }, { v: 90, s: 6 }, { v: 94, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260110', s: 7 }, { v: '임하늘', s: 7 }, { v: 12, s: 6 }, { v: 68, s: 6 }, { v: 62, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260111', s: 7 }, { v: '송태섭', s: 7 }, { v: 15, s: 6 }, { v: 78, s: 6 }, { v: 80, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260112', s: 7 }, { v: '서태웅', s: 7 }, { v: 14, s: 6 }, { v: 94, s: 6 }, { v: 96, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260113', s: 7 }, { v: '채치수', s: 7 }, { v: 15, s: 6 }, { v: 85, s: 6 }, { v: 88, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260114', s: 7 }, { v: '강백호', s: 7 }, { v: 7, s: 6 }, { v: 50, s: 6 }, { v: 52, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [
    { v: '20260115', s: 7 }, { v: '정대만', s: 7 }, { v: 15, s: 6 }, { v: 88, s: 6 }, { v: 86, s: 6 },
    { v: '', s: 5 }, { v: '', s: 5 }, { v: '', s: 5 }
  ],
  [],
  [{ v: '💡 [실습 가이드 안내]', s: 1 }],
  [{ v: '1. 총점 공식: 중간 40% + 기말 40% + 출석(C행/15*20) 환산 총점 (F열)', s: 5 }],
  [{ v: '2. 등급 공식: 총점 기준 90점 이상 A, 80점 이상 B, 70점 이상 C, 미만 F (G열)', s: 5 }],
  [{ v: '3. 상태 판정: 출석이 10회 미만이거나 총점이 60점 미만이면 "면담대상", 아니면 "정상" (H열)', s: 5 }]
];

const file1Sheet2Rows = [
  [{ v: '🏆 [1교시 완성본] 성적 평가표 모범 정답 수식', s: 1 }],
  [],
  [
    { v: '학번', s: 3 }, { v: '성명', s: 3 }, { v: '출석일수', s: 3 },
    { v: '중간고사', s: 3 }, { v: '기말고사', s: 3 }, { v: '총점(수식)', s: 3 },
    { v: '등급(IF)', s: 3 }, { v: '상태판정(IF+OR)', s: 3 }
  ],
  [
    { v: '20260101', s: 7 }, { v: '김철수', s: 7 }, { v: 15, s: 6 }, { v: 92, s: 6 }, { v: 88, s: 6 },
    { v: '=(D4*0.4)+(E4*0.4)+(C4/15*20)', s: 6 },
    { v: '=IF(F4>=90,"A",IF(F4>=80,"B",IF(F4>=70,"C","F")))', s: 8 },
    { v: '=IF(OR(C4<10,F4<60),"면담대상","정상")', s: 8 }
  ],
  [
    { v: '20260102', s: 7 }, { v: '이영희', s: 7 }, { v: 14, s: 6 }, { v: 85, s: 6 }, { v: 78, s: 6 },
    { v: '=(D5*0.4)+(E5*0.4)+(C5/15*20)', s: 6 },
    { v: '=IF(F5>=90,"A",IF(F5>=80,"B",IF(F5>=70,"C","F")))', s: 8 },
    { v: '=IF(OR(C5<10,F5<60),"면담대상","정상")', s: 8 }
  ],
  [
    { v: '20260103', s: 7 }, { v: '박민수', s: 7 }, { v: 8, s: 6 }, { v: 55, s: 6 }, { v: 60, s: 6 },
    { v: '=(D6*0.4)+(E6*0.4)+(C6/15*20)', s: 6 },
    { v: '=IF(F6>=90,"A",IF(F6>=80,"B",IF(F6>=70,"C","F")))', s: 9 },
    { v: '=IF(OR(C6<10,F6<60),"면담대상","정상")', s: 9 }
  ],
  [
    { v: '20260104', s: 7 }, { v: '최지은', s: 7 }, { v: 15, s: 6 }, { v: 95, s: 6 }, { v: 98, s: 6 },
    { v: '=(D7*0.4)+(E7*0.4)+(C7/15*20)', s: 6 },
    { v: '=IF(F7>=90,"A",IF(F7>=80,"B",IF(F7>=70,"C","F")))', s: 8 },
    { v: '=IF(OR(C7<10,F7<60),"면담대상","정상")', s: 8 }
  ],
  [
    { v: '20260105', s: 7 }, { v: '정재훈', s: 7 }, { v: 13, s: 6 }, { v: 72, s: 6 }, { v: 70, s: 6 },
    { v: '=(D8*0.4)+(E8*0.4)+(C8/15*20)', s: 6 },
    { v: '=IF(F8>=90,"A",IF(F8>=80,"B",IF(F8>=70,"C","F")))', s: 8 },
    { v: '=IF(OR(C8<10,F8<60),"면담대상","정상")', s: 8 }
  ]
];

const file1Sheets = [
  { name: '성적출결_실습', colWidths: file1ColWidths, rows: file1Sheet1Rows },
  { name: '정답_완성본', colWidths: file1ColWidths.slice(0, 8), rows: file1Sheet2Rows }
];

// ==========================================
// 파일 2: 02_동아리_회비_및_과제관리_실습.xlsx (서식 적용)
// ==========================================
const file2ColWidths1 = [65];
const file2ColWidths2 = [12, 16, 22, 16, 26];
const file2ColWidths3 = [14, 38, 14, 16, 14, 12];

const file2Sheets = [
  {
    name: '단톡방_비정형_메모',
    colWidths: file2ColWidths1,
    rows: [
      [{ v: '💬 [2교시 실습 1] 단톡방 공지 줄글 텍스트 원본', s: 1 }],
      [{ v: '※ 아래 내용을 드래그해 복사한 뒤, AI에게 [구분, 날짜, 항목, 금액, 비고] 표 변환을 요청하세요.', s: 2 }],
      [],
      [{ v: '[동아리 3월 정산 및 입출금 내역]', s: 4 }],
      [{ v: '3/2 김민준 회비 입금 20,000원', s: 5 }],
      [{ v: '3/3 OT 장소 대관료 지출 85,000원 (영수증 처리: 이서연)', s: 5 }],
      [{ v: '3/5 박도윤 회비 입금 20000원 (지각비 2000원 포함해서 22,000원 입금됨)', s: 5 }],
      [{ v: '3/7 다과 구매 (다이소) 14,300원 영수증 확인완료', s: 5 }],
      [{ v: '3/8 최유진 회비 20,000 납부완료', s: 5 }],
      [{ v: '3/10 신입생 환영회 식대 지출 150,000원 (총무 김철수 결제)', s: 5 }],
      [{ v: '3/12 이지호 회비 20,000원', s: 5 }],
      [{ v: '3/15 스터디룸 예약비 지출 36,000원', s: 5 }],
      [{ v: '3/18 장원영 회비 20,000원 입금', s: 5 }],
      [{ v: '3/20 인쇄비 지출 8,500원 (컬러 유인물 10부)', s: 5 }]
    ]
  },
  {
    name: '회비정산_DB_실습',
    colWidths: file2ColWidths2,
    rows: [
      [{ v: '💰 [2교시 실습 2] 정제된 회비 정산 DB 표', s: 1 }],
      [{ v: '※ AI 변환 결과를 붙여넣고 빠른 채우기(Ctrl+E)로 숫자만 추출하세요.', s: 2 }],
      [],
      [
        { v: '구분', s: 3 }, { v: '날짜', s: 3 }, { v: '항목', s: 3 },
        { v: '금액(숫자만)', s: 3 }, { v: '비고', s: 3 }
      ],
      [{ v: '수입', s: 8 }, { v: '2026-03-02', s: 7 }, { v: '회비', s: 5 }, { v: 20000, s: 6 }, { v: '김민준', s: 5 }],
      [{ v: '지출', s: 9 }, { v: '2026-03-03', s: 7 }, { v: 'OT장소대관료', s: 5 }, { v: 85000, s: 6 }, { v: '영수증: 이서연', s: 5 }],
      [{ v: '수입', s: 8 }, { v: '2026-03-05', s: 7 }, { v: '회비/지각비', s: 5 }, { v: 22000, s: 6 }, { v: '박도윤(지각비포함)', s: 5 }],
      [{ v: '지출', s: 9 }, { v: '2026-03-07', s: 7 }, { v: '다과구매', s: 5 }, { v: 14300, s: 6 }, { v: '다이소', s: 5 }],
      [{ v: '수입', s: 8 }, { v: '2026-03-08', s: 7 }, { v: '회비', s: 5 }, { v: 20000, s: 6 }, { v: '최유진', s: 5 }],
      [{ v: '지출', s: 9 }, { v: '2026-03-10', s: 7 }, { v: '신입생환영회식대', s: 5 }, { v: 150000, s: 6 }, { v: '총무 김철수 결제', s: 5 }],
      [{ v: '수입', s: 8 }, { v: '2026-03-12', s: 7 }, { v: '회비', s: 5 }, { v: 20000, s: 6 }, { v: '이지호', s: 5 }],
      [{ v: '지출', s: 9 }, { v: '2026-03-15', s: 7 }, { v: '스터디룸예약비', s: 5 }, { v: 36000, s: 6 }, { v: '', s: 5 }],
      [{ v: '수입', s: 8 }, { v: '2026-03-18', s: 7 }, { v: '회비', s: 5 }, { v: 20000, s: 6 }, { v: '장원영', s: 5 }],
      [{ v: '지출', s: 9 }, { v: '2026-03-20', s: 7 }, { v: '인쇄비', s: 5 }, { v: 8500, s: 6 }, { v: '컬러 유인물 10부', s: 5 }],
      [],
      [{ v: '총 수입 합계', s: 10 }, '', '', { v: '=SUMIF(A5:A14,"수입",D5:D14)', s: 10 }, ''],
      [{ v: '총 지출 합계', s: 10 }, '', '', { v: '=SUMIF(A5:A14,"지출",D5:D14)', s: 10 }, ''],
      [{ v: '현재 잔액', s: 10 }, '', '', { v: '=D16-D17', s: 10 }, '']
    ]
  },
  {
    name: '조별과제_태스크_관리대장',
    colWidths: file2ColWidths3,
    rows: [
      [{ v: '📋 [2교시 실습 3] 조별과제 태스크 관리대장', s: 1 }],
      [{ v: '※ 구글 시트에서는 A열에 [삽입 > 체크박스] 적용 후 맞춤 수식 "=$A5=TRUE" 서식을 지정하세요.', s: 2 }],
      [],
      [
        { v: '완료여부', s: 3 }, { v: '태스크명', s: 3 }, { v: '담당자', s: 3 },
        { v: '마감일', s: 3 }, { v: '진행상태', s: 3 }, { v: '우선순위', s: 3 }
      ],
      [{ v: 'TRUE', s: 8 }, { v: '과제 주제 선정 및 리서치 방향 회의', s: 5 }, { v: '김철수', s: 7 }, { v: '2026-04-05', s: 7 }, { v: '완료', s: 8 }, { v: '높음', s: 9 }],
      [{ v: 'FALSE', s: 7 }, { v: 'Google Forms 설문지 문항 기획 (10문항)', s: 5 }, { v: '이영희', s: 7 }, { v: '2026-04-08', s: 7 }, { v: '진행중', s: 7 }, { v: '높음', s: 9 }],
      [{ v: 'FALSE', s: 7 }, { v: '교내 단톡방 및 에브리타임 설문 배포 (100명 목표)', s: 5 }, { v: '박민수', s: 7 }, { v: '2026-04-12', s: 7 }, { v: '대기', s: 7 }, { v: '중간', s: 7 }],
      [{ v: 'FALSE', s: 7 }, { v: '설문 응답 시트 데이터 정제 및 PII 마스킹', s: 5 }, { v: '최지은', s: 7 }, { v: '2026-04-15', s: 7 }, { v: '대기', s: 7 }, { v: '높음', s: 9 }],
      [{ v: 'FALSE', s: 7 }, { v: 'ChatGPT 활용 설문 통계 교차 분석 & 3줄 인사이트 도출', s: 5 }, { v: '김철수', s: 7 }, { v: '2026-04-18', s: 7 }, { v: '대기', s: 7 }, { v: '높음', s: 9 }],
      [{ v: 'FALSE', s: 7 }, { v: 'Excel 피벗 테이블 요약표 및 비교 차트 2종 작성', s: 5 }, { v: '이영희', s: 7 }, { v: '2026-04-20', s: 7 }, { v: '대기', s: 7 }, { v: '중간', s: 7 }],
      [{ v: 'FALSE', s: 7 }, { v: '최종 1-Page 대시보드 인쇄 맞춤 및 PDF 보고서 제출', s: 5 }, { v: '전원', s: 7 }, { v: '2026-04-22', s: 7 }, { v: '대기', s: 7 }, { v: '높음', s: 9 }]
    ]
  }
];

// ==========================================
// 파일 3: 03_대학생_AI활용_설문결과_실습.xlsx (서식 적용)
// ==========================================
const file3ColWidths1 = [20, 12, 24, 14, 12, 14, 16, 22, 38, 16];
const file3ColWidths2 = [12, 12, 14, 16, 22, 38, 16];
const file3ColWidths3 = [20, 20, 16, 16, 16];

const file3Sheets = [
  {
    name: '설문응답_마스킹실습',
    colWidths: file3ColWidths1,
    rows: [
      [{ v: '🛡️ [3교시 실습 1] 원본 설문 응답 (🚨 B~D열 개인정보 PII를 삭제하세요!)', s: 1 }],
      [{ v: '※ 타임스탬프, 이름, 이메일, 학번 열을 통째로 삭제하거나 익명 ID로 대체해야 안전합니다.', s: 2 }],
      [],
      [
        { v: '타임스탬프', s: 4 }, { v: '응답자이름', s: 4 }, { v: '학교이메일', s: 4 }, { v: '학번', s: 4 },
        { v: '학년', s: 3 }, { v: '전공계열', s: 3 }, { v: 'AI_활용빈도', s: 3 },
        { v: '주요_활용목적', s: 3 }, { v: '가장큰_어려움(주관식)', s: 3 }, { v: '만족도(5점)', s: 3 }
      ],
      [{ v: '2026-03-15 14:02:11', s: 7 }, { v: '홍길동', s: 7 }, { v: 'gildong@univ.ac.kr', s: 5 }, { v: '20231234', s: 7 }, { v: '2학년', s: 7 }, { v: '인문사회', s: 7 }, { v: '주 3~4회', s: 5 }, { v: '과제 자료 리서치', s: 5 }, { v: '원하는 답변이 한 번에 안 나오고 엉뚱한 말을 함', s: 5 }, { v: 4, s: 6 }],
      [{ v: '2026-03-15 14:05:22', s: 7 }, { v: '김영수', s: 7 }, { v: 'youngsoo@univ.ac.kr', s: 5 }, { v: '20215678', s: 7 }, { v: '4학년', s: 7 }, { v: '공학계열', s: 7 }, { v: '매일 사용', s: 5 }, { v: '코딩 및 디버깅', s: 5 }, { v: '무료 버전은 사용량 제한이 있어서 아쉬움', s: 5 }, { v: 5, s: 6 }],
      [{ v: '2026-03-15 14:12:05', s: 7 }, { v: '이진아', s: 7 }, { v: 'jina@univ.ac.kr', s: 5 }, { v: '20249876', s: 7 }, { v: '1학년', s: 7 }, { v: '자연과학', s: 7 }, { v: '주 1~2회', s: 5 }, { v: '영어 논문 번역', s: 5 }, { v: '출처가 불분명해서 리포트에 인용하기 겁남', s: 5 }, { v: 3, s: 6 }],
      [{ v: '2026-03-15 14:18:40', s: 7 }, { v: '박세진', s: 7 }, { v: 'sejin@univ.ac.kr', s: 5 }, { v: '20223456', s: 7 }, { v: '3학년', s: 7 }, { v: '예체능', s: 7 }, { v: '거의 안 씀', s: 5 }, { v: '아이디어 브레인스토밍', s: 5 }, { v: '프롬프트를 어떻게 써야 할지 모르겠음', s: 5 }, { v: 2, s: 6 }],
      [{ v: '2026-03-15 14:22:15', s: 7 }, { v: '최동훈', s: 7 }, { v: 'donghoon@univ.ac.kr', s: 5 }, { v: '20218765', s: 7 }, { v: '4학년', s: 7 }, { v: '인문사회', s: 7 }, { v: '주 5회 이상', s: 5 }, { v: '리포트 초안 작성', s: 5 }, { v: '교수님이 AI 사용을 엄격히 검사해서 표절 시비 불안', s: 5 }, { v: 4, s: 6 }]
    ]
  },
  {
    name: '정제된_익명_설문데이터',
    colWidths: file3ColWidths2,
    rows: [
      [{ v: '✅ [3교시 실습 2] 개인정보가 안전하게 삭제된 분석용 익명 설문 데이터 (AI 업로드 가능)', s: 1 }],
      [{ v: '※ 이 표의 데이터 범위를 복사하여 ChatGPT나 Gemini에 전달하고 통계 분석을 요청하세요.', s: 2 }],
      [],
      [
        { v: '응답자ID', s: 3 }, { v: '학년', s: 3 }, { v: '전공계열', s: 3 },
        { v: 'AI_활용빈도', s: 3 }, { v: '주요_활용목적', s: 3 }, { v: '가장큰_어려움(주관식)', s: 3 }, { v: '학업도움만족도(5점)', s: 3 }
      ],
      [{ v: 'U001', s: 7 }, { v: '2학년', s: 7 }, { v: '인문사회', s: 7 }, { v: '주 3~4회', s: 5 }, { v: '과제 자료 리서치', s: 5 }, { v: '원하는 답변이 한 번에 안 나오고 엉뚱한 말을 함', s: 5 }, { v: 4, s: 6 }],
      [{ v: 'U002', s: 7 }, { v: '4학년', s: 7 }, { v: '공학계열', s: 7 }, { v: '매일 사용', s: 5 }, { v: '코딩 및 디버깅', s: 5 }, { v: '무료 버전은 사용량 제한이 있어서 아쉬움', s: 5 }, { v: 5, s: 6 }],
      [{ v: 'U003', s: 7 }, { v: '1학년', s: 7 }, { v: '자연과학', s: 7 }, { v: '주 1~2회', s: 5 }, { v: '영어 논문 번역', s: 5 }, { v: '출처가 불분명해서 리포트에 인용하기 겁남', s: 5 }, { v: 3, s: 6 }],
      [{ v: 'U004', s: 7 }, { v: '3학년', s: 7 }, { v: '예체능', s: 7 }, { v: '거의 안 씀', s: 5 }, { v: '아이디어 브레인스토밍', s: 5 }, { v: '프롬프트를 어떻게 써야 할지 모르겠음', s: 5 }, { v: 2, s: 6 }],
      [{ v: 'U005', s: 7 }, { v: '4학년', s: 7 }, { v: '인문사회', s: 7 }, { v: '주 5회 이상', s: 5 }, { v: '리포트 초안 작성', s: 5 }, { v: '교수님이 AI 사용을 엄격히 검사해서 표절 시비 불안', s: 5 }, { v: 4, s: 6 }],
      [{ v: 'U006', s: 7 }, { v: '2학년', s: 7 }, { v: '공학계열', s: 7 }, { v: '주 3~4회', s: 5 }, { v: '코딩 및 수식 해결', s: 5 }, { v: '할루시네이션(환각) 거짓 정보 필터링이 어려움', s: 5 }, { v: 4, s: 6 }],
      [{ v: 'U007', s: 7 }, { v: '3학년', s: 7 }, { v: '경영경제', s: 7 }, { v: '주 5회 이상', s: 5 }, { v: '과제 자료 리서치', s: 5 }, { v: '원하는 통계 수치를 최신 데이터로 안 줌', s: 5 }, { v: 4, s: 6 }],
      [{ v: 'U008', s: 7 }, { v: '1학년', s: 7 }, { v: '인문사회', s: 7 }, { v: '주 1~2회', s: 5 }, { v: '어학 학습 및 번역', s: 5 }, { v: '자연스러운 한국어 학술 문체로 다듬기 힘듦', s: 5 }, { v: 3, s: 6 }],
      [{ v: 'U009', s: 7 }, { v: '4학년', s: 7 }, { v: '공학계열', s: 7 }, { v: '매일 사용', s: 5 }, { v: '코딩 및 디버깅', s: 5 }, { v: 'API 연동이나 심화 기능 학습 자료 부족', s: 5 }, { v: 5, s: 6 }],
      [{ v: 'U010', s: 7 }, { v: '2학년', s: 7 }, { v: '사범계열', s: 7 }, { v: '주 3~4회', s: 5 }, { v: '발표 슬라이드 기획', s: 5 }, { v: '질문하는 법(프롬프트)에 따라 답이 너무 달라짐', s: 5 }, { v: 4, s: 6 }]
    ]
  },
  {
    name: 'AI분석용_요약통계',
    colWidths: file3ColWidths3,
    rows: [
      [{ v: '📊 [3교시 실습 3] AI에게 전달할 1차 요약 통계 테이블 및 AI 도출 리포트 문단 샘플', s: 1 }],
      [],
      [{ v: '[표 1] 학년별 AI 활용 빈도 분포 요약', s: 4 }, '', '', '', ''],
      [
        { v: '학년', s: 3 }, { v: '주 5회 이상/매일', s: 3 }, { v: '주 3~4회', s: 3 },
        { v: '주 1~2회', s: 3 }, { v: '미사용/거의안씀', s: 3 }
      ],
      [{ v: '저학년(1~2학년)', s: 5 }, { v: 1, s: 6 }, { v: 3, s: 6 }, { v: 2, s: 6 }, { v: 0, s: 6 }],
      [{ v: '고학년(3~4학년)', s: 5 }, { v: 3, s: 6 }, { v: 0, s: 6 }, { v: 0, s: 6 }, { v: 1, s: 6 }],
      [],
      [{ v: '[표 2] 주관식 애로사항 키워드 빈도', s: 4 }, '', ''],
      [{ v: '애로사항 유형', s: 3 }, { v: '응답 수', s: 3 }, { v: '비율(%)', s: 3 }],
      [{ v: '할루시네이션 및 출처 불분명', s: 5 }, { v: 4, s: 6 }, { v: '40%', s: 7 }],
      [{ v: '프롬프트 작성 미숙', s: 5 }, { v: 3, s: 6 }, { v: '30%', s: 7 }],
      [{ v: '표절 및 윤리 가이드라인 불안', s: 5 }, { v: 2, s: 6 }, { v: '20%', s: 7 }],
      [{ v: '무료 버전 사용량 제한', s: 5 }, { v: 1, s: 6 }, { v: '10%', s: 7 }],
      [],
      [{ v: '📝 [AI 도출 과제 제출용 결론 문단 샘플]', s: 1 }],
      [{ v: '"본 설문 조사 결과, 대학생의 70%가 주 3회 이상 생성형 AI를 학업에 적극 활용하고 있었으며, 주된 용도는 자료 리서치와 보고서 초안 작성이었다. 반면 애로사항에서는 할루시네이션(40%)과 프롬프트 작성 미숙(30%)이 가장 높게 나타나, 대학 차원의 신뢰성 검증 교육 및 효과적인 AI 활용 가이드라인 제공이 시급함을 시사한다."', s: 5 }]
    ]
  }
];

// ==========================================
// 파일 4: 04_피벗_차트_1Page_대시보드_실습.xlsx (서식 적용)
// ==========================================
const file4ColWidths1 = [12, 16, 12, 18, 20, 16, 12];
const file4ColWidths2 = [60];
const file4ColWidths3 = [16, 12, 12, 12, 12, 12];

const file4Sheets = [
  {
    name: '분석데이터',
    colWidths: file4ColWidths1,
    rows: [
      [{ v: '📈 [4교시 실습 1] 취업 및 AI 활용 설문 원시 데이터 (피벗 테이블 원본 범위)', s: 1 }],
      [],
      [
        { v: '학생ID', s: 3 }, { v: '단과대학', s: 3 }, { v: '학년', s: 3 },
        { v: '선호취업분야', s: 3 }, { v: 'AI일일사용시간(분)', s: 3 },
        { v: '컴활취득여부', s: 3 }, { v: '학점평균', s: 3 }
      ],
      [{ v: 'S001', s: 7 }, { v: '인문대학', s: 7 }, { v: '2학년', s: 7 }, { v: '공기업', s: 5 }, { v: 45, s: 6 }, { v: '취득완료', s: 8 }, { v: 3.85, s: 6 }],
      [{ v: 'S002', s: 7 }, { v: '공과대학', s: 7 }, { v: '4학년', s: 7 }, { v: '대기업', s: 5 }, { v: 90, s: 6 }, { v: '취득완료', s: 8 }, { v: 4.12, s: 6 }],
      [{ v: 'S003', s: 7 }, { v: '사회과학대학', s: 7 }, { v: '3학년', s: 7 }, { v: '스타트업', s: 5 }, { v: 60, s: 6 }, { v: '미취득', s: 9 }, { v: 3.55, s: 6 }],
      [{ v: 'S004', s: 7 }, { v: '자연과학대학', s: 7 }, { v: '1학년', s: 7 }, { v: '대학원', s: 5 }, { v: 30, s: 6 }, { v: '미취득', s: 9 }, { v: 3.70, s: 6 }],
      [{ v: 'S005', s: 7 }, { v: '경영대학', s: 7 }, { v: '4학년', s: 7 }, { v: '대기업', s: 5 }, { v: 80, s: 6 }, { v: '취득완료', s: 8 }, { v: 4.05, s: 6 }],
      [{ v: 'S006', s: 7 }, { v: '공과대학', s: 7 }, { v: '3학년', s: 7 }, { v: '대기업', s: 5 }, { v: 120, s: 6 }, { v: '취득완료', s: 8 }, { v: 3.92, s: 6 }],
      [{ v: 'S007', s: 7 }, { v: '인문대학', s: 7 }, { v: '4학년', s: 7 }, { v: '공기업', s: 5 }, { v: 50, s: 6 }, { v: '취득완료', s: 8 }, { v: 3.78, s: 6 }],
      [{ v: 'S008', s: 7 }, { v: '사회과학대학', s: 7 }, { v: '2학년', s: 7 }, { v: '공기업', s: 5 }, { v: 40, s: 6 }, { v: '미취득', s: 9 }, { v: 3.45, s: 6 }],
      [{ v: 'S009', s: 7 }, { v: '경영대학', s: 7 }, { v: '3학년', s: 7 }, { v: '스타트업', s: 5 }, { v: 75, s: 6 }, { v: '취득완료', s: 8 }, { v: 3.65, s: 6 }],
      [{ v: 'S010', s: 7 }, { v: '공과대학', s: 7 }, { v: '4학년', s: 7 }, { v: '대기업', s: 5 }, { v: 100, s: 6 }, { v: '취득완료', s: 8 }, { v: 4.20, s: 6 }],
      [{ v: 'S011', s: 7 }, { v: '자연과학대학', s: 7 }, { v: '2학년', s: 7 }, { v: '대학원', s: 5 }, { v: 45, s: 6 }, { v: '미취득', s: 9 }, { v: 3.88, s: 6 }],
      [{ v: 'S012', s: 7 }, { v: '인문대학', s: 7 }, { v: '3학년', s: 7 }, { v: '공기업', s: 5 }, { v: 55, s: 6 }, { v: '취득완료', s: 8 }, { v: 3.60, s: 6 }],
      [{ v: 'S013', s: 7 }, { v: '경영대학', s: 7 }, { v: '4학년', s: 7 }, { v: '대기업', s: 5 }, { v: 85, s: 6 }, { v: '취득완료', s: 8 }, { v: 3.95, s: 6 }],
      [{ v: 'S014', s: 7 }, { v: '공과대학', s: 7 }, { v: '2학년', s: 7 }, { v: '스타트업', s: 5 }, { v: 70, s: 6 }, { v: '미취득', s: 9 }, { v: 3.50, s: 6 }],
      [{ v: 'S015', s: 7 }, { v: '사회과학대학', s: 7 }, { v: '4학년', s: 7 }, { v: '공기업', s: 5 }, { v: 60, s: 6 }, { v: '취득완료', s: 8 }, { v: 3.82, s: 6 }]
    ]
  },
  {
    name: '피벗_차트_실습캔버스',
    colWidths: file4ColWidths2,
    rows: [
      [{ v: '📊 [4교시 실습 2] 피벗 테이블 및 차트 작성 캔버스', s: 1 }],
      [{ v: '※ 아래 가이드에 따라 [분석데이터] 시트에서 피벗 테이블을 삽입하세요.', s: 2 }],
      [],
      [{ v: '1. [분석데이터] 시트에서 [삽입 > 피벗 테이블]을 클릭하세요.', s: 5 }],
      [{ v: '2. 행: [단과대학], 열: [선호취업분야], 값: [학생ID(개수)]를 배치하세요.', s: 5 }],
      [{ v: '3. 피벗 테이블을 선택하고 [피벗 차트 > 묶은 세로 막대형]을 삽입하세요.', s: 5 }],
      [{ v: '4. 페이지 레이아웃에서 [가로 방향] + [한 페이지에 모든 열 맞추기]로 1페이지 인쇄 세팅을 완성하세요.', s: 5 }]
    ]
  },
  {
    name: '1Page_대시보드_완성본',
    colWidths: file4ColWidths3,
    rows: [
      [{ v: '📄 [4교시 완성본] 2026학년도 단과대학별 선호 취업분야 및 AI 활용 현황 대시보드', s: 1 }],
      [{ v: '(인쇄 설정: 가로 방향 · 한 페이지에 모든 열 맞추기 · 여백 좁게 설정 완료본)', s: 2 }],
      [],
      [{ v: '[피벗 집계표] 단과대학 × 선호 취업분야 교차 분석', s: 4 }, '', '', '', '', ''],
      [
        { v: '단과대학', s: 3 }, { v: '공기업', s: 3 }, { v: '대기업', s: 3 },
        { v: '스타트업', s: 3 }, { v: '대학원', s: 3 }, { v: '총합계', s: 3 }
      ],
      [{ v: '경영대학', s: 5 }, { v: 0, s: 6 }, { v: 2, s: 6 }, { v: 1, s: 6 }, { v: 0, s: 6 }, { v: 3, s: 10 }],
      [{ v: '공과대학', s: 5 }, { v: 0, s: 6 }, { v: 3, s: 6 }, { v: 1, s: 6 }, { v: 0, s: 6 }, { v: 4, s: 10 }],
      [{ v: '사회과학대학', s: 5 }, { v: 2, s: 6 }, { v: 0, s: 6 }, { v: 1, s: 6 }, { v: 0, s: 6 }, { v: 3, s: 10 }],
      [{ v: '자연과학대학', s: 5 }, { v: 0, s: 6 }, { v: 0, s: 6 }, { v: 0, s: 6 }, { v: 2, s: 6 }, { v: 2, s: 10 }],
      [{ v: '인문대학', s: 5 }, { v: 2, s: 6 }, { v: 0, s: 6 }, { v: 0, s: 6 }, { v: 0, s: 6 }, { v: 2, s: 10 }],
      [{ v: '총합계', s: 4 }, { v: 4, s: 10 }, { v: 5, s: 10 }, { v: 3, s: 10 }, { v: 2, s: 10 }, { v: 14, s: 10 }],
      [],
      [{ v: '💡 [AI 분석 인사이트 요약 3선]', s: 1 }],
      [{ v: '1. 공과대학 및 경영대학 고학년의 경우 대기업 선호도(71%)가 압도적으로 높게 나타남.', s: 5 }],
      [{ v: '2. 인문대학 및 사회과학대학 학생들은 안정적인 공기업 선호 경향(67%)이 뚜렷함.', s: 5 }],
      [{ v: '3. 컴활 취득 완료자의 AI 일일 사용 시간(평균 78분)이 미취득자(평균 44분) 대비 1.7배 높아 실무 디지털 툴 적극성 입증.', s: 5 }]
    ]
  }
];

const files = [
  { path: path.join(__dirname, '01_성적_출결_평가표_실습.xlsx'), sheets: file1Sheets },
  { path: path.join(__dirname, '02_동아리_회비_및_과제관리_실습.xlsx'), sheets: file2Sheets },
  { path: path.join(__dirname, '03_대학생_AI활용_설문결과_실습.xlsx'), sheets: file3Sheets },
  { path: path.join(__dirname, '04_피벗_차트_1Page_대시보드_실습.xlsx'), sheets: file4Sheets }
];

console.log('=== 스타일 및 서식이 적용된 실습 엑셀 파일 생성 시작 ===');
files.forEach((f) => createStyledXlsx(f.path, f.sheets));
console.log('=== 모든 실습 파일 서식 적용 완료 ===');
