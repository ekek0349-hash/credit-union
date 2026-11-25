
"use strict";

/* ==========================================
   춘천신협 금융창구 시뮬레이터
   다단계 대화 / 다양한 고객 / 복합 업무
========================================== */

const $ = id => document.getElementById(id);

const game = {
  started: false,
  day: 1,
  hour: 9,
  minute: 0,
  sales: 0,
  satisfaction: 100,
  completed: 0,
  ticket: 1,
  nextId: 1,
  queue: [],
  current: null,
  step: 0,
  busy: false,
  selectedTax: null,
  customerBag: [],
  timer: null
};

const scenarios = [
  {
    name: "김영수", age: 67, emoji: "👨🏻‍🦳",
    profile: "기존 조합원 · 퇴계동 거주 · 정기예금 만기",
    purpose: "예금 재예치 및 비과세 상담",
    amount: 50000000,
    steps: [
      ["안녕하세요. 오늘 정기예금 5천만 원이 만기됐는데 다시 맡기려고 합니다.", [
        ["먼저 자금 사용 계획과 원하시는 예치 기간을 여쭤보겠습니다.", 2],
        ["무조건 1년으로 가입하시는 게 좋겠습니다.", 0]
      ]],
      ["당장 사용할 돈은 아니고 1년 정도 생각하고 있어요. 금리가 얼마나 되나요?", [
        ["현재 가입 가능한 금리와 기간별 상품을 비교해 안내하겠습니다.", 2],
        ["금리는 중요하지 않으니 바로 가입하시죠.", 0]
      ]],
      ["그런데 예금을 가입할 때 비과세 혜택도 받을 수 있나요?", "tax"],
      ["비과세종합저축과 신협에서 말하는 비과세 혜택은 어떻게 다른가요?", [
        ["가입 대상과 적용 한도, 관련 요건이 서로 다르므로 각각 확인해야 합니다.", 2],
        ["둘 다 같은 혜택이니 아무거나 선택하면 됩니다.", 0]
      ]],
      ["다른 은행에도 예금이 있는데 거기서 혜택을 받고 있는지도 확인해야 하나요?", [
        ["네. 기존 가입액과 잔여 한도, 적용 요건을 확인하겠습니다.", 2],
        ["다른 금융기관 가입 내역은 확인할 필요가 없습니다.", 0]
      ]],
      ["좋아요. 5천만 원을 1년 맡기면 세후 이자가 얼마나 되나요?", "deposit"],
      ["이자는 만기 때 받는 걸로 하고 싶어요. 중간에 해지하면 어떻게 되나요?", [
        ["중도해지 시 약정금리보다 낮은 중도해지 이율이 적용될 수 있습니다.", 2],
        ["중간에 해지해도 약정이자는 그대로 지급됩니다.", 0]
      ]],
      ["그럼 가입할게요. 혹시 출자금도 추가로 넣으면 좋은 점이 있나요?", [
        ["출자금은 예금과 다르고 조합원 자격 및 배당과 관련된 자금입니다. 차이를 안내하겠습니다.", 2],
        ["출자금도 예금과 완전히 동일합니다.", 0]
      ]],
      ["설명 잘 들었습니다. 예금과 출자금 조건을 확인하고 진행할게요.", [
        ["최종 가입 금액과 과세 유형, 만기일을 다시 확인한 뒤 진행하겠습니다.", 2],
        ["확인 없이 바로 처리하겠습니다.", 0]
      ]]
    ]
  },

  {
    name: "박미숙", age: 59, emoji: "👩🏻",
    profile: "신규 방문 · 근화동 거주 · 직장인",
    purpose: "적금 가입 및 입출금 계좌 개설",
    amount: 1000000,
    steps: [
      ["매달 100만 원씩 적금을 들고 싶은데 어떤 상품이 좋을까요?", [
        ["가입 기간과 납입 방식, 우대금리 조건을 먼저 확인하겠습니다.", 2],
        ["가장 금리가 높은 상품으로 무조건 가입하세요.", 0]
      ]],
      ["1년 정도 생각하고 있어요. 월급날이 25일인데 자동이체도 되나요?", [
        ["네. 출금 계좌와 희망 이체일을 확인해 자동이체를 신청할 수 있습니다.", 2],
        ["자동이체는 불가능합니다.", 0]
      ]],
      ["그런데 아직 신협 입출금 계좌가 없어요. 새로 만들어야 하나요?", [
        ["기존 계좌 보유 여부와 금융거래 목적을 확인한 뒤 개설 절차를 안내하겠습니다.", 2],
        ["아무 확인 없이 바로 만들어 드리겠습니다.", 0]
      ]],
      ["체크카드도 같이 만들 수 있나요?", [
        ["네. 카드 종류와 이용 조건, 결제 계좌를 확인해 드리겠습니다.", 2],
        ["체크카드는 적금과 관계없으니 만들 필요 없습니다.", 0]
      ]],
      ["적금 이자에도 세금이 붙나요?", "tax"],
      ["월 100만 원씩 1년 넣으면 만기 때 얼마 정도 받을 수 있나요?", "installment"],
      ["혹시 중간에 급하게 돈이 필요하면 적금을 해지해야 하나요?", [
        ["중도해지 이율과 상품별 일부 해지 가능 여부를 확인해 안내하겠습니다.", 2],
        ["언제 해지해도 만기 이자를 받을 수 있습니다.", 0]
      ]],
      ["좋네요. 라이프온 같은 앱도 사용할 수 있나요?", [
        ["네. 모바일 앱 설치와 간편 인증, 주요 이용 방법까지 안내하겠습니다.", 2],
        ["앱은 따로 안내해 드릴 수 없습니다.", 0]
      ]],
      ["그럼 적금과 계좌, 체크카드까지 같이 신청하겠습니다.", [
        ["신분증과 필요한 확인 사항을 점검하고 신청 내용을 최종 확인하겠습니다.", 2],
        ["신청 내용 확인 없이 바로 완료하겠습니다.", 0]
      ]]
    ]
  },

  {
    name: "이정훈", age: 42, emoji: "👨🏻‍💼",
    profile: "직장인 · 춘천 거주 · 기존 고객",
    purpose: "신용대출 상담 및 고금리 채무 확인",
    amount: 20000000,
    steps: [
      ["생활자금으로 2천만 원 정도 대출을 받고 싶습니다.", [
        ["소득과 재직기간, 기존 대출, 신용 상태를 확인하겠습니다.", 2],
        ["2천만 원은 바로 승인 가능합니다.", 0]
      ]],
      ["현재 회사에 3년째 근무하고 연봉은 4천만 원 정도입니다.", [
        ["재직 및 소득 증빙자료를 확인하고 상환 능력을 검토하겠습니다.", 2],
        ["연봉만으로 승인 여부를 확정할 수 있습니다.", 0]
      ]],
      ["카드론이 500만 원 정도 있는데 심사에 영향이 있나요?", [
        ["네. 카드론을 포함한 전체 부채와 상환 부담을 확인해야 합니다.", 2],
        ["카드론은 대출 심사와 관계없습니다.", 0]
      ]],
      ["금리가 높은 카드론부터 갚는 게 나을까요?", [
        ["금리와 중도상환 조건, 신규 대출 비용을 비교해 상환 계획을 검토하겠습니다.", 2],
        ["무조건 전부 갚으시면 됩니다.", 0]
      ]],
      ["그럼 제 조건으로 월 상환액을 계산해 주세요.", "loan"],
      ["대출을 받으려면 어떤 서류가 필요하죠?", [
        ["신분증, 재직 및 소득 확인자료와 금융거래 관련 자료 등을 안내하겠습니다.", 2],
        ["서류 없이 바로 실행할 수 있습니다.", 0]
      ]],
      ["대출을 받으면 급여통장도 신협으로 옮기는 게 좋을까요?", [
        ["급여이체 조건과 거래 혜택을 확인해 실제 이점이 있는지 안내하겠습니다.", 2],
        ["무조건 옮겨야 합니다.", 0]
      ]],
      ["좋습니다. 심사부터 진행하고 싶습니다.", [
        ["신청 목적과 필요 금액을 다시 확인하고 서류 징구 및 심사 절차를 안내하겠습니다.", 2],
        ["심사 없이 승인 처리하겠습니다.", 0]
      ]]
    ]
  },

  {
    name: "최순자", age: 73, emoji: "👵🏻",
    profile: "기존 조합원 · 고령 고객 · 출자금 보유",
    purpose: "출자금 및 예금 상담",
    amount: 3000000,
    steps: [
      ["신협에 출자금을 넣으면 예금처럼 이자를 받을 수 있다고 들었어요.", [
        ["출자금은 예금과 달리 조합원 자격과 관련된 자금이고 배당은 결산 결과 등에 따라 달라집니다.", 2],
        ["출자금은 예금과 똑같습니다.", 0]
      ]],
      ["그럼 출자금은 예금자보호가 되는 건가요?", [
        ["출자금은 예금과 보호 구조가 다르므로 구분해서 설명드리겠습니다.", 2],
        ["예금과 동일하게 보호됩니다.", 0]
      ]],
      ["배당은 매년 얼마씩 받을 수 있나요?", [
        ["배당은 조합의 결산 및 총회 결정 등에 따라 달라지며 확정 수익은 아닙니다.", 2],
        ["매년 무조건 5%를 받을 수 있습니다.", 0]
      ]],
      ["제가 가진 예금 3천만 원도 만기가 다가오는데 어떻게 하면 좋을까요?", [
        ["자금 사용 계획과 예금자보호 한도, 과세 유형을 함께 확인하겠습니다.", 2],
        ["전부 출자금으로 바꾸세요.", 0]
      ]],
      ["예금 이자 세금도 궁금해요.", "tax"],
      ["혹시 만기 때 자동으로 다시 가입되게 할 수도 있나요?", [
        ["상품별 자동 재예치 가능 여부와 조건을 확인해 안내하겠습니다.", 2],
        ["모든 예금은 자동 재예치됩니다.", 0]
      ]],
      ["휴대전화로 잔액을 확인하고 싶은데 방법이 있나요?", [
        ["모바일뱅킹 가입과 본인 인증, 잔액 조회 방법을 안내하겠습니다.", 2],
        ["직접 방문해야만 확인할 수 있습니다.", 0]
      ]],
      ["그럼 출자금과 예금은 각각 조건을 확인하고 결정할게요.", [
        ["각각의 장단점과 유의사항을 다시 안내하고 고객님 의사를 확인하겠습니다.", 2],
        ["제가 알아서 전부 처리하겠습니다.", 0]
      ]]
    ]
  },

  {
    name: "윤태호", age: 35, emoji: "👨🏻",
    profile: "자영업자 · 음식점 운영 · 신규 방문",
    purpose: "햇살론 및 사업자 금융 상담",
    amount: 8000000,
    steps: [
      ["가게 운영자금이 필요해서 햇살론을 알아보고 있습니다.", [
        ["사업자 유형과 영업기간, 소득 및 기존 채무를 확인하겠습니다.", 2],
        ["사업자면 누구나 받을 수 있습니다.", 0]
      ]],
      ["사업은 2년 정도 했고 매출은 꾸준히 있습니다.", [
        ["사업자등록증과 소득자료, 실제 사업 운영 사실을 확인하겠습니다.", 2],
        ["매출만 있으면 무조건 가능합니다.", 0]
      ]],
      ["일반보증과 특례보증은 어떤 차이가 있나요?", [
        ["보증기관과 상품별 대상 요건, 한도 및 보증 조건을 구분해 안내하겠습니다.", 2],
        ["두 상품은 완전히 똑같습니다.", 0]
      ]],
      ["기존에 카드론이 300만 원 정도 있는데 영향이 있을까요?", [
        ["기존 채무와 연체 여부, 상환 부담을 함께 확인하겠습니다.", 2],
        ["기존 대출은 전혀 상관없습니다.", 0]
      ]],
      ["제 조건으로 어느 정도 가능한지 계산해 주세요.", "loan"],
      ["보증료도 별도로 내야 하나요?", [
        ["상품별 보증료율과 보증 조건을 확인해 실제 부담액을 설명하겠습니다.", 2],
        ["보증료는 무조건 없습니다.", 0]
      ]],
      ["사업자 통장도 신협으로 새로 만들 수 있나요?", [
        ["사업자 거래 목적과 필요한 서류를 확인해 계좌 개설 절차를 안내하겠습니다.", 2],
        ["사업자 통장은 만들 수 없습니다.", 0]
      ]],
      ["그럼 서류를 준비해서 신청하고 싶습니다.", [
        ["필요 서류와 보증 심사 절차, 대출 실행 전 유의사항을 안내하겠습니다.", 2],
        ["서류 없이 바로 실행하겠습니다.", 0]
      ]]
    ]
  },

  {
    name: "한지영", age: 51, emoji: "👩🏻‍💼",
    profile: "기존 고객 · 직장인 · 기존 공제 가입자",
    purpose: "간병인공제 및 기존 계약 점검",
    amount: 0,
    steps: [
      ["전에 가입한 간병인 보험이 있는데 보장이 괜찮은지 확인하고 싶어요.", [
        ["기존 증권과 보장 기간, 보장 범위 및 갱신 조건을 확인하겠습니다.", 2],
        ["기존 보험은 바로 해지하는 게 좋습니다.", 0]
      ]],
      ["가입한 지 5년 정도 됐고 80세 만기예요.", [
        ["만기 이후 보장 공백과 갱신 조건을 확인하겠습니다.", 2],
        ["80세 이후에는 보험이 필요 없습니다.", 0]
      ]],
      ["간호간병통합서비스 보장은 없는 것 같아요.", [
        ["기존 계약의 특약을 확인하고 보장 범위를 비교하겠습니다.", 2],
        ["간병인 보장과 통합서비스 보장은 무조건 같습니다.", 0]
      ]],
      ["새로 가입하면 보험료가 얼마나 나올까요?", [
        ["연령과 보장 금액, 가입 조건을 기준으로 설계안을 확인하겠습니다.", 2],
        ["누구나 같은 보험료입니다.", 0]
      ]],
      ["기존 계약을 먼저 해지해야 하나요?", [
        ["새 계약의 인수 여부와 보장 개시 시점을 확인하기 전에는 먼저 해지하지 않도록 안내하겠습니다.", 2],
        ["새 상품 가입 전에 무조건 해지하세요.", 0]
      ]],
      ["화재공제도 신협에서 가입할 수 있나요?", [
        ["네. 건물 용도와 구조, 면적 및 기존 가입 내용을 확인해 안내하겠습니다.", 2],
        ["화재공제는 취급하지 않습니다.", 0]
      ]],
      ["그럼 두 가지 상품을 비교해서 다시 설명해 주세요.", [
        ["기존 계약과 신규 설계안의 보장 범위, 보험료, 면책 사항을 비교하겠습니다.", 2],
        ["비교 없이 바로 가입하시죠.", 0]
      ]]
    ]
  },

  {
    name: "장민수", age: 45, emoji: "👨🏻‍💼",
    profile: "건물주 · 기존 조합원 · 임대사업",
    purpose: "건물 담보대출 및 화재공제",
    amount: 100000000,
    steps: [
      ["상가 건물을 담보로 대출을 받을 수 있는지 상담하고 싶습니다.", [
        ["건물 소재지와 용도, 소유 관계 및 대출 목적을 확인하겠습니다.", 2],
        ["건물만 있으면 바로 대출됩니다.", 0]
      ]],
      ["건물 시세는 대략 3억 원 정도 됩니다.", [
        ["시세만으로 판단하지 않고 감정평가와 담보 인정 기준을 확인하겠습니다.", 2],
        ["3억 원이면 무조건 2억 원 가능합니다.", 0]
      ]],
      ["기존에 다른 은행 대출이 5천만 원 있습니다.", [
        ["등기부상 선순위 권리와 기존 대출 잔액을 확인하겠습니다.", 2],
        ["기존 대출은 무시해도 됩니다.", 0]
      ]],
      ["임차인도 한 명 있는데 이 부분도 확인해야 하나요?", [
        ["임대차 현황과 보증금, 전입세대 및 선순위 권리를 확인해야 합니다.", 2],
        ["임차인은 담보대출과 관계없습니다.", 0]
      ]],
      ["대출 금액과 상환액을 계산해 주세요.", "loan"],
      ["건물 화재보험도 가입해야 할까요?", [
        ["건물 구조와 용도, 기존 보험의 보장 범위를 확인해 필요성을 설명하겠습니다.", 2],
        ["무조건 가장 비싼 상품으로 가입하세요.", 0]
      ]],
      ["기존에 가입한 보험이 있는데 중복되는지도 봐주세요.", [
        ["기존 증권을 확인해 보장 대상과 가입 금액, 보장 공백을 비교하겠습니다.", 2],
        ["기존 보험은 확인할 필요가 없습니다.", 0]
      ]],
      ["그럼 대출과 공제 모두 검토해 보겠습니다.", [
        ["각 업무의 필요 서류와 심사 절차를 구분해 안내하겠습니다.", 2],
        ["두 업무 모두 바로 승인하겠습니다.", 0]
      ]]
    ]
  },

  {
    name: "서은희", age: 62, emoji: "👩🏻‍🦳",
    profile: "기존 고객 · 예금 만기 · 금융소득 상담",
    purpose: "예금 재예치 및 금융소득 상담",
    amount: 80000000,
    steps: [
      ["이번에 예금 8천만 원이 만기됐어요. 다시 예치하려고 합니다.", [
        ["자금 사용 계획과 다른 금융기관 예금 현황을 확인하겠습니다.", 2],
        ["전액 한 번에 가입하시죠.", 0]
      ]],
      ["올해부터 금융소득종합과세 대상이 될 수도 있다고 하더라고요.", [
        ["금융소득 규모와 다른 소득 상황을 확인하고 세무 전문가 상담이 필요한 부분도 구분해 안내하겠습니다.", 2],
        ["금융소득이 많아도 세금은 똑같습니다.", 0]
      ]],
      ["비과세 혜택을 받을 수 있는 방법은 없을까요?", "tax"],
      ["건강보험료에도 영향이 있을 수 있나요?", [
        ["소득 반영 여부와 가입 유형에 따라 달라질 수 있어 관련 기준을 확인하도록 안내하겠습니다.", 2],
        ["예금 이자는 건강보험료와 무조건 관계없습니다.", 0]
      ]],
      ["그럼 8천만 원을 한 곳에 넣는 게 좋을까요?", [
        ["예금자보호 한도와 금융기관별 보호 대상, 자금 운용 계획을 함께 살펴보겠습니다.", 2],
        ["한 곳에 전부 넣는 게 무조건 좋습니다.", 0]
      ]],
      ["6개월과 1년 금리 차이도 알려주세요.", "deposit"],
      ["배우자 명의로 나누어 예치하는 방법은 어떤가요?", [
        ["실제 자금 소유 관계와 증여 관련 사항을 고려해야 하므로 단순 분산만으로 안내하지 않겠습니다.", 2],
        ["명의만 바꾸면 아무 문제 없습니다.", 0]
      ]],
      ["설명을 듣고 가족과 상의한 뒤 결정할게요.", [
        ["네. 오늘 안내한 금리와 과세 관련 확인 사항을 정리해 드리겠습니다.", 2],
        ["오늘 무조건 가입하셔야 합니다.", 0]
      ]]
    ]
  },

  {
    name: "오재현", age: 29, emoji: "👨🏻",
    profile: "사회초년생 · 신규 방문 · 첫 금융거래",
    purpose: "입출금 계좌 및 체크카드 개설",
    amount: 0,
    steps: [
      ["처음으로 제 명의 통장을 만들려고 왔습니다.", [
        ["계좌 개설 목적과 본인 확인, 금융거래 관련 사항을 확인하겠습니다.", 2],
        ["아무 확인 없이 바로 개설하겠습니다.", 0]
      ]],
      ["월급을 받을 통장으로 쓰려고 합니다.", [
        ["급여 수령 목적과 거래 편의성을 고려해 적합한 계좌를 안내하겠습니다.", 2],
        ["어떤 계좌든 상관없습니다.", 0]
      ]],
      ["체크카드도 발급받고 싶어요.", [
        ["카드 혜택과 이용 조건, 연결 계좌를 확인해 안내하겠습니다.", 2],
        ["체크카드는 필요 없습니다.", 0]
      ]],
      ["모바일뱅킹은 어떻게 가입하나요?", [
        ["앱 설치와 본인 인증, 전자금융 가입 절차를 안내하겠습니다.", 2],
        ["모바일뱅킹은 사용할 수 없습니다.", 0]
      ]],
      ["적금도 하나 가입하고 싶은데 매달 30만 원 정도 가능해요.", [
        ["납입 가능 금액과 기간, 우대 조건을 확인해 적금 상품을 비교하겠습니다.", 2],
        ["월 100만 원 이상이어야 가입할 수 있습니다.", 0]
      ]],
      ["적금 이자 세금은 어떻게 되나요?", "tax"],
      ["체크온 적금 같은 상품도 있나요?", [
        ["현재 판매 중인 상품과 카드 이용 등 우대 조건을 확인해 안내하겠습니다.", 2],
        ["조건은 확인할 필요가 없습니다.", 0]
      ]],
      ["그럼 계좌와 카드, 적금을 같이 신청할게요.", [
        ["각 상품의 약관과 수수료, 자동이체 조건을 확인한 뒤 신청하겠습니다.", 2],
        ["설명 없이 모두 가입 처리하겠습니다.", 0]
      ]]
    ]
  },

  {
    name: "강현우", age: 54, emoji: "👨🏻‍🦱",
    profile: "자영업자 · 기존 고객 · 사업장 이전 예정",
    purpose: "사업자 예금 및 화재공제 상담",
    amount: 30000000,
    steps: [
      ["사업 자금 3천만 원을 잠시 예치하려고 합니다.", [
        ["자금 사용 예정 시기와 필요한 유동성을 확인하겠습니다.", 2],
        ["무조건 1년 예금으로 가입하세요.", 0]
      ]],
      ["6개월 정도면 괜찮을 것 같아요.", [
        ["6개월과 다른 기간의 금리 및 중도해지 조건을 비교하겠습니다.", 2],
        ["기간은 아무거나 선택해도 됩니다.", 0]
      ]],
      ["사업자 명의로 예금할 때 필요한 서류가 있나요?", [
        ["사업자등록증과 대표자 확인, 계좌 거래 목적에 따른 서류를 확인하겠습니다.", 2],
        ["사업자 관련 서류는 필요 없습니다.", 0]
      ]],
      ["이자에도 세금이 붙겠죠?", "tax"],
      ["사업장 건물을 이전할 예정인데 화재공제도 확인하고 싶습니다.", [
        ["건물 소유 관계와 용도, 구조, 면적 및 기존 보험을 확인하겠습니다.", 2],
        ["건물 정보 없이 보험료를 확정하겠습니다.", 0]
      ]],
      ["기존 보험이 있는데 보장 내용을 잘 모르겠어요.", [
        ["기존 증권을 확인해 가입 금액과 보장 범위, 특약을 비교하겠습니다.", 2],
        ["기존 보험은 볼 필요 없습니다.", 0]
      ]],
      ["예금과 화재공제 상담을 각각 진행할 수 있죠?", [
        ["네. 예금과 공제 업무를 구분해 필요한 조건을 안내하겠습니다.", 2],
        ["두 업무는 동시에 처리할 수 없습니다.", 0]
      ]],
      ["그럼 필요한 서류를 준비해서 다시 올게요.", [
        ["필요 서류와 다음 방문 시 확인할 사항을 정리해 드리겠습니다.", 2],
        ["서류는 준비하지 않으셔도 됩니다.", 0]
      ]]
    ]
  },

  {
    name: "정수진", age: 48, emoji: "👩🏻",
    profile: "기존 조합원 · 만기 적금 보유 · 추가 자금",
    purpose: "적금 만기 및 정기예금 신규",
    amount: 20000000,
    steps: [
      ["적금이 만기돼서 2천만 원 정도 받았어요.", [
        ["자금 사용 계획과 일부 사용할 금액이 있는지 먼저 확인하겠습니다.", 2],
        ["전액 예금으로 가입하시죠.", 0]
      ]],
      ["일부는 생활비로 쓰고 나머지는 예금하려고 합니다.", [
        ["필요한 생활비와 예치 가능한 금액을 나누어 확인하겠습니다.", 2],
        ["생활비까지 모두 예치하세요.", 0]
      ]],
      ["예금으로 가입하면 세금이 얼마나 나오나요?", "tax"],
      ["6개월과 1년 중 어떤 게 더 좋을까요?", [
        ["금리 차이와 자금 사용 계획을 비교해 안내하겠습니다.", 2],
        ["무조건 1년이 좋습니다.", 0]
      ]],
      ["그럼 1천5백만 원으로 계산해 주세요.", "deposit"],
      ["예금 만기일에 다시 방문해야 하나요?", [
        ["만기 알림과 재예치 방법, 자동 재예치 가능 여부를 안내하겠습니다.", 2],
        ["만기일은 신경 쓰지 않으셔도 됩니다.", 0]
      ]],
      ["남은 돈은 출자금으로 넣는 게 나을까요?", [
        ["출자금의 성격과 환급 절차, 배당 및 예금과의 차이를 설명하겠습니다.", 2],
        ["남은 돈은 전부 출자금으로 넣으세요.", 0]
      ]],
      ["알겠습니다. 조건을 비교하고 결정하겠습니다.", [
        ["예금과 출자금의 조건을 다시 정리해 고객님이 선택하도록 돕겠습니다.", 2],
        ["비교 없이 바로 가입 처리하겠습니다.", 0]
      ]]
    ]
  },

  {
    name: "문성호", age: 39, emoji: "👨🏻‍💼",
    profile: "직장인 · 전세 거주 · 신규 대출 문의",
    purpose: "전세자금대출 상담",
    amount: 100000000,
    steps: [
      ["전세 계약을 앞두고 있는데 전세자금대출을 알아보고 있습니다.", [
        ["보증금과 계약일, 입주 예정일, 주택 유형을 확인하겠습니다.", 2],
        ["전세 계약만 있으면 무조건 대출됩니다.", 0]
      ]],
      ["보증금은 2억 원이고 제 돈은 1억 원 정도 있습니다.", [
        ["필요 대출액과 보증기관별 상품 조건을 확인하겠습니다.", 2],
        ["보증금의 절반은 무조건 가능합니다.", 0]
      ]],
      ["현재 직장에 2년 근무했고 연봉은 4천만 원입니다.", [
        ["재직 및 소득자료와 기존 부채를 확인하겠습니다.", 2],
        ["연봉만으로 대출이 확정됩니다.", 0]
      ]],
      ["집은 다가구주택인데 문제가 있을까요?", [
        ["등기부와 선순위 권리, 임대차 현황 및 주택 관련 요건을 확인해야 합니다.", 2],
        ["주택 종류는 관계없습니다.", 0]
      ]],
      ["제가 필요한 금액으로 상환액을 계산해 주세요.", "loan"],
      ["계약 전에 대출 가능 여부를 먼저 확인해야겠죠?", [
        ["네. 계약 전 주택과 임대인, 보증기관의 취급 요건을 사전 확인하는 것이 중요합니다.", 2],
        ["계약부터 하고 나중에 확인해도 됩니다.", 0]
      ]],
      ["필요한 서류는 어떤 게 있나요?", [
        ["신분증, 임대차계약 관련 자료, 소득 및 재직 자료 등 상품별 서류를 안내하겠습니다.", 2],
        ["서류 없이 진행할 수 있습니다.", 0]
      ]],
      ["확인해 보고 다시 방문하겠습니다.", [
        ["네. 계약 전 확인할 사항과 준비 서류를 정리해 드리겠습니다.", 2],
        ["지금 계약부터 하세요.", 0]
      ]]
    ]
  },

  {
    name: "배정희", age: 70, emoji: "👵🏻",
    profile: "고령 조합원 · 기존 예금 고객 · 가족 금융 문의",
    purpose: "예금 만기 및 상속 관련 상담",
    amount: 30000000,
    steps: [
      ["남편이 맡겨둔 예금이 있는데 만기가 다가와서 문의하러 왔어요.", [
        ["예금 명의자와 방문하신 분의 관계, 위임 및 본인 확인 사항을 먼저 확인하겠습니다.", 2],
        ["가족이면 누구나 해지할 수 있습니다.", 0]
      ]],
      ["제가 배우자인데 남편이 직접 오기 어려워요.", [
        ["대리 거래 가능 여부와 필요한 위임서류, 본인 확인 절차를 안내하겠습니다.", 2],
        ["배우자라면 서류 없이 가능합니다.", 0]
      ]],
      ["혹시 남편이 돌아가시면 예금은 어떻게 되나요?", [
        ["상속 절차와 상속인 확인, 필요한 서류를 안내하되 구체적인 상속 관계를 확인하겠습니다.", 2],
        ["배우자가 자동으로 전액 인출할 수 있습니다.", 0]
      ]],
      ["상속인들이 여러 명이면 모두 와야 하나요?", [
        ["상속인 구성과 상속 방식, 필요한 동의 및 서류를 확인해 안내하겠습니다.", 2],
        ["한 명만 오면 무조건 처리됩니다.", 0]
      ]],
      ["예금 이자 세금도 궁금합니다.", "tax"],
      ["만기 전에 처리할 수 있는 방법도 있나요?", [
        ["중도해지 조건과 대리 거래 가능 여부를 함께 확인하겠습니다.", 2],
        ["언제든 누구나 해지할 수 있습니다.", 0]
      ]],
      ["필요한 서류를 알려주시면 가족들과 준비해 볼게요.", [
        ["가족관계 및 상속 관련 서류, 신분증, 위임 관련 자료 등 상황별 필요 서류를 안내하겠습니다.", 2],
        ["서류는 전혀 필요 없습니다.", 0]
      ]]
    ]
  }
];

