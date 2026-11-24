
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* =====================================
   기본 설정
===================================== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc5d8e5);
scene.fog = new THREE.Fog(0xc5d8e5, 20, 40);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

// 직원은 창구 안쪽에 고정
camera.position.set(0, 1.7, 8);
camera.lookAt(0, 1.7, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const gameElement = document.getElementById("game");
if (gameElement) {
  gameElement.innerHTML = "";
  gameElement.appendChild(renderer.domElement);
} else {
  document.body.appendChild(renderer.domElement);
}

renderer.domElement.style.position = "fixed";
renderer.domElement.style.inset = "0";
renderer.domElement.style.zIndex = "0";

const $ = id => document.getElementById(id);

const clock = new THREE.Clock();

let gameStarted = false;
let gameMinutes = 9 * 60;
let minuteTimer = 0;

let sales = 0;
let satisfaction = 100;
let completedCount = 0;
let ticketNumber = 0;

let waitingCustomers = [];
let currentCustomer = null;
let toastTimer = null;

/* =====================================
   재질 및 물체 생성
===================================== */

function material(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

const floorMat = material(0xc9c6bd);
const wallMat = material(0xf1f1ed);
const blueMat = material(0x174d70);
const woodMat = material(0x987858);
const darkMat = material(0x282828);
const whiteMat = material(0xffffff);

function box(x, y, z, sx, sy, sz, mat, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    mat
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sphere(x, y, z, sx, sy, sz, mat, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 16),
    mat
  );

  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(x, y, z, radius, height, mat, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 20),
    mat
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/* =====================================
   조명
===================================== */

scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(-5, 10, 8);
sunlight.castShadow = true;
scene.add(sunlight);

const light1 = new THREE.PointLight(0xffffff, 45, 20);
light1.position.set(-4, 4.5, 0);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 45, 20);
light2.position.set(4, 4.5, 0);
scene.add(light2);

/* =====================================
   영업점 내부
===================================== */

function createRoom() {
  box(0, -0.15, 0, 20, 0.3, 20, floorMat);

  box(0, 3, -10, 20, 6, 0.3, wallMat);
  box(-10, 3, 0, 0.3, 6, 20, wallMat);
  box(10, 3, 0, 0.3, 6, 20, wallMat);
  box(0, 6, 0, 20, 0.2, 20, whiteMat);

  // 뒤쪽 신협 간판
  box(0, 3.8, -9.78, 6, 1.2, 0.08, blueMat);

  // 직원 창구
  for (let i = 0; i < 3; i++) {
    const x = -3.5 + i * 3.5;

    box(x, 1.05, 4.5, 3.1, 0.18, 1.1, woodMat);
    box(x, 0.5, 4.5, 2.9, 0.9, 1, material(0x644a35));

    // 모니터
    box(x, 1.75, 4.1, 0.9, 0.65, 0.08, darkMat);
    box(x, 1.75, 4.05, 0.8, 0.52, 0.02, material(0x83b9d0));

    // 창구 번호
    box(x, 2.35, 4.1, 0.8, 0.3, 0.08, blueMat);
  }

  // 고객 대기석
  for (let i = 0; i < 5; i++) {
    const x = -4 + i * 2;

    box(x, 0.55, -3, 1.25, 0.15, 0.7, blueMat);
    box(x, 0.9, -3.3, 1.25, 0.7, 0.15, blueMat);

    for (const dx of [-0.45, 0.45]) {
      cylinder(x + dx, 0.25, -3, 0.045, 0.5, darkMat);
    }
  }

  // 출입구
  box(-7, 1.5, -9.7, 2.5, 3, 0.1, material(0x9bb9c8));
  box(-7, 1.5, -9.6, 0.1, 3, 0.1, darkMat);

  // ATM
  box(-8, 1.3, 1, 1.1, 2.6, 0.7, blueMat);
  box(-8, 1.6, 1.38, 0.8, 0.5, 0.04, material(0x7dc2d8));

  // 화분
  cylinder(-8, 0.3, 5.5, 0.35, 0.6, woodMat);

  for (let i = 0; i < 5; i++) {
    sphere(
      -8 + Math.sin(i) * 0.25,
      1 + Math.cos(i) * 0.15,
      5.5 + Math.cos(i) * 0.2,
      0.2, 0.5, 0.2,
      material(0x39834a)
    );
  }

  // 안내 데스크
  box(7.5, 1, -5, 2, 1.8, 0.8, blueMat);
}

/* =====================================
   고객 정보
===================================== */

const names = [
  "김영숙", "박정희", "이순자", "최영미", "윤선미",
  "김남국", "박승자", "정태용", "김한수", "이윤지",
  "강미정", "남진우", "서경남", "최영희", "한정숙",
  "이귀선", "김종현", "유경아", "안영숙", "표형업",
  "조민수", "장미숙", "오세훈", "임정자", "신종배",
  "윤설희", "박창순", "정선이", "김규", "설동술",
  "장노순", "차재필", "박정규", "이제인", "전운봉",
  "최연선", "박승현", "한지수", "이민호", "정수진"
];

const jobs = [
  "회사원", "자영업자", "음식점 운영", "퇴직자",
  "공무원", "요양보호사", "건설업 종사자", "주부",
  "배달업 종사자", "운수업 종사자", "병원 근무",
  "골프장 캐디", "프리랜서", "연금 수령자",
  "학원 강사", "마트 직원", "카페 운영",
  "농업 종사자", "미용실 운영", "경비원"
];

const scenarios = [
  {
    type: "정기예금 신규",
    message: "목돈이 생겨서 정기예금에 가입하려고 합니다. 금리와 세금 혜택이 궁금합니다.",
    options: [
      "예치 금액과 기간을 확인하고 적용 가능한 세제 혜택을 안내한다.",
      "가장 높은 금리만 안내하고 바로 가입한다.",
      "무조건 다른 금융기관보다 유리하다고 설명한다."
    ],
    answer: 0,
    amount: 30000000
  },
  {
    type: "예금 재예치",
    message: "오늘 예금이 만기됐습니다. 원금과 이자를 다시 맡기고 싶습니다.",
    options: [
      "자금 사용 계획과 희망 기간을 확인한 뒤 재예치 조건을 안내한다.",
      "기존 상품과 똑같이 무조건 재예치한다.",
      "전액 출자금으로 전환한다."
    ],
    answer: 0,
    amount: 50000000
  },
  {
    type: "예금 해지",
    message: "사업 자금이 급하게 필요해서 예금을 해지하고 싶습니다.",
    options: [
      "중도해지 이율과 이자 손실을 설명하고 필요한 금액을 확인한다.",
      "무조건 만기까지 유지하라고 안내한다.",
      "해지하면 손해라고만 말한다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "정기적금",
    message: "매달 100만 원 정도 저축하고 싶은데 어떤 상품이 좋을까요?",
    options: [
      "월 납입 가능 금액과 기간, 우대조건을 확인한다.",
      "가장 높은 금리만 안내한다.",
      "정기예금만 가능하다고 안내한다."
    ],
    answer: 0,
    amount: 12000000
  },
  {
    type: "출자금",
    message: "출자금은 예금과 어떤 차이가 있나요?",
    options: [
      "조합원 자격과 배당, 예금자보호 제외 여부를 설명한다.",
      "예금과 똑같이 원금이 보장된다고 안내한다.",
      "언제든 예금처럼 인출할 수 있다고 설명한다."
    ],
    answer: 0,
    amount: 2000000
  },
  {
    type: "햇살론",
    message: "카드론 금리가 부담돼서 대환할 수 있는 대출이 있는지 문의합니다.",
    options: [
      "재직·소득·신용정보와 기존 채무를 확인하고 보증 요건을 검토한다.",
      "신용점수만 보고 바로 승인 가능하다고 말한다.",
      "기존 대출을 확인하지 않고 최대한도부터 안내한다."
    ],
    answer: 0,
    amount: 5000000
  },
  {
    type: "아파트 담보대출",
    message: "아파트를 담보로 대출을 받고 싶습니다. 얼마나 가능할까요?",
    options: [
      "시세와 선순위 권리, 방공제, LTV 및 상환능력을 확인한다.",
      "시세의 80%까지 무조건 가능하다고 안내한다.",
      "담보가 있으니 소득 확인은 필요 없다고 설명한다."
    ],
    answer: 0,
    amount: 100000000
  },
  {
    type: "전세자금대출",
    message: "전세 계약을 앞두고 있는데 전세자금대출 상담을 받고 싶습니다.",
    options: [
      "임대차계약과 보증기관 요건, 주택 및 소득 조건을 확인한다.",
      "계약금만 있으면 무조건 가능하다고 말한다.",
      "보증금만 확인하고 대출을 확정한다."
    ],
    answer: 0,
    amount: 80000000
  },
  {
    type: "화재공제",
    message: "건물을 소유하고 있는데 화재보험이 꼭 필요한가요?",
    options: [
      "건물 용도와 구조, 기존 보험 및 보장 공백을 확인한다.",
      "화재가 날 가능성이 낮으니 필요 없다고 말한다.",
      "보장 내용을 확인하지 않고 비싼 상품을 권한다."
    ],
    answer: 0,
    amount: 300000
  },
  {
    type: "간병인 공제",
    message: "부모님 간병비가 걱정됩니다. 간병 관련 상품이 있을까요?",
    options: [
      "기존 보장과 가입 연령, 보장 기간 및 특약을 확인한다.",
      "간병비가 무조건 전액 보장된다고 안내한다.",
      "기존 보험은 확인하지 않고 가입을 권한다."
    ],
    answer: 0,
    amount: 500000
  },
  {
    type: "계좌 개설",
    message: "처음 거래하러 왔습니다. 입출금 통장을 만들고 싶습니다.",
    options: [
      "실명확인과 거래 목적, 필요한 증빙 서류를 안내한다.",
      "신분증 없이 바로 개설한다.",
      "거래 목적 확인은 필요 없다고 안내한다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "상속 상담",
    message: "가족이 돌아가셔서 예금 상속 절차를 알아보고 싶습니다.",
    options: [
      "상속인 확인과 필요한 서류, 지급 절차를 안내한다.",
      "가족 한 명이 오면 무조건 전액 지급한다.",
      "가족관계 확인 없이 바로 해지한다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "대출 연장",
    message: "다음 달 대출 만기인데 연장할 수 있을까요?",
    options: [
      "현재 상환 상태와 소득, 담보 및 신용정보를 재확인한다.",
      "자동으로 연장된다고 말한다.",
      "만기일이 지나도 괜찮다고 안내한다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "연체 상담",
    message: "대출 이자가 연체됐는데 어떻게 처리해야 하나요?",
    options: [
      "연체 금액과 기간, 상환 가능 일정을 확인하고 해결 방법을 안내한다.",
      "연체 사실을 무시해도 된다고 말한다.",
      "상환 계획을 확인하지 않고 상담을 종료한다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "저율과세",
    message: "신협 예금은 세금 혜택이 있다고 들었는데 맞나요?",
    options: [
      "조합원 여부와 적용 한도, 가입 시점의 요건을 확인한다.",
      "모든 고객이 무제한 비과세라고 설명한다.",
      "세금 혜택은 없다고 안내한다."
    ],
    answer: 0,
    amount: 20000000
  }
];

function random(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function makeCustomer() {
  const scenario = random(scenarios);

  return {
    name: random(names),
    age: Math.floor(25 + Math.random() * 55),
    job: random(jobs),
    income: Math.floor(1800 + Math.random() * 6500),
    credit: Math.floor(550 + Math.random() * 400),
    scenario,
    ticket: ++ticketNumber,
    mesh: null,
    targetZ: -8,
    state: "waiting",
    walkTime: 0
  };
}

/* =====================================
   고객 캐릭터
===================================== */

function createHuman(customer, x, z) {
  const group = new THREE.Group();

  const skin = material(random([
    0xf1c7a5, 0xe5b58f, 0xd8a47f, 0xf4d2b4
  ]));

  const hair = material(random([
    0x201812, 0x493020, 0x171717, 0x786044
  ]));

  const clothes = material(random([
    0x345d7d, 0x725b83, 0x456b58, 0x9b5f54,
    0x333f50, 0x9a825b, 0x526f86, 0x704e3e
  ]));

  const pants = material(random([
    0x293747, 0x454545, 0x263c35, 0x655b50
  ]));

  const shoes = material(0x222222);
  const eyes = material(0x38251b);

  // 몸통
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.32, 0.65, 5, 12),
    clothes
  );

  torso.position.y = 1.25;
  torso.castShadow = true;
  group.add(torso);

  // 목
  cylinder(0, 1.83, 0, 0.11, 0.2, skin, group);

  // 얼굴
  sphere(0, 2.15, 0.03, 0.35, 0.43, 0.31, skin, group);

  // 귀
  sphere(-0.35, 2.15, 0.03, 0.08, 0.13, 0.07, skin, group);
  sphere(0.35, 2.15, 0.03, 0.08, 0.13, 0.07, skin, group);

  // 머리카락
  sphere(0, 2.47, 0, 0.36, 0.2, 0.33, hair, group);
  sphere(0, 2.36, -0.19, 0.34, 0.27, 0.13, hair, group);

  // 눈
  for (const side of [-1, 1]) {
    sphere(side * 0.13, 2.22, 0.31, 0.065, 0.075, 0.035, whiteMat, group);
    sphere(side * 0.13, 2.22, 0.345, 0.03, 0.045, 0.02, eyes, group);
  }

  // 코와 입
  sphere(0, 2.12, 0.34, 0.05, 0.08, 0.06, skin, group);
  sphere(0, 2.0, 0.31, 0.08, 0.02, 0.02, material(0x9f5958), group);

  // 팔과 손
  const arms = [];

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.09, 0.52, 4, 8),
      clothes
    );

    arm.position.set(side * 0.38, 1.3, 0);
    arm.castShadow = true;
    group.add(arm);
    arms.push(arm);

    sphere(side * 0.38, 0.99, 0.02, 0.1, 0.12, 0.1, skin, group);

    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.13, 0.52, 4, 8),
      pants
    );

    leg.position.set(side * 0.15, 0.48, 0);
    leg.castShadow = true;
    group.add(leg);

    sphere(side * 0.15, 0.12, 0.08, 0.15, 0.09, 0.24, shoes, group);
  }

  group.position.set(x, 0, z);

  // 고객의 얼굴이 직원 방향(+Z)을 향하도록 설정
  group.rotation.y = 0;

  group.userData.arms = arms;
  group.userData.customer = customer;

  scene.add(group);
  customer.mesh = group;

  return group;
}

