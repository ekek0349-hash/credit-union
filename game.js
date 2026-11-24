import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* =========================================
   1. 기본 설정
========================================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9d2e2);
scene.fog = new THREE.Fog(0xb9d2e2, 18, 38);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.65, 8);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const gameElement = document.getElementById("game");

if (!gameElement) {
  throw new Error("HTML에서 id가 game인 요소를 찾을 수 없습니다.");
}

gameElement.prepend(renderer.domElement);

const clock = new THREE.Clock();

const $ = id => document.getElementById(id);

const keys = {};

let yaw = 0;
let pitch = 0;
let pointerLocked = false;
let activeCustomer = null;
let currentTab = "deposit";

let day = 1;
let minutes = 9 * 60;
let sales = 0;
let satisfaction = 100;
let completedCustomers = 0;

const customers = [];

const customerPositions = [
  [-4.2, -1.5],
  [-1.4, -1.5],
  [1.4, -1.5],
  [4.2, -1.5]
];

const materials = {
  floor: new THREE.MeshStandardMaterial({
    color: 0xc7c4ba,
    roughness: 0.85
  }),

  wall: new THREE.MeshStandardMaterial({
    color: 0xf1f3f2,
    roughness: 0.9
  }),

  blue: new THREE.MeshStandardMaterial({
    color: 0x174e70
  }),

  wood: new THREE.MeshStandardMaterial({
    color: 0x967454
  }),

  darkWood: new THREE.MeshStandardMaterial({
    color: 0x60452f
  }),

  glass: new THREE.MeshStandardMaterial({
    color: 0x9dcbd7,
    transparent: true,
    opacity: 0.22
  }),

  white: new THREE.MeshStandardMaterial({
    color: 0xffffff
  }),

  black: new THREE.MeshStandardMaterial({
    color: 0x20252a
  }),

  gold: new THREE.MeshStandardMaterial({
    color: 0xc6a45c
  })
};

function mat(color, roughness = 0.75) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness
  });
}

/* =========================================
   2. 3D 물체 생성 함수
========================================= */

function getValidParent(parent) {
  if (parent && typeof parent.add === "function") {
    return parent;
  }

  return scene;
}

function box(x, y, z, sx, sy, sz, material, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  getValidParent(parent).add(mesh);

  return mesh;
}

// 부모 객체가 없거나 잘못 전달되어도 scene에 추가
function sphere(x, y, z, sx, sy, sz, material, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 16),
    material
  );

  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const target = getValidParent(parent);
  target.add(mesh);

  return mesh;
}

function cylinder(x, y, z, rt, rb, h, material, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, 24),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  getValidParent(parent).add(mesh);

  return mesh;
}

/* =========================================
   3. 조명
========================================= */

scene.add(
  new THREE.HemisphereLight(
    0xe9f5ff,
    0x7c7161,
    2
  )
);

const mainLight = new THREE.DirectionalLight(
  0xfff2dc,
  2.1
);

mainLight.position.set(-5, 10, 7);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);

scene.add(mainLight);

const ceilingLight1 = new THREE.PointLight(
  0xffffff,
  55,
  15
);

ceilingLight1.position.set(-4, 4.5, 0);
scene.add(ceilingLight1);

const ceilingLight2 = new THREE.PointLight(
  0xffffff,
  55,
  15
);

ceilingLight2.position.set(4, 4.5, 0);
scene.add(ceilingLight2);

/* =========================================
   4. 영업점 내부
========================================= */

function addTextSign(text, x, y, z, size = 0.3) {
  return box(
    x,
    y,
    z,
    Math.max(0.6, text.length * size * 0.8),
    size * 1.2,
    0.04,
    materials.blue
  );
}

function createPlant(x, y, z) {
  cylinder(
    x,
    y + 0.35,
    z,
    0.35,
    0.25,
    0.7,
    mat(0x9a6848)
  );

  for (let i = 0; i < 6; i++) {
    const leaf = sphere(
      x + Math.sin(i) * 0.28,
      y + 1.1 + Math.cos(i * 2) * 0.12,
      z + Math.cos(i) * 0.25,
      0.22,
      0.55,
      0.18,
      mat(0x347d4a),
      scene
    );

    leaf.rotation.z = Math.sin(i) * 0.4;
  }
}

