

"use strict";

/* =========================================
   춘천신협 3D 금융창구
   전체 게임 코드
========================================= */

const $ = (id) => document.getElementById(id);

const state = {
  started: false,
  threeReady: false,
  scene: null,
  camera: null,
  renderer: null,
  THREE: null,

  waiting: [],
  active: null,
  leaving: [],

  customerNumber: 0,
  step: 0,
  answers: [],

  day: 1,
  minutes: 540,
  sales: 0,
  satisfaction: 100,

  spawnElapsed: 0,
  lastFrame: 0,
  toastTimer: null
};

const requiredElements = [
  "scene-container",
  "start-screen",
  "start-button",
  "call-button",
  "finish-button",
  "queue-list",
  "waiting-count",
  "customer-panel",
  "customer-name",
  "customer-number",
  "customer-info",
  "step-count",
  "progress-bar",
  "customer-message",
  "answer-list",
  "feedback",
  "day",
  "clock",
  "sales",
  "satisfaction",
  "toast"
];

function checkElements() {
  const missing = requiredElements.filter(id => !$(id));

  if (missing.length) {
    throw new Error(
      "HTML에서 다음 요소를 찾을 수 없습니다: " +
      missing.join(", ")
    );
  }
}

/* =========================================
   고객 상담 데이터
========================================= */

const customerCases = [
  {
    purpose: "정기예금",
    job: "직장인",
    age: "50대",
    questions: [
      {
        question: "안녕하세요. 예금 만기 자금을 다시 맡기고 싶습니다.",
        expected: "자금 사용 시기와 예치 기간, 금액을 먼저 확인하겠습니다."
      },
      {
        question: "1년 정도 예치할 생각입니다.",
        expected: "예치 기간에 따른 금리와 중도해지 조건을 안내하겠습니다."
      },
      {
        question: "금리가 가장 높은 상품으로 하고 싶습니다.",
        expected: "가입 조건과 우대금리, 실제 적용 금리를 확인하겠습니다."
      },
      {
        question: "출자금도 가입해야 하나요?",
        expected: "출자금의 성격과 배당 가능성, 환급 제한을 설명하겠습니다."
      },
      {
        question: "예금자보호는 어떻게 되나요?",
        expected: "현재 예금자보호 제도와 적용 대상 및 한도를 안내하겠습니다."
      },
      {
        question: "배우자 명의로도 가입할 수 있나요?",
        expected: "명의자 본인 확인과 필요한 거래 절차를 설명하겠습니다."
      },
      {
        question: "세금 혜택도 받을 수 있을까요?",
        expected: "세제 혜택 대상 자격과 잔여 한도, 적용 기준을 확인하겠습니다."
      }
    ]
  },

  {
    purpose: "햇살론",
    job: "중소기업 근로자",
    age: "40대",
    questions: [
      {
        question: "생활비가 필요해서 햇살론을 알아보고 있습니다.",
        expected: "자금 용도와 현재 채무, 필요한 금액을 확인하겠습니다."
      },
      {
        question: "현재 회사에서 근무하고 있습니다.",
        expected: "재직기간과 건강보험료 등 소득 증빙자료를 확인하겠습니다."
      },
      {
        question: "연봉은 3천만 원 정도입니다.",
        expected: "소득금액과 소득 증빙자료를 확인하겠습니다."
      },
      {
        question: "카드론이 조금 있습니다.",
        expected: "기존 대출과 카드론 등 금융기관별 채무 현황을 확인하겠습니다."
      },
      {
        question: "보증은 어디에서 해주는 건가요?",
        expected: "상품에 따른 보증기관과 보증 심사 조건을 설명하겠습니다."
      },
      {
        question: "한도는 얼마나 나올까요?",
        expected: "보증기관 심사와 신협 내부 심사 결과에 따라 한도가 결정된다고 안내하겠습니다."
      },
      {
        question: "필요한 서류를 알려주세요.",
        expected: "신분증과 재직 및 소득 관련 서류를 안내하겠습니다."
      }
    ]
  },

  {
    purpose: "정기적금",
    job: "회사원",
    age: "30대",
    questions: [
      {
        question: "매달 100만 원씩 저축하고 싶습니다.",
        expected: "월 불입 가능 금액과 저축 목적을 확인하겠습니다."
      },
      {
        question: "1년 동안 납입하고 싶습니다.",
        expected: "가입 기간에 따른 금리와 만기 조건을 안내하겠습니다."
      },
      {
        question: "우대금리를 받을 수 있나요?",
        expected: "우대금리 조건과 충족 여부를 확인하겠습니다."
      },
      {
        question: "체크카드도 만들고 싶습니다.",
        expected: "체크카드 발급 조건과 이용 혜택을 설명하겠습니다."
      },
      {
        question: "모바일로 관리하고 싶습니다.",
        expected: "모바일뱅킹 가입과 이용 방법을 안내하겠습니다."
      },
      {
        question: "자동이체도 설정해 주세요.",
        expected: "출금 계좌와 이체일, 자동이체 금액을 확인하겠습니다."
      },
      {
        question: "최종 금리를 확인해 주세요.",
        expected: "가입 당일 금리와 적용되는 우대조건을 확인하겠습니다."
      }
    ]
  },

  {
    purpose: "전세자금대출",
    job: "직장인",
    age: "30대",
    questions: [
      {
        question: "전세자금대출을 알아보고 있습니다.",
        expected: "보증금과 계약 일정, 주택 유형을 확인하겠습니다."
      },
      {
        question: "보증금은 2억 원입니다.",
        expected: "필요 자금과 본인 자금, 희망 대출 금액을 확인하겠습니다."
      },
      {
        question: "다가구주택에 들어갈 예정입니다.",
        expected: "등기부등본과 선순위 권리, 임대차 현황을 확인하겠습니다."
      },
      {
        question: "집주인 확인도 필요한가요?",
        expected: "임대인 정보와 소유권, 임대차계약 내용을 확인하겠습니다."
      },
      {
        question: "연봉은 3천만 원입니다.",
        expected: "소득 증빙자료와 기존 부채 현황을 확인하겠습니다."
      },
      {
        question: "보증기관 심사가 있나요?",
        expected: "상품별 보증기관과 보증 심사 조건을 설명하겠습니다."
      },
      {
        question: "언제까지 신청해야 하나요?",
        expected: "상품별 신청 기한과 계약일, 잔금일을 확인하겠습니다."
      }
    ]
  },

  {
    purpose: "화재공제",
    job: "자영업자",
    age: "50대",
    questions: [
      {
        question: "가게 화재공제를 알아보고 있습니다.",
        expected: "업종과 건물 구조, 사용 용도 및 시설 현황을 확인하겠습니다."
      },
      {
        question: "건물은 제 소유입니다.",
        expected: "건물 소유 여부와 구조, 면적 및 사용 용도를 확인하겠습니다."
      },
      {
        question: "집기와 재고도 보장되나요?",
        expected: "건물과 시설, 집기 및 재고별 보장 가능 여부를 확인하겠습니다."
      },
      {
        question: "기존 보험도 있습니다.",
        expected: "기존 보험증권과 가입 담보, 보장 금액을 비교하겠습니다."
      },
      {
        question: "화재가 나면 보상받을 수 있나요?",
        expected: "가입 담보와 보장 범위, 면책 사항을 설명하겠습니다."
      },
      {
        question: "보험료를 줄일 수 있나요?",
        expected: "필요한 보장과 가입 금액을 검토하겠습니다."
      },
      {
        question: "가입 전에 확인할 사항은요?",
        expected: "약관과 고지사항, 보장 범위를 꼼꼼하게 확인하겠습니다."
      }
    ]
  },

  {
    purpose: "비과세 예금",
    job: "은퇴자",
    age: "60대",
    questions: [
      {
        question: "목돈을 예금으로 맡기고 싶습니다.",
        expected: "예치 금액과 기간, 자금 운용 계획을 확인하겠습니다."
      },
      {
        question: "세금 혜택이 궁금합니다.",
        expected: "비과세종합저축과 신협 예탁금 관련 세제 혜택을 구분해 설명하겠습니다."
      },
      {
        question: "저도 대상이 될까요?",
        expected: "세제 혜택 대상 자격과 법령상 요건을 확인하겠습니다."
      },
      {
        question: "다른 은행에서도 가입했습니다.",
        expected: "기존 가입 내역과 잔여 한도를 확인하겠습니다."
      },
      {
        question: "조합원 가입도 필요한가요?",
        expected: "조합원 여부와 세제 적용 요건을 구분해 설명하겠습니다."
      },
      {
        question: "일반과세와 차이가 큰가요?",
        expected: "예치 금액과 기간에 따른 예상 세금을 비교하겠습니다."
      },
      {
        question: "오늘 가입할 수 있나요?",
        expected: "현재 자격과 잔여 한도, 해당 연도 적용 기준을 확인하겠습니다."
      }
    ]
  }
];

