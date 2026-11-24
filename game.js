
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* =========================================================
   춘천신협 근화지점 - 금융창구 시뮬레이터
   전체 교체용 game.js
========================================================= */

const $ = (id) => document.getElementById(id);

function makeElement(tag, id, parent = document.body) {
  let el = $(id);
  if (!el) {
    el = document.createElement(tag);
    el.id = id;
    parent.appendChild(el);
  }
  return el;
}

/* -------------------------
   화면 및 스타일
------------------------- */

const style = document.createElement("style");
style.textContent = `
*{box-sizing:border-box}
body{margin:0;overflow:hidden;background:#111;font-family:Arial,'Malgun Gothic',sans-serif}
#gameUI{position:fixed;inset:0;pointer-events:none;color:white;z-index:5}
#topHUD{position:absolute;top:15px;left:15px;background:#101827dd;padding:13px 18px;border-radius:12px;line-height:1.8;font-size:14px}
#crosshair{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:25px;text-shadow:0 0 5px black}
#hint{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#111c;padding:12px 20px;border-radius:9px;font-size:15px}
#startScreen{position:absolute;inset:0;background:linear-gradient(135deg,#122c3e,#14233a);display:flex;align-items:center;justify-content:center;pointer-events:auto}
#startBox{background:#fff;color:#172333;padding:35px;border-radius:18px;text-align:center;width:min(460px,90%);box-shadow:0 15px 50px #0008}
#startBox h1{margin-top:0;color:#087b62}
#startBox button,#dialog button,#computer button{border:0;border-radius:8px;padding:12px 16px;background:#087b62;color:white;font-weight:bold;cursor:pointer;margin:5px}
#startBox button{font-size:17px;padding:14px 35px}
#dialog,#computer{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(650px,92%);max-height:85vh;overflow:auto;background:#f8fafc;color:#172333;border-radius:16px;padding:23px;pointer-events:auto;box-shadow:0 15px 60px #0009;display:none}
#dialog h2,#computer h2{margin:0 0 8px;color:#087b62}
#dialog .profile{background:#e8f2ef;border-radius:10px;padding:12px;margin:12px 0;line-height:1.8}
#dialog .question{font-size:17px;font-weight:bold;margin:18px 0}
#dialog button.choice{display:block;width:100%;text-align:left;background:white;color:#172333;border:1px solid #ccd8d5;margin:8px 0;padding:13px}
#dialog button.choice:hover{background:#e1f4ed;border-color:#087b62}
#dialog button.close,#computer button.close{background:#555}
#computer .computerPanel{background:#e8eef2;padding:14px;border-radius:10px;line-height:1.9;margin:12px 0}
#computer button{margin:5px 4px 5px 0}
#bottomHUD{position:absolute;bottom:15px;left:15px;background:#101827cc;padding:10px 14px;border-radius:9px;font-size:13px}
#notice{position:absolute;top:20%;left:50%;transform:translateX(-50%);background:#087b62;color:white;padding:12px 22px;border-radius:9px;opacity:0;transition:opacity .3s}
`;
document.head.appendChild(style);

const ui = makeElement("div", "gameUI");
ui.innerHTML = `
  <div id="topHUD">
    <b>춘천신협 근화지점</b><br>
    영업일: <span id="day">1</span>일차<br>
    영업시간: <span id="clock">09:00</span><br>
    오늘 실적: <span id="sales">0</span>건<br>
    누적 점수: <span id="score">0</span>점
  </div>
  <div id="crosshair">＋</div>
  <div id="hint">WASD 이동 · 마우스 시점 · E 상호작용</div>
  <div id="bottomHUD">고객 만족도: <span id="satisfaction">100</span>%　|　근무 중</div>
  <div id="notice"></div>
  <div id="dialog"></div>
  <div id="computer"></div>
  <div id="startScreen">
    <div id="startBox">
      <h1>춘천신협 금융창구</h1>
      <p>근화지점 금융창구 시뮬레이터</p>
      <p>다양한 고객을 상담하고 금융 업무를 처리해 보세요.</p>
      <p>WASD 이동 / 마우스 시점 / E 상호작용</p>
      <button id="startButton">영업 시작하기</button>
    </div>
  </div>
`;
const dialog = $("dialog");
const computer = $("computer");

/* -------------------------
   게임 상태
------------------------- */

let scene, camera, renderer, clock;
let controlsLocked = false;
let gameStarted = false;
let dialogOpen = false;
let computerOpen = false;
let currentCustomer = null;
let customers = [];
let day = 1;
let minutes = 540;
let sales = 0;
let score = 0;
let satisfaction = 100;
let keys = {};
let customerNumber = 0;
let lastCustomerType = "";
let noticeTimer;

const player = { speed: 4.5, height: 1.65 };

function notify(message) {
  const el = $("notice");
  el.textContent = message;
  el.style.opacity = "1";
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => el.style.opacity = "0", 2300);
}

function updateHUD() {
  $("day").textContent = day;
  $("clock").textContent =
    String(Math.floor(minutes / 60)).padStart(2, "0") + ":" +
    String(minutes % 60).padStart(2, "0");
  $("sales").textContent = sales;
  $("score").textContent = score;
  $("satisfaction").textContent = Math.max(0, Math.min(100, satisfaction));
}

/* -------------------------
   30가지 상담 시나리오
------------------------- */

