// 춘천신협 금융창구 시뮬레이션 게임

let day = 1;
let sales = 0;
let satisfaction = 80;

let depositTotal = 0;
let loanTotal = 0;
let insuranceTotal = 0;

let customerIndex = -1;
let customerFinished = false;
let dailyCustomers = 0;

let logs = [];

const customers = [
  {
    name: "김영희",
    age: 58,
    job: "자영업",
    request: "정기예금 만기 자금을 재예치하고 싶습니다.",
    choices: [
      {
        text: "예금 금리와 세금 혜택을 함께 안내한다.",
        result: "고객님께 예금 금리와 세금 관련 내용을 안내했습니다. 재예치에 긍정적인 반응을 보입니다.",
        satisfaction: 5
      },
      {
        text: "높은 금리 상품만 간단히 안내한다.",
        result: "금리는 안내했지만 고객님의 자금 운용 상황을 충분히 확인하지 못했습니다.",
        satisfaction: 1
      },
      {
        text: "고객의 자금 계획부터 상담한다.",
        result: "고객님의 자금 사용 계획과 예치 기간을 확인했습니다. 신뢰도가 높아졌습니다.",
        satisfaction: 7
      }
    ]
  },
  {
    name: "박정수",
    age: 45,
    job: "회사원",
    request: "주택을 담보로 대출을 받고 싶습니다.",
    choices: [
      {
        text: "소득과 기존 부채부터 확인한다.",
        result: "소득과 기존 부채를 확인하고 상환 능력을 검토했습니다.",
        satisfaction: 7
      },
      {
        text: "담보 가치만 확인하고 대출을 안내한다.",
        result: "담보 가치는 확인했지만 상환 능력 검토가 부족했습니다.",
        satisfaction: -5
      },
      {
        text: "필요 서류와 심사 절차를 안내한다.",
        result: "대출 진행에 필요한 서류와 절차를 친절하게 안내했습니다.",
        satisfaction: 5
      }
    ]
  },
  {
    name: "이민정",
    age: 36,
    job: "직장인",
    request: "매월 일정 금액을 저축하고 싶습니다.",
    choices: [
      {
        text: "월 납입 가능 금액과 기간을 확인한다.",
        result: "고객님의 월 저축 가능 금액과 목적에 맞는 적금 상담을 진행했습니다.",
        satisfaction: 7
      },
      {
        text: "가장 금리가 높은 적금을 권유한다.",
        result: "금리만 안내하여 고객의 실제 저축 계획을 충분히 반영하지 못했습니다.",
        satisfaction: 1
      },
      {
        text: "적금과 출자금의 차이를 설명한다.",
        result: "적금과 출자금의 차이를 설명하고 선택할 수 있도록 도왔습니다.",
        satisfaction: 5
      }
    ]
  },
  {
    name: "최성호",
    age: 52,
    job: "건물 임대업",
    request: "건물 화재보험을 상담하고 싶습니다.",
    choices: [
      {
        text: "건물 구조와 기존 보험 가입 여부를 확인한다.",
        result: "건물의 용도와 기존 보험을 확인해 보장 공백을 점검했습니다.",
        satisfaction: 7
      },
      {
        text: "보험료부터 안내한다.",
        result: "보험료는 안내했지만 필요한 보장 내용을 충분히 확인하지 못했습니다.",
        satisfaction: 1
      },
      {
        text: "화재 발생 시 필요한 보장 내용을 설명한다.",
        result: "화재 사고에 대비한 보장 내용을 설명했습니다.",
        satisfaction: 5
      }
    ]
  },
  {
    name: "정미숙",
    age: 63,
    job: "연금 수령자",
    request: "생활자금이 필요해 햇살론 상담을 받고 싶습니다.",
    choices: [
      {
        text: "소득과 신용정보 및 보증 요건을 확인한다.",
        result: "소득과 신용정보, 보증 가능 여부를 먼저 확인하기로 했습니다.",
        satisfaction: 7
      },
      {
        text: "대출 가능 금액부터 약속한다.",
        result: "심사 전 대출 가능 금액을 단정적으로 안내해 고객에게 혼란을 줄 수 있습니다.",
        satisfaction: -8
      },
      {
        text: "필요 서류와 진행 절차를 안내한다.",
        result: "필요 서류와 심사 절차를 설명했습니다.",
        satisfaction: 5
      }
    ]
  }
];

