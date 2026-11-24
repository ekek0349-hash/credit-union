
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* =========================================
   춘천신협 금융창구 시뮬레이터
   새 버전 - 전체 교체용
========================================= */

const $ = (id) => document.getElementById(id);

function makeElement(id, parent, tag = 'div') {
  let el = $(id);

  if (!el) {
    el = document.createElement(tag);
    el.id = id;
    parent.appendChild(el);
  }

  return el;
}

/* =========================================
   화면 및 기본 UI 생성
========================================= */

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.fontFamily = 'Arial, sans-serif';

const game = makeElement('game', document.body);

Object.assign(game.style, {
  position: 'fixed',
  inset: '0',
  background: '#b9cbd8'
});

const hud = makeElement('hud', document.body);

Object.assign(hud.style, {
  position: 'fixed',
  top: '15px',
  left: '15px',
  zIndex: '5',
  background: 'rgba(10,25,40,.88)',
  color: 'white',
  padding: '15px 20px',
  borderRadius: '12px',
  lineHeight: '1.8'
});

hud.innerHTML = `
  <strong>춘천신협 근화지점</strong>
  <div>영업일: <span id="day">1</span>일차</div>
  <div>시간: <span id="clock">09:00</span></div>
  <div>실적: <span id="sales">0</span>만원</div>
  <div>고객 만족도: <span id="satisfaction">80</span>점</div>
`;

const prompt = makeElement('bottomPrompt', document.body);

Object.assign(prompt.style, {
  position: 'fixed',
  bottom: '25px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: '5',
  padding: '12px 20px',
  background: 'rgba(0,0,0,.75)',
  color: 'white',
  borderRadius: '10px',
  textAlign: 'center',
  width: 'max-content',
  maxWidth: '90%'
});

prompt.textContent = 'WASD 이동 · 마우스 시점 변경 · E 상호작용 · Shift 달리기';

const hint = makeElement('hint', document.body);

Object.assign(hint.style, {
  position: 'fixed',
  inset: '0',
  zIndex: '10',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,.72)',
  color: 'white',
  textAlign: 'center',
  cursor: 'pointer'
});

hint.innerHTML = `
  <div style="
    background:#173e5c;
    padding:35px;
    border-radius:18px;
    max-width:480px;
  ">
    <h1>춘천신협</h1>
    <h2>금융창구 시뮬레이터</h2>
    <p>춘천신협 영업점에서 직접 근무해 보세요.</p>
    <p>WASD : 이동</p>
    <p>마우스 : 시점 변경</p>
    <p>E : 창구 및 전산 이용</p>
    <p>Shift : 달리기</p>
    <button style="
      padding:14px 35px;
      background:#d5a45d;
      color:#172536;
      border:0;
      border-radius:8px;
      font-size:18px;
      cursor:pointer;
    ">게임 시작</button>
  </div>
`;

const interaction = makeElement('interaction', document.body);

interaction.className = 'hidden';

const computer = makeElement('computer', document.body);

computer.className = 'hidden';

const toast = makeElement('toast', document.body);

Object.assign(toast.style, {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: '40',
  padding: '14px 20px',
  background: '#173e5c',
  color: 'white',
  borderRadius: '9px',
  display: 'none'
});

const style = document.createElement('style');

style.textContent = `
  .hidden { display:none !important; }

  #interaction, #computer {
    position:fixed;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    width:min(650px,92vw);
    max-height:85vh;
    overflow:auto;
    padding:25px;
    border-radius:16px;
    background:#f5f7fa;
    color:#203449;
    z-index:30;
    box-shadow:0 15px 50px #0008;
  }

  #interaction button, #computer button {
    cursor:pointer;
    border:0;
    border-radius:8px;
    padding:12px 16px;
    background:#174b70;
    color:white;
    margin:4px;
  }

  #interaction .choice {
    display:block;
    width:100%;
    text-align:left;
    margin:9px 0;
  }

  #computer input, #computer select {
    width:100%;
    padding:10px;
    border:1px solid #bbb;
    border-radius:6px;
    box-sizing:border-box;
  }

  #computer label {
    display:block;
    margin:10px 0 5px;
  }

  .result {
    background:#e3edf5;
    padding:15px;
    border-radius:8px;
    margin-top:15px;
    line-height:1.8;
  }
`;