/* =====================================
   순번기 및 고객 호출
===================================== */

function createTicketMachine() {
  const panel = document.createElement("div");

  panel.id = "ticket-machine-ui";

  panel.innerHTML = `
    <div class="ticket-machine-title">춘천신협 근화지점</div>
    <div id="ticket-number-display">다음 고객을 호출하세요</div>
    <button id="call-next-button">🔔 다음 고객 호출</button>
    <div id="waiting-number">대기 고객 0명</div>
  `;

  Object.assign(panel.style, {
    position: "fixed",
    right: "25px",
    bottom: "100px",
    width: "210px",
    padding: "17px",
    borderRadius: "15px",
    background: "rgba(18, 48, 68, 0.96)",
    color: "white",
    zIndex: "1000",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)"
  });

  document.body.appendChild(panel);

  const title = panel.querySelector(".ticket-machine-title");
  title.style.fontWeight = "bold";
  title.style.fontSize = "15px";
  title.style.marginBottom = "12px";

  const number = panel.querySelector("#ticket-number-display");
  number.style.fontSize = "13px";
  number.style.marginBottom = "12px";

  const button = panel.querySelector("#call-next-button");

  Object.assign(button.style, {
    width: "100%",
    padding: "16px 8px",
    border: "none",
    borderRadius: "9px",
    background: "#168653",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  });

  button.addEventListener("click", callNextCustomer);

  const waiting = panel.querySelector("#waiting-number");
  waiting.style.marginTop = "12px";
  waiting.style.fontSize = "13px";
}