const scenarios = [
  {
    type: "예금 재예치",
    purpose: "만기된 정기예금을 다시 예치하고 싶습니다.",
    amount: "5,000만원",
    questions: [
      {
        q: "고객님께서 만기된 예금을 다시 예치하시려고 합니다. 가장 먼저 확인할 사항은?",
        a: [
          ["자금 사용 계획과 예치 기간을 확인한다", 10, "고객의 자금 계획을 확인했습니다."],
          ["무조건 가장 높은 금리만 안내한다", -5, "자금 계획을 확인하지 않아 아쉬워합니다."],
          ["바로 전액 재예치 처리한다", -10, "고객의 의사를 충분히 확인하지 않았습니다."]
        ]
      },
      {
        q: "고객님께서 저율과세 적용 여부를 궁금해하십니다.",
        a: [
          ["조합원 자격과 세제 적용 가능 여부를 확인한다", 10, "세제 혜택을 정확하게 안내했습니다."],
          ["누구나 무조건 적용된다고 안내한다", -10, "잘못된 안내로 고객이 불안해합니다."],
          ["세금 설명 없이 금리만 안내한다", -3, "고객이 아쉬워합니다."]
        ]
      },
      {
        q: "마지막으로 어떤 내용을 안내하는 것이 좋을까요?",
        a: [
          ["예치 기간, 적용 금리, 세금, 만기일을 설명한다", 10, "꼼꼼한 설명에 만족합니다."],
          ["서류에 서명만 요청한다", -5, "설명이 부족하다고 느낍니다."],
          ["다른 상품 가입을 강하게 권유한다", -5, "부담스럽다고 느낍니다."]
        ]
      }
    ]
  },
  {
    type: "타 금융기관 자금 유치",
    purpose: "농협에 있는 자금 4,000만원을 옮기고 싶습니다.",
    amount: "4,000만원",
    questions: [
      { q: "다른 금융기관에서 자금을 옮기려는 고객에게 먼저 할 일은?", a: [
        ["기존 예금 만기와 중도해지 여부를 확인한다", 10, "자금 이동 시점을 정확히 확인했습니다."],
        ["바로 이체부터 요청한다", -5, "확인이 부족합니다."],
        ["우리 금리가 무조건 높다고 말한다", -5, "비교 설명이 부족합니다."]
      ]},
      { q: "예금자보호에 대해 질문합니다.", a: [
        ["현재 적용되는 보호 제도와 한도를 정확히 안내한다", 10, "안정성에 대한 신뢰를 얻었습니다."],
        ["모든 상품이 똑같이 보호된다고 말한다", -10, "상품별 보호 여부 확인이 필요합니다."],
        ["보호 내용은 중요하지 않다고 말한다", -5, "고객이 불안해합니다."]
      ]}
    ]
  },
  {
    type: "신규 조합원 가입",
    purpose: "춘천신협 조합원이 되고 싶습니다.",
    amount: "출자금 문의",
    questions: [
      { q: "조합원 가입을 희망하는 고객에게 가장 먼저 확인할 것은?", a: [
        ["가입 자격과 필요한 서류를 확인한다", 10, "가입 절차를 정확히 안내했습니다."],
        ["출자금부터 무조건 납입하도록 한다", -5, "절차 안내가 부족합니다."],
        ["자격 확인 없이 가입 가능하다고 안내한다", -10, "잘못된 안내입니다."]
      ]},
      { q: "출자금의 특징을 설명해 달라고 합니다.", a: [
        ["출자금의 성격과 배당 가능성, 환급 관련 유의사항을 설명한다", 10, "고객이 충분히 이해했습니다."],
        ["예금과 완전히 같다고 설명한다", -10, "상품의 성격을 잘못 설명했습니다."],
        ["무조건 높은 수익을 보장한다고 말한다", -10, "확정 수익처럼 안내하면 안 됩니다."]
      ]}
    ]
  },
  {
    type: "정기적금 가입",
    purpose: "매월 일정 금액을 저축하고 싶습니다.",
    amount: "월 100만원",
    questions: [
      { q: "적금 가입 전 확인할 내용은?", a: [
        ["월 납입 가능 금액과 저축 기간을 확인한다", 10, "고객 상황에 맞는 상담입니다."],
        ["가장 높은 월 납입액으로 권유한다", -5, "고객의 부담을 고려하지 않았습니다."],
        ["중도해지 가능성은 설명하지 않는다", -5, "중요한 안내가 빠졌습니다."]
      ]}
    ]
  },
  {
    type: "체크온 적금",
    purpose: "우대금리를 받을 수 있는 적금에 가입하고 싶습니다.",
    amount: "월 85만원",
    questions: [
      { q: "우대금리 조건을 안내할 때 적절한 방법은?", a: [
        ["카드 발급 및 이용 조건 등 충족 여부를 확인한다", 10, "우대 조건을 정확히 안내했습니다."],
        ["조건을 충족하지 않아도 우대금리가 적용된다고 한다", -10, "부정확한 안내입니다."],
        ["기본금리만 안내하고 마무리한다", -3, "고객이 원하는 정보가 부족합니다."]
      ]}
    ]
  },
  {
    type: "입출금계좌 개설",
    purpose: "새로운 입출금계좌를 만들고 싶습니다.",
    amount: "신규 계좌",
    questions: [
      { q: "계좌 개설 시 가장 중요한 확인 사항은?", a: [
        ["실명 확인, 거래 목적, 금융거래 목적 증빙 등을 확인한다", 10, "기본 절차를 잘 확인했습니다."],
        ["신분증만 확인하고 바로 개설한다", -5, "추가 확인이 필요할 수 있습니다."],
        ["거래 목적을 묻지 않는다", -5, "확인 절차가 부족합니다."]
      ]}
    ]
  },
  {
    type: "모바일뱅킹 안내",
    purpose: "스마트폰으로 계좌를 관리하고 싶습니다.",
    amount: "앱 설치",
    questions: [
      { q: "모바일뱅킹 이용을 어려워하는 고객에게 어떻게 안내할까요?", a: [
        ["앱 설치부터 로그인, 이체 방법까지 직접 설명한다", 10, "친절한 설명에 만족합니다."],
        ["앱을 설치하고 혼자 해보라고 한다", -5, "고객이 어려워합니다."],
        ["비밀번호를 대신 설정하고 보관한다", -10, "보안상 부적절한 행동입니다."]
      ]}
    ]
  },
  {
    type: "OTP 발급 및 이체한도",
    purpose: "다른 은행으로 큰 금액을 이체하고 싶습니다.",
    amount: "3,000만원",
    questions: [
      { q: "큰 금액의 이체를 요청한 고객에게 먼저 할 일은?", a: [
        ["본인 확인과 이체한도, 인증수단 등록 여부를 확인한다", 10, "안전한 거래 절차를 안내했습니다."],
        ["직원이 고객 인증을 대신한다", -10, "보안상 부적절합니다."],
        ["한도 확인 없이 이체를 진행한다", -10, "사전 확인이 필요합니다."]
      ]}
    ]
  },
  {
    type: "아파트 담보대출",
    purpose: "아파트를 담보로 대출을 받고 싶습니다.",
    amount: "2억원 상담",
    questions: [
      { q: "담보대출 상담에서 먼저 확인할 것은?", a: [
        ["담보물 소재지, 소유관계, 선순위 권리, 소득을 확인한다", 10, "기초 심사를 잘 진행했습니다."],
        ["담보 시세만 보고 한도를 확정한다", -10, "상환능력과 선순위 확인이 필요합니다."],
        ["고객이 원하는 금액을 무조건 가능하다고 말한다", -10, "확정적인 안내는 부적절합니다."]
      ]},
      { q: "대출 가능 금액을 검토할 때 고려할 사항은?", a: [
        ["LTV, DSR, 선순위 채권, 방공제 등을 종합적으로 확인한다", 10, "종합적으로 검토했습니다."],
        ["LTV만 확인한다", -5, "다른 심사 요소도 확인해야 합니다."],
        ["담보물 가격만으로 결정한다", -10, "심사가 부족합니다."]
      ]}
    ]
  },
  {
    type: "다가구주택 담보대출",
    purpose: "다가구주택을 담보로 대출을 신청하고 싶습니다.",
    amount: "1억5천만원 상담",
    questions: [
      { q: "다가구주택 담보대출에서 특히 주의할 점은?", a: [
        ["임대차 현황과 선순위 보증금, 세대별 점유 관계를 확인한다", 10, "중요한 권리관계를 확인했습니다."],
        ["건물 시세만 확인한다", -10, "임대차 관계 확인이 필요합니다."],
        ["등기부등본 소유자만 확인한다", -5, "추가 확인이 필요합니다."]
      ]}
    ]
  },
  {
    type: "전세자금대출",
    purpose: "전세보증금 마련을 위해 대출을 받고 싶습니다.",
    amount: "1억원 상담",
    questions: [
      { q: "전세대출 상담 시 확인해야 할 내용은?", a: [
        ["임대차계약, 보증기관 요건, 주택 권리관계와 소득을 확인한다", 10, "필요 사항을 잘 확인했습니다."],
        ["보증금만 확인한다", -5, "심사 항목이 부족합니다."],
        ["계약서 없이 대출 가능 여부를 확정한다", -10, "확정 안내는 부적절합니다."]
      ]}
    ]
  },
  {
    type: "햇살론 일반보증",
    purpose: "고금리 대출을 낮은 금리로 바꾸고 싶습니다.",
    amount: "800만원 상담",
    questions: [
      { q: "햇살론 상담 시 우선 확인할 내용은?", a: [
        ["재직기간, 소득, 신용정보, 기존 채무와 보증 요건을 확인한다", 10, "기본 요건을 확인했습니다."],
        ["신용점수만 확인한다", -5, "소득과 재직 등도 확인해야 합니다."],
        ["무조건 승인된다고 안내한다", -10, "심사 전 확정 안내는 안 됩니다."]
      ]}
    ]
  },
  {
    type: "햇살론 특례보증",
    purpose: "소득이 많지 않아 정책서민금융 상담을 받고 싶습니다.",
    amount: "400만원 상담",
    questions: [
      { q: "특례보증 상담에서 적절한 접근은?", a: [
        ["보증기관 요건과 소득, 재직 및 기존 이용 이력을 확인한다", 10, "상담을 정확히 진행했습니다."],
        ["일반보증과 조건이 완전히 같다고 안내한다", -5, "상품별 요건을 확인해야 합니다."],
        ["기존 대위변제 여부를 확인하지 않는다", -10, "중요한 확인 사항이 누락됐습니다."]
      ]}
    ]
  },
  {
    type: "사업자 정책자금",
    purpose: "사업 운영자금을 마련하고 싶습니다.",
    amount: "3,000만원 상담",
    questions: [
      { q: "사업자 대출 상담에서 확인할 사항은?", a: [
        ["사업기간, 매출, 소득, 국세·지방세, 보증 요건을 확인한다", 10, "꼼꼼하게 확인했습니다."],
        ["사업자등록증만 확인한다", -5, "추가 서류가 필요합니다."],
        ["매출을 확인하지 않고 한도를 확정한다", -10, "심사가 부족합니다."]
      ]}
    ]
  },
  {
    type: "대출 만기연장",
    purpose: "기존 대출의 만기를 연장하고 싶습니다.",
    amount: "기존 대출 상담",
    questions: [
      { q: "만기연장 상담에서 확인해야 할 내용은?", a: [
        ["최근 소득과 상환능력, 담보가치, 연체 여부를 확인한다", 10, "상환능력을 확인했습니다."],
        ["기존 대출이 있으니 자동 연장된다고 한다", -10, "연장 심사가 필요합니다."],
        ["고객 요청만으로 기간을 확정한다", -5, "심사 절차가 필요합니다."]
      ]}
    ]
  },
  {
    type: "연체 고객 상담",
    purpose: "대출 이자가 연체되어 상담을 받고 싶습니다.",
    amount: "연체 관리",
    questions: [
      { q: "연체 고객에게 가장 적절한 상담 방법은?", a: [
        ["연체 원인과 상환 가능 일정을 차분히 확인한다", 10, "고객이 상담에 응합니다."],
        ["무조건 강하게 독촉한다", -10, "고객이 불쾌해합니다."],
        ["연체 사실을 확인하지 않고 넘어간다", -10, "채권 관리가 이루어지지 않았습니다."]
      ]}
    ]
  },
  {
    type: "화재공제 상담",
    purpose: "건물 화재보험 가입 여부를 상담하고 싶습니다.",
    amount: "건물 보장 상담",
    questions: [
      { q: "화재공제 상담에서 가장 먼저 할 일은?", a: [
        ["건물 용도와 구조, 기존 보험 가입 내역을 확인한다", 10, "고객 상황을 파악했습니다."],
        ["보장 내용을 확인하지 않고 가입을 권유한다", -10, "필요 보장 분석이 부족합니다."],
        ["보험료만 비교한다", -5, "보장 범위도 중요합니다."]
      ]},
      { q: "기존 보험이 있다고 합니다. 어떻게 할까요?", a: [
        ["기존 증권을 확인해 보장 공백과 중복 여부를 비교한다", 10, "신뢰도 높은 상담입니다."],
        ["기존 보험을 무조건 해지하라고 한다", -10, "부적절한 안내입니다."],
        ["기존 보험은 확인하지 않는다", -5, "고객에게 필요한 비교가 빠졌습니다."]
      ]}
    ]
  },
  {
    type: "간병공제 상담",
    purpose: "간병비 부담이 걱정되어 상담을 받고 싶습니다.",
    amount: "간병 보장 상담",
    questions: [
      { q: "간병 관련 공제 상담에서 확인할 내용은?", a: [
        ["기존 가입 내역, 보장 기간, 보장 범위와 갱신 조건을 확인한다", 10, "필요한 내용을 확인했습니다."],
        ["무조건 가입하는 것이 좋다고 말한다", -5, "개인별 상황을 고려해야 합니다."],
        ["보장 내용을 설명하지 않는다", -5, "설명이 부족합니다."]
      ]}
    ]
  },
  {
    type: "운전자공제 상담",
    purpose: "운전자 관련 보장을 알아보고 싶습니다.",
    amount: "운전자 보장 상담",
    questions: [
      { q: "운전자공제 상담 시 확인할 사항은?", a: [
        ["기존 가입 여부와 보장 항목, 가입 조건을 확인한다", 10, "적절한 상담입니다."],
        ["자동차보험과 운전자 보장이 같다고 설명한다", -10, "보장 성격이 다릅니다."],
        ["보장 한도는 확인하지 않는다", -5, "중요한 정보가 빠졌습니다."]
      ]}
    ]
  },
  {
    type: "공제금 청구",
    purpose: "사고가 발생해 공제금을 청구하고 싶습니다.",
    amount: "공제금 청구",
    questions: [
      { q: "공제금 청구 고객에게 먼저 안내할 것은?", a: [
        ["사고 내용과 가입 계약을 확인하고 필요 서류를 안내한다", 10, "정확한 절차를 안내했습니다."],
        ["무조건 지급된다고 말한다", -10, "심사 전 확정 안내는 안 됩니다."],
        ["고객에게 알아서 서류를 준비하라고 한다", -5, "안내가 부족합니다."]
      ]}
    ]
  },
  {
    type: "출자금 환급 문의",
    purpose: "출자금을 돌려받고 싶습니다.",
    amount: "출자금 문의",
    questions: [
      { q: "출자금 환급 문의에 어떻게 응대할까요?", a: [
        ["환급 절차와 신청 시기, 관련 규정을 확인해 안내한다", 10, "정확하게 안내했습니다."],
        ["예금처럼 바로 지급된다고 말한다", -10, "출자금은 예금과 다릅니다."],
        ["환급이 불가능하다고 단정한다", -5, "규정 확인이 필요합니다."]
      ]}
    ]
  },
  {
    type: "상속 및 명의변경",
    purpose: "가족 명의의 예금 관련 업무를 처리하고 싶습니다.",
    amount: "상속 관련 상담",
    questions: [
      { q: "상속 관련 업무에서 먼저 확인할 사항은?", a: [
        ["상속인 확인과 필요 서류, 상속 비율 및 관련 규정을 확인한다", 10, "절차를 정확히 안내했습니다."],
        ["가족이라는 말만 듣고 업무를 처리한다", -10, "본인 및 권리 확인이 필요합니다."],
        ["대표 상속인 한 명의 말만 듣고 처리한다", -10, "필요한 확인이 누락됐습니다."]
      ]}
    ]
  },
  {
    type: "금융종합과세 상담",
    purpose: "금융소득이 많아져 자금 운용을 상담하고 싶습니다.",
    amount: "고액 예금 상담",
    questions: [
      { q: "금융소득 관련 상담에서 중요한 것은?", a: [
        ["금융소득 규모와 세금, 건강보험료 등 영향을 함께 확인하도록 안내한다", 10, "종합적인 상담입니다."],
        ["금리만 높으면 된다고 설명한다", -5, "세금 영향을 고려해야 합니다."],
        ["세금은 무조건 줄일 수 있다고 말한다", -10, "확정적인 절세 안내는 부적절합니다."]
      ]}
    ]
  },
  {
    type: "예금 해지",
    purpose: "사업자금이 필요해 예금을 해지하고 싶습니다.",
    amount: "1억원 해지 문의",
    questions: [
      { q: "예금 해지 요청을 받았을 때 먼저 할 일은?", a: [
        ["해지 사유와 중도해지 이율, 자금 사용 계획을 확인한다", 10, "고객의 상황을 파악했습니다."],
        ["해지부터 바로 진행한다", -5, "대안 검토가 부족합니다."],
        ["해지를 무조건 만류한다", -5, "고객의 자금 계획을 존중해야 합니다."]
      ]}
    ]
  },
  {
    type: "예금자보호 안내",
    purpose: "신협 예금자보호가 궁금합니다.",
    amount: "보호 제도 문의",
    questions: [
      { q: "예금자보호 설명 시 적절한 방법은?", a: [
        ["신협의 보호 제도와 적용 대상, 한도를 정확히 설명한다", 10, "고객이 안심합니다."],
        ["모든 금융상품이 동일하게 보호된다고 한다", -10, "상품별 차이를 설명해야 합니다."],
        ["정확한 내용을 모른 채 답변한다", -10, "확인 후 안내해야 합니다."]
      ]}
    ]
  },
  {
    type: "급여통장 개설",
    purpose: "직장 급여를 받을 계좌를 만들고 싶습니다.",
    amount: "급여계좌",
    questions: [
      { q: "급여통장 개설 고객에게 추가로 안내하면 좋은 것은?", a: [
        ["모바일뱅킹과 체크카드, 자동이체 등 필요한 서비스를 안내한다", 10, "실생활에 도움이 되는 안내입니다."],
        ["계좌만 만들고 상담을 끝낸다", -2, "추가 안내가 부족합니다."],
        ["필요하지 않은 상품을 여러 개 권유한다", -5, "고객이 부담스러워합니다."]
      ]}
    ]
  },
  {
    type: "체크카드 발급",
    purpose: "체크카드를 발급받고 싶습니다.",
    amount: "카드 발급",
    questions: [
      { q: "체크카드 발급 시 확인할 내용은?", a: [
        ["카드 이용 조건과 결제 계좌, 혜택을 안내한다", 10, "고객이 이해했습니다."],
        ["혜택만 강조하고 조건은 설명하지 않는다", -5, "조건 설명이 필요합니다."],
        ["고객 동의 없이 부가서비스를 신청한다", -10, "동의가 필요합니다."]
      ]}
    ]
  },
  {
    type: "대출 이자 납부",
    purpose: "대출 이자 납부와 상환 일정을 확인하고 싶습니다.",
    amount: "이자 납부",
    questions: [
      { q: "이자 납부 상담에서 확인할 사항은?", a: [
        ["납부일과 납부 금액, 연체 여부를 확인한다", 10, "정확한 안내입니다."],
        ["대략적인 금액만 알려준다", -5, "정확한 확인이 필요합니다."],
        ["연체 여부를 확인하지 않는다", -5, "중요한 내용이 빠졌습니다."]
      ]}
    ]
  },
  {
    type: "신용점수 문의",
    purpose: "신용점수가 대출에 어떤 영향을 주는지 궁금합니다.",
    amount: "신용 상담",
    questions: [
      { q: "신용점수 관련 질문에 적절한 답변은?", a: [
        ["점수뿐 아니라 소득, 부채, 연체 이력 등 종합 심사임을 설명한다", 10, "정확한 설명입니다."],
        ["점수만 높으면 무조건 승인된다고 한다", -10, "심사 요소가 다양합니다."],
        ["신용점수는 대출과 관계없다고 한다", -5, "부정확한 설명입니다."]
      ]}
    ]
  },
  {
    type: "전세보증금 반환 문의",
    purpose: "전세보증금 반환 문제로 금융 상담을 받고 싶습니다.",
    amount: "보증금 상담",
    questions: [
      { q: "전세보증금 관련 상담에서 확인할 것은?", a: [
        ["임대차계약, 보증기관 가입 여부, 반환 일정과 채권 관계를 확인한다", 10, "상황을 잘 파악했습니다."],
        ["집주인이 반환할 것이라고 단정한다", -10, "확정할 수 없는 내용입니다."],
        ["계약 내용을 확인하지 않는다", -5, "상담이 부족합니다."]
      ]}
    ]
  },
  {
    type: "신규 사업자 계좌",
    purpose: "새로 사업을 시작해 사업자 계좌가 필요합니다.",
    amount: "사업자 계좌",
    questions: [
      { q: "사업자 계좌 개설 시 확인할 사항은?", a: [
        ["사업자등록증과 대표자 본인 확인, 거래 목적을 확인한다", 10, "절차를 잘 확인했습니다."],
        ["사업자등록증만 확인한다", -5, "추가 확인이 필요할 수 있습니다."],
        ["사업 목적을 확인하지 않는다", -5, "확인 절차가 부족합니다."]
      ]}
    ]
  },
  {
    type: "고령 고객 예금 상담",
    purpose: "노후자금을 안전하게 운용하고 싶습니다.",
    amount: "7,000만원",
    questions: [
      { q: "고령 고객의 예금 상담에서 중요한 태도는?", a: [
        ["이해하기 쉬운 말로 상품 특징과 유의사항을 설명한다", 10, "친절한 상담에 만족합니다."],
        ["전문 용어를 사용해 빠르게 설명한다", -5, "고객이 이해하기 어렵습니다."],
        ["가족에게만 설명하고 고객에게는 설명하지 않는다", -10, "고객 본인의 이해와 의사가 중요합니다."]
      ]}
    ]
  }
];