document.head.appendChild(style);

interaction.innerHTML = `
  <button id="closeInteraction" style="float:right">닫기</button>
  <p id="interactionTag">고객 상담</p>
  <h2 id="interactionTitle"></h2>
  <p id="interactionText"></p>
  <div id="interactionChoices"></div>
  <p id="interactionFooter"></p>
`;

computer.innerHTML = `
  <button id="closeComputer" style="float:right">닫기</button>
  <h2>춘천신협 통합 전산</h2>
  <div>
    <button class="tab" data-tab="deposit">예금</button>
    <button class="tab" data-tab="loan">여신</button>
    <button class="tab" data-tab="mutual">공제</button>
    <button class="tab" data-tab="member">조합원</button>
  </div>
  <div id="computerContent"></div>
`;

/* =========================================
   게임 상태
========================================= */

let day = 1;
let sales = 0;
let satisfaction = 80;
let minutes = 540;

let yaw = 0;
let pitch = 0;
let locked = false;

const keys = {};

const player = {
  x: 0,
  y: 1.7,
  z: 7
};

let currentScenario = null;
let currentStep = 0;
let currentType = '';

/* =========================================
   Three.js 기본 설정
========================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xb8cbd9);
scene.fog = new THREE.Fog(0xb8cbd9, 18, 45);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(player.x, player.y, player.z);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

game.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x776655, 2));

const sun = new THREE.DirectionalLight(0xffedcf, 2.5);

sun.position.set(-5, 10, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);

scene.add(sun);

/* =========================================
   재질
========================================= */

const material = {
  floor: new THREE.MeshStandardMaterial({ color: 0xb8a68e }),
  wall: new THREE.MeshStandardMaterial({ color: 0xe9e9e5 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x174b70 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x79583d }),
  lightWood: new THREE.MeshStandardMaterial({ color: 0xb18b62 }),
  white: new THREE.MeshStandardMaterial({ color: 0xffffff }),
  black: new THREE.MeshStandardMaterial({ color: 0x202a33 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0x8bb6c9,
    transparent: true,
    opacity: 0.35
  }),
  metal: new THREE.MeshStandardMaterial({ color: 0x92999d }),
  skin: new THREE.MeshStandardMaterial({ color: 0xd8a47e }),
  suit: new THREE.MeshStandardMaterial({ color: 0x263d54 }),
  green: new THREE.MeshStandardMaterial({ color: 0x427b58 })
};

/* =========================================
   오브젝트 생성
========================================= */

function makeBox(w, h, d, mat, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    mat
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;
}

function makeText(text, x, y, z, width = 4) {
  const canvas = document.createElement('canvas');

  canvas.width = 1024;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#173e5c';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 90px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 512, 128);

  const texture = new THREE.CanvasTexture(canvas);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture })
  );

  sprite.scale.set(width, width * 0.25, 1);
  sprite.position.set(x, y, z);

  scene.add(sprite);

  return sprite;
}

/* =========================================
   영업점 내부 구조
========================================= */

makeBox(24, 0.2, 22, material.floor, 0, -0.1, 0);

makeBox(24, 5.5, 0.2, material.wall, 0, 2.7, -11);
makeBox(24, 5.5, 0.2, material.wall, 0, 2.7, 11);

makeBox(0.2, 5.5, 22, material.wall, -12, 2.7, 0);
makeBox(0.2, 5.5, 22, material.wall, 12, 2.7, 0);

makeBox(24, 0.15, 22, material.white, 0, 5.4, 0);