const customerNames = [
  "김영숙", "박정호", "이선희", "최민수",
  "정미경", "강현우", "윤정자", "한지훈",
  "서영희", "임성호", "조은정", "오상철",
  "배정희", "문성진", "신미자", "장현수",
  "이명희", "김성호", "박은정", "최영수"
];

const avatarList = ["👨", "👩", "👨‍🦳", "👩‍🦳"];

/* =========================================
   알림
========================================= */

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(state.toastTimer);

  state.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

/* =========================================
   화면 정보
========================================= */

function updateHUD() {
  const hour = Math.floor(state.minutes / 60);
  const minute = Math.floor(state.minutes % 60);

  $("day").textContent = `${state.day}일차`;

  $("clock").textContent =
    String(hour).padStart(2, "0") + ":" +
    String(minute).padStart(2, "0");

  $("sales").textContent =
    state.sales.toLocaleString("ko-KR") + "원";

  $("satisfaction").textContent =
    state.satisfaction + "%";
}

/* =========================================
   대기열
========================================= */

function renderQueue() {
  const list = $("queue-list");

  list.innerHTML = "";

  $("waiting-count").textContent =
    state.waiting.length + "명";

  state.waiting.forEach((customer, index) => {
    const item = document.createElement("div");
    item.className = "queue-item";

    const avatar = document.createElement("div");
    avatar.className = "queue-avatar";
    avatar.textContent = customer.avatar;

    const detail = document.createElement("div");
    detail.className = "queue-detail";

    const name = document.createElement("strong");
    name.textContent = customer.name;

    const purpose = document.createElement("small");
    purpose.textContent = customer.data.purpose;

    detail.append(name, purpose);

    const number = document.createElement("span");
    number.className = "queue-number";
    number.textContent = `${index + 1}번`;

    item.append(avatar, detail, number);
    list.appendChild(item);
  });

  $("call-button").disabled =
    !state.started ||
    !!state.active ||
    state.waiting.length === 0;
}

/* =========================================
   3D 초기화
========================================= */

async function initializeThree() {
  try {
    const THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
    );

    state.THREE = THREE;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd9e8eb);
    scene.fog = new THREE.Fog(0xd9e8eb, 20, 38);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    camera.position.set(0, 5.2, 13);
    camera.lookAt(0, 1.5, -2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.shadowMap.enabled = false;

    const container = $("scene-container");
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    scene.add(
      new THREE.HemisphereLight(
        0xffffff,
        0x84959c,
        2.1
      )
    );

    const light = new THREE.DirectionalLight(
      0xffffff,
      1.8
    );

    light.position.set(-5, 10, 8);
    scene.add(light);

    state.scene = scene;
    state.camera = camera;
    state.renderer = renderer;
    state.threeReady = true;

    buildBank();
    animate();

    showToast("3D 금융창구 준비 완료");

  } catch (error) {
    console.error("3D 초기화 실패:", error);

    state.threeReady = false;

    $("scene-container").style.background =
      "linear-gradient(#d9e8eb, #b9d0d1)";

    showToast(
      "3D 화면을 불러오지 못했습니다. 상담 기능은 계속 이용할 수 있습니다."
    );
  }
}

/* =========================================
   3D 도형 함수
========================================= */

function makeMaterial(color) {
  return new state.THREE.MeshStandardMaterial({
    color,
    roughness: 0.85
  });
}

function makeCube(
  parent,
  x, y, z,
  sx, sy, sz,
  color
) {
  const THREE = state.THREE;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    makeMaterial(color)
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

function makeBall(
  parent,
  x, y, z,
  sx, sy, sz,
  color
) {
  const THREE = state.THREE;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    makeMaterial(color)
  );

  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  parent.add(mesh);

  return mesh;
}

function makeCapsule(
  parent,
  x, y, z,
  radius,
  length,
  color
) {
  const THREE = state.THREE;

  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 4, 8),
    makeMaterial(color)
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

/* =========================================
   은행 인테리어
========================================= */

function buildBank() {
  const scene = state.scene;

  makeCube(scene, 0, -0.2, -2, 19, 0.4, 21, 0xd7d5ce);
  makeCube(scene, 0, 3, -12, 19, 6, 0.3, 0xe8efec);

  makeCube(scene, -9.5, 3, -2, 0.3, 6, 20, 0xe8efec);
  makeCube(scene, 9.5, 3, -2, 0.3, 6, 20, 0xe8efec);

  makeCube(scene, 0, 6.2, -2, 19, 0.3, 21, 0xf5f7f4);

  // 창문
  makeCube(scene, -5.4, 3.1, -11.78, 5, 2.2, 0.08, 0x8fbecb);

  // 벽 장식
  makeCube(scene, 4.5, 3, -11.7, 5, 3.5, 0xd3e6dd);

  // 간판
  makeCube(scene, 0, 5, -11.55, 5.5, 0.8, 0.2, 0x087b68);

  // 창구
  makeCube(scene, 0, 1.05, 2, 9, 1.15, 1, 0x947052);
  makeCube(scene, 0, 1.65, 2, 9.2, 0.14, 1.1, 0x65452f);

  // 모니터
  makeCube(scene, -2, 2.25, 1.65, 1.25, 0.9, 0.12, 0x293a48);
  makeCube(scene, -2, 2.25, 1.57, 1.12, 0.72, 0x9ec8cf);
  makeCube(scene, -2, 1.75, 1.65, 0.16, 0.25, 0x465763);

  // 키보드
  makeCube(scene, -0.4, 1.76, 2, 1.2, 0.06, 0.38, 0x29343d);

  // 창구 번호판
  makeCube(scene, 3.1, 2.05, 1.65, 1.1, 0.6, 0.15, 0x087b68);

  // 대기석
  const positions = [
    [-5.5, -3], [-3.3, -3], [-1.1, -3],
    [1.1, -3], [3.3, -3], [5.5, -3],
    [-5.5, -6], [-3.3, -6], [-1.1, -6],
    [1.1, -6], [3.3, -6], [5.5, -6]
  ];

  positions.forEach(([x, z]) => makeChair(x, z));
}

function makeChair(x, z) {
  const group = new state.THREE.Group();

  makeCube(group, 0, 0.65, 0, 0.85, 0.15, 0.8, 0x567989);
  makeCube(group, 0, 1.1, -0.32, 0.85, 0.9, 0.12, 0x567989);

  for (const dx of [-0.32, 0.32]) {
    for (const dz of [-0.25, 0.25]) {
      const leg = new state.THREE.Mesh(
        new state.THREE.CylinderGeometry(
          0.045, 0.045, 0.6, 10
        ),
        makeMaterial(0x525b60)
      );

      leg.position.set(dx, 0.3, dz);
      group.add(leg);
    }
  }

  group.position.set(x, 0, z);
  state.scene.add(group);
}

/* =========================================
   캐릭터
========================================= */

const skinColors = [
  0xf2c8a5, 0xe0ae8c, 0xc98e6d,
  0xf4d1b0, 0xd5a17d, 0xe9b995
];

const hairColors = [
  0x211b19, 0x493326, 0x171717,
  0x826348, 0xaaa09a, 0x3b2922
];

const clothesColors = [
  0x315578, 0x785879, 0x548174,
  0x9a674d, 0x435b70, 0x8586a5
];