function createRoom() {
  // 바닥과 벽
  box(0, -0.15, 0, 20, 0.3, 20, materials.floor);

  box(0, 3, -10, 20, 6, 0.3, materials.wall);
  box(-10, 3, 0, 0.3, 6, 20, materials.wall);
  box(10, 3, 0, 0.3, 6, 20, materials.wall);

  box(0, 5.8, 0, 20, 0.2, 20, materials.white);

  // 신협 로고 벽
  box(0, 3.7, -9.78, 7, 1.3, 0.08, materials.blue);

  addTextSign(
    "춘천신협",
    0,
    3.7,
    -9.68,
    0.7
  );

  // 창구
  for (let i = 0; i < 4; i++) {
    const x = customerPositions[i][0];

    box(x, 1.05, 0.1, 2.5, 0.18, 1.1, materials.wood);
    box(x, 0.55, 0.1, 2.3, 0.9, 0.95, materials.darkWood);
    box(x, 1.18, 0.1, 2.5, 0.06, 1.1, materials.gold);

    // 모니터
    box(x, 1.75, -0.12, 0.8, 0.55, 0.08, materials.black);
    box(x, 1.75, -0.065, 0.7, 0.43, 0.025, mat(0x8cc4d5));

    // 키보드
    box(x, 1.3, 0.38, 0.55, 0.04, 0.25, materials.black);

    // 창구 번호
    box(x, 2.2, -0.1, 0.65, 0.32, 0.12, materials.blue);

    addTextSign(
      String(i + 1) + "번 창구",
      x,
      2.2,
      -0.02,
      0.18
    );
  }

  // 고객 대기 의자
  for (let i = 0; i < 5; i++) {
    const x = -4 + i * 2;

    box(x, 0.55, 3.2, 1.25, 0.15, 0.75, materials.blue);
    box(x, 0.9, 3.55, 1.25, 0.8, 0.16, materials.blue);

    for (const dx of [-0.48, 0.48]) {
      cylinder(
        x + dx,
        0.25,
        3.2,
        0.045,
        0.045,
        0.55,
        materials.black
      );
    }
  }

  // ATM
  box(-8.5, 1.35, -3.8, 1.2, 2.7, 0.7, materials.blue);
  box(-8.5, 1.7, -3.42, 0.85, 0.65, 0.04, mat(0x80c5d9));
  box(-8.5, 0.95, -3.42, 0.45, 0.2, 0.04, materials.black);

  addTextSign("ATM", -8.5, 2.9, -3.3, 0.3);

  // 상담실 유리벽
  box(7.4, 1.2, -5.5, 3.4, 2.4, 0.12, materials.glass);
  box(7.4, 2.5, -5.5, 3.4, 0.08, 0.12, materials.blue);
  box(7.4, 0.05, -5.5, 3.4, 0.08, 0.12, materials.blue);
  box(5.8, 1.2, -5.5, 0.08, 2.4, 0.12, materials.blue);
  box(9, 1.2, -5.5, 0.08, 2.4, 0.12, materials.blue);

  // 화분
  createPlant(-8.3, 0, 5);
  createPlant(8.5, 0, 5);

  // 시계
  cylinder(0, 4.8, -9.55, 0.65, 0.65, 0.08, materials.white);

  box(0, 4.8, -9.45, 0.04, 0.42, 0.03, materials.black);
  box(0.15, 4.8, -9.43, 0.3, 0.04, 0.03, materials.black);

  // 전산 업무 책상
  box(7.2, 0.8, 2.2, 2.1, 0.15, 1.2, materials.wood);
  box(7.2, 1.35, 1.9, 0.85, 0.65, 0.08, materials.black);
  box(7.2, 1.35, 1.85, 0.74, 0.5, 0.025, mat(0x8ac2d3));

  addTextSign("업무 전산", 7.2, 2.1, 1.85, 0.22);
}

/* =========================================
   5. 고객 데이터
========================================= */

const firstNames = [
  "김영숙", "박정희", "이순자", "최영미", "윤선미",
  "김남국", "박승자", "정태용", "김한수", "이윤지",
  "강미정", "남진우", "서경남", "최영희", "한정숙",
  "이귀선", "김종현", "유경아", "안영숙", "표형업",
  "조민수", "장미숙", "오세훈", "임정자", "신종배",
  "윤설희", "박창순", "정선이", "김규", "설동술"
];

const jobs = [
  "회사원",
  "자영업자",
  "음식점 운영",
  "퇴직자",
  "공무원",
  "요양보호사",
  "건설업 종사자",
  "주부",
  "배달업 종사자",
  "운수업 종사자",
  "병원 근무",
  "골프장 캐디",
  "프리랜서",
  "연금 수령자"
];