makeText('춘천신협 · 근화지점', 0, 4.2, -10.8, 7);

/* 조명 */

for (let x = -8; x <= 8; x += 4) {
  for (let z = -7; z <= 7; z += 4) {
    makeBox(2, 0.08, 0.6, material.white, x, 5.1, z);

    const light = new THREE.PointLight(0xfff1d9, 0.55, 9);

    light.position.set(x, 4.7, z);
    scene.add(light);
  }
}

/* 창구 */

const counterPositions = [-5, 0, 5];

const counterNames = [
  '예금 · 출자금',
  '대출 상담',
  '공제 상담'
];

counterPositions.forEach((x, i) => {
  makeBox(3.8, 1, 1.2, material.wood, x, 0.55, -2);

  makeBox(3.8, 0.12, 1.3, material.lightWood, x, 1.1, -2);

  makeBox(3.6, 0.8, 0.06, material.glass, x, 1.65, -2.55);

  makeText(counterNames[i], x, 2.3, -2.55, 2.8);

  makeBox(0.9, 0.5, 0.08, material.black, x, 1.7, -2.45);
});

/* 컴퓨터 */

counterPositions.forEach(x => {
  makeBox(0.9, 0.08, 0.6, material.black, x, 1.1, -1.8);
  makeBox(0.8, 0.55, 0.08, material.black, x, 1.5, -1.95);
});

/* 대기석 */

for (let i = 0; i < 4; i++) {
  const x = -8 + i * 2.1;

  makeBox(1.4, 0.2, 0.6, material.blue, x, 0.55, 5.3);
  makeBox(1.4, 0.7, 0.15, material.blue, x, 0.95, 5.55);
}

/* 상담실 */

makeBox(0.12, 2.8, 6, material.white, 8.2, 1.4, -6.5);
makeBox(2.5, 0.2, 1.2, material.wood, 9.7, 0.6, -8.5);

makeText('상담실', 9.7, 2.3, -6.5, 2);

/* ATM */

makeBox(1.4, 2.1, 0.8, material.blue, -8, 1.05, -8.8);
makeBox(0.9, 0.8, 0.06, material.black, -8, 1.55, -8.35);

makeText('ATM', -8, 2.3, -8.5, 1.5);

/* 화분 */

function makePlant(x, z) {
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.23, 0.5, 16),
    material.wood
  );

  pot.position.set(x, 0.25, z);
  scene.add(pot);

  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 12),
      material.green
    );

    leaf.scale.set(0.7, 1.4, 0.7);

    leaf.position.set(
      x + Math.sin(i) * 0.35,
      1 + (i % 3) * 0.15,
      z + Math.cos(i) * 0.35
    );

    scene.add(leaf);
  }
}

makePlant(-10, 8);
makePlant(10, 8);
makePlant(7, -9);

/* =========================================
   캐릭터
========================================= */

function createPerson(x, z, clothes) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28, 0.65, 5, 10),
    clothes
  );

  body.position.y = 1;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 12),
    material.skin
  );

  head.position.y = 1.7;
  group.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    material.black
  );

  hair.position.y = 1.78;
  group.add(hair);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.48, 4, 8),
      clothes
    );

    arm.position.set(side * 0.36, 1.05, 0);
    group.add(arm);

    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.1, 0.55, 4, 8),
      material.black
    );

    leg.position.set(side * 0.14, 0.35, 0);
    group.add(leg);
  }

  group.position.set(x, 0, z);

  scene.add(group);

  return group;
}

const customers = [
  createPerson(-5, -0.2, material.suit),
  createPerson(0, -0.2, material.wood),
  createPerson(5, -0.2, material.blue)
];

customers.forEach((customer, i) => {
  customer.visible = i === 0;
});

/* =========================================
   고객 상담 시나리오
========================================= */

