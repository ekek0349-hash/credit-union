
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* =========================================
   기본 설정
========================================= */

const $ = (id) => document.getElementById(id);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc5d8e5);
scene.fog = new THREE.Fog(0xc5d8e5, 22, 45);

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

// 기존 HTML을 절대 삭제하지 않고 캔버스만 추가
const gameElement = $("game");

if (gameElement) {
  gameElement.appendChild(renderer.domElement);
} else {
  document.body.appendChild(renderer.domElement);
}

renderer.domElement.style.position = "fixed";
renderer.domElement.style.inset = "0";
renderer.domElement.style.zIndex = "0";

const clock = new THREE.Clock();

let gameStarted = false;
let gameMinutes = 540;
let minuteTimer = 0;
let arrivalTimer = 0;

let sales = 0;
let satisfaction = 100;
let completedCount = 0;
let ticketNumber = 0;

let waitingCustomers = [];
let currentCustomer = null;
let toastTimer = null;

const MAX_QUEUE = 8;

/* =========================================
   재질 및 도형
========================================= */

function mat(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness
  });
}

const floorMat = mat(0xc9c6bd);
const wallMat = mat(0xf1f1ed);
const blueMat = mat(0x174d70);
const woodMat = mat(0x987858);
const darkMat = mat(0x282828);
const whiteMat = mat(0xffffff);

function box(x, y, z, sx, sy, sz, material, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

function sphere(x, y, z, sx, sy, sz, material, parent) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 16),
    material
  );

  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

function cylinder(x, y, z, radius, height, material, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 20),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

/* =========================================
   조명
========================================= */

scene.add(
  new THREE.HemisphereLight(0xffffff, 0x777777, 2)
);

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(-5, 10, 8);
sunlight.castShadow = true;
scene.add(sunlight);

const light1 = new THREE.PointLight(0xffffff, 35, 25);
light1.position.set(-4, 4.5, 0);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 35, 25);
light2.position.set(4, 4.5, 0);
scene.add(light2);

/* =========================================
   영업점 내부
========================================= */

function createRoom() {
  // 바닥과 벽
  box(0, -0.15, 0, 20, 0.3, 20, floorMat);
  box(0, 3, -10, 20, 6, 0.3, wallMat);
  box(-10, 3, 0, 0.3, 6, 20, wallMat);
  box(10, 3, 0, 0.3, 6, 20, wallMat);
  box(0, 6, 0, 20, 0.2, 20, whiteMat);

  // 신협 간판
  box(0, 3.8, -9.78, 6, 1.2, 0.08, blueMat);

  // 창구
  for (let i = 0; i < 3; i++) {
    const x = -3.5 + i * 3.5;

    box(x, 1.05, 4.5, 3.1, 0.18, 1.1, woodMat);
    box(x, 0.5, 4.5, 2.9, 0.9, 1, mat(0x644a35));

    // 모니터
    box(x, 1.75, 4.1, 0.9, 0.65, 0.08, darkMat);
    box(x, 1.75, 4.05, 0.8, 0.52, 0.02, mat(0x83b9d0));

    // 창구 번호
    box(x, 2.35, 4.1, 0.8, 0.3, 0.08, blueMat);
  }

  // 고객 대기 의자
  for (let i = 0; i < 5; i++) {
    const x = -4 + i * 2;

    box(x, 0.55, -3, 1.25, 0.15, 0.7, blueMat);
    box(x, 0.9, -3.3, 1.25, 0.7, 0.15, blueMat);

    for (const dx of [-0.45, 0.45]) {
      cylinder(x + dx, 0.25, -3, 0.045, 0.5, darkMat);
    }
  }

  // 출입구
  box(-7, 1.5, -9.7, 2.5, 3, 0.1, mat(0x9bb9c8));
  box(-7, 1.5, -9.6, 0.1, 3, 0.1, darkMat);

  // ATM
  box(-8, 1.3, 1, 1.1, 2.6, 0.7, blueMat);
  box(-8, 1.6, 1.38, 0.8, 0.5, 0.04, mat(0x7dc2d8));

  // 화분
  cylinder(-8, 0.3, 5.5, 0.35, 0.6, woodMat);

  for (let i = 0; i < 5; i++) {
    sphere(
      -8 + Math.sin(i) * 0.25,
      1 + Math.cos(i) * 0.15,
      5.5 + Math.cos(i) * 0.2,
      0.2, 0.5, 0.2,
      mat(0x39834a),
      scene
    );
  }

  // 안내 데스크
  box(7.5, 1, -5, 2, 1.8, 0.8, blueMat);
}

