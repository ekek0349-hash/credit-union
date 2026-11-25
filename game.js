
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

(() => {
  "use strict";

  if (window.__CHUNCHEON_CU_GAME_V3__) return;
  window.__CHUNCHEON_CU_GAME_V3__ = true;

  const $ = (id) => document.getElementById(id);

  const ui = {
    scene: $("scene-container"),
    day: $("day"),
    clock: $("clock"),
    sales: $("sales"),
    satisfaction: $("satisfaction"),
    queuePanel: $("queue-panel"),
    queueList: $("queue-list"),
    waitingCount: $("waiting-count"),
    callButton: $("call-button"),
    customerPanel: $("customer-panel"),
    customerName: $("customer-name"),
    customerNumber: $("customer-number"),
    customerInfo: $("customer-info"),
    customerAvatar: $("customer-avatar"),
    customerMessage: $("customer-message"),
    feedback: $("feedback"),
    trustScore: $("trust-score"),
    trustBar: $("trust-bar"),
    stepCount: $("step-count"),
    progressBar: $("progress-bar"),
    answer: $("written-answer"),
    submit: $("submit-answer"),
    finish: $("finish-button"),
    evaluationPanel: $("evaluation-panel"),
    evaluationScore: $("evaluation-score"),
    evaluationGrade: $("evaluation-grade"),
    evaluationDetails: $("evaluation-details"),
    evaluationComment: $("evaluation-comment"),
    nextButton: $("next-customer-button"),
    startScreen: $("start-screen"),
    startButton: $("start-button"),
    toast: $("toast")
  };

  const state = {
    started: false,
    minutes: 9 * 60,
    completed: 0,
    totalSatisfaction: 100,
    queue: [],
    current: null,
    step: 0,
    trust: 50,
    answers: [],
    scores: [],
    customerObject: null,
    customerTargetZ: 2.7,
    customerMoving: false,
    customerMood: "neutral",
    nextId: 1,
    lastTick: 0,
    toastTimer: null
  };

  const customerTypes = [
    {
      type: "정기예금",
      emoji: "👨",
      age: "50대",
      gender: "남성",
      name: "김영수",
      intro: "목돈 5천만 원의 예치 방법을 알아보러 오셨습니다.",
      concern: "안정적으로 목돈을 맡기고 싶어 합니다.",
      questions: [
        "목돈이 생겼는데 어디에 맡기는 게 좋을까요?",
        "예금 기간은 어떻게 정하는 게 좋을까요?",
        "예금자보호나 중도해지 조건도 궁금합니다."
      ]
    },
    {
      type: "예금 재예치",
      emoji: "👩",
      age: "60대",
      gender: "여성",
      name: "박정희",
      intro: "다른 금융기관 예금 만기 자금을 재예치하려고 합니다.",
      concern: "금리와 예치 기간을 비교하고 싶어 합니다.",
      questions: [
        "다른 은행 예금이 만기됐는데 이쪽 금리는 어떤가요?",
        "제 상황에 맞는 예치 기간을 추천해 주실 수 있나요?",
        "세금이나 예금 보호에 대해서도 설명해 주세요."
      ]
    },
    {
      type: "햇살론",
      emoji: "👨",
      age: "40대",
      gender: "남성",
      name: "이민호",
      intro: "생활자금 마련을 위해 서민금융 상담을 요청했습니다.",
      concern: "현재 소득과 부채 상황에 맞는 대출을 알고 싶어 합니다.",
      questions: [
        "햇살론을 신청할 수 있는지 궁금해서 왔습니다.",
        "어떤 서류를 준비해야 하나요?",
        "금리와 상환 기간은 어떻게 정해지나요?"
      ]
    },
    {
      type: "전세론",
      emoji: "👩",
      age: "30대",
      gender: "여성",
      name: "최수진",
      intro: "전세자금대출 신규 상담을 요청했습니다.",
      concern: "보증 가능 여부와 필요 서류를 알고 싶어 합니다.",
      questions: [
        "전세자금대출을 받고 싶은데 가능한가요?",
        "보증기관 심사는 어떻게 진행되나요?",
        "계약서 외에 어떤 서류가 필요한가요?"
      ]
    },
    {
      type: "담보대출",
      emoji: "👨",
      age: "50대",
      gender: "남성",
      name: "정태식",
      intro: "아파트를 담보로 사업자금을 마련하려고 합니다.",
      concern: "담보가치와 상환 능력을 함께 검토하고 싶어 합니다.",
      questions: [
        "아파트 담보로 대출을 받을 수 있을까요?",
        "대출 가능 금액은 어떻게 산정되나요?",
        "소득이나 기존 대출도 확인하나요?"
      ]
    },
    {
      type: "출자금",
      emoji: "👵",
      age: "60대",
      gender: "여성",
      name: "윤미자",
      intro: "신협 출자금과 조합원 혜택에 대해 문의했습니다.",
      concern: "출자금의 특징과 유의사항을 알고 싶어 합니다.",
      questions: [
        "출자금은 예금과 어떤 차이가 있나요?",
        "출자금에 가입하면 어떤 혜택이 있나요?",
        "필요할 때 바로 찾을 수 있는 돈인가요?"
      ]
    },
    {
      type: "화재공제",
      emoji: "👨",
      age: "40대",
      gender: "남성",
      name: "한성민",
      intro: "상가 화재 위험과 기존 보험 보장을 점검하고 싶어 합니다.",
      concern: "현재 가입한 보험의 보장 공백을 확인하고 싶어 합니다.",
      questions: [
        "가게 화재보험을 준비해야 할까요?",
        "어떤 부분을 보장받을 수 있나요?",
        "이미 가입한 보험이 있는데 중복 여부를 확인할 수 있나요?"
      ]
    },
    {
      type: "적금",
      emoji: "👩",
      age: "20대",
      gender: "여성",
      name: "김하늘",
      intro: "첫 직장을 다니며 목돈 마련을 위해 방문했습니다.",
      concern: "매월 부담 없이 저축하는 방법을 찾고 있습니다.",
      questions: [
        "처음 저축을 시작하려는데 어떤 상품이 좋을까요?",
        "매월 얼마씩 넣는 게 좋을까요?",
        "중간에 해지하면 어떻게 되나요?"
      ]
    },
    {
      type: "대출 연장",
      emoji: "👨",
      age: "40대",
      gender: "남성",
      name: "박성진",
      intro: "기존 대출 만기가 다가와 연장 상담을 요청했습니다.",
      concern: "연장 심사와 준비 서류를 확인하고 싶어 합니다.",
      questions: [
        "대출 만기가 다가오는데 연장할 수 있을까요?",
        "연장 심사 때 어떤 내용을 확인하나요?",
        "미리 준비해야 할 서류가 있을까요?"
      ]
    }
  ];

  const adviceWords = [
    "확인", "안내", "설명", "상황", "목적", "필요", "조건",
    "금리", "기간", "소득", "서류", "상환", "심사", "보증",
    "보호", "유의", "비교", "상담", "확인해", "말씀"
  ];

  function makeCustomer() {
    const template = customerTypes[
      Math.floor(Math.random() * customerTypes.length)
    ];

    return {
      ...template,
      id: state.nextId++,
      ticket: String(state.nextId - 1).padStart(3, "0"),
      trust: 50,
      mood: "neutral"
    };
  }

  function addCustomers(count) {
    for (let i = 0; i < count; i++) {
      state.queue.push(makeCustomer());
    }
    renderQueue();
  }

  function renderQueue() {
    ui.waitingCount.textContent = `${state.queue.length}명`;
    ui.queueList.innerHTML = "";

    state.queue.slice(0, 8).forEach((customer, index) => {
      const item = document.createElement("div");
      item.className = "queue-item";
      item.innerHTML = `
        <div class="queue-avatar">${customer.emoji}</div>
        <div>
          <strong>${index + 1}번 · ${customer.name}</strong>
          <small>${customer.age} · ${customer.type}</small>
        </div>
      `;
      ui.queueList.appendChild(item);
    });

    ui.callButton.disabled =
      !state.started ||
      !!state.current ||
      state.queue.length === 0 ||
      state.customerMoving;
  }

  function updateClock() {
    const hours = Math.floor(state.minutes / 60);
    const minutes = state.minutes % 60;
    ui.clock.textContent =
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function toast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      ui.toast.classList.remove("show");
    }, 2300);
  }

  function showFeedback(message, good) {
    ui.feedback.textContent = message;
    ui.feedback.classList.remove("hidden");
    ui.feedback.style.background = good ? "#e8f5ed" : "#fff3e5";
    ui.feedback.style.color = good ? "#236d4c" : "#8a5a22";
  }

  function setMood(mood) {
    state.customerMood = mood;
    if (!state.customerObject) return;

    const face = state.customerObject.userData;
    if (face.mouth) {
      face.mouth.scale.y =
        mood === "happy" ? 1.7 :
        mood === "angry" ? 0.45 : 1;
    }
    if (face.brows) {
      face.brows.rotation.z =
        mood === "angry" ? 0.25 :
        mood === "happy" ? -0.08 : 0;
    }
  }

  function openCustomer(customer) {
    state.current = customer;
    state.step = 0;
    state.trust = 50;
    state.answers = [];
    state.scores = [];

    ui.queuePanel.classList.add("hidden");
    ui.customerPanel.classList.remove("hidden");
    ui.evaluationPanel.classList.add("hidden");

    ui.customerName.textContent = customer.name;
    ui.customerNumber.textContent = `${customer.ticket}번`;
    ui.customerInfo.textContent =
      `${customer.age} ${customer.gender} · ${customer.type}`;
    ui.customerAvatar.textContent = customer.emoji;
    ui.trustScore.textContent = state.trust;
    ui.trustBar.style.width = `${state.trust}%`;

    ui.customerMessage.textContent =
      `안녕하세요. ${customer.intro} ${customer.questions[0]}`;

    ui.feedback.classList.add("hidden");
    ui.answer.value = "";
    ui.answer.disabled = false;
    ui.submit.disabled = false;
    ui.submit.classList.remove("hidden");
    ui.finish.classList.add("hidden");

    updateStep();
    createCustomer3D(customer);
    state.customerTargetZ = 2.7;
    state.customerMoving = true;
    renderQueue();
    toast(`${customer.name} 고객이 창구로 이동하고 있습니다.`);
  }

  function updateStep() {
    const total = state.current.questions.length;
    ui.stepCount.textContent = `상담 ${state.step + 1} / ${total}`;
    ui.progressBar.style.width = `${(state.step / total) * 100}%`;
  }

  function analyzeAnswer(answer, customer, step) {
    const text = answer.trim();
    const lower = text.toLowerCase();

    const hasCourtesy =
      /안녕|감사|말씀|도와|안내|확인해 드리|설명해 드리/.test(text);
    const hasQuestion =
      /언제|얼마|어떤|무엇|목적|상황|기간|소득|기존|필요/.test(text);
    const hasCaution =
      /심사|조건|약관|유의|변동|확정|보장|중도해지|확인 후|개별/.test(text);
    const hasProduct =
      adviceWords.some(word => lower.includes(word));
    const hasFalsePromise =
      /무조건|100% 승인|반드시 승인|무조건 가능|확실히 됩니다|무조건 됩니다/.test(text);

    let score = 45;
    if (text.length >= 20) score += 10;
    if (text.length >= 45) score += 8;
    if (hasCourtesy) score += 8;
    if (hasQuestion) score += 12;
    if (hasProduct) score += 10;
    if (hasCaution) score += 10;
    if (hasFalsePromise) score -= 25;

    score = Math.max(15, Math.min(98, score));

    let reaction;
    let mood;

    if (score >= 78) {
      mood = "happy";
      reaction = [
        "아, 그렇게 설명해 주시니 이해가 잘 되네요. 제 상황도 고려해 주셔서 감사합니다.",
        "네, 그런 부분까지 확인해 주시는군요. 조금 안심이 됩니다.",
        "좋습니다. 제가 궁금했던 부분을 잘 짚어 주셨네요."
      ][Math.floor(Math.random() * 3)];
    } else if (score >= 55) {
      mood = "neutral";
      reaction = [
        "네, 알겠습니다. 그런데 제 경우에는 조금 더 자세히 알고 싶습니다.",
        "설명 감사합니다. 제가 이해한 게 맞는지 한 번 더 확인하고 싶어요.",
        "그렇군요. 추가로 확인해야 할 부분도 있을까요?"
      ][Math.floor(Math.random() * 3)];
    } else {
      mood = "angry";
      reaction = [
        "아직 조금 막연하게 느껴지네요. 제 상황에 맞춰 다시 설명해 주실 수 있을까요?",
        "그 부분만으로는 결정하기 어려울 것 같습니다. 조금 더 구체적으로 알려주세요.",
        "제가 궁금한 점이 아직 해결되지 않았어요."
      ][Math.floor(Math.random() * 3)];
    }

    if (hasFalsePromise) {
      reaction = "승인이 확실하다는 말씀이신가요? 심사 결과가 달라질 수도 있는 것 아닌가요?";
    }

    return { score, reaction, mood };
  }

  function submitAnswer() {
    if (!state.current || state.customerMoving) return;

    const answer = ui.answer.value.trim();
    if (answer.length < 3) {
      toast("고객에게 전달할 답변을 입력해 주세요.");
      ui.answer.focus();
      return;
    }

    const result = analyzeAnswer(answer, state.current, state.step);
    state.answers.push(answer);
    state.scores.push(result.score);

    state.trust = Math.max(
      0,
      Math.min(100, state.trust + Math.round((result.score - 60) / 5))
    );

    ui.trustScore.textContent = state.trust;
    ui.trustBar.style.width = `${state.trust}%`;
    setMood(result.mood);

    ui.customerMessage.textContent = result.reaction;
    showFeedback(
      result.score >= 78
        ? `좋은 응대입니다. 고객이 설명을 긍정적으로 받아들였습니다. (+${result.score}점)`
        : result.score >= 55
          ? `기본적인 안내는 전달됐습니다. 고객의 추가 질문에 더 구체적으로 답해 보세요. (${result.score}점)`
          : `설명이 충분하지 않았습니다. 고객의 상황과 질문을 먼저 파악해 보세요. (${result.score}점)`,
      result.score >= 78
    );

    ui.answer.value = "";
    ui.answer.focus();

    state.step++;

    if (state.step >= state.current.questions.length) {
      ui.submit.classList.add("hidden");
      ui.answer.disabled = true;
      ui.finish.classList.remove("hidden");
      ui.progressBar.style.width = "100%";
      ui.stepCount.textContent = "상담 질문 완료";
      ui.customerMessage.textContent +=
        "\n\n감사합니다. 설명을 잘 들었습니다. 이제 상담을 마무리하겠습니다.";
      toast("상담 질문이 모두 끝났습니다. 상담을 마무리해 주세요.");
    } else {
      updateStep();
      const nextQuestion = state.current.questions[state.step];
      setTimeout(() => {
        if (!state.current) return;
        ui.customerMessage.textContent =
          `${result.reaction}\n\n그런데 한 가지 더 여쭤볼게요. ${nextQuestion}`;
      }, 650);
    }
  }

  function finishCustomer() {
    if (!state.current) return;

    const customer = state.current;
    const average = Math.round(
      state.scores.reduce((a, b) => a + b, 0) /
      Math.max(1, state.scores.length)
    );

    const trustBonus = Math.round(state.trust * 0.15);
    const totalScore = Math.max(
      0,
      Math.min(100, Math.round(average * 0.85 + trustBonus))
    );

    state.completed++;
    state.totalSatisfaction = Math.round(
      ((state.totalSatisfaction * (state.completed - 1)) + totalScore) /
      state.completed
    );

    ui.sales.textContent = `${state.completed}건`;
    ui.satisfaction.textContent = `${state.totalSatisfaction}점`;

    showEvaluation(totalScore, customer);
    state.current = null;
    state.customerMoving = false;
    renderQueue();
  }

  function showEvaluation(score, customer) {
    ui.customerPanel.classList.add("hidden");
    ui.evaluationPanel.classList.remove("hidden");

    ui.evaluationScore.textContent = `${score}점`;

    const grade =
      score >= 90 ? "매우 우수" :
      score >= 80 ? "우수" :
      score >= 65 ? "보통" : "개선 필요";

    ui.evaluationGrade.textContent = grade;

    const average = Math.round(
      state.scores.reduce((a, b) => a + b, 0) /
      Math.max(1, state.scores.length)
    );

    const detailScores = [
      ["고객 니즈 파악", Math.min(100, average + (state.answers.some(a => /목적|상황|필요|언제|어떤/.test(a)) ? 8 : -5))],
      ["금융상품 전문성", Math.min(100, average + (state.answers.some(a => /금리|기간|심사|보증|상품|조건/.test(a)) ? 7 : -5))],
      ["친절한 응대", Math.min(100, average + (state.answers.some(a => /감사|말씀|도와|안내|설명/.test(a)) ? 8 : -5))],
      ["상담 완성도", Math.min(100, average + (state.answers.some(a => /유의|확인|서류|중도|상환|약관/.test(a)) ? 7 : -5))]
    ];

    ui.evaluationDetails.innerHTML = detailScores.map(([name, value]) => `
      <div class="eval-row">
        <span>${name}</span>
        <strong>${value}점</strong>
      </div>
    `).join("");

    let comment = "";
    if (score >= 90) {
      comment = `${customer.name} 고객의 상담을 훌륭하게 마무리했습니다. 고객의 상황을 고려한 설명과 친절한 응대가 돋보였습니다. 앞으로도 상품의 주요 조건과 유의사항을 빠짐없이 안내해 주세요.`;
    } else if (score >= 80) {
      comment = `${customer.name} 고객에게 전반적으로 좋은 상담을 제공했습니다. 기본적인 설명이 잘 이루어졌습니다. 고객의 자금 목적과 세부 상황을 조금 더 구체적으로 확인하면 더욱 완성도 높은 상담이 될 수 있습니다.`;
    } else if (score >= 65) {
      comment = `${customer.name} 고객에게 기본적인 안내를 제공했지만, 일부 설명이 다소 부족했습니다. 상품을 바로 권유하기보다는 고객의 목적과 상황을 먼저 파악하고 조건과 유의사항을 구체적으로 설명하는 연습이 필요합니다.`;
    } else {
      comment = `${customer.name} 고객이 충분한 설명을 듣지 못했다고 느낄 수 있습니다. 고객의 질문을 먼저 파악하고, 확인되지 않은 사항을 확정적으로 안내하지 않도록 주의해 주세요.`;
    }

    ui.evaluationComment.textContent = comment;
    ui.nextButton.textContent = "다음 고객 맞이하기";
    ui.queuePanel.classList.add("hidden");
  }

  ui.callButton.addEventListener("click", () => {
    if (!state.started || state.current || state.queue.length === 0) return;
    const customer = state.queue.shift();
    openCustomer(customer);
  });

  ui.submit.addEventListener("click", submitAnswer);
  ui.finish.addEventListener("click", finishCustomer);

  ui.answer.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitAnswer();
    }
  });

  ui.nextButton.addEventListener("click", () => {
    ui.evaluationPanel.classList.add("hidden");
    ui.queuePanel.classList.remove("hidden");

    if (state.queue.length === 0) {
      addCustomers(3);
    }

    renderQueue();
    toast("다음 고객을 맞이할 준비가 됐습니다.");
  });

  ui.startButton.addEventListener("click", () => {
    state.started = true;
    ui.startScreen.classList.add("hidden");
    addCustomers(6);
    renderQueue();
    toast("영업을 시작합니다. 다음 고객을 호출해 주세요.");
  });

  // -------------------------------
  // 3D 은행 내부 구성
  // -------------------------------

  let scene;
  let camera;
  let renderer;
  let clock3D;
  let roomReady = false;
  let resizeObserver;

  const materials = {};

  function mat(color, roughness = 0.8, metalness = 0) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness
    });
  }

  function box(parent, name, x, y, z, sx, sy, sz, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      material
    );
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function cylinder(parent, x, y, z, radiusTop, radiusBottom, height, material) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24),
      material
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function createRoom() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc9d9dc);
    scene.fog = new THREE.Fog(0xc9d9dc, 17, 42);

    camera = new THREE.PerspectiveCamera(
      65,
      ui.scene.clientWidth / ui.scene.clientHeight,
      0.1,
      100
    );

    // 직원이 앉아 손님을 바라보는 1인칭 위치
    camera.position.set(0, 1.65, -7.5);
    camera.lookAt(0, 1.45, 3.5);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(ui.scene.clientWidth, ui.scene.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    ui.scene.appendChild(renderer.domElement);

    clock3D = new THREE.Clock();

    const hemi = new THREE.HemisphereLight(0xffffff, 0x73817d, 2.0);
    scene.add(hemi);

    const mainLight = new THREE.DirectionalLight(0xfff3dc, 2.2);
    mainLight.position.set(-4, 9, -3);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    scene.add(mainLight);

    const frontLight = new THREE.PointLight(0xffffff, 35, 20);
    frontLight.position.set(0, 5, 4);
    scene.add(frontLight);

    materials.floor = mat(0x9da9a3);
    materials.wall = mat(0xe6e8df);
    materials.dark = mat(0x234b4c);
    materials.wood = mat(0x795a40);
    materials.counter = mat(0x365d59);
    materials.white = mat(0xf5f5ed);
    materials.black = mat(0x202a2c);
    materials.glass = new THREE.MeshStandardMaterial({
      color: 0xc8e3e7,
      transparent: true,
      opacity: 0.25,
      roughness: 0.15,
      metalness: 0.1
    });

    // 바닥과 벽
    box(scene, "floor", 0, -0.12, 3, 22, 0.2, 26, materials.floor);
    box(scene, "back-wall", 0, 3.4, 12, 22, 7, 0.25, materials.wall);
    box(scene, "left-wall", -11, 3.4, 3, 0.25, 7, 18, materials.wall);
    box(scene, "right-wall", 11, 3.4, 3, 0.25, 7, 18, materials.wall);

    // 후면 신협 간판
    box(scene, "sign-board", 0, 4.9, 11.75, 6.8, 1.25, 0.2, materials.dark);
    box(scene, "sign-inner", 0, 4.9, 11.62, 6.4, 0.95, 0.04, materials.white);

    // 안내판 장식
    box(scene, "logo-green", -2.45, 4.9, 11.56, 0.58, 0.58, 0.08, mat(0x16835d));
    box(scene, "logo-white", -2.45, 4.9, 11.50, 0.32, 0.32, 0.04, mat(0xffffff));

    // 벽면 창문
    box(scene, "window-frame", -7, 3.5, 11.75, 4.5, 2.7, 0.16, mat(0x647b7e));
    box(scene, "window-glass", -7, 3.5, 11.63, 4.25, 2.45, 0.04, mat(0xb8d8e2));

    // 창구 카운터: 직원 앞, 고객 맞은편
    box(scene, "counter-front", 0, 0.72, 0.15, 10, 1.15, 0.55, materials.counter);
    box(scene, "counter-top", 0, 1.34, 0.15, 10.2, 0.14, 0.75, materials.wood);

    // 유리 칸막이
    box(scene, "glass-partition", 0, 2.15, 0.55, 9.8, 1.45, 0.045, materials.glass);
    box(scene, "glass-support-left", -4.85, 2.1, 0.55, 0.06, 1.6, 0.08, mat(0x718a88));
    box(scene, "glass-support-right", 4.85, 2.1, 0.55, 0.06, 1.6, 0.08, mat(0x718a88));

    // 직원 개인 책상 - 화면 아래쪽 전경
    box(scene, "employee-desk", 0, 0.73, -2.2, 7.5, 0.16, 2.1, materials.wood);
    box(scene, "desk-front", 0, 0.35, -1.35, 7.1, 0.65, 0.15, materials.dark);

    // 모니터
    box(scene, "monitor-stand", 0, 1.05, -2.45, 0.16, 0.48, 0.16, materials.black);
    box(scene, "monitor", 0, 1.65, -2.62, 1.9, 1.15, 0.13, materials.black);
    box(scene, "monitor-screen", 0, 1.66, -2.535, 1.72, 0.96, 0.025, mat(0x8bb5b4));

    // 모니터 화면 안의 가로줄
    for (let i = 0; i < 5; i++) {
      box(
        scene,
        "screen-line",
        -0.48,
        1.95 - i * 0.14,
        -2.515,
        0.85 + (i % 2) * 0.3,
        0.025,
        0.012,
        mat(0xe2f0e9)
      );
    }

    // 키보드
    box(scene, "keyboard", 0, 0.88, -1.35, 1.6, 0.07, 0.48, materials.black);
    for (let i = 0; i < 4; i++) {
      box(scene, "keyboard-row", 0, 0.925, -1.51 + i * 0.1, 1.35, 0.015, 0.018, mat(0xc2c9c5));
    }

    // 마우스
    const mouse = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 12),
      materials.black
    );
    mouse.scale.set(0.8, 0.45, 1.3);
    mouse.position.set(1.05, 0.88, -1.35);
    scene.add(mouse);

    // 서류철
    box(scene, "document", -2.1, 0.86, -1.5, 0.85, 0.05, 0.62, mat(0xf1eee2));
    box(scene, "document-cover", -2.1, 0.9, -1.5, 0.88, 0.025, 0.65, mat(0x477a68));

    // 전화기
    box(scene, "phone", 2.1, 0.88, -1.55, 0.62, 0.12, 0.38, materials.black);

    // 고객 대기 의자
    for (let i = 0; i < 4; i++) {
      const x = -7.5 + i * 2.1;
      box(scene, "waiting-seat", x, 0.55, 7.5, 1.35, 0.15, 0.65, mat(0x496d6c));
      box(scene, "waiting-back", x, 1.05, 7.85, 1.35, 0.9, 0.15, mat(0x496d6c));
      for (const legX of [-0.48, 0.48]) {
        cylinder(scene, x + legX, 0.25, 7.5, 0.045, 0.045, 0.5, materials.black);
      }
    }

    // 화분
    cylinder(scene, -9, 0.35, 3, 0.35, 0.48, 0.7, mat(0x9a6746));
    for (let i = 0; i < 7; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 10),
        mat(0x397b50)
      );
      leaf.scale.set(0.7, 1.4, 0.7);
      leaf.position.set(-9 + Math.sin(i) * 0.3, 1.05 + (i % 2) * 0.15, 3 + Math.cos(i) * 0.3);
      scene.add(leaf);
    }

    // 천장 조명
    for (let i = 0; i < 5; i++) {
      box(scene, "ceiling-light", -8 + i * 4, 6.7, 4, 2.1, 0.08, 0.65, mat(0xffffff));
    }

    roomReady = true;
    onResize();
    animate();
  }

  function createCustomer3D(customer) {
    if (state.customerObject) {
      scene.remove(state.customerObject);
      state.customerObject = null;
    }

    const group = new THREE.Group();
    group.position.set(0, 0, 8.2);

    const skin = mat(
      customer.gender === "여성" ? 0xf0c6a5 : 0xe6b995
    );
    const hair = mat(
      customer.gender === "여성" ? 0x302522 : 0x252321
    );
    const clothes = mat(
      [0x355d75, 0x6a526f, 0x496b55, 0x7a5945, 0x3c536d][customer.id % 5]
    );
    const pants = mat(0x343d47);

    // 몸통
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.25, 0.48),
      clothes
    );
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    // 목과 얼굴
    cylinder(group, 0, 2.0, 0, 0.14, 0.14, 0.28, skin);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.43, 24, 20),
      skin
    );
    head.scale.set(0.88, 1.1, 0.9);
    head.position.set(0, 2.45, 0);
    head.castShadow = true;
    group.add(head);

    // 머리카락
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hair
    );
    hairCap.scale.set(0.95, 0.85, 0.95);
    hairCap.position.set(0, 2.62, -0.02);
    group.add(hairCap);

    // 눈
    const eyeMat = mat(0x211d1a);
    const eyeWhite = mat(0xffffff);

    for (const x of [-0.15, 0.15]) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 12, 10),
        eyeWhite
      );
      eye.position.set(x, 2.48, 0.365);
      group.add(eye);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.027, 10, 8),
        eyeMat
      );
      pupil.position.set(x, 2.48, 0.41);
      group.add(pupil);
    }

    // 코
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 10),
      skin
    );
    nose.scale.set(0.8, 0.8, 0.8);
    nose.position.set(0, 2.35, 0.4);
    group.add(nose);

    // 입
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.035, 0.025),
      mat(0x8e4944)
    );
    mouth.position.set(0, 2.22, 0.39);
    group.add(mouth);

    // 팔
    const arms = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.95, 0.25),
        clothes
      );
      arm.position.set(side * 0.58, 1.3, 0);
      arm.rotation.z = side * -0.08;
      group.add(arm);
      arms.push(arm);
    }

    // 다리
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.8, 0.34),
        pants
      );
      leg.position.set(side * 0.23, 0.4, 0);
      group.add(leg);
    }

    group.userData.mouth = mouth;
    group.userData.arms = arms;
    group.userData.brows = { rotation: { z: 0 } };
    group.userData.walkStart = 0;

    scene.add(group);
    state.customerObject = group;
    setMood("neutral");
  }

  function onResize() {
    if (!renderer || !camera) return;

    const width = Math.max(1, ui.scene.clientWidth);
    const height = Math.max(1, ui.scene.clientHeight);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  }

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock3D.getDelta(), 0.05);

    if (state.customerObject) {
      const person = state.customerObject;

      if (state.customerMoving) {
        const distance = person.position.z - state.customerTargetZ;
        if (distance > 0.06) {
          person.position.z -= Math.min(distance, delta * 2.0);
          const swing = Math.sin(performance.now() * 0.012) * 0.18;
          person.userData.arms[0].rotation.x = swing;
          person.userData.arms[1].rotation.x = -swing;
        } else {
          person.position.z = state.customerTargetZ;
          state.customerMoving = false;
          person.userData.arms.forEach(arm => arm.rotation.x = 0);
          toast("고객이 창구에 도착했습니다. 상담을 시작해 주세요.");
          ui.answer.focus();
        }
      } else {
        person.position.y = Math.sin(performance.now() * 0.002) * 0.015;
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function startClock() {
    setInterval(() => {
      if (!state.started) return;
      state.minutes++;
      updateClock();

      if (state.minutes >= 12 * 60 && !state.current) {
        state.minutes = 13 * 60;
      }

      if (state.minutes >= 18 * 60) {
        state.minutes = 9 * 60;
        toast("다음 영업일이 시작됐습니다.");
      }
    }, 2000);
  }

  function init() {
    updateClock();
    ui.sales.textContent = "0건";
    ui.satisfaction.textContent = "100점";

    try {
      createRoom();
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(ui.scene);
    } catch (error) {
      console.error("3D 장면 초기화 오류:", error);
      toast("3D 화면을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
    }

    startClock();
  }

  init();
})();
