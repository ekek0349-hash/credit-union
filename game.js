
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ==========================================
// 춘천신협 3D 금융창구 시뮬레이터
// ==========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9cbd8);
scene.fog = new THREE.Fog(0xb9cbd8, 18, 42);

const camera = new THREE.PerspectiveCamera(
  72,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.68, 7.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.getElementById('game').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x817565, 2));

const sunlight = new THREE.DirectionalLight(0xffedcf, 2.5);
sunlight.position.set(-5, 10, 7);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(2048, 2048);
scene.add(sunlight);

// ==========================================
// 재질
// ==========================================

const mats = {
  floor: new THREE.MeshStandardMaterial({ color: 0xb6a58d, roughness: 0.85 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xe7e8e4 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x174b70 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x79583d }),
  lightWood: new THREE.MeshStandardMaterial({ color: 0xb18b62 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x8bb6c9,
    transparent: true,
    opacity: 0.24
  }),
  metal: new THREE.MeshStandardMaterial({ color: 0x89939a }),
  black: new THREE.MeshStandardMaterial({ color: 0x202b35 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf5f5ef }),
  green: new THREE.MeshStandardMaterial({ color: 0x427b58 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xd8a47e }),
  suit: new THREE.MeshStandardMaterial({ color: 0x263d54 }),
  customer: new THREE.MeshStandardMaterial({ color: 0x7b6557 })
};

// ==========================================
// 3D 오브젝트 생성 함수
// ==========================================

function box(w, h, d, material, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  parent.add(mesh);
  return mesh;
}

function cylinder(rt, rb, h, material, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, 20),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);

  return mesh;
}