/* =========================================
   고객 데이터
========================================= */

const names = [
  "김영숙", "박정희", "이순자", "최영미",
  "윤선미", "김남국", "박승자", "정태용",
  "김한수", "이윤지", "강미정", "남진우",
  "서경남", "최영희", "한정숙", "이귀선",
  "김종현", "유경아", "안영숙", "표형업",
  "조민수", "장미숙", "오세훈", "임정자",
  "신종배", "윤설희", "박창순", "정선이",
  "김규", "설동술", "장노순", "차재필",
  "박정규", "이제인", "전운봉", "최연선",
  "박승현", "한지수", "이민호", "정수진"
];

const jobs = [
  "회사원", "자영업자", "음식점 운영", "퇴직자",
  "공무원", "요양보호사", "건설업 종사자",
  "주부", "배달업 종사자", "운수업 종사자",
  "병원 근무", "골프장 캐디", "프리랜서",
  "연금 수령자", "학원 강사", "마트 직원",
  "카페 운영", "농업 종사자", "미용실 운영",
  "경비원"
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
    type: "출자금 상담",
    message: "신협 출자금에 가입하면 어떤 혜택이 있나요?",
    options: [
      "출자금의 성격과 배당, 비과세 요건 및 유의사항을 설명한다.",
      "예금과 똑같이 원금이 보장된다고 안내한다.",
      "무조건 높은 수익을 얻는다고 설명한다."
    ],
    answer: 0,
    amount: 2000000
  },
  {
    type: "햇살론 상담",
    message: "카드론과 고금리 대출이 부담됩니다. 햇살론을 이용할 수 있을까요?",
    options: [
      "재직 및 소득, 신용정보, 보증기관 요건을 확인한다.",
      "누구나 무조건 승인된다고 안내한다.",
      "소득 확인 없이 바로 신청한다."
    ],
    answer: 0,
    amount: 5000000
  },
  {
    type: "전세자금 상담",
    message: "전세 계약을 앞두고 있는데 전세자금대출을 알아보고 있습니다.",
    options: [
      "임대차계약과 보증금, 소득 및 보증기관 요건을 확인한다.",
      "보증금만 확인하고 대출 가능하다고 확정한다.",
      "계약 이후에만 상담이 가능하다고 안내한다."
    ],
    answer: 0,
    amount: 80000000
  },
  {
    type: "담보대출 상담",
    message: "아파트를 담보로 대출을 받고 싶은데 한도가 얼마나 나올까요?",
    options: [
      "담보 시세와 선순위 권리, 소득, DSR 등을 함께 검토한다.",
      "아파트 가격의 100%까지 가능하다고 안내한다.",
      "시세만 보고 한도를 확정한다."
    ],
    answer: 0,
    amount: 100000000
  },
  {
    type: "공제 상담",
    message: "화재보험에 가입하고 싶은데 어떤 보장을 받을 수 있나요?",
    options: [
      "건물 용도와 구조, 가입금액, 기존 보험을 확인한다.",
      "보험료가 가장 싼 상품만 안내한다.",
      "기존 보험과 중복 여부를 확인하지 않는다."
    ],
    answer: 0,
    amount: 300000
  },
  {
    type: "간병인 공제",
    message: "간병인 비용이 걱정됩니다. 간병 관련 보장을 알아보고 싶습니다.",
    options: [
      "기존 가입 내역과 보장기간, 보장 범위 및 면책사항을 확인한다.",
      "기존 보험을 무조건 해지하도록 권유한다.",
      "모든 간병 비용이 보장된다고 설명한다."
    ],
    answer: 0,
    amount: 200000
  },
  {
    type: "입출금통장 개설",
    message: "신협에서 처음 거래하려고 합니다. 입출금통장을 만들고 싶습니다.",
    options: [
      "거래 목적과 실명확인 서류, 금융거래 목적을 확인한다.",
      "확인 절차 없이 계좌를 개설한다.",
      "다른 은행 계좌를 먼저 해지하도록 한다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "체크카드 발급",
    message: "체크카드를 발급받고 싶은데 어떤 혜택이 있나요?",
    options: [
      "사용 목적과 혜택, 발급 조건을 확인하고 안내한다.",
      "혜택을 확인하지 않고 아무 카드나 발급한다.",
      "신용카드만 발급 가능하다고 안내한다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "대출 만기 연장",
    message: "대출 만기가 다가오는데 연장할 수 있을까요?",
    options: [
      "상환 이력과 담보가치, 소득 및 신용 상태를 재검토한다.",
      "기존 대출이므로 무조건 연장한다.",
      "연장 심사 없이 기간부터 늘려준다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "연체 상담",
    message: "대출 이자를 납부하지 못했습니다. 어떻게 해야 하나요?",
    options: [
      "연체 기간과 금액을 확인하고 상환 방법을 안내한다.",
      "연체 사실을 무시하고 기다리라고 한다.",
      "연체 이력이 절대 남지 않는다고 안내한다."
    ],
    answer: 0,
    amount: 0
  },
  {
    type: "저율과세 상담",
    message: "신협 예금의 세금 혜택을 받을 수 있는지 궁금합니다.",
    options: [
      "조합원 요건과 적용 한도, 세법상 요건을 확인한다.",
      "모든 예금에 무조건 비과세가 적용된다고 안내한다.",
      "세금은 신경 쓸 필요가 없다고 안내한다."
    ],
    answer: 0,
    amount: 10000000
  }
];

const hairColors = [
  0x24201d, 0x3a2920, 0x171717,
  0x514033, 0x777777
];

const clothesColors = [
  0x344f76, 0x6a4c77, 0x55745b,
  0x8a5c43, 0x343d48, 0x9b7772,
  0x536b80, 0x777777, 0x273b53
];

let customerId = 0;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createCustomerData() {
  const scenario = randomItem(scenarios);

  return {
    id: ++customerId,
    name: randomItem(names),
    age: 30 + Math.floor(Math.random() * 46),
    gender: Math.random() > 0.5 ? "남성" : "여성",
    job: randomItem(jobs),
    scenario,
    hair: randomItem(hairColors),
    clothes: randomItem(clothesColors),
    skin: randomItem([0xf1c9a5, 0xe8b994, 0xd6a47e, 0xf0d0b0]),
    number: ++ticketNumber
  };
}

/* =========================================
   사람 캐릭터 생성
========================================= */

function createHuman(customer) {
  const group = new THREE.Group();

  const skinMat = mat(customer.skin);
  const clothesMat = mat(customer.clothes);
  const hairMat = mat(customer.hair);
  const pantsMat = mat(0x303846);
  const shoesMat = mat(0x242424);

  // 몸통
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.27, 0.65, 5, 10),
    clothesMat
  );

  body.position.y = 1.05;
  body.castShadow = true;
  group.add(body);

  // 머리
  sphere(
    0, 1.85, 0,
    0.25, 0.3, 0.24,
    skinMat,
    group
  );

  // 머리카락
  sphere(
    0, 2.04, -0.025,
    0.255, 0.16, 0.25,
    hairMat,
    group
  );

  // 얼굴
  sphere(
    0, 1.83, 0.205,
    0.16, 0.09, 0.035,
    skinMat,
    group
  );

  // 눈
  sphere(-0.075, 1.87, 0.238, 0.025, 0.025, 0.015, darkMat, group);
  sphere(0.075, 1.87, 0.238, 0.025, 0.025, 0.015, darkMat, group);

  // 팔
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.075, 0.42, 4, 8),
      clothesMat
    );

    arm.position.set(side * 0.32, 1.1, 0);
    arm.rotation.z = side * -0.12;
    group.add(arm);

    // 손
    sphere(
      side * 0.34, 0.79, 0,
      0.08, 0.09, 0.08,
      skinMat,
      group
    );
  }

  // 다리
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.09, 0.45, 4, 8),
      pantsMat
    );

    leg.position.set(side * 0.12, 0.4, 0);
    group.add(leg);

    box(
      side * 0.12, 0.08, 0.04,
      0.16, 0.13, 0.28,
      shoesMat,
      group
    );
  }

  group.userData.customer = customer;

  return group;
}