const scenarios = {
  deposit: {
    title: '김영희 고객님 · 예금 상담',
    lines: [
      {
        question: '지난번 정기예금이 만기됐어요. 이번에도 예금하려고 하는데 금리가 어떻게 되나요?',
        answers: [
          ['먼저 자금 규모와 사용 계획을 여쭤보겠습니다.', '이자까지 합쳐서 5천만 원 정도예요.', 6],
          ['현재 금리를 먼저 안내하겠습니다.', '제 상황에 맞는 상품도 있을까요?', 2],
          ['바로 재예치를 진행하겠습니다.', '아직 결정하지 않았는데요.', -4]
        ]
      },
      {
        question: '예치하실 자금 중 가까운 시일 내에 사용하실 금액이 있으실까요?',
        answers: [
          ['자금 사용 시기를 확인한다.', '1년 정도는 사용할 계획이 없어요.', 6],
          ['일부 금액을 남겨둘지 확인한다.', '1천만 원 정도는 남겨두고 싶어요.', 5],
          ['바로 1년 예금을 권유한다.', '중간에 돈이 필요하면 어떻게 하죠?', -3]
        ]
      },
      {
        question: '예금과 출자금의 차이, 예금자보호 여부까지 설명드리겠습니다.',
        answers: [
          ['예금과 출자금의 차이를 정확히 설명한다.', '이제 차이를 이해했어요.', 8],
          ['금리만 안내한다.', '다른 조건은 없나요?', 1],
          ['자금을 나누어 운용하는 방법을 제안한다.', '그렇게 나누면 좋겠네요.', 7]
        ]
      },
      {
        question: '안내드린 조건으로 재예치를 진행해 드릴까요?',
        answers: [
          ['5천만 원 재예치를 진행한다.', '설명을 잘해주셔서 감사합니다. 진행해 주세요.', 10, 'sale'],
          ['우선 4천만 원만 예치한다.', '4천만 원만 먼저 할게요.', 6, 'partial'],
          ['가족과 상의 후 재방문한다.', '오늘은 설명만 듣고 갈게요.', 2]
        ]
      }
    ]
  },

  loan: {
    title: '박정수 고객님 · 아파트 담보대출',
    lines: [
      {
        question: '아파트를 담보로 대출을 받고 싶은데 가능한가요?',
        answers: [
          ['기본 사항부터 확인하겠습니다.', '어떤 내용을 알려드리면 될까요?', 6],
          ['금리부터 안내하겠습니다.', '제가 얼마나 받을 수 있나요?', 2],
          ['담보가 있으니 가능하다고 안내한다.', '심사도 안 했는데 가능한가요?', -6]
        ]
      },
      {
        question: '아파트 시세와 기존 담보대출, 임대차 관계를 확인하겠습니다.',
        answers: [
          ['시세와 선순위 대출을 확인한다.', '시세는 3억 5천만 원이고 대출은 1억 원 있어요.', 8],
          ['시세만 확인한다.', '기존 대출도 확인해야 하나요?', 1],
          ['한도를 먼저 약속한다.', '다른 은행 대출도 있는데요.', -5]
        ]
      },
      {
        question: '재직 기간과 소득, 다른 금융기관 부채도 확인하겠습니다.',
        answers: [
          ['소득과 기존 부채를 함께 확인한다.', '연 소득은 5천만 원이고 신용대출은 2천만 원 있어요.', 8],
          ['소득만 확인한다.', '기존 부채도 확인해야 하는군요.', 2],
          ['소득은 중요하지 않다고 안내한다.', '소득 확인을 안 해도 되나요?', -7]
        ]
      },
      {
        question: '담보평가와 소득, 상환능력 등을 확인한 뒤 심사 결과를 안내하겠습니다.',
        answers: [
          ['필요 서류와 심사 절차를 설명한다.', '서류를 준비해서 다시 방문하겠습니다.', 8],
          ['승인을 확답하지 않고 정식 심사를 안내한다.', '정확하게 확인하고 진행하겠습니다.', 7],
          ['심사 전 승인을 약속한다.', '승인되는 걸로 알고 있겠습니다.', -10]
        ]
      }
    ]
  },

  mutual: {
    title: '최성호 고객님 · 화재공제 상담',
    lines: [
      {
        question: '건물을 가지고 있는데 화재보험을 알아보려고 합니다. 다른 보험에 가입되어 있어요.',
        answers: [
          ['기존 보험 증권을 확인하겠습니다.', '증권을 가지고 있는데 비교해 주실 수 있나요?', 8],
          ['우리 상품이 더 좋다고 설명한다.', '비교도 안 해보고요?', -4],
          ['보험료부터 안내한다.', '보장 내용도 궁금합니다.', 2]
        ]
      },
      {
        question: '건물 용도와 구조, 면적, 임대 여부를 확인하겠습니다.',
        answers: [
          ['건물의 용도와 구조를 확인한다.', '1층은 상가이고 2층은 사무실이에요.', 8],
          ['건물 가격만 확인한다.', '건물 용도도 중요한가요?', 1],
          ['기존 보험과 똑같이 설계한다.', '건물 구조가 다른데 괜찮을까요?', -5]
        ]
      },
      {
        question: '기존 보험의 보장금액과 특약, 자기부담금 등을 비교하겠습니다.',
        answers: [
          ['보장 공백과 중복 여부를 확인한다.', '보험료만 내고 보장은 잘 모르겠어요.', 8],
          ['보험료 절감만 강조한다.', '보장도 괜찮은지 궁금합니다.', 2],
          ['기존 보험 해지를 권한다.', '먼저 비교해 보고 싶습니다.', -8]
        ]
      },
      {
        question: '증권을 검토한 뒤 보장 내용과 보험료를 비교해 드리겠습니다.',
        answers: [
          ['증권을 받아 비교 상담을 진행한다.', '좋습니다. 증권을 보내드릴게요.', 9, 'sale'],
          ['추가 상담을 예약한다.', '다음에 다시 방문하겠습니다.', 5],
          ['비교 없이 바로 가입을 권한다.', '조금 더 생각해 볼게요.', -6]
        ]
      }
    ]
  }
};