function updateTicketUI() {
  const waiting = $("waiting-number");
  const display = $("ticket-number-display");
  const button = $("call-next-button");

  if (waiting) {
    waiting.textContent = `대기 고객 ${waitingCustomers.length}명`;
  }

  if (display) {
    display.textContent = currentCustomer
      ? `${currentCustomer.ticket}번 고객 상담 중`
      : "다음 고객을 호출하세요";
  }

  if (button) {
    button.disabled = !!currentCustomer;
    button.textContent = currentCustomer
      ? "상담 진행 중"
      : "🔔 다음 고객 호출";

    button.style.opacity = currentCustomer ? "0.5" : "1";
  }
}

// 순번기를 눌렀을 때 고객 한 명을 호출
function callNextCustomer() {
  if (!gameStarted) {
    showToast("먼저 영업을 시작해 주세요.");
    return;
  }

  if (currentCustomer) {
    showToast("현재 고객 상담을 먼저 마쳐주세요.");
    return;
  }

  const customer = makeCustomer();

  currentCustomer = customer;
  customer.state = "walking";
  customer.targetZ = 3.0;

  // 출입구 쪽에서 생성
  // 카메라와 창구 앞쪽으로 이동하는 방향
  createHuman(customer, 0, -8);

  updateTicketUI();

  showToast(
    `${customer.ticket}번 ${customer.name} 고객님을 호출했습니다.`
  );
}