/* ==========================================
   공통 함수
========================================== */

function money(value) {
  return Math.round(value).toLocaleString("ko-KR") + "원";
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
}

function updateHUD() {
  $("day").textContent = game.day + "일차";
  $("clock").textContent =
    String(game.hour).padStart(2, "0") + ":" +
    String(game.minute).padStart(2, "0");

  $("sales").textContent = money(game.sales);
  $("satisfaction").textContent = game.satisfaction + "%";
  $("completed-count").textContent = game.completed + "건";
  $("waiting-count").textContent = game.queue.length + "명";
  $("queue-count").textContent = game.queue.length;

  $("current-customer").textContent =
    game.current ? game.current.name + " 고객님" : "대기 중";

  $("current-status").textContent =
    game.current ? "상담 진행 중" : "고객을 호출해 주세요.";

  $("next-customer").textContent =
    game.queue[0] ? game.queue[0].name + " 고객님" : "-";

  $("next-purpose").textContent =
    game.queue[0] ? game.queue[0].purpose : "대기 고객 없음";

  $("call-button").disabled =
    !game.started || !!game.current || game.busy || game.queue.length === 0;

  $("finish-button").disabled = !game.current || game.busy;

  $("ticket-number").textContent =
    game.current ? "상담 중" :
    game.queue.length ? "대기 " + game.queue[0].ticket + "번" : "대기";
}

