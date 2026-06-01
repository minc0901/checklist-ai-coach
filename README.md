# Checklist AI Coach

날짜별/월별/캘린더 보기, 시작/끝 시간 기록, 실제 소요시간 계산, AI 코치 문구를 제공하는 할 일 계획표 앱입니다.

## 실행

```powershell
$env:OPENAI_API_KEY="sk-..."
npm start
```

브라우저에서 엽니다.

```text
http://127.0.0.1:8787
```

## 배포

가장 쉬운 방식은 Render입니다.

1. 이 `outputs` 폴더의 파일들을 GitHub 저장소에 올립니다.
2. Render에서 `New +` -> `Blueprint` 또는 `Web Service`를 만듭니다.
3. `render.yaml`이 있으면 Blueprint로 자동 설정할 수 있습니다.
4. 환경변수 `OPENAI_API_KEY`에 OpenAI API 키를 넣습니다.
5. 배포 후 생성된 HTTPS URL로 접속합니다.

## 환경변수

```text
OPENAI_API_KEY=OpenAI API 키
OPENAI_MODEL=gpt-5.4-mini
PORT=8787
```

API 키는 프론트엔드 파일에 넣지 말고 배포 서비스의 환경변수에만 저장하세요.

## 데이터 저장

현재 할 일 데이터는 브라우저 `localStorage`에 저장됩니다. 즉 같은 브라우저에서는 유지되지만, 여러 기기 간 자동 동기화는 아직 없습니다.

기기 간 동기화를 하려면 다음 단계에서 Supabase/Firebase 같은 데이터베이스를 붙이면 됩니다.