/* =========================================
   상담 시스템
========================================= */

function openInteraction(type) {
  currentType = type;
  currentScenario = scenarios[type];
  currentStep = 0;

  customers.forEach((customer, i) => {
    customer.visible = i === (
      type === 'deposit' ? 0 :
      type === 'loan' ? 1 : 2
    );
  });

  interaction.classList.remove('hidden');

  $('interactionTag').textContent = '고객 상담';
  $('interactionTitle').textContent = currentScenario.title;

  renderQuestion();
}

function renderQuestion() {
  const line = currentScenario.lines[currentStep];

  $('interactionText').textContent = line.question;

  $('interactionFooter').textContent =
    `상담 단계 ${currentStep + 1} / ${currentScenario.lines.length}`;

  const holder = $('interactionChoices');

  holder.innerHTML = '';

  line.answers.forEach((answer, index) => {
    const button = document.createElement('button');

    button.className = 'choice';
    button.textContent = answer[0];

    button.onclick = () => chooseAnswer(index);

    holder.appendChild(button);
  });
}

function chooseAnswer(index) {
  const line = currentScenario.lines[currentStep];
  const answer = line.answers[index];

  satisfaction = THREE.MathUtils.clamp(
    satisfaction + answer[2],
    0,
    100
  );

  if (answer[3] === 'sale') {
    if (currentType === 'deposit') sales += 5000;
    if (currentType === 'mutual') sales += 100;
  }

  if (answer[3] === 'partial') {
    sales += 4000;
  }

  updateHud();

  $('interactionText').textContent = '고객: ' + answer[1];
  $('interactionChoices').innerHTML = '';

  currentStep++;

  if (currentStep < currentScenario.lines.length) {
    const next = document.createElement('button');

    next.className = 'choice';
    next.textContent = '다음 상담 진행';

    next.onclick = renderQuestion;

    $('interactionChoices').appendChild(next);

  } else {
    const finish = document.createElement('button');

    finish.className = 'choice';
    finish.textContent = '상담 마무리';

    finish.onclick = () => {
      interaction.classList.add('hidden');

      clockMinutes(12);

      showToast('고객 상담을 마무리했습니다.');
    };

    $('interactionChoices').appendChild(finish);
  }
}