const scenarios = [
  {
    type: "예금 신규",
    message: "목돈이 생겨서 정기예금에 가입하려고 합니다. 금리와 세금 혜택이 궁금합니다.",
    options: [
      "예치 기간과 금액을 확인하고 적용 가능한 세제 혜택을 함께 안내한다.",
      "가장 높은 금리만 안내하고 바로 가입을 진행한다.",
      "다른 금융기관보다 무조건 유리하다고 설명한다."
    ],
    correct: 0,
    reward: 30000000,
    feedback: "예치 기간과 금액, 세제 혜택을 함께 확인한 좋은 상담입니다."
  },
  {
    type: "예금 재예치",
    message: "오늘 예금이 만기됐습니다. 원금과 이자를 다시 맡기고 싶습니다.",
    options: [
      "자금 사용 계획과 희망 기간을 확인한 뒤 재예치 조건을 안내한다.",
      "기존 상품과 동일한 조건으로 무조건 재예치한다.",
      "만기 금액을 모두 출자금으로 전환한다."
    ],
    correct: 0,
    reward: 50000000,
    feedback: "조합원의 자금 계획에 맞춰 재예치 방향을 안내했습니다."
  },
  {
    type: "예금 해지",
    message: "사업 자금이 급하게 필요해서 예금을 해지하고 싶습니다.",
    options: [
      "중도해지 이율과 이자 손실을 설명하고 필요한 금액을 확인한다.",
      "무조건 만기까지 유지하라고 안내한다.",
      "해지하면 손해라고만 말하고 상담을 종료한다."
    ],
    correct: 0,
    reward: 0,
    feedback: "해지에 따른 손익과 필요한 자금 규모를 확인했습니다."
  },
  {
    type: "정기적금",
    message: "매달 100만 원 정도 저축하고 싶은데 어떤 상품이 좋을까요?",
    options: [
      "월 납입 가능 금액과 기간, 우대조건 충족 여부를 확인한다.",
      "고객 상황과 관계없이 가장 높은 금리만 안내한다.",
      "정기예금만 가능하다고 안내한다."
    ],
    correct: 0,
    reward: 12000000,
    feedback: "고객의 저축 습관과 납입 여력을 고려했습니다."
  },
  {
    type: "출자금",
    message: "출자금은 예금과 어떤 차이가 있나요?",
    options: [
      "조합원 자격과 출자금의 성격, 배당 및 예금자보호 제외 여부를 설명한다.",
      "예금과 똑같이 원금이 보장된다고 안내한다.",
      "출자금은 언제든 예금처럼 바로 인출할 수 있다고 설명한다."
    ],
    correct: 0,
    reward: 2000000,
    feedback: "출자금의 성격과 유의사항을 정확하게 안내했습니다."
  },
  {
    type: "햇살론",
    message: "카드론 금리가 부담돼서 대환할 수 있는 대출이 있는지 문의합니다.",
    options: [
      "재직·소득·신용정보와 기존 채무를 확인하고 보증 요건을 검토한다.",
      "신용점수만 보고 바로 승인 가능하다고 말한다.",
      "기존 대출을 확인하지 않고 최대한도부터 안내한다."
    ],
    correct: 0,
    reward: 5000000,
    feedback: "소득과 채무, 보증 요건을 확인하는 신중한 상담입니다."
  },
  {
    type: "담보대출",
    message: "아파트를 담보로 대출을 받고 싶습니다. 얼마나 가능할까요?",
    options: [
      "시세와 선순위 권리, 방공제, LTV 및 상환능력을 확인한다.",
      "아파트 시세의 80%까지 무조건 가능하다고 안내한다.",
      "담보가 있으니 소득 확인은 필요 없다고 설명한다."
    ],
    correct: 0,
    reward: 100000000,
    feedback: "담보가치와 상환능력을 함께 검토하는 올바른 접근입니다."
  },
  {
    type: "전세대출",
    message: "전세 계약을 앞두고 있는데 전세자금대출 상담을 받고 싶습니다.",
    options: [
      "임대차계약과 보증기관 요건, 주택 및 소득 조건을 확인한다.",
      "계약금만 있으면 무조건 대출이 가능하다고 말한다.",
      "보증금만 확인하고 대출을 확정한다."
    ],
    correct: 0,
    reward: 80000000,
    feedback: "계약 내용과 보증기관 기준을 확인하는 상담입니다."
  },
  {
    type: "화재공제",
    message: "건물을 소유하고 있는데 화재보험이 꼭 필요한가요?",
    options: [
      "건물 용도와 구조, 시설 및 현재 가입 보험을 확인하고 보장 공백을 설명한다.",
      "화재가 날 가능성이 낮으니 가입할 필요가 없다고 말한다.",
      "보장 내용을 확인하지 않고 가장 비싼 상품을 권한다."
    ],
    correct: 0,
    reward: 300000,
    feedback: "기존 계약을 확인하고 필요한 보장을 안내했습니다."
  },
  {
    type: "간병인 공제",
    message: "부모님 간병비가 걱정됩니다. 간병 관련 상품이 있을까요?",
    options: [
      "기존 보장과 가입 연령, 보장 기간 및 간병 관련 특약을 확인한다.",
      "간병비가 무조건 전액 보장된다고 안내한다.",
      "기존 보험은 확인하지 않고 바로 가입을 권한다."
    ],
    correct: 0,
    reward: 500000,
    feedback: "기존 보장과 부족한 부분을 먼저 살펴보는 상담입니다."
  },
  {
    type: "계좌 개설",
    message: "처음 거래하러 왔습니다. 입출금 통장을 만들고 싶습니다.",
    options: [
      "거래 목적과 실명확인, 금융거래 목적 증빙 및 필요한 절차를 안내한다.",
      "신분증 없이 바로 계좌를 개설한다.",
      "거래 목적 확인은 필요 없다고 안내한다."
    ],
    correct: 0,
    reward: 0,
    feedback: "실명확인과 금융거래 목적 확인 절차를 안내했습니다."
  },
  {
    type: "체크카드",
    message: "통장을 만들었는데 체크카드도 발급받을 수 있나요?",
    options: [
      "카드 이용 조건과 연결 계좌, 발급 절차를 설명한다.",
      "계좌와 상관없이 아무 카드나 발급한다.",
      "카드 이용 조건은 안내하지 않는다."
    ],
    correct: 0,
    reward: 100000,
    feedback: "연결 계좌와 카드 이용 조건을 안내했습니다."
  },
  {
    type: "상속 상담",
    message: "가족이 돌아가셔서 예금 상속 절차를 알아보고 싶습니다.",
    options: [
      "상속인 확인과 필요한 서류, 상속 비율 및 지급 절차를 안내한다.",
      "가족 중 한 명이 오면 무조건 전액 지급한다.",
      "가족관계 확인 없이 바로 해지한다."
    ],
    correct: 0,
    reward: 0,
    feedback: "상속 관계와 필요 서류를 확인하는 신중한 상담입니다."
  },
  {
    type: "만기 안내",
    message: "다음 주에 예금이 만기되는데 어떻게 하면 좋을까요?",
    options: [
      "만기 금액과 자금 사용 시기, 재예치 의향을 확인한다.",
      "고객 의사와 관계없이 자동 재예치만 권한다.",
      "만기일만 안내하고 상담을 끝낸다."
    ],
    correct: 0,
    reward: 10000000,
    feedback: "만기 이후 자금 운용 계획까지 살펴봤습니다."
  },
  {
    type: "대출 연장",
    message: "다음 달 대출 만기인데 연장할 수 있을까요?",
    options: [
      "현재 상환 상태와 소득, 담보 및 신용정보를 재확인한다.",
      "기존 대출이 있으니 자동으로 연장된다고 말한다.",
      "만기일이 지나도 괜찮다고 안내한다."
    ],
    correct: 0,
    reward: 0,
    feedback: "연장 심사에 필요한 사항을 확인하는 상담입니다."
  },
  {
    type: "연체 상담",
    message: "대출 이자가 연체됐는데 어떻게 처리해야 하나요?",
    options: [
      "연체 금액과 기간, 상환 가능 일정을 확인하고 해결 방법을 안내한다.",
      "연체 사실을 무시해도 된다고 말한다.",
      "상환 계획을 확인하지 않고 상담을 종료한다."
    ],
    correct: 0,
    reward: 0,
    feedback: "연체 상황과 상환 계획을 확인했습니다."
  },
  {
    type: "저율과세",
    message: "신협 예금은 세금 혜택이 있다고 들었는데 맞나요?",
    options: [
      "조합원 여부와 적용 한도, 관련 세법 및 가입 시점의 요건을 확인한다.",
      "모든 고객이 금액 제한 없이 비과세라고 설명한다.",
      "세금은 금융기관과 관계없다고 안내한다."
    ],
    correct: 0,
    reward: 20000000,
    feedback: "세제 혜택의 대상과 한도를 구분해 설명했습니다."
  },
  {
    type: "예금자보호",
    message: "신협에 예금해도 안전한지 궁금합니다.",
    options: [
      "신협 예금자보호 제도와 보호 한도, 보호 대상 상품을 설명한다.",
      "모든 금융상품이 동일하게 보호된다고 설명한다.",
      "출자금도 예금과 똑같이 보호된다고 말한다."
    ],
    correct: 0,
    reward: 30000000,
    feedback: "보호 대상과 제외 상품을 구분해 안내했습니다."
  },
  {
    type: "소득증빙",
    message: "대출을 받고 싶은데 소득을 어떻게 증명해야 하나요?",
    options: [
      "직장 형태와 소득 종류에 따라 적합한 증빙 서류를 안내한다.",
      "소득증빙은 필요 없다고 말한다.",
      "통장 잔액만 있으면 충분하다고 안내한다."
    ],
    correct: 0,
    reward: 0,
    feedback: "고객의 소득 형태에 맞는 증빙 방법을 안내했습니다."
  }
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createCustomerData() {
  const scenario = randomItem(scenarios);
  const female = Math.random() > 0.45;

  return {
    name: randomItem(firstNames),
    age: Math.floor(25 + Math.random() * 55),
    gender: female ? "여성" : "남성",
    job: randomItem(jobs),
    income: Math.floor(1800 + Math.random() * 6500),
    credit: Math.floor(550 + Math.random() * 400),
    scenario,
    done: false,
    mesh: null,
    positionIndex: 0
  };
}

/* =========================================
   6. 심즈풍 캐릭터
========================================= */

function createHuman(customer, x, z) {
  const group = new THREE.Group();

  const skin = mat(randomItem([
    0xf1c7a5,
    0xe5b58f,
    0xd8a47f,
    0xf4d2b4
  ]));

  const hair = mat(randomItem([
    0x201812,
    0x493020,
    0x171717,
    0x786044,
    0x29212a
  ]));

  const clothes = mat(randomItem([
    0x345d7d,
    0x725b83,
    0x456b58,
    0x9b5f54,
    0x333f50,
    0x9a825b,
    0x526f86,
    0x704e3e
  ]));

  const pants = mat(randomItem([
    0x293747,
    0x454545,
    0x263c35,
    0x655b50
  ]));

  const shoes = mat(0x252525);
  const eyeWhite = mat(0xffffff);
  const iris = mat(0x38251b);
  const dark = mat(0x29201d);

  // 몸통
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.34, 0.65, 5, 12),
    clothes
  );

  torso.position.y = 1.25;
  torso.scale.set(1, 1.05, 0.7);
  torso.castShadow = true;

  group.add(torso);

  // 목과 얼굴
  cylinder(0, 1.83, 0, 0.11, 0.12, 0.22, skin, group);

  sphere(
    0, 2.15, 0.03,
    0.35, 0.43, 0.31,
    skin,
    group
  );

  // 귀
  sphere(-0.35, 2.15, 0.02, 0.09, 0.14, 0.07, skin, group);
  sphere(0.35, 2.15, 0.02, 0.09, 0.14, 0.07, skin, group);

  // 눈과 눈썹
  for (const side of [-1, 1]) {
    sphere(
      side * 0.13,
      2.22,
      0.31,
      0.075,
      0.09,
      0.045,
      eyeWhite,
      group
    );

    sphere(
      side * 0.13,
      2.22,
      0.35,
      0.035,
      0.05,
      0.025,
      iris,
      group
    );

    sphere(
      side * 0.13,
      2.24,
      0.37,
      0.014,
      0.018,
      0.012,
      eyeWhite,
      group
    );

    const brow = box(
      side * 0.13,
      2.34,
      0.31,
      0.13,
      0.025,
      0.035,
      hair,
      group
    );

    brow.rotation.z = side * -0.08;
  }

  // 코와 입
  sphere(0, 2.12, 0.34, 0.055, 0.09, 0.07, skin, group);
  sphere(0, 2.0, 0.31, 0.09, 0.025, 0.025, mat(0x9f5958), group);

  // 머리카락
  sphere(0, 2.48, 0, 0.36, 0.2, 0.33, hair, group);
  sphere(0, 2.36, -0.19, 0.34, 0.28, 0.13, hair, group);

  for (let i = 0; i < 3; i++) {
    sphere(
      -0.16 + i * 0.16,
      2.43 - Math.abs(i - 1) * 0.04,
      0.25,
      0.11,
      0.12,
      0.1,
      hair,
      group
    );
  }

  // 팔과 손
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.095, 0.52, 4, 8),
      clothes
    );

    arm.position.set(side * 0.39, 1.32, 0);
    arm.rotation.z = side * -0.13;
    arm.castShadow = true;

    group.add(arm);

    sphere(
      side * 0.4,
      0.99,
      0.03,
      0.11,
      0.13,
      0.11,
      skin,
      group
    );

    for (let f = 0; f < 4; f++) {
      sphere(
        side * 0.4 + (f - 1.5) * 0.035,
        0.91,
        0.05,
        0.025,
        0.07,
        0.025,
        skin,
        group
      );
    }
  }

  // 다리와 신발
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.13, 0.52, 4, 8),
      pants
    );

    leg.position.set(side * 0.15, 0.47, 0);
    leg.castShadow = true;

    group.add(leg);

    sphere(
      side * 0.15,
      0.12,
      0.09,
      0.15,
      0.09,
      0.27,
      shoes,
      group
    );
  }

  // 여성 긴 머리
  if (customer.gender === "여성" && Math.random() > 0.35) {
    sphere(-0.3, 2.17, -0.1, 0.12, 0.38, 0.16, hair, group);
    sphere(0.3, 2.17, -0.1, 0.12, 0.38, 0.16, hair, group);
  }

  // 안경
  if (Math.random() > 0.65) {
    for (const side of [-1, 1]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.012, 8, 20),
        dark
      );

      ring.position.set(side * 0.13, 2.22, 0.36);

      group.add(ring);
    }

    box(0, 2.22, 0.36, 0.1, 0.015, 0.015, dark, group);
  }

  // 옷 단추
  for (let i = 0; i < 3; i++) {
    sphere(
      0,
      1.45 - i * 0.14,
      0.235,
      0.025,
      0.025,
      0.02,
      materials.gold,
      group
    );
  }

  // 발밑 그림자
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 24),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.15
    })
  );

  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.015;

  group.add(shadow);

  group.position.set(x, 0, z);
  group.rotation.y = 0;
  group.userData.customer = customer;

  scene.add(group);

  customer.mesh = group;

  return group;
}

