
"use strict";

/* =========================================
   춘천신협 금융창구 시뮬레이터
   직원 고정형 / 다단계 상담 시스템
========================================= */

const $ = (id) => document.getElementById(id);

const state = {
  started: false,
  day: 1,
  hour: 9,
  minute: 0,
  sales: 0,
  satisfaction: 100,
  completed: 0,
  ticket: 1,
  queue: [],
  current: null,
  stage: 0,
  busy: false,
  selectedTax: null,
  computerTab: "deposit",
  nextCustomerId: 1
};

const customerTemplates = [
  {
    name: "김영수",
    age: 67,
    emoji: "👨🏻‍🦳",
    profile: "퇴계동 거주 · 기존 조합원 · 정기예금 만기",
    purpose: "정기예금 재예치",
    type: "deposit",
    amount: 50000000,
    stages: [
      {
        message: "안녕하세요. 오늘 정기예금이 만기돼서 왔어요. 5천만 원 정도 되는데 다시 예금하려고 합니다.",
        answers: [
          ["먼저 자금 사용 계획과 예치 기간을 여쭤보겠습니다.", "good", "고객이 당장 사용할 자금은 아니라고 합니다."],
          ["요즘 금리가 높으니 무조건 1년으로 가입하세요.", "bad", "고객이 본인의 상황부터 확인해 달라고 합니다."]
        ]
      },
      {
        message: "당장 쓸 돈은 아니에요. 그런데 예금하면 세금이 얼마나 나가는지 궁금하네요. 비과세로 가입할 수 있나요?",
        special: "tax"
      },
      {
        message: "그렇군요. 그런데 비과세종합저축하고 신협에서 말하는 비과세 혜택은 서로 다른 건가요?",
        answers: [
          ["비과세종합저축과 신협 예탁금 세제 혜택은 적용 대상과 한도, 세법상 근거가 서로 다릅니다. 고객님의 자격부터 확인하겠습니다.", "good", "차이를 구분해 설명했습니다."],
          ["둘 다 똑같은 비과세라서 아무거나 선택하셔도 됩니다.", "bad", "고객이 정확한 차이를 다시 설명해 달라고 합니다."]
        ]
      },
      {
        message: "저는 다른 은행에도 예금이 있어요. 거기서 비과세 혜택을 받고 있는지도 확인해야 하나요?",
        answers: [
          ["네. 기존 가입 내역과 통합 한도 및 적용 요건을 확인한 뒤 안내해 드리겠습니다.", "good", "고객이 확인 절차에 동의했습니다."],
          ["다른 은행은 상관없습니다.", "bad", "고객이 한도 관리가 필요하지 않냐고 되묻습니다."]
        ]
      },
      {
        message: "좋습니다. 그러면 1년 정도 맡기고 싶은데 금리와 세후 이자를 비교해서 알려주세요.",
        special: "depositCalc"
      },
      {
        message: "설명 잘 들었습니다. 안내해 주신 조건으로 가입할게요. 필요한 서류가 있을까요?",
        answers: [
          ["신분증과 가입 자격 확인에 필요한 자료를 확인하고, 최종 조건과 약관을 안내하겠습니다.", "good", "가입 절차를 안내했습니다."],
          ["서류는 필요 없으니 바로 가입하겠습니다.", "bad", "고객이 가입 요건 확인을 요청합니다."]
        ]
      }
    ]
  },
  {
    name: "박미숙",
    age: 59,
    emoji: "👩🏻",
    profile: "근화동 거주 · 신규 방문 · 적금 문의",
    purpose: "정기적금 신규",
    type: "deposit",
    amount: 1000000,
    stages: [
      {
        message: "매달 100만 원씩 적금을 들고 싶은데 금리가 어떻게 되나요?",
        answers: [
          ["가입 기간과 월 납입 가능 금액을 확인하고 현재 적용 가능한 상품을 비교해 드리겠습니다.", "good", "고객이 1년 상품을 희망합니다."],
          ["일단 가장 높은 금리 상품으로 가입하시죠.", "bad", "고객이 중도 해지 조건도 궁금해합니다."]
        ]
      },
      {
        message: "1년 정도 생각하고 있어요. 혹시 중간에 돈이 필요하면 어떻게 되나요?",
        answers: [
          ["중도 해지 시 약정금리보다 낮은 중도해지 이율이 적용될 수 있어 조건을 미리 설명드리겠습니다.", "good", "고객이 조건을 이해했습니다."],
          ["언제 해지해도 이자는 똑같습니다.", "bad", "잘못된 안내로 고객 만족도가 하락했습니다."]
        ]
      },
      {
        message: "그럼 만기 때 이자를 얼마나 받을 수 있는지 계산해 주세요.",
        special: "depositCalc"
      },
      {
        message: "좋네요. 월 100만 원으로 가입할게요. 자동이체도 신청할 수 있죠?",
        answers: [
          ["네. 출금 계좌와 이체일을 확인하고 자동이체를 등록해 드리겠습니다.", "good", "가입 의사를 확인했습니다."],
          ["자동이체는 안 됩니다.", "bad", "고객이 다른 방법을 문의합니다."]
        ]
      }
    ]
  },
  {
    name: "이정훈",
    age: 42,
    emoji: "👨🏻",
    profile: "춘천 거주 · 직장인 · 대출 상담",
    purpose: "신용대출 상담",
    type: "loan",
    amount: 20000000,
    stages: [
      {
        message: "생활자금이 조금 필요해서 대출을 알아보려고 왔습니다. 2천만 원 정도 생각하고 있어요.",
        answers: [
          ["현재 소득과 재직기간, 기존 대출 및 신용 상태를 먼저 확인하겠습니다.", "good", "고객이 재직증명서와 소득자료를 준비했다고 합니다."],
          ["2천만 원은 바로 가능합니다.", "bad", "고객이 금리와 심사 기준을 물어봅니다."]
        ]
      },
      {
        message: "회사에 3년째 근무하고 있고 연봉은 4천만 원 정도입니다.",
        answers: [
          ["소득자료와 재직자료를 확인하고 기존 부채와 상환 능력을 함께 검토하겠습니다.", "good", "기본 상담 정보를 확인했습니다."],
          ["연봉만 보면 충분하니 승인될 겁니다.", "bad", "고객이 심사 결과를 확정할 수 있냐고 묻습니다."]
        ]
      },
      {
        message: "기존에 카드론 500만 원이 있는데 이것도 심사에 영향을 주나요?",
        answers: [
          ["네. 카드론을 포함한 전체 부채와 상환 부담을 확인해야 합니다.", "good", "고객이 부채 내역 확인에 동의했습니다."],
          ["카드론은 대출 심사와 관계없습니다.", "bad", "고객이 정확한 설명을 요구합니다."]
        ]
      },
      {
        message: "금리가 어느 정도인지, 매달 얼마씩 갚아야 하는지도 알고 싶습니다.",
        special: "loanCalc"
      },
      {
        message: "필요한 서류를 알려주시면 준비해서 다시 방문하겠습니다.",
        answers: [
          ["신분증, 재직 및 소득 확인자료, 금융거래 확인자료 등을 안내하고 심사 후 결과를 설명드리겠습니다.", "good", "상담이 마무리되었습니다."],
          ["서류 없이 바로 승인 처리하겠습니다.", "bad", "고객이 신중하게 진행하겠다고 합니다."]
        ]
      }
    ]
  },
  {
    name: "최순자",
    age: 73,
    emoji: "👵🏻",
    profile: "근화동 거주 · 조합원 · 출자금 문의",
    purpose: "출자금 및 조합원 상담",
    type: "member",
    amount: 3000000,
    stages: [
      {
        message: "신협에 출자금을 넣으면 예금처럼 이자를 받을 수 있다고 들었어요. 어떤 건가요?",
        answers: [
          ["출자금은 예금과 달리 조합원 자격과 관련된 자금이며 배당은 결산 결과 등에 따라 달라질 수 있습니다.", "good", "고객이 출자금의 의미를 이해했습니다."],
          ["출자금은 예금과 똑같아서 언제든 원금과 이자를 받을 수 있습니다.", "bad", "고객이 출자금과 예금의 차이를 다시 질문합니다."]
        ]
      },
      {
        message: "그럼 출자금은 예금자보호가 되는 건가요?",
        answers: [
          ["출자금은 예금과 보호 구조가 다르므로 예금자보호 대상 여부를 구분해 안내하겠습니다.", "good", "고객이 설명을 이해했습니다."],
          ["예금과 똑같이 보호됩니다.", "bad", "잘못된 안내로 만족도가 하락했습니다."]
        ]
      },
      {
        message: "3백만 원 정도 넣어볼까 하는데 배당은 언제 받을 수 있나요?",
        answers: [
          ["배당은 조합의 결산과 총회 결정 등에 따라 달라지며 확정 수익은 아니라는 점을 안내하겠습니다.", "good", "고객이 조건을 이해했습니다."],
          ["매년 무조건 5%씩 받을 수 있습니다.", "bad", "고객이 확정 배당인지 다시 확인합니다."]
        ]
      },
      {
        message: "좋습니다. 조합원 가입에 필요한 절차를 알려주세요.",
        answers: [
          ["가입 신청서와 신분 확인, 출자금 납입 등 필요한 절차를 안내하겠습니다.", "good", "상담이 마무리되었습니다."],
          ["절차 없이 바로 가입됩니다.", "bad", "고객이 신청 절차를 다시 문의합니다."]
        ]
      }
    ]
  },
  {
    name: "윤태호",
    age: 35,
    emoji: "👨🏻‍💼",
    profile: "춘천 거주 · 자영업자 · 햇살론 문의",
    purpose: "햇살론 상담",
    type: "loan",
    amount: 8000000,
    stages: [
      {
        message: "가게 운영자금이 필요해서 햇살론을 알아보고 있습니다. 신청할 수 있을까요?",
        answers: [
          ["사업자 유형과 영업기간, 소득, 신용 상태 및 기존 채무를 확인한 뒤 보증 상품을 검토하겠습니다.", "good", "고객이 사업자등록증을 준비했다고 합니다."],
          ["사업자면 누구나 받을 수 있습니다.", "bad", "고객이 자격 조건을 물어봅니다."]
        ]
      },
      {
        message: "사업은 2년 정도 했고 매출은 꾸준히 있습니다. 어떤 서류가 필요하죠?",
        answers: [
          ["사업자등록증, 소득 확인자료, 금융거래 관련 자료 등 상품별 필요 서류를 확인하겠습니다.", "good", "서류 안내를 진행했습니다."],
          ["사업자등록증 하나면 무조건 됩니다.", "bad", "고객이 추가 서류를 확인합니다."]
        ]
      },
      {
        message: "보증비율이나 보증료도 제가 부담해야 하나요?",
        answers: [
          ["보증기관과 상품별 보증 조건, 보증료 및 실제 대출금리를 각각 확인해 안내하겠습니다.", "good", "고객이 설명을 이해했습니다."],
          ["보증료는 전혀 없습니다.", "bad", "고객이 비용을 다시 문의합니다."]
        ]
      },
      {
        message: "그럼 제 조건으로 어느 정도 가능한지 확인해 주세요.",
        special: "loanCalc"
      },
      {
        message: "알겠습니다. 심사받으려면 어떤 자료를 더 준비하면 될까요?",
        answers: [
          ["소득과 사업 운영 사실을 확인할 수 있는 자료를 준비해 주시면 보증 심사를 진행하겠습니다.", "good", "상담이 마무리되었습니다."],
          ["자료 없이 바로 실행하겠습니다.", "bad", "고객이 심사 절차를 문의합니다."]
        ]
      }
    ]
  },
  {
    name: "한지영",
    age: 51,
    emoji: "👩🏻‍💼",
    profile: "퇴계동 거주 · 기존 고객 · 공제 상담",
    purpose: "간병인 공제 상담",
    type: "insurance",
    amount: 0,
    stages: [
      {
        message: "전에 가입한 간병인 보험이 있는데 보장이 괜찮은지 한번 확인하고 싶어요.",
        answers: [
          ["기존 가입 증권과 보장 기간, 보장 범위 및 갱신 조건을 먼저 확인하겠습니다.", "good", "고객이 증권을 보여줍니다."],
          ["기존 보험은 해지하고 새로 가입하는 게 좋습니다.", "bad", "고객이 이유를 물어봅니다."]
        ]
      },
      {
        message: "가입한 지 5년 정도 됐고 80세 만기예요. 간호간병통합서비스 보장은 없는 것 같아요.",
        answers: [
          ["보장 공백과 만기 이후 보장 여부를 확인하고 기존 계약을 유지할 때와 변경할 때를 비교하겠습니다.", "good", "고객이 비교 설명을 요청합니다."],
          ["무조건 새 상품이 더 좋습니다.", "bad", "고객이 구체적인 비교를 요청합니다."]
        ]
      },
      {
        message: "새로 가입하면 보험료가 얼마나 나오는지 궁금해요.",
        answers: [
          ["연령과 가입 조건, 보장 금액을 기준으로 설계안을 확인한 뒤 보험료를 비교하겠습니다.", "good", "고객이 설계 상담에 동의했습니다."],
          ["보험료는 누구나 같습니다.", "bad", "고객이 개인별 차이를 질문합니다."]
        ]
      },
      {
        message: "기존 계약을 바로 해지하지 않고 비교할 수 있겠죠?",
        answers: [
          ["네. 새 계약의 인수 여부와 보장 개시 시점 등을 확인하기 전에는 기존 계약을 먼저 해지하지 않도록 안내하겠습니다.", "good", "고객이 안심했습니다."],
          ["기존 계약부터 바로 해지하세요.", "bad", "고객이 상담을 다시 생각하겠다고 합니다."]
        ]
      }
    ]
  }
];

