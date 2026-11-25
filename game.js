
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const $ = id => document.getElementById(id);

const container = $("scene-container");

if (!container) {
  throw new Error("scene-container 요소를 찾을 수 없습니다.");
}

// ===================================
// 3D 기본 환경
// ===================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9e8eb);
scene.fog = new THREE.Fog(0xd9e8eb, 18, 35);

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

// 직원이 창구 안에서 바라보는 시점
camera.position.set(0, 4.5, 12);
camera.lookAt(0, 1.5, -2);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// 조명
scene.add(new THREE.HemisphereLight(0xffffff, 0x84959c, 2));

const light = new THREE.DirectionalLight(0xffffff, 2.3);
light.position.set(-5, 10, 8);
light.castShadow = true;
scene.add(light);

// ===================================
// 3D 제작 함수
// ===================================

function mat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.75
  });
}

function cube(parent, x, y, z, sx, sy, sz, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    mat(color)
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

function ball(parent, x, y, z, sx, sy, sz, color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 20),
    mat(color)
  );

  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  parent.add(mesh);

  return mesh;
}

function column(parent, x, y, z, radius, height, color) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 16),
    mat(color)
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);

  return mesh;
}

// ===================================
// 은행 내부 만들기
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

// 창문
cube(scene, -5.4, 3.1, -11.78, 5, 2.2, 0.08, 0x8fbecb);
cube(scene, -5.4, 3.1, -11.68, 0.08, 2.3, 0.1, 0xffffff);
cube(scene, -5.4, 3.1, -11.68, 5.1, 0.08, 0.1, 0xffffff);

// 벽 장식
cube(scene, 4.5, 3, -11.7, 5, 3.5, 0.12, 0xd3e6dd);

// 신협 간판
cube(scene, 0, 5, -11.55, 5.5, 0.8, 0.2, 0x087b68);

// ===================================
// 창구 책상
// ===================================

// 책상은 화면 아래쪽에 배치
cube(scene, 0, 1.05, 2.0, 9, 1.15, 1.0, 0x947052);
cube(scene, 0, 1.65, 2.0, 9.2, 0.14, 1.1, 0x65452f);

// 모니터
cube(scene, -2, 2.25, 1.65, 1.25, 0.9, 0.12, 0x293a48);
cube(scene, -2, 2.25, 1.57, 1.12, 0.72, 0x9ec8cf);
cube(scene, -2, 1.75, 1.65, 0.16, 0.25, 0x465763);

// 키보드
cube(scene, -0.4, 1.76, 2.0, 1.2, 0.06, 0.38, 0x29343d);

// 창구 번호
cube(scene, 3.1, 2.05, 1.65, 1.1, 0.6, 0.15, 0x087b68);

// ===================================
// 대기석
// ===================================

const seatPositions = [
  [-5.5, -3.0],
  [-3.3, -3.0],
  [-1.1, -3.0],
  [1.1, -3.0],
  [3.3, -3.0],
  [5.5, -3.0],
  [-5.5, -6.0],
  [-3.3, -6.0],
  [-1.1, -6.0],
  [1.1, -6.0],
  [3.3, -6.0],
  [5.5, -6.0]
];

function makeChair(x, z) {
  const group = new THREE.Group();

  cube(group, 0, 0.65, 0, 0.85, 0.15, 0.8, 0x567989);
  cube(group, 0, 1.1, -0.32, 0.85, 0.9, 0.12, 0x567989);

  for (const dx of [-0.32, 0.32]) {
    for (const dz of [-0.25, 0.25]) {
      column(group, dx, 0.3, dz, 0.045, 0.6, 0x525b60);
    }
  }

  group.position.set(x, 0, z);
  scene.add(group);
}

seatPositions.forEach(p => makeChair(p[0], p[1]));

// ===================================
// 심즈 스타일 캐릭터 제작
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