/* -------------------------
   랜덤 고객 정보
------------------------- */

const firstNames = [
  "김민수","이서연","박정호","최은정","정우진","강미영","윤지호","장현숙",
  "한도윤","오수진","임성호","조은희","신재민","문지영","백승우","황미숙",
  "권태현","안영숙","서지훈","유정희","남기철","송하늘","차민석","배수연",
  "전상호","홍지은","노영수","심정숙","고현우","양미경"
];

const jobs = [
  "회사원","자영업자","음식점 운영","건설업 종사자","공무원","교사",
  "병원 직원","요양보호사","택배 기사","미용실 운영","카페 운영",
  "제조업 근로자","은퇴자","연금 수령자","농업 종사자","프리랜서",
  "마트 직원","보험 설계사","운송업 종사자","개인 사업자"
];

const hairColors = [0x171717,0x302019,0x493326,0x77716a,0x171c2a];
const skinColors = [0xf1c9a9,0xe7b995,0xd8a47e,0xf4d3b5,0xc98f6c];
const clothesColors = [0x263e59,0x6a3d45,0x365c4d,0x393943,0x8a7255,0x45647c,0x6b617a];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomCustomer() {
  let scenario;
  let tries = 0;
  do {
    scenario = randomItem(scenarios);
    tries++;
  } while (scenario.type === lastCustomerType && tries < 10);

  lastCustomerType = scenario.type;

  const gender = Math.random() > 0.5 ? "남성" : "여성";
  const age = Math.floor(23 + Math.random() * 49);
  const income = Math.floor(2200 + Math.random() * 5800);
  const credit = Math.floor(620 + Math.random() * 330);

  customerNumber++;

  return {
    id: customerNumber,
    name: randomItem(firstNames),
    gender,
    age,
    job: randomItem(jobs),
    income,
    credit,
    scenario,
    completed: false,
    step: 0,
    score: 0,
    appearance: {
      skin: randomItem(skinColors),
      hair: randomItem(hairColors),
      clothes: randomItem(clothesColors),
      height: 0.92 + Math.random() * 0.17,
      body: 0.9 + Math.random() * 0.2,
      hairstyle: Math.floor(Math.random() * 4),
      glasses: Math.random() > 0.75,
      bag: Math.random() > 0.55
    }
  };
}