/* =========================================
   전산 시스템
========================================= */

let activeTab = 'deposit';

function openComputer() {
  computer.classList.remove('hidden');
  renderComputer();
}

function renderComputer() {
  document.querySelectorAll('.tab').forEach(button => {
    button.style.background =
      button.dataset.tab === activeTab ? '#bd813e' : '#174b70';
  });

  const root = $('computerContent');

  if (activeTab === 'deposit') {
    root.innerHTML = `
      <h3>예금 신규 및 재예치</h3>

      <label>고객 성명</label>
      <input id="customerName" placeholder="고객 성명">

      <label>예치 금액 (만원)</label>
      <input id="amount" type="number" value="5000">

      <label>금리 (%)</label>
      <input id="rate" type="number" value="3.5" step="0.01">

      <label>예치 기간 (개월)</label>
      <input id="months" type="number" value="12">

      <button id="process">가상 신규 처리</button>

      <div id="result"></div>
    `;

    $('process').onclick = () => {
      const amount = Number($('amount').value);
      const rate = Number($('rate').value);
      const months = Number($('months').value);

      if (!(amount > 0 && rate >= 0 && months > 0)) {
        showToast('입력값을 확인해 주세요.');
        return;
      }

      const interest = amount * rate / 100 * months / 12;

      sales += amount;

      updateHud();

      $('result').innerHTML = `
        <div class="result">
          <strong>가상 신규 처리 완료</strong><br>
          고객명: ${safeText($('customerName').value)}<br>
          예치금액: ${amount.toLocaleString()}만원<br>
          예상 세전 이자: ${interest.toFixed(2)}만원<br>
          <small>교육용 단순 계산입니다.</small>
        </div>
      `;

      clockMinutes(7);
    };
  }

  if (activeTab === 'loan') {
    root.innerHTML = `
      <h3>여신 사전 검토</h3>

      <label>고객 성명</label>
      <input id="loanName" placeholder="고객 성명">

      <label>신청 금액 (만원)</label>
      <input id="loanAmount" type="number" value="8000">

      <label>연 소득 (만원)</label>
      <input id="income" type="number" value="5000">

      <label>기존 부채 (만원)</label>
      <input id="debt" type="number" value="2000">

      <label>담보 시세 (만원)</label>
      <input id="value" type="number" value="35000">

      <button id="review">사전 검토</button>

      <div id="result"></div>
    `;

    $('review').onclick = () => {
      const amount = Number($('loanAmount').value);
      const income = Number($('income').value);
      const debt = Number($('debt').value);
      const value = Number($('value').value);

      if (!(amount > 0 && income >= 0 && debt >= 0 && value >= 0)) {
        showToast('입력값을 확인해 주세요.');
        return;
      }

      const notes = [];

      if (amount > value * 0.7) {
        notes.push('담보가액 대비 신청금액 확인 필요');
      }

      if (income === 0) {
        notes.push('소득증빙 확인 필요');
      }

      if (debt > income * 3) {
        notes.push('기존 부채 및 상환능력 검토 필요');
      }

      if (notes.length === 0) {
        notes.push('추가 확인 항목이 적습니다.');
      }

      $('result').innerHTML = `
        <div class="result">
          <strong>사전 검토 결과</strong><br>
          ${notes.map(safeText).join('<br>')}
          <br><small>
            교육용 예시이며 실제 대출 승인이나 한도 산정 결과가 아닙니다.
            LTV·DSR·선순위·임대차·내규 등을 별도로 확인해야 합니다.
          </small>
        </div>
      `;

      clockMinutes(10);
    };
  }

  if (activeTab === 'mutual') {
    root.innerHTML = `
      <h3>공제 상담 기록</h3>

      <label>고객 성명</label>
      <input id="mutualName" placeholder="고객 성명">

      <label>공제 종류</label>
      <select id="mutualType">
        <option>화재공제</option>
        <option>운전자공제</option>
        <option>간병공제</option>
      </select>

      <label>상담 내용</label>
      <input id="mutualMemo" placeholder="상담 내용">

      <button id="saveMutual">상담 기록 저장</button>

      <div id="result"></div>
    `;

    $('saveMutual').onclick = () => {
      $('result').innerHTML = `
        <div class="result">
          상담 기록을 저장했습니다.<br>
          기존 계약과 보장 내용, 면책사항을 확인하세요.
        </div>
      `;

      clockMinutes(6);
    };
  }

  if (activeTab === 'member') {
    root.innerHTML = `
      <h3>조합원 상담</h3>

      <label>고객 성명</label>
      <input id="memberName" placeholder="고객 성명">

      <label>출자금 (만원)</label>
      <input id="capital" type="number" value="10">

      <label>상담 구분</label>
      <select id="memberType">
        <option>신규 가입</option>
        <option>출자금 추가</option>
        <option>기존 조합원 상담</option>
      </select>

      <button id="saveMember">상담 기록 저장</button>

      <div id="result"></div>
    `;

    $('saveMember').onclick = () => {
      $('result').innerHTML = `
        <div class="result">
          조합원 상담 기록을 저장했습니다.<br>
          출자금과 예금의 차이를 안내하세요.
        </div>
      `;

      clockMinutes(5);
    };
  }
}