/* =========================================
   7. 고객 배치
========================================= */

function spawnCustomers() {
  for (let i = 0; i < customerPositions.length; i++) {
    const customer = createCustomerData();

    customer.positionIndex = i;

    const [x, z] = customerPositions[i];

    createHuman(customer, x, z);

    customers.push(customer);
  }
}

function replaceCustomer(oldCustomer) {
  if (oldCustomer.mesh) {
    scene.remove(oldCustomer.mesh);
  }

  const index = oldCustomer.positionIndex;
  const customer = createCustomerData();

  customer.positionIndex = index;

  const [x, z] = customerPositions[index];

  createHuman(customer, x, z);

  customers[index] = customer;

  showToast("새로운 고객이 방문했습니다.");
}

/* =========================================
   8. 고객 상담
========================================= */

function openCustomer(customer) {
  if (customer.done) return;

  activeCustomer = customer;

  $("customer-name").textContent =
    customer.name + " 고객님";

  $("customer-profile").innerHTML = `
    <span class="profile-tag">${customer.age}세</span>
    <span class="profile-tag">${customer.gender}</span>
    <span class="profile-tag">${customer.job}</span>
    <span class="profile-tag">연소득 ${customer.income.toLocaleString()}만원</span>
    <span class="profile-tag">신용점수 ${customer.credit}점</span>
    <span class="profile-tag">${customer.scenario.type}</span>
  `;

  $("customer-message").textContent =
    customer.scenario.message;

  $("dialog-feedback").textContent = "";
  $("dialog-feedback").style.color = "#176d48";

  const answerList = $("answer-list");

  answerList.innerHTML = "";

  customer.scenario.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.className = "answer-button";
    button.textContent = `${index + 1}. ${option}`;

    button.addEventListener("click", () => {
      chooseAnswer(index);
    });

    answerList.appendChild(button);
  });

  $("dialog").classList.remove("hidden");

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }
}