/* -------------------------
   3D 캐릭터 제작
------------------------- */

function material(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function addMesh(parent, geometry, mat, x, y, z) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createHuman(customer, x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const a = customer.appearance;
  group.scale.set(a.body, a.height, a.body);

  const skin = material(a.skin);
  const hair = material(a.hair);
  const clothes = material(a.clothes);
  const dark = material(0x25252a);
  const white = material(0xf4f1e9);
  const eyeMat = material(0x181818);
  const shoe = material(0x202126);

  // 다리
  const legGeo = new THREE.CylinderGeometry(0.105, 0.12, 0.72, 12);
  const leftLeg = addMesh(group, legGeo, dark, -0.16, 0.48, 0);
  const rightLeg = addMesh(group, legGeo, dark, 0.16, 0.48, 0);

  // 신발
  const shoeGeo = new THREE.BoxGeometry(0.22, 0.12, 0.34);
  addMesh(group, shoeGeo, shoe, -0.16, 0.08, -0.05);
  addMesh(group, shoeGeo, shoe, 0.16, 0.08, -0.05);

  // 몸통
  const torso = addMesh(
    group,
    new THREE.CapsuleGeometry(0.29, 0.53, 5, 12),
    clothes,
    0, 1.23, 0
  );
  torso.scale.set(1, 1, 0.68);

  // 목
  addMesh(group, new THREE.CylinderGeometry(0.09, 0.1, 0.17, 12), skin, 0, 1.67, 0);

  // 얼굴
  const head = new THREE.Group();
  head.position.set(0, 1.93, 0);
  group.add(head);

  addMesh(head, new THREE.SphereGeometry(0.235, 24, 24), skin, 0, 0, 0);

  // 귀
  addMesh(head, new THREE.SphereGeometry(0.055, 12, 12), skin, -0.23, 0, 0);
  addMesh(head, new THREE.SphereGeometry(0.055, 12, 12), skin, 0.23, 0, 0);

  // 눈
  addMesh(head, new THREE.SphereGeometry(0.025, 10, 10), eyeMat, -0.085, 0.045, 0.205);
  addMesh(head, new THREE.SphereGeometry(0.025, 10, 10), eyeMat, 0.085, 0.045, 0.205);

  // 눈썹
  addMesh(head, new THREE.BoxGeometry(0.07, 0.018, 0.025), hair, -0.085, 0.095, 0.21);
  addMesh(head, new THREE.BoxGeometry(0.07, 0.018, 0.025), hair, 0.085, 0.095, 0.21);

  // 코
  addMesh(head, new THREE.SphereGeometry(0.035, 12, 12), skin, 0, -0.015, 0.22);

  // 입
  addMesh(head, new THREE.BoxGeometry(0.075, 0.012, 0.018), material(0x914e4e), 0, -0.09, 0.21);

  // 헤어스타일
  if (a.hairstyle === 0) {
    addMesh(head, new THREE.SphereGeometry(0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.075, 0);
  } else if (a.hairstyle === 1) {
    addMesh(head, new THREE.SphereGeometry(0.245, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.65), hair, 0, 0.09, 0);
    addMesh(head, new THREE.BoxGeometry(0.12, 0.25, 0.16), hair, 0, -0.13, -0.13);
  } else if (a.hairstyle === 2) {
    addMesh(head, new THREE.SphereGeometry(0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), hair, 0, 0.07, 0);
    addMesh(head, new THREE.SphereGeometry(0.12, 12, 12), hair, 0, 0.2, -0.08);
  } else {
    addMesh(head, new THREE.SphereGeometry(0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.08, 0);
    addMesh(head, new THREE.SphereGeometry(0.09, 12, 12), hair, -0.17, 0.03, -0.02);
    addMesh(head, new THREE.SphereGeometry(0.09, 12, 12), hair, 0.17, 0.03, -0.02);
  }

  // 안경
  if (a.glasses) {
    const frame = material(0x252525);
    const ringGeo = new THREE.TorusGeometry(0.045, 0.008, 6, 16);
    const g1 = addMesh(head, ringGeo, frame, -0.085, 0.045, 0.222);
    const g2 = addMesh(head, ringGeo, frame, 0.085, 0.045, 0.222);
    g1.scale.set(1, 0.8, 0.4);
    g2.scale.set(1, 0.8, 0.4);
    addMesh(head, new THREE.BoxGeometry(0.06, 0.008, 0.01), frame, 0, 0.045, 0.222);
  }

  // 팔
  const armGeo = new THREE.CapsuleGeometry(0.075, 0.48, 4, 10);
  const leftArm = addMesh(group, armGeo, clothes, -0.39, 1.25, 0);
  const rightArm = addMesh(group, armGeo, clothes, 0.39, 1.25, 0);
  leftArm.rotation.z = -0.12;
  rightArm.rotation.z = 0.12;

  // 손
  addMesh(group, new THREE.SphereGeometry(0.075, 12, 12), skin, -0.4, 0.91, 0);
  addMesh(group, new THREE.SphereGeometry(0.075, 12, 12), skin, 0.4, 0.91, 0);

  // 가방
  if (a.bag) {
    addMesh(group, new THREE.BoxGeometry(0.27, 0.31, 0.12), material(0x49372d), 0.48, 1.02, -0.05);
  }

  // 이름표
  const nameTag = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.1, 0.02),
    material(0xffffff)
  );
  nameTag.position.set(0, 1.38, 0.2);
  group.add(nameTag);

  group.userData.customer = customer;
  group.userData.head = head;
  group.userData.arms = [leftArm, rightArm];
  group.userData.baseY = 0;

  scene.add(group);
  return group;
}

/* -------------------------
   영업점 환경
------------------------- */

function createRoom() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc6d5dc);
  scene.fog = new THREE.Fog(0xc6d5dc, 18, 42);

  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, player.height, 7);
  camera.rotation.order = "YXZ";

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x71818b, 2));

  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(-5, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  const floor = addMesh(
    scene,
    new THREE.BoxGeometry(24, 0.2, 24),
    material(0xb7b1a7),
    0, -0.12, 0
  );

  const wallMat = material(0xe5e8e5);
  addMesh(scene, new THREE.BoxGeometry(24, 5, 0.25), wallMat, 0, 2.4, -6);
  addMesh(scene, new THREE.BoxGeometry(0.25, 5, 12), wallMat, -12, 2.4, 0);
  addMesh(scene, new THREE.BoxGeometry(0.25, 5, 12), wallMat, 12, 2.4, 0);
  addMesh(scene, new THREE.BoxGeometry(24, 5, 0.25), wallMat, 0, 2.4, 6);

  // 천장
  addMesh(scene, new THREE.BoxGeometry(24, 0.2, 12), material(0xf2f2ed), 0, 5, 0);

  // 간판
  const sign = addMesh(
    scene,
    new THREE.BoxGeometry(6.5, 0.85, 0.18),
    material(0x087b62),
    0, 3.9, -5.75
  );

  // 창구
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 3.5;
    addMesh(scene, new THREE.BoxGeometry(2.9, 1.05, 0.85), material(0x8b684a), x, 0.55, -2.3);
    addMesh(scene, new THREE.BoxGeometry(2.95, 0.09, 0.9), material(0x403b36), x, 1.12, -2.3);
    addMesh(scene, new THREE.BoxGeometry(0.9, 0.65, 0.08), material(0x252b30), x, 1.65, -2.05);
    addMesh(scene, new THREE.BoxGeometry(0.78, 0.5, 0.04), material(0x76a8b8), x, 1.65, -2.0);
  }

  // 상담실
  addMesh(scene, new THREE.BoxGeometry(3.2, 0.12, 1.6), material(0x785b42), -7, 0.85, -3.5);
  for (const x of [-8.2, -5.8]) {
    addMesh(scene, new THREE.BoxGeometry(0.15, 1.7, 0.15), material(0x66503d), x, 1.8, -4.8);
  }

  // 의자
  for (let i = 0; i < 4; i++) {
    const x = -4.5 + i * 3;
    addMesh(scene, new THREE.BoxGeometry(0.8, 0.15, 0.8), material(0x31516a), x, 0.55, 2);
    addMesh(scene, new THREE.BoxGeometry(0.8, 0.9, 0.12), material(0x31516a), x, 1, 2.35);
    for (const dx of [-0.3, 0.3]) {
      addMesh(scene, new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), material(0x333333), x + dx, 0.25, 2);
    }
  }

  // 화분
  for (const x of [-10, 10]) {
    addMesh(scene, new THREE.CylinderGeometry(0.35, 0.28, 0.5, 12), material(0x9b6748), x, 0.25, -4);
    const plant = new THREE.Group();
    plant.position.set(x, 0.5, -4);
    scene.add(plant);
    for (let i = 0; i < 7; i++) {
      const leaf = addMesh(plant, new THREE.SphereGeometry(0.17, 8, 8), material(0x287548), (Math.random() - 0.5) * 0.5, 0.5 + Math.random() * 0.5, (Math.random() - 0.5) * 0.5);
      leaf.scale.set(0.7, 2, 0.6);
    }
  }

  // ATM
  addMesh(scene, new THREE.BoxGeometry(1.2, 2.2, 0.65), material(0x536a79), 9, 1.1, -4.5);
  addMesh(scene, new THREE.BoxGeometry(0.75, 0.5, 0.06), material(0x17252e), 9, 1.55, -4.15);
  addMesh(scene, new THREE.BoxGeometry(0.45, 0.08, 0.06), material(0x222222), 9, 0.95, -4.15);

  // 바닥 장식
  for (let i = 0; i < 8; i++) {
    addMesh(scene, new THREE.BoxGeometry(0.025, 0.01, 12), material(0xaaa59c), -10 + i * 2.8, 0.0, 0);
  }

  // 전산 상호작용 지점
  const terminal = new THREE.Group();
  terminal.position.set(4.8, 0, -2.3);
  scene.add(terminal);
  addMesh(terminal, new THREE.BoxGeometry(1.6, 1, 0.8), material(0x765b44), 0, 0.5, 0);
  addMesh(terminal, new THREE.BoxGeometry(0.8, 0.55, 0.06), material(0x1e2c34), 0, 1.25, -0.1);
  terminal.userData.type = "computer";
  terminal.userData.interactable = true;
  interactables.push(terminal);
}

