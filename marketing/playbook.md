# While You're Away 마케팅 플레이북

2026-11-26 작성. 마케팅 전문가 에이전트(`.claude/agents/marketing-expert.md`)는 이 문서를 근거로 움직입니다.
모든 판단에는 출처가 있어야 하고, 출처가 없는 숫자는 "가정"이라고 적습니다.

## 0. 지켜야 할 규칙

1. **돈이 드는 일은 실행 전에 사람에게 확인받습니다.** 광고비, AI 영상 생성 크레딧, 유료 도구, 크리에이터 비용 모두 포함입니다. 확인할 때는 금액, 무엇을 얻는지, 멈추는 기준을 함께 적습니다.
2. **올리는 일(게시, 댓글, DM, 이메일 발송)도 하나하나 확인받습니다.** 초안까지는 마음대로 만들어도 됩니다.
3. **편지 본문은 AI가 쓰지 않습니다.** 마케팅에서도 "AI가 대신 써 준다"는 말은 쓰지 않습니다. AI는 질문하고, 대화에서 순간을 찾고, 편지지를 만듭니다. 말은 보내는 사람 것입니다.
4. **예시 인물과 장소는 미국 기준입니다.** 예: Sam과 Emma, Chicago, Lakefront Trail.
5. **지어낸 후기, 가짜 사용자, 가짜 수치는 절대 쓰지 않습니다.** 예시 이야기에는 "지어낸 이야기"라고 표시합니다.
6. **AI로 만든 사람이 나오는 영상은 AI로 만들었다고 밝힙니다.** Instagram은 AI로 만든 사람을 숨긴 계정의 추천 노출을 줄입니다([TechCrunch, 2026-08-31](https://techcrunch.com/2026/08/31/instagram-puts-new-limits-on-undisclosed-ai-profiles/)).

## 1. 지금 우리 위치 (2026-11-25 판단 요약)

- **제품:** 경쟁 서비스보다 앞섭니다. 대화에서 그 사람만의 편지지를 만드는 곳이 없습니다.
- **증거와 고객:** 고객 0명, 후기 0건, 인지도 0입니다.
- **가격:** $9.99, 또는 기념책을 포함한 $19.99입니다(2026-11-25 출시).
- **결론:** 유료 광고는 아직입니다. 광고를 켜는 조건은 세 가지입니다. 광고 없이 결제 30건, 방문자 결제율 3% 이상, 평균 결제액 $15 이상.
- **측정:** `supabase/weekly.sql`로 매주 월요일 확인합니다.

## 2. 사례에서 배운 것: 작은 서비스가 크는 방법

| 사례 | 무엇을 했나 | 결과 (출처의 주장) | 우리에게 주는 교훈 |
|---|---|---|---|
| **Locket** (위젯 사진 앱) | 만든 사람이 직접 앱이 실제로 작동하는 모습을 TikTok에 올림. 광고비 0. 다른 사람들이 같은 형식과 같은 소리로 따라 만듦 | 2주 만에 사용자 200만, 미국 앱스토어 1위 ([TechCrunch](https://techcrunch.com/2022/01/11/locket-an-app-for-sharing-photos-to-friends-homescreens-hits-the-top-of-the-app-store), [OMR](https://omr.com/de/locket-social-app-tiktok/)) | **제품이 실제로 작동하는 순간을 보여 주는 게 가장 잘 퍼집니다.** 우리에게 그 순간은 "봉인된 편지가 그날 열리는 장면"입니다. 따라 하기 쉬운 형식이면 남들이 퍼뜨립니다. |
| **Candle** (커플 앱, YC) | 인턴이 만든 시제품 TikTok 하나가 유럽에서 터짐. 이후 창업자와 크리에이터가 함께 영상 제작 | 6개월에 사용자 30만, 그중 커플 15만 (회사 발표, [TechCrunch](https://techcrunch.com/2025/09/24/these-yc-founders-pivoted-5-times-before-building-a-social-app-that-nabbed-300k-users-and-over-1m-arr-in-6-months/), [YesPress](https://yespress.io/candle-yc-f24)) | **커플 시장은 TikTok과 Instagram에서 움직입니다.** 영상 하나가 터지면 의견도 같이 들어옵니다. 같은 형식을 많이 시도하는 게 중요합니다. |
| **LoveWick** (커플 앱) | Reddit과 TikTok에서 초기 커플을 찾음. 커플이 겪는 흔한 고민을 관계 과학과 엮은 공감 영상 | 광고 없이 사용자 20만 (회사 자체 발표라 검증 안 됨, [LoveWick](https://lovewick.com/about/)) | **"제품 소개"보다 "공감 가는 고민"이 먼저입니다.** 장거리 연애의 흔한 순간(시차, 끊기는 통화, 공항)을 다룹니다. |
| **"Open when" 졸업 선물 영상** | 대학 가는 자녀에게 주는 "open when" 편지 영상 | 이틀 만에 조회수 100만 이상 ([Scary Mommy](https://www.scarymommy.com/parenting/graduation-gift-open-when-tiktok)) | **"open when" 개념 자체에 이미 반응이 있습니다.** 특히 부모와 자녀 쪽입니다. 8월 입학 시즌이 큽니다. |
| **슬라이드쇼 앱 마케팅** (Dumbphone 등) | 얼굴 없이 같은 슬라이드쇼 형식을 반복. 카드 내용만 바꿈 | 1인 팀이 78일에 다운로드 2만 (마케팅 업체 글이라 참고만, [Shortimize](https://www.shortimize.com/blog/20k-downloads-and-9k-mrr-in-78-days-how-this-indie-app-turned-minimalism-into-millions-of-views), [Superwall](https://superwall.com/blog/how-i-make-usd42k-mo-passively-with-simple-no-code-apps-copy-me)) | **얼굴 없이도 됩니다.** 형식 하나를 정해 많이 만들고, 반응 좋은 것만 남깁니다. 조회수와 설치는 다르다는 경고도 함께 봅니다. |
| **검색용 페이지** (SavvyCal, IPQS 등) | 사람들이 실제로 검색하는 말마다 페이지를 하나씩 만듦. 쓸모 있는 무료 도구를 같이 둠 | 작은 회사들의 검색 유입 대부분을 이런 페이지가 만듦 ([Ahrefs](https://ahrefs.com/blog/top-bootstrapped-saas-companies), [AnalyzeAI](https://www.tryanalyze.ai/blog/top-bootstrapped-saas-companies)) | **"open when letter ideas" 같은 검색어에는 이미 수요가 있습니다.** Berries, MomJunction이 아이디어 목록으로 이 검색어를 잡고 있습니다([Berries](https://www.berries.com/blog/open-when-letters), [MomJunction](https://www.momjunction.com/articles/open-when-letters_00762126)). 시간이 걸리지만 돈이 안 들고 오래 갑니다. |
| **AI 마이크로드라마** (중국 브랜드들) | FamilyMart, Pechoin 등이 AI 드라마에 제품을 넣음 | 같은 예산으로 일반 광고보다 더 많이 도달했다고 주장. 다만 2026년 상반기 AI 드라마가 43만 편 쏟아졌고, 춘절 기간 실사 드라마 조회수가 AI 드라마의 25배 ([Xinhua](https://english.news.cn/20261125/6b143368391b4aa5af333fd8f414c808/c.html), [China Economic Net](http://en.ce.cn/main/latest/202611/t20261126_3307883.shtml)) | **AI 드라마는 이미 포화 상태이고, 사람들은 여전히 실사를 더 봅니다.** 드라마 자체로 이기려 하지 말고, 드라마 안에서 우리 제품이 "이야기의 핵심 장치"가 되어야 합니다. 4장에서 자세히 다룹니다. |

**공통점 다섯 가지**
1. 처음엔 돈이 아니라 **형식**으로 이깁니다. 한 형식을 정해 많이 시도합니다.
2. 제품이 **실제로 작동하는 장면**이 설명보다 강합니다.
3. **공감 가는 순간**이 먼저고, 제품은 그 순간의 답으로 나옵니다.
4. **시즌**이 있으면 그 시즌에 몰아서 합니다(입학, 졸업, 파병, 유학 출국).
5. 검색 페이지처럼 **느리지만 쌓이는 것**을 같이 깔아 둡니다.

## 3. 우리 차별점과 메시지

### 차별점 (경쟁 서비스와 비교해 사실인 것만)
1. **그 사람만의 편지지.** 대화와 상담에서 찾은 순간이 편지지 구성을 바꿉니다. 탑승권, 봉인 편지, 일기장, 엽서처럼요. 경쟁 서비스(Letterbox, Open When Letters, MyLetters, Dear You, FutureMe)는 색과 글꼴을 고르는 정도입니다.
2. **떠나기 전 몰래 쓰는 일기.** D-14부터 D-1까지 쓰고, 상대는 떨어진 뒤에 날짜대로 엽니다.
3. **받는 사람 앱.** 설치 없이 휴대폰에서 열리고, 신호가 없어도 되고, 편지마다 답장할 수 있습니다.
4. **한 번 결제.** 구독이 아닙니다($9.99, 기념책 포함 $19.99).
5. **말은 전부 당신 것.** AI가 편지를 대신 쓰지 않습니다. AI 글이 넘쳐나는 시대라 이게 신뢰 포인트가 됩니다.

### 한 줄 메시지 후보 (영어, 사이트 톤)
- "Goodbyes can be prepared."
- "Write it now. They'll open it on the day it's for."
- "Every word is yours. We just make the paper."

### 먼저 공략할 고객
1. **장거리 연애, 유학과 교환학생 커플:** 무료 콘텐츠로 공략합니다.
2. **대학 가는 자녀를 둔 부모:** 8월과 1월에 시즌 시험을 합니다. "open when" 졸업 선물 영상이 이미 반응을 증명했습니다.
3. **파병 가족:** 커뮤니티로 접근합니다. 신뢰가 먼저입니다.

## 4. 채널별 실행 계획

### A. 검색 페이지 (무료, 지금 진행)
- 사람들이 실제로 검색하는 말마다 정적 페이지를 하나씩 만듭니다. JS 없이 바로 읽히게 해서 검색엔진이 쉽게 가져가게 합니다.
- 1차 6개:
  - open when letter ideas
  - how to write open when letters
  - what to write before deployment
  - letters for a college freshman
  - long distance relationship letter ideas
  - a goodbye letter before studying abroad
- 각 페이지는 아이디어와 질문을 주고, 편지 본문을 대신 써 주지는 않습니다. 끝에 "Start your letter box"를 둡니다.
- robots.txt, sitemap.xml, 페이지별 제목과 설명을 넣습니다.
- 사람이 할 일: Google Search Console에 사이트를 등록하고 sitemap을 제출합니다. 무료이고 5분이면 됩니다.

### B. 짧은 영상 (무료 제작, 게시는 확인 후)
- **형식 1 · "봉인이 열리는 날" POV:** 실제 제품 화면을 녹화해서, 봉인된 편지가 그날 열리는 장면을 보여 줍니다. Locket처럼 제품이 작동하는 순간이 핵심입니다. 이미 `marketing/instagram/reels/` 제작 파이프라인이 있습니다.
- **형식 2 · 슬라이드쇼:** "Open when letters for your long distance partner" 같은 아이디어 목록입니다. 마지막 장에 제품을 보여 줍니다. 얼굴 없이 반복할 수 있습니다.
- **형식 3 · 공감 순간:** 공항 출국장, 시차, "text me when you land" 같은 순간에 문구 한 줄을 붙입니다.
- 주 3개를 2주 동안 올려서, 처음 3초 시청 유지율과 프로필 방문 수로 형식을 고릅니다.

### C. 핀터레스트 (무료)
- "open when letters"는 핀터레스트에서 오래 검색되는 주제입니다(Berries, Fantabulosity 같은 아이디어 글들이 핀으로 유통됨).
- 검색 페이지 하나당 세로 핀 3장을 만들고, 핀은 해당 검색 페이지로 연결합니다.
- 실제 검색량은 Pinterest Trends로 직접 확인합니다(사람이 할 일).

### D. 커뮤니티 (무료, 게시마다 확인)
- 대상: Reddit의 장거리 연애, 유학, 군인 가족 커뮤니티, Facebook 그룹.
- 규칙: 각 커뮤니티의 홍보 규칙을 먼저 읽습니다. 홍보 글이 아니라 도움이 되는 글을 올립니다(예: "letter ideas for the first month apart" 목록). 링크는 규칙이 허락할 때만 겁니다.

### E. 받는 사람 고리 (완료, 측정 중)
- 받는 사람 상자의 "Write letters for {이름}" 기능입니다. `make_back` 이벤트와 `utm_source=box`로 효과를 봅니다.

### F. AI 드라마 (조건부: 작은 시험만, 돈이 들어 확인 필요)
- **판단:** 해 볼 만하지만 주력은 아닙니다.
  - AI 드라마는 이미 포화 상태이고, 실사 조회수가 압도적입니다(위 표).
  - 우리 브랜드의 핵심은 "AI 티 없는 진심"이라, 어색한 AI 영상은 오히려 해가 될 수 있습니다.
  - 반면 우리 제품은 드라마의 장치로 쓰기에 아주 좋습니다. "떠난 사람이 남긴 편지가 정해진 날 열린다"는 그 자체로 이야기입니다.
- **방법:** `marketing/drama/README.md`(제작 가이드)와 `marketing/drama/ep01.md`(1화 대본과 장면 목록)를 참고합니다.
- **시험 예산(확인 필요):** 1화 45초 기준으로 영상 생성 약 $15~$40입니다. 출처별 단가 차이가 커서 범위로 적었습니다.
- **멈추는 기준:** 3화까지 올렸는데 슬라이드쇼나 POV보다 3초 유지율이 낮으면 멈춥니다.

### G. 작은 크리에이터 (돈이 들 수 있어 확인 필요)
- 장거리 연애 크리에이터 5~10명에게 무료 상자를 주고, 판매 시 30% 제휴 수수료를 제안합니다.
- 무료 상자는 원가가 거의 없어(AI 비용 $0.3~0.9) 확인 후 바로 할 수 있습니다.

## 5. 시즌 달력 (미국)

| 시기 | 무엇 | 대상 |
|---|---|---|
| 1월 | 봄 학기 유학 출국 | 유학생 커플, 부모 |
| 2월 | 밸런타인데이 | 장거리 커플 |
| 5~6월 | 졸업, 이사, 여름 인턴 | 친구, 커플 |
| 8월 | 대학 입학 (가장 큼) | 부모 → 자녀 |
| 연중 | 파병, 훈련 | 군인 가족 |

**시즌 4주 전부터 콘텐츠를 올립니다.** 다음 시즌은 1월 출국이므로 12월 첫 주부터 시작합니다.

## 6. 측정과 판단

- **매주 월요일:** `supabase/weekly.sql`을 실행하고, 결과를 시트 한 장에 쌓습니다.
- **채널별 출처:** 링크마다 `utm_source`를 붙입니다(instagram, tiktok, pinterest, reddit, guide).
- **영상:** 처음 3초 유지율, 저장 수, 프로필 방문 수를 봅니다. 좋아요는 보조 지표입니다.
- **검색:** Search Console의 노출과 클릭을 봅니다. 4~8주 걸립니다.
- **2주마다 정리:** 잘 된 형식 하나는 두 배로 늘리고, 안 된 것은 끊습니다.

## 7. 돈이 드는 일: 확인 대기 목록

| 항목 | 금액 | 얻는 것 | 멈추는 기준 |
|---|---|---|---|
| AI 드라마 1화 시험 | 약 $15~$40 (영상 생성 크레딧) | 형식 시험 1회 | 3화까지 해서 다른 형식보다 유지율이 낮으면 중단 |
| 크리에이터 무료 상자 | 상자당 AI 원가 $1 미만 | 실제 후기와 노출 | 5명 중 0명이 올리면 중단 |
| 유료 광고 $300 시험 | $300 | 광고 효율 측정 | 광고 켜는 조건 3개를 다 넘기 전엔 시작하지 않음 |