function createPerson(index, seated = true) {
  const person = new THREE.Group();

  const skin = skinColors[index % skinColors.length];
  const hair = hairColors[index % hairColors.length];
  const clothes = clothesColors[index % clothesColors.length];

  // 몸통
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.36, 0.55, 5, 12),
    mat(clothes)
  );

  body.position.y = seated ? 1.0 : 1.05;
  body.castShadow = true;
  person.add(body);

  // 목
  column(person, 0, 1.48, 0, 0.13, 0.25, skin);

  // 얼굴
  const headY = seated ? 1.83 : 1.95;

  ball(person, 0, headY, 0, 0.43, 0.53, 0.39, skin);

  // 귀
  ball(person, -0.42, headY, 0, 0.09, 0.15, 0.09, skin);
  ball(person, 0.42, headY, 0, 0.09, 0.15, 0.09, skin);

  // 머리카락
  const style = index % 4;

  ball(
    person,
    0,
    headY + 0.28,
    -0.02,
    0.45,
    0.32,
    0.41,
    hair
  );

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

  // 코
  ball(person, 0, headY - 0.09, 0.39, 0.075, 0.11, 0.08, skin);

  // 입
  ball(person, 0, headY - 0.24, 0.36, 0.13, 0.035, 0.025, 0x984e50);

  // 팔
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.12, 0.48, 4, 8),
      mat(clothes)
    );

    arm.position.set(side * 0.43, 1.0, 0);
    arm.rotation.z = side * -0.2;
    person.add(arm);

    ball(person, side * 0.44, 0.68, 0.04, 0.13, 0.13, 0.13, skin);
  }

  // 다리
  if (seated) {
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 0.42, 4, 8),
        mat(0x303a48)
      );

      leg.position.set(side * 0.2, 0.48, 0.25);
      leg.rotation.x = Math.PI / 2.8;
      person.add(leg);

      cube(person, side * 0.2, 0.22, 0.55, 0.25, 0.13, 0.45, 0x252b31);
    }
  } else {
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 0.55, 4, 8),
        mat(0x303a48)
      );

      leg.position.set(side * 0.2, 0.37, 0);
      person.add(leg);

      cube(person, side * 0.2, 0.08, 0.08, 0.28, 0.13, 0.45, 0x252b31);
    }
  }

  return person;
}

// ===================================
// 고객 데이터
// ===================================