const interactables = [];

/* -------------------------
   고객 생성 / 교체
------------------------- */

function clearCustomers() {
  for (const c of customers) {
    scene.remove(c.mesh);
  }
  customers = [];
}

function spawnCustomers() {
  clearCustomers();

  const positions = [
    [-4.4, -1.0],
    [-1.5, -1.0],
    [1.5, -1.0],
    [4.4, -1.0]
  ];

  for (let i = 0; i < 4; i++) {
    const customer = randomCustomer();
    customer.mesh = createHuman(customer, positions[i][0], positions[i][1]);
    customer.mesh.rotation.y = Math.PI;
    customers.push(customer);
  }
  notify("새로운 고객들이 방문했습니다.");
}

function replaceCustomer(oldCustomer) {
  if (oldCustomer?.mesh) scene.remove(oldCustomer.mesh);

  const index = customers.indexOf(oldCustomer);
  if (index === -1) return;

  const positions = [
    [-4.4, -1.0],
    [-1.5, -1.0],
    [1.5, -1.0],
    [4.4, -1.0]
  ];

  const next = randomCustomer();
  const pos = positions[index];
  next.mesh = createHuman(next, pos[0], pos[1]);
  next.mesh.rotation.y = Math.PI;
  customers[index] = next;
}

/* -------------------------
   상담 진행
------------------------- */