function createPerson(index, seated = true) {
  if (!state.threeReady) return null;

  const group = new state.THREE.Group();

  const skin = skinColors[index % skinColors.length];
  const hair = hairColors[index % hairColors.length];
  const clothes = clothesColors[index % clothesColors.length];

  makeCapsule(
    group, 0, 1, 0,
    0.36, 0.55, clothes
  );

  const headY = seated ? 1.83 : 1.95;

  makeBall(group, 0, 1.48, 0, 0.13, 0.13, 0.13, skin);
  makeBall(group, 0, headY, 0, 0.43, 0.53, 0.39, skin);

  // 귀
  makeBall(group, -0.42, headY, 0, 0.09, 0.15, 0.09, skin);
  makeBall(group, 0.42, headY, 0, 0.09, 0.15, 0.09, skin);

  // 머리카락
  makeBall(group, 0, headY + 0.28, -0.02, 0.45, 0.32, 0.41, hair);

  // 앞머리
  makeBall(group, 0, headY + 0.14, 0.3, 0.42, 0.16, 0.14, hair);

  // 눈
  for (const x of [-0.16, 0.16]) {
    makeBall(group, x, headY + 0.03, 0.35, 0.075, 0.085, 0.035, 0xffffff);
    makeBall(group, x, headY + 0.03, 0.382, 0.035, 0.05, 0.02, 0x222222);
  }

  // 코와 입
  makeBall(group, 0, headY - 0.09, 0.39, 0.075, 0.11, 0.08, skin);
  makeBall(group, 0, headY - 0.24, 0.36, 0.13, 0.035, 0.025, 0x984e50);

  // 팔
  for (const side of [-1, 1]) {
    const arm = makeCapsule(
      group,
      side * 0.43,
      1,
      0,
      0.12,
      0.48,
      clothes
    );

    arm.rotation.z = side * -0.2;

    makeBall(
      group,
      side * 0.44,
      0.68,
      0.04,
      0.13,
      0.13,
      0.13,
      skin
    );
  }

  // 다리
  if (seated) {
    for (const side of [-1, 1]) {
      const leg = makeCapsule(
        group,
        side * 0.2,
        0.48,
        0.25,
        0.15,
        0.42,
        0x303a48
      );

      leg.rotation.x = Math.PI / 2.8;

      makeCube(
        group,
        side * 0.2,
        0.22,
        0.55,
        0.25,
        0.13,
        0.45,
        0x252b31
      );
    }
  } else {
    for (const side of [-1, 1]) {
      makeCapsule(
        group,
        side * 0.2,
        0.37,
        0,
        0.15,
        0.55,
        0x303a48
      );

      makeCube(
        group,
        side * 0.2,
        0.08,
        0.08,
        0.28,
        0.13,
        0.45,
        0x252b31
      );
    }
  }

  return group;
}

/* =========================================
   고객 생성
========================================= */

function createCustomer() {
  state.customerNumber++;

  const id = state.customerNumber;

  const data =
    customerCases[
      Math.floor(Math.random() * customerCases.length)
    ];

  const name =
    customerNames[
      Math.floor(Math.random() * customerNames.length)
    ];

  const seatIndex = (id - 1) % 12;

  const seatPositions = [
    [-5.5, -3], [-3.3, -3], [-1.1, -3],
    [1.1, -3], [3.3, -3], [5.5, -3],
    [-5.5, -6], [-3.3, -6], [-1.1, -6],
    [1.1, -6], [3.3, -6], [5.5, -6]
  ];

  const [x, z] = seatPositions[seatIndex];

  const customer = {
    id,
    name,
    data,
    avatar: avatarList[Math.floor(Math.random() * avatarList.length)],
    x,
    z,
    targetX: x,
    targetZ: z,
    person: null,
    status: "waiting"
  };

  customer.person = createPerson(id, true);

  if (customer.person) {
    customer.person.position.set(x, 0, z);
    state.scene.add(customer.person);
  }

  return customer;
}

function addCustomer() {
  if (state.waiting.length >= 10) return;

  state.waiting.push(createCustomer());

  renderQueue();
}

/* =========================================
   고객 호출
========================================= */

function callCustomer() {
  if (!state.started) {
    showToast("먼저 영업을 시작해 주세요.");
    return;
  }

  if (state.active) {
    showToast("현재 고객 상담을 먼저 완료해 주세요.");
    return;
  }

  if (state.waiting.length === 0) {
    showToast("대기 고객이 없습니다.");
    return;
  }

  const customer = state.waiting.shift();

  state.active = customer;
  state.step = 0;
  state.answers = [];

  if (customer.person && state.scene) {
    state.scene.remove(customer.person);

    customer.person = createPerson(customer.id, false);

    if (customer.person) {
      customer.person.position.set(customer.x, 0, customer.z);
      state.scene.add(customer.person);
    }
  }

  customer.targetX = 0;
  customer.targetZ = 0.1;
  customer.status = "walking";

  $("customer-panel").classList.remove("hidden");

  $("customer-name").textContent = customer.name;
  $("customer-number").textContent = customer.id + "번";

  $("customer-info").innerHTML = "";

  [
    customer.data.age,
    customer.data.job,
    customer.data.purpose
  ].forEach(value => {
    const tag = document.createElement("span");
    tag.className = "info-tag";
    tag.textContent = value;
    $("customer-info").appendChild(tag);
  });

  $("customer-message").textContent =
    "고객이 창구 앞으로 이동하고 있습니다.";

  $("answer-list").innerHTML = "";
  $("feedback").textContent = "";

  $("finish-button").classList.add("hidden");

  renderQueue();

  if (!state.threeReady) {
    customer.status = "consulting";
    showQuestion();
  }

  showToast(customer.name + " 고객 호출");
}

/* =========================================
   고객 이동
========================================= */

function updateMovement(delta) {
  const customer = state.active;

  if (
    !customer ||
    customer.status !== "walking" ||
    !customer.person
  ) {
    return;
  }

  const person = customer.person;

  const dx = customer.targetX - person.position.x;
  const dz = customer.targetZ - person.position.z;

  const distance = Math.sqrt(dx * dx + dz * dz);

  if (distance < 0.12) {
    person.position.set(
      customer.targetX,
      0,
      customer.targetZ
    );

    customer.status = "consulting";

    showQuestion();
    return;
  }

  const amount = Math.min(delta * 1.7, distance);

  person.position.x += dx / distance * amount;
  person.position.z += dz / distance * amount;

  person.rotation.y = Math.atan2(dx, dz);

  person.position.y =
    Math.abs(Math.sin(performance.now() * 0.008)) * 0.04;
}

/* =========================================
   답변 평가
========================================= */

const synonyms = {
  자금: ["자금", "금액", "돈", "목돈"],
  사용: ["사용", "필요", "지출", "쓸"],
  시기: ["시기", "언제", "예정", "계획"],
  기간: ["기간", "개월", "년", "만기"],
  금리: ["금리", "이율", "이자"],
  조건: ["조건", "요건", "기준"],
  중도해지: ["중도해지", "중도 해지", "해지"],
  출자금: ["출자금", "출자", "조합원"],
  배당: ["배당", "배당금"],
  환급: ["환급", "반환"],
  보호: ["보호", "예금자보호", "보호한도"],
  한도: ["한도", "잔여"],
  본인: ["본인", "명의자", "신분증"],
  세금: ["세금", "과세", "비과세", "세제"],
  자격: ["자격", "대상"],
  소득: ["소득", "연봉", "급여"],
  재직: ["재직", "근무", "직장"],
  증빙: ["증빙", "서류", "확인서", "증명서"],
  채무: ["채무", "부채", "대출", "카드론"],
  금융기관: ["금융기관", "은행", "카드사"],
  보증: ["보증", "보증기관", "보증서"],
  심사: ["심사", "승인", "검토"],
  용도: ["용도", "생활비", "사업자금", "목적"],
  보증금: ["보증금", "전세금", "임차보증금"],
  주택: ["주택", "다가구", "다세대", "아파트"],
  계약: ["계약", "임대차", "계약서"],
  등기: ["등기", "등기부", "등기사항"],
  선순위: ["선순위", "근저당", "권리관계"],
  임대인: ["임대인", "집주인", "소유자"],
  기한: ["기한", "신청일", "잔금일", "실행일"],
  업종: ["업종", "영업", "사업"],
  시설: ["시설", "집기", "재고", "비품"],
  건물: ["건물", "구조", "면적"],
  담보: ["담보", "보장", "특약"],
  보험: ["보험", "보험증권", "가입내역"],
  면책: ["면책", "보상 제외", "보상제외"],
  약관: ["약관", "고지", "고지사항"],
  비교: ["비교", "차이", "계산", "예상"],
  자동이체: ["자동이체", "이체일", "출금계좌"],
  모바일: ["모바일", "온뱅크", "앱", "어플"],
  카드: ["체크카드", "카드발급", "카드 혜택"]
};

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[.,!?~'"“”‘’·:;()\-]/g, "");
}

