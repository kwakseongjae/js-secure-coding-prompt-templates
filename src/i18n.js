/**
 * Lightweight i18n - zero dependencies
 * Auto-detects system locale, supports --lang flag override
 * Supported: en, ko, ja, zh
 */

const messages = {
  en: {
    title: 'Secure Coding Rules - OWASP 2025 Security Rules Generator',
    helpDesc: 'Apply OWASP 2025 JavaScript security rules to your AI coding assistant',

    selectTool: 'Which AI coding tool do you use?',
    selectTools: 'Which AI coding tools do you use?',
    selectFramework: 'What is your primary framework?',
    includeAll: 'Include all OWASP 2025 security categories?',
    selectCategories: 'Select security categories:',
    includeFrontend: 'Include frontend-specific security rules?',
    selectPrompt: 'Select',
    selectAll: 'All',
    selectAllComma: 'comma-separated, e.g. 1,3,5 or 0 for all',
    invalidSelection: 'Invalid selection, defaulting to first option.',
    noValidSelection: 'No valid selection, selecting all.',
    selectOutputMode: 'Where should security rules be placed?',
    outputInline: 'Inline (embed in main file)',
    outputDirectory: 'Directory (separate rule files + reference in main file)',

    projectStatus: 'Project Status:',
    toolsDetected: 'AI tools detected:',
    noToolsFound: 'No AI tool configs found (new setup)',
    frameworkDetected: 'Framework detected:',
    noPackageJson: 'No package.json found (rules will be created in current directory)',
    existingRules: 'Existing rules found - will update security section only.',
    nonInteractive: 'Non-interactive environment detected, using defaults.',
    detected: 'detected',

    loading: 'Loading security templates...',
    loaded: (n) => `Loaded ${n} security rule modules.`,
    noTemplates: 'No templates found. Please check your installation.',
    created: (f) => `Created: ${f}`,
    updated: (f) => `Updated: ${f} (merged with existing content)`,
    generated: (n, d) => `Generated ${n} files in ${d}/`,
    generatingFor: (tool) => `Generating for ${tool}...`,
    refUpdated: (f) => `Updated: ${f} (added rules directory reference)`,
    refCreated: (f) => `Created: ${f} (rules directory reference)`,
    success: 'Security rules generated successfully!',
    reference: 'Based on OWASP Top 10 2025 (https://owasp.org/Top10/2025/)',
    runAgain: 'Run again anytime to update: npx secure-coding-rules',

    removedMarkers: (f) => `Cleaned security section from ${f}`,
    removedFile: (f) => `Removed ${f} (was security-only)`,
    removedDir: (n, d) => `Removed ${n} security rule files from ${d}/`,
    noRulesFound: 'No security rules found to remove.',
    removeSuccess: 'All security rules removed.',

    dryRunTitle: 'Dry Run Preview',
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
    selectTools: '사용할 AI 코딩 도구를 선택하세요:',
    selectFramework: '주요 프레임워크를 선택하세요:',
    includeAll: '모든 OWASP 2025 보안 카테고리를 포함할까요?',
    selectCategories: '보안 카테고리를 선택하세요:',
    includeFrontend: '프론트엔드 보안 룰을 포함할까요?',
    selectPrompt: '선택',
    selectAll: '전체',
    selectAllComma: '쉼표로 구분, 예: 1,3,5 또는 0으로 전체 선택',
    invalidSelection: '잘못된 선택입니다. 첫 번째 항목으로 설정합니다.',
    noValidSelection: '유효한 선택 없음. 전체 선택합니다.',
    selectOutputMode: '보안 룰을 어디에 배치할까요?',
    outputInline: '인라인 (메인 파일에 직접 삽입)',
    outputDirectory: '디렉토리 (룰 파일 분리 + 메인 파일에 참조)',

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
    generatingFor: (tool) => `${tool} 생성 중...`,
    refUpdated: (f) => `업데이트됨: ${f} (룰 디렉토리 참조 추가)`,
    refCreated: (f) => `생성됨: ${f} (룰 디렉토리 참조)`,
    success: '보안 룰이 성공적으로 생성되었습니다!',
    reference: 'OWASP Top 10 2025 기반 (https://owasp.org/Top10/2025/)',
    runAgain: '업데이트하려면 다시 실행: npx secure-coding-rules',

    removedMarkers: (f) => `${f}에서 보안 섹션 제거됨`,
    removedFile: (f) => `${f} 삭제됨 (보안 전용 파일)`,
    removedDir: (n, d) => `${d}/에서 보안 룰 파일 ${n}개 삭제됨`,
    noRulesFound: '제거할 보안 룰이 없습니다.',
    removeSuccess: '모든 보안 룰이 제거되었습니다.',

    dryRunTitle: '미리보기 (Dry Run)',
    dryRunFramework: '프레임워크:',
    dryRunCategories: '카테고리:',
    dryRunWouldGenerate: (n, d) => `${d}/에 ${n}개 파일 생성 예정:`,
    dryRunWouldCreate: (f) => `생성 예정: ${f}`,
    dryRunWouldUpdate: (f) => `업데이트 예정: ${f}`,
    dryRunSize: (s) => `콘텐츠 크기: ${s} KB`,
    dryRunApply: '--dry-run 없이 실행하면 적용됩니다',
  },

  ja: {
    title: 'Secure Coding Rules - OWASP 2025 セキュリティルール生成ツール',
    helpDesc: 'OWASP 2025準拠のJavaScriptセキュリティルールをAIコーディングアシスタントに自動適用',

    selectTools: '使用するAIコーディングツールを選択してください:',
    selectFramework: 'メインフレームワークを選択してください:',
    includeAll: 'すべてのOWASP 2025セキュリティカテゴリを含めますか？',
    selectCategories: 'セキュリティカテゴリを選択:',
    includeFrontend: 'フロントエンドセキュリティルールを含めますか？',
    selectPrompt: '選択',
    selectAll: 'すべて',
    selectAllComma: 'カンマ区切り、例: 1,3,5 または 0で全選択',
    invalidSelection: '無効な選択です。最初のオプションを使用します。',
    noValidSelection: '有効な選択がありません。すべて選択します。',
    selectOutputMode: 'セキュリティルールの配置先は？',
    outputInline: 'インライン（メインファイルに直接埋め込み）',
    outputDirectory: 'ディレクトリ（ルールファイル分離＋メインファイルに参照）',

    projectStatus: 'プロジェクト状態:',
    toolsDetected: '検出されたAIツール:',
    noToolsFound: 'AIツール設定なし（新規セットアップ）',
    frameworkDetected: '検出されたフレームワーク:',
    noPackageJson: 'package.jsonなし（カレントディレクトリにルール作成）',
    existingRules: '既存ルール検出 - セキュリティセクションのみ更新します。',
    nonInteractive: '非対話環境を検出、デフォルト値を適用。',
    detected: '検出済み',

    loading: 'セキュリティテンプレートを読み込み中...',
    loaded: (n) => `${n}個のセキュリティルールモジュールを読み込みました。`,
    noTemplates: 'テンプレートが見つかりません。インストールを確認してください。',
    created: (f) => `作成: ${f}`,
    updated: (f) => `更新: ${f}（既存コンテンツとマージ）`,
    generated: (n, d) => `${d}/に${n}個のファイルを生成`,
    generatingFor: (tool) => `${tool}を生成中...`,
    refUpdated: (f) => `更新: ${f}（ルールディレクトリ参照を追加）`,
    refCreated: (f) => `作成: ${f}（ルールディレクトリ参照）`,
    success: 'セキュリティルールが正常に生成されました！',
    reference: 'OWASP Top 10 2025準拠 (https://owasp.org/Top10/2025/)',
    runAgain: '更新するには再実行: npx secure-coding-rules',

    removedMarkers: (f) => `${f}からセキュリティセクションを削除`,
    removedFile: (f) => `${f}を削除（セキュリティ専用ファイル）`,
    removedDir: (n, d) => `${d}/から${n}個のセキュリティルールファイルを削除`,
    noRulesFound: '削除するセキュリティルールが見つかりません。',
    removeSuccess: 'すべてのセキュリティルールを削除しました。',

    dryRunTitle: 'プレビュー (Dry Run)',
    dryRunFramework: 'フレームワーク:',
    dryRunCategories: 'カテゴリ:',
    dryRunWouldGenerate: (n, d) => `${d}/に${n}個のファイルを生成予定:`,
    dryRunWouldCreate: (f) => `作成予定: ${f}`,
    dryRunWouldUpdate: (f) => `更新予定: ${f}`,
    dryRunSize: (s) => `コンテンツサイズ: ${s} KB`,
    dryRunApply: '--dry-runなしで実行すると適用されます',
  },

  zh: {
    title: 'Secure Coding Rules - OWASP 2025 安全规则生成器',
    helpDesc: '将OWASP 2025 JavaScript安全编码规则自动应用到AI编码助手',

    selectTools: '请选择使用的AI编码工具:',
    selectFramework: '请选择主要框架:',
    includeAll: '是否包含所有OWASP 2025安全类别？',
    selectCategories: '选择安全类别:',
    includeFrontend: '是否包含前端安全规则？',
    selectPrompt: '选择',
    selectAll: '全部',
    selectAllComma: '逗号分隔，例: 1,3,5 或 0选择全部',
    invalidSelection: '无效选择，使用第一个选项。',
    noValidSelection: '无有效选择，选择全部。',
    selectOutputMode: '安全规则放置在哪里？',
    outputInline: '内联（嵌入主文件）',
    outputDirectory: '目录（规则文件分离 + 主文件中引用）',

    projectStatus: '项目状态:',
    toolsDetected: '检测到的AI工具:',
    noToolsFound: '未找到AI工具配置（新设置）',
    frameworkDetected: '检测到的框架:',
    noPackageJson: '未找到package.json（将在当前目录创建规则）',
    existingRules: '发现现有规则 - 仅更新安全部分。',
    nonInteractive: '检测到非交互环境，使用默认值。',
    detected: '已检测',

    loading: '正在加载安全模板...',
    loaded: (n) => `已加载 ${n} 个安全规则模块。`,
    noTemplates: '未找到模板。请检查安装。',
    created: (f) => `已创建: ${f}`,
    updated: (f) => `已更新: ${f}（与现有内容合并）`,
    generated: (n, d) => `在 ${d}/ 中生成了 ${n} 个文件`,
    generatingFor: (tool) => `正在为 ${tool} 生成...`,
    refUpdated: (f) => `已更新: ${f}（添加了规则目录引用）`,
    refCreated: (f) => `已创建: ${f}（规则目录引用）`,
    success: '安全规则生成成功！',
    reference: '基于 OWASP Top 10 2025 (https://owasp.org/Top10/2025/)',
    runAgain: '随时再次运行以更新: npx secure-coding-rules',

    removedMarkers: (f) => `已从 ${f} 中清除安全部分`,
    removedFile: (f) => `已删除 ${f}（仅含安全内容）`,
    removedDir: (n, d) => `已从 ${d}/ 中删除 ${n} 个安全规则文件`,
    noRulesFound: '未找到可删除的安全规则。',
    removeSuccess: '所有安全规则已删除。',

    dryRunTitle: '预览 (Dry Run)',
    dryRunFramework: '框架:',
    dryRunCategories: '类别:',
    dryRunWouldGenerate: (n, d) => `将在 ${d}/ 中生成 ${n} 个文件:`,
    dryRunWouldCreate: (f) => `将创建: ${f}`,
    dryRunWouldUpdate: (f) => `将更新: ${f}`,
    dryRunSize: (s) => `内容大小: ${s} KB`,
    dryRunApply: '不加 --dry-run 运行以应用',
  },
};

let currentLang = 'en';

export function initLang(args = []) {
  const langIdx = args.indexOf('--lang');
  if (langIdx !== -1 && args[langIdx + 1]) {
    const requested = args[langIdx + 1].toLowerCase();
    if (messages[requested]) {
      currentLang = requested;
      return currentLang;
    }
  }

  const locale = (
    process.env.LANG ||
    process.env.LC_ALL ||
    process.env.LC_MESSAGES ||
    ''
  ).toLowerCase();

  if (locale.startsWith('ko')) currentLang = 'ko';
  else if (locale.startsWith('ja')) currentLang = 'ja';
  else if (locale.startsWith('zh')) currentLang = 'zh';
  else currentLang = 'en';

  return currentLang;
}

export function t(key, ...args) {
  const msg = messages[currentLang]?.[key] || messages.en[key] || key;
  return typeof msg === 'function' ? msg(...args) : msg;
}

export function getLang() {
  return currentLang;
}

export const supportedLangs = Object.keys(messages);