const taxOptions = [
  {
    id: "special",
    title: "비과세종합저축",
    desc: "법령상 가입 대상자 요건을 충족해야 하며, 전 금융기관 통합 한도와 기존 가입액을 확인해야 합니다.",
    rate: 0,
    label: "이자소득 비과세"
  },
  {
    id: "creditUnion",
    title: "신협 예탁금 세제 혜택",
    desc: "조합원 자격, 소득 요건, 가입 시점 및 관련 법령상 한도를 확인해야 합니다. 가입 연도에 따라 비과세 또는 저율 분리과세 적용이 달라질 수 있습니다.",
    rate: 0,
    label: "자격·가입시점 확인 필요"
  },
  {
    id: "normal",
    title: "일반과세",
    desc: "일반적인 이자소득 과세 방식입니다. 기본 계산에서는 이자소득세와 지방소득세를 합산한 15.4%를 적용합니다.",
    rate: 15.4,
    label: "15.4%"
  }
];

/* =========================================
   공통 유틸리티
========================================= */

function money(value) {
  return Math.round(value).toLocaleString("ko-KR") + "원";
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2300);
}

function updateHUD() {
  $("day").textContent = state.day + "일차";
  $("clock").textContent =
    String(state.hour).padStart(2, "0") + ":" +
    String(state.minute).padStart(2, "0");
  $("sales").textContent = money(state.sales);
  $("satisfaction").textContent = state.satisfaction + "%";
  $("completed-count").textContent = state.completed + "건";
  $("waiting-count").textContent = state.queue.length + "명";
  $("queue-count").textContent = state.queue.length;
  $("current-customer").textContent =
    state.current ? state.current.name + " 고객님" : "대기 중";
  $("current-status").textContent =
    state.current ? "상담 진행 중" : "고객을 호출해 주세요.";
  $("next-customer").textContent =
    state.queue.length ? state.queue[0].name + " 고객님" : "-";
  $("next-purpose").textContent =
    state.queue.length ? state.queue[0].purpose : "대기 고객 없음";
  $("call-button").disabled = !state.started || !!state.current || state.busy || state.queue.length === 0;
  $("finish-button").disabled = !state.current || state.busy;
  $("ticket-number").textContent =
    state.current ? "상담 중" : (state.queue.length ? "대기 " + state.queue[0].ticket + "번" : "대기");
}

