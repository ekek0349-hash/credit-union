
(() => {
  "use strict";

  if (window.__CU_FIXED_GAME__) return;
  window.__CU_FIXED_GAME__ = true;

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
    number: 0,
    minutes: 540,
    day: 1,
    sales: 0,
    satisfaction: 100
  };

  const cases = [
    ["김영숙", 63, "정기예금 신규", "농협에서 만기된 5,000만원을 예치하려고 합니다.", [
      "고객님의 자금 사용 계획과 예치 기간을 어떻게 확인하시겠습니까?",
      "정기예금과 출자금의 차이를 설명해 보세요.",
      "예금자보호와 세금 관련 유의사항을 어떻게 안내하시겠습니까?"
    ]],
    ["박정호", 45, "햇살론 상담", "직장에 재직 중이며 카드론 상환을 희망합니다.", [
      "햇살론 상담 시 우선 확인할 사항은 무엇인가요?",
      "소득과 재직기간은 어떤 자료로 확인하시겠습니까?",
      "보증심사와 실제 대출 가능 금액에 대해 어떻게 설명하시겠습니까?"
    ]],
    ["이수진", 38, "주택담보대출", "아파트를 담보로 생활안정자금 대출을 문의했습니다.", [
      "담보대출 상담에서 가장 먼저 확인할 내용은 무엇인가요?",
      "등기부등본에서 어떤 사항을 확인하시겠습니까?",
      "LTV와 DSR을 고객님께 쉽게 설명해 보세요."
    ]],
    ["최민수", 51, "예금 재예치", "기존 정기예금 8,000만원이 만기되었습니다.", [
      "재예치 상담에서 자금 사용 계획을 어떻게 확인하시겠습니까?",
      "예금 기간과 금리를 비교해 설명해 보세요.",
      "조합원에게 추가로 안내할 수 있는 혜택은 무엇인가요?"
    ]],
    ["정미경", 57, "출자금 상담", "신협 조합원 가입과 출자금에 대해 문의했습니다.", [
      "출자금이 무엇인지 설명해 보세요.",
      "출자금과 예금의 차이는 무엇인가요?",
      "출자금 가입 전 유의사항을 안내해 보세요."
    ]],
    ["한지영", 32, "전세자금대출", "전세 계약을 앞두고 대출을 문의했습니다.", [
      "전세자금대출 상담에서 먼저 확인할 사항은 무엇인가요?",
      "임대차계약서 외에 어떤 서류를 확인하시겠습니까?",
      "보증기관 심사와 대출 실행 절차를 설명해 보세요."
    ]],
    ["오상철", 68, "정기적금 가입", "매월 100만원씩 저축하고 싶어 합니다.", [
      "적금 가입 전에 어떤 내용을 확인하시겠습니까?",
      "정기예금과 정기적금의 차이를 설명해 보세요.",
      "중도해지 시 유의사항을 안내해 보세요."
    ]],
    ["윤서연", 29, "계좌개설 및 모바일뱅킹", "신협 계좌를 처음 개설하고 모바일뱅킹을 이용하려 합니다.", [
      "신규 계좌 개설 시 확인할 사항은 무엇인가요?",
      "모바일뱅킹 가입 절차를 설명해 보세요.",
      "전자금융사기 예방을 위해 어떤 점을 안내하시겠습니까?"
    ]],
    ["장태식", 55, "화재공제 상담", "상가 건물을 운영하며 화재 관련 보장을 문의했습니다.", [
      "화재공제 상담 시 먼저 확인할 사항은 무엇인가요?",
      "건물과 시설물, 집기비품의 차이를 설명해 보세요.",
      "기존 보험 가입 내역을 확인하는 이유는 무엇인가요?"
    ]],
    ["조은희", 72, "상속 예금 문의", "가족의 사망으로 예금 지급 절차를 문의했습니다.", [
      "상속 예금 업무에서 우선 확인할 사항은 무엇인가요?",
      "상속인 확인을 위해 어떤 서류가 필요할까요?",
      "상속인 간 의견이 다를 경우 어떻게 처리하시겠습니까?"
    ]]
  ];

  function style() {
    if ($("cu-fix-style")) return;

    const el = document.createElement("style");
    el.id = "cu-fix-style";
    el.textContent = `
      #scene-container { position:relative!important; overflow:hidden!important; min-height:520px!important; background:#dce7ec!important; }
      #scene-container canvas { display:block; width:100%; height:100%; }
      #cu-dialog {
        display:none; position:absolute; z-index:9999; left:50%; bottom:12px;
        transform:translateX(-50%); width:min(650px,94%);
        box-sizing:border-box; padding:18px; border-radius:14px;
        background:#fff; color:#203040; box-shadow:0 8px 35px #0005;
        font-family:Arial,sans-serif;
      }
      #cu-dialog h3 { margin:7px 0; }
      #cu-dialog p { line-height:1.5; }
      #cu-dialog textarea {
        display:block; width:100%; min-height:90px; box-sizing:border-box;
        padding:12px; border:1px solid #bbc9d3; border-radius:8px;
        font:inherit; margin-top:12px;
      }
      #cu-dialog button {
        padding:11px 18px; margin-top:10px; border:0;
        border-radius:8px; cursor:pointer; font-weight:bold;
      }
      #cu-submit { background:#145c86; color:white; }
      #cu-finish { background:#e5edf2; color:#203040; margin-left:7px; }
      #cu-message {
        position:absolute; z-index:9998; top:12px; left:50%;
        transform:translateX(-50%); display:none;
        padding:10px 18px; border-radius:25px;
        background:#173f5b; color:white; white-space:nowrap;
      }
    `;
    document.head.appendChild(el);
  }

  function makeUI() {
    const host = $("scene-container") || $("game") || document.body;

    if (!$("cu-dialog")) {
      const panel = document.createElement("div");
      panel.id = "cu-dialog";
      panel.innerHTML = `
        <small id="cu-type" style="color:#28739b;font-weight:bold"></small>
        <h3 id="cu-name"></h3>
        <p id="cu-info"></p>
        <p id="cu-question" style="font-weight:bold"></p>
        <textarea id="cu-answer" placeholder="고객님께 안내할 내용을 작성해 주세요."></textarea>
        <button id="cu-submit">답변 제출</button>
        <button id="cu-finish" style="display:none">상담 완료</button>
        <p id="cu-feedback" style="font-size:13px;color:#547083"></p>
      `;
      host.appendChild(panel);
    }

    if (!$("cu-message")) {
      const msg = document.createElement("div");
      msg.id = "cu-message";
      host.appendChild(msg);
    }

    $("cu-submit").addEventListener("click", submitAnswer);
    $("cu-finish").addEventListener("click", finishCustomer);
  }

  function message(text) {
    const el = $("cu-message");
    el.textContent = text;
    el.style.display = "block";
    clearTimeout(S.messageTimer);
    S.messageTimer = setTimeout(() => el.style.display = "none", 2200);
  }

  function update() {
    if ($("day")) $("day").textContent = S.day;
    if ($("clock")) {
      $("clock").textContent =
        String(Math.floor(S.minutes / 60)).padStart(2, "0") + ":" +
        String(S.minutes % 60).padStart(2, "0");
    }
    if ($("sales")) $("sales").textContent = S.sales.toLocaleString("ko-KR");
    if ($("satisfaction")) $("satisfaction").textContent = S.satisfaction;
    if ($("waiting-count")) $("waiting-count").textContent = S.queue.length;

    if ($("queue-list")) {
      $("queue-list").innerHTML = S.queue.map((c, i) =>
        `<div style="padding:7px;border-bottom:1px solid #ddd">${i + 1}. ${c.name} · ${c.type}</div>`
      ).join("") || "대기 고객이 없습니다.";
    }
  }

  function mat(THREE, color, extra = {}) {
    return new THREE.MeshStandardMaterial({ color, roughness:0.75, ...extra });
  }

  function box(THREE, parent, x, y, z, w, h, d, color) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      mat(THREE, color)
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function textSign(THREE, text, x, y, z, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 100px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map:texture, transparent:true })
    );
    mesh.position.set(x, y, z);
    S.scene.add(mesh);
  }

  function createRoom(THREE) {
    const scene = S.scene;
    scene.background = new THREE.Color("#dce6eb");

    box(THREE, scene, 0, -0.2, 0, 22, 0.4, 24, "#c6c9c6");
    box(THREE, scene, 0, 4, -5.5, 22, 8, 0.3, "#e9e9e4");
    box(THREE, scene, -10.8, 4, 0, 0.3, 8, 12, "#e9e9e4");
    box(THREE, scene, 10.8, 4, 0, 0.3, 8, 12, "#e9e9e4");

    // 신협 벽면 간판
    box(THREE, scene, 0, 6.2, -5.25, 6, 1.15, 0.15, "#174d6c");
    textSign(THREE, "신협  CREDIT UNION", 0, 6.2, -5.15, 5.6, 0.8);

    box(THREE, scene, 0, 3.8, -5.2, 5, 0.65, 0.15, "#253f50");
    textSign(THREE, "번호표를 뽑고 기다려 주세요", 0, 3.8, -5.1, 4.7, 0.4);

    // 창구 카운터
    box(THREE, scene, 0, 1.0, 0, 13, 1.0, 1.4, "#eeeae1");
    box(THREE, scene, 0, 1.55, 0, 13, 0.12, 1.5, "#765b43");

    // 창구 번호 표시
    for (let i = 0; i < 4; i++) {
      const x = -4.8 + i * 3.2;
      box(THREE, scene, x, 2.25, -0.1, 0.8, 0.4, 0.12, "#174d6c");
      textSign(THREE, String(i + 1), x, 2.25, -0.02, 0.5, 0.3);

      // 모니터와 키보드
      box(THREE, scene, x, 2.0, -0.85, 0.85, 0.55, 0.12, "#252c30");
      box(THREE, scene, x, 2.02, -0.77, 0.72, 0.42, 0.02, "#91b4c4");
      box(THREE, scene, x, 1.7, -0.5, 0.65, 0.05, 0.3, "#343b40");
    }

    // 유리 칸막이
    const glass = mat(THREE, "#b8d5df", {
      transparent:true,
      opacity:0.3,
      roughness:0.15
    });

    for (let i = 0; i < 5; i++) {
      const pane = new THREE.Mesh(
        new THREE.BoxGeometry(2.45, 1.0, 0.04),
        glass
      );
      pane.position.set(-5.6 + i * 2.8, 2.65, 0.1);
      scene.add(pane);
    }

    // 대기 의자
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 5; i++) {
        const x = -5.5 + i * 2.7;
        const z = 5.2 + row * 1.5;
        box(THREE, scene, x, 0.7, z, 1.6, 0.16, 0.65, "#315a70");
        box(THREE, scene, x, 1.15, z + 0.25, 1.6, 0.8, 0.15, "#315a70");
      }
    }

    // 번호표 기기
    box(THREE, scene, 7.7, 1.2, 2.8, 0.65, 1.5, 0.6, "#e9eceb");
    box(THREE, scene, 7.7, 1.6, 2.46, 0.42, 0.32, 0.05, "#244a5e");

    // 안내 데스크
    box(THREE, scene, -8.2, 1, -1.8, 2, 1, 1.1, "#e4e7e5");
    box(THREE, scene, -8.2, 1.55, -1.8, 2.1, 0.12, 1.2, "#765b43");

    // 천장 조명
    for (let i = 0; i < 5; i++) {
      const light = new THREE.PointLight("#fff2d9", 35, 14);
      light.position.set(-7 + i * 3.5, 7.5, 1);
      scene.add(light);
    }

    scene.add(new THREE.HemisphereLight("#ffffff", "#8a989f", 2));

    const sun = new THREE.DirectionalLight("#fff7e9", 2.5);
    sun.position.set(-4, 10, 8);
    scene.add(sun);
  }

  function person(THREE, employee = false) {
    const g = new THREE.Group();
    const skin = mat(THREE, "#d8a783");
    const hair = mat(THREE, "#30231e");
    const shirt = mat(THREE, employee ? "#1d4560" : "#627d8b");
    const pants = mat(THREE, "#34414a");
    const white = mat(THREE, "#ffffff");
    const black = mat(THREE, "#242424");

    function sphere(x, y, z, sx, sy, sz, material) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 12),
        material
      );
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      g.add(m);
      return m;
    }

    // 다리
    for (const x of [-0.14, 0.14]) {
      box(THREE, g, x, 0.55, 0, 0.17, 0.85, 0.18, "#34414a");
      box(THREE, g, x, 0.1, 0.1, 0.23, 0.15, 0.38, "#292929");
    }

    // 몸통
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.62, 4, 10),
      shirt
    );
    body.position.y = 1.45;
    g.add(body);

    sphere(0, 2.03, 0, 0.12, 0.16, 0.12, skin);
    sphere(0, 2.38, 0, 0.34, 0.42, 0.3, skin);

    // 귀와 머리
    sphere(-0.34, 2.37, 0, 0.08, 0.12, 0.08, skin);
    sphere(0.34, 2.37, 0, 0.08, 0.12, 0.08, skin);
    sphere(0, 2.67, -0.02, 0.36, 0.22, 0.32, hair);
    sphere(-0.25, 2.49, -0.01, 0.12, 0.2, 0.25, hair);
    sphere(0.25, 2.49, -0.01, 0.12, 0.2, 0.25, hair);

    // 눈, 눈썹, 코, 입
    for (const x of [-0.12, 0.12]) {
      sphere(x, 2.42, 0.277, 0.07, 0.07, 0.035, white);
      sphere(x, 2.42, 0.31, 0.033, 0.04, 0.02, black);
      sphere(x, 2.52, 0.28, 0.08, 0.025, 0.025, hair);
    }

    sphere(0, 2.32, 0.32, 0.05, 0.08, 0.07, skin);

    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.025, 0.02),
      mat(THREE, "#914e48")
    );
    mouth.position.set(0, 2.22, 0.31);
    g.add(mouth);

    // 팔
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.09, 0.5, 4, 8),
        shirt
      );
      arm.position.set(side * 0.38, 1.45, 0);
      arm.rotation.z = side * -0.12;
      g.add(arm);
      sphere(side * 0.4, 1.13, 0.05, 0.1, 0.12, 0.1, skin);
    }

    return g;
  }

  function createEmployee() {
    const e = person(S.THREE, true);
    e.position.set(0, 0, -1.5);
    S.scene.add(e);
  }

  function createPersonForCustomer(c) {
    if (!S.THREE || !S.scene || c.person) return;

    const p = person(S.THREE);
    // 손님은 책상 정면 중앙 통로에서 출발
    p.position.set(0, 0, 8.5);
    p.userData.targetZ = 1.9;
    p.userData.walking = false;
    p.userData.customer = c;

    S.scene.add(p);
    S.people.push(p);
    c.person = p;
  }

  function newCustomer() {
    const data = cases[Math.floor(Math.random() * cases.length)];
    const c = {
      name: data[0],
      age: data[1],
      type: data[2],
      info: data[3],
      questions: [...data[4]],
      index: 0,
      answers: [],
      number: ++S.number,
      person: null,
      arrived: false
    };

    S.queue.push(c);
    createPersonForCustomer(c);
    update();
  }

  function openConsultation(c) {
    if (S.current !== c || c.arrived) return;

    c.arrived = true;
    if (c.person) {
      c.person.userData.walking = false;
      c.person.position.z = 1.9;
    }

    const panel = $("cu-dialog");
    panel.style.display = "block";
    panel.style.visibility = "visible";

    $("cu-type").textContent = c.type;
    $("cu-name").textContent = `${c.number}번 고객 · ${c.name}님 (${c.age}세)`;
    $("cu-info").textContent = c.info;

    showQuestion(c);
    message(`${c.name} 고객님이 창구에 도착했습니다.`);
  }

  function showQuestion(c) {
    $("cu-question").textContent =
      `질문 ${c.index + 1}/${c.questions.length} : ${c.questions[c.index]}`;

    $("cu-answer").value = "";
    $("cu-feedback").textContent = "답변을 작성하고 제출해 줘.";
    $("cu-submit").style.display = "inline-block";
    $("cu-finish").style.display = "none";
    $("cu-answer").focus();
  }

  function callCustomer() {
    if (!S.started) {
      message("먼저 영업을 시작해 줘.");
      return;
    }

    if (S.current) {
      message("현재 고객 상담을 먼저 완료해 줘.");
      return;
    }

    if (S.queue.length === 0) newCustomer();

    const c = S.queue.shift();
    S.current = c;
    update();

    if (c.person) {
      c.person.userData.walking = true;
      c.person.userData.targetZ = 1.9;
    }

    message(`${c.name} 고객님을 호출했습니다.`);

    // 이동 애니메이션과 독립적으로 상담창을 반드시 실행
    clearTimeout(S.consultTimer);
    S.consultTimer = setTimeout(() => {
      openConsultation(c);
    }, 1800);
  }

  function submitAnswer() {
    const c = S.current;
    if (!c || !c.arrived) {
      message("고객 도착을 확인하고 다시 시도해 줘.");
      return;
    }

    const answer = $("cu-answer").value.trim();

    if (answer.length < 5) {
      $("cu-feedback").textContent = "답변을 조금 더 자세히 작성해 줘.";
      return;
    }

    c.answers.push(answer);

    const keywords = [
      "금리", "만기", "소득", "재직", "보증", "신용", "상환",
      "등기", "담보", "LTV", "DSR", "예금자보호", "출자금",
      "조합원", "서류", "확인", "약관", "보장", "계약", "심사"
    ];

    const hits = keywords.filter(k => answer.includes(k)).length;
    const score = Math.min(10, 5 + hits);

    S.satisfaction = Math.max(0, Math.min(100,
      S.satisfaction + (score >= 7 ? 1 : -1)
    ));

    c.index++;

    if (c.index < c.questions.length) {
      $("cu-feedback").textContent =
        `답변 저장 완료 · 평가 ${score}/10점 · 다음 질문으로 넘어가자.`;
      showQuestion(c);
    } else {
      $("cu-question").textContent = "모든 상담 질문을 완료했습니다.";
      $("cu-answer").style.display = "none";
      $("cu-submit").style.display = "none";
      $("cu-finish").style.display = "inline-block";
      $("cu-feedback").textContent = "상담을 마무리하고 다음 고객을 호출해 줘.";
    }

    update();
  }

  function finishCustomer() {
    const c = S.current;
    if (!c) return;

    clearTimeout(S.consultTimer);

    $("cu-dialog").style.display = "none";
    $("cu-answer").style.display = "block";

    if (c.person) {
      c.person.userData.targetZ = 9;
      c.person.userData.walking = true;
      c.person.userData.leaving = true;
    }

    S.sales++;
    S.current = null;

    update();
    message(`${c.name} 고객님 상담이 완료됐습니다.`);
  }

  function animate() {
    if (!S.renderer) return;

    requestAnimationFrame(animate);

    const dt = Math.min(S.clock.getDelta(), 0.05);

    for (const p of [...S.people]) {
      if (!p.userData.walking) continue;

      const target = p.userData.targetZ;
      const difference = target - p.position.z;
      const speed = p.userData.leaving ? 3.0 : 2.5;

      if (Math.abs(difference) > 0.08) {
        p.position.z += Math.sign(difference) * speed * dt;
        p.position.y = Math.abs(Math.sin(performance.now() * 0.009)) * 0.035;
      } else {
        p.position.z = target;
        p.position.y = 0;
        p.userData.walking = false;

        if (p.userData.leaving) {
          S.scene.remove(p);
          S.people = S.people.filter(item => item !== p);
        }
      }
    }

    S.renderer.render(S.scene, S.camera);
  }

  async function init3D() {
    try {
      const THREE = await import(
        "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
      );

      S.THREE = THREE;

      const host = $("scene-container");
      if (!host) throw new Error("scene-container를 찾을 수 없습니다.");

      S.scene = new THREE.Scene();

      S.camera = new THREE.PerspectiveCamera(
        43,
        host.clientWidth / Math.max(host.clientHeight, 1),
        0.1,
        100
      );

      S.camera.position.set(0, 3.4, 13);
      S.camera.lookAt(0, 2.7, -0.3);

      S.renderer = new THREE.WebGLRenderer({ antialias:true });
      S.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      S.renderer.setSize(host.clientWidth, host.clientHeight);
      S.renderer.shadowMap.enabled = true;
      S.renderer.outputColorSpace = THREE.SRGBColorSpace;
      S.renderer.toneMapping = THREE.ACESFilmicToneMapping;

      host.querySelectorAll("canvas").forEach(c => c.remove());
      host.appendChild(S.renderer.domElement);

      S.clock = new THREE.Clock();

      createRoom(THREE);
      createEmployee();

      S.queue.forEach(createPersonForCustomer);

      animate();
      resize();

    } catch (err) {
      console.error("3D 초기화 실패:", err);
      message("3D 화면을 불러오지 못했지만 상담 기능은 이용할 수 있어.");
    }
  }

  function resize() {
    const host = $("scene-container");
    if (!host || !S.camera || !S.renderer) return;

    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;

    S.camera.aspect = w / h;
    S.camera.updateProjectionMatrix();
    S.renderer.setSize(w, h);
  }

  function startGame() {
    if (S.started) return;
    S.started = true;

    if ($("start-screen")) $("start-screen").style.display = "none";

    for (let i = 0; i < 6; i++) newCustomer();

    init3D();
    update();
    message("영업을 시작합니다. 다음 고객 호출을 눌러 주세요.");

    clearInterval(S.timer);
    S.timer = setInterval(() => {
      S.minutes++;
      if (S.minutes >= 1080) {
        S.minutes = 540;
        S.day++;
      }
      update();
    }, 2000);

    clearInterval(S.spawn);
    S.spawn = setInterval(() => {
      if (S.queue.length < 8) newCustomer();
    }, 18000);
  }

  function bind() {
    if ($("start-button")) {
      $("start-button").addEventListener("click", startGame);
    } else {
      startGame();
    }

    if ($("call-button")) {
      $("call-button").addEventListener("click", callCustomer);
    }

    window.addEventListener("resize", resize);
  }

  function init() {
    style();
    makeUI();
    bind();
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