function evaluateAnswer(answer, expected) {
  const normalizedAnswer = normalize(answer);
  const normalizedExpected = normalize(expected);

  let matched = 0;
  let total = 0;

  for (const [key, words] of Object.entries(synonyms)) {
    const belongs = words.some(word =>
      normalizedExpected.includes(normalize(word))
    );

    if (!belongs) continue;

    total++;

    if (
      words.some(word =>
        normalizedAnswer.includes(normalize(word))
      )
    ) {
      matched++;
    }
  }

  if (total === 0) {
    return Math.min(100, 40 + answer.length);
  }

  const coverage = matched / total;

  const detailBonus =
    answer.length >= 70 ? 15 :
    answer.length >= 35 ? 10 : 0;

  return Math.min(
    100,
    Math.round(coverage * 85 + detailBonus)
  );
}

/* =========================================
   상담 질문
========================================= */

function showQuestion() {
  const customer = state.active;

  if (!customer) return;

  const question = customer.data.questions[state.step];

  $("step-count").textContent =
    `${state.step + 1} / 7`;

  $("progress-bar").style.width =
    `${((state.step + 1) / 7) * 100}%`;

  $("customer-message").textContent =
    question.question;

  $("answer-list").innerHTML = "";
  $("feedback").textContent = "";

  const wrapper = document.createElement("div");
  wrapper.className = "written-answer-area";

  const label = document.createElement("label");
  label.textContent = "직원 답변을 직접 작성해 주세요.";

  const textarea = document.createElement("textarea");
  textarea.id = "written-answer";
  textarea.placeholder =
    "고객님께 실제로 설명하듯 답변을 작성해 주세요.";

  const hint = document.createElement("p");
  hint.className = "answer-hint";
  hint.textContent =
    "구체적인 안내 내용을 작성하면 더 높은 평가를 받을 수 있습니다.";

  const button = document.createElement("button");
  button.className = "primary-button";
  button.textContent = "답변 제출하기";

  button.addEventListener("click", submitAnswer);

  wrapper.append(label, textarea, hint, button);

  $("answer-list").appendChild(wrapper);

  textarea.addEventListener("keydown", event => {
    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      submitAnswer();
    }
  });

  textarea.focus();
}

/* =========================================
   답변 제출
========================================= */

function submitAnswer() {
  if (!state.active) return;

  const textarea = $("written-answer");

  if (!textarea) return;

  const answer = textarea.value.trim();

  if (answer.length < 8) {
    showToast("답변을 조금 더 자세히 작성해 주세요.");
    textarea.focus();
    return;
  }

  const question =
    state.active.data.questions[state.step];

  const score = evaluateAnswer(
    answer,
    question.expected
  );

  state.answers.push(score);

  if (score >= 80) {
    state.satisfaction = Math.min(
      100,
      state.satisfaction + 2
    );
  } else if (score < 50) {
    state.satisfaction = Math.max(
      0,
      state.satisfaction - 2
    );
  }

  updateHUD();

  $("answer-list").innerHTML = "";

  const review = document.createElement("div");
  review.className = "review-box";

  const title = document.createElement("h3");
  title.textContent = `답변 평가 ${score}점`;

  const message = document.createElement("p");
  message.textContent =
    score >= 80
      ? "좋은 답변입니다. 고객의 질문에 필요한 내용을 잘 안내했습니다."
      : score >= 55
        ? "기본적인 설명은 했습니다. 핵심 내용을 조금 더 보완해 보세요."
        : "설명이 부족합니다. 고객의 상황과 관련 기준을 구체적으로 안내해 보세요.";

  const expected = document.createElement("p");
  expected.textContent =
    "상담 참고사항: " + question.expected;

  review.append(title, message, expected);

  $("answer-list").appendChild(review);

  const nextButton = document.createElement("button");
  nextButton.className = "primary-button";
  nextButton.style.marginTop = "12px";

  if (state.step < 6) {
    nextButton.textContent = "다음 질문 진행";

    nextButton.addEventListener("click", () => {
      state.step++;
      showQuestion();
    });
  } else {
    nextButton.textContent = "최종 상담 평가";

    nextButton.addEventListener("click", showFinalReview);
  }

  $("answer-list").appendChild(nextButton);
}

/* =========================================
   최종 평가
========================================= */

function showFinalReview() {
  if (!state.active) return;

  const scores = state.answers;

  const average = Math.round(
    scores.reduce((sum, score) => sum + score, 0) /
    Math.max(scores.length, 1)
  );

  $("customer-message").textContent =
    "상담이 모두 끝났습니다. 최종 평가를 확인해 주세요.";

  $("answer-list").innerHTML = "";

  const review = document.createElement("div");
  review.className = "review-box";

  const title = document.createElement("h3");
  title.textContent = "상담 종합 평가";

  const averageText = document.createElement("p");
  averageText.textContent =
    `평균 답변 점수: ${average}점`;

  const satisfactionText = document.createElement("p");
  satisfactionText.textContent =
    `현재 만족도: ${state.satisfaction}%`;

  const resultText = document.createElement("p");
  resultText.textContent =
    average >= 80
      ? "우수한 상담입니다. 고객의 상황을 고려한 설명이 돋보입니다."
      : average >= 60
        ? "기본적인 상담을 마쳤습니다. 상품과 관련 기준을 더 공부해 보세요."
        : "상담 내용을 보완할 필요가 있습니다. 질문의 핵심을 먼저 파악해 보세요.";

  review.append(
    title,
    averageText,
    satisfactionText,
    resultText
  );

  $("answer-list").appendChild(review);

  $("feedback").textContent =
    "실제 금융 업무에서는 반드시 최신 상품 약관과 내부 심사 기준을 확인해야 합니다.";

  $("finish-button").classList.remove("hidden");
}

/* =========================================
   상담 완료
========================================= */

function finishConsultation() {
  if (!state.active) return;

  const customer = state.active;

  const average = state.answers.reduce(
    (sum, score) => sum + score,
    0
  ) / Math.max(state.answers.length, 1);

  state.sales += Math.round(average * 1000);

  if (customer.person && state.scene) {
    state.leaving.push({
      person: customer.person,
      targetX: Math.random() * 8 - 4,
      targetZ: -8
    });
  }

  state.active = null;
  state.answers = [];

  $("customer-panel").classList.add("hidden");
  $("finish-button").classList.add("hidden");

  updateHUD();
  renderQueue();

  showToast(customer.name + " 고객 상담 완료");
}

/* =========================================
   고객 퇴장
========================================= */

function updateLeaving(delta) {
  for (let i = state.leaving.length - 1; i >= 0; i--) {
    const customer = state.leaving[i];

    const person = customer.person;

    const dx = customer.targetX - person.position.x;
    const dz = customer.targetZ - person.position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.15) {
      state.scene.remove(person);
      state.leaving.splice(i, 1);
      continue;
    }

    const amount = Math.min(delta * 2, distance);

    person.position.x += dx / distance * amount;
    person.position.z += dz / distance * amount;
    person.rotation.y = Math.atan2(dx, dz);
  }
}

/* =========================================
   시간 및 신규 고객
========================================= */

function updateGame(delta) {
  if (!state.started) return;

  state.minutes += delta * 3;

  if (state.minutes >= 1020) {
    state.minutes = 540;
    state.day++;
  }

  state.spawnElapsed += delta;

  if (
    state.spawnElapsed >= 15 &&
    state.waiting.length < 8
  ) {
    state.spawnElapsed = 0;

    addCustomer();
    showToast("새로운 고객이 방문했습니다.");
  }

  updateHUD();
}

/* =========================================
   영업 시작
========================================= */

function startGame() {
  if (state.started) return;

  state.started = true;

  $("start-screen").classList.add("hidden");

  for (let i = 0; i < 6; i++) {
    addCustomer();
  }

  updateHUD();
  renderQueue();

  showToast("영업을 시작합니다. 다음 고객을 호출하세요.");
}

/* =========================================
   3D 애니메이션
========================================= */

