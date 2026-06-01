# Checklist AI Coach 배포 가이드

이 폴더는 정적 앱과 AI 프록시 서버가 같이 들어 있는 Node 앱입니다.

## 필요한 환경변수

```text
OPENAI_API_KEY=발급받은 OpenAI API 키
OPENAI_MODEL=gpt-5.4-mini
```

`OPENAI_API_KEY`는 절대 HTML 파일이나 GitHub에 넣지 마세요. 배포 서비스의 Environment Variables / Secrets 메뉴에만 넣습니다.

## 로컬 실행

```powershell
$env:OPENAI_API_KEY="sk-..."
npm start
```

브라우저에서 엽니다.

```text
http://127.0.0.1:8787
```

## Render 배포 예시

1. 이 폴더를 GitHub 저장소에 올립니다.
2. Render에서 `New +` -> `Web Service`를 선택합니다.
3. GitHub 저장소를 연결합니다.
4. 설정:
   - Runtime: `Node`
   - Build Command: 비워두거나 `npm install`
   - Start Command: `npm start`
5. Environment Variables에 추가:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` = `gpt-5.4-mini`
6. 배포 후 Render가 알려주는 URL로 접속합니다.

## Railway 배포 예시

1. GitHub 저장소를 Railway에 연결합니다.
2. Variables에 `OPENAI_API_KEY`, `OPENAI_MODEL`을 추가합니다.
3. Start command는 `npm start`입니다.

## 확인용 주소

배포 후 아래 주소가 응답하면 서버가 살아 있는 상태입니다.

```text
/health
```

앱은 루트(`/`) 또는 `/todo-checklist-app.html`에서 열립니다.