/* =========================================
   대기 고객 관리
========================================= */

const queuePositions = [
  [-4.4, -3.3],
  [-2.5, -3.3],
  [-0.6, -3.3],
  [1.3, -3.3],
  [3.2, -3.3],
  [4.8, -4.8],
  [2.8, -4.8],
  [0.8, -4.8]
];

function arrangeQueue() {
  waitingCustomers.forEach((customer, index) => {
    const position = queuePositions[index];

    if (!position || !customer.mesh) return;

    customer.mesh.position.set(
      position[0],
      0,
      position[1]
    );

    customer.mesh.rotation.y = 0;
  });

  updateQueueUI();
}

function addWaitingCustomer(showMessage = false) {
  if (waitingCustomers.length >= MAX_QUEUE) return;

  const data = createCustomerData();
  const mesh = createHuman(data);

  const customer = {
    ...data,
    mesh,
    state: "waiting"
  };

  scene.add(mesh);
  waitingCustomers.push(customer);

  arrangeQueue();

  if (showMessage) {
    showToast(`${customer.name} 고객님이 대기 등록했습니다.`);
  }
}

function fillInitialQueue() {
  waitingCustomers = [];

  for (let i = 0; i < 6; i++) {
    addWaitingCustomer(false);
  }

  updateQueueUI();
}