function animate(timestamp = 0) {
  if (!state.threeReady) return;

  requestAnimationFrame(animate);

  const delta = Math.min(
    (timestamp - state.lastFrame) / 1000 || 0,
    0.05
  );

  state.lastFrame = timestamp;

  updateMovement(delta);
  updateLeaving(delta);
  updateGame(delta);

  state.renderer.render(
    state.scene,
    state.camera
  );
}

/* =========================================
   화면 크기 변경
========================================= */

function resizeGame() {
  if (!state.threeReady) return;

  state.camera.aspect =
    window.innerWidth / window.innerHeight;

  state.camera.updateProjectionMatrix();

  state.renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  state.renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.5)
  );
}

/* =========================================
   버튼 이벤트
========================================= */

function connectButtons() {
  $("start-button").addEventListener("click", startGame);
  $("call-button").addEventListener("click", callCustomer);
  $("finish-button").addEventListener("click", finishConsultation);

  window.addEventListener("resize", resizeGame);
}

/* =========================================
   프로그램 실행
========================================= */

function main() {
  checkElements();

  // 가장 먼저 버튼 이벤트 연결
  connectButtons();

  // 화면 정보 초기화
  updateHUD();
  renderQueue();

  // 3D 초기화는 버튼 연결 이후 진행
  initializeThree();
}

try {
  main();
} catch (error) {
  console.error("게임 실행 오류:", error);
  alert("게임 초기화 오류: " + error.message);
}

// ===================================
// 기본 설정 및 HTML 요소
// ===================================

const $ = id => document.getElementById(id);

const requiredIds = [
  "scene-container", "start-screen", "start-button",
  "call-button", "finish-button", "queue-list",
  "waiting-count", "customer-panel", "customer-name",
  "customer-number", "customer-info", "step-count",
  "progress-bar", "customer-message", "answer-list",
  "feedback", "day", "clock", "sales", "satisfaction",
  "toast"
];

for (const id of requiredIds) {
  if (!$(id)) {
    throw new Error(`HTML 요소를 찾을 수 없습니다: ${id}`);
  }
}

const container = $("scene-container");

// ===================================
// 3D 장면
// ===================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9e8eb);
scene.fog = new THREE.Fog(0xd9e8eb, 20, 38);

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 5.2, 13);
camera.lookAt(0, 1.5, -2);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 그림자 렌더링으로 생기는 흰색 깨짐 현상 방지
renderer.shadowMap.enabled = false;

container.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x84959c, 2.1));

const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
mainLight.position.set(-5, 10, 8);
scene.add(mainLight);

// ===================================
// 3D 제작 함수
// ===================================

function material(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness
  });
}

function cube(parent, x, y, z, sx, sy, sz, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    material(color)
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

function ball(parent, x, y, z, sx, sy, sz, color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 16),
    material(color)
  );

  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  parent.add(mesh);

  return mesh;
}

function cylinder(parent, x, y, z, radius, height, color) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 12),
    material(color)
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

function capsule(parent, x, y, z, radius, length, color) {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, length, 4, 8),
    material(color)
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

// ===================================
// 은행 내부
// ===================================

// 바닥
cube(scene, 0, -0.2, -2, 19, 0.4, 21, 0xd7d5ce);

// 뒷벽
cube(scene, 0, 3, -12, 19, 6, 0.3, 0xe8efec);

// 양쪽 벽
cube(scene, -9.5, 3, -2, 0.3, 6, 20, 0xe8efec);
cube(scene, 9.5, 3, -2, 0.3, 6, 20, 0xe8efec);

// 천장
cube(scene, 0, 6.2, -2, 19, 0.3, 21, 0xf5f7f4);

// 창문: 겹치는 흰색 프레임 제거
cube(scene, -5.4, 3.1, -11.78, 5, 2.2, 0.08, 0x8fbecb);

// 벽 장식
cube(scene, 4.5, 3, -11.7, 5, 3.5, 0xd3e6dd);

// 신협 간판
cube(scene, 0, 5, -11.55, 5.5, 0.8, 0.2, 0x087b68);

// 창구 책상
cube(scene, 0, 1.05, 2, 9, 1.15, 1, 0x947052);
cube(scene, 0, 1.65, 2, 9.2, 0.14, 1.1, 0x65452f);

// 모니터
cube(scene, -2, 2.25, 1.65, 1.25, 0.9, 0.12, 0x293a48);
cube(scene, -2, 2.25, 1.57, 1.12, 0.72, 0x9ec8cf);
cube(scene, -2, 1.75, 1.65, 0.16, 0.25, 0x465763);

// 키보드
cube(scene, -0.4, 1.76, 2, 1.2, 0.06, 0.38, 0x29343d);

// 창구 번호판
cube(scene, 3.1, 2.05, 1.65, 1.1, 0.6, 0.15, 0x087b68);

// ===================================
// 대기석
// ===================================

const seatPositions = [
  [-5.5, -3], [-3.3, -3], [-1.1, -3],
  [1.1, -3], [3.3, -3], [5.5, -3],
  [-5.5, -6], [-3.3, -6], [-1.1, -6],
  [1.1, -6], [3.3, -6], [5.5, -6]
];

function makeChair(x, z) {
  const group = new THREE.Group();

  cube(group, 0, 0.65, 0, 0.85, 0.15, 0.8, 0x567989);
  cube(group, 0, 1.1, -0.32, 0.85, 0.9, 0.12, 0x567989);

  for (const dx of [-0.32, 0.32]) {
    for (const dz of [-0.25, 0.25]) {
      cylinder(group, dx, 0.3, dz, 0.045, 0.6, 0x525b60);
    }
  }

  group.position.set(x, 0, z);
  scene.add(group);
}

seatPositions.forEach(position => {
  makeChair(position[0], position[1]);
});

// ===================================
// 캐릭터 색상
// ===================================

const skinColors = [
  0xf2c8a5, 0xe0ae8c, 0xc98e6d,
  0xf4d1b0, 0xd5a17d, 0xe9b995
];

const hairColors = [
  0x211b19, 0x493326, 0x171717,
  0x826348, 0xaaa09a, 0x3b2922
];

const clothesColors = [
  0x315578, 0x785879, 0x548174,
  0x9a674d, 0x435b70, 0x8586a5,
  0x9a8051
];

// ===================================
// 사람 캐릭터 제작
// ===================================

function createPerson(index, seated = true) {
  const person = new THREE.Group();

  const skin = skinColors[index % skinColors.length];
  const hair = hairColors[index % hairColors.length];
  const clothes = clothesColors[index % clothesColors.length];

  // 몸통
  capsule(
    person,
    0,
    seated ? 1 : 1.05,
    0,
    0.36,
    0.55,
    clothes
  );

  // 목과 얼굴
  cylinder(person, 0, 1.48, 0, 0.13, 0.25, skin);

  const headY = seated ? 1.83 : 1.95;

  ball(person, 0, headY, 0, 0.43, 0.53, 0.39, skin);

  // 귀
  ball(person, -0.42, headY, 0, 0.09, 0.15, 0.09, skin);
  ball(person, 0.42, headY, 0, 0.09, 0.15, 0.09, skin);

  // 머리카락
  const style = index % 4;

  ball(person, 0, headY + 0.28, -0.02, 0.45, 0.32, 0.41, hair);

  if (style === 0) {
    ball(person, 0, headY + 0.14, 0.3, 0.42, 0.16, 0.14, hair);
  }

  if (style === 1) {
    ball(person, 0.34, headY - 0.08, 0, 0.14, 0.38, 0.18, hair);
    ball(person, -0.34, headY - 0.08, 0, 0.14, 0.38, 0.18, hair);
  }

  if (style === 2) {
    ball(person, 0, headY + 0.4, -0.1, 0.3, 0.16, 0.3, hair);
  }

  if (style === 3) {
    ball(person, -0.2, headY + 0.18, -0.12, 0.25, 0.35, 0.28, hair);
    ball(person, 0.2, headY + 0.18, -0.12, 0.25, 0.35, 0.28, hair);
  }

  // 눈
  for (const x of [-0.16, 0.16]) {
    ball(person, x, headY + 0.03, 0.35, 0.075, 0.085, 0.035, 0xffffff);
    ball(person, x, headY + 0.03, 0.382, 0.035, 0.05, 0.02, 0x222222);
  }

  // 코와 입
  ball(person, 0, headY - 0.09, 0.39, 0.075, 0.11, 0.08, skin);
  ball(person, 0, headY - 0.24, 0.36, 0.13, 0.035, 0.025, 0x984e50);

  // 팔
  for (const side of [-1, 1]) {
    const arm = capsule(
      person,
      side * 0.43,
      1,
      0,
      0.12,
      0.48,
      clothes
    );

    arm.rotation.z = side * -0.2;

    ball(
      person,
      side * 0.44,
      0.68,
      0.04,
      0.13,
      0.13,
      0.13,
      skin
    );
  }

  // 다리
  if (seated) {
    for (const side of [-1, 1]) {
      const leg = capsule(
        person,
        side * 0.2,
        0.48,
        0.25,
        0.15,
        0.42,
        0x303a48
      );

      leg.rotation.x = Math.PI / 2.8;

      cube(
        person,
        side * 0.2,
        0.22,
        0.55,
        0.25,
        0.13,
        0.45,
        0x252b31
      );
    }
  } else {
    for (const side of [-1, 1]) {
      capsule(
        person,
        side * 0.2,
        0.37,
        0,
        0.15,
        0.55,
        0x303a48
      );

      cube(
        person,
        side * 0.2,
        0.08,
        0.08,
        0.28,
        0.13,
        0.45,
        0x252b31
      );
    }
  }

  return person;
}

