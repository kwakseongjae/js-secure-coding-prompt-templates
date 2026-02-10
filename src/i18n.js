/**
 * Lightweight i18n - zero dependencies
 * Auto-detects system locale, supports --lang flag override
 */

const messages = {
  en: {
    // CLI header
    title: 'Secure Coding Rules - OWASP 2025 Security Rules Generator',
    helpDesc: 'Apply OWASP 2025 JavaScript security rules to your AI coding assistant',

    // Prompts
    selectTool: 'Which AI coding tool do you use?',
    selectFramework: 'What is your primary framework?',
    includeAll: 'Include all OWASP 2025 security categories?',
    selectCategories: 'Select security categories:',
    includeFrontend: 'Include frontend-specific security rules?',
    selectPrompt: 'Select',
    selectAll: 'All',
    selectAllComma: 'comma-separated, e.g. 1,3,5 or 0 for all',
    invalidSelection: 'Invalid selection, defaulting to first option.',
    noValidSelection: 'No valid selection, selecting all.',

    // Status
    projectStatus: 'Project Status:',
    toolsDetected: 'AI tools detected:',
    noToolsFound: 'No AI tool configs found (new setup)',
    frameworkDetected: 'Framework detected:',
    noPackageJson: 'No package.json found (rules will be created in current directory)',
    existingRules: 'Existing rules found - will update security section only.',
    nonInteractive: 'Non-interactive environment detected, using defaults.',
    detected: 'detected',

    // Generation
    loading: 'Loading security templates...',
    loaded: (n) => `Loaded ${n} security rule modules.`,
    noTemplates: 'No templates found. Please check your installation.',
    created: (f) => `Created: ${f}`,
    updated: (f) => `Updated: ${f} (merged with existing content)`,
    generated: (n, d) => `Generated ${n} files in ${d}/`,
    success: 'Security rules generated successfully!',
    reference: 'Based on OWASP Top 10 2025 (https://owasp.org/Top10/2025/)',
    runAgain: 'Run again anytime to update: npx secure-coding-rules',

    // Dry run
    dryRunTitle: 'Dry Run Preview',
    dryRunTool: 'Tool:',
    dryRunFramework: 'Framework:',
    dryRunCategories: 'Categories:',
    dryRunWouldGenerate: (n, d) => `Would generate ${n} files in ${d}/:`,
    dryRunWouldCreate: (f) => `Would create: ${f}`,
    dryRunWouldUpdate: (f) => `Would update: ${f}`,
    dryRunSize: (s) => `Content size: ${s} KB`,
    dryRunApply: 'Run without --dry-run to apply',
  },

  ko: {
    title: 'Secure Coding Rules - OWASP 2025 보안 룰 생성기',
    helpDesc: 'OWASP 2025 기반 JavaScript 보안 코딩 룰을 AI 코딩 어시스턴트에 자동 적용',

    selectTool: '사용 중인 AI 코딩 도구를 선택하세요:',
    selectFramework: '주요 프레임워크를 선택하세요:',
    includeAll: '모든 OWASP 2025 보안 카테고리를 포함할까요?',
    selectCategories: '보안 카테고리를 선택하세요:',
    includeFrontend: '프론트엔드 보안 룰을 포함할까요?',
    selectPrompt: '선택',
    selectAll: '전체',
    selectAllComma: '쉼표로 구분, 예: 1,3,5 또는 0으로 전체 선택',
    invalidSelection: '잘못된 선택입니다. 첫 번째 항목으로 설정합니다.',
    noValidSelection: '유효한 선택 없음. 전체 선택합니다.',

    projectStatus: '프로젝트 상태:',
    toolsDetected: '감지된 AI 도구:',
    noToolsFound: 'AI 도구 설정 없음 (신규 설정)',
    frameworkDetected: '감지된 프레임워크:',
    noPackageJson: 'package.json 없음 (현재 디렉토리에 룰 생성)',
    existingRules: '기존 룰 발견 - 보안 섹션만 업데이트합니다.',
    nonInteractive: '비대화형 환경 감지, 기본값 적용.',
    detected: '감지됨',

    loading: '보안 템플릿 로딩 중...',
    loaded: (n) => `${n}개 보안 룰 모듈 로드 완료.`,
    noTemplates: '템플릿을 찾을 수 없습니다. 설치를 확인해주세요.',
    created: (f) => `생성됨: ${f}`,
    updated: (f) => `업데이트됨: ${f} (기존 내용과 병합)`,
    generated: (n, d) => `${d}/에 ${n}개 파일 생성됨`,
    success: '보안 룰이 성공적으로 생성되었습니다!',
    reference: 'OWASP Top 10 2025 기반 (https://owasp.org/Top10/2025/)',
    runAgain: '업데이트하려면 다시 실행: npx secure-coding-rules',

    dryRunTitle: '미리보기 (Dry Run)',
    dryRunTool: '도구:',
    dryRunFramework: '프레임워크:',
    dryRunCategories: '카테고리:',
    dryRunWouldGenerate: (n, d) => `${d}/에 ${n}개 파일 생성 예정:`,
    dryRunWouldCreate: (f) => `생성 예정: ${f}`,
    dryRunWouldUpdate: (f) => `업데이트 예정: ${f}`,
    dryRunSize: (s) => `콘텐츠 크기: ${s} KB`,
    dryRunApply: '--dry-run 없이 실행하면 적용됩니다',
  },
};

let currentLang = 'en';

/**
 * Detect language from system locale or --lang flag
 */
export function initLang(args = []) {
  // --lang flag takes priority
  const langIdx = args.indexOf('--lang');
  if (langIdx !== -1 && args[langIdx + 1]) {
    const requested = args[langIdx + 1].toLowerCase();
    if (messages[requested]) {
      currentLang = requested;
      return currentLang;
    }
  }

  // Auto-detect from system locale
  const locale = (
    process.env.LANG ||
    process.env.LC_ALL ||
    process.env.LC_MESSAGES ||
    ''
  ).toLowerCase();

  if (locale.startsWith('ko')) {
    currentLang = 'ko';
  } else {
    currentLang = 'en';
  }

  return currentLang;
}

/**
 * Get a translated message
 */
export function t(key, ...args) {
  const msg = messages[currentLang]?.[key] || messages.en[key] || key;
  return typeof msg === 'function' ? msg(...args) : msg;
}

export function getLang() {
  return currentLang;
}

export const supportedLangs = Object.keys(messages);