function addMinutes(amount) {
  state.minute += amount;
  while (state.minute >= 60) {
    state.minute -= 60;
    state.hour++;
  }
  if (state.hour >= 18) {
    state.day++;
    state.hour = 9;
    state.minute = 0;
    toast("영업일이 변경되었습니다. " + state.day + "일차 영업 시작!");
  }
  updateHUD();
}

function createCustomer() {
  const template = customerTemplates[
    Math.floor(Math.random() * customerTemplates.length)
  ];

  const customer = JSON.parse(JSON.stringify(template));
  customer.id = state.nextCustomerId++;
  customer.ticket = state.ticket++;
  customer.name = template.name;
  customer.arrivedAt = state.hour + ":" + state.minute;
  customer.currentStep = 0;
  customer.errors = 0;
  customer.goodAnswers = 0;
  return customer;
}

function addCustomer() {
  const customer = createCustomer();
  state.queue.push(customer);
  renderQueue();
  updateHUD();
  toast(customer.name + " 고객님이 방문했습니다. 대기번호 " + customer.ticket + "번");
}

function renderQueue() {
  const container = $("queue-people");
  container.innerHTML = "";

  state.queue.slice(0, 6).forEach((customer) => {
    const item = document.createElement("div");
    item.className = "queue-person";
    item.innerHTML = `
      <span class="emoji">${customer.emoji}</span>
      <div>
        <strong>${customer.name}</strong>
        <small>${customer.ticket}번 · ${customer.purpose}</small>
      </div>
    `;
    container.appendChild(item);
  });

  if (state.queue.length > 6) {
    const more = document.createElement("div");
    more.className = "queue-person";
    more.innerHTML = `<div><strong>외 ${state.queue.length - 6}명</strong><small>대기 중</small></div>`;
    container.appendChild(more);
  }

  updateHUD();
}