// ===================================
// 고객 상담 데이터
// ===================================

const cases = [
  {
    purpose: "정기예금",
    job: "직장인",
    age: "50대",
    questions: [
      ["예금 만기 자금을 다시 맡기고 싶습니다.", "자금 사용 시기와 예치 기간을 확인한다."],
      ["1년 정도 생각하고 있습니다.", "기간별 금리와 중도해지 조건을 안내한다."],
      ["금리가 가장 높은 상품은 무엇인가요?", "가입 조건과 실제 적용 금리를 확인한다."],
      ["출자금도 가입해야 하나요?", "출자금의 성격과 배당, 환급 제한을 설명한다."],
      ["예금자보호는 어떻게 되나요?", "현재 보호제도와 적용 대상 및 한도를 확인한다."],
      ["배우자 명의로도 가입할 수 있나요?", "명의자 본인 확인과 거래 절차를 안내한다."],
      ["세금 혜택도 알고 싶습니다.", "대상 자격과 잔여 한도, 해당 연도 기준을 확인한다."]
    ]
  },
  {
    purpose: "햇살론",
    job: "중소기업 근로자",
    age: "40대",
    questions: [
      ["생활비 때문에 햇살론을 알아보고 있습니다.", "자금 용도와 현재 채무를 확인한다."],
      ["현재 회사에서 근무하고 있습니다.", "재직기간과 소득 증빙을 확인한다."],
      ["연봉은 3천만 원입니다.", "소득 증빙자료를 확인한다."],
      ["카드론이 조금 있습니다.", "금융기관별 채무와 금리를 확인한다."],
      ["보증은 어디에서 해주나요?", "상품별 보증기관과 심사 조건을 설명한다."],
      ["한도는 얼마나 나오나요?", "보증 및 내부 심사 결과에 따라 달라진다고 설명한다."],
      ["필요한 서류를 알려주세요.", "재직·소득 관련 서류를 안내한다."]
    ]
  },
  {
    purpose: "정기적금",
    job: "회사원",
    age: "30대",
    questions: [
      ["매달 100만 원씩 저축하고 싶습니다.", "월 불입 가능 금액과 목적을 확인한다."],
      ["1년 동안 납입할 생각입니다.", "기간별 금리와 만기를 안내한다."],
      ["우대금리를 받을 수 있나요?", "우대조건과 적용 기준을 설명한다."],
      ["체크카드도 만들고 싶어요.", "발급 조건과 혜택을 설명한다."],
      ["모바일로 관리하고 싶습니다.", "모바일뱅킹 가입 절차를 안내한다."],
      ["자동이체도 설정해 주세요.", "출금 계좌와 이체일을 확인한다."],
      ["최종 금리를 확인해 주세요.", "당일 금리와 적용 조건을 확인한다."]
    ]
  },
  {
    purpose: "전세자금대출",
    job: "직장인",
    age: "30대",
    questions: [
      ["전세자금대출을 알아보고 있습니다.", "보증금과 계약 일정, 주택 유형을 확인한다."],
      ["보증금은 2억 원입니다.", "필요 자금과 본인 자금을 확인한다."],
      ["다가구주택입니다.", "등기와 선순위 권리, 임대차 현황을 확인한다."],
      ["집주인 확인도 필요한가요?", "임대인 정보와 소유권을 확인한다."],
      ["연봉은 3천만 원입니다.", "소득과 기존 부채를 확인한다."],
      ["보증기관 심사가 있나요?", "상품별 보증 심사 조건을 안내한다."],
      ["언제까지 신청해야 하나요?", "상품별 신청 기한과 잔금일을 확인한다."]
    ]
  },
  {
    purpose: "화재공제",
    job: "자영업자",
    age: "50대",
    questions: [
      ["가게 화재공제를 알아보고 있습니다.", "업종과 건물, 시설 현황을 확인한다."],
      ["건물은 제 소유입니다.", "건물 구조와 사용 용도를 확인한다."],
      ["집기와 재고도 보장되나요?", "목적물별 보장 가능 여부를 확인한다."],
      ["기존 보험도 있습니다.", "기존 증권과 담보를 비교한다."],
      ["화재가 나면 보상받나요?", "가입 담보와 면책 사항을 설명한다."],
      ["보험료를 줄일 수 있나요?", "필요 보장과 가입 금액을 점검한다."],
      ["가입 전에 확인할 사항은요?", "약관과 고지사항, 보장 범위를 확인한다."]
    ]
  },
  {
    purpose: "비과세 예금",
    job: "은퇴자",
    age: "60대",
    questions: [
      ["목돈을 예금으로 맡기고 싶습니다.", "금액과 기간, 자금 계획을 확인한다."],
      ["세금 혜택이 궁금합니다.", "비과세종합저축과 신협 예탁금 세제 혜택을 구분해 설명한다."],
      ["저도 대상이 될까요?", "대상 자격과 법령상 요건을 확인한다."],
      ["다른 은행에서도 가입했습니다.", "기존 가입 내역과 잔여 한도를 확인한다."],
      ["조합원 가입도 필요한가요?", "조합원 여부와 세제 적용 요건을 구분한다."],
      ["일반과세와 차이가 큰가요?", "금액과 기간에 따른 예상 세금을 비교한다."],
      ["오늘 가입할 수 있나요?", "해당 연도 기준과 자격, 잔여 한도를 확인한다."]
    ]
  }
];

const names = [
  "김영숙", "박정호", "이선희", "최민수",
  "정미경", "강현우", "윤정자", "한지훈",
  "서영희", "임성호", "조은정", "오상철",
  "배정희", "문성진", "신미자", "장현수"
];

const avatars = ["👨", "👩", "👨‍🦳", "👩‍🦳"];

// ===================================
// 게임 상태
// ===================================

let customerNumber = 0;
let waiting = [];
let active = null;
let leaving = [];
let step = 0;
let started = false;

let gameTime = 540;
let day = 1;
let sales = 0;
let satisfaction = 100;
let spawnTimer = 0;

let caseDeck = [];
let caseIndex = 0;
let answerScores = [];

function nextCase() {
  if (caseIndex >= caseDeck.length) {
    caseDeck = [...cases].sort(() => Math.random() - 0.5);
    caseIndex = 0;
  }

  return caseDeck[caseIndex++];
}

// ===================================
// 고객 생성
// ===================================

function createCustomer() {
  customerNumber++;

  const index = customerNumber;
  const data = nextCase();
  const seat = seatPositions[(index - 1) % seatPositions.length];

  const person = createPerson(index, true);
  person.position.set(seat[0], 0, seat[1]);
  scene.add(person);

  return {
    id: index,
    number: index,
    name: names[(index - 1) % names.length],
    data,
    avatar: avatars[index % avatars.length],
    person,
    x: seat[0],
    z: seat[1],
    targetX: seat[0],
    targetZ: seat[1],
    status: "waiting",
    speed: 1.7
  };
}

