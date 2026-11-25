
(() => {
  "use strict";

  if (window.__CHUNCHEON_CU_V2__) return;
  window.__CHUNCHEON_CU_V2__ = true;

  const $ = id => document.getElementById(id);

  const S = {
    THREE: null,
    scene: null,
    camera: null,
    renderer: null,
    clock: null,

    queue: [],
    people: [],
    current: null,

    started: false,
    loading: false,
    number: 0,

    minutes: 540,
    day: 1,
    sales: 0,
    satisfaction: 100,

    timer: null,
    spawnTimer: null,
    messageTimer: null,
    animationId: null
  };

  const cases = [
    ["김영숙", 63, "여성", "정기예금 신규",
      "농협에서 만기된 5,000만원을 예치하려고 합니다.",
      [
        "고객님의 자금 사용 계획과 예치 기간을 어떻게 확인하시겠습니까?",
        "정기예금과 출자금의 차이를 설명해 보세요.",
        "예금자보호와 세금 관련 유의사항을 어떻게 안내하시겠습니까?"
      ]],
    ["박정호", 45, "남성", "햇살론 상담",
      "직장에 재직 중이며 카드론 상환을 희망합니다.",
      [
        "햇살론 상담 시 가장 먼저 확인할 사항은 무엇인가요?",
        "소득과 재직기간은 어떤 자료로 확인하시겠습니까?",
        "보증심사와 실제 대출 가능 금액에 대해 어떻게 설명하시겠습니까?"
      ]],
    ["이수진", 38, "여성", "주택담보대출",
      "아파트를 담보로 생활안정자금 대출을 문의했습니다.",
      [
        "담보대출 상담에서 가장 먼저 확인할 내용은 무엇인가요?",
        "등기부등본에서 어떤 사항을 확인하시겠습니까?",
        "LTV와 DSR을 고객님께 쉽게 설명해 보세요."
      ]],
    ["최민수", 51, "남성", "예금 재예치",
      "기존 정기예금 8,000만원이 만기되었습니다.",
      [
        "재예치 상담에서 자금 사용 계획을 어떻게 확인하시겠습니까?",
        "예금 기간과 금리를 비교해 설명해 보세요.",
        "조합원에게 추가로 안내할 수 있는 혜택은 무엇인가요?"
      ]],
    ["정미경", 57, "여성", "출자금 상담",
      "신협 조합원 가입과 출자금에 대해 문의했습니다.",
      [
        "출자금이 무엇인지 설명해 보세요.",
        "출자금과 예금의 차이는 무엇인가요?",
        "출자금 가입 전 유의사항을 안내해 보세요."
      ]],
    ["한지영", 32, "여성", "전세자금대출",
      "전세 계약을 앞두고 대출을 문의했습니다.",
      [
        "전세자금대출 상담에서 먼저 확인할 사항은 무엇인가요?",
        "임대차계약서 외에 어떤 서류를 확인하시겠습니까?",
        "보증기관 심사와 대출 실행 절차를 설명해 보세요."
      ]],
    ["오상철", 68, "남성", "정기적금 가입",
      "매월 100만원씩 저축하고 싶어 합니다.",
      [
        "적금 가입 전에 어떤 내용을 확인하시겠습니까?",
        "정기예금과 정기적금의 차이를 설명해 보세요.",
        "중도해지 시 유의사항을 안내해 보세요."
      ]],
    ["윤서연", 29, "여성", "계좌개설 및 모바일뱅킹",
      "신협 계좌를 처음 개설하고 모바일뱅킹을 이용하려 합니다.",
      [
        "신규 계좌 개설 시 확인할 사항은 무엇인가요?",
        "모바일뱅킹 가입 절차를 설명해 보세요.",
        "전자금융사기 예방을 위해 어떤 점을 안내하시겠습니까?"
      ]],
    ["장태식", 55, "남성", "화재공제 상담",
      "상가 건물을 운영하며 화재 관련 보장을 문의했습니다.",
      [
        "화재공제 상담 시 먼저 확인할 사항은 무엇인가요?",
        "건물과 시설물, 집기비품의 차이를 설명해 보세요.",
        "기존 보험 가입 내역을 확인하는 이유는 무엇인가요?"
      ]],
    ["조은희", 72, "여성", "상속 예금 문의",
      "가족의 사망으로 예금 지급 절차를 문의했습니다.",
      [
        "상속 예금 업무에서 우선 확인할 사항은 무엇인가요?",
        "상속인 확인을 위해 어떤 서류가 필요할까요?",
        "상속인 간 의견이 다를 경우 어떻게 처리하시겠습니까?"
      ]],
    ["강민호", 42, "남성", "대출 연장 상담",
      "기존 사업자 담보대출의 만기가 다가와 연장을 문의했습니다.",
      [
        "대출 연장 상담에서 가장 먼저 확인할 사항은 무엇인가요?",
        "최근 사업소득과 금융거래 내역을 확인하는 이유는 무엇인가요?",
        "연장 심사와 원금 일부 상환 가능성을 어떻게 설명하시겠습니까?"
      ]],
    ["배수현", 36, "여성", "체크카드 발급",
      "신협 계좌를 이용하고 있으며 체크카드 발급을 희망합니다.",
      [
        "체크카드 발급 전에 어떤 사항을 확인하시겠습니까?",
        "체크카드와 신용카드의 차이를 설명해 보세요.",
        "카드 분실 및 부정 사용 시 대처 방법을 안내해 보세요."
      ]],
    ["문성호", 59, "남성", "사업자 운전자금",
      "소규모 사업장을 운영하며 운영자금 대출을 문의했습니다.",
      [
        "사업자 대출 상담 시 사업 현황을 어떻게 확인하시겠습니까?",
        "사업자등록증과 소득자료를 확인하는 이유는 무엇인가요?",
        "대출 상환능력을 어떤 기준으로 검토하시겠습니까?"
      ]]
  ];

  // ------------------------------------------
  // 화면 업데이트
  // ------------------------------------------

  function notify(text) {
    const el = $("toast");
    if (!el) return;

    el.textContent = text;
    el.classList.add("show");

    clearTimeout(S.messageTimer);

    S.messageTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 2300);
  }

  function updateClock() {
    if ($("day")) {
      $("day").textContent = `${S.day}일차`;
    }

    if ($("clock")) {
      const h = String(Math.floor(S.minutes / 60)).padStart(2, "0");
      const m = String(S.minutes % 60).padStart(2, "0");
      $("clock").textContent = `${h}:${m}`;
    }

    if ($("sales")) {
      $("sales").textContent = `${S.sales}건`;
    }

    if ($("satisfaction")) {
      $("satisfaction").textContent = `${S.satisfaction}%`;
    }
  }

  function updateQueue() {
    const list = $("queue-list");

    if ($("waiting-count")) {
      $("waiting-count").textContent = `${S.queue.length}명`;
    }

    if (list) {
      list.innerHTML = "";

      if (S.queue.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "대기 고객이 없습니다.";
        empty.style.color = "#81909a";
        empty.style.fontSize = "12px";
        list.appendChild(empty);
      }

      S.queue.forEach((c, i) => {
        const item = document.createElement("div");
        item.className = "queue-item";

        const avatar = document.createElement("div");
        avatar.className = "queue-avatar";
        avatar.textContent = c.gender === "여성" ? "👩" : "👨";

        const detail = document.createElement("div");
        detail.className = "queue-detail";

        const name = document.createElement("strong");
        name.textContent = `${c.name} 고객님`;

        const type = document.createElement("small");
        type.textContent = c.type;

        detail.append(name, type);

        const number = document.createElement("span");
        number.className = "queue-number";
        number.textContent = `${i + 1}번`;

        item.append(avatar, detail, number);
        list.appendChild(item);
      });
    }

    const button = $("call-button");

    if (button) {
      button.disabled =
        !S.started ||
        S.loading ||
        !!S.current ||
        S.queue.length === 0;
    }
  }

  function update() {
    updateClock();
    updateQueue();
  }

  // ------------------------------------------
  // 3D 기본 도구
  // ------------------------------------------

  function mat(color, options = {}) {
    return new S.THREE.MeshStandardMaterial({
      color,
      roughness: 0.75,
      ...options
    });
  }

  function block(parent, x, y, z, w, h, d, color, options = {}) {
    const mesh = new S.THREE.Mesh(
      new S.THREE.BoxGeometry(w, h, d),
      mat(color, options)
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);
    return mesh;
  }

  function ball(parent, x, y, z, sx, sy, sz, color) {
    const mesh = new S.THREE.Mesh(
      new S.THREE.SphereGeometry(1, 18, 14),
      mat(color)
    );

    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    parent.add(mesh);

    return mesh;
  }

  function makeSign(text, x, y, z, w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1024, 256);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 105px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 128);

    const texture = new S.THREE.CanvasTexture(canvas);

    const mesh = new S.THREE.Mesh(
      new S.THREE.PlaneGeometry(w, h),
      new S.THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: S.THREE.DoubleSide
      })
    );

    mesh.position.set(x, y, z);
    S.scene.add(mesh);
  }

  // ------------------------------------------
  // 은행 내부
  // 카메라는 직원 자리 뒤쪽에 위치
  // ------------------------------------------

  function createRoom() {
    const T = S.THREE;
    const scene = S.scene;

    scene.background = new T.Color("#dce7eb");

    // 바닥
    block(scene, 0, -0.25, 2, 22, 0.5, 30, "#c8cbc7");

    // 뒤쪽 벽
    block(scene, 0, 4, 12, 22, 8, 0.3, "#eeeae2");

    // 양쪽 벽
    block(scene, -10.8, 4, 2, 0.3, 8, 20, "#eeeae2");
    block(scene, 10.8, 4, 2, 0.3, 8, 20, "#eeeae2");

    // 뒷벽 신협 간판
    block(scene, 0, 6.0, 11.78, 6.5, 1.1, 0.12, "#164b66");

    makeSign(
      "신협 CREDIT UNION",
      0, 6.0, 11.70,
      5.9, 0.7
    );

    block(scene, 0, 4.5, 11.78, 5.2, 0.5, 0.12, "#ffffff");

    const branchSign = makeSign(
      "춘천신협 근화지점",
      0, 4.5, 11.70,
      4.8, 0.32
    );

    // ======================================
    // 고객 응대용 창구 카운터
    // ======================================

    // 카운터 앞면
    block(
      scene, 0, 0.78, 0.35,
      9.5, 1.45, 0.85,
      "#e8e5dc"
    );

    // 카운터 상판
    block(
      scene, 0, 1.55, 0.2,
      9.8, 0.16, 1.25,
      "#765b43"
    );

    // 카운터 하단 장식
    block(
      scene, 0, 0.3, -0.1,
      9.1, 0.08, 0.04,
      "#b69a78"
    );

    // 창구 번호판
    for (let i = 0; i < 3; i++) {
      const x = -3.2 + i * 3.2;

      block(
        scene, x, 2.2, 0.1,
        0.75, 0.38, 0.1,
        "#174d6c"
      );

      makeSign(
        String(i + 1),
        x, 2.2, 0.16,
        0.45, 0.25
      );
    }

    // ======================================
    // 내 개인 창구 책상
    // 직원 쪽에 설치
    // ======================================

    // 책상 서랍장
    block(
      scene, -2.3, 0.75, -2.0,
      1.2, 1.35, 1.1,
      "#b7a58c"
    );

    block(
      scene, 2.3, 0.75, -2.0,
      1.2, 1.35, 1.1,
      "#b7a58c"
    );

    // 책상 상판
    block(
      scene, 0, 1.48, -1.9,
      6.5, 0.16, 2.0,
      "#765b43"
    );

    // 책상 앞면
    block(
      scene, 0, 0.85, -1.0,
      6.3, 1.1, 0.12,
      "#a58a6b"
    );

    // 모니터 받침
    block(
      scene, 0, 1.65, -2.25,
      0.35, 0.25, 0.3,
      "#353c42"
    );

    // 모니터 본체
    block(
      scene, 0, 2.15, -2.35,
      1.5, 1.0, 0.12,
      "#202a30"
    );

    // 모니터 화면
    block(
      scene, 0, 2.15, -2.275,
      1.32, 0.8, 0.025,
      "#8cb6c5"
    );

    // 모니터 화면 글씨 느낌
    block(
      scene, -0.3, 2.32, -2.25,
      0.45, 0.035, 0.012,
      "#e4f4f5"
    );

    block(
      scene, -0.3, 2.18, -2.25,
      0.75, 0.025, 0.012,
      "#d4e8e9"
    );

    block(
      scene, -0.3, 2.06, -2.25,
      0.65, 0.025, 0.012,
      "#d4e8e9"
    );

    // 키보드
    block(
      scene, 0, 1.61, -0.95,
      1.15, 0.055, 0.4,
      "#343b40"
    );

    // 마우스
    ball(
      scene, 0.9, 1.65, -0.95,
      0.12, 0.06, 0.18,
      "#242a2e"
    );

    // 서류철
    block(
      scene, -1.8, 1.62, -0.9,
      0.75, 0.08, 0.55,
      "#f1f0e8"
    );

    block(
      scene, -1.8, 1.68, -0.9,
      0.75, 0.025, 0.55,
      "#315c72"
    );

    // 전화기
    block(
      scene, 1.8, 1.68, -1.15,
      0.5, 0.13, 0.4,
      "#252b30"
    );

    // 펜
    const pen = block(
      scene, -1.1, 1.7, -0.8,
      0.65, 0.025, 0.035,
      "#1d4260"
    );

    pen.rotation.y = 0.2;

    // ======================================
    // 유리 칸막이
    // ======================================

    const glassMaterial = mat("#b5d9e4", {
      transparent: true,
      opacity: 0.22,
      roughness: 0.15,
      side: T.DoubleSide
    });

    for (let i = 0; i < 3; i++) {
      const pane = new T.Mesh(
        new T.BoxGeometry(2.8, 0.85, 0.035),
        glassMaterial
      );

      pane.position.set(
        -3.0 + i * 3.0,
        2.25,
        0.48
      );

      scene.add(pane);
    }

    // ======================================
    // 대기 의자
    // 중앙 고객 이동 통로 확보
    // ======================================

    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 3; i++) {
        const x = side * 7.1;
        const z = 4.0 + i * 2.0;

        block(
          scene, x, 0.65, z,
          1.35, 0.15, 0.65,
          "#315c72"
        );

        block(
          scene, x, 1.05, z + 0.22,
          1.35, 0.7, 0.15,
          "#315c72"
        );

        for (const sideX of [-0.45, 0.45]) {
          block(
            scene,
            x + sideX, 0.32, z,
            0.08, 0.5, 0.08,
            "#343b40"
          );
        }
      }
    }

    // 번호표 기기
    block(
      scene, 8.8, 1.0, 1.5,
      0.65, 1.5, 0.6,
      "#e8eae7"
    );

    block(
      scene, 8.8, 1.45, 1.18,
      0.4, 0.3, 0.035,
      "#244b60"
    );

    // 화분
    block(
      scene, -9.0, 0.35, 2.0,
      0.65, 0.7, 0.65,
      "#986d50"
    );

    for (let i = 0; i < 5; i++) {
      ball(
        scene,
        -9.0 + Math.sin(i * 1.2) * 0.25,
        1.0 + Math.cos(i) * 0.12,
        2.0 + Math.cos(i * 1.2) * 0.25,
        0.23, 0.4, 0.23,
        "#39845b"
      );
    }

    // 천장 조명
    for (let i = 0; i < 5; i++) {
      const light = new T.PointLight("#fff1d7", 32, 16);

      light.position.set(
        -7 + i * 3.5,
        7.2,
        3
      );

      scene.add(light);

      block(
        scene,
        -7 + i * 3.5,
        7.6,
        3,
        1.7, 0.08, 0.65,
        "#fff5dd"
      );
    }

    scene.add(
      new T.HemisphereLight("#ffffff", "#8a989f", 2)
    );

    const mainLight = new T.DirectionalLight("#fff6e8", 2.2);
    mainLight.position.set(-4, 10, -5);
    scene.add(mainLight);
  }

  // ------------------------------------------
  // 사람 캐릭터
  // ------------------------------------------

  function createPerson(gender = "남성") {
    const T = S.THREE;
    const g = new T.Group();

    const skin = mat("#d8a783");
    const hairColor = gender === "여성" ? "#39251f" : "#28221e";
    const clothesColor = gender === "여성" ? "#9b6d88" : "#526e83";
    const clothes = mat(clothesColor);

    // 다리
    for (const x of [-0.14, 0.14]) {
      block(g, x, 0.55, 0, 0.17, 0.85, 0.18, "#34414a");
      block(g, x, 0.1, 0.1, 0.23, 0.15, 0.38, "#292929");
    }

    // 몸통
    const body = new T.Mesh(
      new T.CapsuleGeometry(0.32, 0.62, 4, 10),
      clothes
    );

    body.position.y = 1.45;
    g.add(body);

    // 목과 얼굴
    ball(g, 0, 2.03, 0, 0.12, 0.16, 0.12, "#d8a783");
    ball(g, 0, 2.38, 0, 0.34, 0.42, 0.3, "#d8a783");

    // 머리
    ball(g, 0, 2.67, -0.02, 0.36, 0.22, 0.32, hairColor);
    ball(g, -0.25, 2.49, -0.01, 0.12, 0.2, 0.25, hairColor);
    ball(g, 0.25, 2.49, -0.01, 0.12, 0.2, 0.25, hairColor);

    // 눈, 눈동자
    for (const x of [-0.12, 0.12]) {
      ball(g, x, 2.42, 0.277, 0.07, 0.07, 0.035, "#ffffff");
      ball(g, x, 2.42, 0.31, 0.033, 0.04, 0.02, "#222222");
    }

    // 코와 입
    ball(g, 0, 2.32, 0.32, 0.05, 0.08, 0.07, "#d8a783");

    const mouth = new T.Mesh(
      new T.BoxGeometry(0.12, 0.025, 0.02),
      mat("#914e48")
    );

    mouth.position.set(0, 2.22, 0.31);
    g.add(mouth);

    // 팔
    for (const side of [-1, 1]) {
      const arm = new T.Mesh(
        new T.CapsuleGeometry(0.09, 0.5, 4, 8),
        clothes
      );

      arm.position.set(side * 0.38, 1.45, 0);
      arm.rotation.z = side * -0.12;
      g.add(arm);

      ball(g, side * 0.4, 1.13, 0.05, 0.1, 0.12, 0.1, "#d8a783");
    }

    return g;
  }

  // ------------------------------------------
  // 고객 생성 및 배치
  // ------------------------------------------

  function createCustomerPerson(c) {
    if (!S.scene || c.person) return;

    const p = createPerson(c.gender);

    const slot = (c.number - 1) % 6;

    const positions = [
      [-5.2, 7.5],
      [-3.1, 8.8],
      [-1.0, 7.5],
      [1.0, 8.8],
      [3.1, 7.5],
      [5.2, 8.8]
    ];

    p.position.set(
      positions[slot][0],
      0,
      positions[slot][1]
    );

    p.userData.walking = false;
    p.userData.leaving = false;
    p.userData.customer = c;

    p.userData.targetX = p.position.x;
    p.userData.targetZ = p.position.z;

    S.scene.add(p);
    S.people.push(p);

    c.person = p;
  }

  function createCustomer() {
    const data = cases[
      Math.floor(Math.random() * cases.length)
    ];

    const c = {
      name: data[0],
      age: data[1],
      gender: data[2],
      type: data[3],
      info: data[4],
      questions: [...data[5]],

      index: 0,
      answers: [],
      number: ++S.number,

      person: null,
      arrived: false
    };

    S.queue.push(c);

    createCustomerPerson(c);
    update();
  }

  // ------------------------------------------
  // 고객 호출
  // ------------------------------------------

  function callCustomer() {
    if (!S.started || S.loading) return;

    if (S.current) {
      notify("현재 고객 상담을 먼저 완료해 줘.");
      return;
    }

    if (S.queue.length === 0) {
      notify("대기 중인 고객이 없어.");
      return;
    }

    const c = S.queue.shift();

    S.current = c;
    update();

    notify(`${c.name} 고객님, 창구로 와 주세요.`);

    if (!c.person) {
      c.arrived = true;
      openConsultation(c);
      return;
    }

    const p = c.person;

    // 고객은 카운터 바깥쪽에서 멈춤
    p.userData.targetX = 0;
    p.userData.targetZ = 2.15;
    p.userData.walking = true;
    p.userData.leaving = false;
  }

  // ------------------------------------------
  // 고객 이동
  // ------------------------------------------

  function movePeople(dt) {
    for (const p of [...S.people]) {
      if (!p.userData.walking) continue;

      const dx = p.userData.targetX - p.position.x;
      const dz = p.userData.targetZ - p.position.z;

      const distance = Math.sqrt(dx * dx + dz * dz);
      const speed = p.userData.leaving ? 3.0 : 2.5;

      if (distance > 0.08) {
        const step = Math.min(distance, speed * dt);

        p.position.x += dx / distance * step;
        p.position.z += dz / distance * step;

        p.position.y =
          Math.abs(Math.sin(performance.now() * 0.009)) * 0.035;

        // 손님이 직원 쪽을 바라보도록 회전
        p.rotation.y = Math.atan2(dx, dz);

      } else {
        p.position.x = p.userData.targetX;
        p.position.z = p.userData.targetZ;
        p.position.y = 0;

        p.userData.walking = false;

        if (p.userData.leaving) {
          S.scene.remove(p);
          S.people = S.people.filter(item => item !== p);

          if (p.userData.customer) {
            p.userData.customer.person = null;
          }

        } else {
          const c = p.userData.customer;

          if (c && S.current === c) {
            c.arrived = true;
            openConsultation(c);
          }
        }
      }
    }
  }

  // ------------------------------------------
  // 렌더링
  // ------------------------------------------

  function animate() {
    if (!S.renderer || !S.scene) return;

    S.animationId = requestAnimationFrame(animate);

    const dt = Math.min(S.clock.getDelta(), 0.05);

    movePeople(dt);

    S.renderer.render(S.scene, S.camera);
  }

  function resize() {
    const host = $("scene-container");

    if (!host || !S.renderer || !S.camera) return;

    const w = host.clientWidth;
    const h = host.clientHeight;

    if (w < 1 || h < 1) return;

    S.camera.aspect = w / h;
    S.camera.updateProjectionMatrix();

    S.renderer.setSize(w, h, false);
  }

  // ------------------------------------------
  // 3D 초기화
  // ------------------------------------------

  async function init3D() {
    if (S.loading || S.renderer) return;

    S.loading = true;
    update();

    try {
      const THREE = await import(
        "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      );

      S.THREE = THREE;

      const host = $("scene-container");

      if (!host) {
        throw new Error("scene-container를 찾을 수 없습니다.");
      }

      S.scene = new THREE.Scene();

      const w = Math.max(host.clientWidth, 1);
      const h = Math.max(host.clientHeight, 1);

      S.camera = new THREE.PerspectiveCamera(
        43,
        w / h,
        0.1,
        100
      );

      // 핵심: 직원 자리에서 카운터를 바라보는 방향
      S.camera.position.set(0, 3.8, -13);
      S.camera.lookAt(0, 1.8, 2.0);

      S.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
      });

      S.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );

      S.renderer.setSize(w, h, false);

      S.renderer.shadowMap.enabled = true;
      S.renderer.outputColorSpace = THREE.SRGBColorSpace;
      S.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      S.renderer.toneMappingExposure = 1.1;

      // 이전 캔버스가 있으면 제거
      host.replaceChildren(S.renderer.domElement);

      S.clock = new THREE.Clock();

      createRoom();

      // 이미 생성된 고객을 3D에 표시
      S.queue.forEach(createCustomerPerson);

      animate();
      resize();

      notify("직원 창구에서 영업을 시작합니다.");

    } catch (error) {
      console.error("3D 초기화 실패:", error);

      notify("3D 화면을 불러오지 못했습니다. 상담 기능은 이용할 수 있습니다.");

    } finally {
      S.loading = false;
      update();
    }
  }

  // ------------------------------------------
  // 상담 패널
  // ------------------------------------------

  function openConsultation(c) {
    if (!c || S.current !== c) return;

    c.arrived = true;

    const queuePanel = $("queue-panel");
    const panel = $("customer-panel");

    if (queuePanel) queuePanel.classList.add("hidden");
    if (panel) panel.classList.remove("hidden");

    if ($("customer-name")) {
      $("customer-name").textContent = `${c.name} 고객님`;
    }

    if ($("customer-number")) {
      $("customer-number").textContent = `${c.number}번`;
    }

    if ($("customer-info")) {
      $("customer-info").replaceChildren();

      const tags = [
        `${c.age}세`,
        c.gender,
        c.type
      ];

      tags.forEach(value => {
        const tag = document.createElement("span");
        tag.className = "info-tag";
        tag.textContent = value;
        $("customer-info").appendChild(tag);
      });
    }

    showQuestion(c);

    notify(`${c.name} 고객님이 창구 앞에 도착했습니다.`);
  }

  function showQuestion(c) {
    if (!c || !c.arrived) return;

    if ($("step-count")) {
      $("step-count").textContent =
        `${c.index + 1} / ${c.questions.length}`;
    }

    if ($("progress-bar")) {
      $("progress-bar").style.width =
        `${(c.index / c.questions.length) * 100}%`;
    }

    if ($("customer-message")) {
      $("customer-message").textContent =
        c.questions[c.index];
    }

    if ($("feedback")) {
      $("feedback").textContent =
        "답변을 작성한 뒤 제출해 주세요.";
    }

    const list = $("answer-list");
    if (!list) return;

    list.replaceChildren();

    const wrapper = document.createElement("div");
    wrapper.className = "written-answer-area";

    const label = document.createElement("label");
    label.htmlFor = "written-answer";
    label.textContent = "상담 답변 작성";

    const textarea = document.createElement("textarea");
    textarea.id = "written-answer";
    textarea.placeholder = "고객님께 안내할 내용을 직접 작성해 주세요.";
    textarea.rows = 5;

    const hint = document.createElement("p");
    hint.className = "answer-hint";
    hint.textContent = "상담 상황에 맞게 구체적으로 작성해 주세요.";

    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "primary-button";
    submit.textContent = "답변 제출";
    submit.addEventListener("click", submitAnswer);

    wrapper.append(label, textarea, hint, submit);
    list.appendChild(wrapper);

    if ($("finish-button")) {
      $("finish-button").classList.add("hidden");
    }
  }

  // ------------------------------------------
  // 답변 제출
  // ------------------------------------------

  function evaluateAnswer(answer) {
    const words = [
      "확인", "안내", "금리", "만기", "소득",
      "재직", "보증", "신용", "상환", "등기",
      "담보", "LTV", "DSR", "예금자보호",
      "출자금", "조합원", "서류", "약관",
      "보장", "계약", "심사", "세금",
      "비과세", "저율과세", "자금", "사용"
    ];

    const hits = words.filter(word => answer.includes(word)).length;

    const lengthScore =
      answer.length >= 100 ? 4 :
      answer.length >= 50 ? 3 :
      answer.length >= 20 ? 2 : 1;

    return Math.min(10, 3 + Math.min(hits, 4) + lengthScore);
  }

  function submitAnswer() {
    const c = S.current;

    if (!c || !c.arrived) return;

    const textarea = $("written-answer");
    if (!textarea) return;

    const answer = textarea.value.trim();

    if (answer.length < 5) {
      if ($("feedback")) {
        $("feedback").textContent =
          "답변을 5글자 이상 작성해 주세요.";
      }

      textarea.focus();
      return;
    }

    c.answers.push(answer);

    const score = evaluateAnswer(answer);

    if (score >= 7) {
      S.satisfaction = Math.min(100, S.satisfaction + 1);
    } else {
      S.satisfaction = Math.max(0, S.satisfaction - 1);
    }

    c.index++;

    if (c.index < c.questions.length) {
      showQuestion(c);

      if ($("feedback")) {
        $("feedback").textContent =
          `답변 저장 완료 · 평가 ${score}/10점`;
      }

      notify("다음 질문으로 넘어갑니다.");

    } else {
      showReview(c, score);
    }

    update();
  }

  function showReview(c, score) {
    if ($("step-count")) {
      $("step-count").textContent =
        `${c.questions.length} / ${c.questions.length}`;
    }

    if ($("progress-bar")) {
      $("progress-bar").style.width = "100%";
    }

    if ($("customer-message")) {
      $("customer-message").textContent =
        "모든 상담 질문을 완료했습니다.";
    }

    const list = $("answer-list");

    if (list) {
      list.replaceChildren();

      const review = document.createElement("div");
      review.className = "review-box";

      const title = document.createElement("h3");
      title.textContent = "상담 완료 평가";

      const p1 = document.createElement("p");
      p1.textContent = `상담 고객: ${c.name}님`;

      const p2 = document.createElement("p");
      p2.textContent = `상담 내용: ${c.type}`;

      const p3 = document.createElement("p");
      p3.textContent = `답변 작성: ${c.answers.length}개`;

      const p4 = document.createElement("p");
      p4.textContent = `마지막 답변 평가: ${score}/10점`;

      review.append(title, p1, p2, p3, p4);
      list.appendChild(review);
    }

    if ($("feedback")) {
      $("feedback").textContent =
        "모든 질문에 답변했습니다. 상담을 완료해 주세요.";
    }

    if ($("finish-button")) {
      $("finish-button").classList.remove("hidden");
    }
  }

  // ------------------------------------------
  // 상담 완료
  // ------------------------------------------

  function finishCustomer() {
    const c = S.current;
    if (!c) return;

    if (c.answers.length !== c.questions.length) {
      notify("아직 답변하지 않은 질문이 있습니다.");
      return;
    }

    $("customer-panel")?.classList.add("hidden");
    $("queue-panel")?.classList.remove("hidden");

    // 고객 퇴장
    if (c.person) {
      c.person.userData.targetX = 6;
      c.person.userData.targetZ = 9.5;
      c.person.userData.walking = true;
      c.person.userData.leaving = true;
    }

    S.sales++;
    S.current = null;

    update();

    notify(`${c.name} 고객님 상담이 완료됐습니다.`);
  }

  // ------------------------------------------
  // 영업 시작
  // ------------------------------------------

  function startGame() {
    if (S.started) return;

    S.started = true;

    if ($("start-screen")) {
      $("start-screen").style.display = "none";
    }

    for (let i = 0; i < 6; i++) {
      createCustomer();
    }

    init3D();

    update();

    notify("영업을 시작합니다. 다음 고객을 호출해 주세요.");

    clearInterval(S.timer);

    S.timer = setInterval(() => {
      S.minutes++;

      if (S.minutes >= 1080) {
        S.minutes = 540;
        S.day++;
        notify(`${S.day}일차 영업을 시작합니다.`);
      }

      updateClock();
    }, 2000);

    clearInterval(S.spawnTimer);

    S.spawnTimer = setInterval(() => {
      if (S.queue.length < 8) {
        createCustomer();
        notify("새로운 고객이 대기했습니다.");
      }
    }, 25000);
  }

  // ------------------------------------------
  // 이벤트 연결
  // ------------------------------------------

  function bindEvents() {
    $("start-button")?.addEventListener("click", startGame);
    $("call-button")?.addEventListener("click", callCustomer);
    $("finish-button")?.addEventListener("click", finishCustomer);

    window.addEventListener("resize", resize);
  }

  // ------------------------------------------
  // 초기 실행
  // ------------------------------------------

  function init() {
    const required = [
      "scene-container",
      "start-screen",
      "start-button",
      "queue-panel",
      "customer-panel",
      "call-button",
      "finish-button",
      "answer-list"
    ];

    const missing = required.filter(id => !$(id));

    if (missing.length) {
      console.error("HTML 요소 누락:", missing);
      return;
    }

    bindEvents();
    update();

    console.log("춘천신협 창구 시뮬레이터 준비 완료");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

})();