function openCustomer(customer) {
  if (dialogOpen || computerOpen) return;

  currentCustomer = customer;
  dialogOpen = true;
  renderer.domElement.exitPointerLock?.();

  renderQuestion();
  dialog.style.display = "block";
}

function renderQuestion() {
  const c = currentCustomer;
  if (!c) return;

  const questions = c.scenario.questions;
  const question = questions[c.step];

  if (!question) {
    finishCustomer();
    return;
  }

  dialog.innerHTML = `
    <h2>고객 상담</h2>
    <div class="profile">
      <b>${c.name} 고객님</b><br>
      성별: ${c.gender}　나이: ${c.age}세<br>
      직업: ${c.job}<br>
      연소득: ${c.income.toLocaleString()}만원<br>
      신용점수: ${c.credit}점<br>
      상담 내용: ${c.scenario.type}<br>
      상담 금액: ${c.scenario.amount}
    </div>
    <p><b>고객 요청</b><br>${c.scenario.purpose}</p>
    <div class="question">${question.q}</div>
    ${question.a.map((answer, i) =>
      `<button class="choice" data-choice="${i}">${i + 1}. ${answer[0]}</button>`
    ).join("")}
    <button class="close" id="closeDialog">상담 나가기</button>
  `;

  dialog.querySelectorAll("[data-choice]").forEach(btn => {
    btn.addEventListener("click", () => chooseAnswer(Number(btn.dataset.choice)));
  });

  $("closeDialog").addEventListener("click", closeDialog);
}

