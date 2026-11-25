
(() => {
  "use strict";

  // 중복 실행 방지
  if (window.__creditUnionGameInitialized) return;
  window.__creditUnionGameInitialized = true;

  const $ = (id) => document.getElementById(id);

  const el = {
    startScreen: $("start-screen"),
    startButton: $("start-button"),
    clock: $("clock"),
    sales: $("sales"),
    satisfaction: $("satisfaction"),
    scene: $("scene-container"),
    queue: $("queue-list"),
    waiting: $("waiting-count"),
    call: $("call-button"),
    panel: $("customer-panel"),
    name: $("customer-name"),
    number: $("customer-number"),
    info: $("customer-info"),
    step: $("step-count"),
    progress: $("progress-bar"),
    message: $("customer-message"),
    answers: $("answer-list"),
    feedback: $("feedback"),
    finish: $("finish-button"),
    toast: $("toast")
  };

  const state = {
    started: false,
    customers: [],
    current: null,
    number: 1,
    completed: 0,
    sales: 0,
    satisfaction: 100,
    hour: 9,
    minute: 0,
    step: 0,
    THREE: null,
    scene: null,
    camera: null,
    renderer: null,
    people: [],
    threeReady: false,
    questionShown: false
  };

  const cases = [
    {
      type: "정기예금",
      purpose: "목돈 예치 및 금리 상담",
      amount: "5,000만 원",
      intro: "여유자금이 생겨서 정기예금을 알아보러 왔습니다.",
      questions: [
        "어떤 목적으로 자금을 예치하시려고 하나요?",
        "예치 기간은 어느 정도 생각하고 계신가요?",
        "다른 금융기관에 예치된 자금도 있으신가요?",
        "예금자보호에 대해 알고 계신가요?",
        "저율과세와 출자금 혜택도 안내해 드릴까요?",
        "중도해지 가능성도 고려해야 할까요?",
        "오늘 가입을 진행하시겠습니까?"
      ]
    },
    {
      type: "예금 재예치",
      purpose: "만기 예금 재예치",
      amount: "3,000만 원",
      intro: "기존 예금이 만기되어 다시 예치하려고 방문했습니다.",
      questions: [
        "기존 예금은 언제 만기되셨나요?",
        "만기 자금은 어느 정도인가요?",
        "이번에는 어느 정도 기간으로 예치하시겠습니까?",
        "다른 금융기관 금리도 비교해 보셨나요?",
        "저율과세 적용 가능 여부를 확인해 드릴까요?",
        "출자금 운용에도 관심이 있으신가요?",
        "재예치를 진행해 드릴까요?"
      ]
    },
    {
      type: "출자금",
      purpose: "조합원 가입 상담",
      amount: "500만 원",
      intro: "신협 조합원 가입과 출자금에 대해 알아보러 왔습니다.",
      questions: [
        "신협 조합원 가입은 처음이신가요?",
        "출자금에 대해 알고 계신가요?",
        "출자금과 예금의 차이를 설명해 드릴까요?",
        "출자금 배당에 대해 안내해 드릴까요?",
        "출자금 환급 시기와 절차를 설명해 드릴까요?",
        "조합원 혜택도 함께 안내해 드릴까요?",
        "오늘 조합원 가입을 진행하시겠습니까?"
      ]
    },
    {
      type: "정기적금",
      purpose: "매월 적립식 저축",
      amount: "월 100만 원",
      intro: "매월 일정 금액을 저축하고 싶어서 방문했습니다.",
      questions: [
        "매월 얼마 정도 저축할 계획이신가요?",
        "저축 기간은 어느 정도 생각하시나요?",
        "자동이체를 설정해 드릴까요?",
        "적금 금리와 우대 조건을 안내해 드릴까요?",
        "모바일뱅킹도 함께 이용하시겠습니까?",
        "중도해지 시 이율이 달라지는 점을 알고 계신가요?",
        "오늘 적금 가입을 진행하시겠습니까?"
      ]
    },
    {
      type: "체크카드",
      purpose: "체크카드 발급",
      amount: "신규 발급",
      intro: "체크카드를 새로 발급받으려고 왔습니다.",
      questions: [
        "현재 신협 입출금 계좌를 보유하고 계신가요?",
        "체크카드는 처음 발급받으시나요?",
        "주로 어떤 용도로 사용하실 예정인가요?",
        "카드 이용 혜택을 안내해 드릴까요?",
        "모바일뱅킹도 함께 이용하시겠습니까?",
        "카드 결제 계좌를 확인해 드릴까요?",
        "오늘 카드 발급을 진행하시겠습니까?"
      ]
    },
    {
      type: "햇살론",
      purpose: "서민금융 상담",
      amount: "1,000만 원",
      intro: "생활자금이 필요해서 햇살론 상담을 받으러 왔습니다.",
      questions: [
        "현재 직장인이신가요, 사업자이신가요?",
        "현재 근무 또는 사업 기간은 얼마나 되셨나요?",
        "소득을 확인할 수 있는 서류가 있으신가요?",
        "다른 금융기관 대출도 이용 중이신가요?",
        "고금리 대출을 상환하는 목적도 있으신가요?",
        "보증 심사와 신용정보 동의 절차를 안내해 드릴까요?",
        "필요 서류와 심사 절차를 안내해 드릴까요?"
      ]
    },
    {
      type: "담보대출",
      purpose: "부동산 담보대출 상담",
      amount: "1억 원",
      intro: "부동산을 담보로 대출을 받고 싶어서 방문했습니다.",
      questions: [
        "담보로 제공하실 부동산은 어떤 종류인가요?",
        "부동산은 본인 명의로 되어 있으신가요?",
        "필요하신 대출 금액은 얼마인가요?",
        "현재 다른 대출이 설정되어 있나요?",
        "소득을 확인할 수 있는 서류가 있으신가요?",
        "등기부등본과 선순위 권리를 확인해도 될까요?",
        "감정평가와 내부 심사 절차를 안내해 드릴까요?"
      ]
    },
    {
      type: "전세자금대출",
      purpose: "전세자금대출 상담",
      amount: "8,000만 원",
      intro: "전세 계약을 앞두고 대출 상담을 받으러 왔습니다.",
      questions: [
        "전세 계약은 이미 체결하셨나요?",
        "전세 보증금은 얼마인가요?",
        "입주 예정일은 언제인가요?",
        "현재 무주택 여부를 확인해도 될까요?",
        "소득과 재직을 확인할 수 있는 서류가 있으신가요?",
        "보증기관과 보증서 발급 절차를 안내해 드릴까요?",
        "필요 서류를 확인하고 심사를 준비해 드릴까요?"
      ]
    },
    {
      type: "화재공제",
      purpose: "화재공제 상담",
      amount: "건물 보장 상담",
      intro: "건물 화재보험에 대해 상담받고 싶습니다.",
      questions: [
        "공제 가입을 원하시는 대상은 무엇인가요?",
        "건물은 본인 소유인가요, 임차 중인가요?",
        "현재 가입되어 있는 화재보험이 있으신가요?",
        "기존 보험의 보장 내용을 확인해 볼까요?",
        "풍수재 등 추가 위험도 고려하시나요?",
        "건물 구조와 면적을 확인해도 될까요?",
        "기존 계약과 비교해 설계안을 받아보시겠습니까?"
      ]
    },
    {
      type: "상속",
      purpose: "상속 예금 상담",
      amount: "상속 예금",
      intro: "가족이 돌아가셔서 예금 상속 절차를 알아보러 왔습니다.",
      questions: [
        "고인과 어떤 관계이신가요?",
        "상속인은 몇 분 정도 계신가요?",
        "상속 관련 서류를 준비하셨나요?",
        "상속인 전원의 동의 여부를 확인할 수 있을까요?",
        "상속 예금 잔액을 확인해 드릴까요?",
        "필요한 가족관계 서류를 안내해 드릴까요?",
        "서류 확인 후 지급 절차를 안내해 드릴까요?"
      ]
    },
    {
      type: "대출 연장",
      purpose: "기존 대출 만기 연장",
      amount: "기존 대출",
      intro: "기존 대출의 만기가 다가와서 방문했습니다.",
      questions: [
        "현재 대출 만기일은 언제인가요?",
        "현재 대출 원금은 어느 정도 남아 있나요?",
        "최근 소득이나 재직 상태에 변동이 있으신가요?",
        "다른 금융기관 대출이 추가되었나요?",
        "이자 납입은 정상적으로 이루어지고 있나요?",
        "일부 원금 상환도 고려하고 계신가요?",
        "필요 서류와 연장 심사 절차를 안내해 드릴까요?"
      ]
    }
  ];

  const names = [
    "김영숙", "박정희", "이정훈", "최민수", "한미경",
    "윤선미", "김남국", "강민호", "오정희", "서영자",
    "장현수", "임수진", "조성호", "문정희", "백승철",
    "신영자", "차재필", "이경희", "전우진", "송미란",
    "남진우", "최영희", "박창순", "김한수", "정태용"
  ];

  const rand = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  function toast(message) {
    if (!el.toast) return;

    el.toast.textContent = message;
    el.toast.classList.add("show");

    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => {
      el.toast.classList.remove("show");
    }, 2500);
  }

  function updateHUD() {
    if (el.clock) {
      el.clock.textContent =
        String(state.hour).padStart(2, "0") + ":" +
        String(state.minute).padStart(2, "0");
    }

    if (el.sales) {
      el.sales.textContent = state.sales.toLocaleString("ko-KR");
    }

    if (el.satisfaction) {
      el.satisfaction.textContent = state.satisfaction + "%";
    }

    if (el.waiting) {
      el.waiting.textContent = state.customers.length;
    }
  }

  function tickClock() {
    state.minute++;

    if (state.minute >= 60) {
      state.minute = 0;
      state.hour++;
    }

    if (state.hour >= 18) {
      state.hour = 9;
    }

    updateHUD();
  }

  function createCustomer() {
    const data = cases[rand(0, cases.length - 1)];

    return {
      id: state.number++,
      name: names[rand(0, names.length - 1)],
      type: data.type,
      purpose: data.purpose,
      amount: data.amount,
      intro: data.intro,
      questions: data.questions,
      person: null,
      satisfaction: rand(75, 100)
    };
  }

  function addCustomer() {
    const customer = createCustomer();
    state.customers.push(customer);

    if (state.threeReady) {
      customer.person = createPerson(customer);

      if (customer.person) {
        customer.person.position.set(
          rand(-4, 4) * 0.3,
          0,
          -2.5
        );
      }
    }

    renderQueue();
    updateHUD();
  }

  function renderQueue() {
    if (!el.queue) return;

    el.queue.innerHTML = "";

    if (!state.customers.length) {
      el.queue.textContent = "대기 중인 고객이 없습니다.";
      return;
    }

    state.customers.slice(0, 8).forEach((customer, index) => {
      const item = document.createElement("div");
      item.className = "queue-item";

      const number = document.createElement("span");
      number.className = "queue-number";
      number.textContent = index + 1;

      const name = document.createElement("span");
      name.className = "queue-customer";
      name.textContent = customer.name;

      const purpose = document.createElement("span");
      purpose.className = "queue-purpose";
      purpose.textContent = customer.type;

      item.append(number, name, purpose);
      el.queue.appendChild(item);
    });
  }

  function startGame() {
    if (state.started) return;
    state.started = true;

    if (el.startScreen) {
      el.startScreen.style.display = "none";
    }

    if (el.panel) {
      el.panel.style.display = "none";
    }

    for (let i = 0; i < 6; i++) {
      addCustomer();
    }

    // 2초마다 게임 시간 1분
    setInterval(tickClock, 2000);

    // 15초마다 새 고객 방문
    setInterval(() => {
      if (state.customers.length < 12) {
        addCustomer();
        toast("새로운 고객이 방문했습니다.");
      }
    }, 15000);

    if (el.call) el.call.disabled = false;

    renderQueue();
    updateHUD();
    toast("영업을 시작했습니다!");
  }

  function callCustomer() {
    if (!state.started) {
      toast("먼저 영업을 시작해 주세요.");
      return;
    }

    if (state.current) {
      toast("현재 고객 상담을 먼저 완료해 주세요.");
      return;
    }

    if (!state.customers.length) {
      toast("대기 중인 고객이 없습니다.");
      return;
    }

    const customer = state.customers.shift();

    state.current = customer;
    state.step = 0;
    state.questionShown = false;

    if (el.call) el.call.disabled = true;

    renderQueue();
    updateHUD();

    toast(customer.name + " 고객님을 호출했습니다.");

    // 3D 캐릭터가 없으면 즉시 상담 시작
    if (!customer.person || !state.threeReady) {
      showQuestion();
      return;
    }

    // 고객을 창구 앞으로 이동
    customer.person.userData.targetZ = 2.2;
    customer.person.userData.walking = true;
    customer.person.userData.onArrive = showQuestion;

    // 이동 애니메이션이 실패해도 상담창은 반드시 열리도록 처리
    customer.arrivalFallback = setTimeout(() => {
      if (state.current === customer && !state.questionShown) {
        customer.person.position.z = 2.2;
        customer.person.userData.walking = false;
        showQuestion();
      }
    }, 5000);
  }

  function showQuestion() {
    const customer = state.current;
    if (!customer || state.questionShown) return;

    state.questionShown = true;
    clearTimeout(customer.arrivalFallback);

    if (el.panel) {
      el.panel.style.display = "block";
    }

    if (el.name) el.name.textContent = customer.name;

    if (el.number) {
      el.number.textContent = "대기번호 " + customer.id;
    }

    if (el.info) {
      el.info.textContent =
        customer.type + " · " +
        customer.purpose + " · " +
        customer.amount;
    }

    if (el.message) {
      el.message.textContent =
        "안녕하세요. " + customer.intro;
    }

    renderQuestion();
    toast(customer.name + " 고객 상담을 시작합니다.");
  }

  function renderQuestion() {
    const customer = state.current;
    if (!customer) return;

    const total = customer.questions.length;
    const question = customer.questions[state.step];

    if (el.step) {
      el.step.textContent = (state.step + 1) + " / " + total;
    }

    if (el.progress) {
      el.progress.style.width =
        ((state.step + 1) / total * 100) + "%";
    }

    if (el.message) {
      el.message.textContent = question;
    }

    if (el.feedback) {
      el.feedback.textContent = "";
      el.feedback.style.display = "none";
    }

    if (el.finish) {
      el.finish.style.display = "none";
    }

    if (!el.answers) return;

    el.answers.innerHTML = "";

    const label = document.createElement("label");
    label.textContent = "고객에게 설명할 답변을 작성해 주세요.";
    label.style.display = "block";
    label.style.marginBottom = "8px";

    const input = document.createElement("textarea");
    input.id = "customer-answer";
    input.placeholder =
      "예: 고객님의 상황과 필요 서류를 먼저 확인한 뒤 정확한 조건을 안내해 드리겠습니다.";
    input.rows = 4;
    input.style.width = "100%";
    input.style.boxSizing = "border-box";
    input.style.padding = "12px";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "10px";
    input.style.fontSize = "14px";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "답변 제출";
    button.style.marginTop = "10px";
    button.addEventListener("click", submitAnswer);

    el.answers.append(label, input, button);
    input.focus();
  }

  function submitAnswer() {
    const input = $("customer-answer");
    const answer = input ? input.value.trim() : "";

    if (answer.length < 8) {
      toast("답변을 조금 더 구체적으로 입력해 주세요.");
      return;
    }

    const customer = state.current;
    if (!customer) return;

    const keywords = [
      "확인", "안내", "설명", "서류", "조건",
      "금리", "소득", "기간", "상환", "심사",
      "보증", "동의", "고객", "상담", "필요",
      "가능", "비교", "절차", "확인해"
    ];

    const matched = keywords.filter(word =>
      answer.includes(word)
    ).length;

    let score = 65 + Math.min(25, matched * 5);

    if (answer.length >= 40) score += 5;
    if (answer.length >= 80) score += 5;

    score = Math.min(100, score);

    customer.satisfaction = Math.round(
      (customer.satisfaction + score) / 2
    );

    state.step++;

    if (state.step >= customer.questions.length) {
      if (el.answers) el.answers.innerHTML = "";

      if (el.message) {
        el.message.textContent =
          "상담이 완료되었습니다. 고객에게 마지막 안내를 해 주세요.";
      }

      if (el.step) {
        el.step.textContent =
          customer.questions.length + " / " +
          customer.questions.length;
      }

      if (el.progress) el.progress.style.width = "100%";

      if (el.feedback) {
        el.feedback.style.display = "block";
        el.feedback.textContent =
          "상담 답변이 모두 접수되었습니다. 고객 만족도 " +
          customer.satisfaction + "%";
      }

      if (el.finish) {
        el.finish.style.display = "block";
        el.finish.textContent = "상담 완료 및 고객 보내기";
      }

      return;
    }

    if (el.feedback) {
      el.feedback.style.display = "block";
      el.feedback.textContent =
        score >= 90
          ? "훌륭한 상담입니다! 고객이 만족하고 있습니다."
          : score >= 80
          ? "좋은 답변입니다. 다음 상담을 진행해 주세요."
          : "답변이 접수되었습니다. 조금 더 구체적으로 안내해 보세요.";
    }

    renderQuestion();
    updateHUD();
  }

  function finishCustomer() {
    const customer = state.current;
    if (!customer) return;

    state.completed++;

    const sales = {
      "정기예금": 5000,
      "예금 재예치": 3000,
      "출자금": 500,
      "정기적금": 100,
      "체크카드": 30,
      "햇살론": 1000,
      "담보대출": 10000,
      "전세자금대출": 8000,
      "화재공제": 200,
      "상속": 0,
      "대출 연장": 0
    };

    state.sales += sales[customer.type] || 0;

    state.satisfaction = Math.round(
      (state.satisfaction * (state.completed - 1) +
        customer.satisfaction) / state.completed
    );

    if (el.panel) el.panel.style.display = "none";

    if (customer.person) {
      customer.person.userData.targetZ = -3;
      customer.person.userData.walking = true;

      customer.person.userData.onArrive = () => {
        state.scene.remove(customer.person);
        state.people = state.people.filter(
          p => p !== customer.person
        );
      };

      // 퇴장 애니메이션이 끝나지 않아도 캐릭터 제거
      setTimeout(() => {
        if (customer.person && state.scene) {
          state.scene.remove(customer.person);
          state.people = state.people.filter(
            p => p !== customer.person
          );
        }
      }, 6000);
    }

    clearTimeout(customer.arrivalFallback);

    state.current = null;
    state.step = 0;
    state.questionShown = false;

    if (el.call) el.call.disabled = false;

    updateHUD();
    renderQueue();

    toast(customer.name + " 고객 상담이 완료되었습니다.");
  }

  // ----------------------------------
  // 3D 공간 만들기
  // ----------------------------------

  async function initializeThree() {
    if (!el.scene) return;

    try {
      const THREE = await import(
        "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      );

      state.THREE = THREE;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe8eef5);
      scene.fog = new THREE.Fog(0xe8eef5, 15, 35);

      const width = Math.max(el.scene.clientWidth, 1);
      const height = Math.max(el.scene.clientHeight, 1);

      // 낮은 눈높이 정면 카메라
      const camera = new THREE.PerspectiveCamera(
        43,
        width / height,
        0.1,
        100
      );

      camera.position.set(0, 1.75, 9);
      camera.lookAt(0, 1.45, 0);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
      });

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
      );

      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      el.scene.innerHTML = "";
      el.scene.appendChild(renderer.domElement);

      scene.add(
        new THREE.HemisphereLight(0xffffff, 0x778899, 2)
      );

      const light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(-4, 8, 7);
      light.castShadow = true;
      scene.add(light);

      // 바닥
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ color: 0xcbd5df })
      );

      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.04;
      floor.receiveShadow = true;
      scene.add(floor);

      // 뒤쪽 벽
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(18, 6, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xf5f7fa })
      );

      wall.position.set(0, 3, -4);
      scene.add(wall);

      // 창구 앞면
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(7, 1.05, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x805d43 })
      );

      counter.position.set(0, 0.55, 0.35);
      counter.castShadow = true;
      scene.add(counter);

      const top = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.12, 1.3),
        new THREE.MeshStandardMaterial({ color: 0x463326 })
      );

      top.position.set(0, 1.13, 0.35);
      scene.add(top);

      // 모니터
      const monitor = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.75, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x222b35 })
      );

      monitor.position.set(-1.2, 1.72, 0.1);
      scene.add(monitor);

      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.98, 0.6, 0.02),
        new THREE.MeshStandardMaterial({
          color: 0x75b1d8,
          emissive: 0x163c55
        })
      );

      screen.position.set(-1.2, 1.72, 0.03);
      scene.add(screen);

      // 대기 의자
      for (let i = 0; i < 4; i++) {
        const chair = new THREE.Group();

        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.15, 0.7),
          new THREE.MeshStandardMaterial({ color: 0x456b83 })
        );

        seat.position.y = 0.55;
        chair.add(seat);

        const back = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.8, 0.12),
          new THREE.MeshStandardMaterial({ color: 0x456b83 })
        );

        back.position.set(0, 0.95, -0.28);
        chair.add(back);

        chair.position.set(-3.8 + i * 2.4, 0, -2.5);
        scene.add(chair);
      }

      state.scene = scene;
      state.camera = camera;
      state.renderer = renderer;
      state.threeReady = true;

      // 이미 대기 중인 고객도 생성
      state.customers.forEach(customer => {
        customer.person = createPerson(customer);
      });

      window.addEventListener("resize", resizeScene);

      animate();

    } catch (error) {
      console.error("3D 초기화 오류:", error);
      state.threeReady = false;
      el.scene.style.background = "#dce5ed";
      toast("3D 화면을 불러오지 못했습니다. 상담 기능은 이용할 수 있습니다.");
    }
  }

  // ----------------------------------
  // 사람 캐릭터와 얼굴
  // ----------------------------------

  function createPerson(customer) {
    const THREE = state.THREE;
    if (!THREE || !state.scene) return null;

    const group = new THREE.Group();

    const skinColors = [
      0xffd0ae, 0xe8b99a, 0xc58b68,
      0xf0c9a7, 0xd9a17d
    ];

    const hairColors = [
      0x21150f, 0x38251b, 0x171717,
      0x5b4030, 0x4a3025
    ];

    const clothesColors = [
      0x426b91, 0x7c536d, 0x4e6657,
      0x665d85, 0x9a744e, 0x456d76,
      0x8a5550
    ];

    const mat = (color, roughness = 0.85) =>
      new THREE.MeshStandardMaterial({ color, roughness });

    const skin = mat(skinColors[rand(0, skinColors.length - 1)]);
    const hair = mat(hairColors[rand(0, hairColors.length - 1)]);
    const clothes = mat(clothesColors[rand(0, clothesColors.length - 1)]);
    const dark = mat(0x242424);
    const eyeWhite = mat(0xffffff);
    const eyeBlack = mat(0x17120f);
    const mouthMat = mat(0x8c3e42);
    const eyebrowMat = mat(0x302018);

    function sphere(x, y, z, sx, sy, sz, material) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 24, 18),
        material
      );

      mesh.position.set(x, y, z);
      mesh.scale.set(sx, sy, sz);
      mesh.castShadow = true;
      group.add(mesh);
      return mesh;
    }

    function cube(x, y, z, sx, sy, sz, material) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      group.add(mesh);
      return mesh;
    }

    function cylinder(x, y, z, radius, length, material) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, length, 16),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      group.add(mesh);
      return mesh;
    }

    // 몸통
    cube(0, 1.02, 0, 0.62, 0.82, 0.34, clothes);

    // 목
    cylinder(0, 1.48, 0, 0.12, 0.2, skin);

    // 얼굴
    sphere(0, 1.88, 0, 0.32, 0.4, 0.29, skin);

    // 귀
    sphere(-0.32, 1.89, 0, 0.075, 0.105, 0.07, skin);
    sphere(0.32, 1.89, 0, 0.075, 0.105, 0.07, skin);

    // 머리카락
    sphere(0, 2.1, -0.02, 0.34, 0.26, 0.3, hair);
    sphere(0, 2.19, 0.11, 0.27, 0.12, 0.2, hair);

    // 앞머리 일부
    sphere(-0.16, 2.1, 0.22, 0.12, 0.12, 0.09, hair);
    sphere(0.08, 2.13, 0.24, 0.13, 0.1, 0.08, hair);

    // 눈 흰자 - 얼굴 앞쪽(+Z)
    sphere(-0.115, 1.96, 0.265, 0.065, 0.075, 0.035, eyeWhite);
    sphere(0.115, 1.96, 0.265, 0.065, 0.075, 0.035, eyeWhite);

    // 검은 눈동자
    sphere(-0.115, 1.96, 0.298, 0.032, 0.045, 0.018, eyeBlack);
    sphere(0.115, 1.96, 0.298, 0.032, 0.045, 0.018, eyeBlack);

    // 눈썹
    const browLeft = cube(
      -0.115, 2.055, 0.28, 0.13, 0.025, 0.025, eyebrowMat
    );

    const browRight = cube(
      0.115, 2.055, 0.28, 0.13, 0.025, 0.025, eyebrowMat
    );

    browLeft.rotation.z = -0.08;
    browRight.rotation.z = 0.08;

    // 코
    sphere(0, 1.875, 0.315, 0.055, 0.075, 0.065, skin);

    // 입 - 얼굴 앞쪽에 배치
    const mouth = cube(
      0, 1.765, 0.286, 0.105, 0.025, 0.025, mouthMat
    );

    // 입술 아래 턱 부분
    sphere(0, 1.72, 0.25, 0.13, 0.045, 0.06, skin);

    // 팔
    const leftArm = cube(
      -0.39, 1.02, 0, 0.16, 0.62, 0.17, clothes
    );

    const rightArm = cube(
      0.39, 1.02, 0, 0.16, 0.62, 0.17, clothes
    );

    leftArm.rotation.z = -0.12;
    rightArm.rotation.z = 0.12;

    // 손
    sphere(-0.4, 0.68, 0.03, 0.09, 0.1, 0.09, skin);
    sphere(0.4, 0.68, 0.03, 0.09, 0.1, 0.09, skin);

    // 다리
    cube(-0.17, 0.32, 0, 0.2, 0.55, 0.22, dark);
    cube(0.17, 0.32, 0, 0.2, 0.55, 0.22, dark);

    // 신발
    sphere(-0.17, 0.06, 0.08, 0.15, 0.08, 0.25, dark);
    sphere(0.17, 0.06, 0.08, 0.15, 0.08, 0.25, dark);

    // 얼굴이 카메라를 향하도록 회전하지 않음
    // 얼굴 부품이 +Z 방향이고 카메라도 +Z 방향
    group.rotation.y = 0;

    group.position.set(
      rand(-4, 4) * 0.3,
      0,
      -2.5
    );

    group.userData = {
      walking: false,
      targetZ: -2.5,
      onArrive: null,
      customer
    };

    state.scene.add(group);
    state.people.push(group);

    return group;
  }

  function animate() {
    if (!state.renderer || !state.scene || !state.camera) return;

    requestAnimationFrame(animate);

    const delta = 0.016;

    state.people.forEach(person => {
      if (!person.userData.walking) return;

      const target = person.userData.targetZ;
      const difference = target - person.position.z;

      if (Math.abs(difference) > 0.05) {
        person.position.z +=
          Math.sign(difference) * delta * 2.2;

        person.position.y =
          Math.abs(Math.sin(Date.now() * 0.009)) * 0.025;

      } else {
        person.position.z = target;
        person.position.y = 0;
        person.userData.walking = false;

        const callback = person.userData.onArrive;
        person.userData.onArrive = null;

        if (typeof callback === "function") {
          callback();
        }
      }
    });

    state.renderer.render(state.scene, state.camera);
  }

  function resizeScene() {
    if (!state.camera || !state.renderer || !el.scene) return;

    const width = Math.max(el.scene.clientWidth, 1);
    const height = Math.max(el.scene.clientHeight, 1);

    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(width, height);
  }

  // ----------------------------------
  // 버튼 연결
  // ----------------------------------

  function main() {
    if (el.startButton) {
      el.startButton.addEventListener("click", startGame);
    }

    if (el.call) {
      el.call.addEventListener("click", callCustomer);
      el.call.disabled = false;
    }

    if (el.finish) {
      el.finish.addEventListener("click", finishCustomer);
      el.finish.style.display = "none";
    }

    if (el.panel) {
      el.panel.style.display = "none";
    }

    updateHUD();
    renderQueue();
    initializeThree();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main, { once: true });
  } else {
    main();
  }

})();