function addMinutes(amount = 1) {
  game.minute += amount;

  while (game.minute >= 60) {
    game.minute -= 60;
    game.hour++;
  }

  if (game.hour >= 18) {
    game.day++;
    game.hour = 9;
    game.minute = 0;
    toast(game.day + "일차 영업이 시작되었습니다.");
  }

  updateHUD();
}

/* ==========================================
   고객 생성
   직전 고객과 같은 업무가 연속되지 않도록
   고객 목록을 섞어서 순서대로 사용
========================================== */

function shuffleBag() {
  game.customerBag = scenarios.map((_, index) => index);

  for (let i = game.customerBag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [game.customerBag[i], game.customerBag[j]] =
      [game.customerBag[j], game.customerBag[i]];
  }
}

function createCustomer() {
  if (game.customerBag.length === 0) shuffleBag();

  const index = game.customerBag.shift();
  const template = scenarios[index];

  return {
    ...template,
    id: game.nextId++,
    ticket: game.ticket++,
    steps: template.steps.map(step =>
      Array.isArray(step)
        ? [step[0], step[1].map(answer => [...answer])]
        : step
    ),
    step: 0,
    good: 0,
    errors: 0,
    earned: 0
  };
}

function renderQueue() {
  const container = $("queue-people");
  container.innerHTML = "";

  game.queue.slice(0, 6).forEach(customer => {
    const item = document.createElement("div");
    item.className = "queue-person";

    const emoji = document.createElement("span");
    emoji.className = "emoji";
    emoji.textContent = customer.emoji;

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = customer.name;

    const purpose = document.createElement("small");
    purpose.textContent = customer.ticket + "번 · " + customer.purpose;

    info.append(name, purpose);
    item.append(emoji, info);
    container.appendChild(item);
  });

  if (game.queue.length > 6) {
    const more = document.createElement("div");
    more.className = "queue-person";
    more.textContent = "외 " + (game.queue.length - 6) + "명";
    container.appendChild(more);
  }

  updateHUD();
}