function chooseAnswer(index) {
  const c = currentCustomer;
  if (!c) return;

  const question = c.scenario.questions[c.step];
  const answer = question.a[index];

  c.score += answer[1];
  satisfaction += answer[1] / 2;
  score += Math.max(0, answer[1]);

  notify(answer[2]);

  c.step++;
  minutes += 4;

  updateHUD();

  if (c.step >= c.scenario.questions.length) {
    setTimeout(finishCustomer, 500);
  } else {
    setTimeout(renderQuestion, 500);
  }
}

function finishCustomer() {
  if (!currentCustomer) return;

  const c = currentCustomer;
  sales++;

  const result = c.score >= 15 ? "매우 만족" :
    c.score >= 5 ? "만족" :
    c.score >= 0 ? "보통" : "불만족";

  dialog.innerHTML = `
    <h2>상담 완료</h2>
    <div class="profile">
      <b>${c.name} 고객님</b><br>
      상담 업무: ${c.scenario.type}<br>
      상담 결과: ${result}<br>
      상담 점수: ${c.score}점
    </div>
    <p>${result === "매우 만족" || result === "만족"
      ? "고객님께서 친절한 상담에 만족하셨습니다."
      : "고객님께서 아쉬움을 느끼셨습니다. 다음 상담에서는 더 정확한 안내가 필요합니다."}</p>
    <button id="finishButton">다음 고객 응대하기</button>
  `;

  $("finishButton").addEventListener("click", () => {
    dialog.style.display = "none";
    dialogOpen = false;
    replaceCustomer(c);
    currentCustomer = null;
    updateHUD();
    notify("다음 고객이 방문했습니다.");
  });

  updateHUD();
}

function closeDialog() {
  dialog.style.display = "none";
  dialogOpen = false;
  currentCustomer = null;
}

/* -------------------------
   전산 업무
------------------------- */

function openComputer() {
  if (dialogOpen || computerOpen) return;

  computerOpen = true;
  renderer.domElement.exitPointerLock?.();

  computer.style.display = "block";
  renderComputer();
}