function updateScreen() {
  document.getElementById("day").textContent = day;
  document.getElementById("sales").textContent = sales.toLocaleString();
  document.getElementById("satisfaction").textContent = satisfaction;
  document.getElementById("depositTotal").textContent =
    depositTotal.toLocaleString() + "만원";
  document.getElementById("loanTotal").textContent =
    loanTotal.toLocaleString() + "만원";
  document.getElementById("insuranceTotal").textContent =
    insuranceTotal + "건";

  let rank = "신입 직원";

  if (sales >= 50000) rank = "주임";
  if (sales >= 150000) rank = "대리";
  if (sales >= 300000) rank = "과장";
  if (sales >= 500000) rank = "차장";

  document.getElementById("rank").textContent = rank;
}

function nextCustomer() {
  if (customerFinished === false && customerIndex >= 0) {
    alert("현재 고객 응대를 먼저 완료해 주세요.");
    return;
  }

  if (dailyCustomers >= 3) {
    alert("오늘 방문 고객 응대가 모두 끝났습니다. 하루 마감을 진행해 주세요.");
    return;
  }

  customerIndex = (customerIndex + 1) % customers.length;
  customerFinished = false;
  dailyCustomers++;

  const customer = customers[customerIndex];

  document.getElementById("customerName").textContent =
    customer.name + " 고객님 (" + customer.age + "세)";

  document.getElementById("customerInfo").textContent =
    "직업: " + customer.job;

  document.getElementById("customerRequest").textContent =
    "상담 내용: " + customer.request;

  document.getElementById("dialogue").textContent =
    "고객: " + customer.request;

  const choices = document.getElementById("choices");
  choices.innerHTML = "";

  customer.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.textContent = (index + 1) + ". " + choice.text;

    button.onclick = function() {
      selectChoice(index);
    };

    choices.appendChild(button);
  });

  addLog(customer.name + " 고객 방문: " + customer.request);
}

function selectChoice(index) {
  if (customerFinished) return;

  const customer = customers[customerIndex];
  const choice = customer.choices[index];

  satisfaction += choice.satisfaction;

  if (satisfaction > 100) satisfaction = 100;
  if (satisfaction < 0) satisfaction = 0;

  document.getElementById("dialogue").textContent =
    choice.result;

  document.getElementById("choices").innerHTML =
    "<p>고객 만족도 변화: " +
    (choice.satisfaction > 0 ? "+" : "") +
    choice.satisfaction +
    "</p>";

  customerFinished = true;

  addLog(customer.name + " 고객 응대 완료: " + choice.text);
  updateScreen();
}

document.getElementById("nextCustomer").addEventListener(
  "click",
  nextCustomer
);

