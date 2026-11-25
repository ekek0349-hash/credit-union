
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* =========================================
   기본 설정
========================================= */

const $ = (id) => document.getElementById(id);

const container = $("scene-container");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdce8eb);
scene.fog = new THREE.Fog(0xdce8eb, 18, 35);

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 3.2, 9);
camera.lookAt(0, 1.4, -2);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

/* =========================================
   조명
========================================= */

scene.add(new THREE.HemisphereLight(0xffffff, 0x8999a2, 2.1));

const sunlight = new THREE.DirectionalLight(0xffffff, 2.2);
sunlight.position.set(-5, 10, 7);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
scene.add(sunlight);

/* =========================================
   3D 오브젝트 제작 도구
========================================= */

function material(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness
  });
}

function box(parent, x, y, z, sx, sy, sz, color, radius = 0) {
  const geometry = new THREE.BoxGeometry(sx, sy, sz);
  const mesh = new THREE.Mesh(geometry, material(color));

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

function sphere(parent, x, y, z, sx, sy, sz, color) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 18),
    material(color)
  );

  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  parent.add(mesh);

  return mesh;
}

function cylinder(parent, x, y, z, rt, rb, h, color) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, 16),
    material(color)
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);

  return mesh;
}

/* =========================================
   은행 내부 3D 공간
========================================= */

// 바닥
box(scene, 0, -0.18, -3, 18, 0.35, 19, 0xd8d8d1);

// 뒤쪽 벽
box(scene, 0, 3.1, -12, 18, 6, 0.25, 0xe8eeeb);

// 왼쪽 벽
box(scene, -9, 3, -3, 0.25, 6, 18, 0xe7ecea);

// 오른쪽 벽
box(scene, 9, 3, -3, 0.25, 6, 18, 0xe7ecea);

// 천장
box(scene, 0, 6.2, -3, 18, 0.25, 19, 0xf5f7f5);

// 창문
box(scene, -4.8, 3.3, -11.82, 4.5, 2.2, 0.08, 0x9ecbd5);
box(scene, 0, 3.3, -11.82, 0.08, 2.2, 0.1, 0xffffff);
box(scene, -4.8, 3.3, -11.75, 4.5, 0.08, 0.1, 0xffffff);

// 오른쪽 장식 벽
box(scene, 6.3, 3.1, -11.78, 4.5, 3.1, 0.08, 0xd7e6df);

// 벽면 간판
box(scene, 0, 4.9, -11.65, 5.5, 0.9, 0.18, 0x087b68);

// 창구 책상
box(scene, 0, 0.95, 0.3, 8.5, 1.05, 1.1, 0x9b7555);
box(scene, 0, 1.5, 0.3, 8.7, 0.12, 1.2, 0x654b39);

// 책상 모니터
box(scene, -1.8, 2.15, 0.05, 1.25, 0.85, 0.12, 0x263847);
box(scene, -1.8, 2.15, -0.01, 1.12, 0.68, 0x9fc5cb);
box(scene, -1.8, 1.65, 0.05, 0.15, 0.25, 0x53616a);

// 키보드
box(scene, 0, 1.58, 0.25, 1.1, 0.06, 0.38, 0x313e48);

// 창구 번호판
box(scene, 3, 2.0, -0.05, 1.0, 0.55, 0.12, 0x087b68);

// 번호판 받침
box(scene, 3, 1.7, -0.05, 0.12, 0.3, 0.12, 0x777777);

// 직원 의자
cylinder(scene, 0, 0.4, 2.7, 0.5, 0.5, 0.15, 0x303d4a);
box(scene, 0, 1.1, 3.0, 0.9, 1.3, 0.18, 0x344d5c);

// 대기석 의자 제작
function createChair(x, z) {
  const group = new THREE.Group();

  box(group, 0, 0.65, 0, 0.9, 0.15, 0.85, 0x607d8b);
  box(group, 0, 1.1, -0.34, 0.9, 0.95, 0.13, 0x607d8b);

  for (const dx of [-0.35, 0.35]) {
    for (const dz of [-0.3, 0.3]) {
      cylinder(group, dx, 0.3, dz, 0.045, 0.045, 0.6, 0x4c5961);
    }
  }

  group.position.set(x, 0, z);
  scene.add(group);

  return group;
}

const seatPositions = [
  [-5.2, -3.3],
  [-3.2, -3.3],
  [-1.2, -3.3],
  [1.2, -3.3],
  [3.2, -3.3],
  [5.2, -3.3],
  [-5.2, -6.0],
  [-3.2, -6.0],
  [-1.2, -6.0],
  [1.2, -6.0],
  [3.2, -6.0],
  [5.2, -6.0]
];