function renderComputer() {
  computer.innerHTML = `
    <h2>춘천신협 전산 업무</h2>
    <p>업무를 선택하여 처리하세요.</p>
    <div class="computerPanel">
      <b>오늘의 영업 현황</b><br>
      상담 완료: ${sales}건<br>
      누적 점수: ${score}점<br>
      고객 만족도: ${Math.round(satisfaction)}%
    </div>
    <button data-task="deposit">예금 신규 등록</button>
    <button data-task="loan">여신 사전 검토</button>
    <button data-task="sunshine">햇살론 상담 등록</button>
    <button data-task="insurance">공제 상담 기록</button>
    <button data-task="member">조합원 가입 안내</button>
    <button data-task="account">계좌 개설 업무</button>
    <div id="computerResult" class="computerPanel">처리할 업무를 선택하세요.</div>
    <button class="close" id="closeComputer">닫기</button>
  `;

  computer.querySelectorAll("[data-task]").forEach(btn => {
    btn.addEventListener("click", () => processComputerTask(btn.dataset.task));
  });

  $("closeComputer").addEventListener("click", closeComputer);
}

function processComputerTask(task) {
  const tasks = {
    deposit: ["예금 신규 등록", "고객 실명 확인, 거래 목적, 자금 출처 및 상품 조건을 확인합니다."],
    loan: ["여신 사전 검토", "소득, 신용정보, 기존 채무, 담보물 권리관계와 상환능력을 확인합니다."],
    sunshine: ["햇살론 상담 등록", "재직기간, 소득증빙, 보증 요건과 기존 이용 이력을 확인합니다."],
    insurance: ["공제 상담 기록", "기존 가입 내역과 고객의 보장 필요 사항을 확인합니다."],
    member: ["조합원 가입 안내", "가입 자격, 출자금, 조합원 권리와 유의사항을 안내합니다."],
    account: ["계좌 개설 업무", "실명 확인과 거래 목적, 금융거래 목적 증빙을 확인합니다."]
  };

  const item = tasks[task];
  $("computerResult").innerHTML = `
    <b>${item[0]}</b><br>
    ${item[1]}<br>
    <span style="color:#087b62">업무 확인 완료</span>
  `;

  score += 2;
  minutes += 3;
  updateHUD();
}

function closeComputer() {
  computer.style.display = "none";
  computerOpen = false;
}

/* -------------------------
   플레이어 이동 및 상호작용
------------------------- */

let yaw = 0;
let pitch = 0;

function movePlayer(delta) {
  if (!gameStarted || dialogOpen || computerOpen || !controlsLocked) return;

  const direction = new THREE.Vector3();
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  if (keys["KeyW"]) direction.add(forward);
  if (keys["KeyS"]) direction.sub(forward);
  if (keys["KeyD"]) direction.add(right);
  if (keys["KeyA"]) direction.sub(right);

  if (direction.lengthSq() > 0) {
    direction.normalize();
    const speed = keys["ShiftLeft"] ? 7 : player.speed;
    camera.position.addScaledVector(direction, speed * delta);
  }

  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -10.8, 10.8);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.3, 5.3);
  camera.position.y = player.height;
}

function interact() {
  if (!gameStarted || dialogOpen || computerOpen) return;

  let nearest = null;
  let nearestDistance = 3.5;

  for (const c of customers) {
    const d = camera.position.distanceTo(c.mesh.position);
    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = c;
    }
  }

  const terminalDistance = camera.position.distanceTo(new THREE.Vector3(4.8, 0, -2.3));

  if (nearest && nearestDistance < terminalDistance) {
    openCustomer(nearest);
  } else if (terminalDistance < 3.5) {
    openComputer();
  } else {
    notify("상호작용할 대상이 가까이 없습니다.");
  }
}

/* -------------------------
   키보드 / 마우스
------------------------- */

document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "KeyE") interact();

  if (e.code === "Escape") {
    if (dialogOpen) closeDialog();
    if (computerOpen) closeComputer();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

rendererPointerEvents();

function rendererPointerEvents() {
  document.addEventListener("mousemove", (e) => {
    if (!controlsLocked || dialogOpen || computerOpen) return;

    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = THREE.MathUtils.clamp(pitch, -1.3, 1.3);

    camera.rotation.set(pitch, yaw, 0);
  });

  document.addEventListener("pointerlockchange", () => {
    controlsLocked = document.pointerLockElement === renderer.domElement;
    if (controlsLocked) $("hint").textContent = "WASD 이동 · E 상호작용 · Shift 달리기";
    else if (gameStarted && !dialogOpen && !computerOpen) {
      $("hint").textContent = "화면을 클릭하면 마우스 시점이 활성화됩니다.";
    }
  });

  renderer.domElement.addEventListener("click", () => {
    if (gameStarted && !dialogOpen && !computerOpen && !controlsLocked) {
      renderer.domElement.requestPointerLock();
    }
  });
}

/* -------------------------
   게임 시간
------------------------- */

let timeAccumulator = 0;

function updateGameTime(delta) {
  timeAccumulator += delta;

  if (timeAccumulator >= 12) {
    minutes++;
    timeAccumulator = 0;

    if (minutes >= 1080) {
      minutes = 540;
      day++;
      notify("영업일이 변경되었습니다. 새로운 하루가 시작됩니다.");
      spawnCustomers();
    }

    updateHUD();
  }
}

/* -------------------------
   애니메이션
------------------------- */

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (gameStarted) {
    movePlayer(delta);
    updateGameTime(delta);

    const t = performance.now() * 0.001;

    for (const c of customers) {
      if (c.mesh) {
        c.mesh.userData.head.rotation.y = Math.sin(t * 0.8 + c.id) * 0.06;
        c.mesh.userData.head.rotation.x = Math.sin(t * 1.2 + c.id) * 0.025;
        c.mesh.userData.arms[0].rotation.z = -0.12 + Math.sin(t * 1.5 + c.id) * 0.025;
        c.mesh.userData.arms[1].rotation.z = 0.12 - Math.sin(t * 1.5 + c.id) * 0.025;
        c.mesh.position.y = Math.sin(t * 1.5 + c.id) * 0.012;
      }
    }
  }

  renderer.render(scene, camera);
}

/* -------------------------
   게임 시작
------------------------- */

$("startButton").addEventListener("click", () => {
  gameStarted = true;
  $("startScreen").style.display = "none";
  spawnCustomers();
  renderer.domElement.requestPointerLock();
  notify("춘천신협 근화지점 영업을 시작합니다.");
});

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

createRoom();
updateHUD();
animate();