function openWork(type) {
  const panel = document.getElementById("workPanel");

  if (type === "deposit") {
    panel.innerHTML = `
      <h2>💰 예금 업무</h2>
      <p>고객님의 자금 상황에 맞춰 예금 상품을 상담하세요.</p>

      <div class="form-group">
        <label>업무 종류</label>
        <select id="depositType">
          <option value="정기예금">정기예금 신규</option>
          <option value="정기적금">정기적금 가입</option>
          <option value="출자금">출자금 가입</option>
        </select>
      </div>

      <div class="form-group">
        <label>가입 금액 (만원)</label>
        <input type="number" id="depositAmount" placeholder="예: 3000">
      </div>

      <div class="form-group">
        <label>연 금리 (%)</label>
        <input type="number" id="depositRate" value="3.5" step="0.01">
      </div>

      <div class="form-group">
        <label>예치 기간 (개월)</label>
        <input type="number" id="depositMonths" value="12">
      </div>

      <button class="main-btn" onclick="processDeposit()">예금 업무 처리하기</button>
      <div id="depositResult"></div>
    `;
  }

  if (type === "loan") {
    panel.innerHTML = `
      <h2>🏠 대출 심사 업무</h2>
      <p>대출 신청인의 기본 정보를 확인하고 가상 심사를 진행하세요.</p>

      <div class="form-group">
        <label>대출 종류</label>
        <select id="loanType">
          <option value="담보대출">부동산 담보대출</option>
          <option value="햇살론">햇살론</option>
          <option value="전세대출">전세자금대출</option>
        </select>
      </div>

      <div class="form-group">
        <label>신청 금액 (만원)</label>
        <input type="number" id="loanAmount" placeholder="예: 5000">
      </div>

      <div class="form-group">
        <label>연 소득 (만원)</label>
        <input type="number" id="income" placeholder="예: 4000">
      </div>

      <div class="form-group">
        <label>기존 금융기관 대출 (만원)</label>
        <input type="number" id="existingDebt" placeholder="예: 2000">
      </div>

      <div class="form-group">
        <label>신용점수</label>
        <input type="number" id="creditScore" value="800">
      </div>

      <button class="main-btn" onclick="processLoan()">가상 대출 심사하기</button>
      <div id="loanResult"></div>
    `;
  }

  if (type === "insurance") {
    panel.innerHTML = `
      <h2>🛡️ 공제 상담 업무</h2>
      <p>고객님의 생활환경과 필요한 보장을 확인하세요.</p>

      <div class="form-group">
        <label>상담 상품</label>
        <select id="insuranceType">
          <option value="화재공제">화재공제</option>
          <option value="운전자공제">운전자공제</option>
          <option value="간병공제">간병공제</option>
        </select>
      </div>

      <div class="form-group">
        <label>고객의 현재 상황</label>
        <select id="insuranceNeed">
          <option value="기존 보장 확인 필요">기존 보험을 점검하고 싶음</option>
          <option value="신규 보장 필요">새로운 보장이 필요함</option>
          <option value="보험료 부담">보험료 부담을 줄이고 싶음</option>
        </select>
      </div>

      <button class="main-btn" onclick="processInsurance()">공제 상담 진행하기</button>
      <div id="insuranceResult"></div>
    `;
  }

  if (type === "record") {
    let html = `
      <h2>📒 업무 일지</h2>
      <p>영업일 ${day}일차 누적 업무 기록입니다.</p>
      <div class="result">
        누적 실적: ${sales.toLocaleString()}만원<br>
        예금 실적: ${depositTotal.toLocaleString()}만원<br>
        대출 실적: ${loanTotal.toLocaleString()}만원<br>
        공제 상담: ${insuranceTotal}건<br>
        고객 만족도: ${satisfaction}점
      </div>
    `;

    html += "<h3>업무 기록</h3>";

    if (logs.length === 0) {
      html += "<p>아직 기록된 업무가 없습니다.</p>";
    }

    logs.slice().reverse().forEach(log => {
      html += `<div class="log-item">${escapeHTML(log)}</div>`;
    });

    panel.innerHTML = html;
  }
}

function processDeposit() {
  const type = document.getElementById("depositType").value;
  const amount = Number(document.getElementById("depositAmount").value);
  const rate = Number(document.getElementById("depositRate").value);
  const months = Number(document.getElementById("depositMonths").value);

  if (amount <= 0 || rate < 0 || months <= 0 ||
      !Number.isFinite(amount + rate + months)) {
    alert("금액, 금리, 기간을 올바르게 입력해 주세요.");
    return;
  }

  const interest = amount * (rate / 100) * (months / 12);
  const tax = interest * 0.154;
  const afterTax = interest - tax;

  if (type === "출자금") {
    depositTotal += amount;
    sales += amount;
  } else {
    depositTotal += amount;
    sales += amount;
  }

  const result = `
    <div class="result">
      <h3>가입 처리 완료!</h3>
      상품: ${type}<br>
      가입 금액: ${amount.toLocaleString()}만원<br>
      예상 세전 이자: ${interest.toFixed(2)}만원<br>
      일반과세 가정 세후 이자: ${afterTax.toFixed(2)}만원<br>
      ※ 단순 계산이며 실제 과세 및 상품 조건과 다를 수 있습니다.
    </div>
  `;

  document.getElementById("depositResult").innerHTML = result;

  addLog(`${type} 가입 ${amount.toLocaleString()}만원`);
  satisfaction = Math.min(100, satisfaction + 2);
  updateScreen();
}