/* =====================================
   고객 이동
===================================== */

function moveCustomer(delta) {
  if (!currentCustomer || currentCustomer.state !== "walking") return;

  const customer = currentCustomer;
  const mesh = customer.mesh;

  if (!mesh) return;

  const target = 3.0;
  const distance = target - mesh.position.z;
  const speed = 1.5;

  if (Math.abs(distance) > 0.08) {
    mesh.position.z += Math.sign(distance) *
      Math.min(Math.abs(distance), speed * delta);

    customer.walkTime += delta;

    // 걷는 동작
    const swing = Math.sin(customer.walkTime * 9) * 0.3;

    mesh.userData.arms?.forEach((arm, index) => {
      arm.rotation.x = index === 0 ? swing : -swing;
    });

  } else {
    mesh.position.z = target;
    customer.state = "arrived";

    mesh.userData.arms?.forEach(arm => {
      arm.rotation.x = 0;
    });

    updateTicketUI();

    showToast(`${customer.name} 고객님이 창구에 도착했습니다.`);

    setTimeout(() => {
      if (currentCustomer === customer && customer.state === "arrived") {
        openCustomerDialog(customer);
      }
    }, 500);
  }
}

/* =====================================
   상담창
===================================== */

function openCustomerDialog(customer) {
  if (!customer || currentCustomer !== customer) return;

  const dialog = $("dialog");

  if (!dialog) {
    showToast("상담창 HTML 요소를 찾을 수 없습니다.");
    return;
  }

  $("customer-name").textContent =
    `${customer.name} 고객님 (${customer.ticket}번)`;

  $("customer-profile").innerHTML = `
    <span class="profile-tag">${customer.age}세</span>
    <span class="profile-tag">${customer.job}</span>
    <span class="profile-tag">연소득 ${customer.income.toLocaleString()}만원</span>
    <span class="profile-tag">신용점수 ${customer.credit}점</span>
    <span class="profile-tag">${customer.scenario.type}</span>
  `;

  $("customer-message").textContent = customer.scenario.message;
  $("dialog-feedback").textContent = "";

  const answerList = $("answer-list");
  answerList.innerHTML = "";

  customer.scenario.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.className = "answer-button";
    button.textContent = `${index + 1}. ${option}`;

    button.addEventListener("click", () => {
      chooseAnswer(customer, index);
    });

    answerList.appendChild(button);
  });

  dialog.classList.remove("hidden");
}