seatPositions.forEach(([x, z]) => createChair(x, z));

/* =========================================
   심즈 스타일 3D 사람 캐릭터
========================================= */

const skinColors = [
  0xf3c9a8,
  0xe5b18e,
  0xd49a72,
  0xf0c5a2,
  0xc88c68
];

const hairColors = [
  0x292321,
  0x493326,
  0x171717,
  0x79604a,
  0xaaa09a
];

const clothesColors = [
  0x344c68,
  0x795b79,
  0x527d71,
  0x8a5e49,
  0x3e5260,
  0x777f9b,
  0x9b7751
];

const eyeMaterial = material(0x222222);
const whiteMaterial = material(0xffffff);

function createPerson(name, index, seated = true) {
  const person = new THREE.Group();

  const skin = skinColors[index % skinColors.length];
  const hair = hairColors[index % hairColors.length];
  const clothes = clothesColors[index % clothesColors.length];

  // 몸통
  const torsoY = seated ? 1.0 : 1.05;

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.36, 0.55, 5, 12),
    material(clothes)
  );

  torso.position.y = torsoY;
  torso.castShadow = true;
  person.add(torso);

  // 목
  cylinder(person, 0, seated ? 1.43 : 1.52, 0, 0.13, 0.13, 0.25, skin);

  // 얼굴
  const headY = seated ? 1.8 : 1.95;

  sphere(person, 0, headY, 0, 0.43, 0.52, 0.39, skin);

  // 귀
  sphere(person, -0.42, headY, 0, 0.09, 0.14, 0.09, skin);
  sphere(person, 0.42, headY, 0, 0.09, 0.14, 0.09, skin);

  // 헤어스타일
  const hairstyle = index % 4;

  sphere(
    person,
    0,
    headY + 0.27,
    -0.02,
    0.45,
    hairstyle === 2 ? 0.27 : 0.34,
    0.41,
    hair
  );

  if (hairstyle === 0) {
    sphere(person, 0, headY + 0.15, 0.32, 0.42, 0.16, 0.12, hair);
  } else if (hairstyle === 1) {
    sphere(person, 0, headY + 0.18, -0.25, 0.48, 0.35, 0.28, hair);
    sphere(person, 0.32, headY - 0.1, 0.02, 0.12, 0.38, 0.13, hair);
  } else if (hairstyle === 2) {
    sphere(person, 0, headY + 0.35, 0, 0.3, 0.2, 0.3, hair);
  } else {
    sphere(person, -0.2, headY + 0.18, -0.12, 0.25, 0.35, 0.28, hair);
    sphere(person, 0.2, headY + 0.18, -0.12, 0.25, 0.35, 0.28, hair);
  }

  // 눈
  for (const x of [-0.16, 0.16]) {
    sphere(person, x, headY + 0.03, 0.35, 0.075, 0.085, 0.035, 0xffffff);
    sphere(person, x, headY + 0.03, 0.38, 0.038, 0.05, 0.02, 0x252525);
  }

  // 코
  sphere(person, 0, headY - 0.08, 0.39, 0.075, 0.11, 0.08, skin);

  // 입
  sphere(person, 0, headY - 0.23, 0.36, 0.12, 0.035, 0.025, 0x9b5355);

  // 팔
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.12, 0.48, 4, 8),
      material(clothes)
    );

    arm.position.set(side * 0.43, 1.0, 0);
    arm.rotation.z = side * -0.2;
    person.add(arm);

    sphere(person, side * 0.44, 0.68, 0.04, 0.13, 0.13, 0.13, skin);
  }

  // 다리
  if (seated) {
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 0.42, 4, 8),
        material(0x303a48)
      );

      leg.position.set(side * 0.2, 0.48, 0.23);
      leg.rotation.x = Math.PI / 2.8;
      person.add(leg);

      box(person, side * 0.2, 0.23, 0.55, 0.25, 0.13, 0.48, 0x242b32);
    }
  } else {
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 0.55, 4, 8),
        material(0x303a48)
      );

      leg.position.set(side * 0.2, 0.37, 0);
      person.add(leg);

      box(person, side * 0.2, 0.08, 0.08, 0.28, 0.13, 0.45, 0x242b32);
    }
  }

  person.userData.name = name;
  person.userData.seated = seated;

  return person;
}

/* =========================================
   고객 데이터
========================================= */