/* =========================================
   게임 시작 / 시간 진행
========================================= */

function startGame() {
  if (state.started) return;

  state.started = true;
  $("start-screen").classList.add("hidden");

  // 처음부터 대기 고객을 생성
  for (let i = 0; i < 4; i++) {
    const customer = createCustomer();
    state.queue.push(customer);
  }

  renderQueue();
  updateHUD();
  toast("영업을 시작합니다. 첫 번째 고객을 호출하세요.");

  // 게임 시간: 3초마다 1분 진행
  setInterval(() => {
    if (!state.started) return;
    addMinutes(1);

    // 게임 시간 4분마다 신규 고객 방문
    if (state.minute % 4 === 0 && state.hour < 18) {
      if (state.queue.length < 10) addCustomer();
    }
  }, 3000);
}

/* =========================================
   고객 호출 및 이동
========================================= */

function callNextCustomer() {
  if (!state.started || state.current || state.busy) return;

  if (state.queue.length === 0) {
    toast("현재 대기 고객이 없습니다.");
    return;
  }

  state.busy = true;
  state.current = state.queue.shift();
  state.stage = 0;

  renderQueue();
  updateHUD();

  const person = $("active-customer");
  person.classList.remove("walking");
  void person.offsetWidth;
  person.classList.add("walking");

  $("customer-avatar").textContent = state.current.emoji;
  $("customer-caption").textContent = state.current.name + " 고객님 이동 중";

  $("current-status").textContent = "고객이 창구로 이동 중입니다.";
  toast(state.current.name + " 고객님을 호출했습니다.");

  setTimeout(() => {
    state.busy = false;
    $("customer-caption").textContent = "상담 중 · " + state.current.name;
    $("dialog").classList.remove("hidden");
    updateHUD();
    showCurrentStage();
  }, 1800);
}

