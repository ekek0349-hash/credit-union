
(() => {
  "use strict";

  // 중복 실행 방지
  if (window.__CHUNCHEON_CU_GAME__) return;
  window.__CHUNCHEON_CU_GAME__ = true;

  const $ = (id) => document.getElementById(id);

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

    questionCount: 3
  };

  // ==========================================
  // 고객 상담 데이터
  // ==========================================

  const cases = [
    {
      name: "김영숙",
      age: 63,
      gender: "여성",
      type: "정기예금 신규",
      info: "농협에서 만기된 5,000만원을 예치하려고 합니다.",
      questions: [
        "고객님의 자금 사용 계획과 예치 기간을 어떻게 확인하시겠습니까?",
        "정기예금과 출자금의 차이를 설명해 보세요.",
        "예금자보호와 세금 관련 유의사항을 어떻게 안내하시겠습니까?"
      ]
    },
    {
      name: "박정호",
      age: 45,
      gender: "남성",
      type: "햇살론 상담",
      info: "직장에 재직 중이며 카드론 상환을 희망합니다.",
      questions: [
        "햇살론 상담 시 가장 먼저 확인할 사항은 무엇인가요?",
        "소득과 재직기간은 어떤 자료로 확인하시겠습니까?",
        "보증심사와 실제 대출 가능 금액에 대해 어떻게 설명하시겠습니까?"
      ]
    },
    {
      name: "이수진",
      age: 38,
      gender: "여성",
      type: "주택담보대출",
      info: "아파트를 담보로 생활안정자금 대출을 문의했습니다.",
      questions: [
        "담보대출 상담에서 가장 먼저 확인할 내용은 무엇인가요?",
        "등기부등본에서 어떤 사항을 확인하시겠습니까?",
        "LTV와 DSR을 고객님께 쉽게 설명해 보세요."
      ]
    },
    {
      name: "최민수",
      age: 51,
      gender: "남성",
      type: "예금 재예치",
      info: "기존 정기예금 8,000만원이 만기되었습니다.",
      questions: [
        "재예치 상담에서 자금 사용 계획을 어떻게 확인하시겠습니까?",
        "예금 기간과 금리를 비교해 설명해 보세요.",
        "조합원에게 추가로 안내할 수 있는 혜택은 무엇인가요?"
      ]
    },
    {
      name: "정미경",
      age: 57,
      gender: "여성",
      type: "출자금 상담",
      info: "신협 조합원 가입과 출자금에 대해 문의했습니다.",
      questions: [
        "출자금이 무엇인지 설명해 보세요.",
        "출자금과 예금의 차이는 무엇인가요?",
        "출자금 가입 전 유의사항을 안내해 보세요."
      ]
    },
    {
      name: "한지영",
      age: 32,
      gender: "여성",
      type: "전세자금대출",
      info: "전세 계약을 앞두고 대출을 문의했습니다.",
      questions: [
        "전세자금대출 상담에서 먼저 확인할 사항은 무엇인가요?",
        "임대차계약서 외에 어떤 서류를 확인하시겠습니까?",
        "보증기관 심사와 대출 실행 절차를 설명해 보세요."
      ]
    },
    {
      name: "오상철",
      age: 68,
      gender: "남성",
      type: "정기적금 가입",
      info: "매월 100만원씩 저축하고 싶어 합니다.",
      questions: [
        "적금 가입 전에 어떤 내용을 확인하시겠습니까?",
        "정기예금과 정기적금의 차이를 설명해 보세요.",
        "중도해지 시 유의사항을 안내해 보세요."
      ]
    },
    {
      name: "윤서연",
      age: 29,
      gender: "여성",
      type: "계좌개설 및 모바일뱅킹",
      info: "신협 계좌를 처음 개설하고 모바일뱅킹을 이용하려 합니다.",
      questions: [
        "신규 계좌 개설 시 확인할 사항은 무엇인가요?",
        "모바일뱅킹 가입 절차를 설명해 보세요.",
        "전자금융사기 예방을 위해 어떤 점을 안내하시겠습니까?"
      ]
    },
    {
      name: "장태식",
      age: 55,
      gender: "남성",
      type: "화재공제 상담",
      info: "상가 건물을 운영하며 화재 관련 보장을 문의했습니다.",
      questions: [
        "화재공제 상담 시 먼저 확인할 사항은 무엇인가요?",
        "건물과 시설물, 집기비품의 차이를 설명해 보세요.",
        "기존 보험 가입 내역을 확인하는 이유는 무엇인가요?"
      ]
    },
    {
      name: "조은희",
      age: 72,
      gender: "여성",
      type: "상속 예금 문의",
      info: "가족의 사망으로 예금 지급 절차를 문의했습니다.",
      questions: [
        "상속 예금 업무에서 우선 확인할 사항은 무엇인가요?",
        "상속인 확인을 위해 어떤 서류가 필요할까요?",
        "상속인 간 의견이 다를 경우 어떻게 처리하시겠습니까?"
      ]
    },
    {
      name: "강민호",
      age: 42,
      gender: "남성",
      type: "대출 연장 상담",
      info: "기존 사업자 담보대출의 만기가 다가와 연장을 문의했습니다.",
      questions: [
        "대출 연장 상담에서 가장 먼저 확인할 사항은 무엇인가요?",
        "최근 사업소득과 금융거래 내역을 확인하는 이유는 무엇인가요?",
        "연장 심사와 원금 일부 상환 가능성을 어떻게 설명하시겠습니까?"
      ]
    },
    {
      name: "배수현",
      age: 36,
      gender: "여성",
      type: "체크카드 발급",
      info: "신협 계좌를 이용하고 있으며 체크카드 발급을 희망합니다.",
      questions: [
        "체크카드 발급 전에 어떤 사항을 확인하시겠습니까?",
        "체크카드와 신용카드의 차이를 설명해 보세요.",
        "카드 분실 및 부정 사용 시 대처 방법을 안내해 보세요."
      ]
    },
    {
      name: "문성호",
      age: 59,
      gender: "남성",
      type: "사업자 운전자금",
      info: "소규모 사업장을 운영하며 운영자금 대출을 문의했습니다.",
      questions: [
        "사업자 대출 상담 시 사업 현황을 어떻게 확인하시겠습니까?",
        "사업자등록증과 소득자료를 확인하는 이유는 무엇인가요?",
        "대출 상환능력을 어떤 기준으로 검토하시겠습니까?"
      ]
    },
    {
      name: "임정숙",
      age: 66,
      gender: "여성",
      type: "예금 만기 상담",
      info: "정기예금 만기가 다가와 재예치와 자금 운용을 문의했습니다.",
      questions: [
        "만기 자금의 사용 계획을 어떻게 확인하시겠습니까?",
        "예금 기간별 금리와 이자 지급 방식을 설명해 보세요.",
        "조합원 혜택과 과세 여부를 어떻게 안내하시겠습니까?"
      ]
    }
  ];

  // ==========================================
  // 기본 유틸리티
  // ==========================================

  function showMessage(text) {
    const toast = $("toast");
    if (!toast) return;

    toast.textContent = text;
    toast.classList.add("show");

    clearTimeout(S.messageTimer);

    S.messageTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  function updateClock() {
    const hour = String(Math.floor(S.minutes / 60)).padStart(2, "0");
    const minute = String(S.minutes % 60).padStart(2, "0");

    if ($("day")) {
      $("day").textContent = `${S.day}일차`;
    }

    if ($("clock")) {
      $("clock").textContent = `${hour}:${minute}`;
    }

    if ($("sales")) {
      $("sales").textContent = `${S.sales}건`;
    }

    if ($("satisfaction")) {
      $("satisfaction").textContent = `${S.satisfaction}%`;
    }
  }

  function updateQueue() {
    if ($("waiting-count")) {
      $("waiting-count").textContent = `${S.queue.length}명`;
    }

    const list = $("queue-list");
    if (!list) return;

    list.innerHTML = "";

    if (S.queue.length === 0) {
      const empty = document.createElement("div");
      empty.style.padding = "15px 5px";
      empty.style.color = "#81909a";
      empty.style.fontSize = "12px";
      empty.textContent = "대기 고객이 없습니다.";
      list.appendChild(empty);
    } else {
      S.queue.forEach((c, index) => {
        const item = document.createElement("div");
        item.className = "queue-item";

        const avatar = document.createElement("div");
        avatar.className = "queue-avatar";
        avatar.textContent = c.gender === "여성" ? "👩" : "👨";

        const detail = document.createElement("div");
        detail.className = "queue-detail";

        const name = document.createElement("strong");
        name.textContent = c.name + " 고객님";

        const type = document.createElement("small");
        type.textContent = c.type;

        detail.appendChild(name);
        detail.appendChild(type);

        const number = document.createElement("span");
        number.className = "queue-number";
        number.textContent = `${index + 1}번`;

        item.appendChild(avatar);
        item.appendChild(detail);
        item.appendChild(number);

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

  // ==========================================
  // 3D 재질 및 오브젝트
  // ==========================================

  function material(color, options = {}) {
    return new S.THREE.MeshStandardMaterial({
      color,
      roughness: 0.78,
      ...options
    });
  }

  function addBox(
    parent,
    x, y, z,
    width, height, depth,
    color,
    options = {}
  ) {
    const mesh = new S.THREE.Mesh(
      new S.THREE.BoxGeometry(width, height, depth),
      material(color, options)
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }

  function addSphere(
    parent,
    x, y, z,
    sx, sy, sz,
    color
  ) {
    const mesh = new S.THREE.Mesh(
      new S.THREE.SphereGeometry(1, 20, 16),
      material(color)
    );

    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);

    parent.add(mesh);

    return mesh;
  }

  function addText(text, x, y, z, width, height, color = "#ffffff") {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = "bold 105px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 128);

    const texture = new S.THREE.CanvasTexture(canvas);

    const mesh = new S.THREE.Mesh(
      new S.THREE.PlaneGeometry(width, height),
      new S.THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      })
    );

    mesh.position.set(x, y, z);
    S.scene.add(mesh);

    return mesh;
  }

  // ==========================================
  // 은행 내부 제작
  // ==========================================

  function createRoom() {
    const T = S.THREE;
    const scene = S.scene;

    scene.background = new T.Color("#dce7eb");

    // 바닥
    addBox(
      scene, 0, -0.25, 0,
      22, 0.5, 24,
      "#c9c9c2"
    );

    // 벽
    addBox(
      scene, 0, 4, -6,
      22, 8, 0.3,
      "#f0eee7"
    );

    addBox(
      scene, -10.9, 4, 0,
      0.3, 8, 12,
      "#eeeae2"
    );

    addBox(
      scene, 10.9, 4, 0,
      0.3, 8, 12,
      "#eeeae2"
    );

    // 뒷벽 장식
    addBox(
      scene, 0, 6.1, -5.78,
      6.5, 1.1, 0.12,
      "#164b66"
    );

    addText(
      "신협 CREDIT UNION",
      0, 6.1, -5.69,
      5.9, 0.7
    );

    addBox(
      scene, 0, 4.6, -5.77,
      5.5, 0.55, 0.12,
      "#ffffff"
    );

    addText(
      "춘천신협 근화지점",
      0, 4.6, -5.68,
      4.9, 0.35,
      "#164b66"
    );

    // 창구 카운터
    addBox(
      scene, 0, 1.0, -0.1,
      13, 1.0, 1.5,
      "#eee9df"
    );

    addBox(
      scene, 0, 1.55, -0.1,
      13.2, 0.13, 1.65,
      "#755b43"
    );

    // 창구 번호판
    for (let i = 0; i < 4; i++) {
      const x = -4.8 + i * 3.2;

      addBox(
        scene, x, 2.3, -0.45,
        0.8, 0.45, 0.12,
        "#174d6c"
      );

      addText(
        String(i + 1),
        x, 2.3, -0.37,
        0.5, 0.3
      );

      // 모니터
      addBox(
        scene, x, 2.1, -0.95,
        0.85, 0.55, 0.12,
        "#292f33"
      );

      addBox(
        scene, x, 2.1, -0.875,
        0.72, 0.4, 0.025,
        "#9ac4d2"
      );

      // 모니터 받침
      addBox(
        scene, x, 1.77, -0.95,
        0.18, 0.15, 0.18,
        "#343a40"
      );

      // 키보드
      addBox(
        scene, x, 1.68, -0.55,
        0.65, 0.045, 0.28,
        "#343a40"
      );

      // 서류
      addBox(
        scene, x + 0.55, 1.66, -0.5,
        0.35, 0.035, 0.42,
        "#ffffff"
      );
    }

    // 유리 칸막이
    const glass = material("#b5d9e4", {
      transparent: true,
      opacity: 0.28,
      roughness: 0.15
    });

    for (let i = 0; i < 5; i++) {
      const pane = new T.Mesh(
        new T.BoxGeometry(2.45, 0.95, 0.035),
        glass
      );

      pane.position.set(
        -5.6 + i * 2.8,
        2.55,
        0.12
      );

      scene.add(pane);
    }

    // 대기 의자
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 5; i++) {
        const x = -5.4 + i * 2.7;
        const z = 5.8 + row * 1.5;

        addBox(
          scene, x, 0.7, z,
          1.5, 0.15, 0.65,
          "#315c72"
        );

        addBox(
          scene, x, 1.12, z + 0.24,
          1.5, 0.75, 0.15,
          "#315c72"
        );

        // 의자 다리
        for (const side of [-1, 1]) {
          addBox(
            scene,
            x + side * 0.55,
            0.35,
            z,
            0.08, 0.55, 0.08,
            "#343b40"
          );
        }
      }
    }

    // 번호표 발급기
    addBox(
      scene, 7.8, 1.1, 3.3,
      0.7, 1.5, 0.65,
      "#e7e9e8"
    );

    addBox(
      scene, 7.8, 1.55, 2.96,
      0.43, 0.3, 0.04,
      "#234b61"
    );

    addBox(
      scene, 7.8, 1.2, 2.95,
      0.25, 0.08, 0.04,
      "#087b68"
    );

    // 안내 데스크
    addBox(
      scene, -8.4, 1.0, -2.0,
      1.8, 1.0, 1.0,
      "#e6e6e1"
    );

    addBox(
      scene, -8.4, 1.55, -2.0,
      1.95, 0.12, 1.1,
      "#765b43"
    );

    // 화분
    addBox(
      scene, -8.6, 0.35, 4.2,
      0.65, 0.7, 0.65,
      "#9a7054"
    );

    for (let i = 0; i < 5; i++) {
      addSphere(
        scene,
        -8.6 + Math.sin(i * 1.2) * 0.3,
        1.0 + Math.cos(i) * 0.12,
        4.2 + Math.cos(i * 1.2) * 0.3,
        0.25, 0.45, 0.25,
        "#39845b"
      );
    }

    // 천장 조명
    for (let i = 0; i < 5; i++) {
      const light = new T.PointLight("#fff1d7", 35, 15);

      light.position.set(
        -7 + i * 3.5,
        7.2,
        1
      );

      scene.add(light);

      addBox(
        scene,
        -7 + i * 3.5,
        7.7,
        1,
        1.8, 0.08, 0.7,
        "#fff6dc"
      );
    }

    // 조명
    scene.add(
      new T.HemisphereLight(
        "#ffffff",
        "#84949d",
        2.2
      )
    );

    const sunlight = new T.DirectionalLight(
      "#fff6e8",
      2.5
    );

    sunlight.position.set(-5, 10, 8);
    scene.add(sunlight);
  }

  // ==========================================
  // 사람 캐릭터 제작
  // ==========================================

  function createPerson(employee = false, gender = "남성") {
    const T = S.THREE;

    const group = new T.Group();

    const skin = material("#d8a783");
    const hair = material(gender === "여성" ? "#35241f" : "#29221e");

    const clothes = material(
      employee ? "#1c4963" :
      gender === "여성" ? "#9b6d88" : "#526e83"
    );

    const pants = material("#34414a");
    const white = material("#ffffff");
    const black = material("#252525");

    // 다리
    for (const x of [-0.14, 0.14]) {
      addBox(
        group,
        x, 0.55, 0,
        0.17, 0.85, 0.18,
        "#34414a"
      );

      addBox(
        group,
        x, 0.1, 0.1,
        0.23, 0.15, 0.38,
        "#292929"
      );
    }

    // 몸통
    const body = new T.Mesh(
      new T.CapsuleGeometry(0.32, 0.62, 4, 12),
      clothes
    );

    body.position.y = 1.45;
    group.add(body);

    // 목
    addSphere(
      group, 0, 2.03, 0,
      0.12, 0.16, 0.12,
      "#d8a783"
    );

    // 얼굴
    addSphere(
      group, 0, 2.38, 0,
      0.34, 0.42, 0.3,
      "#d8a783"
    );

    // 귀
    addSphere(group, -0.34, 2.37, 0, 0.08, 0.12, 0.08, "#d8a783");
    addSphere(group, 0.34, 2.37, 0, 0.08, 0.12, 0.08, "#d8a783");

    // 머리카락
    addSphere(
      group, 0, 2.67, -0.02,
      0.36, 0.22, 0.32,
      gender === "여성" ? "#38241f" : "#29221e"
    );

    addSphere(
      group, -0.25, 2.49, -0.01,
      0.12, 0.2, 0.25,
      "#30221e"
    );

    addSphere(
      group, 0.25, 2.49, -0.01,
      0.12, 0.2, 0.25,
      "#30221e"
    );

    // 눈과 눈동자
    for (const x of [-0.12, 0.12]) {
      addSphere(
        group, x, 2.42, 0.277,
        0.07, 0.07, 0.035,
        "#ffffff"
      );

      addSphere(
        group, x, 2.42, 0.31,
        0.033, 0.04, 0.02,
        "#222222"
      );

      addSphere(
        group, x, 2.52, 0.28,
        0.08, 0.025, 0.025,
        "#30221e"
      );
    }

    // 코
    addSphere(
      group, 0, 2.32, 0.32,
      0.05, 0.08, 0.07,
      "#d8a783"
    );

    // 입
    const mouth = new T.Mesh(
      new T.BoxGeometry(0.12, 0.025, 0.02),
      material("#914e48")
    );

    mouth.position.set(0, 2.22, 0.31);
    group.add(mouth);

    // 팔
    for (const side of [-1, 1]) {
      const arm = new T.Mesh(
        new T.CapsuleGeometry(0.09, 0.5, 4, 8),
        clothes
      );

      arm.position.set(side * 0.38, 1.45, 0);
      arm.rotation.z = side * -0.12;

      group.add(arm);

      addSphere(
        group,
        side * 0.4, 1.13, 0.05,
        0.1, 0.12, 0.1,
        "#d8a783"
      );
    }

    return group;
  }

  // ==========================================
  // 직원과 고객 배치
  // ==========================================

  function createEmployee() {
    const employee = createPerson(true, "남성");

    // 직원은 창구 뒤에 고정
    employee.position.set(0, 0, -1.8);

    S.scene.add(employee);

    S.employee = employee;
  }

  function createCustomerPerson(customer) {
    if (!S.scene || !S.THREE) return;

    if (customer.person) return;

    const person = createPerson(false, customer.gender);

    // 대기 구역
    person.position.set(
      -4.5 + (customer.number % 5) * 2.2,
      0,
      9.0
    );

    person.userData.walking = false;
    person.userData.leaving = false;
    person.userData.customer = customer;
    person.userData.targetX = person.position.x;
    person.userData.targetZ = 9.0;

    S.scene.add(person);

    S.people.push(person);

    customer.person = person;
  }

  function createCustomer() {
    const data = cases[
      Math.floor(Math.random() * cases.length)
    ];

    const customer = {
      name: data.name,
      age: data.age,
      gender: data.gender,
      type: data.type,
      info: data.info,

      questions: [...data.questions],

      index: 0,
      answers: [],

      number: ++S.number,

      person: null,
      arrived: false
    };

    S.queue.push(customer);

    createCustomerPerson(customer);

    update();
  }

  // ==========================================
  // 3D 화면 초기화
  // ==========================================

  async function init3D() {
    if (S.loading || S.renderer) return;

    S.loading = true;

    try {
      const THREE = await import(
        "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      );

      S.THREE = THREE;

      const host = $("scene-container");

      if (!host) {
        throw new Error("3D 화면 영역을 찾을 수 없습니다.");
      }

      S.scene = new THREE.Scene();

      S.scene.background = new THREE.Color("#dce7eb");

      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);

      S.camera = new THREE.PerspectiveCamera(
        48,
        width / height,
        0.1,
        100
      );

      // 위에서 내려다보는 시점을 줄임
      S.camera.position.set(0, 4.4, 17);

      S.camera.lookAt(0, 2.2, 0);

      S.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
      });

      S.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
      );

      S.renderer.setSize(width, height);

      S.renderer.shadowMap.enabled = true;

      S.renderer.outputColorSpace = THREE.SRGBColorSpace;

      S.renderer.toneMapping = THREE.ACESFilmicToneMapping;

      S.renderer.toneMappingExposure = 1.1;

      host.innerHTML = "";

      host.appendChild(S.renderer.domElement);

      S.clock = new THREE.Clock();

      createRoom();
      createEmployee();

      // 기존 대기 고객을 3D에 표시
      S.queue.forEach(createCustomerPerson);

      animate();

      resize();

      window.addEventListener("resize", resize);

      showMessage("춘천신협 금융창구에 오신 것을 환영합니다.");

    } catch (error) {
      console.error("3D 초기화 오류:", error);

      showMessage(
        "3D 화면을 불러오지 못했습니다. 상담 기능은 계속 이용할 수 있습니다."
      );

    } finally {
      S.loading = false;
      update();
    }
  }

  // ==========================================
  // 고객 이동 애니메이션
  // ==========================================

  function callCustomer() {
    if (!S.started) return;

    if (S.current) {
      showMessage("현재 고객 상담을 먼저 완료해 줘.");
      return;
    }

    if (S.queue.length === 0) {
      showMessage("대기 고객이 없습니다.");
      return;
    }

    const customer = S.queue.shift();

    S.current = customer;

    update();

    showMessage(
      `${customer.name} 고객님, ${customer.number}번 창구로 와 주세요.`
    );

    // 상담창은 고객이 도착한 뒤에 표시
    if (customer.person) {
      const p = customer.person;

      p.userData.targetX = 0;
      p.userData.targetZ = 2.15;

      p.userData.walking = true;
      p.userData.leaving = false;

    } else {
      // 3D 로딩 실패 시에도 상담 기능 진행
      customer.arrived = true;

      openConsultation(customer);
    }
  }

  function animatePeople(dt) {
    for (const p of [...S.people]) {
      if (!p.userData.walking) continue;

      const targetX = p.userData.targetX;
      const targetZ = p.userData.targetZ;

      const dx = targetX - p.position.x;
      const dz = targetZ - p.position.z;

      const distance = Math.sqrt(dx * dx + dz * dz);

      const speed = p.userData.leaving ? 3.2 : 2.7;

      if (distance > 0.08) {
        const step = Math.min(speed * dt, distance);

        p.position.x += (dx / distance) * step;
        p.position.z += (dz / distance) * step;

        // 걷는 움직임
        p.position.y =
          Math.abs(Math.sin(performance.now() * 0.009)) * 0.035;

        // 이동 방향
        p.rotation.y = Math.atan2(dx, dz);

      } else {
        p.position.x = targetX;
        p.position.z = targetZ;
        p.position.y = 0;

        p.userData.walking = false;

        if (p.userData.leaving) {
          S.scene.remove(p);

          S.people = S.people.filter(
            item => item !== p
          );

          p.userData.customer.person = null;

        } else {
          const customer = p.userData.customer;

          if (customer && S.current === customer) {
            customer.arrived = true;
            openConsultation(customer);
          }
        }
      }
    }
  }

  function animate() {
    if (!S.renderer || !S.scene) return;

    requestAnimationFrame(animate);

    const dt = Math.min(
      S.clock.getDelta(),
      0.05
    );

    animatePeople(dt);

    S.renderer.render(
      S.scene,
      S.camera
    );
  }

  function resize() {
    const host = $("scene-container");

    if (!host || !S.camera || !S.renderer) return;

    const width = host.clientWidth;
    const height = host.clientHeight;

    if (width <= 0 || height <= 0) return;

    S.camera.aspect = width / height;
    S.camera.updateProjectionMatrix();

    S.renderer.setSize(width, height);
  }

  // ==========================================
  // 상담 화면
  // ==========================================

  function openConsultation(customer) {
    if (!customer || S.current !== customer) return;

    const panel = $("customer-panel");

    if (!panel) {
      console.error("customer-panel을 찾을 수 없습니다.");
      return;
    }

    customer.arrived = true;

    $("queue-panel")?.classList.add("hidden");

    panel.classList.remove("hidden");

    if ($("customer-name")) {
      $("customer-name").textContent =
        `${customer.name} 고객님`;
    }

    if ($("customer-number")) {
      $("customer-number").textContent =
        `${customer.number}번`;
    }

    if ($("customer-info")) {
      $("customer-info").innerHTML = "";

      const tags = [
        `${customer.age}세`,
        customer.gender,
        customer.type
      ];

      tags.forEach(text => {
        const tag = document.createElement("span");

        tag.className = "info-tag";
        tag.textContent = text;

        $("customer-info").appendChild(tag);
      });
    }

    if ($("finish-button")) {
      $("finish-button").classList.add("hidden");
    }

    showQuestion(customer);

    showMessage(
      `${customer.name} 고객님이 창구에 도착했습니다.`
    );
  }

  function createAnswerArea() {
    const answerList = $("answer-list");

    if (!answerList) return null;

    answerList.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "written-answer-area";

    const label = document.createElement("label");
    label.htmlFor = "written-answer";
    label.textContent = "상담 답변 작성";

    const textarea = document.createElement("textarea");

    textarea.id = "written-answer";
    textarea.placeholder =
      "고객님께 안내할 내용을 직접 작성해 주세요.";

    textarea.rows = 5;

    const hint = document.createElement("p");
    hint.className = "answer-hint";
    hint.textContent =
      "상담 상황에 맞게 구체적으로 작성해 주세요.";

    const submit = document.createElement("button");

    submit.type = "button";
    submit.className = "primary-button";
    submit.textContent = "답변 제출";

    submit.addEventListener("click", submitAnswer);

    wrapper.appendChild(label);
    wrapper.appendChild(textarea);
    wrapper.appendChild(hint);
    wrapper.appendChild(submit);

    answerList.appendChild(wrapper);

    return textarea;
  }

  function showQuestion(customer) {
    if (!customer || !customer.arrived) return;

    const question = customer.questions[customer.index];

    if ($("step-count")) {
      $("step-count").textContent =
        `${customer.index + 1} / ${customer.questions.length}`;
    }

    if ($("progress-bar")) {
      const percent =
        (customer.index / customer.questions.length) * 100;

      $("progress-bar").style.width = `${percent}%`;
    }

    if ($("customer-message")) {
      $("customer-message").textContent = question;
    }

    if ($("feedback")) {
      $("feedback").textContent =
        "답변을 작성한 뒤 제출해 주세요.";
    }

    if ($("answer-list")) {
      createAnswerArea();
    }

    if ($("finish-button")) {
      $("finish-button").classList.add("hidden");
    }
  }

  // ==========================================
  // 답변 평가
  // ==========================================

  function evaluateAnswer(answer) {
    const keywords = [
      "확인",
      "안내",
      "금리",
      "만기",
      "소득",
      "재직",
      "보증",
      "신용",
      "상환",
      "등기",
      "담보",
      "LTV",
      "DSR",
      "예금자보호",
      "출자금",
      "조합원",
      "서류",
      "약관",
      "보장",
      "계약",
      "심사",
      "세금",
      "비과세",
      "저율과세",
      "자금",
      "사용"
    ];

    const hits = keywords.filter(
      word => answer.includes(word)
    ).length;

    const lengthScore =
      answer.length >= 100 ? 4 :
      answer.length >= 50 ? 3 :
      answer.length >= 20 ? 2 : 1;

    return Math.min(
      10,
      3 + Math.min(hits, 4) + lengthScore
    );
  }

  function submitAnswer() {
    const customer = S.current;

    if (!customer || !customer.arrived) {
      showMessage("고객이 도착한 뒤 답변을 작성해 줘.");
      return;
    }

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

    customer.answers.push(answer);

    const score = evaluateAnswer(answer);

    if (score >= 7) {
      S.satisfaction = Math.min(
        100,
        S.satisfaction + 1
      );
    } else {
      S.satisfaction = Math.max(
        0,
        S.satisfaction - 1
      );
    }

    customer.index++;

    if (customer.index < customer.questions.length) {
      if ($("feedback")) {
        $("feedback").textContent =
          `답변 저장 완료 · 평가 ${score}/10점`;
      }

      showQuestion(customer);

      showMessage("다음 상담 질문으로 넘어갑니다.");

    } else {
      completeQuestions(customer, score);
    }

    update();
  }

  function completeQuestions(customer, score) {
    if ($("step-count")) {
      $("step-count").textContent =
        `${customer.questions.length} / ${customer.questions.length}`;
    }

    if ($("progress-bar")) {
      $("progress-bar").style.width = "100%";
    }

    if ($("customer-message")) {
      $("customer-message").textContent =
        "모든 상담 질문을 완료했습니다.";
    }

    if ($("answer-list")) {
      $("answer-list").innerHTML = "";

      const review = document.createElement("div");
      review.className = "review-box";

      const title = document.createElement("h3");
      title.textContent = "상담 완료 평가";

      const p1 = document.createElement("p");
      p1.textContent =
        `상담 고객: ${customer.name}님`;

      const p2 = document.createElement("p");
      p2.textContent =
        `상담 내용: ${customer.type}`;

      const p3 = document.createElement("p");
      p3.textContent =
        `작성한 답변: ${customer.answers.length}개`;

      const p4 = document.createElement("p");
      p4.textContent =
        `마지막 답변 평가: ${score}/10점`;

      review.appendChild(title);
      review.appendChild(p1);
      review.appendChild(p2);
      review.appendChild(p3);
      review.appendChild(p4);

      $("answer-list").appendChild(review);
    }

    if ($("feedback")) {
      $("feedback").textContent =
        "모든 질문에 답변했습니다. 상담을 완료해 주세요.";
    }

    if ($("finish-button")) {
      $("finish-button").classList.remove("hidden");
    }

    showMessage("상담 질문이 모두 끝났습니다.");
  }

  // ==========================================
  // 상담 종료
  // ==========================================

  function finishCustomer() {
    const customer = S.current;

    if (!customer) return;

    if (customer.answers.length !== customer.questions.length) {
      showMessage("아직 완료하지 않은 질문이 있습니다.");
      return;
    }

    if ($("customer-panel")) {
      $("customer-panel").classList.add("hidden");
    }

    if ($("queue-panel")) {
      $("queue-panel").classList.remove("hidden");
    }

    // 고객 퇴장
    if (customer.person) {
      customer.person.userData.targetX = 7;
      customer.person.userData.targetZ = 9.5;

      customer.person.userData.walking = true;
      customer.person.userData.leaving = true;
    }

    S.sales++;

    S.current = null;

    update();

    showMessage(
      `${customer.name} 고객님 상담이 완료됐습니다.`
    );
  }

  // ==========================================
  // 영업 시작
  // ==========================================

  function startGame() {
    if (S.started) return;

    S.started = true;

    const startScreen = $("start-screen");

    if (startScreen) {
      startScreen.style.display = "none";
    }

    // 초기 대기 고객 생성
    for (let i = 0; i < 6; i++) {
      createCustomer();
    }

    // 3D 화면 실행
    init3D();

    update();

    showMessage(
      "영업을 시작합니다. 다음 고객을 호출해 주세요."
    );

    // 2초마다 게임 시간 1분 진행
    clearInterval(S.timer);

    S.timer = setInterval(() => {
      S.minutes++;

      // 18시 이후 다음 영업일
      if (S.minutes >= 1080) {
        S.minutes = 540;
        S.day++;

        showMessage(
          `${S.day}일차 영업을 시작합니다.`
        );
      }

      updateClock();

    }, 2000);

    // 25초마다 신규 고객 추가
    clearInterval(S.spawnTimer);

    S.spawnTimer = setInterval(() => {
      if (S.queue.length < 8) {
        createCustomer();
        showMessage("새로운 고객이 대기했습니다.");
      }
    }, 25000);
  }

  // ==========================================
  // 이벤트 연결
  // ==========================================

  function bindEvents() {
    const startButton = $("start-button");

    if (startButton) {
      startButton.addEventListener(
        "click",
        startGame
      );
    }

    const callButton = $("call-button");

    if (callButton) {
      callButton.addEventListener(
        "click",
        callCustomer
      );
    }

    const finishButton = $("finish-button");

    if (finishButton) {
      finishButton.addEventListener(
        "click",
        finishCustomer
      );
    }
  }

  // ==========================================
  // 초기 실행
  // ==========================================

  function init() {
    const requiredIds = [
      "scene-container",
      "start-screen",
      "start-button",
      "queue-panel",
      "customer-panel",
      "call-button",
      "finish-button",
      "answer-list"
    ];

    const missing = requiredIds.filter(
      id => !$(id)
    );

    if (missing.length > 0) {
      console.error(
        "필요한 HTML 요소를 찾을 수 없습니다:",
        missing
      );

      return;
    }

    bindEvents();

    update();

    console.log(
      "춘천신협 3D 금융창구 초기화 완료"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