const customerCases = [
  {
    purpose: "정기예금 및 출자금",
    category: "수신",
    age: "50대",
    job: "직장인",
    questions: [
      ["정기예금이 만기되어 방문했습니다.", ["기존 예금의 만기 금액과 자금 사용 시기를 확인한다.", "무조건 가장 높은 금리 상품부터 안내한다.", "고객의 자금 계획을 확인하지 않고 재예치한다."], 0],
      ["1년 정도는 자금을 맡겨둘 수 있을 것 같습니다.", ["중도해지 가능성과 만기 시점을 함께 확인한다.", "기간에 관계없이 장기 상품을 권유한다.", "금리만 안내하고 상담을 마친다."], 0],
      ["출자금도 가입하면 좋을까요?", ["출자금의 성격과 배당 가능성, 원금 손실 및 환급 제한을 설명한다.", "예금과 동일하게 원금이 보장된다고 설명한다.", "무조건 가입해야 한다고 안내한다."], 0],
      ["예금자보호도 궁금합니다.", ["현재 적용되는 보호제도와 보호 한도, 적용 대상 여부를 확인해 설명한다.", "모든 금융상품이 동일하게 보호된다고 설명한다.", "출자금도 예금과 똑같이 보호된다고 설명한다."], 0],
      ["배우자 명의로도 가입할 수 있나요?", ["명의자 본인 확인과 자금 출처 및 거래 절차를 안내한다.", "배우자 동의 없이 대신 가입한다.", "명의만 빌려서 가입하라고 안내한다."], 0],
      ["만기 때 자동으로 재예치되나요?", ["자동 재예치 설정 여부와 적용 조건을 확인한다.", "모든 예금이 자동 재예치된다고 안내한다.", "만기일에 방문할 필요가 없다고 단정한다."], 0],
      ["마지막으로 세금 혜택도 알고 싶습니다.", ["조합원 여부와 대상 자격, 잔여 한도 및 해당 연도 적용 기준을 확인한다.", "누구나 비과세가 가능하다고 설명한다.", "세금은 전혀 발생하지 않는다고 설명한다."], 0]
    ]
  },
  {
    purpose: "햇살론 상담",
    category: "여신",
    age: "40대",
    job: "중소기업 근로자",
    questions: [
      ["생활비가 부족해서 정책서민금융 상품을 알아보고 있습니다.", ["필요 자금과 사용 목적, 현재 채무를 확인한다.", "가능 금액부터 확정해서 안내한다.", "신용점수만으로 가능 여부를 단정한다."], 0],
      ["현재 회사에 1년 정도 근무했습니다.", ["재직기간과 건강보험 및 소득 증빙 자료를 확인한다.", "재직기간은 확인하지 않아도 된다고 말한다.", "구두로 근무 사실만 확인한다."], 0],
      ["연봉은 약 3천만 원입니다.", ["소득금액증명원 등 인정되는 소득 자료를 확인한다.", "연봉을 그대로 인정한다고 단정한다.", "소득 자료 없이 한도를 확정한다."], 0],
      ["카드론이 조금 있습니다.", ["전체 금융기관 채무와 금리, 상환 부담을 확인한다.", "카드론은 심사와 관계없다고 설명한다.", "추가 대출부터 권유한다."], 0],
      ["보증은 어떻게 진행되나요?", ["상품별 보증기관과 보증비율, 보증 심사 절차를 설명한다.", "보증서가 무조건 발급된다고 말한다.", "보증기관 확인 없이 승인된다고 안내한다."], 0],
      ["대출 금액은 얼마나 받을 수 있나요?", ["보증 및 내부 심사, 소득과 부채에 따라 달라진다고 안내한다.", "최대 한도를 확정해서 약속한다.", "다른 고객의 한도를 그대로 적용한다."], 0],
      ["필요한 서류를 알려주세요.", ["재직·소득·사업 관련 서류와 신분 확인 자료를 상품 기준에 맞춰 안내한다.", "서류 없이 바로 실행할 수 있다고 말한다.", "서류를 확인하지 않고 신청을 진행한다."], 0]
    ]
  },
  {
    purpose: "정기적금 및 체크카드",
    category: "수신",
    age: "30대",
    job: "회사원",
    questions: [
      ["매달 100만 원씩 저축하고 싶습니다.", ["월 불입 가능 금액과 저축 목적을 확인한다.", "최대 금액으로 가입부터 진행한다.", "중도해지 가능성을 설명하지 않는다."], 0],
      ["1년 정도 생각하고 있습니다.", ["가입 기간별 금리와 만기 시점을 안내한다.", "기간별 차이는 없다고 설명한다.", "고객 동의 없이 기간을 변경한다."], 0],
      ["우대금리를 받으려면 어떻게 해야 하나요?", ["우대조건과 실적 인정 기준, 적용 시점을 설명한다.", "조건을 충족하지 않아도 우대금리를 적용한다고 말한다.", "우대조건을 생략한다."], 0],
      ["체크카드도 같이 만들 수 있나요?", ["발급 조건과 연결 계좌, 이용 혜택을 안내한다.", "필요 여부를 묻지 않고 발급한다.", "신용카드와 동일하다고 설명한다."], 0],
      ["휴대폰으로도 관리하고 싶어요.", ["모바일뱅킹 가입과 본인인증 절차를 안내한다.", "비밀번호를 대신 설정한다.", "앱 사용법은 안내하지 않는다."], 0],
      ["자동이체도 설정해 주세요.", ["출금 계좌와 이체일, 잔액 부족 시 유의사항을 확인한다.", "임의로 이체일을 설정한다.", "출금 계좌 확인 없이 등록한다."], 0],
      ["가입 전에 최종 금리를 확인하고 싶습니다.", ["당일 상품 설명서와 적용 가능한 우대조건을 최종 확인한다.", "이전 안내 금리가 무조건 적용된다고 말한다.", "금리를 확인하지 않고 가입한다."], 0]
    ]
  },
  {
    purpose: "전세자금대출",
    category: "여신",
    age: "30대",
    job: "직장인",
    questions: [
      ["전세 계약을 앞두고 대출을 알아보고 있습니다.", ["보증금과 계약 일정, 주택 유형을 확인한다.", "계약 전이라도 대출을 확정한다.", "주택 유형은 확인하지 않는다."], 0],
      ["전세보증금은 2억 원입니다.", ["본인 자금과 필요한 대출 금액을 확인한다.", "보증금 전액을 대출할 수 있다고 안내한다.", "보증금만으로 한도를 확정한다."], 0],
      ["아파트가 아니라 다가구주택입니다.", ["등기사항과 선순위 권리, 임대차 현황을 확인한다.", "다가구주택은 무조건 가능하다고 설명한다.", "건물 권리관계를 확인하지 않는다."], 0],
      ["집주인에게 확인할 내용도 있나요?", ["임대인 정보와 소유권, 계약 관련 확인 사항을 안내한다.", "임대인 확인은 필요 없다고 말한다.", "계약서만 있으면 충분하다고 단정한다."], 0],
      ["제 소득은 3천만 원 정도입니다.", ["소득 증빙과 기존 부채, 상환 능력을 확인한다.", "소득만으로 한도를 확정한다.", "부채는 심사와 관계없다고 설명한다."], 0],
      ["보증기관 심사도 필요한가요?", ["취급 상품별 보증기관과 보증 심사 조건을 안내한다.", "보증 심사 없이 실행된다고 말한다.", "보증기관을 확인하지 않는다."], 0],
      ["언제까지 신청해야 하나요?", ["상품별 신청 기한과 잔금일, 서류 준비 일정을 확인한다.", "잔금일 이후에도 동일하다고 설명한다.", "기한을 확인하지 않고 안내한다."], 0]
    ]
  },
  {
    purpose: "화재공제 상담",
    category: "공제",
    age: "50대",
    job: "자영업자",
    questions: [
      ["가게 화재보험을 새로 알아보고 있습니다.", ["건물 소유 여부와 업종, 시설 및 집기 현황을 확인한다.", "면적만으로 보험료를 확정한다.", "보장 내용은 설명하지 않는다."], 0],
      ["건물은 제 소유입니다.", ["건물 구조와 사용 용도, 가입 금액 산정 기준을 확인한다.", "건물 가격과 관계없이 가입한다.", "건물 소유 여부는 중요하지 않다고 말한다."], 0],
      ["내부 집기와 재고도 보장되나요?", ["시설·집기·재고 등 목적물별 보장 가능 여부를 확인한다.", "모든 물품이 자동으로 보장된다고 설명한다.", "건물만 가입해도 전부 보장된다고 말한다."], 0],
      ["현재 다른 보험에도 가입되어 있습니다.", ["기존 보험증권과 담보, 가입 금액을 비교한다.", "기존 계약은 해지하라고 권유한다.", "중복 보장은 무조건 이득이라고 설명한다."], 0],
      ["화재가 나면 어떤 보상을 받을 수 있나요?", ["가입 담보와 사고 원인, 면책 사항 및 보상 기준을 안내한다.", "어떤 사고든 전액 보상된다고 설명한다.", "면책 사항을 생략한다."], 0],
      ["보험료를 줄일 방법도 있나요?", ["필요한 보장과 가입 금액을 점검해 적절한 설계를 제안한다.", "보장 금액을 무조건 낮춘다.", "필요한 담보를 모두 삭제한다."], 0],
      ["가입 전에 확인할 게 있을까요?", ["약관과 고지 사항, 목적물 정보 및 보장 범위를 최종 확인한다.", "고지 의무는 중요하지 않다고 말한다.", "내용 확인 없이 서명을 받는다."], 0]
    ]
  },
  {
    purpose: "대출 연장 및 상환 상담",
    category: "여신",
    age: "40대",
    job: "사업자",
    questions: [
      ["기존 대출 만기가 다가와 방문했습니다.", ["대출 만기일과 현재 잔액, 상환 이력을 확인한다.", "기존 조건으로 자동 연장된다고 말한다.", "만기일을 확인하지 않는다."], 0],
      ["최근 매출이 조금 줄었습니다.", ["최근 매출과 소득, 사업 운영 상황을 확인한다.", "매출 감소는 심사와 관계없다고 말한다.", "이전 소득만으로 판단한다."], 0],
      ["일부 원금을 갚으면 연장에 유리할까요?", ["일부 상환 시 잔액과 상환 부담, 연장 심사 영향을 검토한다.", "무조건 전액 상환하라고 한다.", "상환해도 아무 영향이 없다고 단정한다."], 0],
      ["다른 금융기관 대출도 있습니다.", ["전체 채무와 연체 여부, 상환 능력을 확인한다.", "다른 금융기관 채무는 무시한다.", "추가 대출부터 권유한다."], 0],
      ["담보가치도 다시 확인하나요?", ["상품과 담보 조건에 따라 권리관계 및 담보가치를 검토한다고 안내한다.", "담보는 다시 확인하지 않는다고 말한다.", "과거 평가액을 무조건 적용한다."], 0],
      ["금리가 변경될 수도 있나요?", ["연장 시 적용 금리와 조건 변경 가능성을 확인한다.", "기존 금리가 그대로 유지된다고 단정한다.", "금리 변동 가능성을 설명하지 않는다."], 0],
      ["필요 서류를 준비하겠습니다.", ["소득·사업·담보 관련 서류와 내부 심사 필요 자료를 안내한다.", "서류 없이 연장된다고 말한다.", "서류 안내 없이 상담을 마친다."], 0]
    ]
  },
  {
    purpose: "비과세 및 예금 상담",
    category: "수신",
    age: "60대",
    job: "은퇴자",
    questions: [
      ["목돈을 예금으로 맡기고 싶습니다.", ["자금 규모와 예치 기간, 사용 계획을 확인한다.", "금액만 확인하고 상품을 정한다.", "고객의 자금 계획을 묻지 않는다."], 0],
      ["세금 혜택이 있는 상품이 궁금합니다.", ["비과세종합저축과 신협 예탁금 세제 혜택의 차이를 설명한다.", "두 제도가 완전히 동일하다고 설명한다.", "누구나 비과세라고 말한다."], 0],
      ["저도 비과세 대상인가요?", ["연령 등 대상 자격과 관련 법령의 적용 요건을 확인한다.", "나이와 관계없이 가능하다고 말한다.", "신분 확인 없이 대상이라고 안내한다."], 0],
      ["이미 다른 금융기관에서 혜택을 받고 있습니다.", ["기존 가입 내역과 잔여 한도, 금융기관별 이용 현황을 확인한다.", "기존 이용 내역은 관계없다고 말한다.", "한도를 확인하지 않는다."], 0],
      ["조합원 가입도 해야 하나요?", ["조합원 여부와 예탁금 세제 적용 요건을 구분해 설명한다.", "출자금만 내면 모든 세금이 면제된다고 말한다.", "조합원 여부는 확인하지 않는다."], 0],
      ["일반과세와 얼마나 차이가 나나요?", ["예치 금액과 기간, 적용 세율을 확인해 예상 이자와 세금을 비교한다.", "정확한 금액 확인 없이 절세액을 약속한다.", "일반과세는 설명하지 않는다."], 0],
      ["오늘 가입할 수 있을까요?", ["해당 연도 기준과 대상 자격, 잔여 한도 및 상품 조건을 최종 확인한다.", "확인 없이 비과세 가입을 확정한다.", "필요한 확인 절차를 생략한다."], 0]
    ]
  },
  {
    purpose: "상속 예금 및 계좌 업무",
    category: "조합원",
    age: "60대",
    job: "개인 고객",
    questions: [
      ["가족이 돌아가셔서 예금을 정리하려고 합니다.", ["상속인 관계와 예금 명의자, 거래 목적을 확인한다.", "가족이면 누구나 해지할 수 있다고 말한다.", "일반 해지처럼 처리한다."], 0],
      ["상속인은 배우자와 자녀 두 명입니다.", ["상속인 전원의 관계와 상속 비율 및 관련 서류를 확인한다.", "배우자에게 전액 지급한다고 말한다.", "상속인 확인을 생략한다."], 0],
      ["가족관계증명서가 필요할까요?", ["상세 가족관계증명서 등 내부 기준에 맞는 서류를 안내한다.", "구두 확인만으로 처리한다고 말한다.", "서류가 필요 없다고 단정한다."], 0],
      ["상속인 중 한 명이 외국에 있습니다.", ["위임장과 본인 확인, 해외 서류의 인증 요건을 확인한다.", "다른 상속인이 대신 서명하면 된다고 말한다.", "위임 절차를 생략한다."], 0],
      ["예금 잔액을 먼저 확인하고 싶습니다.", ["상속 관련 조회 절차와 필요한 서류를 안내한다.", "개인정보 확인 없이 잔액을 알려준다.", "상속인 여부를 확인하지 않는다."], 0],
      ["세금 문제도 있을까요?", ["상속 관련 세금은 별도 세무 확인이 필요하다고 안내한다.", "세금이 전혀 없다고 단정한다.", "세금 관련 안내를 생략한다."], 0],
      ["필요한 서류를 정리해 주세요.", ["상속인 신분증과 가족관계 서류, 위임 관련 서류 등을 상황에 맞춰 안내한다.", "서류 한 장이면 무조건 가능하다고 말한다.", "확인 없이 처리 가능하다고 안내한다."], 0]
    ]
  }
];

