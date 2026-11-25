
(() => {
  "use strict";

  // 중복 실행 방지
  if (window.__creditUnionGameInitialized) return;
  window.__creditUnionGameInitialized = true;

  const getEl = (id) => document.getElementById(id);

  const state = {
    started: false,
    customers: [],
    currentCustomer: null,
    customerNumber: 1,
    completed: 0,
    sales: 0,
    satisfaction: 100,
    gameHour: 9,
    gameMinute: 0,
    currentStep: 0,
    timer: null,
    arrivalTimer: null,
    scene: null,
    camera: null,
    renderer: null,
    THREE: null,
    people: [],
    threeReady: false
  };

  const el = {
    startScreen: getEl("start-screen"),
    startButton: getEl("start-button"),
    day: getEl("day"),
    clock: getEl("clock"),
    sales: getEl("sales"),
    satisfaction: getEl("satisfaction"),
    sceneContainer: getEl("scene-container"),
    queueList: getEl("queue-list"),
    waitingCount: getEl("waiting-count"),
    callButton: getEl("call-button"),
    customerPanel: getEl("customer-panel"),
    customerName: getEl("customer-name"),
    customerNumber: getEl("customer-number"),
    customerInfo: getEl("customer-info"),
    stepCount: getEl("step-count"),
    progressBar: getEl("progress-bar"),
    customerMessage: getEl("customer-message"),
    answerList: getEl("answer-list"),
    feedback: getEl("feedback"),
    finishButton: getEl("finish-button"),
    toast: getEl("toast")
  };

  const customerTypes = [
    {
      type: "정기예금",
      purpose: "목돈 예치 및 금리 상담",
      intro: "여유자금이 생겨서 정기예금을 알아보러 왔습니다.",
      amount: "5,000만 원",
      steps: [
        "어떤 목적으로 자금을 예치하시려고 하나요?",
        "예치 기간은 어느 정도 생각하고 계신가요?",
        "다른 금융기관에 예치된 자금도 있으신가요?",
        "예금자보호에 대해 알고 계신가요?",
        "세금 혜택도 함께 안내해 드릴까요?",
        "중도해지 가능성도 고려해야 할까요?",
        "오늘 가입을 진행하시겠습니까?"
      ]
    },
    {
      type: "예금 재예치",
      purpose: "만기 예금 재예치",
      intro: "기존 예금이 만기되어 다시 예치하려고 방문했습니다.",
      amount: "3,000만 원",
      steps: [
        "기존 예금은 언제 만기되셨나요?",
        "만기 자금은 어느 정도인가요?",
        "이번에도 같은 기간으로 예치하시겠습니까?",
        "다른 금융기관 금리도 비교해 보셨나요?",
        "저율과세 적용 가능 여부도 확인해 드릴까요?",
        "예금 외에 출자금 운용도 관심 있으신가요?",
        "재예치를 진행해 드릴까요?"
      ]
    },
    {
      type: "출자금",
      purpose: "조합원 가입 및 출자금 상담",
      intro: "신협 조합원 가입과 출자금에 대해 알아보러 왔습니다.",
      amount: "500만 원",
      steps: [
        "신협 조합원 가입은 처음이신가요?",
        "출자금에 대해 알고 계신가요?",
        "출자금은 예금과 차이가 있다는 점을 알고 계신가요?",
        "출자금 배당에 대해서도 안내해 드릴까요?",
        "출자금의 환급 시기와 절차도 설명해 드릴까요?",
        "조합원 혜택도 함께 안내해 드릴까요?",
        "오늘 조합원 가입을 진행하시겠습니까?"
      ]
    },
    {
      type: "정기적금",
      purpose: "매월 적립식 저축",
      intro: "매월 일정 금액을 저축하고 싶어서 방문했습니다.",
      amount: "월 100만 원",
      steps: [
        "매월 얼마 정도 저축할 계획이신가요?",
        "저축 기간은 어느 정도 생각하시나요?",
        "월급일에 맞춰 자동이체를 설정해 드릴까요?",
        "적금 금리와 우대 조건을 안내해 드릴까요?",
        "체크카드나 앱 이용도 함께 도와드릴까요?",
        "중도해지 시 이율이 달라질 수 있다는 점을 확인하셨나요?",
        "오늘 적금 가입을 진행하시겠습니까?"
      ]
    },
    {
      type: "체크카드",
      purpose: "체크카드 발급 및 계좌 연결",
      intro: "체크카드를 새로 발급받으려고 왔습니다.",
      amount: "신규 발급",
      steps: [
        "현재 신협 입출금 계좌를 보유하고 계신가요?",
        "체크카드는 처음 발급받으시나요?",
        "주로 어떤 용도로 사용하실 예정인가요?",
        "카드 이용 실적 조건도 안내해 드릴까요?",
        "모바일뱅킹도 함께 이용하시겠습니까?",
        "카드 결제 계좌를 확인해 드릴까요?",
        "오늘 카드 발급을 진행하시겠습니까?"
      ]
    },
    {
      type: "햇살론",
      purpose: "서민금융 햇살론 상담",
      intro: "생활자금이 필요해서 햇살론 상담을 받으러 왔습니다.",
      amount: "1,000만 원",
      steps: [
        "현재 직장에 재직 중이신가요, 사업을 운영 중이신가요?",
        "현재 근무 또는 사업 기간은 얼마나 되셨나요?",
        "최근 소득을 확인할 수 있는 자료가 있으신가요?",
        "현재 다른 금융기관 대출도 이용 중이신가요?",
        "기존 고금리 대출을 상환하는 목적도 있으신가요?",
        "신용정보 및 보증 심사를 위한 동의 절차를 안내해 드릴까요?",
        "필요 서류와 보증 심사 절차를 안내해 드릴까요?"
      ]
    },
    {
      type: "담보대출",
      purpose: "부동산 담보대출 상담",
      intro: "부동산을 담보로 대출을 받고 싶어서 방문했습니다.",
      amount: "1억 원",
      steps: [
        "담보로 제공하실 부동산은 어떤 종류인가요?",
        "부동산은 본인 명의로 되어 있으신가요?",
        "필요하신 대출 금액은 얼마인가요?",
        "현재 해당 부동산에 다른 대출이 설정되어 있나요?",
        "소득을 확인할 수 있는 서류가 있으신가요?",
        "등기부등본과 선순위 권리관계를 확인해도 될까요?",
        "감정평가와 내부 심사 절차를 안내해 드릴까요?"
      ]
    },
    {
      type: "전세자금대출",
      purpose: "전세자금대출 상담",
      intro: "전세 계약을 앞두고 대출 상담을 받으러 왔습니다.",
      amount: "8,000만 원",
      steps: [
        "전세 계약은 이미 체결하셨나요?",
        "전세 보증금은 얼마인가요?",
        "입주 예정일은 언제인가요?",
        "현재 무주택 여부를 확인해도 될까요?",
        "소득과 재직을 확인할 수 있는 서류가 있으신가요?",
        "보증기관과 보증서 발급 절차를 안내해 드릴까요?",
        "계약서와 필요 서류를 확인한 뒤 심사를 진행해 드릴까요?"
      ]
    },
    {
      type: "화재공제",
      purpose: "화재공제 가입 상담",
      intro: "건물 화재보험에 대해 상담받고 싶습니다.",
      amount: "건물 보장 상담",
      steps: [
        "공제 가입을 원하시는 대상은 무엇인가요?",
        "건물은 본인 소유인가요, 임차 중인가요?",
        "현재 가입되어 있는 화재보험이 있으신가요?",
        "현재 보험의 보장 내용을 확인해 볼까요?",
        "화재 외에 풍수재 등 추가 위험도 고려하시나요?",
        "건물 구조와 면적을 확인해도 될까요?",
        "기존 계약과 비교해 설계안을 받아보시겠습니까?"
      ]
    },
    {
      type: "상속",
      purpose: "상속 예금 및 금융거래 상담",
      intro: "가족이 돌아가셔서 예금 상속 절차를 알아보러 왔습니다.",
      amount: "상속 예금",
      steps: [
        "고인과 어떤 관계이신가요?",
        "상속인은 몇 분 정도 계신가요?",
        "상속 관련 서류를 준비하셨나요?",
        "상속인 전원의 동의 여부를 확인할 수 있을까요?",
        "상속 예금 잔액을 확인해 드릴까요?",
        "필요한 가족관계 및 기본증명서 등을 안내해 드릴까요?",
        "서류 확인 후 지급 절차를 안내해 드릴까요?"
      ]
    },
    {
      type: "대출 연장",
      purpose: "기존 대출 만기 연장 상담",
      intro: "기존에 이용 중인 대출의 만기가 다가와서 방문했습니다.",
      amount: "기존 대출",
      steps: [
        "현재 이용 중인 대출의 만기일은 언제인가요?",
        "현재 대출 원금은 어느 정도 남아 있나요?",
        "최근 소득이나 재직 상태에 변동이 있으신가요?",
        "최근 다른 금융기관 대출이 추가되었나요?",
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

  const random = (min, max) =>
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
        String(state.gameHour).padStart(2, "0") + ":" +
        String(state.gameMinute).padStart(2, "0");
    }

    if (el.sales) {
      el.sales.textContent = state.sales.toLocaleString("ko-KR");
    }

    if (el.satisfaction) {
      el.satisfaction.textContent = state.satisfaction + "%";
    }

    if (el.waitingCount) {
      el.waitingCount.textContent = state.customers.length;
    }
  }

  function advanceClock() {
    state.gameMinute++;

    if (state.gameMinute >= 60) {
      state.gameMinute = 0;
      state.gameHour++;
    }

    if (state.gameHour >= 18) {
      state.gameHour = 9;
    }

    updateHUD();
  }

  function createCustomer() {
    const template = customerTypes[
      random(0, customerTypes.length - 1)
    ];

    return {
      id: state.customerNumber++,
      name: names[random(0, names.length - 1)],
      type: template.type,
      purpose: template.purpose,
      intro: template.intro,
      amount: template.amount,
      steps: template.steps,
      satisfaction: random(75, 100),
      person: null
    };
  }

  function addCustomer() {
    const customer = createCustomer();
    state.customers.push(customer);

    if (state.threeReady) {
      customer.person = createPerson(customer);

      if (customer.person) {
        customer.person.position.set(
          random(-5, 5) * 0.2,
          0,
          -2.5
        );
      }
    }

    renderQueue();
    updateHUD();
  }

  function renderQueue() {
    if (!el.queueList) return;

    el.queueList.innerHTML = "";

    if (state.customers.length === 0) {
      el.queueList.innerHTML =
        '<div class="queue-empty">대기 중인 고객이 없습니다.</div>';
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
      el.queueList.appendChild(item);
    });
  }

  function startGame() {
    if (state.started) return;

    state.started = true;

    if (el.startScreen) {
      el.startScreen.style.display = "none";
    }

    if (el.customerPanel) {
      el.customerPanel.style.display = "none";
    }

    for (let i = 0; i < 6; i++) {
      addCustomer();
    }

    // 게임 시간: 2초마다 게임 속 1분
    state.timer = setInterval(advanceClock, 2000);

    // 15초마다 새로운 고객 방문
    state.arrivalTimer = setInterval(() => {
      if (state.customers.length < 12) {
        addCustomer();
        toast("새로운 고객이 방문했습니다.");
      }
    }, 15000);

    if (el.callButton) {
      el.callButton.disabled = false;
    }

    updateHUD();
    renderQueue();
    toast("영업을 시작했습니다. 번호표를 호출해 주세요.");
  }

  function callCustomer() {
    if (!state.started) {
      toast("먼저 영업을 시작해 주세요.");
      return;
    }

    if (state.currentCustomer) {
      toast("현재 고객의 상담을 먼저 완료해 주세요.");
      return;
    }

    if (state.customers.length === 0) {
      toast("대기 중인 고객이 없습니다.");
      return;
    }

    const customer = state.customers.shift();
    state.currentCustomer = customer;
    state.currentStep = 0;

    renderQueue();
    updateHUD();

    if (el.callButton) {
      el.callButton.disabled = true;
    }

    toast(customer.name + " 고객님을 호출했습니다.");

    if (customer.person && state.threeReady) {
      customer.person.userData.targetZ = 2.5;
      customer.person.userData.walking = true;
      customer.person.userData.onArrive = showQuestion;
    } else {
      showQuestion();
    }
  }

  function showQuestion() {
    const customer = state.currentCustomer;
    if (!customer) return;

    if (el.customerPanel) {
      el.customerPanel.style.display = "block";
    }

    if (el.customerName) {
      el.customerName.textContent = customer.name;
    }

    if (el.customerNumber) {
      el.customerNumber.textContent = "대기번호 " + customer.id;
    }

    if (el.customerInfo) {
      el.customerInfo.textContent =
        customer.type + " · " +
        customer.purpose + " · 상담금액 " +
        customer.amount;
    }

    if (el.customerMessage) {
      el.customerMessage.textContent = customer.intro;
    }

    renderQuestion();
  }

  function renderQuestion() {
    const customer = state.currentCustomer;
    if (!customer) return;

    const total = customer.steps.length;
    const question = customer.steps[state.currentStep];

    if (el.stepCount) {
      el.stepCount.textContent =
        (state.currentStep + 1) + " / " + total;
    }

    if (el.progressBar) {
      el.progressBar.style.width =
        ((state.currentStep + 1) / total * 100) + "%";
    }

    if (el.customerMessage) {
      el.customerMessage.textContent = question;
    }

    if (el.feedback) {
      el.feedback.textContent = "";
      el.feedback.style.display = "none";
    }

    if (el.finishButton) {
      el.finishButton.style.display = "none";
    }

    if (!el.answerList) return;

    el.answerList.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "subjective-answer";

    const label = document.createElement("label");
    label.textContent = "직원 상담 답변을 입력해 주세요.";
    label.style.display = "block";
    label.style.marginBottom = "8px";

    const textarea = document.createElement("textarea");
    textarea.id = "customer-answer";
    textarea.placeholder =
      "고객에게 설명할 내용을 직접 입력하세요.";
    textarea.rows = 4;
    textarea.style.width = "100%";
    textarea.style.boxSizing = "border-box";
    textarea.style.padding = "12px";
    textarea.style.borderRadius = "10px";
    textarea.style.border = "1px solid #ccc";
    textarea.style.resize = "vertical";
    textarea.style.fontSize = "14px";

    const submit = document.createElement("button");
    submit.type = "button";
    submit.textContent = "답변 제출";
    submit.style.marginTop = "10px";
    submit.addEventListener("click", submitAnswer);

    wrapper.append(label, textarea, submit);
    el.answerList.appendChild(wrapper);

    textarea.focus();
  }

  function submitAnswer() {
    const textarea = getEl("customer-answer");
    const answer = textarea ? textarea.value.trim() : "";

    if (!answer) {
      toast("답변을 입력해 주세요.");
      return;
    }

    if (answer.length < 8) {
      toast("조금 더 구체적으로 답변해 주세요.");
      return;
    }

    const customer = state.currentCustomer;
    if (!customer) return;

    const keywords = [
      "확인", "안내", "설명", "서류", "조건",
      "금리", "소득", "기간", "상환", "심사",
      "보증", "동의", "고객", "상담", "필요",
      "가능", "비교"
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

    state.satisfaction = Math.round(
      (state.satisfaction * state.completed +
        customer.satisfaction) /
      (state.completed + 1)
    );

    if (el.feedback) {
      el.feedback.style.display = "block";

      if (score >= 90) {
        el.feedback.textContent =
          "훌륭합니다! 고객의 상황을 고려한 구체적인 상담입니다.";
      } else if (score >= 80) {
        el.feedback.textContent =
          "좋은 답변입니다. 필요한 내용을 잘 안내했습니다.";
      } else {
        el.feedback.textContent =
          "답변이 접수되었습니다. 조금 더 구체적으로 설명해 보세요.";
      }
    }

    state.currentStep++;

    if (state.currentStep >= customer.steps.length) {
      el.answerList.innerHTML = "";

      if (el.customerMessage) {
        el.customerMessage.textContent =
          "상담이 모두 완료되었습니다. 고객에게 마지막 안내를 진행해 주세요.";
      }

      if (el.finishButton) {
        el.finishButton.style.display = "block";
        el.finishButton.textContent = "상담 완료 및 고객 보내기";
      }

      if (el.stepCount) {
        el.stepCount.textContent =
          totalSteps(customer) + " / " + totalSteps(customer);
      }

      if (el.progressBar) {
        el.progressBar.style.width = "100%";
      }
    } else {
      renderQuestion();
    }

    updateHUD();
  }

  function totalSteps(customer) {
    return customer.steps.length;
  }

  function finishCustomer() {
    const customer = state.currentCustomer;
    if (!customer) return;

    state.completed++;

    const salesByType = {
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

    state.sales += salesByType[customer.type] || 0;

    if (el.customerPanel) {
      el.customerPanel.style.display = "none";
    }

    if (customer.person) {
      customer.person.userData.targetZ = -5;
      customer.person.userData.walking = true;
      customer.person.userData.onArrive = () => {
        if (state.scene) {
          state.scene.remove(customer.person);
        }

        state.people = state.people.filter(
          person => person !== customer.person
        );
      };
    }

    state.currentCustomer = null;
    state.currentStep = 0;

    if (el.callButton) {
      el.callButton.disabled = false;
    }

    updateHUD();
    renderQueue();

    toast(customer.name + " 고객 상담이 완료되었습니다.");
  }

  // -----------------------------------
  // 3D 은행 공간
  // -----------------------------------

  async function initializeThree() {
    if (!el.sceneContainer) return;

    try {
      const THREE = await import(
        "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      );

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe8eef5);
      scene.fog = new THREE.Fog(0xe8eef5, 12, 30);

      const width = Math.max(el.sceneContainer.clientWidth, 1);
      const height = Math.max(el.sceneContainer.clientHeight, 1);

      const camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        100
      );

      // 낮은 눈높이의 정면 시점
      camera.position.set(0, 1.8, 9);
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

      el.sceneContainer.innerHTML = "";
      el.sceneContainer.appendChild(renderer.domElement);

      scene.add(
        new THREE.HemisphereLight(0xffffff, 0x778899, 2)
      );

      const light = new THREE.DirectionalLight(0xffffff, 2.2);
      light.position.set(-4, 8, 6);
      light.castShadow = true;
      scene.add(light);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({
          color: 0xc8d2dc,
          roughness: 0.9
        })
      );

      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.03;
      floor.receiveShadow = true;
      scene.add(floor);

      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(18, 6, 0.3),
        new THREE.MeshStandardMaterial({
          color: 0xf5f7fa
        })
      );

      wall.position.set(0, 3, -4);
      scene.add(wall);

      // 창구
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(7, 1.05, 1.1),
        new THREE.MeshStandardMaterial({
          color: 0x8b684c
        })
      );

      counter.position.set(0, 0.55, 0.4);
      counter.castShadow = true;
      counter.receiveShadow = true;
      scene.add(counter);

      const counterTop = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.12, 1.3),
        new THREE.MeshStandardMaterial({
          color: 0x4d372b
        })
      );

      counterTop.position.set(0, 1.13, 0.4);
      scene.add(counterTop);

      // 모니터
      const monitor = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.75, 0.12),
        new THREE.MeshStandardMaterial({
          color: 0x222b35
        })
      );

      monitor.position.set(-1.2, 1.75, 0.2);
      scene.add(monitor);

      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.98, 0.6, 0.02),
        new THREE.MeshStandardMaterial({
          color: 0x78a9ca,
          emissive: 0x163c55
        })
      );

      screen.position.set(-1.2, 1.75, 0.12);
      scene.add(screen);

      const keyboard = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.05, 0.35),
        new THREE.MeshStandardMaterial({
          color: 0x333333
        })
      );

      keyboard.position.set(0.2, 1.22, 0.1);
      scene.add(keyboard);

      // 창구 안내판
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.55, 0.12),
        new THREE.MeshStandardMaterial({
          color: 0x174b79
        })
      );

      sign.position.set(0, 2.9, -3.7);
      scene.add(sign);

      // 대기 의자
      for (let i = 0; i < 4; i++) {
        const chair = new THREE.Group();

        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.15, 0.7),
          new THREE.MeshStandardMaterial({
            color: 0x456b83
          })
        );

        seat.position.y = 0.55;
        chair.add(seat);

        const back = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.8, 0.12),
          new THREE.MeshStandardMaterial({
            color: 0x456b83
          })
        );

        back.position.set(0, 0.95, -0.28);
        chair.add(back);

        chair.position.set(-3.8 + i * 2.4, 0, -2.5);
        scene.add(chair);
      }

      state.scene = scene;
      state.camera = camera;
      state.renderer = renderer;
      state.THREE = THREE;
      state.threeReady = true;

      // 이미 대기 중인 고객 캐릭터 생성
      state.customers.forEach(customer => {
        if (!customer.person) {
          customer.person = createPerson(customer);

          if (customer.person) {
            customer.person.position.set(
              random(-5, 5) * 0.2,
              0,
              -2.5
            );
          }
        }
      });

      window.addEventListener("resize", resizeScene);
      animate();

    } catch (error) {
      console.error("3D 화면 초기화 오류:", error);

      state.threeReady = false;

      el.sceneContainer.style.background =
        "linear-gradient(#e8eef5, #c8d2dc)";

      toast("3D 화면을 불러오지 못했습니다. 상담 기능은 이용할 수 있습니다.");
    }
  }

  function createPerson(customer) {
    if (!state.THREE || !state.scene) return null;

    const THREE = state.THREE;
    const group = new THREE.Group();

    const skinColors = [
      0xffd1b1, 0xe8b99a, 0xc58b68, 0xf0c9a7
    ];

    const hairColors = [
      0x24170f, 0x39251b, 0x171717, 0x5b4030
    ];

    const clothesColors = [
      0x426b91, 0x7c536d, 0x4e6657,
      0x665d85, 0x9a744e, 0x456d76,
      0x8a5550
    ];

    const skin = new THREE.MeshStandardMaterial({
      color: skinColors[random(0, skinColors.length - 1)]
    });

    const hair = new THREE.MeshStandardMaterial({
      color: hairColors[random(0, hairColors.length - 1)]
    });

    const clothes = new THREE.MeshStandardMaterial({
      color: clothesColors[random(0, clothesColors.length - 1)]
    });

    const dark = new THREE.MeshStandardMaterial({
      color: 0x252525
    });

    const eyes = new THREE.MeshStandardMaterial({
      color: 0x161616
    });

    function ball(x, y, z, sx, sy, sz, material) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 16),
        material
      );

      mesh.position.set(x, y, z);
      mesh.scale.set(sx, sy, sz);
      mesh.castShadow = true;
      group.add(mesh);

      return mesh;
    }

    function box(x, y, z, sx, sy, sz, material) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      group.add(mesh);

      return mesh;
    }

    // 몸통
    box(0, 1.05, 0, 0.62, 0.85, 0.35, clothes);

    // 목과 얼굴
    ball(0, 1.55, 0, 0.14, 0.18, 0.14, skin);
    ball(0, 1.92, 0, 0.34, 0.42, 0.3, skin);

    // 머리카락
    ball(0, 2.12, -0.01, 0.35, 0.3, 0.31, hair);
    ball(0, 2.22, 0.12, 0.27, 0.13, 0.2, hair);

    // 귀
    ball(-0.34, 1.91, 0, 0.07, 0.11, 0.08, skin);
    ball(0.34, 1.91, 0, 0.07, 0.11, 0.08, skin);

    // 눈
    ball(-0.12, 1.98, 0.27, 0.035, 0.045, 0.025, eyes);
    ball(0.12, 1.98, 0.27, 0.035, 0.045, 0.025, eyes);

    // 코
    ball(0, 1.89, 0.3, 0.055, 0.08, 0.06, skin);

    // 입
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.025, 0.025),
      new THREE.MeshStandardMaterial({
        color: 0x8f4747
      })
    );

    mouth.position.set(0, 1.78, 0.29);
    group.add(mouth);

    // 팔
    const armLeft = box(
      -0.39, 1.05, 0, 0.16, 0.65, 0.17, clothes
    );

    const armRight = box(
      0.39, 1.05, 0, 0.16, 0.65, 0.17, clothes
    );

    armLeft.rotation.z = -0.1;
    armRight.rotation.z = 0.1;

    // 손
    ball(-0.4, 0.7, 0.02, 0.09, 0.1, 0.09, skin);
    ball(0.4, 0.7, 0.02, 0.09, 0.1, 0.09, skin);

    // 다리
    box(-0.17, 0.32, 0, 0.2, 0.55, 0.22, dark);
    box(0.17, 0.32, 0, 0.2, 0.55, 0.22, dark);

    // 신발
    ball(-0.17, 0.06, 0.08, 0.15, 0.08, 0.25, dark);
    ball(0.17, 0.06, 0.08, 0.15, 0.08, 0.25, dark);

    group.position.set(
      random(-5, 5) * 0.2,
      0,
      -2.5
    );

    // 얼굴이 카메라를 향하도록 설정
    group.rotation.y = 0;

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

      if (Math.abs(difference) > 0.06) {
        person.position.z +=
          Math.sign(difference) * delta * 1.8;

        person.rotation.z =
          Math.sin(Date.now() * 0.01) * 0.025;

      } else {
        person.position.z = target;
        person.userData.walking = false;
        person.rotation.z = 0;

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
    if (
      !state.camera ||
      !state.renderer ||
      !el.sceneContainer
    ) return;

    const width = Math.max(el.sceneContainer.clientWidth, 1);
    const height = Math.max(el.sceneContainer.clientHeight, 1);

    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();

    state.renderer.setSize(width, height);
  }

  // -----------------------------------
  // 버튼 연결 및 시작
  // -----------------------------------

  function connectButtons() {
    if (el.startButton) {
      el.startButton.addEventListener("click", startGame);
    }

    if (el.callButton) {
      el.callButton.addEventListener("click", callCustomer);
    }

    if (el.finishButton) {
      el.finishButton.addEventListener("click", finishCustomer);
    }
  }

  function main() {
    connectButtons();

    if (el.customerPanel) {
      el.customerPanel.style.display = "none";
    }

    if (el.finishButton) {
      el.finishButton.style.display = "none";
    }

    if (el.callButton) {
      el.callButton.disabled = false;
    }

    if (el.day) {
      el.day.textContent = "영업일";
    }

    updateHUD();
    renderQueue();

    initializeThree();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main, {
      once: true
    });
  } else {
    main();
  }

})();