function addCustomer() {
  if (game.queue.length >= 12) return;

  const customer = createCustomer();
  game.queue.push(customer);
  renderQueue();

  toast(
    customer.name + " 고객님 방문 · " +
    customer.purpose + " · " +
    customer.ticket + "번"
  );
}

/* ==========================================
   영업 시작
========================================== */

function startGame() {
  if (game.started) return;

  game.started = true;
  $("start-screen").classList.add("hidden");

  shuffleBag();

  for (let i = 0; i < 4; i++) {
    game.queue.push(createCustomer());
  }

  renderQueue();
  updateHUD();

  toast("근화지점 영업을 시작합니다.");

  game.timer = setInterval(() => {
    if (!game.started) return;

    addMinutes(1);

    // 게임 시간 4분마다 새 고객 방문
    if (game.minute % 4 === 0 && game.hour < 18) {
      addCustomer();
    }
  }, 3000);
}

/* ==========================================
   고객 호출 및 창구 도착
========================================== */

function callNextCustomer() {
  if (game.current || game.busy || !game.queue.length) return;

  game.busy = true;
  game.current = game.queue.shift();
  game.step = 0;

  renderQueue();

  const person = $("active-customer");
  person.classList.remove("walking");
  void person.offsetWidth;
  person.classList.add("walking");

  // 기존 HTML은 class만 사용하므로 querySelector로 연결
  person.querySelector(".customer-avatar").textContent =
    game.current.emoji;

  person.querySelector(".customer-caption").textContent =
    game.current.name + " 고객님 이동 중";

  toast(game.current.name + " 고객님 호출");

  setTimeout(() => {
    if (!game.current) return;

    game.busy = false;

    person.querySelector(".customer-caption").textContent =
      "상담 중 · " + game.current.name;

    $("dialog").classList.remove("hidden");

    showConversation();
    updateHUD();
  }, 1800);
}