/* =========================================
   상담 진행
========================================= */

function showCurrentStage() {
  if (!state.current) return;

  const customer = state.current;
  const stage = customer.stages[state.stage];

  if (!stage) {
    finishConsultation();
    return;
  }

  $("customer-name").textContent =
    customer.name + " 고객님 · " + (state.stage + 1) + "단계 상담";

  $("customer-profile").innerHTML = `
    <strong>${customer.age}세</strong> · ${customer.profile}<br>
    상담 목적: ${customer.purpose}<br>
    대기번호: ${customer.ticket}번
  `;

  $("customer-message").textContent = stage.message;
  $("dialog-feedback").textContent = "";

  if (stage.special === "tax") {
    renderTaxScreen();
    return;
  }

  if (stage.special === "depositCalc") {
    renderDepositCalculator();
    return;
  }

  if (stage.special === "loanCalc") {
    renderLoanCalculator();
    return;
  }

  const list = $("answer-list");
  list.innerHTML = "";

  stage.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.innerHTML = `<strong>${answer[0]}</strong>`;
    button.addEventListener("click", () => chooseAnswer(answer));
    list.appendChild(button);
  });
}

function chooseAnswer(answer) {
  if (!state.current || state.busy) return;

  const customer = state.current;

  if (answer[1] === "good") {
    customer.goodAnswers++;
    state.satisfaction = Math.min(100, state.satisfaction + 1);
  } else {
    customer.errors++;
    state.satisfaction = Math.max(0, state.satisfaction - 4);
  }

  $("dialog-feedback").textContent = answer[2];
  updateHUD();

  state.busy = true;
  $("answer-list").innerHTML =
    `<button class="primary-button" id="next-stage-button">다음 상담 진행</button>`;

  $("next-stage-button").addEventListener("click", () => {
    state.stage++;
    state.busy = false;
    addMinutes(1);
    showCurrentStage();
  });
}

/* =========================================
   비과세 / 과세 유형 전산 화면
========================================= */