const cases = [
  {
    purpose: "정기예금",
    job: "직장인",
    age: "50대",
    questions: [
      ["예금 만기 자금을 다시 맡기고 싶습니다.", ["자금 사용 시기와 예치 기간을 확인한다.", "무조건 1년 상품을 권유한다.", "금리만 안내한다."], 0],
      ["1년 정도 생각하고 있습니다.", ["기간별 금리와 중도해지 조건을 안내한다.", "기간은 상관없다고 설명한다.", "무조건 장기 예금을 권유한다."], 0],
      ["금리가 가장 높은 상품은 무엇인가요?", ["가입 조건과 실제 적용 금리를 확인한다.", "최고 금리를 무조건 약속한다.", "다른 고객의 금리를 적용한다."], 0],
      ["출자금도 가입해야 하나요?", ["출자금의 성격과 배당, 환급 제한을 설명한다.", "예금과 동일하게 보호된다고 설명한다.", "무조건 가입해야 한다고 한다."], 0],
      ["예금자보호는 어떻게 되나요?", ["현재 보호제도와 적용 대상 및 한도를 확인한다.", "모든 상품이 보호된다고 설명한다.", "출자금도 보호된다고 설명한다."], 0],
      ["배우자 명의로도 가입할 수 있나요?", ["명의자 본인 확인과 거래 절차를 안내한다.", "명의를 빌려 가입하라고 한다.", "대신 서명한다."], 0],
      ["세금 혜택도 알고 싶습니다.", ["대상 자격과 잔여 한도, 해당 연도 기준을 확인한다.", "누구나 비과세라고 설명한다.", "세금이 전혀 없다고 한다."], 0]
    ]
  },
  {
    purpose: "햇살론",
    job: "중소기업 근로자",
    age: "40대",
    questions: [
      ["생활비 때문에 햇살론을 알아보고 있습니다.", ["자금 용도와 현재 채무를 확인한다.", "가능 금액을 확정한다.", "신용점수만 확인한다."], 0],
      ["현재 회사에서 근무하고 있습니다.", ["재직기간과 소득 증빙을 확인한다.", "구두로 재직을 인정한다.", "재직기간은 중요하지 않다고 한다."], 0],
      ["연봉은 3천만 원입니다.", ["소득 증빙자료를 확인한다.", "소득을 그대로 확정한다.", "서류 없이 진행한다."], 0],
      ["카드론이 조금 있습니다.", ["금융기관별 채무와 금리를 확인한다.", "카드론은 무관하다고 한다.", "추가 대출을 권유한다."], 0],
      ["보증은 어디에서 해주나요?", ["상품별 보증기관과 심사 조건을 설명한다.", "무조건 보증된다고 한다.", "기관 확인 없이 진행한다."], 0],
      ["한도는 얼마나 나오나요?", ["보증 및 내부 심사 결과에 따라 달라진다고 설명한다.", "최대 한도를 약속한다.", "다른 고객 한도를 적용한다."], 0],
      ["필요한 서류를 알려주세요.", ["재직·소득 관련 서류를 안내한다.", "서류 없이 가능하다고 한다.", "확인 없이 신청한다."], 0]
    ]
  },
  {
    purpose: "정기적금",
    job: "회사원",
    age: "30대",
    questions: [
      ["매달 100만 원씩 저축하고 싶습니다.", ["월 불입 가능 금액과 목적을 확인한다.", "최대 금액부터 가입한다.", "기간을 묻지 않는다."], 0],
      ["1년 동안 납입할 생각입니다.", ["기간별 금리와 만기를 안내한다.", "기간은 상관없다고 한다.", "임의로 기간을 바꾼다."], 0],
      ["우대금리를 받을 수 있나요?", ["우대조건과 적용 기준을 설명한다.", "무조건 적용된다고 한다.", "조건을 생략한다."], 0],
      ["체크카드도 만들고 싶어요.", ["발급 조건과 혜택을 설명한다.", "동의 없이 발급한다.", "신용카드와 같다고 한다."], 0],
      ["모바일로 관리하고 싶습니다.", ["모바일뱅킹 가입 절차를 안내한다.", "비밀번호를 대신 설정한다.", "안내하지 않는다."], 0],
      ["자동이체도 설정해 주세요.", ["출금 계좌와 이체일을 확인한다.", "임의로 등록한다.", "잔액을 확인하지 않는다."], 0],
      ["최종 금리를 확인해 주세요.", ["당일 금리와 적용 조건을 확인한다.", "이전 금리를 무조건 약속한다.", "확인 없이 가입한다."], 0]
    ]
  },
  {
    purpose: "전세자금대출",
    job: "직장인",
    age: "30대",
    questions: [
      ["전세자금대출을 알아보고 있습니다.", ["보증금과 계약 일정, 주택 유형을 확인한다.", "대출부터 확정한다.", "주택 유형을 확인하지 않는다."], 0],
      ["보증금은 2억 원입니다.", ["필요 자금과 본인 자금을 확인한다.", "전액 대출을 약속한다.", "금액만으로 한도를 정한다."], 0],
      ["다가구주택입니다.", ["등기와 선순위 권리, 임대차 현황을 확인한다.", "무조건 가능하다고 한다.", "권리관계를 확인하지 않는다."], 0],
      ["집주인 확인도 필요한가요?", ["임대인 정보와 소유권을 확인한다.", "필요 없다고 한다.", "계약서만 확인한다."], 0],
      ["연봉은 3천만 원입니다.", ["소득과 기존 부채를 확인한다.", "소득만으로 한도를 정한다.", "부채를 무시한다."], 0],
      ["보증기관 심사가 있나요?", ["상품별 보증 심사 조건을 안내한다.", "심사가 없다고 한다.", "확인하지 않는다."], 0],
      ["언제까지 신청해야 하나요?", ["상품별 신청 기한과 잔금일을 확인한다.", "기한은 상관없다고 한다.", "확인하지 않는다."], 0]
    ]
  },
  {
    purpose: "화재공제",
    job: "자영업자",
    age: "50대",
    questions: [
      ["가게 화재공제를 알아보고 있습니다.", ["업종과 건물, 시설 현황을 확인한다.", "보험료부터 확정한다.", "면적만 확인한다."], 0],
      ["건물은 제 소유입니다.", ["건물 구조와 사용 용도를 확인한다.", "가격과 관계없이 가입한다.", "소유 여부를 무시한다."], 0],
      ["집기와 재고도 보장되나요?", ["목적물별 보장 가능 여부를 확인한다.", "모두 자동 보장된다고 한다.", "건물만으로 충분하다고 한다."], 0],
      ["기존 보험도 있습니다.", ["기존 증권과 담보를 비교한다.", "기존 보험을 해지하라고 한다.", "중복 보장은 무조건 좋다고 한다."], 0],
      ["화재가 나면 보상받나요?", ["가입 담보와 면책 사항을 설명한다.", "무조건 전액 보상한다고 한다.", "면책을 설명하지 않는다."], 0],
      ["보험료를 줄일 수 있나요?", ["필요 보장과 가입 금액을 점검한다.", "담보를 모두 삭제한다.", "보장금액을 무조건 낮춘다."], 0],
      ["가입 전에 확인할 사항은요?", ["약관과 고지사항, 보장 범위를 확인한다.", "서명부터 받는다.", "고지 의무를 생략한다."], 0]
    ]
  },
  {
    purpose: "비과세 예금",
    job: "은퇴자",
    age: "60대",
    questions: [
      ["목돈을 예금으로 맡기고 싶습니다.", ["금액과 기간, 자금 계획을 확인한다.", "금액만 확인한다.", "무조건 장기 상품을 권유한다."], 0],
      ["세금 혜택이 궁금합니다.", ["비과세종합저축과 신협 예탁금 세제 혜택을 구분해 설명한다.", "두 제도가 같다고 설명한다.", "누구나 비과세라고 한다."], 0],
      ["저도 대상이 될까요?", ["대상 자격과 법령상 요건을 확인한다.", "누구나 가능하다고 한다.", "확인하지 않는다."], 0],
      ["다른 은행에서도 가입했습니다.", ["기존 가입 내역과 잔여 한도를 확인한다.", "관계없다고 한다.", "한도를 확인하지 않는다."], 0],
      ["조합원 가입도 필요한가요?", ["조합원 여부와 세제 적용 요건을 구분한다.", "출자금만 있으면 전부 면제라고 한다.", "확인하지 않는다."], 0],
      ["일반과세와 차이가 큰가요?", ["금액과 기간에 따른 예상 세금을 비교한다.", "절세액을 약속한다.", "일반과세를 설명하지 않는다."], 0],
      ["오늘 가입할 수 있나요?", ["해당 연도 기준과 자격, 잔여 한도를 확인한다.", "무조건 가능하다고 한다.", "확인 절차를 생략한다."], 0]
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

function renderQueue() {
  $("waiting-count").textContent = waiting.length + "명";
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

  $("call-button").disabled = !started || !!active || waiting.length === 0;
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

  // 앉은 모델을 서 있는 모델로 변경
  scene.remove(active.person);

  active.person = createPerson(active.id, false);
  active.person.position.set(active.x, 0, active.z);
  scene.add(active.person);

  // 책상에 가리지 않도록 창구 앞에 도착
  active.targetX = 0;
  active.targetZ = 0.1;
  active.status = "walking";

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
// 고객 이동 애니메이션
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

  person.position.x += dx / distance * amount;
  person.position.z += dz / distance * amount;

  person.rotation.y = Math.atan2(dx, dz);

  // 걷는 움직임
  person.position.y = Math.abs(Math.sin(performance.now() * 0.008)) * 0.04;
}

// ===================================
// 상담
// ===================================

function showQuestion() {
  if (!active) return;

  const questions = active.data.questions;
  const q = questions[step];

  $("customer-name").textContent = active.name;
  $("step-count").textContent = `${step + 1} / ${questions.length}`;
  $("progress-bar").style.width =
    `${((step + 1) / questions.length) * 100}%`;

  $("customer-message").textContent = q[0];
  $("answer-list").innerHTML = "";
  $("feedback").textContent = "";
  $("finish-button").classList.add("hidden");

  q[1].forEach((answer, index) => {
    const button = document.createElement("button");

    button.className = "answer-button";
    button.textContent = `${index + 1}. ${answer}`;

    button.addEventListener("click", () => answerQuestion(index));

    $("answer-list").appendChild(button);
  });
}

function answerQuestion(index) {
  if (!active || active.status !== "consulting") return;

  const q = active.data.questions[step];
  const correct = q[2];

  $("answer-list").innerHTML = "";

  if (index === correct) {
    satisfaction = Math.min(100, satisfaction + 2);
    $("feedback").textContent =
      "좋은 응대입니다. 고객이 안내 내용을 이해했습니다.";
  } else {
    satisfaction = Math.max(0, satisfaction - 5);
    $("feedback").textContent =
      "주의가 필요합니다. 실제 업무에서는 상품 약관과 관련 기준을 다시 확인해야 합니다.";
  }

  updateHUD();

  const next = document.createElement("button");
  next.className = "primary-button";

  if (step === active.data.questions.length - 1) {
    next.textContent = "상담 마무리 확인";

    next.addEventListener("click", () => {
      $("customer-message").textContent =
        "모든 상담 질문이 끝났습니다. 고객에게 추가 문의 사항이 없는지 확인하고 상담을 마무리해 주세요.";

      $("answer-list").innerHTML = "";
      $("finish-button").classList.remove("hidden");
    });
  } else {
    next.textContent = "다음 상담 진행";

    next.addEventListener("click", () => {
      step++;
      showQuestion();
    });
  }

  $("answer-list").appendChild(next);
}

// ===================================
// 상담 완료
// ===================================

function finishConsultation() {
  if (!active) return;

  const person = active.person;

  const targetX = Math.random() * 8 - 4;
  const targetZ = -8;

  leaving.push({
    person,
    targetX,
    targetZ
  });

  sales += 100000;

  $("customer-panel").classList.add("hidden");
  $("finish-button").classList.add("hidden");

  showToast(`${active.name} 고객 상담 완료`);

  active = null;

  updateHUD();
  renderQueue();
}

// ===================================
// 퇴장 고객 이동
// ===================================

function updateLeaving(delta) {
  for (let i = leaving.length - 1; i >= 0; i--) {
    const c = leaving[i];

    const dx = c.targetX - c.person.position.x;
    const dz = c.targetZ - c.person.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.15) {
      scene.remove(c.person);
      leaving.splice(i, 1);
      continue;
    }

    const amount = Math.min(delta * 2, distance);

    c.person.position.x += dx / distance * amount;
    c.person.position.z += dz / distance * amount;
    c.person.rotation.y = Math.atan2(dx, dz);
  }
}

// ===================================
// 게임 시간
// ===================================

function updateTime(delta) {
  if (!started) return;

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
  $("sales").textContent = `${sales.toLocaleString("ko-KR")}원`;
  $("satisfaction").textContent = `${satisfaction}%`;
}

// ===================================
// 신규 고객 자동 방문
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
// 안내 메시지
// ===================================

let toastTimer;

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
// 게임 시작
// ===================================

function startGame() {
  if (started) return;

  started = true;

  $("start-screen").classList.add("hidden");

  // 시작 즉시 6명 생성
  for (let i = 0; i < 6; i++) {
    addCustomer();
  }

  updateHUD();
  renderQueue();

  showToast("영업 시작! 다음 고객을 호출하세요.");
}

// ===================================
// 버튼 이벤트
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
// 화면 크기 대응
// ===================================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
});
