네. 지금 말씀하신 방향이라면 기존의 **“홈 → 카드 → 상세 → 답변” 형태 자체를 버리고**, 제품의 중심을 아예 **“면접 지식 그래프를 탐색하는 워크스페이스”**로 바꾸는 것이 좋습니다.

제가 가장 추천하는 전체 컨셉은 **Interview Graph Workspace**입니다.

> **Obsidian의 Knowledge Graph + Heptabase의 Visual Whiteboard + GitKraken의 Branch Graph + Linear의 Inspector UX**를 면접 학습에 맞게 재해석하는 방식입니다.

Heptabase는 카드와 화이트보드를 이용해 지식을 공간적으로 연결하고, Obsidian은 연결된 노트를 그래프로 탐색하는 방식을 취합니다. GitKraken은 복잡한 Git branch를 그래프로 탐색하면서 선택한 commit의 상세 내용을 별도 패널에 보여주고, Linear는 리스트/보드에서 항목을 열지 않고도 Peek와 Details Sidebar로 문맥을 유지한 채 상세 정보를 확인합니다. 각각 Iterview에 상당히 잘 맞는 부분이 있습니다. ([Heptabase](https://heptabase.com/?gspk=YWxleGFuZGVycmluazk0MDI&gsxid=gksjvzF7XyPbh4&ps_partner_key=YWxleGFuZGVycmluazk0MDI&ps_xid=gksjvzF7XyPbh4&pscd=get.heptabase.com&utm_source=chatgpt.com))

참고할 만한 시각적 방향은 이런 느낌입니다.

![Image](https://wiki.heptabase.com/assets/images/organize-03-2748c9d382a4df785253209d30daa890.png)

![Image](https://heptabase.com/_next/image?q=75&url=%2F_next%2Fstatic%2Fmedia%2F11-Reading-Knowledge-Screenshot.118258ec.png&w=3840)

![Image](https://forum.obsidian.md/uploads/default/original/3X/3/e/3e18254815af9003a820d07d9423b5d70b3ff910.jpeg)

![Image](https://cdn.sanity.io/images/ornj730p/production/0fa1075fad1efe419f6589503a8c9944d4b10171-1372x747.png?auto=format&dpr=2&q=95&w=1440)

제가 생각하는 구조를 구체적으로 풀어보겠습니다.

------

# 1. 제품 자체를 “Interview Workspace”로 재정의하는 것을 추천드립니다

지금까지는 아마 이런 구조에 가까울 가능성이 높습니다.

```text
Home
 ├─ Today's Question
 ├─ Retry
 ├─ Progress
 ├─ Feed
 └─ Archive
```

기능적으로는 맞지만, 어느 면접 서비스에서나 나올 법한 IA입니다.

이걸 근본적으로 바꾸어서:

```text
                  ITERVIEW

 ┌───────────────┬─────────────────────────────┬──────────────────┐
 │               │                             │                  │
 │ Navigator     │       Knowledge Graph       │ Career Context   │
 │               │                             │                  │
 │ Today         │         Java                │ Resume v4        │
 │ Question Map  │          │                  │ Backend / 4y     │
 │ Practice      │       Spring Boot           │                  │
 │ Review        │        /       \             │ Skills           │
 │ Archive       │     JPA       Transaction   │ Java  ████████   │
 │               │      │           │           │ Spring ███████   │
 │ Resume        │  N+1 Problem   Isolation    │ AWS    █████     │
 │ Profile       │                  │           │                  │
 │               │              MVCC           │ Target           │
 │               │                             │ Toss             │
 │               │                             │ Kakao            │
 └───────────────┴─────────────────────────────┴──────────────────┘
```

형태로 가져가는 것입니다.

핵심 UI는 더 이상 **Card Feed**가 아닙니다.

**Graph / Explorer / Inspector**입니다.

이것 하나만으로 제품 인상이 완전히 달라집니다.

------

# 2. 질문 탐색의 중심을 “Question Graph”로 만드십시오

이게 Iterview의 시그니처 기능이 될 수 있습니다.

예를 들어 질문 하나가:

> Spring의 트랜잭션 동작 원리를 설명해주세요.

라고 하면 이렇게 연결됩니다.

```text
Spring Transaction
│
├── @Transactional은 어떻게 동작하나요?
│   │
│   ├── Proxy가 필요한 이유는?
│   │
│   ├── Self Invocation 문제는?
│   │
│   └── private method에 적용하면?
│
├── Transaction Propagation
│   │
│   ├── REQUIRED
│   ├── REQUIRES_NEW
│   └── NESTED
│
└── Isolation Level
    │
    ├── Dirty Read
    ├── Non-repeatable Read
    ├── Phantom Read
    │
    └── MVCC
```

사용자는 질문 하나를 읽고 뒤로가기 해서 목록으로 돌아가는 것이 아니라,

**질문 → 꼬리질문 → 꼬리질문의 꼬리질문**

으로 계속 파고듭니다.

바로 사용자가 말씀하신 DFS 경험입니다.

------

# 3. 하지만 “일반적인 Network Graph”로 만들면 오히려 사용성이 나빠집니다

이 부분이 매우 중요합니다.

Obsidian처럼 모든 노드가 공중에 떠 있는 force-directed graph는:

- 멋있어 보이지만
- 노드가 많아질수록 찾기 어렵고
- 계층이 명확하지 않고
- 실제 학습에는 피로합니다.

그래서 Iterview에서는 **Graph View + DFS Focus View 두 가지를 제공**하는 것을 추천드립니다.

------

# 4. Mode A — Map View

전체 지식 구조를 보는 화면입니다.

예:

```text
Backend Interview Map

                    [Backend]
                       │
       ┌───────────────┼─────────────────┐
       │               │                 │
     Java           Database         Architecture
       │               │                 │
  ┌────┼────┐       ┌──┼──┐          ┌───┼────┐
 JVM  Thread GC     Index TX Lock     Cache MQ Scale
             │              │
             │              ├ Isolation
             │              └ MVCC
             │
          ★ My Resume
```

여기에서는:

- 내가 얼마나 공부했는지
- 어느 영역이 약한지
- 어떤 질문이 아직 미답변인지

를 **한눈에** 봅니다.

게임의 Skill Tree와 비슷합니다.

------

# 5. Mode B — DFS Focus

실제 공부할 때는 이쪽이 훨씬 중요합니다.

예를 들어 `Transaction`을 클릭하면:

```text
Backend
  >
Database
  >
Transaction
  >
Isolation Level
  >
MVCC
```

현재 탐색 경로만 강하게 보여줍니다.

그래프에서는:

```text
Database
   │
Transaction
   │
Isolation Level
   │
 ┌─┼───────────────┐
 │ │               │
RU RC              RR
                   │
                  MVCC ← CURRENT
                   │
             ┌─────┴──────┐
             │            │
          Undo Log    Snapshot Read
```

이런 형태가 됩니다.

### UX 원칙

현재 DFS path:

```text
Database → Transaction → Isolation → MVCC
```

는 선명하게 표시합니다.

Sibling node:

```text
Lock
Deadlock
Replication
```

은 흐리게 표시합니다.

그리고 사용자가 MVCC를 클릭하면 해당 노드의 children만 펼칩니다.

이렇게 하면 복잡한 그래프에서도 **집중력을 잃지 않습니다.**

------

# 6. GitKraken의 UX를 상당 부분 참고할 수 있습니다

GitKraken이 Git history를 보여줄 때는:

- branch
- commit
- parent/child
- 현재 위치

를 그래프로 보여주고, 선택된 commit은 별도 상세 패널에서 확인할 수 있습니다. 또한 branch를 숨기거나 solo하여 복잡도를 줄이는 기능도 제공합니다. ([GitKraken](https://www.gitkraken.com/wp-content/uploads/2021/06/why-gitkraken.pdf?utm_source=chatgpt.com))

면접 질문에도 거의 그대로 대응시킬 수 있습니다.

### GitKraken

```text
Commit
   │
Commit
   │\
   │ Commit
   │ │
Commit │
```

### Iterview

```text
Question
   │
Follow-up
   │\
   │ Follow-up
   │ │
Question │
```

이런 식입니다.

심지어 제품 철학도 잘 맞습니다.

> **Branching Interview Knowledge**

라는 컨셉을 가져갈 수 있습니다.

------

# 7. 질문 노드에도 “상태”를 줍니다

질문을 그냥 동그라미로만 표현하면 재미가 없습니다.

예:

```text
○ Not started

◐ Attempted

● Mastered

! Weak

◆ Resume-based

★ Company frequent
```

다만 실제 UI에서는 색상을 너무 많이 쓰면 안 됩니다.

추천은:

### Node fill

학습 상태

### Node border

질문 출처

### Badge

기업/이력서 연관성

정도로 분리합니다.

예:

```text
┌────────────────────┐
│ ● Transaction      │
│                    │
│ 82                 │
│ Spring · DB        │
│ Resume             │
└────────────────────┘
```

------

# 8. 점수도 Graph 자체에 녹일 수 있습니다

여기가 상당히 재미있습니다.

예를 들어:

```text
             Java
            82%
             │
       ┌─────┴─────┐
       │           │
      JVM        Thread
      94%         63%
                   │
               Concurrency
                  55%
```

사용자는 별도의 Dashboard에 들어가지 않아도:

**“내가 Concurrency가 약하구나.”**

를 바로 알 수 있습니다.

따라서 기존의:

> Progress Dashboard

라는 페이지 자체가 거의 필요 없어질 수도 있습니다.

------

# 9. Graph 위에서 “나의 이력서”도 연결하십시오

이게 Iterview를 상당히 독특하게 만들 수 있는 부분입니다.

Resume를 단순 PDF 관리 화면으로 두지 마십시오.

Resume 역시 **Graph의 데이터 Source**로 만듭니다.

예:

```text
                   Resume v4
                       │
         ┌─────────────┼─────────────┐
         │             │             │
     Dreamus        Monticker      Skills
         │             │
   Settlement       Redis           │
      System           │       Java / Spring
         │        Distributed        │
         │           Lock            │
         └─────────────┼─────────────┘
                       │
                 Generated Questions
```

그리고:

```text
Dreamus
  ↓
대규모 Excel 처리
  ↓
OOM 문제
  ↓
“대용량 파일 처리 시 메모리 문제를 어떻게 해결했나요?”
  ↓
“Streaming 방식의 단점은?”
  ↓
“SXSSF 내부 구조를 설명해주세요.”
```

처럼 질문이 생성됩니다.

그러면 **Resume → Experience → Technology → Question**이라는 연결이 생깁니다.

이것은 일반 면접 서비스와 상당히 차별화됩니다.

------

# 10. 오른쪽에는 항상 “Career Context Inspector”를 두는 것을 추천합니다

Linear가 리스트를 떠나지 않고 `Peek`로 상세 정보를 확인하거나 Details Sidebar를 여는 패턴을 제공하는 것처럼, Iterview에서도 화면을 계속 전환하기보다는 Inspector를 사용하는 것이 좋습니다. ([Linear](https://linear.app/docs/peek?utm_source=chatgpt.com))

예:

```text
┌─────────────────────────┐
│ CAREER CONTEXT          │
│                         │
│ Soren                   │
│ Backend Engineer        │
│ 4 years                 │
│                         │
│ Resume                  │
│ v4 · Updated 3d ago     │
│                         │
│ Target Companies        │
│ Toss                    │
│ Kakao                   │
│ Naver                   │
│                         │
│ Core Skills             │
│ Java       Expert       │
│ Spring     Strong       │
│ MySQL      Strong       │
│ Redis      Medium       │
│ Kafka      Learning     │
│                         │
│ Weak Areas              │
│ Concurrency        52   │
│ JVM                63   │
│ Network            65   │
└─────────────────────────┘
```

이 패널은 화면 이동 없이 계속 유지할 수 있습니다.

------

# 11. Profile과 Resume를 “Career DNA” 개념으로 합치는 것도 좋습니다

제가 이름을 붙인다면:

### **Career Context**

또는 조금 더 개성 있게:

### **Career DNA**

라고 하겠습니다.

여기에는:

- 이력서
- 연차
- 직무
- 기술
- 프로젝트
- 성과
- 희망기업
- 부족 기술
- 학습 이력

이 전부 들어갑니다.

------

# 12. Career Context 화면은 이런 구조를 추천합니다

```text
CAREER CONTEXT

Backend Engineer · 4Y 2M

──────────────────────────────────

Experience

2021        2022       2023       2024
 ├──────── Dreamus ────────────────┤

        MCP
         │
        MDS
         │
   Creator Studio

──────────────────────────────────

Technology Landscape

Java        ██████████████
Spring      █████████████
MySQL       ███████████
Redis       █████████
AWS         ████████
Kafka       █████

──────────────────────────────────

Interview Readiness

Java         91
Spring       86
Database     82
Architecture 74
Concurrency  58  ← Needs work
Network      64

──────────────────────────────────

Target

Toss Securities
Backend / Quote Platform

Recommended preparation

→ Concurrency
→ Kafka
→ Distributed Systems
```

일반 Profile보다 훨씬 제품적인 경험이 됩니다.

------

# 13. 재미있는 점은 Career Context와 Question Graph를 서로 연결할 수 있다는 것입니다

예를 들어 Career Context에서:

```text
Redis
```

를 클릭합니다.

그러면 중앙 Graph가 자동으로:

```text
Redis
 ├ Cache
 ├ TTL
 ├ Pub/Sub
 ├ Stream
 ├ Distributed Lock
 │     └ Lua
 └ Persistence
```

를 보여줍니다.

반대로 Graph에서:

```text
Distributed Lock
```

을 클릭하면 Career Context에서:

```text
Related Resume Experience

Dreamus
Batch/API lock contention
token + conditional DEL
```

이 자동으로 표시됩니다.

이런 양방향 상호작용이 Iterview의 핵심 UX가 될 수 있습니다.

------

# 14. 전체 App Shell은 “3-Pane Workspace”를 가장 추천합니다

최종적인 데스크톱 UX입니다.

```text
┌─────────────┬────────────────────────────────────┬────────────────────┐
│             │                                    │                    │
│ ITERVIEW    │ Interview Knowledge Graph          │ CONTEXT            │
│             │                                    │                    │
│ Today       │                                    │ Question           │
│             │           Java                     │                    │
│ Map       ● │            │                       │ Transaction        │
│ Practice    │         Spring                     │                    │
│ Review      │         /      \                    │ Score 72           │
│ Archive     │      JPA     Transaction            │                    │
│             │                │                    │ Resume Link        │
│ Career      │            Isolation               │ Dreamus            │
│ Resume      │                │                    │ Settlement         │
│             │              MVCC                   │                    │
│             │                                    │ Weakness           │
│             │                                    │ Specificity        │
│             │                                    │                    │
│             │                                    │ [Answer]           │
│             │                                    │                    │
└─────────────┴────────────────────────────────────┴────────────────────┘
```

### Left

Navigation

### Center

Workspace / Graph / Editor

### Right

Context / Inspector

이 구조는 굉장히 확장성이 좋습니다.

------

# 15. 질문을 클릭해도 새 페이지로 가지 않는 UX를 추천합니다

이게 핵심입니다.

기존 웹:

```text
Graph
 ↓ click
Question Detail Page
 ↓ back
Graph
```

보다는:

```text
Graph

Question Click
       ↓

                    ┌──────────────┐
Graph stays         │ Question     │
                    │              │
                    │ Answer       │
                    │ Feedback     │
                    └──────────────┘
```

처럼 오른쪽 Inspector를 열어야 합니다.

Linear의 Peek도 목록이나 보드의 문맥을 유지하면서 상세 내용을 확인하는 데 초점을 둡니다. ([Linear](https://linear.app/docs/peek?utm_source=chatgpt.com))

**탐색 컨텍스트를 절대 끊지 않는 것**이 핵심입니다.

------

# 16. Question Inspector 안에서 답변까지 합니다

예:

```text
Question

Spring @Transactional은
어떻게 동작하나요?

─────────────────

Your mastery
72 / 100

Last attempt
3 days ago

─────────────────

Expected concepts

Proxy
AOP
TransactionManager

─────────────────

[ Start answering ]

─────────────────

Children

→ Self invocation?
→ Proxy 종류?
→ Rollback 조건?
```

그리고 답변을 시작하면 Inspector 폭이 넓어집니다.

```text
Graph                  Answer Workspace

                       Question

                       @Transactional...

                       ─────────────────

                       [ Answer editor ]

                       ...

                       [Evaluate]
```

이 구조가 상당히 좋습니다.

------

# 17. “오늘의 질문”조차 Graph 속에서 보여주는 것이 좋습니다

별도의 홈 카드보다는:

```text
TODAY

       ★
       │
Transaction
       │
 Isolation
```

처럼 Graph에서 spotlight를 줍니다.

그리고 좌측의 Today 버튼을 누르면:

> 오늘 학습해야 할 노드들만 자동으로 focus

됩니다.

예:

```text
Today's path

1. Transaction Isolation   RETRY
2. JVM GC                  NEW
3. Redis Lock              RESUME
```

------

# 18. Home이라는 개념 자체를 없애는 것도 고려할 만합니다

저라면 꽤 진지하게 검토하겠습니다.

사용자가 로그인하면 바로:

### Interview Map

이 뜹니다.

즉:

```text
Home
```

이 아니라

```text
Workspace
```

입니다.

IDE를 켰는데 Dashboard가 나오는 것이 아니라 코드가 바로 보이는 것과 비슷합니다.

이 서비스에도 잘 어울립니다.

------

# 19. 디자인 컨셉은 “Developer Tool × Learning Tool”로 가십시오

색감까지 포함하면:

### Avoid

- 지나친 SaaS gradient
- giant typography
- glassmorphism
- 과도한 rounded-xl
- 카드 수십 개
- 귀여운 캐릭터

### Prefer

- neutral background
- thin border
- high information density
- compact typography
- monospace accent 약간
- node/edge highlight
- subtle animation
- keyboard navigation
- command palette

Linear처럼 거의 모든 view에서 표시 방식과 grouping을 조절하거나 keyboard interaction을 적극적으로 쓰는 방식도 개발자 대상 서비스와 잘 맞습니다. ([Linear](https://linear.app/docs/board-layout?utm_source=chatgpt.com))

------

# 20. Command Palette도 굉장히 잘 어울립니다

예:

```
Cmd + K
Search Iterview

> transaction

Questions
  Transaction isolation
  @Transactional
  Distributed transaction

Skills
  Transaction

Resume
  Settlement project

Commands
  Start interview
  Open review queue
  Upload resume
```

이건 제품 완성도를 상당히 올려줄 수 있습니다.

Linear도 command menu와 keyboard 중심의 탐색을 핵심 UI 패턴으로 사용합니다. ([Linear](https://linear.app/changelog/2019-12-18-new-command-menu?utm_source=chatgpt.com))

------

# 21. 최종적으로 제가 추천하는 Iterview 디자인 Identity

한마디로 표현하면:

## **Career Knowledge IDE**

입니다.

그리고 UI 구조는:

### Navigation

Linear

### Knowledge visualization

Heptabase + Obsidian

### Branch visualization

GitKraken

### Inspector

Linear

### 학습 구조

LeetCode / Anki

### 개인화

Resume Knowledge Graph

을 결합합니다.

단, 각각의 디자인을 그대로 베끼는 것이 아니라 **Interaction Pattern만 가져오는 것**입니다.

------

# 22. 제품의 핵심 화면도 완전히 달라집니다

기존:

```text
Home
Question List
Question Detail
Answer
Result
Profile
```

에서:

```text
Workspace
 ├ Interview Map
 │
 ├ DFS Explorer
 │
 ├ Question Inspector
 │
 └ Answer Workspace
 │
Career Context
 ├ Resume
 ├ Experience
 ├ Skill Map
 └ Target Companies
 │
Review
 ├ Weak Nodes
 └ Scheduled Nodes
```

로 바뀝니다.

저는 **이 정도까지 근본적으로 바꾸는 것을 추천합니다.**

현재 UI를 아무리 polish해도, 기본 구조가 흔한 카드형 SaaS/모바일 앱이면 결과가 계속 비슷해질 가능성이 높습니다. 반면 **“면접 질문을 그래프로 탐색한다”**는 메타포 자체를 제품의 중심으로 가져오면, 기능과 디자인이 동시에 차별화됩니다.

특히 **Resume → Experience → Technology → Question → Follow-up Question → Answer → Mastery**가 하나의 그래프로 이어지는 순간부터 Iterview는 단순한 “ChatGPT 면접 wrapper”와 상당히 다른 제품이 됩니다.

원하시면 다음 단계에서는 이 컨셉을 기준으로 **실제 데스크톱 메인 화면을 이미지로 시각화해서** 와이어프레임이 아니라 상용 서비스에 가까운 UI 목업을 만들어볼 수 있습니다.