function textSprite(message, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = options.bg || '#173e5c';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.fillStyle = options.color || '#ffffff';
  ctx.font = `bold ${options.size || 76}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, 512, 128);

  const texture = new THREE.CanvasTexture(canvas);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    })
  );

  sprite.scale.set(
    options.w || 4.2,
    options.h || 1.05,
    1
  );

  return sprite;
}

// ==========================================
// 영업점 내부
// ==========================================

box(24, 0.25, 22, mats.floor, 0, -0.15, 0);
box(24, 5.5, 0.25, mats.wall, 0, 2.6, -11);
box(0.25, 5.5, 22, mats.wall, -12, 2.6, 0);
box(0.25, 5.5, 22, mats.wall, 12, 2.6, 0);
box(24, 5.5, 0.25, mats.wall, 0, 2.6, 11);
box(24, 0.18, 22, mats.white, 0, 5.35, 0);

// 천장 조명
for (let x = -8; x <= 8; x += 4) {
  for (let z = -7; z <= 7; z += 4) {
    box(2.1, 0.06, 0.65, mats.white, x, 5.18, z);

    const light = new THREE.PointLight(0xfff4df, 0.55, 8);
    light.position.set(x, 4.9, z);
    scene.add(light);
  }
}

// 신협 간판
const sign = textSprite('춘천신협 · 근화지점', {
  w: 7.3,
  h: 1.5,
  size: 82
});

sign.position.set(0, 4.15, -10.82);
scene.add(sign);

// 뒷면 창문
for (let i = 0; i < 3; i++) {
  box(2.5, 1.8, 0.08, mats.glass, -8 + i * 2.7, 2.6, -10.82);
}

// 고객 대기석
for (let i = 0; i < 4; i++) {
  const x = -8.4 + i * 2.15;

  box(1.35, 0.22, 0.65, mats.blue, x, 0.58, 5.5);
  box(1.35, 0.65, 0.18, mats.blue, x, 0.98, 5.78);

  for (const dx of [-0.5, 0.5]) {
    cylinder(0.045, 0.045, 0.55, mats.metal, x + dx, 0.28, 5.5);
  }
}

// 대기 테이블
box(2.2, 0.45, 0.8, mats.wood, 0, 0.35, 6.9);
box(2.2, 0.06, 0.8, mats.lightWood, 0, 0.61, 6.9);

// ==========================================
// 창구
// ==========================================

for (let i = 0; i < 3; i++) {
  const x = -5.1 + i * 5.1;

  box(3.8, 1.0, 1.25, mats.wood, x, 0.55, -2.0);
  box(3.85, 0.12, 1.3, mats.lightWood, x, 1.1, -2.0);
  box(3.65, 0.8, 0.07, mats.glass, x, 1.65, -2.48);

  box(1.0, 0.55, 0.12, mats.black, x, 1.7, -2.45);

  const label = textSprite(
    ['예금·출자', '대출 상담', '공제 상담'][i],
    { w: 2.4, h: 0.55, size: 65 }
  );

  label.position.set(x, 2.35, -2.5);
  scene.add(label);
}

// ==========================================
// 컴퓨터
// ==========================================

function makeComputer(x, z) {
  box(1.5, 0.09, 0.8, mats.wood, x, 1.05, z);
  box(0.75, 0.55, 0.08, mats.black, x, 1.52, z - 0.2);

  box(
    0.65,
    0.42,
    0.015,
    new THREE.MeshStandardMaterial({ color: 0x6f9aa9 }),
    x,
    1.55,
    z - 0.15
  );

  box(0.22, 0.12, 0.22, mats.black, x, 1.15, z + 0.25);
}

makeComputer(-5.1, -1.9);
makeComputer(0, -1.9);
makeComputer(5.1, -1.9);

// ==========================================
// 상담실
// ==========================================

box(0.12, 2.8, 6, mats.white, 8.3, 1.4, -6.5);

const officeSign = textSprite('상담실', {
  w: 2,
  h: 0.65,
  size: 80
});

officeSign.position.set(9.8, 2.55, -6.4);
scene.add(officeSign);

box(2.4, 0.18, 1.1, mats.wood, 9.8, 0.55, -8.8);

// ==========================================
// ATM
// ==========================================

const atmSign = textSprite('ATM', {
  w: 1.5,
  h: 0.55,
  size: 85
});

atmSign.position.set(-8, 2.2, -8.4);
scene.add(atmSign);

box(1.4, 2.1, 0.8, mats.blue, -8, 1.05, -8.8);
box(0.95, 0.85, 0.05, mats.black, -8, 1.55, -8.35);

// ==========================================
// 화분
// ==========================================

function plant(x, z) {
  cylinder(0.35, 0.28, 0.55, mats.wood, x, 0.28, z);
  cylinder(0.05, 0.05, 1.0, mats.wood, x, 0.95, z);

  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 10),
      mats.green
    );

    leaf.scale.set(0.65, 1.4, 0.65);

    leaf.position.set(
      x + Math.sin(i) * 0.42,
      1.35 + (i % 3) * 0.2,
      z + Math.cos(i) * 0.35
    );

    scene.add(leaf);
  }
}

plant(-10, 8);
plant(10, 8);
plant(7, -9);

// ==========================================
// 사람 캐릭터
// ==========================================

function makePerson(x, z, clothing, scale = 1) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28, 0.68, 5, 10),
    clothing
  );

  body.position.y = 1.0;
  g.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 18, 14),
    mats.skin
  );

  head.position.y = 1.68;
  g.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.225, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mats.customer
  );

  hair.position.y = 1.76;
  g.add(hair);

  for (const sx of [-0.13, 0.13]) {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.085, 0.48, 4, 8),
      clothing
    );

    arm.position.set(sx, 1.05, 0);
    g.add(arm);

    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.55, 4, 8),
      mats.black
    );

    leg.position.set(sx * 0.65, 0.38, 0);
    g.add(leg);
  }

  g.position.set(x, 0, z);
  g.scale.setScalar(scale);

  scene.add(g);
  return g;
}

const clerk = makePerson(-5.1, 0.4, mats.suit, 1);
clerk.visible = false;

const customerMeshes = [
  makePerson(-5.1, -0.1, mats.customer, 0.92),
  makePerson(0, -0.1, new THREE.MeshStandardMaterial({ color: 0x536e87 }), 0.92),
  makePerson(5.1, -0.1, new THREE.MeshStandardMaterial({ color: 0x6c6655 }), 0.92)
];

customerMeshes.forEach((p, i) => p.visible = i === 0);

// ==========================================
// 상호작용 대상
// ==========================================

const interactables = [];

function addInteractable(name, position, radius, action) {
  interactables.push({
    name,
    position: new THREE.Vector3(...position),
    radius,
    action
  });
}

addInteractable('예금 창구', [-5.1, 1.3, -2], 3, () => openCustomerFlow('deposit'));
addInteractable('대출 창구', [0, 1.3, -2], 3, () => openCustomerFlow('loan'));
addInteractable('공제 창구', [5.1, 1.3, -2], 3, () => openCustomerFlow('mutual'));
addInteractable('전산 업무 책상', [0, 1.2, -1.8], 2.4, openComputer);
addInteractable('상담실', [9.8, 1.2, -8.8], 2.8, () => showToast('상담실입니다.'));
addInteractable('ATM', [-8, 1.2, -8.8], 2.5, () => showToast('ATM 기기입니다.'));
addInteractable('출입구', [0, 1.2, 9.5], 2.6, () => showToast('영업점 출입구입니다.'));

// ==========================================
// 게임 상태
// ==========================================

let yaw = 0;
let pitch = 0;
let pointerLocked = false;

const keys = {};

const player = {
  x: 0,
  y: 1.68,
  z: 7.2,
  speed: 3.6
};

let currentCustomerType = null;
let customerStep = 0;
let currentScenario = null;

let day = 1;
let sales = 0;
let satisfaction = 80;
let clockMinutes = 540;

let mutualCount = 0;
let depositBook = 0;

// ==========================================
// 고객 상담 시나리오
// ==========================================

const scenarios = {
  deposit: {
    name: '김영희 고객님 · 예금 만기 재예치',

    lines: [
      {
        text: '안녕하세요. 지난번 정기예금이 만기돼서 왔어요. 이번에도 예금하려고 하는데 금리가 어떻게 되나요?',

        options: [
          ['먼저 만기 자금 규모와 사용 계획을 여쭤보겠습니다.', '네. 이자까지 합쳐서 5천만 원 정도예요.', 5],
          ['현재 금리를 먼저 안내하겠습니다.', '금리는 알겠는데 제 상황에 맞는 상품도 있을까요?', 2],
          ['바로 재예치 신청을 진행하겠습니다.', '아직 어디에 넣을지 결정한 건 아니에요.', -3]
        ]
      },

      {
        text: '자금 중 가까운 시일 내에 사용하실 계획이 있는 금액도 있으실까요?',

        options: [
          ['당분간 사용 계획이 없는지 확인한다.', '당장 쓸 돈은 아니고 1년 정도 여유가 있어요.', 5],
          ['일부는 생활비로 남겨둘지 확인한다.', '1천만 원 정도는 혹시 몰라서 가지고 있으려고요.', 5],
          ['기간 확인 없이 상품을 권유한다.', '중간에 돈이 필요해지면 어떻게 되나요?', -3]
        ]
      },

      {
        text: '예치 기간과 다른 금융기관 거래도 함께 확인하겠습니다.',

        options: [
          ['1년 예치 가능 여부와 타 금융기관 자금을 확인한다.', '농협에도 조금 있어요. 금리가 괜찮으면 옮길 수도 있죠.', 5],
          ['6개월 예치가 적합한지 확인한다.', '6개월 정도면 좋을 것 같아요.', 4],
          ['1년 상품을 우선 권유한다.', '1년은 조금 부담스러운데요.', -4]
        ]
      },

      {
        text: '예금자보호 한도와 출자금의 차이도 설명드리고 자금 운용 방법을 안내하겠습니다.',

        options: [
          ['예금과 출자금의 보호 차이를 정확히 설명한다.', '출자금은 예금과 보호 방식이 다르군요.', 8],
          ['금리만 비교해서 안내한다.', '다른 조건은 없나요?', 1],
          ['필요 자금과 예치 자금을 나눠 제안한다.', '그렇게 나누는 방법도 괜찮겠네요.', 7]
        ]
      },

      {
        text: '안내드린 조건으로 진행해 드릴까요?',

        options: [
          ['5천만 원 재예치를 진행한다.', '설명을 들으니 이해가 잘 되네요. 진행해 주세요.', 10, 'sale'],
          ['우선 4천만 원만 예치한다.', '우선 4천만 원만 예치하고 나머지는 나중에 결정할게요.', 6, 'partial'],
          ['가족과 상의한 후 다시 방문하기로 한다.', '오늘 설명 잘 들었습니다. 다시 올게요.', 2]
        ]
      }
    ]
  },

  loan: {
    name: '박정수 고객님 · 아파트 담보대출',

    lines: [
      {
        text: '아파트를 담보로 대출을 받으려고 하는데 여기서도 가능한가요?',

        options: [
          ['기본 사항부터 확인하겠습니다.', '네. 어떤 것부터 알려드리면 될까요?', 6],
          ['상품 금리부터 설명한다.', '제가 얼마나 받을 수 있는지가 궁금해요.', 2],
          ['담보가 있으니 가능하다고 말한다.', '아직 심사도 안 했는데 가능한가요?', -6]
        ]
      },

      {
        text: '아파트 시세와 기존 담보대출, 거주 및 임대차 관계를 확인하겠습니다.',

        options: [
          ['시세·선순위·점유·임대차를 확인한다.', '시세는 3억 5천 정도이고 기존 대출은 1억 원 있어요.', 7],
          ['시세만 확인한다.', '기존 대출도 확인해야 하나요?', 1],
          ['한도를 먼저 약속한다.', '다른 은행 대출도 있는데요.', -5]
        ]
      },

      {
        text: '재직과 연 소득, 다른 금융기관 부채 및 상환 부담도 확인해야 합니다.',

        options: [
          ['재직·소득·부채 서류를 요청한다.', '7년째 근무 중이고 연 소득은 5천만 원입니다. 신용대출도 2천만 원 있어요.', 7],
          ['소득만 확인한다.', '다른 대출도 확인해야 하는군요.', 2],
          ['소득은 중요하지 않다고 안내한다.', '소득을 확인하지 않아도 되나요?', -7]
        ]
      },

      {
        text: '필요 금액과 자금 용도, 상환 계획을 확인하겠습니다.',

        options: [
          ['필요 금액과 사업자금 용도를 확인한다.', '사업자금으로 8천만 원 정도 필요해요.', 6],
          ['상환 계획도 함께 확인한다.', '8천만 원 정도 필요하고 매월 원금과 이자를 갚을 계획입니다.', 8],
          ['담보만으로 판단한다.', '정확한 한도는 심사해 봐야겠네요.', -5]
        ]
      },

      {
        text: '담보 평가, 선순위 채권, 임대차·점유 관계, 소득과 부채를 확인한 뒤 심사 결과를 안내하겠습니다.',

        options: [
          ['필요 서류와 심사 절차를 안내한다.', '서류 준비해서 다시 방문하겠습니다.', 8],
          ['승인 여부를 확답하지 않고 정식 심사를 안내한다.', '정확하게 확인하고 진행하는 게 좋겠네요.', 7],
          ['심사 전 승인을 약속한다.', '그럼 승인되는 걸로 알고 있겠습니다.', -10]
        ]
      }
    ]
  },

  mutual: {
    name: '최성호 고객님 · 건물 화재공제',

    lines: [
      {
        text: '건물을 가지고 있는데 화재보험을 알아보려고요. 다른 보험에 가입되어 있습니다.',

        options: [
          ['기존 보험 증권을 먼저 확인하겠습니다.', '증권을 가지고 있는데 비교해 주실 수 있나요?', 7],
          ['우리 상품이 더 좋다고 설명한다.', '비교도 안 해보고요?', -4],
          ['보험료부터 안내한다.', '보장 내용도 궁금합니다.', 1]
        ]
      },

      {
        text: '건물 용도와 구조, 면적, 임대 여부 및 내부 시설을 확인하겠습니다.',

        options: [
          ['건물의 용도·구조·임차인 등을 확인한다.', '1층은 상가이고 2층은 사무실입니다.', 8],
          ['건물 가격만 확인한다.', '건물 용도도 중요한가요?', 1],
          ['기존 보험과 같은 조건으로 설계한다.', '건물 구조도 다른데 괜찮을까요?', -5]
        ]
      },

      {
        text: '기존 보험의 보장금액, 자기부담금, 특약과 보험기간을 비교해야 합니다.',

        options: [
          ['보장 공백과 중복 여부를 확인한다.', '보험료는 내는데 실제 보장이 뭔지 잘 모르겠어요.', 8],
          ['보험료 절감만 강조한다.', '보장도 괜찮은지 확인하고 싶어요.', 2],
          ['기존 보험을 해지하라고 권한다.', '기존 보험을 먼저 해지해도 되나요?', -8]
        ]
      },

      {
        text: '증권을 검토한 뒤 보장 내용과 보험료를 비교해 드리겠습니다.',

        options: [
          ['증권을 받아 비교 상담을 진행한다.', '좋습니다. 증권을 보내드릴게요.', 9, 'sale'],
          ['추가 상담 일정을 잡는다.', '다음에 증권을 가지고 다시 방문하겠습니다.', 5],
          ['비교 없이 바로 가입을 권한다.', '기존 보험부터 확인하고 싶습니다.', -7]
        ]
      }
    ]
  }
};

// ==========================================
// 상담창 표시
// ==========================================

function openCustomerFlow(type) {
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  currentCustomerType = type;
  currentScenario = scenarios[type];
  customerStep = 0;

  showInteraction(
    '고객 상담',
    currentScenario.name,
    currentScenario.lines[0].text,
    currentScenario.lines[0].options.map((o, i) => ({
      label: o[0],
      index: i
    }))
  );
}

function showInteraction(tag, title, body, choices) {
  document.getElementById('interaction').classList.remove('hidden');

  document.getElementById('interactionTag').textContent = tag;
  document.getElementById('interactionTitle').textContent = title;
  document.getElementById('interactionText').textContent = body;

  const holder = document.getElementById('interactionChoices');
  holder.innerHTML = '';

  choices.forEach(c => {
    const button = document.createElement('button');

    button.className = 'choice';
    button.textContent = c.label;

    button.onclick = () => {
      if (c.onClick) c.onClick();
      else chooseCustomerOption(c.index);
    };

    holder.appendChild(button);
  });

  document.getElementById('interactionFooter').textContent =
    '고객의 상황을 먼저 파악하고 적합한 안내를 선택하세요.';
}

// ==========================================
// 상담 선택 처리
// ==========================================

function chooseCustomerOption(index) {
  const line = currentScenario.lines[customerStep];
  const option = line.options[index];

  satisfaction = Math.max(
    0,
    Math.min(100, satisfaction + option[2])
  );

  document.getElementById('interactionText').textContent =
    '고객: ' + option[1];

  document.getElementById('interactionChoices').innerHTML = '';

  document.getElementById('interactionFooter').textContent =
    '고객의 답변을 확인했습니다.';

  if (option[3] === 'sale') {
    if (currentCustomerType === 'deposit') {
      sales += 5000;
      depositBook += 5000;
    }

    if (currentCustomerType === 'mutual') {
      mutualCount++;
    }
  }

  if (option[3] === 'partial') {
    sales += 4000;
    depositBook += 4000;
  }

  updateHud();

  customerStep++;

  if (customerStep >= currentScenario.lines.length) {
    const done = document.createElement('button');

    done.className = 'choice';
    done.textContent = '상담 마무리';

    done.onclick = () => {
      document.getElementById('interaction').classList.add('hidden');

      clockMinutes += 12;
      updateClock();

      showToast('상담을 마무리했습니다.');

      document.getElementById('objectiveText').textContent =
        '상담 완료. 다음 고객을 응대하거나 전산 업무를 진행하세요.';
    };

    document.getElementById('interactionChoices').appendChild(done);

    document.getElementById('interactionFooter').textContent =
      '상담 내용을 확인하고 마무리하세요.';

  } else {
    const next = currentScenario.lines[customerStep];

    setTimeout(() => {
      if (document.getElementById('interaction').classList.contains('hidden')) {
        return;
      }

      document.getElementById('interactionText').textContent = next.text;

      const holder = document.getElementById('interactionChoices');
      holder.innerHTML = '';

      next.options.forEach((o, i) => {
        const button = document.createElement('button');

        button.className = 'choice';
        button.textContent = o[0];
        button.onclick = () => chooseCustomerOption(i);

        holder.appendChild(button);
      });

      document.getElementById('interactionFooter').textContent =
        `상담 단계 ${customerStep + 1} / ${currentScenario.lines.length}`;

    }, 650);
  }
}

document.getElementById('closeInteraction').onclick = () => {
  document.getElementById('interaction').classList.add('hidden');
};

// ==========================================
// 전산 업무
// ==========================================

let activeTab = 'deposit';

function openComputer() {
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  document.getElementById('computer').classList.remove('hidden');
  renderComputer();
}

document.getElementById('closeComputer').onclick = () => {
  document.getElementById('computer').classList.add('hidden');
};

document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    activeTab = button.dataset.tab;

    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab === button);
    });

    renderComputer();
  });
});

function renderComputer() {
  const root = document.getElementById('computerContent');

  const field = (label, id, type = 'text', value = '') => `
    <div class="field">
      <label>${label}</label>
      <input id="${id}" type="${type}" value="${value}">
    </div>
  `;

  if (activeTab === 'deposit') {
    root.innerHTML = `
      <h3>예금 신규 · 재예치</h3>
      <p>고객의 자금 목적과 예치 기간을 확인한 후 입력하세요.</p>

      <div class="form-grid">
        ${field('고객 성명', 'dName')}
        ${field('가입 금액 (만원)', 'dAmount', 'number', '5000')}
        ${field('연 금리 (%)', 'dRate', 'number', '3.5')}
        ${field('예치 기간 (개월)', 'dMonths', 'number', '12')}
      </div>

      <div class="form-actions">
        <button class="action-btn" id="doDeposit">
          가상 신규 처리
        </button>
      </div>

      <div id="computerResult"></div>
    `;

    document.getElementById('doDeposit').onclick = () => {
      const amount = Number(document.getElementById('dAmount').value);
      const rate = Number(document.getElementById('dRate').value);
      const months = Number(document.getElementById('dMonths').value);

      if (!(amount > 0 && rate >= 0 && months > 0)) {
        showToast('입력값을 확인해 주세요.');
        return;
      }

      const interest = amount * rate / 100 * months / 12;

      sales += amount;
      depositBook += amount;

      updateHud();

      document.getElementById('computerResult').innerHTML = `
        <div class="result-box">
          가상 신규 처리 완료<br>
          고객: ${escapeHtml(document.getElementById('dName').value || '미입력')}<br>
          원금: ${amount.toLocaleString()}만원<br>
          예상 세전 이자: ${interest.toFixed(2)}만원<br>
          <small>교육용 단순 계산입니다.</small>
        </div>
      `;

      clockMinutes += 7;
      updateClock();
    };

  } else if (activeTab === 'loan') {
    root.innerHTML = `
      <h3>여신 사전 검토</h3>
      <p>실제 승인 판단이 아닌 기초정보 확인 연습입니다.</p>

      <div class="form-grid">
        ${field('고객 성명', 'lName')}
        ${field('신청 금액 (만원)', 'lAmount', 'number', '8000')}
        ${field('연 소득 (만원)', 'lIncome', 'number', '5000')}
        ${field('기존 부채 (만원)', 'lDebt', 'number', '2000')}
        ${field('신용점수', 'lScore', 'number', '800')}
        ${field('담보 시세 (만원)', 'lValue', 'number', '35000')}
      </div>

      <div class="form-actions">
        <button class="action-btn" id="doLoan">사전 검토</button>
      </div>

      <div id="computerResult"></div>
    `;

    document.getElementById('doLoan').onclick = () => {
      const amount = +document.getElementById('lAmount').value;
      const income = +document.getElementById('lIncome').value;
      const debt = +document.getElementById('lDebt').value;
      const score = +document.getElementById('lScore').value;
      const value = +document.getElementById('lValue').value;

      if (!(amount > 0 && income >= 0 && debt >= 0 &&
        score >= 0 && score <= 1000 && value >= 0)) {
        showToast('입력값을 확인해 주세요.');
        return;
      }

      let notes = [];

      if (amount > value * 0.7) {
        notes.push('담보가액 대비 신청금액 검토 필요');
      }

      if (income === 0) {
        notes.push('소득증빙 확인 필요');
      }

      if (debt > income * 3) {
        notes.push('기존 부채 및 상환능력 추가 확인');
      }

      if (score < 700) {
        notes.push('신용정보 세부 확인 필요');
      }

      if (!notes.length) {
        notes.push('기초 입력정보상 추가 확인 항목이 적습니다.');
      }

      document.getElementById('computerResult').innerHTML = `
        <div class="result-box">
          사전 검토 메모<br>
          ${notes.map(escapeHtml).join('<br>')}<br>
          <small>
            실제 LTV·DSR·선순위·임대차·보증요건·내규를
            반영하지 않은 교육용 결과입니다.
          </small>
        </div>
      `;

      clockMinutes += 10;
      updateClock();
    };

  } else if (activeTab === 'mutual') {
    root.innerHTML = `
      <h3>공제 상담 기록</h3>

      <div class="form-grid">
        <div class="field">
          <label>상품 구분</label>
          <select id="mType">
            <option>화재공제</option>
            <option>운전자공제</option>
            <option>간병공제</option>
          </select>
        </div>

        <div class="field">
          <label>상담 단계</label>
          <select id="mStage">
            <option>기존 증권 확인</option>
            <option>보장 분석</option>
            <option>신규 설계 안내</option>
            <option>추가 상담 예약</option>
          </select>
        </div>

        ${field('고객 성명', 'mName')}
        ${field('상담 메모', 'mMemo')}
      </div>

      <div class="form-actions">
        <button class="action-btn" id="doMutual">
          상담 기록 저장
        </button>
      </div>

      <div id="computerResult"></div>
    `;

    document.getElementById('doMutual').onclick = () => {
      mutualCount++;
      updateHud();

      document.getElementById('computerResult').innerHTML = `
        <div class="result-box">
          공제 상담 기록을 저장했습니다.
          약관, 고지사항, 보장 범위와 면책사항을 확인해야 합니다.
        </div>
      `;

      clockMinutes += 6;
      updateClock();
    };

  } else {
    root.innerHTML = `
      <h3>조합원 정보 확인 연습</h3>

      <div class="form-grid">
        ${field('성명', 'mbrName')}
        ${field('연락처', 'mbrPhone')}
        ${field('출자금 (만원)', 'mbrCapital', 'number', '10')}

        <div class="field">
          <label>조합원 구분</label>
          <select id="mbrType">
            <option>신규 가입 상담</option>
            <option>기존 조합원</option>
            <option>출자금 추가 납입</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button class="action-btn" id="doMember">
          상담 메모 저장
        </button>
      </div>

      <div id="computerResult"></div>
    `;

    document.getElementById('doMember').onclick = () => {
      document.getElementById('computerResult').innerHTML = `
        <div class="result-box">
          조합원 상담 메모를 저장했습니다.
          출자금은 예금과 보호·환급 구조가 다르다는 점을 설명하세요.
        </div>
      `;

      clockMinutes += 5;
      updateClock();
    };
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// ==========================================
// 이동 및 마우스 조작
// ==========================================

renderer.domElement.addEventListener('click', () => {
  if (
    document.getElementById('interaction').classList.contains('hidden') &&
    document.getElementById('computer').classList.contains('hidden')
  ) {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;

  document.getElementById('hint').style.display =
    pointerLocked ? 'none' : 'block';
});

document.addEventListener('mousemove', e => {
  if (!pointerLocked) return;

  yaw -= e.movementX * 0.0022;
  pitch -= e.movementY * 0.0018;

  pitch = Math.max(-1.25, Math.min(1.25, pitch));
});

document.addEventListener('keydown', e => {
  keys[e.code] = true;

  if (e.code === 'KeyE' && pointerLocked) {
    tryInteract();
  }
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
});

// ==========================================
// 상호작용
// ==========================================

function tryInteract() {
  const forward = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  let best = null;
  let bestScore = Infinity;

  for (const item of interactables) {
    const dx = item.position.x - player.x;
    const dz = item.position.z - player.z;

    const dist = Math.hypot(dx, dz);

    if (dist > item.radius) continue;

    const dir = new THREE.Vector3(dx, 0, dz).normalize();
    const dot = forward.dot(dir);

    if (dot > 0.15 && dist - dot * 0.4 < bestScore) {
      best = item;
      bestScore = dist - dot * 0.4;
    }
  }

  if (best) {
    document.exitPointerLock();
    best.action();
  } else {
    showToast('상호작용할 대상이 없습니다.');
  }
}

// ==========================================
// 플레이어 이동
// ==========================================

function updateMovement(dt) {
  if (!pointerLocked) return;

  const forward = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  const right = new THREE.Vector3(
    Math.cos(yaw),
    0,
    -Math.sin(yaw)
  );

  const move = new THREE.Vector3();

  if (keys.KeyW || keys.ArrowUp) move.add(forward);
  if (keys.KeyS || keys.ArrowDown) move.sub(forward);
  if (keys.KeyD || keys.ArrowRight) move.add(right);
  if (keys.KeyA || keys.ArrowLeft) move.sub(right);

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(
      player.speed *
      (keys.ShiftLeft ? 1.65 : 1) *
      dt
    );

    player.x = THREE.MathUtils.clamp(
      player.x + move.x,
      -10.8,
      10.8
    );

    player.z = THREE.MathUtils.clamp(
      player.z + move.z,
      -9.8,
      9.8
    );
  }

  camera.position.set(player.x, player.y, player.z);

  camera.rotation.order = 'YXZ';
  camera.rotation.set(pitch, yaw, 0);
}

// ==========================================
// HUD
// ==========================================

function updateClock() {
  const h = Math.floor(clockMinutes / 60);
  const m = clockMinutes % 60;

  document.getElementById('clock').textContent =
    String(h).padStart(2, '0') + ':' +
    String(m).padStart(2, '0');
}

function updateHud() {
  document.getElementById('day').textContent = day;

  document.getElementById('sales').textContent =
    sales.toLocaleString();

  document.getElementById('satisfaction').textContent =
    satisfaction;
}

// ==========================================
// 알림
// ==========================================

let toastTimer;

function showToast(message) {
  const el = document.getElementById('toast');

  el.textContent = message;
  el.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 2600);
}

// ==========================================
// 게임 실행
// ==========================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);

  updateMovement(dt);

  const forward = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  let nearest = null;
  let nearestDist = 999;

  for (const item of interactables) {
    const dx = item.position.x - player.x;
    const dz = item.position.z - player.z;

    const dist = Math.hypot(dx, dz);

    const dot = forward.dot(
      new THREE.Vector3(dx, 0, dz).normalize()
    );

    if (
      dist < item.radius &&
      dot > 0.15 &&
      dist < nearestDist
    ) {
      nearest = item;
      nearestDist = dist;
    }
  }

  document.getElementById('bottomPrompt').textContent =
    nearest
      ? `E 키를 눌러 ${nearest.name} 이용`
      : '주변을 둘러보세요. 창구와 전산 책상에서 E 키를 누를 수 있습니다.';

  renderer.render(scene, camera);
}

animate();

// ==========================================
// 화면 크기 대응
// ==========================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

updateHud();
updateClock();