/* ==========================================
   상담 엔진
========================================== */

function showConversation() {
  if (!game.current) return;

  const customer = game.current;
  const step = customer.steps[game.step];

  if (!step) {
    showConsultationSummary();
    return;
  }

  $("customer-name").textContent =
    customer.name + " 고객님 · 상담 " +
    (game.step + 1) + " / " + customer.steps.length;

  $("customer-profile").textContent =
    customer.age + "세 · " +
    customer.profile + " · 방문 목적: " +
    customer.purpose + " · 대기번호 " +
    customer.ticket + "번";

  $("customer-message").textContent =
    Array.isArray(step) ? step[0] : getSpecialMessage(step);

  $("dialog-feedback").textContent = "";

  if (Array.isArray(step)) {
    renderAnswers(step[1]);
  } else if (step === "tax") {
    renderTaxScreen();
  } else if (step === "deposit") {
    renderDepositCalculator(false);
  } else if (step === "installment") {
    renderDepositCalculator(true);
  } else if (step === "loan") {
    renderLoanCalculator();
  }
}

function getSpecialMessage(type) {
  const messages = {
    tax: "이자에 세금이 붙는다고 하던데 비과세 혜택을 받을 수 있는지 확인해 주세요.",
    deposit: "예치 금액과 기간에 따른 예상 이자를 계산해 주세요.",
    installment: "매달 적금을 납입하면 만기 때 얼마를 받을 수 있는지 계산해 주세요.",
    loan: "제가 필요한 금액을 대출받으면 매달 얼마씩 상환해야 하는지 계산해 주세요."
  };

  return messages[type] || "자세히 설명해 주세요.";
}