function addCustomer() {
  if (waiting.length >= 9) return;

  waiting.push(createCustomer());
  renderQueue();
}

// ===================================
// 대기열 표시
// ===================================

function renderQueue() {
  $("waiting-count").textContent = `${waiting.length}명`;
  $("queue-list").innerHTML = "";

  waiting.forEach((customer, index) => {
    const item = document.createElement("div");
    item.className = "queue-item";

    const avatar = document.createElement("div");
    avatar.className = "queue-avatar";
    avatar.textContent = customer.avatar;

    const detail = document.createElement("div");
    detail.className = "queue-detail";

    const name = document.createElement("strong");
    name.textContent = customer.name;

    const purpose = document.createElement("small");
    purpose.textContent = customer.data.purpose;

    detail.append(name, purpose);

    const number = document.createElement("span");
    number.className = "queue-number";
    number.textContent = `${index + 1}번`;

    item.append(avatar, detail, number);
    $("queue-list").appendChild(item);
  });

  $("call-button").disabled =
    !started || !!active || waiting.length === 0;
}

// ===================================
// 고객 호출
// ===================================

function callCustomer() {
  if (!started) {
    showToast("먼저 영업을 시작해 주세요.");
    return;
  }

  if (active) {
    showToast("현재 고객 상담을 먼저 완료해 주세요.");
    return;
  }

  if (waiting.length === 0) {
    showToast("대기 고객이 없습니다.");
    return;
  }

  active = waiting.shift();

  scene.remove(active.person);

  active.person = createPerson(active.id, false);
  active.person.position.set(active.x, 0, active.z);
  scene.add(active.person);

  active.targetX = 0;
  active.targetZ = 0.1;
  active.status = "walking";

  answerScores = [];

  $("customer-panel").classList.remove("hidden");
  $("customer-name").textContent = active.name;
  $("customer-number").textContent = `${active.number}번`;

  $("customer-info").innerHTML = `
    <span class="info-tag">${active.data.age}</span>
    <span class="info-tag">${active.data.job}</span>
    <span class="info-tag">${active.data.purpose}</span>
  `;

  $("customer-message").textContent =
    "고객이 창구 앞으로 걸어오고 있습니다.";

  $("answer-list").innerHTML = "";
  $("feedback").textContent = "";
  $("finish-button").classList.add("hidden");

  renderQueue();
  showToast(`${active.number}번 ${active.name} 고객 호출`);
}

// ===================================
// 고객 이동
// ===================================

function updateMovement(delta) {
  if (!active || active.status !== "walking") return;

  const person = active.person;

  const dx = active.targetX - person.position.x;
  const dz = active.targetZ - person.position.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  if (distance < 0.1) {
    person.position.set(active.targetX, 0, active.targetZ);
    active.status = "consulting";
    step = 0;

    showQuestion();
    showToast(`${active.name} 고객이 도착했습니다.`);
    return;
  }

  const amount = Math.min(active.speed * delta, distance);

  person.position.x += (dx / distance) * amount;
  person.position.z += (dz / distance) * amount;
  person.rotation.y = Math.atan2(dx, dz);

  person.position.y =
    Math.abs(Math.sin(performance.now() * 0.008)) * 0.04;
}

// ===================================
// 주관식 답변 평가
// ===================================

const conceptMap = {
  "자금": ["자금", "돈", "목돈", "금액"],
  "사용": ["사용", "필요", "쓸", "지출", "운용"],
  "시기": ["시기", "언제", "예정", "계획"],
  "예치": ["예치", "맡기", "예금", "재예치"],
  "기간": ["기간", "개월", "년", "만기"],
  "금리": ["금리", "이율", "이자"],
  "중도해지": ["중도해지", "중도 해지", "해지"],
  "조건": ["조건", "요건", "기준"],
  "출자금": ["출자금", "출자", "조합원"],
  "배당": ["배당", "배당금"],
  "환급": ["환급", "반환"],
  "보호": ["보호", "예금자보호", "보호한도"],
  "한도": ["한도", "잔여"],
  "명의": ["명의", "본인", "명의자"],
  "신분": ["신분증", "본인확인", "본인 확인"],
  "세금": ["세금", "과세", "비과세", "세제"],
  "자격": ["자격", "대상", "요건"],
  "소득": ["소득", "연봉", "급여"],
  "재직": ["재직", "근무", "직장"],
  "증빙": ["증빙", "서류", "확인서", "증명서"],
  "채무": ["채무", "부채", "대출", "카드론"],
  "금융기관": ["금융기관", "은행", "저축은행", "카드사"],
  "보증": ["보증", "보증기관", "보증서"],
  "심사": ["심사", "승인", "검토"],
  "용도": ["용도", "생활비", "사업자금", "목적"],
  "보증금": ["보증금", "전세금", "임차보증금"],
  "주택": ["주택", "다가구", "다세대", "아파트"],
  "계약": ["계약", "임대차", "계약서"],
  "등기": ["등기", "등기부", "등기사항"],
  "선순위": ["선순위", "근저당", "권리관계"],
  "임대인": ["임대인", "집주인", "소유자"],
  "기한": ["기한", "신청일", "잔금일", "실행일"],
  "업종": ["업종", "영업", "사업"],
  "시설": ["시설", "집기", "재고", "비품"],
  "건물": ["건물", "구조", "용도", "면적"],
  "담보": ["담보", "보장", "특약", "가입금액"],
  "기존보험": ["기존보험", "보험증권", "가입내역"],
  "면책": ["면책", "보상 제외", "보상제외"],
  "약관": ["약관", "고지", "고지사항", "보장범위"],
  "비교": ["비교", "차이", "계산", "예상"],
  "자동이체": ["자동이체", "이체일", "출금계좌"],
  "모바일": ["모바일", "온뱅크", "앱", "어플"],
  "체크카드": ["체크카드", "카드발급", "카드 혜택"]
};

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.,!?~'"“”‘’·:;()\-]/g, "");
}

function getExpectedConcepts(expected) {
  const normalized = normalizeText(expected);
  const found = [];

  for (const [concept, synonyms] of Object.entries(conceptMap)) {
    if (
      normalized.includes(normalizeText(concept)) ||
      synonyms.some(word =>
        normalized.includes(normalizeText(word))
      )
    ) {
      found.push({ concept, synonyms });
    }
  }

  return found;
}

function evaluateAnswer(answer, expected) {
  const text = normalizeText(answer);
  const concepts = getExpectedConcepts(expected);

  if (text.length < 8) {
    return {
      score: 10,
      message: "답변이 너무 짧습니다. 조금 더 구체적으로 설명해 주세요.",
      matched: 0,
      total: Math.max(1, concepts.length)
    };
  }

  if (concepts.length === 0) {
    const score = text.length >= 45 ? 85 : text.length >= 20 ? 65 : 40;

    return {
      score,
      message: "답변을 작성했습니다. 고객의 상황에 맞는 설명인지 확인해 보세요.",
      matched: 0,
      total: 1
    };
  }

  const matched = concepts.filter(item =>
    item.synonyms.some(word =>
      text.includes(normalizeText(word))
    )
  ).length;

  const coverage = matched / concepts.length;
  const detailBonus =
    text.length >= 70 ? 15 :
    text.length >= 35 ? 10 : 0;

  const score = Math.min(
    100,
    Math.round(coverage * 85 + detailBonus)
  );

  let message;

  if (coverage >= 0.8 && score >= 80) {
    message = "좋은 답변입니다. 핵심 내용을 잘 설명했습니다.";
  } else if (coverage >= 0.5) {
    message = "일부 핵심 내용은 포함했지만 추가 설명이 필요합니다.";
  } else {
    message = "핵심 내용이 부족합니다. 고객 상황과 관련 기준을 더 구체적으로 설명해 주세요.";
  }

  return {
    score,
    message,
    matched,
    total: concepts.length
  };
}

// ===================================
// 주관식 상담 화면
// ===================================

