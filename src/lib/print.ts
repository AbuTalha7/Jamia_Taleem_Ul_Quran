/**
 * Opens a new window with the given HTML and triggers window.print().
 */
export function printHTML(html: string, title = 'Print') {
  const w = window.open('', '_blank', 'width=960,height=720');
  if (!w) {
    alert('Please allow pop-ups to print.');
    return;
  }
  const language = getPrintLanguage();
  const direction = language === 'ur' ? 'rtl' : 'ltr';
  const localizedHtml = html.replace(
    /<html(?![^>]*\bdir=)/i,
    `<html lang="${language}" dir="${direction}"`,
  );
  const logoSrc = `${import.meta.env.BASE_URL}logo.jpeg`;
  const watermark = `<div class="print-watermark" aria-hidden="true"><img src="${logoSrc}" alt="" /></div>`;
  const printableHtml = localizedHtml.replace(/<body([^>]*)>/i, `<body$1>${watermark}`);
  w.document.write(printableHtml);
  w.document.close();
  w.document.title = title;
  w.focus();
  setTimeout(() => {
    w.print();
  }, 600);
}

/** Shared CSS injected into every print window — includes Jameel Noori Nastaleeq / Noto Nastaliq Urdu */
export const PRINT_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');

    @font-face {
      font-family: 'Jameel Noori Nastaleeq';
      src: local('Jameel Noori Nastaleeq'),
           local('JameelNooriNastaleeq');
      font-weight: normal;
      font-style: normal;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      position: relative;
      font-family: 'Amiri', Georgia, serif;
      color: #1a1a2e;
      font-size: 13px;
      background: #fff;
      padding: 16px;
    }
    .print-watermark {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 0;
    }
    .print-watermark img {
      width: min(58vw, 360px);
      max-height: 58vh;
      object-fit: contain;
      opacity: 0.075;
      filter: grayscale(1);
    }
    body > *:not(.print-watermark) {
      position: relative;
      z-index: 1;
    }

    /* Urdu text rendering — Jameel Noori Nastaleeq first, then Noto Nastaliq Urdu as web fallback */
    .urdu, [lang="ur"], .urdu-text, [dir="rtl"] .urdu-content {
      font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Amiri', serif;
      direction: rtl;
      unicode-bidi: embed;
      line-height: 2.4;
      letter-spacing: 0;
    }

    /* Full RTL page support */
    html[dir="rtl"] body,
    body.rtl {
      font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Amiri', serif;
      direction: rtl;
      line-height: 2.2;
    }

    h1, h2, h3 { font-family: 'Amiri', Georgia, serif; }

    /* ── Institution Header ──────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px double #1C2E6B;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .header-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .header-text { flex: 1; text-align: center; }
    .header-text h1 {
      color: #1C2E6B;
      font-size: 22px;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .header-text .urdu-name {
      font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif;
      color: #1C2E6B;
      font-size: 20px;
      line-height: 2.4;
      direction: rtl;
      display: block;
    }
    .header-text .contact {
      font-size: 11px;
      color: #555;
      margin-top: 4px;
    }
    .session-badge {
      display: inline-block;
      background: #1C2E6B;
      color: #fff;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 11px;
      margin-top: 4px;
    }

    /* ── A4 Table Layout ─────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      font-size: 12px;
      table-layout: auto;
    }
    th {
      background: #1C2E6B;
      color: #fff;
      padding: 9px 10px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    [dir="rtl"] th { text-align: right; }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #d4d4e0;
      font-size: 12px;
      vertical-align: middle;
    }
    tr:nth-child(even) td { background: #f5f5fb; }
    tr:last-child td { border-bottom: none; }

    /* ── Slip / Receipt ──────────────────────────────── */
    .slip {
      width: 420px;
      border: 2px solid #1C2E6B;
      border-radius: 10px;
      padding: 22px 26px;
      margin: 0 auto;
    }
    .slip h2 {
      text-align: center;
      font-size: 16px;
      color: #1C2E6B;
      margin-bottom: 14px;
      border-bottom: 1px dashed #1C2E6B;
      padding-bottom: 8px;
    }
    .slip-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 7px 0;
      border-bottom: 1px dashed #d4d4e0;
      font-size: 13px;
      gap: 8px;
    }
    .slip-row:last-child { border-bottom: none; }
    .slip-label { color: #444; font-weight: 700; min-width: 120px; flex-shrink: 0; }
    .slip-value { color: #1a1a2e; text-align: right; }
    .slip-value.urdu {
      font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif;
      font-size: 15px;
      line-height: 2.2;
    }

    .badge {
      display: inline-block;
      background: #1C2E6B;
      color: #fff;
      border-radius: 4px;
      padding: 2px 10px;
      font-size: 12px;
    }
    .badge-paid    { background: #1a7a45; }
    .badge-pending { background: #b85c00; }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1C2E6B;
      margin: 16px 0 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #1C2E6B;
    }

    .result-heading {
      text-align: center;
      margin: 8px 0 14px;
    }
    .result-heading h2 {
      color: #1C2E6B;
      font-size: 18px;
      margin-bottom: 5px;
    }
    .result-meta {
      font-size: 12px;
      color: #444;
    }
    .class-result-table {
      font-size: 10px;
      margin-top: 0;
    }
    .class-result-table th,
    .class-result-table td {
      border: 1px solid #aeb3c2;
      padding: 5px 4px;
      text-align: center;
      white-space: nowrap;
    }
    .class-result-table th:nth-child(3),
    .class-result-table td:nth-child(3) {
      text-align: left;
      min-width: 130px;
    }
    .class-result-table th small {
      font-size: 8px;
      font-weight: 400;
    }
    .summary-title {
      display: inline-block;
      border: 1px solid #aeb3c2;
      border-bottom: 0;
      padding: 5px 10px;
      margin-top: 18px;
      font-size: 13px;
      font-weight: 700;
    }
    .summary-table {
      width: auto;
      min-width: 560px;
      margin-top: 0;
    }
    .summary-table th,
    .summary-table td {
      border: 1px solid #aeb3c2;
      padding: 5px 14px;
      text-align: center;
    }
    .fail-grade {
      background: #ffd9d9 !important;
      color: #b42318 !important;
      font-weight: 700;
    }

    .footer-note {
      text-align: center;
      color: #888;
      font-size: 11px;
      margin-top: 24px;
      border-top: 1px solid #d4d4e0;
      padding-top: 10px;
    }
    @media print {
      body { padding: 0; }
      .print-watermark img { opacity: 0.075; }
      .print-watermark { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .footer-note { position: fixed; bottom: 0; width: 100%; }
    }
  </style>
`;

/** Build institution header HTML, optionally showing academic session */
export function institutionHeader(sessionName?: string, language: 'en' | 'ur' = getPrintLanguage()) {
  let profile = {
    nameEn: 'Jamia Taleem-ul-Quran Lil-Banat',
    nameUr: 'جامعہ تعلیم القرآن للبنات',
    phone: '+92 312 5654118',
    address: 'Peshawar, Pakistan',
  };
  try {
    const saved = JSON.parse(localStorage.getItem('jamia_portal_v2') || '{}');
    if (saved.institutionProfile) profile = { ...profile, ...saved.institutionProfile };
  } catch { /* use defaults when storage is unavailable */ }
  const isUrdu = language === 'ur';
  const sessionLine = sessionName
    ? `<div><span class="session-badge">${isUrdu ? 'تعلیمی سال: ' : 'Academic Session: '}${sessionName}</span></div>`
    : '';
  const logoSrc = `${import.meta.env.BASE_URL}logo.jpeg`;
  return `
    <div class="header">
      <img class="header-logo" src="${logoSrc}" alt="Jamia Taleem-ul-Quran logo" />
      <div class="header-text">
        <h1>${isUrdu ? profile.nameUr : profile.nameEn}</h1>
        <span class="urdu-name">${profile.nameUr}</span>
        <div class="contact">${profile.address} &nbsp;|&nbsp; ${profile.phone}</div>
        ${sessionLine}
      </div>
    </div>
  `;
}

function getPrintLanguage(): 'en' | 'ur' {
  try {
    const saved = JSON.parse(localStorage.getItem('jamia_portal_v2') || '{}');
    return saved.language === 'ur' ? 'ur' : 'en';
  } catch {
    return 'en';
  }
}