function renderAnswers(answers) {
  const list = $("answer-list");
  list.innerHTML = "";

  answers.forEach(answer => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.textContent = answer[0];

    button.addEventListener("click", () => {
      chooseAnswer(answer);
    });

    list.appendChild(button);
  });
}

function chooseAnswer(answer) {
  if (!game.current || game.busy) return;

  const customer = game.current;
  const quality = Number(answer[1]);

  if (quality >= 2) {
    customer.good++;
    game.satisfaction = Math.min(100, game.satisfaction + 1);
    $("dialog-feedback").textContent =
      "고객: 네, 이해했습니다. 자세히 설명해 주셔서 감사합니다.";
  } else {
    customer.errors++;
    game.satisfaction = Math.max(0, game.satisfaction - 4);
    $("dialog-feedback").textContent =
      "고객: 그 부분은 조금 더 정확하게 설명해 주실 수 있을까요?";
  }

  game.busy = true;

  const list = $("answer-list");
  list.innerHTML = "";

  const next = document.createElement("button");
  next.className = "primary-button";
  next.textContent = "고객의 다음 질문 듣기";

  next.addEventListener("click", () => {
    game.step++;
    game.busy = false;
    addMinutes(1);
    showConversation();
  });

  list.appendChild(next);
  updateHUD();
}

/* ==========================================
   비과세 전산 상담
========================================== */

function renderTaxScreen() {
  const list = $("answer-list");

  list.innerHTML = `
    <div class="computer-card">
      <h3>수신 전산 · 과세 유형 확인</h3>
      <p>실제 가입 전 고객 자격과 해당 연도 세제 기준을 확인해야 합니다.</p>

      <div class="field">
        <label>조합원 여부</label>
        <select id="tax-member">
          <option value="yes">조합원</option>
          <option value="no">비조합원</option>
        </select>
      </div>

      <div class="field">
        <label>비과세종합저축 가입 자격</label>
        <select id="tax-eligible">
          <option value="unknown">아직 확인하지 않음</option>
          <option value="yes">가입 대상 요건 충족 확인</option>
          <option value="no">대상 요건 미충족</option>
        </select>
      </div>

      <div class="field">
        <label>신협 예탁금 세제 혜택 요건</label>
        <select id="cu-eligible">
          <option value="unknown">아직 확인하지 않음</option>
          <option value="yes">관련 요건 충족 확인</option>
          <option value="no">관련 요건 미충족</option>
        </select>
      </div>

      <div class="field">
        <label>기존 가입액 및 잔여 한도</label>
        <select id="tax-limit">
          <option value="unknown">아직 확인하지 않음</option>
          <option value="yes">한도 확인 완료</option>
          <option value="no">한도 초과 또는 잔여 한도 없음</option>
        </select>
      </div>
    </div>

    <div class="computer-card">
      <h3>과세 유형 선택</h3>
      <div id="tax-choice-area"></div>
      <div id="tax-detail"></div>
    </div>
  `;

  const options = [
    {
      id: "special",
      title: "비과세종합저축",
      desc: "법령상 대상자 요건 및 금융기관 통합 한도 확인 필요"
    },
    {
      id: "creditUnion",
      title: "신협 예탁금 세제 혜택",
      desc: "조합원 여부, 소득 요건, 가입 시점과 해당 연도 적용 법령 확인 필요"
    },
    {
      id: "normal",
      title: "일반과세",
      desc: "일반적인 이자소득 과세. 기본 계산상 15.4% 적용"
    }
  ];

  const area = $("tax-choice-area");

  options.forEach(option => {
    const card = document.createElement("div");
    card.className = "tax-option";

    const title = document.createElement("strong");
    title.textContent = option.title;

    const desc = document.createElement("small");
    desc.textContent = option.desc;

    card.append(title, desc);

    card.addEventListener("click", () => {
      game.selectedTax = option.id;

      document.querySelectorAll(".tax-option").forEach(el =>
        el.classList.remove("selected")
      );

      card.classList.add("selected");
      showTaxDetail(option);
    });

    area.appendChild(card);
  });
}