function safeText(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

/* =========================================
   버튼 이벤트
========================================= */

$('closeInteraction').addEventListener('click', () => {
  interaction.classList.add('hidden');
});

$('closeComputer').addEventListener('click', () => {
  computer.classList.add('hidden');
});

document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    activeTab = button.dataset.tab;
    renderComputer();
  });
});

/* =========================================
   상호작용 대상
========================================= */

const interactables = [
  {
    name: '예금 창구',
    x: -5,
    z: -2,
    radius: 3,
    action: () => openInteraction('deposit')
  },
  {
    name: '대출 창구',
    x: 0,
    z: -2,
    radius: 3,
    action: () => openInteraction('loan')
  },
  {
    name: '공제 창구',
    x: 5,
    z: -2,
    radius: 3,
    action: () => openInteraction('mutual')
  },
  {
    name: '전산 책상',
    x: 0,
    z: 0,
    radius: 2.5,
    action: openComputer
  },
  {
    name: '상담실',
    x: 9.7,
    z: -8.5,
    radius: 3,
    action: () => showToast('상담실입니다.')
  },
  {
    name: 'ATM',
    x: -8,
    z: -8.8,
    radius: 2.5,
    action: () => showToast('ATM 기기입니다.')
  }
];

/* =========================================
   마우스 및 키보드
========================================= */

renderer.domElement.addEventListener('click', () => {
  if (
    interaction.classList.contains('hidden') &&
    computer.classList.contains('hidden')
  ) {
    renderer.domElement.requestPointerLock();
  }
});

hint.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === renderer.domElement;

  hint.style.display = locked ? 'none' : 'flex';
});

document.addEventListener('mousemove', event => {
  if (!locked) return;

  yaw -= event.movementX * 0.002;
  pitch -= event.movementY * 0.002;

  pitch = THREE.MathUtils.clamp(pitch, -1.2, 1.2);
});