function renderTaxScreen() {
  const list = $("answer-list");

  list.innerHTML = `
    <div class="computer-card">
      <h3>수신 전산 · 과세 유형 확인</h3>
      <p>고객의 가입 자격과 기존 한도를 확인한 뒤 과세 유형을 선택하세요.</p>
      <div class="field">
        <label>고객 조합원 여부</label>
        <select id="tax-member">
          <option value="yes">조합원</option>
          <option value="no">비조합원</option>
        </select>
      </div>
      <div class="field">
        <label>비과세종합저축 가입 자격 확인</label>
        <select id="tax-eligible">
          <option value="unknown">아직 확인하지 않음</option>
          <option value="yes">대상자 요건 충족 확인</option>
          <option value="no">대상자 요건 미충족</option>
        </select>
      </div>
      <div class="field">
        <label>신협 예탁금 세제 혜택 자격 확인</label>
        <select id="cu-eligible">
          <option value="unknown">아직 확인하지 않음</option>
          <option value="yes">관련 요건 충족 확인</option>
          <option value="no">관련 요건 미충족</option>
        </select>
      </div>
      <div class="field">
        <label>기존 금융기관 가입 한도 확인</label>
        <select id="tax-limit">
          <option value="unknown">아직 확인하지 않음</option>
          <option value="yes">한도 확인 완료</option>
          <option value="no">한도 초과 또는 잔여 한도 없음</option>
        </select>
      </div>
    </div>

    <div class="computer-card">
      <h3>과세 유형 선택</h3>
      <p>아래 유형을 선택하면 적용 조건을 확인할 수 있습니다.</p>
      <div id="tax-choice-area"></div>
      <div id="tax-detail"></div>
    </div>
  `;

  const choiceArea = $("tax-choice-area");

  taxOptions.forEach((option) => {
    const card = document.createElement("div");
    card.className = "tax-option";
    card.innerHTML = `
      <strong>${option.title}</strong>
      <small>${option.desc}</small>
      <small><b>과세 안내: ${option.label}</b></small>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".tax-option").forEach((el) => el.classList.remove("selected"));
      card.classList.add("selected");
      state.selectedTax = option.id;
      showTaxDetail(option);
    });

    choiceArea.appendChild(card);
  });
}

function showTaxDetail(option) {
  const detail = $("tax-detail");

  const eligible = $("tax-eligible").value;
  const cuEligible = $("cu-eligible").value;
  const limit = $("tax-limit").value;
  const member = $("tax-member").value;

  let warning = "";

  if (option.id === "special") {
    if (eligible !== "yes" || limit !== "yes") {
      warning = "주의: 비과세종합저축의 가입 자격 또는 잔여 한도가 확인되지 않았습니다. 실제 가입 가능 여부를 확정하지 마세요.";
    } else {
      warning = "자격과 한도 확인 항목을 완료했습니다. 실제 가입 전 전산 및 증빙서류로 최종 확인하세요.";
    }
  }

  if (option.id === "creditUnion") {
    if (member !== "yes" || cuEligible !== "yes" || limit !== "yes") {
      warning = "주의: 조합원 여부, 소득 요건, 가입 시점 및 잔여 한도 등을 추가 확인해야 합니다.";
    } else {
      warning = "입력한 자격 확인 항목은 완료되었습니다. 해당 연도 적용 법령과 전산 기준을 최종 확인하세요.";
    }
  }

  if (option.id === "normal") {
    warning = "일반과세를 선택했습니다. 기본 계산상 이자소득세 및 지방소득세 합계 15.4%를 적용합니다.";
  }

  detail.innerHTML = `
    <div class="result-box">
      <strong>선택한 과세 유형: ${option.title}</strong><br>
      ${warning}
    </div>
    <button class="primary-button" id="confirm-tax" style="margin-top:12px">
      이 과세 유형으로 상담 진행
    </button>
  `;

  $("confirm-tax").addEventListener("click", confirmTaxChoice);
}

function confirmTaxChoice() {
  if (!state.selectedTax) {
    toast("과세 유형을 먼저 선택하세요.");
    return;
  }

  const eligible = $("tax-eligible").value;
  const cuEligible = $("cu-eligible").value;
  const limit = $("tax-limit").value;
  const member = $("tax-member").value;

  let valid = true;
  let explanation = "";

  if (state.selectedTax === "special") {
    valid = eligible === "yes" && limit === "yes";
    explanation = "비과세종합저축은 대상자 자격과 잔여 한도 확인이 필요합니다.";
  } else if (state.selectedTax === "creditUnion") {
    valid = member === "yes" && cuEligible === "yes" && limit === "yes";
    explanation = "신협 예탁금 세제 혜택은 조합원 여부와 해당 연도 적용 요건을 확인해야 합니다.";
  } else {
    valid = true;
    explanation = "일반과세를 선택했습니다.";
  }

  if (!valid) {
    state.current.errors++;
    state.satisfaction = Math.max(0, state.satisfaction - 3);
    updateHUD();
    toast(explanation);
    $("dialog-feedback").textContent = explanation;
    return;
  }

  const selected = taxOptions.find((item) => item.id === state.selectedTax);

  $("dialog-feedback").textContent =
    selected.title + " 선택을 완료했습니다. " + explanation;

  const list = $("answer-list");
  list.innerHTML = `
    <div class="result-box">
      <strong>과세 유형 확인 완료</strong><br>
      ${selected.title}<br>
      고객에게 과세 방식과 적용 조건을 설명한 뒤 다음 상담으로 진행하세요.
    </div>
    <button class="primary-button" id="tax-next" style="margin-top:12px">
      고객에게 설명하고 다음 단계 진행
    </button>
  `;

  $("tax-next").addEventListener("click", () => {
    state.current.goodAnswers++;
    state.satisfaction = Math.min(100, state.satisfaction + 2);
    state.stage++;
    state.selectedTax = null;
    addMinutes(1);
    updateHUD();
    showCurrentStage();
  });
}

/* =========================================
   예금 이자 계산
========================================= */

function renderDepositCalculator() {
  const list = $("answer-list");

  list.innerHTML = `
    <div class="computer-card">
      <h3>정기예금 / 적금 예상 이자 계산</h3>
      <div class="field">
        <label>예치 금액 또는 월 납입액 (원)</label>
        <input id="calc-principal" type="number" min="0" value="${state.current.amount || 50000000}">
      </div>
      <div class="field">
        <label>가입 기간</label>
        <select id="calc-months">
          <option value="6">6개월</option>
          <option value="12" selected>12개월</option>
          <option value="13">13개월</option>
          <option value="24">24개월</option>
        </select>
      </div>
      <div class="field">
        <label>연 금리 (%)</label>
        <input id="calc-rate" type="number" min="0" max="20" step="0.01" value="3.5">
      </div>
      <div class="field">
        <label>과세 유형</label>
        <select id="calc-tax">
          <option value="special">비과세종합저축 (자격 충족 시)</option>
          <option value="creditUnion">신협 예탁금 세제 혜택 (요건 확인 시)</option>
          <option value="normal" selected>일반과세 (15.4%)</option>
        </select>
      </div>
      <button class="primary-button" id="run-deposit-calc">예상 이자 계산</button>
      <div id="deposit-result"></div>
    </div>
    <button class="secondary-button" id="deposit-next">계산 결과 안내 후 다음 상담 진행</button>
  `;

  $("run-deposit-calc").addEventListener("click", calculateDeposit);
  $("deposit-next").addEventListener("click", () => {
    state.stage++;
    addMinutes(1);
    showCurrentStage();
  });
}

function calculateDeposit() {
  const principal = Number($("calc-principal").value);
  const months = Number($("calc-months").value);
  const rate = Number($("calc-rate").value);
  const taxType = $("calc-tax").value;

  if (principal <= 0 || rate < 0 || months <= 0) {
    toast("금액, 기간, 금리를 올바르게 입력하세요.");
    return;
  }

  // 단리 기준의 단순 예상 계산
  const gross = principal * (rate / 100) * (months / 12);
  const taxRate = taxType === "normal" ? 0.154 : 0;
  const tax = gross * taxRate;
  const net = gross - tax;

  $("deposit-result").innerHTML = `
    <div class="result-box">
      <strong>예상 이자 계산 결과</strong><br>
      세전 이자: ${money(gross)}<br>
      예상 세금: ${money(tax)}<br>
      세후 이자: <strong>${money(net)}</strong><br>
      만기 예상 수령액: ${money(principal + net)}
      <p>※ 단순 예상 계산입니다. 실제 이자는 상품별 이자 계산 방식, 납입일, 일수, 세법 및 가입 자격에 따라 달라집니다. 비과세·저율과세 적용 여부는 반드시 전산으로 확인해야 합니다.</p>
    </div>
  `;

  toast("예상 이자를 계산했습니다.");
}

/* =========================================
   대출 간이 상담 계산
========================================= */

function renderLoanCalculator() {
  const list = $("answer-list");

  list.innerHTML = `
    <div class="computer-card">
      <h3>대출 상환액 간이 계산</h3>
      <div class="field">
        <label>대출 희망 금액 (원)</label>
        <input id="loan-principal" type="number" value="${state.current.amount || 10000000}">
      </div>
      <div class="field">
        <label>연 금리 (%)</label>
        <input id="loan-rate" type="number" step="0.1" value="6">
      </div>
      <div class="field">
        <label>상환 기간</label>
        <select id="loan-months">
          <option value="12">12개월</option>
          <option value="36">36개월</option>
          <option value="60" selected>60개월</option>
          <option value="120">120개월</option>
        </select>
      </div>
      <button class="primary-button" id="run-loan-calc">월 상환액 계산</button>
      <div id="loan-result"></div>
    </div>
    <button class="secondary-button" id="loan-next">계산 결과 안내 후 다음 상담 진행</button>
  `;

  $("run-loan-calc").addEventListener("click", calculateLoan);
  $("loan-next").addEventListener("click", () => {
    state.stage++;
    addMinutes(1);
    showCurrentStage();
  });
}

function calculateLoan() {
  const principal = Number($("loan-principal").value);
  const annualRate = Number($("loan-rate").value);
  const months = Number($("loan-months").value);

  if (principal <= 0 || annualRate < 0 || months <= 0) {
    toast("대출 조건을 올바르게 입력하세요.");
    return;
  }

  const monthlyRate = annualRate / 100 / 12;
  let payment;

  if (monthlyRate === 0) {
    payment = principal / months;
  } else {
    payment = principal * monthlyRate /
      (1 - Math.pow(1 + monthlyRate, -months));
  }

  $("loan-result").innerHTML = `
    <div class="result-box">
      <strong>원리금균등상환 간이 계산</strong><br>
      대출금액: ${money(principal)}<br>
      월 예상 상환액: <strong>${money(payment)}</strong><br>
      총 상환 예상액: ${money(payment * months)}<br>
      총 이자 예상액: ${money(payment * months - principal)}
      <p>※ 단순 원리금균등 계산이며 실제 대출 가능 금액이나 승인 결과가 아닙니다. 실제 심사 시 소득, 신용, 기존 부채, 담보 및 보증 조건을 확인해야 합니다.</p>
    </div>
  `;

  toast("월 상환액을 계산했습니다.");
}

/* =========================================
   상담 종료 / 실적 반영
========================================= */

function finishConsultation() {
  if (!state.current) return;

  const customer = state.current;
  const successful = customer.errors === 0;

  $("customer-message").textContent =
    successful
      ? "친절하게 설명해 주셔서 감사합니다. 덕분에 잘 이해했습니다."
      : "설명 감사합니다. 안내해 주신 내용을 다시 한번 확인해 보겠습니다.";

  $("dialog-feedback").textContent =
    "상담 단계가 모두 완료되었습니다. 상담을 종료할 수 있습니다.";

  $("answer-list").innerHTML = `
    <div class="result-box">
      <strong>상담 완료</strong><br>
      고객: ${customer.name} 고객님<br>
      상담 유형: ${customer.purpose}<br>
      진행 단계: ${customer.stages.length}단계<br>
      긍정적인 응대: ${customer.goodAnswers}회<br>
      추가 확인 필요: ${customer.errors}회
    </div>
    <button class="primary-button" id="complete-customer">상담 종료 및 다음 고객 준비</button>
  `;

  $("complete-customer").addEventListener("click", completeCustomer);
}

function completeCustomer() {
  if (!state.current) return;

  const customer = state.current;

  if (customer.type === "deposit") {
    state.sales += customer.amount || 0;
  } else if (customer.type === "member") {
    state.sales += customer.amount || 0;
  } else if (customer.type === "loan") {
    // 대출 상담만으로 실적 확정 처리하지 않음
    state.sales += 0;
  }

  state.completed++;
  state.current = null;
  state.stage = 0;
  state.busy = false;
  state.selectedTax = null;

  $("dialog").classList.add("hidden");
  $("customer-avatar").textContent = "🙂";
  $("customer-caption").textContent = "고객 호출 대기 중";

  renderQueue();
  updateHUD();
  addMinutes(2);

  toast(customer.name + " 고객님 상담이 종료되었습니다.");

  // 상담 후 다음 고객이 없으면 신규 고객 방문
  if (state.queue.length === 0) {
    setTimeout(addCustomer, 1800);
  }
}

function manualFinish() {
  if (!state.current) return;

  const ok = confirm("현재 상담을 종료하시겠습니까?");
  if (!ok) return;

  completeCustomer();
}

/* =========================================
   전산 시스템 탭
========================================= */

function openComputer(tab) {
  state.computerTab = tab;
  $("computer").classList.remove("hidden");
  renderComputerTab();
}

function renderComputerTab() {
  document.querySelectorAll(".computer-tabs button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.computerTab);
  });

  const content = $("computer-content");

  const pages = {
    deposit: `
      <div class="computer-card">
        <h3>수신 업무</h3>
        <p>정기예금, 정기적금, 입출금 계좌, 만기 재예치 및 해지 업무를 처리합니다.</p>
        <button class="answer-button" onclick="toast('정기예금 업무를 선택했습니다.')">정기예금 신규 및 재예치</button>
        <button class="answer-button" onclick="toast('정기적금 업무를 선택했습니다.')">정기적금 신규</button>
        <button class="answer-button" onclick="toast('과세 유형 확인 화면은 비과세 관련 상담에서 열립니다.')">과세 유형 확인</button>
      </div>
    `,
    loan: `
      <div class="computer-card">
        <h3>여신 업무</h3>
        <p>햇살론, 신용대출, 담보대출, 전세대출 등 상담 업무를 처리합니다.</p>
        <button class="answer-button" onclick="toast('대출 상담 업무를 선택했습니다.')">대출 상담 등록</button>
        <button class="answer-button" onclick="toast('소득 및 재직 확인이 필요합니다.')">소득·재직 확인</button>
        <button class="answer-button" onclick="toast('담보 및 선순위 확인이 필요합니다.')">담보물건 확인</button>
      </div>
    `,
    insurance: `
      <div class="computer-card">
        <h3>공제 업무</h3>
        <p>화재공제, 간병인공제, 건강 관련 공제 등 고객 상황에 맞는 보장 내용을 확인합니다.</p>
        <button class="answer-button" onclick="toast('화재공제 상담을 선택했습니다.')">화재공제 상담</button>
        <button class="answer-button" onclick="toast('간병인공제 상담을 선택했습니다.')">간병인공제 상담</button>
        <button class="answer-button" onclick="toast('기존 계약 확인이 필요합니다.')">기존 계약 분석</button>
      </div>
    `,
    member: `
      <div class="computer-card">
        <h3>조합원 업무</h3>
        <p>조합원 가입, 출자금 납입, 조합원 정보 변경 등을 처리합니다.</p>
        <button class="answer-button" onclick="toast('조합원 가입 업무를 선택했습니다.')">조합원 신규 가입</button>
        <button class="answer-button" onclick="toast('출자금 납입 업무를 선택했습니다.')">출자금 납입</button>
        <button class="answer-button" onclick="toast('조합원 정보 확인이 필요합니다.')">조합원 정보 조회</button>
      </div>
    `
  };

  content.innerHTML = pages[state.computerTab];
}

/* =========================================
   이벤트 연결
========================================= */

$("start-button").addEventListener("click", startGame);
$("call-button").addEventListener("click", callNextCustomer);
$("finish-button").addEventListener("click", manualFinish);

$("close-dialog").addEventListener("click", () => {
  $("dialog").classList.add("hidden");
  toast("상담창을 접었습니다. 상담은 계속 진행 중입니다.");
});

$("close-computer").addEventListener("click", () => {
  $("computer").classList.add("hidden");
});

document.querySelectorAll(".computer-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    openComputer(button.dataset.tab);
  });
});

$("active-customer").addEventListener("click", () => {
  if (state.current && !state.busy) {
    $("dialog").classList.remove("hidden");
  }
});

/* =========================================
   초기 화면
========================================= */

function initialize() {
  updateHUD();
  renderQueue();
  $("customer-avatar").textContent = "🙂";
  $("customer-caption").textContent = "고객 호출 대기 중";
}

initialize();