function showTaxDetail(option) {
  const detail = $("tax-detail");

  let message = "";

  if (option.id === "special") {
    message = "가입 대상 자격과 잔여 한도를 확인해야 합니다.";
  } else if (option.id === "creditUnion") {
    message = "조합원 여부, 소득 요건, 가입 시점 및 해당 연도 적용 세법을 확인해야 합니다.";
  } else {
    message = "일반과세를 선택했습니다. 기본 계산상 이자소득세 및 지방소득세 합계 15.4%를 적용합니다.";
  }

  detail.innerHTML = `
    <div class="result-box">${message}</div>
    <button class="primary-button" id="confirm-tax" style="margin-top:12px">
      선택한 과세 유형 확인
    </button>
  `;

  $("confirm-tax").addEventListener("click", confirmTax);
}

function confirmTax() {
  if (!game.selectedTax) {
    toast("과세 유형을 먼저 선택하세요.");
    return;
  }

  const member = $("tax-member").value;
  const eligible = $("tax-eligible").value;
  const cuEligible = $("cu-eligible").value;
  const limit = $("tax-limit").value;

  let valid = true;
  let title = "";

  if (game.selectedTax === "special") {
    title = "비과세종합저축";

    if (eligible !== "yes" || limit !== "yes") {
      valid = false;
    }
  }

  if (game.selectedTax === "creditUnion") {
    title = "신협 예탁금 세제 혜택";

    if (member !== "yes" || cuEligible !== "yes" || limit !== "yes") {
      valid = false;
    }
  }

  if (game.selectedTax === "normal") {
    title = "일반과세";
  }

  if (!valid) {
    game.current.errors++;
    game.satisfaction = Math.max(0, game.satisfaction - 2);
    $("dialog-feedback").textContent =
      "가입 자격이나 잔여 한도가 확인되지 않았습니다. 고객에게 추가 확인이 필요하다고 안내하세요.";

    toast("자격 및 한도 확인이 필요합니다.");
    updateHUD();
    return;
  }

  $("dialog-feedback").textContent =
    title + " 선택 완료. 고객에게 적용 조건과 유의사항을 설명하세요.";

  const list = $("answer-list");
  list.innerHTML = "";

  const explain = document.createElement("button");
  explain.className = "answer-button";
  explain.textContent = "고객에게 과세 유형의 차이 설명하기";

  explain.addEventListener("click", () => {
    $("customer-message").textContent =
      title + "으로 안내드리겠습니다. 적용 요건과 한도, 실제 세금 계산 기준을 설명드리고 추가로 궁금하신 점도 확인하겠습니다.";

    list.innerHTML = "";

    const next = document.createElement("button");
    next.className = "primary-button";
    next.textContent = "설명 완료 · 다음 질문 듣기";

    next.addEventListener("click", () => {
      game.current.good++;
      game.satisfaction = Math.min(100, game.satisfaction + 2);
      game.step++;
      game.selectedTax = null;
      addMinutes(2);
      showConversation();
    });

    list.appendChild(next);
    updateHUD();
  });

  list.appendChild(explain);
}

/* ==========================================
   예금 / 적금 계산
========================================== */

function renderDepositCalculator(isInstallment) {
  const list = $("answer-list");
  const customer = game.current;

  list.innerHTML = `
    <div class="computer-card">
      <h3>${isInstallment ? "정기적금" : "정기예금"} 이자 계산</h3>

      <div class="field">
        <label>${isInstallment ? "월 납입액" : "예치 금액"} (원)</label>
        <input id="calc-principal" type="number" min="1"
          value="${customer.amount || 30000000}">
      </div>

      <div class="field">
        <label>가입 기간</label>
        <select id="calc-months">
          <option value="6">6개월</option>
          <option value="12" selected>12개월</option>
          <option value="13">13개월</option>
          <option value="24">24개월</option>
        </select>
      </div>

      <div class="field">
        <label>연 금리 (%)</label>
        <input id="calc-rate" type="number" value="3.5" step="0.01">
      </div>

      <div class="field">
        <label>과세 유형</label>
        <select id="calc-tax">
          <option value="normal">일반과세 15.4%</option>
          <option value="special">비과세종합저축 (자격 충족 시)</option>
          <option value="creditUnion">신협 예탁금 세제 혜택 (요건 확인 시)</option>
        </select>
      </div>

      <button class="primary-button" id="calculate-deposit">이자 계산하기</button>
      <div id="deposit-result"></div>
    </div>

    <button class="secondary-button" id="deposit-next">
      계산 결과 설명하고 상담 계속하기
    </button>
  `;

  $("calculate-deposit").addEventListener("click", () => {
    const principal = Number($("calc-principal").value);
    const months = Number($("calc-months").value);
    const rate = Number($("calc-rate").value);
    const taxType = $("calc-tax").value;

    if (principal <= 0 || rate < 0 || months <= 0) {
      toast("입력 금액과 기간을 확인하세요.");
      return;
    }

    let gross;

    if (isInstallment) {
      gross = 0;

      for (let i = 1; i <= months; i++) {
        gross += principal * (rate / 100) * (i / 12);
      }
    } else {
      gross = principal * (rate / 100) * (months / 12);
    }

    // 단순 비교용 세금 계산
    const taxRate = taxType === "normal" ? 0.154 : 0;
    const tax = gross * taxRate;
    const net = gross - tax;
    const totalPrincipal = isInstallment ? principal * months : principal;

    $("deposit-result").innerHTML = `
      <div class="result-box">
        <strong>예상 이자 계산 결과</strong><br>
        납입 원금: ${money(totalPrincipal)}<br>
        세전 이자: ${money(gross)}<br>
        예상 세금: ${money(tax)}<br>
        세후 이자: ${money(net)}<br>
        만기 예상 수령액: <strong>${money(totalPrincipal + net)}</strong>
        <p>※ 단순 비교 계산입니다. 실제 상품의 이자 계산 방식과 세제 적용 여부에 따라 결과가 달라집니다.</p>
      </div>
    `;
  });

  $("deposit-next").addEventListener("click", () => {
    game.current.good++;
    game.step++;
    addMinutes(1);
    showConversation();
  });
}

/* ==========================================
   대출 계산
========================================== */