function chooseAnswer(customer, index) {
  if (customer !== currentCustomer || customer.state !== "arrived") return;

  const correct = index === customer.scenario.answer;

  if (correct) {
    satisfaction = Math.min(100, satisfaction + 2);
    sales += customer.scenario.amount;

    $("dialog-feedback").textContent =
      "좋은 상담입니다. 고객 상황에 맞는 안내를 완료했습니다.";

    $("dialog-feedback").style.color = "#168653";
  } else {
    satisfaction = Math.max(0, satisfaction - 8);

    $("dialog-feedback").textContent =
      "아쉬운 상담입니다. 고객의 상황과 금융상품 조건을 다시 확인해 보세요.";

    $("dialog-feedback").style.color = "#c04444";
  }

  completedCount++;
  updateHUD();

  document.querySelectorAll(".answer-button").forEach(button => {
    button.disabled = true;
  });

  const finish = document.createElement("button");

  finish.className = "primary-button";
  finish.textContent = "상담 종료";

  finish.addEventListener("click", finishCustomer);

  $("answer-list").appendChild(finish);
}

function finishCustomer() {
  if (!currentCustomer) return;

  const customer = currentCustomer;

  customer.state = "leaving";

  $("dialog").classList.add("hidden");

  showToast(`${customer.name} 고객님 상담이 종료되었습니다.`);

  // 상담 종료 후 고객이 출입구 방향으로 퇴장
  customer.targetZ = -11;

  updateTicketUI();

  let leaveTimer = setInterval(() => {
    if (!customer.mesh) {
      clearInterval(leaveTimer);
      return;
    }

    const distance = customer.targetZ - customer.mesh.position.z;

    if (Math.abs(distance) > 0.1) {
      customer.mesh.position.z += Math.sign(distance) * 0.07;
    } else {
      scene.remove(customer.mesh);
      customer.mesh = null;

      clearInterval(leaveTimer);

      if (currentCustomer === customer) {
        currentCustomer = null;
      }

      updateTicketUI();

      showToast("다음 고객을 호출할 수 있습니다.");
    }
  }, 30);
}

