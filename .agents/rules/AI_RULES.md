---
description: 
---

# AI Agent Rule Set (team2-ieum 프로젝트)

> **AI 에이전트를 위한 지침서입니다.** 
> 에이전트는 새로운 대화 세션이 시작될 때 혹은 명시적인 요청이 있을 때 이 문서를 최우선으로 분석하고, 아래의 룰과 컨텍스트에 맞추어 작업을 수행해야 합니다.

## 1. 프로젝트 개요 (Context)
* **프로젝트명**: 이음 (ieum) - 전국 지역 축제 정보 제공 플랫폼
* **주요 목표**: 전국 축제 정보를 제공하고, 사용자간 커뮤니티 기능을 통해 소통을 돕는 웹 애플리케이션 개발
* **언어 및 소통**: AI 에이전트는 사용자와 **한국어(Korean)**로 소통하며, 친절하고 직관적인 설명을 제공해야 합니다.

## 2. 기술 스택 (Tech Stack)
### Frontend
* **Framework**: Next.js 16.x (App Router 기반)
* **Library**: React 19.x
* **Language**: TypeScript
* **State Management**: Zustand
* **Data Fetching/HTTP**: Axios
* **Session Management**: iron-session
* **Styling**: (프로젝트 내 설정된 CSS 방식 유지, 예: Vanilla CSS / Tailwind 등)
* **Icons**: lucide-react

### Backend (참고)
* Java/Spring Boot 기반의 REST API 환경 (예상) 및 PostgreSQL (DB)
* API 응답 및 요청 형식은 `docs/api_spec` 문서를 따릅니다.

## 3. 코드 작성 규칙 (Coding Conventions for AI)
1. **TypeScript 최우선**: 모든 새로운 파일과 컴포넌트는 `.ts` 또는 `.tsx` 로 작성하며, `any` 타입의 사용을 지양하고 명확한 타입을 정의합니다.
2. **Next.js App Router 최적화**: 
   - 서버 컴포넌트(Server Component)와 클라이언트 컴포넌트(`"use client"`)를 명확히 구분하여 작성합니다.
   - 데이터 패칭은 가능한 한 서버 컴포넌트에서 수행하여 성능을 최적화합니다.
3. **가독성과 모듈화**: 코드는 목적에 맞게 작게 분리하며, 재사용성을 고려해 컴포넌트와 유틸리티 함수를 캡슐화합니다.
4. **의존성(패키지) 추가 주의**: 새로운 `npm` 라이브러리가 필요한 경우, 무단으로 설치하지 않고 사전에 사용자에게 도입 필요성을 설명하고 허락을 구합니다.
5. **기존 코드 보호**: 리팩토링이나 기능 추가 시 기존 기능(로직)이 손상되지 않도록 유의합니다. 전체 코드를 다시 작성(Overwrite)하기보단 필요한 부분만 정확히 수정(Partial Modification)합니다.

## 4. 문제 해결 및 답변 가이드 (Response Guideline)
* **코드 제시 전 생각 파악 (Reasoning)**: 코드를 바로 작성하기 전에 문제를 어떻게 해결할 것인지 짧게 요약(계획)하여 설명합니다.
* **디버깅**: 에러가 발생했을 때, 추측에 의존하지 않고 에러 로그의 원인을 정확히 파악하여 근본적인 해결책을 제시합니다.
* **불필요한 코드 생략 지양**: 수정해야 할 코드 블럭을 제공할 때 가급적 생략(`// ...`)을 줄여, 사용자가 그대로 복사/붙여넣기 하기 편하도록 돕습니다. 단, 파일이 너무 길다면 수정되는 정확한 위치와 전후 코드를 함께 제공합니다.

## 5. github push 가이드: 사용자가 push 해달라고 하기 전까지 멋대로 push 하지 않도록 합니다.

---
**[사용자 안내]**
새로운 에이전트 세션이 시작될 때마다 **"@AI_RULES.md 읽고 앞으로 이 규칙대로 코드 짜줘"** 라고 첫 마디를 건네시면, AI가 즉시 프로젝트 문맥을 파악하고 일관성 있게 작업을 도와드릴 수 있습니다. 
만약 Cursor 나 Windsurf 같은 AI 전용 IDE를 사용 중이시라면, 이 파일 내용을 `.cursorrules` 또는 `.windsurfrules` 등 해당 IDE 규칙 파일로 이름을 변경해서 사용하시면 자동으로 적용됩니다!