/* =========================================
   화면 UI 생성
========================================= */

function createGameUI() {
  const style = document.createElement("style");

  style.textContent = `
    #queue-panel {
      position: fixed;
      z-index: 8;
      top: 90px;
      right: 20px;
      width: 210px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(9, 30, 47, 0.92);
      color: white;
      font-family: sans-serif;
      box-shadow: 0 5px 20px rgba(0,0,0,.25);
    }

    #queue-panel .queue-title {
      font-size: 13px;
      color: #b8d7e9;
      margin-bottom: 8px;
    }

    #queue-count {
      font-size: 30px;
      font-weight: 800;
      color: #ffffff;
    }

    #queue-list {
      margin-top: 10px;
      max-height: 170px;
      overflow-y: auto;
      font-size: 12px;
      line-height: 1.9;
      color: #dceaf2;
    }

    #ticket-button {
      position: fixed;
      z-index: 9;
      right: 22px;
      bottom: 25px;
      width: 220px;
      padding: 17px;
      border: 0;
      border-radius: 12px;
      background: #126a9c;
      color: white;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 5px 20px rgba(0,0,0,.3);
    }

    #ticket-button:disabled {
      background: #687985;
      cursor: not-allowed;
      opacity: .7;
    }

    #ticket-button:hover:not(:disabled) {
      background: #0b527c;
      transform: translateY(-2px);
    }

    #service-status {
      position: fixed;
      z-index: 8;
      right: 22px;
      bottom: 95px;
      padding: 10px 14px;
      border-radius: 8px;
      background: rgba(9,30,47,.9);
      color: white;
      font-size: 12px;
    }

    @media (max-width: 650px) {
      #queue-panel {
        top: 125px;
        right: 10px;
        width: 155px;
        padding: 11px;
      }

      #ticket-button {
        right: 10px;
        bottom: 15px;
        width: 180px;
        padding: 14px;
        font-size: 14px;
      }

      #service-status {
        right: 10px;
        bottom: 80px;
      }
    }
  `;

  document.head.appendChild(style);

  const queuePanel = document.createElement("div");
  queuePanel.id = "queue-panel";
  queuePanel.innerHTML = `
    <div class="queue-title">현재 고객 대기 현황</div>
    <div><span id="queue-count">0</span>명</div>
    <div id="queue-list"></div>
  `;

  document.body.appendChild(queuePanel);

  const status = document.createElement("div");
  status.id = "service-status";
  status.textContent = "영업 시작 전입니다.";
  document.body.appendChild(status);

  const ticketButton = document.createElement("button");
  ticketButton.id = "ticket-button";
  ticketButton.textContent = "🎫 다음 고객 호출";
  ticketButton.disabled = true;

  ticketButton.addEventListener("click", callNextCustomer);

  document.body.appendChild(ticketButton);
}