function showQuestion() {
  if (!active || active.status !== "consulting") return;

  const questions = active.data.questions;
  const question = questions[step];

  $("customer-name").textContent = active.name;
  $("step-count").textContent =
    `${step + 1} / ${questions.length}`;

  $("progress-bar").style.width =
    `${((step + 1) / questions.length) * 100}%`;

  $("customer-message").textContent = question[0];
  $("answer-list").innerHTML = "";
  $("feedback").textContent = "";
  $("finish-button").classList.add("hidden");

  const wrapper = document.createElement("div");
  wrapper.className = "written-answer-area";

  const label = document.createElement("label");
  label.textContent = "직원 답변을 직접 작성해 주세요.";

  const textarea = document.createElement("textarea");
  textarea.id = "written-answer";
  textarea.placeholder =
    "고객님께 실제로 설명하듯 작성해 주세요.\n예: 고객님의 자금 사용 시기와 예치 기간을 확인한 후 상품별 금리와 중도해지 조건을 안내해 드리겠습니다.";
  textarea.rows = 5;

  const hint = document.createElement("p");
  hint.className = "answer-hint";
  hint.textContent =
    "답변을 작성한 후 제출 버튼을 눌러 주세요. Ctrl + Enter로도 제출할 수 있습니다.";

  const submit = document.createElement("button");
  submit.className = "primary-button";
  submit.textContent = "답변 제출하기";
  submit.addEventListener("click", submitWrittenAnswer);

  wrapper.append(label, textarea, hint, submit);
  $("answer-list").appendChild(wrapper);

  textarea.addEventListener("keydown", event => {
    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
      submitWrittenAnswer();
    }
  });

  textarea.focus();
}

// ===================================
// 답변 제출
// ===================================

function submitWrittenAnswer() {
  if (!active || active.status !== "consulting") return;

  const textarea = $("written-answer");
  if (!textarea) return;

  const answer = textarea.value.trim();

  if (answer.length < 8) {
    showToast("답변을 조금 더 자세히 작성해 주세요.");
    textarea.focus();
    return;
  }

  const question = active.data.questions[step];
  const expected = question[1];

  const result = evaluateAnswer(answer, expected);
  answerScores.push(result.score);

  if (result.score >= 80) {
    satisfaction = Math.min(100, satisfaction + 2);
  } else if (result.score < 55) {
    satisfaction = Math.max(0, satisfaction - 3);
  }

  updateHUD();

  $("answer-list").innerHTML = "";

  const feedbackBox = document.createElement("div");
  feedbackBox.className = "review-box";

  const title = document.createElement("strong");
  title.textContent = `답변 평가: ${result.score}점`;

  const message = document.createElement("p");
  message.textContent = result.message;

  const detail = document.createElement("small");
  detail.textContent =
    `핵심 개념 반영: ${result.matched} / ${result.total}`;

  feedbackBox.append(title, message, detail);
  $("answer-list").appendChild(feedbackBox);

  $("feedback").textContent =
    result.score >= 80
      ? "고객이 설명을 이해하고 있습니다."
      : result.score >= 55
        ? "조금 더 자세한 안내가 있으면 좋겠습니다."
        : "고객이 추가 설명을 필요로 할 수 있습니다.";

  const next = document.createElement("button");
  next.className = "primary-button";
  next.style.marginTop = "12px";

  if (step === active.data.questions.length - 1) {
    next.textContent = "최종 상담 평가 확인";

    next.addEventListener("click", showFinalReview);
  } else {
    next.textContent = "다음 고객 질문 듣기";

    next.addEventListener("click", () => {
      step++;
      showQuestion();
    });
  }

  $("answer-list").appendChild(next);
}

// ===================================
// 최종 상담 평가
// ===================================

function showFinalReview() {
  if (!active) return;

  const average = answerScores.length
    ? Math.round(
        answerScores.reduce((a, b) => a + b, 0) /
        answerScores.length
      )
    : 0;

  $("customer-message").textContent =
    "모든 상담 질문이 끝났습니다. 오늘 상담 결과를 확인해 주세요.";

  $("answer-list").innerHTML = "";

  const review = document.createElement("div");
  review.className = "review-box";

  const title = document.createElement("h3");
  title.textContent = "상담 종합 평가";

  const averageText = document.createElement("p");
  averageText.textContent = `평균 답변 점수: ${average}점`;

  const satisfactionText = document.createElement("p");
  satisfactionText.textContent =
    `현재 고객 만족도: ${satisfaction}%`;

  const summary = document.createElement("p");
  summary.textContent =
    average >= 80
      ? "전반적으로 핵심 내용을 잘 안내했습니다. 고객 상황을 고려한 상담이었습니다."
      : average >= 60
        ? "기본적인 상담은 진행했지만 구체적인 설명을 더 보완하면 좋겠습니다."
        : "금융상품의 조건과 고객 상황을 더 꼼꼼히 확인하는 연습이 필요합니다.";

  review.append(
    title,
    averageText,
    satisfactionText,
    summary
  );

  $("answer-list").appendChild(review);

  $("feedback").textContent =
    "실제 금융 업무에서는 최신 상품 약관과 내부 심사 기준을 확인해야 합니다.";

  $("finish-button").classList.remove("hidden");
}

// ===================================
// 상담 완료
// ===================================

function finishConsultation() {
  if (!active) return;

  const person = active.person;

  leaving.push({
    person,
    targetX: Math.random() * 8 - 4,
    targetZ: -8
  });

  const average = answerScores.length
    ? answerScores.reduce((a, b) => a + b, 0) /
      answerScores.length
    : 0;

  sales += Math.round(average * 1000);

  const customerName = active.name;

  $("customer-panel").classList.add("hidden");
  $("finish-button").classList.add("hidden");

  active = null;
  answerScores = [];

  updateHUD();
  renderQueue();

  showToast(`${customerName} 고객 상담 완료`);
}

// ===================================
// 고객 퇴장
// ===================================

function updateLeaving(delta) {
  for (let i = leaving.length - 1; i >= 0; i--) {
    const customer = leaving[i];

    const dx = customer.targetX - customer.person.position.x;
    const dz = customer.targetZ - customer.person.position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.15) {
      scene.remove(customer.person);
      leaving.splice(i, 1);
      continue;
    }

    const amount = Math.min(delta * 2, distance);

    customer.person.position.x += dx / distance * amount;
    customer.person.position.z += dz / distance * amount;
    customer.person.rotation.y = Math.atan2(dx, dz);
  }
}

// ===================================
// 게임 시간
// ===================================

function updateTime(delta) {
  if (!started) return;

  // 실제 1초가 게임 속 3분
  gameTime += delta * 3;

  if (gameTime >= 1020) {
    gameTime = 540;
    day++;

    showToast(`${day}일차 영업이 시작되었습니다.`);
  }

  updateHUD();
}

function updateHUD() {
  const hour = Math.floor(gameTime / 60);
  const minute = Math.floor(gameTime % 60);

  $("clock").textContent =
    `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  $("day").textContent = `${day}일차`;
  $("sales").textContent =
    `${sales.toLocaleString("ko-KR")}원`;

  $("satisfaction").textContent = `${satisfaction}%`;
}

// ===================================
// 신규 고객 방문
// ===================================

function updateSpawn(delta) {
  if (!started) return;

  spawnTimer += delta;

  if (spawnTimer >= 15) {
    spawnTimer = 0;

    if (waiting.length < 8) {
      addCustomer();
      showToast("새로운 고객이 방문했습니다.");
    }
  }
}

// ===================================
// 알림 메시지
// ===================================

let toastTimer = null;

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// ===================================
// 영업 시작
// ===================================

function startGame() {
  if (started) return;

  started = true;

  $("start-screen").classList.add("hidden");

  // 시작 즉시 대기 고객 6명 생성
  for (let i = 0; i < 6; i++) {
    addCustomer();
  }

  updateHUD();
  renderQueue();

  showToast("영업 시작! 다음 고객을 호출하세요.");
}

// ===================================
// 버튼 이벤트 연결
// ===================================

$("start-button").addEventListener("click", startGame);
$("call-button").addEventListener("click", callCustomer);
$("finish-button").addEventListener("click", finishConsultation);

// ===================================
// 애니메이션
// ===================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  updateMovement(delta);
  updateLeaving(delta);
  updateTime(delta);
  updateSpawn(delta);

  renderer.render(scene, camera);
}

animate();

// ===================================
// 화면 크기 변경 대응
// ===================================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
});
// 카메라 시점 설정
camera.position.set(0, 2.2, 8.5);
camera.lookAt(0, 1.5, 0);
camera.fov = 45;
camera.updateProjectionMatrix();