function chooseAnswer(index) {
  if (!activeCustomer) return;

  const customer = activeCustomer;
  const correct = index === customer.scenario.correct;

  if (correct) {
    satisfaction = Math.min(100, satisfaction + 2);

    sales += customer.scenario.reward;

    $("dialog-feedback").textContent =
      "상담이 완료되었습니다. " +
      customer.scenario.feedback;

    $("dialog-feedback").style.color = "#176d48";

    showToast("올바른 상담입니다. 실적이 반영되었습니다.");
  } else {
    satisfaction = Math.max(0, satisfaction - 8);

    $("dialog-feedback").textContent =
      "아쉬운 상담입니다. 고객 상황과 금융상품의 조건을 다시 확인해 보세요.";

    $("dialog-feedback").style.color = "#c04444";

    showToast("상담 점수가 하락했습니다.");
  }

  completedCustomers++;

  updateHUD();

  document.querySelectorAll(".answer-button").forEach(button => {
    button.disabled = true;
    button.style.opacity = "0.55";
  });

  const finishButton = document.createElement("button");

  finishButton.className = "primary-button";
  finishButton.textContent = "상담 종료";

  finishButton.addEventListener("click", () => {
    customer.done = true;

    $("dialog").classList.add("hidden");

    activeCustomer = null;

    replaceCustomer(customer);

    showToast("게임 화면을 클릭하면 다시 이동할 수 있습니다.");
  });

  $("answer-list").appendChild(finishButton);
}