/* =====================================
   HUD 및 시간
===================================== */

function updateHUD() {
  const hour = Math.floor(gameMinutes / 60);
  const minute = gameMinutes % 60;

  if ($("clock")) {
    $("clock").textContent =
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  if ($("day")) $("day").textContent = "1일차";

  if ($("sales")) {
    $("sales").textContent = sales.toLocaleString("ko-KR") + "원";
  }

  if ($("satisfaction")) {
    $("satisfaction").textContent = satisfaction + "%";
  }
}

function updateTime(delta) {
  if (!gameStarted) return;

  minuteTimer += delta;

  // 실제 3초 = 게임 속 1분
  if (minuteTimer >= 3) {
    const passed = Math.floor(minuteTimer / 3);
    minuteTimer -= passed * 3;

    gameMinutes += passed;

    if (gameMinutes >= 17 * 60) {
      gameMinutes = 9 * 60;
      showToast("영업이 종료되었습니다. 다음 영업일을 시작합니다.");
    }

    updateHUD();
  }
}

/* =====================================
   알림
===================================== */

function showToast(message) {
  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* =====================================
   시작 및 종료
===================================== */

if ($("start-button")) {
  $("start-button").addEventListener("click", () => {
    gameStarted = true;

    $("start-screen")?.classList.add("hidden");

    showToast("근화지점 영업을 시작합니다. 순번기를 눌러 고객을 호출하세요.");
  });
}

if ($("close-dialog")) {
  $("close-dialog").addEventListener("click", () => {
    showToast("상담창을 닫으려면 상담 종료를 진행해 주세요.");
  });
}

/* =====================================
   애니메이션
===================================== */

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  moveCustomer(delta);
  updateTime(delta);

  renderer.render(scene, camera);
}

/* =====================================
   화면 크기
===================================== */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =====================================
   실행
===================================== */

createRoom();
createTicketMachine();
updateHUD();
updateTicketUI();
animate();