const names = [
  "김영숙", "박정호", "이선희", "최민수",
  "정미경", "강현우", "윤정자", "한지훈",
  "서영희", "임성호", "조은정", "오상철",
  "배정희", "문성진", "신미자", "장현수"
];

const customerAvatars = ["👨", "👩", "👨‍🦳", "👩‍🦳"];

let customerId = 0;
let waitingCustomers = [];
let activeCustomer = null;
let currentStep = 0;

let gameStarted = false;
let gameMinutes = 9 * 60;
let day = 1;
let sales = 0;
let satisfaction = 100;
let completed = 0;
let spawnTimer = 0;

const clockSpeed = 3.5;
let lastTime = 0;

const clockElement = $("clock");

/* =========================================
   고객 생성 및 대기열
========================================= */

function shuffledCases() {
  const result = [...customerCases];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

let caseDeck = shuffledCases();
let caseIndex = 0;

function getNextCase() {
  if (caseIndex >= caseDeck.length) {
    caseDeck = shuffledCases();
    caseIndex = 0;
  }

  return caseDeck[caseIndex++];
}

function createCustomer() {
  const id = ++customerId;
  const data = getNextCase();
  const name = names[(id - 1) % names.length];

  const customer = {
    id,
    name,
    data,
    age: data.age,
    job: data.job,
    number: id,
    status: "waiting",
    group: null,
    target: null,
    speed: 1.7 + Math.random() * 0.3,
    avatar: customerAvatars[id % customerAvatars.length]
  };

  const seatIndex = (id - 1) % seatPositions.length;
  const [x, z] = seatPositions[seatIndex];

  customer.group = createPerson(name, id, true);
  customer.group.position.set(x, 0, z);
  customer.target = new THREE.Vector3(x, 0, z);

  scene.add(customer.group);

  return customer;
}

function addCustomer() {
  if (waitingCustomers.length >= 9) return;

  const customer = createCustomer();
  waitingCustomers.push(customer);

  renderQueue();
}

function renderQueue() {
  $("waiting-count").textContent = `${waitingCustomers.length}명`;

  $("queue-list").innerHTML = "";

  waitingCustomers.forEach((customer, index) => {
    const item = document.createElement("div");
    item.className = "queue-item";

    item.innerHTML = `
      <div class="queue-avatar">${customer.avatar}</div>
      <div class="queue-detail">
        <strong>${customer.name}</strong>
        <small>${customer.data.purpose}</small>
      </div>
      <span class="queue-number">${index + 1}번</span>
    `;

    $("queue-list").appendChild(item);
  });

  $("call-button").disabled =
    !gameStarted ||
    !!activeCustomer ||
    waitingCustomers.length === 0;
}

/* =========================================
   고객 호출 및 이동
========================================= */

function callNextCustomer() {
  if (!gameStarted || activeCustomer || waitingCustomers.length === 0) {
    return;
  }

  const customer = waitingCustomers.shift();

  activeCustomer = customer;
  customer.status = "walking";

  // 앉아 있는 캐릭터를 서 있는 캐릭터로 교체
  scene.remove(customer.group);

  customer.group = createPerson(customer.name, customer.id, false);
  customer.group.position.set(
    customer.target.x,
    0,
    customer.target.z
  );

  scene.add(customer.group);

  // 창구 앞으로 이동
  customer.target.set(0, 0, -0.85);

  renderQueue();

  $("customer-panel").classList.remove("hidden");
  $("customer-name").textContent = customer.name;
  $("customer-number").textContent = `${customer.number}번`;
  $("customer-info").innerHTML = `
    <span class="info-tag">${customer.age}</span>
    <span class="info-tag">${customer.job}</span>
    <span class="info-tag">${customer.data.category}</span>
    <span class="info-tag">${customer.data.purpose}</span>
  `;

  $("customer-message").textContent =
    "고객이 창구로 이동하고 있습니다. 잠시 기다려 주세요.";

  $("answer-list").innerHTML = "";
  $("feedback").textContent = "";

  $("finish-button").classList.add("hidden");

  showToast(`${customer.number}번 ${customer.name} 고객을 호출했습니다.`);
}

function updateCustomerMovement(delta) {
  if (!activeCustomer || activeCustomer.status !== "walking") return;

  const person = activeCustomer.group;
  const target = activeCustomer.target;

  const dx = target.x - person.position.x;
  const dz = target.z - person.position.z;

  const distance = Math.sqrt(dx * dx + dz * dz);

  if (distance < 0.08) {
    person.position.x = target.x;
    person.position.z = target.z;

    activeCustomer.status = "consulting";

    currentStep = 0;

    showQuestion();

    showToast(`${activeCustomer.name} 고객이 창구에 도착했습니다.`);
    return;
  }

  const move = Math.min(
    activeCustomer.speed * delta,
    distance
  );

  person.position.x += (dx / distance) * move;
  person.position.z += (dz / distance) * move;

  person.rotation.y = Math.atan2(dx, dz);

  // 걷는 듯한 움직임
  person.position.y = Math.abs(Math.sin(performance.now() * 0.008)) * 0.035;
}

/* =========================================
   상담 진행
========================================= */

function showQuestion() {
  if (!activeCustomer) return;

  const questions = activeCustomer.data.questions;
  const question = questions[currentStep];

  if (!question) return;

  $("customer-name").textContent = activeCustomer.name;
  $("step-count").textContent = `${currentStep + 1} / ${questions.length}`;

  $("progress-bar").style.width =
    `${((currentStep + 1) / questions.length) * 100}%`;

  $("customer-message").textContent =
    `"${question[0]}"`;

  $("answer-list").innerHTML = "";
  $("feedback").textContent = "";

  question[1].forEach((answer, index) => {
    const button = document.createElement("button");

    button.className = "answer-button";
    button.textContent = `${index + 1}. ${answer}`;

    button.addEventListener("click", () => {
      selectAnswer(index);
    });

    $("answer-list").appendChild(button);
  });

  if (currentStep === questions.length - 1) {
    $("finish-button").classList.add("hidden");
  }
}

function selectAnswer(selectedIndex) {
  if (!activeCustomer || activeCustomer.status !== "consulting") return;

  const question = activeCustomer.data.questions[currentStep];
  const correctIndex = question[2];

  const buttons = $("answer-list").querySelectorAll("button");

  buttons.forEach((button) => {
    button.disabled = true;
  });

  if (selectedIndex === correctIndex) {
    satisfaction = Math.min(100, satisfaction + 1);
    $("feedback").textContent =
      "좋은 상담입니다. 고객이 안내 내용을 이해했습니다.";
  } else {
    satisfaction = Math.max(0, satisfaction - 5);
    $("feedback").textContent =
      "안내 내용을 다시 확인할 필요가 있습니다. 실제 업무에서는 관련 규정과 상품 기준을 확인하세요.";
  }

  updateHUD();

  const isLast =
    currentStep === activeCustomer.data.questions.length - 1;

  const nextButton = document.createElement("button");
  nextButton.className = "primary-button";

  if (isLast) {
    nextButton.textContent = "상담 내용 확인";
    nextButton.addEventListener("click", () => {
      $("answer-list").innerHTML = "";
      $("customer-message").textContent =
        "모든 상담 단계가 완료되었습니다. 상담 내용을 확인하고 고객 응대를 마무리해 주세요.";

      $("feedback").textContent =
        "상담 완료 버튼을 누르면 고객이 창구를 떠나고 다음 고객을 호출할 수 있습니다.";

      $("finish-button").classList.remove("hidden");
    });
  } else {
    nextButton.textContent = "다음 질문으로 이동";
    nextButton.addEventListener("click", () => {
      currentStep++;
      showQuestion();
    });
  }

  $("answer-list").appendChild(nextButton);
}

/* =========================================
   상담 완료
========================================= */

function finishConsultation() {
  if (!activeCustomer || activeCustomer.status !== "consulting") return;

  const person = activeCustomer.group;

  activeCustomer.status = "leaving";
  activeCustomer.target.set(
    -5.5 + Math.random() * 11,
    0,
    -7.5
  );

  person.rotation.y = Math.PI;

  const customerName = activeCustomer.name;

  sales += 100000;
  completed++;

  $("customer-panel").classList.add("hidden");
  $("finish-button").classList.add("hidden");

  showToast(`${customerName} 고객 상담이 완료되었습니다.`);

  activeCustomer = null;

  updateHUD();
  renderQueue();

  // 고객 퇴장 애니메이션을 위한 별도 처리
  leavingCustomers.push({
    group: person,
    target: new THREE.Vector3(
      -5.5 + Math.random() * 11,
      0,
      -7.5
    )
  });
}

const leavingCustomers = [];

/* =========================================
   HUD 및 시간
========================================= */

function updateHUD() {
  const hours = Math.floor(gameMinutes / 60);
  const minutes = Math.floor(gameMinutes % 60);

  clockElement.textContent =
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  $("day").textContent = `${day}일차`;
  $("sales").textContent = `${sales.toLocaleString("ko-KR")}원`;
  $("satisfaction").textContent = `${satisfaction}%`;
}

function updateTime(delta) {
  if (!gameStarted) return;

  gameMinutes += delta * clockSpeed;

  if (gameMinutes >= 17 * 60) {
    gameMinutes = 9 * 60;
    day++;
    showToast(`${day}일차 영업이 시작되었습니다.`);
  }

  updateHUD();
}

/* =========================================
   신규 고객 자동 방문
========================================= */

function updateSpawn(delta) {
  if (!gameStarted) return;

  spawnTimer += delta;

  if (spawnTimer >= 12) {
    spawnTimer = 0;

    if (waitingCustomers.length < 7) {
      addCustomer();
    }
  }
}

/* =========================================
   토스트 메시지
========================================= */

let toastTimeout = null;

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

/* =========================================
   게임 시작
========================================= */

function startGame() {
  if (gameStarted) return;

  gameStarted = true;

  $("start-screen").classList.add("hidden");

  gameMinutes = 9 * 60;

  // 게임 시작과 동시에 대기 고객 생성
  for (let i = 0; i < 6; i++) {
    addCustomer();
  }

  updateHUD();
  renderQueue();

  showToast("영업을 시작합니다. 첫 번째 고객을 호출하세요.");
}

/* =========================================
   버튼 연결
========================================= */

$("start-button").addEventListener("click", startGame);
$("call-button").addEventListener("click", callNextCustomer);
$("finish-button").addEventListener("click", finishConsultation);

/* =========================================
   렌더링 및 애니메이션
========================================= */

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  updateCustomerMovement(delta);
  updateTime(delta);
  updateSpawn(delta);

  // 퇴장 고객 이동
  for (let i = leavingCustomers.length - 1; i >= 0; i--) {
    const customer = leavingCustomers[i];
    const person = customer.group;
    const target = customer.target;

    const dx = target.x - person.position.x;
    const dz = target.z - person.position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.15) {
      scene.remove(person);
      leavingCustomers.splice(i, 1);
      continue;
    }

    const move = Math.min(delta * 2.0, distance);

    person.position.x += (dx / distance) * move;
    person.position.z += (dz / distance) * move;
  }

  renderer.render(scene, camera);
}

animate();

/* =========================================
   화면 크기 변경 대응
========================================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
});