/* =========================================
   대기 현황 표시
========================================= */

function updateQueueUI() {
  const countElement = $("queue-count");
  const listElement = $("queue-list");

  if (countElement) {
    countElement.textContent = waitingCustomers.length;
  }

  if (listElement) {
    if (waitingCustomers.length === 0) {
      listElement.innerHTML = "대기 고객이 없습니다.";
    } else {
      listElement.innerHTML = waitingCustomers
        .map(customer =>
          `<div>${customer.number}번 · ${customer.name}</div>`
        )
        .join("");
    }
  }

  const button = $("ticket-button");

  if (button) {
    button.disabled =
      !gameStarted ||
      currentCustomer !== null ||
      waitingCustomers.length === 0;
  }
}

/* =========================================
   HUD 및 시간
========================================= */

function updateHUD() {
  const clockElement = $("clock");
  const salesElement = $("sales");
  const satisfactionElement = $("satisfaction");

  const hours = Math.floor(gameMinutes / 60);
  const minutes = gameMinutes % 60;

  if (clockElement) {
    clockElement.textContent =
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  if (salesElement) {
    salesElement.textContent =
      sales.toLocaleString("ko-KR") + "원";
  }

  if (satisfactionElement) {
    satisfactionElement.textContent = satisfaction + "%";
  }
}

function updateClock(delta) {
  if (!gameStarted) return;

  minuteTimer += delta;

  // 실제 3초마다 게임 시간 1분
  if (minuteTimer >= 3) {
    minuteTimer = 0;
    gameMinutes++;

    if (gameMinutes >= 1080) {
      gameMinutes = 540;
    }

    updateHUD();
  }
}

/* =========================================
   안내 메시지
========================================= */

function showToast(message) {
  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* =========================================
   고객 호출
========================================= */

function callNextCustomer() {
  if (!gameStarted) return;
  if (currentCustomer !== null) return;

  if (waitingCustomers.length === 0) {
    showToast("현재 대기 중인 고객이 없습니다.");
    updateQueueUI();
    return;
  }

  const customer = waitingCustomers.shift();

  currentCustomer = customer;
  customer.state = "walking";

  // 대기 위치에서 창구 앞으로 이동
  customer.mesh.position.set(0, 0, -3.3);
  customer.mesh.rotation.y = 0;

  customer.targetZ = 2.8;

  arrangeQueue();

  const status = $("service-status");

  if (status) {
    status.textContent =
      `${customer.number}번 고객 이동 중 · ${customer.name}`;
  }

  showToast(`${customer.number}번 ${customer.name} 고객님 호출합니다.`);

  updateQueueUI();
}

/* =========================================
   고객 이동
========================================= */

function moveCustomer(delta) {
  if (!currentCustomer) return;

  const customer = currentCustomer;

  if (customer.state === "walking") {
    customer.mesh.position.z += delta * 1.8;

    // 걷는 동작
    customer.mesh.rotation.z =
      Math.sin(performance.now() * 0.008) * 0.025;

    if (customer.mesh.position.z >= customer.targetZ) {
      customer.mesh.position.z = customer.targetZ;
      customer.state = "consulting";

      openCustomerDialog(customer);
    }
  }

  if (customer.state === "leaving") {
    customer.mesh.position.z -= delta * 2.2;

    if (customer.mesh.position.z < -9) {
      scene.remove(customer.mesh);
      currentCustomer = null;

      const status = $("service-status");

      if (status) {
        status.textContent = "다음 고객을 호출해 주세요.";
      }

      updateQueueUI();
    }
  }
}

/* =========================================
   고객 상담창
========================================= */

function openCustomerDialog(customer) {
  const dialog = $("dialog");

  if (!dialog) return;

  $("customer-name").textContent =
    `${customer.name} 고객님`;

  $("customer-profile").innerHTML = `
    <span class="profile-tag">${customer.age}세</span>
    <span class="profile-tag">${customer.gender}</span>
    <span class="profile-tag">${customer.job}</span>
    <span class="profile-tag">${customer.number}번 고객</span>
  `;

  $("customer-message").innerHTML = `
    <strong>${customer.scenario.type}</strong>
    <br><br>
    ${customer.scenario.message}
  `;

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

  $("dialog-feedback").textContent = "";

  dialog.classList.remove("hidden");

  const status = $("service-status");

  if (status) {
    status.textContent =
      `${customer.name} 고객 상담 중`;
  }
}

/* =========================================
   상담 답변
========================================= */

function chooseAnswer(customer, selectedIndex) {
  if (customer !== currentCustomer) return;

  const correct =
    selectedIndex === customer.scenario.answer;

  const feedback = $("dialog-feedback");
  const answerList = $("answer-list");

  if (correct) {
    satisfaction = Math.min(100, satisfaction + 2);
    sales += customer.scenario.amount;
    completedCount++;

    feedback.textContent =
      "올바른 상담입니다. 고객에게 적절한 금융상품과 안내를 제공했습니다.";

    showToast("상담을 성공적으로 완료했습니다.");
  } else {
    satisfaction = Math.max(0, satisfaction - 8);

    feedback.textContent =
      "아쉬운 답변입니다. 고객의 상황을 먼저 확인하고 정확하게 안내해야 합니다.";

    showToast("상담 평가에서 감점되었습니다.");
  }

  updateHUD();

  answerList.innerHTML = "";

  const finishButton = document.createElement("button");

  finishButton.className = "primary-button";
  finishButton.textContent = "상담 종료";

  finishButton.addEventListener("click", () => {
    finishCustomer();
  });

  answerList.appendChild(finishButton);
}

/* =========================================
   상담 종료 및 고객 퇴장
========================================= */

function finishCustomer() {
  if (!currentCustomer) return;

  const dialog = $("dialog");

  if (dialog) {
    dialog.classList.add("hidden");
  }

  currentCustomer.state = "leaving";

  showToast("상담이 종료되었습니다. 고객이 퇴장합니다.");

  const status = $("service-status");

  if (status) {
    status.textContent = "고객 퇴장 중";
  }
}

/* =========================================
   신규 고객 유입
========================================= */

function updateArrivals(delta) {
  if (!gameStarted) return;

  arrivalTimer += delta;

  // 25초마다 신규 고객 유입
  if (arrivalTimer >= 25) {
    arrivalTimer = 0;

    if (waitingCustomers.length < MAX_QUEUE) {
      addWaitingCustomer(true);
    }
  }
}

/* =========================================
   영업 시작
========================================= */

function startGame() {
  if (gameStarted) return;

  gameStarted = true;

  const startScreen = $("start-screen");

  if (startScreen) {
    startScreen.style.display = "none";
  }

  fillInitialQueue();

  const status = $("service-status");

  if (status) {
    status.textContent = "영업 중 · 다음 고객을 호출해 주세요.";
  }

  updateHUD();
  updateQueueUI();

  showToast("춘천신협 근화지점 영업을 시작합니다.");
}

const startButton = $("start-button");

if (startButton) {
  startButton.addEventListener("click", startGame);
}

/* =========================================
   닫기 버튼
========================================= */

const closeDialog = $("close-dialog");

if (closeDialog) {
  closeDialog.addEventListener("click", () => {
    showToast("상담을 진행한 뒤 상담 종료 버튼을 눌러주세요.");
  });
}

/* =========================================
   게임 실행
========================================= */

createRoom();
createGameUI();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  updateClock(delta);
  updateArrivals(delta);
  moveCustomer(delta);

  renderer.render(scene, camera);
}

animate();

/* =========================================
   화면 크기 대응
========================================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});