function processLoan() {
  const type = document.getElementById("loanType").value;
  const amount = Number(document.getElementById("loanAmount").value);
  const income = Number(document.getElementById("income").value);
  const debt = Number(document.getElementById("existingDebt").value);
  const score = Number(document.getElementById("creditScore").value);

  if (
    amount <= 0 ||
    income < 0 ||
    debt < 0 ||
    score < 0 ||
    score > 1000 ||
    !Number.isFinite(amount + income + debt + score)
  ) {
    alert("입력 정보를 올바르게 확인해 주세요.");
    return;
  }

  let risk = 0;

  if (income === 0) risk += 3;
  if (debt > income * 3) risk += 2;
  if (score < 600) risk += 3;
  else if (score < 700) risk += 1;

  if (amount > income * 5) risk += 2;

  let decision = "추가 확인 필요";
  let message = "소득 및 부채 내역과 담보·보증 요건을 추가 확인해야 합니다.";

  if (risk <= 1) {
    decision = "기초 정보 양호";
    message = "기초 입력 정보상 큰 위험 신호는 적습니다. 정식 심사가 필요합니다.";
  }

  if (risk >= 5) {
    decision = "주의 필요";
    message = "상환 능력 또는 신용 관련 추가 검토가 필요합니다.";
  }

  const result = `
    <div class="result">
      <h3>가상 심사 결과: ${decision}</h3>
      대출 종류: ${type}<br>
      신청 금액: ${amount.toLocaleString()}만원<br>
      연 소득: ${income.toLocaleString()}만원<br>
      기존 대출: ${debt.toLocaleString()}만원<br>
      신용점수: ${score}점<br><br>
      검토 의견: ${message}<br>
      <strong>※ 게임용 단순 판단이며 실제 대출 승인이나 한도를 의미하지 않습니다.</strong>
    </div>
  `;

  document.getElementById("loanResult").innerHTML = result;

  if (risk <= 1) {
    loanTotal += amount;
    sales += amount;
    addLog(`${type} 가상 심사 기초 정보 양호: ${amount.toLocaleString()}만원`);
  } else {
    addLog(`${type} 가상 심사: 추가 확인 또는 주의 필요`);
  }

  updateScreen();
}

function processInsurance() {
  const type = document.getElementById("insuranceType").value;
  const need = document.getElementById("insuranceNeed").value;

  let guide = "";

  if (type === "화재공제") {
    guide = "건물의 용도, 구조, 면적, 소유 관계, 기존 보험 가입 여부와 필요한 보장 범위를 확인하세요.";
  } else if (type === "운전자공제") {
    guide = "운전 빈도, 기존 운전자보험, 벌금·변호사 선임 비용 등 약관상 보장 내용을 확인하세요.";
  } else {
    guide = "간병 필요 상황, 간호간병통합서비스, 보장 기간과 갱신 조건을 확인하세요.";
  }

  insuranceTotal++;
  satisfaction = Math.min(100, satisfaction + 3);

  document.getElementById("insuranceResult").innerHTML = `
    <div class="result">
      <h3>${type} 상담 완료</h3>
      고객 상황: ${need}<br><br>
      <strong>상담 가이드</strong><br>
      ${guide}<br><br>
      고객에게 충분히 설명하고 기존 보장과 중복 여부를 확인하세요.
    </div>
  `;

  addLog(`${type} 상담 진행: ${need}`);
  updateScreen();
}

function endDay() {
  if (dailyCustomers < 3) {
    const proceed = confirm(
      "아직 오늘의 고객 3명을 모두 응대하지 않았습니다. 그래도 마감할까요?"
    );

    if (!proceed) return;
  }

  const result = document.getElementById("dayResult");

  result.innerHTML = `
    <div class="result">
      <h3>${day}일차 영업 마감</h3>
      오늘까지 누적 실적: ${sales.toLocaleString()}만원<br>
      고객 만족도: ${satisfaction}점<br>
      오늘 방문 고객: ${dailyCustomers}명<br>
      수고하셨습니다!
    </div>
  `;

  addLog(`${day}일차 영업 마감`);

  day++;
  dailyCustomers = 0;
  customerIndex = -1;
  customerFinished = true;

  updateScreen();

  document.getElementById("customerName").textContent =
    "새로운 영업일이 시작되었습니다.";

  document.getElementById("customerInfo").textContent =
    "다음 고객 응대를 시작해 주세요.";

  document.getElementById("customerRequest").textContent = "";
  document.getElementById("dialogue").textContent =
    "오늘도 조합원을 위해 친절하게 응대해 보세요.";

  document.getElementById("choices").innerHTML = "";
}

function addLog(message) {
  const now = new Date();
  const time = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  logs.push(`[${day}일차 ${time}] ${message}`);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function(char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

updateScreen();