$("close-dialog").addEventListener("click", () => {
  $("dialog").classList.add("hidden");

  activeCustomer = null;

  showToast("게임 화면을 클릭하면 다시 이동할 수 있습니다.");
});

/* =========================================
   9. 전산 업무
========================================= */

function openComputer() {
  $("computer").classList.remove("hidden");

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  renderComputer();
}

$("close-computer").addEventListener("click", () => {
  $("computer").classList.add("hidden");

  showToast("게임 화면을 클릭하면 다시 이동할 수 있습니다.");
});

document.querySelectorAll(".computer-tabs button").forEach(button => {
  button.addEventListener("click", () => {
    currentTab = button.dataset.tab;

    document.querySelectorAll(".computer-tabs button").forEach(tab => {
      tab.classList.toggle(
        "active",
        tab.dataset.tab === currentTab
      );
    });

    renderComputer();
  });
});

function renderComputer() {
  const content = $("computer-content");

  const forms = {
    deposit: `
      <div class="computer-description">
        정기예금 신규 및 재예치 업무입니다. 예치 금액과 기간, 적용 가능한 세제 혜택을 확인하세요.
      </div>

      <div class="form-row">
        <label>고객명</label>
        <input id="work-name" placeholder="고객 이름 입력">
      </div>

      <div class="form-row">
        <label>예치 금액</label>
        <input id="work-amount" type="number" placeholder="예: 30000000">
      </div>

      <div class="form-row">
        <label>상품 선택</label>
        <select id="work-product">
          <option>정기예탁금</option>
          <option>자유적립적금</option>
          <option>정기적금</option>
          <option>출자금</option>
        </select>
      </div>

      <div class="form-row">
        <label>예치 기간</label>
        <select id="work-period">
          <option>6개월</option>
          <option>12개월</option>
          <option>13개월</option>
          <option>15개월</option>
          <option>24개월</option>
        </select>
      </div>

      <button class="primary-button" id="submit-work">업무 처리</button>
    `,

    loan: `
      <div class="computer-description">
        여신 사전 검토 업무입니다. 담보와 소득, 신용정보 등을 확인하세요. 실제 승인 여부는 별도 심사가 필요합니다.
      </div>

      <div class="form-row">
        <label>고객명</label>
        <input id="work-name" placeholder="고객 이름 입력">
      </div>

      <div class="form-row">
        <label>희망 대출 금액</label>
        <input id="work-amount" type="number" placeholder="예: 50000000">
      </div>

      <div class="form-row">
        <label>대출 종류</label>
        <select id="work-product">
          <option>아파트 담보대출</option>
          <option>주택 담보대출</option>
          <option>전세자금대출</option>
          <option>햇살론</option>
          <option>신용대출</option>
        </select>
      </div>

      <div class="form-row">
        <label>소득 확인</label>
        <select id="work-period">
          <option>소득증빙 확인</option>
          <option>추가 서류 필요</option>
          <option>소득 확인 불가</option>
        </select>
      </div>

      <button class="primary-button" id="submit-work">사전 검토 등록</button>
    `,

    insurance: `
      <div class="computer-description">
        공제 상담 기록 업무입니다. 고객의 기존 보험과 필요한 보장 내용을 확인하세요.
      </div>

      <div class="form-row">
        <label>고객명</label>
        <input id="work-name" placeholder="고객 이름 입력">
      </div>

      <div class="form-row">
        <label>상담 상품</label>
        <select id="work-product">
          <option>화재공제</option>
          <option>운전자공제</option>
          <option>간병인공제</option>
          <option>상해공제</option>
        </select>
      </div>

      <div class="form-row">
        <label>상담 내용</label>
        <select id="work-period">
          <option>신규 가입 상담</option>
          <option>기존 계약 분석</option>
          <option>보장 내용 안내</option>
          <option>만기 및 갱신 상담</option>
        </select>
      </div>

      <button class="primary-button" id="submit-work">상담 기록 등록</button>
    `,

    member: `
      <div class="computer-description">
        조합원 및 전자금융 서비스 업무입니다. 가입 조건과 본인확인 절차를 확인하세요.
      </div>

      <div class="form-row">
        <label>고객명</label>
        <input id="work-name" placeholder="고객 이름 입력">
      </div>

      <div class="form-row">
        <label>업무 종류</label>
        <select id="work-product">
          <option>조합원 가입</option>
          <option>출자금 납입</option>
          <option>OnBank 가입</option>
          <option>LifeOn 설치 안내</option>
          <option>RiON 브랜치 개설</option>
          <option>체크카드 발급</option>
        </select>
      </div>

      <div class="form-row">
        <label>처리 상태</label>
        <select id="work-period">
          <option>신규 등록</option>
          <option>상담 완료</option>
          <option>추가 서류 필요</option>
        </select>
      </div>

      <button class="primary-button" id="submit-work">업무 처리</button>
    `
  };

  content.innerHTML = forms[currentTab];

  $("submit-work").addEventListener("click", () => {
    const name =
      $("work-name")?.value.trim() || "고객";

    const amount =
      Number($("work-amount")?.value || 0);

    const product =
      $("work-product")?.value || "금융 업무";

    if (currentTab === "deposit" && amount <= 0) {
      showToast("예치 금액을 입력해 주세요.");
      return;
    }

    if (currentTab === "loan" && amount <= 0) {
      showToast("희망 대출 금액을 입력해 주세요.");
      return;
    }

    if (currentTab === "deposit" || currentTab === "loan") {
      sales += amount;
    } else {
      sales += 100000;
    }

    satisfaction = Math.min(100, satisfaction + 1);

    updateHUD();

    showToast(
      `${name} 고객 ${product} 업무가 등록되었습니다.`
    );

    content.innerHTML = `
      <div class="computer-description">
        <h3>업무 처리가 완료되었습니다.</h3>
        <p>고객명: ${escapeHTML(name)}</p>
        <p>업무 종류: ${escapeHTML(product)}</p>
        <p>등록 실적이 반영되었습니다.</p>
      </div>

      <button class="primary-button" id="back-work">
        다른 업무 처리하기
      </button>
    `;

    $("back-work").addEventListener("click", renderComputer);
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

/* =========================================
   10. 마우스 포인터 잠금
========================================= */

function requestPointer() {
  if (!$("start-screen").classList.contains("hidden")) return;
  if (!$("dialog").classList.contains("hidden")) return;
  if (!$("computer").classList.contains("hidden")) return;
  if (document.pointerLockElement) return;

  try {
    const result = renderer.domElement.requestPointerLock();

    if (result && typeof result.catch === "function") {
      result.catch(() => {
        showToast("게임 화면을 다시 클릭해 주세요.");
      });
    }
  } catch (error) {
    showToast("게임 화면을 다시 클릭해 주세요.");
  }
}

$("start-button").addEventListener("click", () => {
  $("start-screen").classList.add("hidden");

  requestPointer();

  showToast("근화지점 영업을 시작합니다.");
});

renderer.domElement.addEventListener("click", () => {
  requestPointer();
});

document.addEventListener("pointerlockchange", () => {
  pointerLocked =
    document.pointerLockElement === renderer.domElement;

  if (
    !pointerLocked &&
    $("start-screen").classList.contains("hidden") &&
    $("dialog").classList.contains("hidden") &&
    $("computer").classList.contains("hidden")
  ) {
    $("interaction-hint").textContent =
      "게임 화면을 클릭하면 다시 시점 조작을 할 수 있습니다.";
  }
});

document.addEventListener("mousemove", event => {
  if (!pointerLocked) return;

  yaw -= event.movementX * 0.002;
  pitch -= event.movementY * 0.002;

  pitch = Math.max(-1.35, Math.min(1.35, pitch));

  camera.rotation.set(pitch, yaw, 0);
});

/* =========================================
   11. 키보드 및 이동
========================================= */

document.addEventListener("keydown", event => {
  keys[event.code] = true;

  if (event.code === "KeyE" && !event.repeat) {
    interact();
  }
});

document.addEventListener("keyup", event => {
  keys[event.code] = false;
});

function movePlayer(delta) {
  if (!pointerLocked) return;

  const speed =
    keys.ShiftLeft || keys.ShiftRight ? 7 : 4;

  const direction = new THREE.Vector3();

  if (keys.KeyW) direction.z -= 1;
  if (keys.KeyS) direction.z += 1;
  if (keys.KeyA) direction.x -= 1;
  if (keys.KeyD) direction.x += 1;

  if (direction.lengthSq() > 0) {
    direction.normalize();

    direction.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw
    );

    camera.position.x += direction.x * speed * delta;
    camera.position.z += direction.z * speed * delta;
  }

  camera.position.x = THREE.MathUtils.clamp(
    camera.position.x,
    -9,
    9
  );

  camera.position.z = THREE.MathUtils.clamp(
    camera.position.z,
    -8.8,
    9
  );

  camera.position.y = 1.65;
}

/* =========================================
   12. 상호작용
========================================= */

function interact() {
  if (!pointerLocked) return;

  let nearest = null;
  let nearestDistance = Infinity;

  for (const customer of customers) {
    if (!customer.mesh || customer.done) continue;

    const distance = camera.position.distanceTo(
      customer.mesh.position
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = customer;
    }
  }

  if (nearest && nearestDistance < 3.3) {
    openCustomer(nearest);
    return;
  }

  const terminalPosition = new THREE.Vector3(
    7.2,
    1.4,
    2.0
  );

  const terminalDistance =
    camera.position.distanceTo(terminalPosition);

  if (terminalDistance < 3.2) {
    openComputer();
    return;
  }

  showToast("상호작용할 수 있는 대상이 가까이에 없습니다.");
}

/* =========================================
   13. HUD 및 시간
========================================= */

function updateHUD() {
  $("day").textContent = day + "일차";

  $("sales").textContent =
    sales.toLocaleString("ko-KR") + "원";

  $("satisfaction").textContent =
    satisfaction + "%";

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  $("clock").textContent =
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0");
}

function advanceTime(delta) {
  if (!pointerLocked) return;

  minutes += delta * 2;

  if (minutes >= 17 * 60) {
    minutes = 9 * 60;
    day++;

    showToast(
      "영업일이 변경되었습니다. 새로운 하루를 시작합니다."
    );
  }

  updateHUD();
}

/* =========================================
   14. 고객 접근 안내
========================================= */

function updateInteractionHint() {
  if (!pointerLocked) return;

  let nearestCustomer = null;
  let nearestDistance = Infinity;

  for (const customer of customers) {
    if (!customer.mesh || customer.done) continue;

    const distance = camera.position.distanceTo(
      customer.mesh.position
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestCustomer = customer;
    }
  }

  if (nearestCustomer && nearestDistance < 3.3) {
    $("interaction-hint").textContent =
      `E 키를 눌러 ${nearestCustomer.name} 고객 상담하기`;

    return;
  }

  const terminalDistance = camera.position.distanceTo(
    new THREE.Vector3(7.2, 1.4, 2.0)
  );

  if (terminalDistance < 3.2) {
    $("interaction-hint").textContent =
      "E 키를 눌러 전산 업무 시작하기";

    return;
  }

  $("interaction-hint").textContent =
    "고객이나 전산 기기에 가까이 다가가세요.";
}

/* =========================================
   15. 알림 메시지
========================================= */

let toastTimer = null;

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

/* =========================================
   16. 애니메이션
========================================= */

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  movePlayer(delta);
  advanceTime(delta);
  updateInteractionHint();

  const elapsed = clock.elapsedTime;

  customers.forEach((customer, index) => {
    if (!customer.mesh) return;

    customer.mesh.position.y =
      Math.sin(elapsed * 1.5 + index) * 0.015;
  });

  renderer.render(scene, camera);
}

/* =========================================
   17. 화면 크기 변경
========================================= */

window.addEventListener("resize", () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
});

/* =========================================
   18. 게임 실행
========================================= */

createRoom();

spawnCustomers();

updateHUD();

animate();
