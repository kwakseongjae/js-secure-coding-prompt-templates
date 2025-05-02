# JavaScript Secure Coding Prompt Templates

AI 솔루션을 활용한 안전한 자바스크립트 코딩을 위한 프롬프트 템플릿 모음입니다. 이 템플릿들은 [구글의 프롬프트 엔지니어링 베스트 프랙티스](https://www.kaggle.com/whitepaper-prompt-engineering)와 [자바스크립트 시큐어 코딩 가이드](https://www.kisa.or.kr/2060204/form?postSeq=14&page=1)를 기반으로 작성되었습니다.

## 개요

이 저장소는 다양한 AI 코딩 도구를 활용하여 안전한 자바스크립트 코드를 작성하는 데 도움이 되는 구조화된 프롬프트 템플릿을 제공합니다. 각 템플릿은 보안 취약점을 식별하고, 안전한 대안을 제시하며, 보안 모범 사례를 구현하는 데 중점을 둡니다.

## 템플릿

이 저장소는 세 가지 주요 AI 도구를 위한 템플릿을 포함하고 있습니다:

### 1. Claude JavaScript Secure Coding Template
[Claude](claude-js-security-template.md)를 위한 템플릿으로, 입력 검증, 인증 및 권한 부여, 데이터 보호, 프런트엔드 보안, 종속성 관리와 같은 주요 보안 영역을 포괄합니다. 이 템플릿은 보안 요구 사항을 유지하면서 가독성, 예측 가능성, 응집력, 낮은 결합도와 같은 프런트엔드 디자인 원칙을 적용하는 방법에 대한 지침을 제공합니다.

### 2. GPT JavaScript Secure Coding Template
[GPT](gpt-js-security-template.md)를 위한 템플릿으로, 포괄적인 취약점 평가, 보안 구현 패턴, 아키텍처 및 디자인 보안 개선 사항을 제공합니다. 이 템플릿은 체계적인 응답 형식과 상세한 보안 체크리스트를 포함하여 GPT의 응답이 실용적이고 실행 가능한 보안 권장 사항을 제공하도록 설계되었습니다.

### 3. Cursor JavaScript Secure Coding Template
[Cursor](cursor-js-security-template.md)를 위한 템플릿으로, 코드 주석 형식으로 작성되어 Cursor의 코드 분석 기능과 원활하게 통합됩니다. 이 템플릿은 입력 검증, 인증, 데이터 처리, 종속성 관리, 클라이언트 측 보안, 오류 처리, 보안 테스트와 같은 영역을 다루며 각 영역에 대한 예제와 패턴을 포함합니다.

## 사용 방법

1. GPT 및 Claude 사용 방법:
   - 해당하는 템플릿 파일을 엽니다.
   - 템플릿 내용을 복사합니다.
   - 플레이스홀더 값(${project_type}, ${code} 등)을 실제 프로젝트 정보로 바꿉니다 (바꾸지 않아도 문제는 없습니다).
   - 완성된 프롬프트를 해당 AI 도구에 붙여넣고 응답을 받습니다.

2. Cursor 사용 방법:
   - Cursor 에디터에서 템플릿 파일을 엽니다.
   - 템플릿을 커서 규칙(Cursor Rule)으로 등록합니다:
     - 명령 팔레트(Cmd/Ctrl+Shift+P)를 열고 "Add Rule"을 검색합니다.
     - 템플릿 내용을 규칙으로 붙여넣고 이름을 지정합니다.
   - 코드 작성 시 등록된 규칙을 적용하여 보안 가이드라인에 따라 코딩합니다.

## 템플릿 사용 예시

```javascript
// 보안 분석이 필요한 코드 예시
function processUserInput(input) {
  document.getElementById('output').innerHTML = input;
}

function storeCredentials(user, password) {
  localStorage.setItem('user_creds', JSON.stringify({ user, password }));
}
```

위와 같은 코드를 제공하면 AI 도구는 XSS 취약점과 안전하지 않은 자격 증명 저장 문제를 식별하고, 안전한 대안을 제시합니다.

## 기여하기

이 프롬프트 템플릿을 개선하거나 새로운 AI 도구를 위한 템플릿을 추가하거나, 내용을 수정하고 싶으시다면 언제든지 PR을 보내주세요. 여러분의 모든 기여를 환영합니다!

## 참고 자료

- [Google의 프롬프트 엔지니어링 베스트 프랙티스](https://www.kaggle.com/whitepaper-prompt-engineering)
- [자바스크립트 시큐어 코딩 가이드](https://www.kisa.or.kr/2060204/form?postSeq=14&page=1)

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.