function renderLoanCalculator() {
  const list = $("answer-list");

  list.innerHTML = `
    <div class="computer-card">
      <h3>대출 상환액 간이 계산</h3>

      <div class="field">
        <label>대출 금액 (원)</label>
        <input id="loan-principal" type="number"
          value="${game.current.amount || 10000000}">
      </div>

      <div class="field">
        <label>연 금리 (%)</label>
        <input id="loan-rate" type="number" value="6" step="0.1">
      </div>

      <div class="field">
        <label>상환 기간</label>
        <select id="loan-months">
          <option value="12">12개월</option>
          <option value="36">36개월</option>
          <option value="60" selected>60개월</option>
          <option value="120">120개월</option>
        </select>
      </div>

      <button class="primary-button" id="calculate-loan">
        상환액 계산하기
      </button>

      <div id="loan-result"></div>
    </div>

    <button class="secondary-button" id="loan-next">
      계산 결과 설명하고 상담 계속하기
    </button>
  `;

  $("calculate-loan").addEventListener("click", () => {
    const principal = Number($("loan-principal").value);
    const rate = Number($("loan-rate").value) / 100 / 12;
    const months = Number($("loan-months").value);

    if (principal <= 0 || rate < 0 || months <= 0) {
      toast("입력 내용을 확인하세요.");
      return;
    }

    const payment = rate === 0
      ? principal / months
      : principal * rate / (1 - Math.pow(1 + rate, -months));

    $("loan-result").innerHTML = `
      <div class="result-box">
        <strong>원리금균등상환 예상 결과</strong><br>
        대출 금액: ${money(principal)}<br>
        월 예상 상환액: <strong>${money(payment)}</strong><br>
        총 예상 상환액: ${money(payment * months)}<br>
        총 예상 이자: ${money(payment * months - principal)}
        <p>※ 단순 계산이며 실제 승인 금액이나 금융기관의 확정 상환액이 아닙니다.</p>
      </div>
    `;
  });

  $("loan-next").addEventListener("click", () => {
    game.current.good++;
    game.step++;
    addMinutes(1);
    showConversation();
  });
}

/* ==========================================
   상담 마무리
========================================== */

function showConsultationSummary() {
  const customer = game.current;

  $("customer-message").textContent =
    "오늘 상담은 여기까지 하겠습니다. 자세히 설명해 주셔서 감사합니다.";

  $("dialog-feedback").textContent =
    "고객의 모든 상담 질문에 답변했습니다.";

  $("answer-list").innerHTML = `
    <div class="result-box">
      <strong>상담 내용 정리</strong><br>
      고객명: ${customer.name}<br>
      방문 목적: ${customer.purpose}<br>
      상담 단계: ${customer.steps.length}단계<br>
      긍정 응대: ${customer.good}회<br>
      추가 확인 필요: ${customer.errors}회
    </div>

    <button class="primary-button" id="complete-customer">
      상담 마무리 및 다음 고객 준비
    </button>
  `;

  $("complete-customer").addEventListener("click", completeCustomer);
}

function completeCustomer() {
  if (!game.current) return;

  const customer = game.current;

  // 상담 완료 시 실적은 예시용으로 일부 반영
  if (customer.purpose.includes("예금") ||
      customer.purpose.includes("적금")) {
    customer.earned = customer.amount || 0;
  }

  game.sales += customer.earned;
  game.completed++;

  game.current = null;
  game.step = 0;
  game.busy = false;
  game.selectedTax = null;

  $("dialog").classList.add("hidden");

  const person = $("active-customer");
  person.querySelector(".customer-avatar").textContent = "🙂";
  person.querySelector(".customer-caption").textContent =
    "고객 호출 대기 중";

  renderQueue();
  addMinutes(2);

  toast(customer.name + " 고객님 상담 완료");

  if (game.queue.length === 0) {
    setTimeout(addCustomer, 1500);
  }

  updateHUD();
}

function manualFinish() {
  if (!game.current) return;

  if (!confirm("현재 상담을 중단하시겠습니까?")) return;

  game.satisfaction = Math.max(0, game.satisfaction - 5);
  completeCustomer();
}

/* ==========================================
   금융업무 전산 탭
========================================== */

function openComputer(tab) {
  game.computerTab = tab;
  $("computer").classList.remove("hidden");
  renderComputer();
}

function renderComputer() {
  document.querySelectorAll(".computer-tabs button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.tab === game.computerTab
    );
  });

  const pages = {
    deposit: `
      <div class="computer-card">
        <h3>수신 업무</h3>
        <p>정기예금, 정기적금, 입출금 계좌, 만기 재예치, 해지 업무</p>
        <button class="answer-button" onclick="toast('정기예금 업무 선택')">정기예금 신규 및 재예치</button>
        <button class="answer-button" onclick="toast('정기적금 업무 선택')">정기적금 신규</button>
        <button class="answer-button" onclick="toast('만기 및 해지 업무 선택')">예금 만기 및 해지</button>
        <button class="answer-button" onclick="toast('과세 유형 확인은 고객 상담에서 진행하세요.')">과세 유형 확인</button>
      </div>`,
    loan: `
      <div class="computer-card">
        <h3>여신 업무</h3>
        <p>햇살론, 신용대출, 담보대출, 전세대출, 대출 연장</p>
        <button class="answer-button" onclick="toast('햇살론 상담 선택')">햇살론</button>
        <button class="answer-button" onclick="toast('담보대출 상담 선택')">담보대출</button>
        <button class="answer-button" onclick="toast('전세대출 상담 선택')">전세대출</button>
        <button class="answer-button" onclick="toast('대출 연장 상담 선택')">대출 연장</button>
      </div>`,
    insurance: `
      <div class="computer-card">
        <h3>공제 업무</h3>
        <p>화재공제, 간병인공제, 건강 관련 공제 및 계약 점검</p>
        <button class="answer-button" onclick="toast('화재공제 상담 선택')">화재공제</button>
        <button class="answer-button" onclick="toast('간병인공제 상담 선택')">간병인공제</button>
        <button class="answer-button" onclick="toast('기존 계약 분석 선택')">기존 계약 분석</button>
      </div>`,
    member: `
      <div class="computer-card">
        <h3>조합원 업무</h3>
        <p>조합원 가입, 출자금 납입, 정보 변경 및 조합원 상담</p>
        <button class="answer-button" onclick="toast('조합원 신규 가입 선택')">조합원 신규 가입</button>
        <button class="answer-button" onclick="toast('출자금 납입 선택')">출자금 납입</button>
        <button class="answer-button" onclick="toast('조합원 정보 조회 선택')">조합원 정보 조회</button>
      </div>`
  };

  $("computer-content").innerHTML = pages[game.computerTab];
}

/* ==========================================
   이벤트 연결
========================================== */

$("start-button").addEventListener("click", startGame);
$("call-button").addEventListener("click", callNextCustomer);
$("finish-button").addEventListener("click", manualFinish);

$("close-dialog").addEventListener("click", () => {
  $("dialog").classList.add("hidden");
  toast("상담창을 접었습니다. 상담은 계속 진행됩니다.");
});

$("close-computer").addEventListener("click", () => {
  $("computer").classList.add("hidden");
});

document.querySelectorAll(".computer-tabs button").forEach(button => {
  button.addEventListener("click", () => {
    openComputer(button.dataset.tab);
  });
});

$("active-customer").addEventListener("click", () => {
  if (game.current && !game.busy) {
    $("dialog").classList.remove("hidden");
  }
});

/* ==========================================
   초기화
========================================== */

function initialize() {
  updateHUD();
  renderQueue();

  $("active-customer").querySelector(".customer-avatar").textContent = "🙂";
  $("active-customer").querySelector(".customer-caption").textContent =
    "고객 호출 대기 중";
}

initialize();