document.addEventListener('keydown', event => {
  keys[event.code] = true;

  if (event.code === 'KeyE' && locked) {
    interact();
  }

  if (event.code === 'Escape') {
    if (!interaction.classList.contains('hidden')) {
      interaction.classList.add('hidden');
    }

    if (!computer.classList.contains('hidden')) {
      computer.classList.add('hidden');
    }
  }
});

document.addEventListener('keyup', event => {
  keys[event.code] = false;
});

/* =========================================
   상호작용 판정
========================================= */

function interact() {
  const forward = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  let target = null;
  let nearest = Infinity;

  for (const item of interactables) {
    const dx = item.x - player.x;
    const dz = item.z - player.z;
    const distance = Math.hypot(dx, dz);

    if (distance > item.radius) continue;

    const direction = new THREE.Vector3(dx, 0, dz).normalize();

    if (forward.dot(direction) > 0.15 && distance < nearest) {
      nearest = distance;
      target = item;
    }
  }

  if (target) {
    document.exitPointerLock();
    target.action();
  } else {
    showToast('상호작용할 대상이 없습니다.');
  }
}

/* =========================================
   플레이어 이동
========================================= */

function movePlayer(delta) {
  if (!locked) return;

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

  const movement = new THREE.Vector3();

  if (keys.KeyW || keys.ArrowUp) movement.add(forward);
  if (keys.KeyS || keys.ArrowDown) movement.sub(forward);
  if (keys.KeyD || keys.ArrowRight) movement.add(right);
  if (keys.KeyA || keys.ArrowLeft) movement.sub(right);

  if (movement.lengthSq() > 0) {
    movement.normalize();

    const speed = keys.ShiftLeft ? 6 : 3.5;

    player.x += movement.x * speed * delta;
    player.z += movement.z * speed * delta;

    player.x = THREE.MathUtils.clamp(player.x, -10.5, 10.5);
    player.z = THREE.MathUtils.clamp(player.z, -9.5, 9.5);
  }

  camera.position.set(player.x, player.y, player.z);

  camera.rotation.order = 'YXZ';
  camera.rotation.set(pitch, yaw, 0);
}

/* =========================================
   HUD 및 시간
========================================= */

function updateHud() {
  $('day').textContent = day;
  $('sales').textContent = sales.toLocaleString();
  $('satisfaction').textContent = satisfaction;
  $('clock').textContent = formatTime();
}

function formatTime() {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return String(hours).padStart(2, '0') + ':' +
    String(mins).padStart(2, '0');
}

function clockMinutes(amount) {
  minutes += amount;

  if (minutes >= 1080) {
    minutes = 540;
    day++;

    showToast('영업일이 종료되었습니다. 다음 영업일을 시작합니다.');
  }

  updateHud();
}

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.style.display = 'block';

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}

/* =========================================
   게임 실행
========================================= */

const gameClock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(gameClock.getDelta(), 0.04);

  movePlayer(delta);

  const forward = new THREE.Vector3(
    -Math.sin(yaw),
    0,
    -Math.cos(yaw)
  );

  let nearest = null;
  let nearestDistance = Infinity;

  for (const item of interactables) {
    const dx = item.x - player.x;
    const dz = item.z - player.z;

    const distance = Math.hypot(dx, dz);

    if (distance > item.radius) continue;

    const direction = new THREE.Vector3(dx, 0, dz).normalize();

    if (
      forward.dot(direction) > 0.15 &&
      distance < nearestDistance
    ) {
      nearest = item;
      nearestDistance = distance;
    }
  }

  prompt.textContent = nearest
    ? `E 키를 눌러 ${nearest.name} 이용`
    : 'WASD 이동 · 마우스 시점 변경 · E 상호작용 · Shift 달리기';

  renderer.render(scene, camera);
}

animate();

/* =========================================
   창 크기 변경 대응
========================================= */

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

updateHud();

console.log('춘천신협 금융창구 시뮬레이터 실행 완료');
