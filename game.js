// ======================================
// 춘천신협 금융창구 시뮬레이션
// 다단계 고객 상담 시스템
// ======================================

let day = 1;
let sales = 0;
let satisfaction = 80;
let depositTotal = 0;
let loanTotal = 0;
let insuranceTotal = 0;
let customerCount = 0;
let skill = 1;
let dailyCustomers = 0;

let currentCustomer = null;
let currentStep = 0;
let consultationActive = false;
let consultationCompleted = false;

let logs = [];

const monthlyGoal = 300000;

// ======================================
// 고객 데이터 및 상담 시나리오
// ======================================

const customerCases = [

  {
    name: "김영희",
    age: 58,
    job: "자영업",
    history: "춘천신협 거래 12년, 기존 정기예금 거래 고객",
    purpose: "정기예금 만기 자금 재예치",
    type: "deposit",
    amount: 5000,
    steps: [

      {
        speaker: "고객",
        text: "안녕하세요. 지난번에 가입했던 정기예금이 만기돼서 왔어요. 이번에도 예금을 하려고 하는데 금리가 어떻게 되나요?",
        options: [
          {
            text: "먼저 만기 자금 규모와 사용 계획을 여쭤보겠습니다.",
            next: 1,
            score: 5,
            response: "고객: 네. 이번에 만기된 금액은 이자까지 합쳐서 5천만 원 정도예요."
          },
          {
            text: "현재 적용되는 정기예금 금리를 안내한다.",
            next: 1,
            score: 2,
            response: "고객: 금리는 알겠는데, 제 상황에 맞는 상품도 있을까요?"
          },
          {
            text: "바로 재예치 신청을 진행한다.",
            next: 1,
            score: -3,
            response: "고객: 아직 어디에 어떻게 넣을지 결정한 건 아니에요."
          }
        ]
      },

      {
        speaker: "직원",
        text: "고객님의 만기 자금은 약 5천만 원이시군요. 혹시 이 자금 중에 가까운 시일 내에 사용하실 계획이 있는 금액도 있으실까요?",
        options: [
          {
            text: "당분간 사용할 계획이 없고 전액 예치할 예정이라고 답한다.",
            next: 2,
            score: 5,
            response: "고객: 당장 쓸 돈은 아니에요. 적어도 1년 정도는 여유가 있을 것 같아요."
          },
          {
            text: "일부는 생활비로 사용할 예정이라고 답한다.",
            next: 2,
            score: 5,
            response: "고객: 한 1천만 원 정도는 혹시 몰라서 가지고 있으려고요."
          },
          {
            text: "자금 사용 계획을 확인하지 않고 금리만 안내한다.",
            next: 2,
            score: -2,
            response: "고객: 그런데 제가 중간에 돈이 필요해지면 어떻게 되나요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "예치 기간을 어느 정도로 생각하고 계신가요? 그리고 다른 금융기관에도 예치 중인 자금이 있으신가요?",
        options: [
          {
            text: "1년 예치가 가능하고 다른 금융기관에도 자금이 있다고 답한다.",
            next: 3,
            score: 5,
            response: "고객: 농협에도 조금 있어요. 금리가 괜찮으면 이쪽으로 옮길 수도 있죠."
          },
          {
            text: "6개월 정도만 예치하고 싶다고 답한다.",
            next: 3,
            score: 4,
            response: "고객: 6개월 정도면 좋을 것 같아요. 너무 오래 묶어두기는 싫어요."
          },
          {
            text: "고객의 예치 기간을 확인하지 않고 1년 상품을 권유한다.",
            next: 3,
            score: -4,
            response: "고객: 1년은 조금 부담스러운데요."
          }
        ]
      },

      {
        speaker: "직원",
        text: "고객님께서는 기존 거래도 있으시고, 자금 사용 계획도 확인됐습니다. 예금자보호 한도와 출자금의 차이도 함께 설명드리고 자금을 나누어 운용하는 방법을 안내해 드릴까요?",
        options: [
          {
            text: "예금자보호 한도와 출자금의 보호 차이까지 정확히 설명한다.",
            next: 4,
            score: 8,
            response: "고객: 출자금은 예금과 보호 방식이 다르군요. 그 부분은 처음 알았어요."
          },
          {
            text: "금리만 비교해서 설명한다.",
            next: 4,
            score: 1,
            response: "고객: 다른 조건은 없나요?"
          },
          {
            text: "고객의 자금 계획에 맞춰 예치 금액을 나누어 제안한다.",
            next: 4,
            score: 7,
            response: "고객: 그렇게 나누는 방법도 괜찮겠네요. 조금 더 설명해 주세요."
          }
        ]
      },

      {
        speaker: "직원",
        text: "고객님, 안내드린 조건을 기준으로 진행해 드릴까요? 아니면 가족분과 상의하신 뒤 결정하시겠어요?",
        options: [
          {
            text: "5천만 원 재예치 진행에 동의한다.",
            next: "finish",
            score: 10,
            sale: "deposit",
            amount: 5000,
            response: "고객: 설명을 들어보니 이해가 잘 되네요. 말씀하신 조건으로 진행해 주세요."
          },
          {
            text: "일부 금액만 예치하고 나머지는 보류한다.",
            next: "finish",
            score: 6,
            sale: "deposit",
            amount: 4000,
            response: "고객: 우선 4천만 원만 예치하고 나머지는 나중에 결정할게요."
          },
          {
            text: "가족과 상의한 후 다시 방문하기로 한다.",
            next: "finish",
            score: 2,
            response: "고객: 오늘 설명 잘 들었습니다. 가족과 상의하고 다시 올게요."
          }
        ]
      }
    ]
  },

  {
    name: "박정수",
    age: 45,
    job: "회사원",
    history: "신규 방문 고객, 아파트 소유",
    purpose: "아파트 담보대출 상담",
    type: "loan",
    amount: 8000,
    steps: [

      {
        speaker: "고객",
        text: "아파트를 담보로 대출을 좀 받으려고 하는데요. 여기서도 가능한가요?",
        options: [
          {
            text: "가능 여부를 판단하기 위해 기본적인 사항부터 확인하겠습니다.",
            next: 1,
            score: 6,
            response: "고객: 네. 어떤 것부터 알려드리면 될까요?"
          },
          {
            text: "담보대출 상품과 금리부터 설명한다.",
            next: 1,
            score: 2,
            response: "고객: 금리도 중요하지만 제가 얼마나 받을 수 있는지가 궁금해요."
          },
          {
            text: "담보가 있으니 충분히 가능할 것이라고 안내한다.",
            next: 1,
            score: -6,
            response: "고객: 아직 심사도 안 했는데 가능한 건가요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "소유하고 계신 아파트의 시세와 현재 거주 여부를 확인해도 될까요? 기존 담보대출이 있으신지도 궁금합니다.",
        options: [
          {
            text: "아파트 시세와 선순위 대출 및 임대차 관계를 확인한다.",
            next: 2,
            score: 7,
            response: "고객: 시세는 3억 5천 정도이고, 기존 담보대출은 1억 원 있습니다. 제가 직접 거주하고 있어요."
          },
          {
            text: "아파트 시세만 확인한다.",
            next: 2,
            score: 1,
            response: "고객: 기존 대출도 확인해야 하나요?"
          },
          {
            text: "담보대출 가능 금액을 먼저 안내한다.",
            next: 2,
            score: -5,
            response: "고객: 다른 은행 대출도 있는데 그것도 상관없나요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "현재 재직 중이신 직장과 연 소득, 다른 금융기관의 신용대출 등도 확인해야 합니다. 소득증빙은 가능하실까요?",
        options: [
          {
            text: "재직증명서와 소득금액증명원, 부채 내역을 요청한다.",
            next: 3,
            score: 7,
            response: "고객: 회사에 7년째 다니고 있고 연 소득은 5천만 원 정도입니다. 신용대출도 2천만 원 있어요."
          },
          {
            text: "소득만 확인한다.",
            next: 3,
            score: 2,
            response: "고객: 다른 대출도 확인해야 하는군요."
          },
          {
            text: "담보 가치가 충분하니 소득은 크게 중요하지 않다고 안내한다.",
            next: 3,
            score: -7,
            response: "고객: 소득을 확인하지 않아도 되는 건가요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "말씀하신 내용으로는 담보가치뿐 아니라 선순위 채권, 임대차 및 점유 관계, 소득과 부채, 상환능력 등을 함께 검토해야 합니다. 원하시는 대출 금액은 어느 정도인가요?",
        options: [
          {
            text: "8천만 원이 필요하고 자금 용도도 확인한다.",
            next: 4,
            score: 6,
            response: "고객: 사업자금으로 사용하려고 합니다. 8천만 원 정도 필요해요."
          },
          {
            text: "필요 금액과 상환 계획을 함께 확인한다.",
            next: 4,
            score: 8,
            response: "고객: 8천만 원 정도 필요하고, 매월 이자와 원금 일부를 갚을 계획입니다."
          },
          {
            text: "담보가치만으로 대출 가능 여부를 안내한다.",
            next: 4,
            score: -5,
            response: "고객: 실제로 얼마까지 가능한지는 심사해 봐야겠네요."
          }
        ]
      },

      {
        speaker: "직원",
        text: "필요 서류를 확인한 후 담보 평가와 내부 심사를 거쳐 정확한 한도와 금리를 안내드리겠습니다. 지금은 가심사에 필요한 서류를 안내해 드릴까요?",
        options: [
          {
            text: "필요 서류와 심사 절차를 안내하고 접수를 준비한다.",
            next: "finish",
            score: 8,
            sale: "loan",
            amount: 8000,
            response: "고객: 네. 서류 준비해서 다시 방문하겠습니다."
          },
          {
            text: "정확한 조건을 확인하기 전에는 승인 여부를 확답하지 않는다.",
            next: "finish",
            score: 7,
            response: "고객: 네. 정확하게 확인하고 진행하는 게 좋겠네요."
          },
          {
            text: "심사 전 대출 승인을 약속한다.",
            next: "finish",
            score: -10,
            response: "고객: 그럼 승인되는 걸로 알고 있겠습니다."
          }
        ]
      }
    ]
  },

  {
    name: "이민정",
    age: 36,
    job: "직장인",
    history: "신규 조합원, 신협 거래 없음",
    purpose: "정기적금 및 조합원 가입 상담",
    type: "deposit",
    amount: 100,
    steps: [

      {
        speaker: "고객",
        text: "매달 100만 원씩 저축하고 싶은데 적금 상품이 있을까요?",
        options: [
          {
            text: "저축 목적과 기간을 먼저 확인한다.",
            next: 1,
            score: 6,
            response: "고객: 2년 정도 모아서 전세자금에 보태려고 해요."
          },
          {
            text: "현재 적금 금리부터 안내한다.",
            next: 1,
            score: 2,
            response: "고객: 다른 혜택도 받을 수 있나요?"
          },
          {
            text: "바로 가입 신청서를 작성한다.",
            next: 1,
            score: -3,
            response: "고객: 어떤 상품인지 먼저 설명해 주세요."
          }
        ]
      },

      {
        speaker: "직원",
        text: "월 100만 원씩 2년간 저축하실 계획이군요. 혹시 신한카드나 다른 제휴상품을 이용하고 계신가요?",
        options: [
          {
            text: "우대금리 조건과 기존 카드 사용 여부를 확인한다.",
            next: 2,
            score: 6,
            response: "고객: 신한카드는 없고 체크카드만 사용하고 있어요."
          },
          {
            text: "우대조건을 설명하지 않고 기본금리만 안내한다.",
            next: 2,
            score: 1,
            response: "고객: 우대금리는 어떻게 받을 수 있나요?"
          },
          {
            text: "카드 발급을 무조건 권유한다.",
            next: 2,
            score: -5,
            response: "고객: 카드까지 꼭 만들어야 하나요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "가입 조건에 따라 우대금리를 받을 수 있는 상품이 있는지 확인해 보겠습니다. 신협 입출금 계좌와 조합원 가입도 함께 안내해 드릴까요?",
        options: [
          {
            text: "조합원 가입과 출자금의 특징 및 유의사항을 설명한다.",
            next: 3,
            score: 7,
            response: "고객: 출자금은 예금과 다른 건가요?"
          },
          {
            text: "적금만 안내하고 다른 거래는 생략한다.",
            next: 3,
            score: 2,
            response: "고객: 계좌도 여기서 만들 수 있나요?"
          },
          {
            text: "출자금을 예금처럼 원금이 보장된다고 설명한다.",
            next: 3,
            score: -10,
            response: "고객: 출자금도 예금자보호가 되는 거죠?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "출자금은 예금과 달리 예금자보호 대상이 아니며, 배당과 환급에 관한 별도 조건이 있습니다. 이 점을 이해하신 후 결정하시면 됩니다. 적금 가입을 진행해 볼까요?",
        options: [
          {
            text: "월 100만 원 적금 가입과 필요한 계좌 개설을 진행한다.",
            next: "finish",
            score: 9,
            sale: "deposit",
            amount: 100,
            response: "고객: 네. 오늘 적금부터 가입할게요."
          },
          {
            text: "상품 설명을 충분히 듣고 다음에 가입하기로 한다.",
            next: "finish",
            score: 4,
            response: "고객: 오늘 설명 잘 들었습니다. 생각해 보고 다시 올게요."
          },
          {
            text: "고객의 이해 여부를 확인하지 않고 가입을 진행한다.",
            next: "finish",
            score: -5,
            response: "고객: 조금 더 생각해 보고 결정할게요."
          }
        ]
      }
    ]
  },

  {
    name: "최성호",
    age: 52,
    job: "건물 임대업",
    history: "타 금융기관 화재보험 가입 이력",
    purpose: "건물 화재공제 상담",
    type: "insurance",
    amount: 1,
    steps: [

      {
        speaker: "고객",
        text: "제가 건물을 하나 가지고 있는데 화재보험을 다시 알아보려고요. 지금도 다른 보험에 가입되어 있습니다.",
        options: [
          {
            text: "현재 가입한 보험의 증권을 먼저 확인하자고 안내한다.",
            next: 1,
            score: 7,
            response: "고객: 증권을 가지고 있는데 한번 비교해 주실 수 있나요?"
          },
          {
            text: "우리 상품이 더 좋다고 설명한다.",
            next: 1,
            score: -4,
            response: "고객: 기존 보험과 비교해 보지도 않고요?"
          },
          {
            text: "보험료부터 안내한다.",
            next: 1,
            score: 1,
            response: "고객: 보장 내용도 궁금합니다."
          }
        ]
      },

      {
        speaker: "직원",
        text: "건물의 용도와 구조, 면적을 확인하고 싶습니다. 현재 임대 중이신가요? 건물 안에 어떤 시설이 있는지도 중요합니다.",
        options: [
          {
            text: "건물 용도, 구조, 면적, 임차인 및 시설을 확인한다.",
            next: 2,
            score: 8,
            response: "고객: 1층은 상가이고 2층은 사무실입니다. 임차인이 사용하고 있어요."
          },
          {
            text: "건물 가격만 확인한다.",
            next: 2,
            score: 1,
            response: "고객: 건물 용도도 중요한가요?"
          },
          {
            text: "기존 보험료와 동일하게 설계한다고 안내한다.",
            next: 2,
            score: -5,
            response: "고객: 건물 구조도 다른데 괜찮을까요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "기존 보험의 보장금액과 자기부담금, 화재 외 특약, 보험기간 등을 비교해야 합니다. 현재 보험에서 아쉬운 점이 있으셨나요?",
        options: [
          {
            text: "보장 공백과 중복 여부를 확인한다.",
            next: 3,
            score: 8,
            response: "고객: 보험료는 내고 있는데 실제로 어떤 보장이 있는지 잘 모르겠어요."
          },
          {
            text: "보험료 절감만 강조한다.",
            next: 3,
            score: 2,
            response: "고객: 보장도 괜찮은지 확인하고 싶어요."
          },
          {
            text: "기존 보험을 해지하고 새로 가입하라고 권한다.",
            next: 3,
            score: -8,
            response: "고객: 기존 보험을 먼저 해지해도 되는 건가요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "기존 보험 증권을 검토한 뒤 보장 내용과 보험료를 비교해 드리겠습니다. 비교 결과를 보시고 결정하셔도 됩니다.",
        options: [
          {
            text: "증권을 받아 무료 비교 상담을 진행하기로 한다.",
            next: "finish",
            score: 9,
            sale: "insurance",
            amount: 1,
            response: "고객: 좋습니다. 증권을 보내드릴 테니 비교해 주세요."
          },
          {
            text: "추가 상담 일정을 잡는다.",
            next: "finish",
            score: 5,
            response: "고객: 다음에 증권을 가지고 다시 방문하겠습니다."
          },
          {
            text: "비교 없이 바로 가입을 권유한다.",
            next: "finish",
            score: -7,
            response: "고객: 일단 기존 보험부터 확인하고 싶습니다."
          }
        ]
      }
    ]
  },

  {
    name: "정미숙",
    age: 63,
    job: "연금 수령자",
    history: "기존 조합원, 연금 수령 계좌 거래",
    purpose: "햇살론 및 생활자금 상담",
    type: "loan",
    amount: 300,
    steps: [

      {
        speaker: "고객",
        text: "생활비가 조금 부족해서 대출을 알아보고 있어요. 햇살론이라는 상품이 있다고 들었는데 여기서도 가능한가요?",
        options: [
          {
            text: "상품 설명에 앞서 필요한 자금과 사용 목적을 확인한다.",
            next: 1,
            score: 7,
            response: "고객: 생활비로 300만 원 정도 필요합니다."
          },
          {
            text: "햇살론 한도부터 안내한다.",
            next: 1,
            score: 1,
            response: "고객: 제가 그 금액을 받을 수 있을까요?"
          },
          {
            text: "대출이 가능하다고 먼저 안내한다.",
            next: 1,
            score: -6,
            response: "고객: 아직 심사도 안 했는데 가능한가요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "현재 어떤 소득이 있으신가요? 연금이나 근로소득, 사업소득 등이 있으시면 확인해 보겠습니다.",
        options: [
          {
            text: "연금 수령 내역과 소득증빙 가능 여부를 확인한다.",
            next: 2,
            score: 7,
            response: "고객: 매달 국민연금을 180만 원 정도 받고 있습니다."
          },
          {
            text: "연금 수령 여부만 확인한다.",
            next: 2,
            score: 2,
            response: "고객: 연금은 매달 받고 있어요."
          },
          {
            text: "소득 확인 없이 대출을 진행한다.",
            next: 2,
            score: -7,
            response: "고객: 소득서류가 없어도 되는 건가요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "현재 다른 금융기관 대출이나 카드론, 현금서비스 등 이용 중인 금융거래가 있으신가요?",
        options: [
          {
            text: "기존 대출과 연체 이력, 신용정보 및 보증 요건을 확인한다.",
            next: 3,
            score: 8,
            response: "고객: 카드론이 조금 있고 다른 대출은 없습니다."
          },
          {
            text: "기존 대출 금액만 확인한다.",
            next: 3,
            score: 3,
            response: "고객: 카드론이 200만 원 정도 있어요."
          },
          {
            text: "기존 대출은 상관없다고 안내한다.",
            next: 3,
            score: -7,
            response: "고객: 카드론이 있어도 괜찮은 건가요?"
          }
        ]
      },

      {
        speaker: "직원",
        text: "햇살론은 소득과 신용정보, 보증기관 요건 등 여러 조건을 확인해야 합니다. 우선 필요한 서류를 받아 가능 여부를 검토해 드리겠습니다.",
        options: [
          {
            text: "필요 서류를 안내하고 정식 상담을 진행한다.",
            next: "finish",
            score: 8,
            sale: "loan",
            amount: 300,
            response: "고객: 네. 서류 준비해서 다시 방문하겠습니다."
          },
          {
            text: "심사 후 결과를 안내하기로 한다.",
            next: "finish",
            score: 7,
            response: "고객: 정확하게 확인하고 알려주세요."
          },
          {
            text: "승인 가능 금액을 미리 확정해서 안내한다.",
            next: "finish",
            score: -10,
            response: "고객: 그럼 그 금액으로 대출이 되는 거죠?"
          }
        ]
      }
    ]
  }
];

// ======================================
// 화면 업데이트
// ======================================

function updateScreen() {
  document.getElementById("day").textContent = day;
  document.getElementById("sales").textContent =
    sales.toLocaleString();

  document.getElementById("satisfaction").textContent =
    satisfaction;

  document.getElementById("depositTotal").textContent =
    depositTotal.toLocaleString() + "만원";

  document.getElementById("loanTotal").textContent =
    loanTotal.toLocaleString() + "만원";

  document.getElementById("insuranceTotal").textContent =
    insuranceTotal + "건";

  document.getElementById("customerCount").textContent =
    dailyCustomers + "명";

  document.getElementById("skill").textContent =
    skill + "레벨";

  document.getElementById("goal").textContent =
    Math.min(100, Math.floor(sales / monthlyGoal * 100)) + "%";

  let rank = "신입 직원";

  if (sales >= 50000) rank = "주임";
  if (sales >= 150000) rank = "대리";
  if (sales >= 300000) rank = "과장";
  if (sales >= 500000) rank = "차장";

  document.getElementById("rank").textContent = rank;
}

// ======================================
// 고객 방문
// ======================================

function nextCustomer() {
  if (consultationActive) {
    alert("현재 고객 상담을 먼저 마무리해 주세요.");
    return;
  }

  if (dailyCustomers >= 3) {
    alert("오늘 방문 고객을 모두 응대했습니다.");
    return;
  }

  currentCustomer =
    customerCases[Math.floor(Math.random() * customerCases.length)];

  currentStep = 0;
  consultationActive = true;
  consultationCompleted = false;

  customerCount++;
  dailyCustomers++;

  document.getElementById("customerName").textContent =
    currentCustomer.name + " 고객님 (" + currentCustomer.age + "세)";

  document.getElementById("customerInfo").textContent =
    "직업: " + currentCustomer.job + " | " + currentCustomer.history;

  document.getElementById("customerRequest").textContent =
    "방문 목적: " + currentCustomer.purpose;

  document.getElementById("customerStatus").textContent = "상담 중";
  document.getElementById("customerStatus").classList.add("active");

  document.getElementById("nextCustomer").disabled = true;
  document.getElementById("finishConsult").disabled = false;

  addLog(currentCustomer.name + " 고객 방문");

  showConversation();
}

// ======================================
// 상담 진행
// ======================================

function showConversation() {
  const step = currentCustomer.steps[currentStep];

  if (!step) {
    finishConsultation();
    return;
  }

  const progress =
    Math.round((currentStep / currentCustomer.steps.length) * 100);

  document.getElementById("consultProgress").style.width =
    progress + "%";

  document.getElementById("consultStep").textContent =
    "상담 단계 " + (currentStep + 1) +
    " / " + currentCustomer.steps.length;

  document.getElementById("dialogue").textContent =
    step.speaker + ":\n" + step.text;

  const choices = document.getElementById("choices");
  choices.innerHTML = "";

  step.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.className = "choice-btn";
    button.textContent =
      (index + 1) + ". " + option.text;

    button.onclick = function() {
      chooseAnswer(index);
    };

    choices.appendChild(button);
  });
}

// ======================================
// 고객 반응 및 다음 상담
// ======================================

function chooseAnswer(index) {
  if (!consultationActive) return;

  const step = currentCustomer.steps[currentStep];
  const option = step.options[index];

  satisfaction += option.score;

  satisfaction = Math.max(0, Math.min(100, satisfaction));

  if (option.sale) {
    processSale(option);
  }

  document.getElementById("dialogue").textContent =
    option.response;

  addLog(
    currentCustomer.name +
    " 상담: " +
    option.text
  );

  if (option.next === "finish") {
    currentStep = currentCustomer.steps.length;

    document.getElementById("choices").innerHTML =
      "<p>상담이 완료되었습니다. 마무리 버튼을 눌러 주세요.</p>";

    document.getElementById("consultProgress").style.width = "100%";

    document.getElementById("consultStep").textContent =
      "상담 완료";

    consultationCompleted = true;
  } else {
    currentStep = option.next;

    document.getElementById("choices").innerHTML =
      "<p class='muted'>고객의 답변을 확인했습니다. 다음 상담을 진행합니다.</p>";

    setTimeout(function() {
      if (consultationActive) {
        showConversation();
      }
    }, 650);
  }

  updateScreen();
}

// ======================================
// 실적 반영
// ======================================

function processSale(option) {
  const amount = Number(option.amount || 0);

  if (option.sale === "deposit") {
    depositTotal += amount;
    sales += amount;

    addLog("예금 가입 실적 " + amount + "만원");
  }

  if (option.sale === "loan") {
    loanTotal += amount;
    sales += amount;

    addLog("대출 상담 및 접수 예정 " + amount + "만원");
  }

  if (option.sale === "insurance") {
    insuranceTotal++;

    addLog("공제 상담 및 증권 비교 접수");
  }

  skill = Math.floor(customerCount / 5) + 1;
}

// ======================================
// 상담 마무리
// ======================================

function finishConsultation() {
  if (!consultationActive) return;

  consultationActive = false;

  document.getElementById("customerStatus").textContent =
    "상담 종료";

  document.getElementById("customerStatus").classList.remove("active");

  document.getElementById("choices").innerHTML =
    "<div class='result'>상담이 마무리되었습니다. 다음 고객을 응대할 수 있습니다.</div>";

  document.getElementById("nextCustomer").disabled = false;
  document.getElementById("finishConsult").disabled = true;

  document.getElementById("consultProgress").style.width = "100%";
  document.getElementById("consultStep").textContent =
    "상담 종료";

  addLog(currentCustomer.name + " 상담 종료");

  updateScreen();
}

// ======================================
// 업무 버튼
// ======================================

document.getElementById("nextCustomer").addEventListener(
  "click",
  nextCustomer
);

document.getElementById("finishConsult").addEventListener(
  "click",
  finishConsultation
);

// ======================================
// 별도 예금 업무
// ======================================

function openWork(type) {
  const panel = document.getElementById("workPanel");

  if (consultationActive) {
    alert("현재 고객 상담을 마무리한 뒤 업무를 진행해 주세요.");
    return;
  }

  if (type === "deposit") {
    panel.innerHTML = `
      <h2>💰 예금 업무</h2>

      <div class="form-group">
        <label>상품 종류</label>
        <select id="depositType">
          <option value="정기예금">정기예금</option>
          <option value="정기적금">정기적금</option>
          <option value="출자금">출자금</option>
        </select>
      </div>

      <div class="form-group">
        <label>가입 금액 (만원)</label>
        <input id="depositAmount" type="number" min="1">
      </div>

      <div class="form-group">
        <label>연 금리 (%)</label>
        <input id="depositRate" type="number" value="3.5" min="0" step="0.01">
      </div>

      <div class="form-group">
        <label>예치 기간 (개월)</label>
        <input id="depositMonths" type="number" value="12" min="1">
      </div>

      <button class="main-btn" onclick="processDeposit()">가입 처리</button>
      <div id="depositResult"></div>
    `;
  }

  if (type === "loan") {
    panel.innerHTML = `
      <h2>🏠 대출 업무</h2>

      <div class="form-group">
        <label>대출 종류</label>
        <select id="loanType">
          <option>아파트 담보대출</option>
          <option>햇살론</option>
          <option>전세자금대출</option>
        </select>
      </div>

      <div class="form-group">
        <label>신청 금액 (만원)</label>
        <input id="loanAmount" type="number" min="1">
      </div>

      <div class="form-group">
        <label>연 소득 (만원)</label>
        <input id="income" type="number" min="0">
      </div>

      <div class="form-group">
        <label>기존 대출 (만원)</label>
        <input id="existingDebt" type="number" min="0">
      </div>

      <div class="form-group">
        <label>신용점수</label>
        <input id="creditScore" type="number" value="800" min="0" max="1000">
      </div>

      <button class="main-btn" onclick="processLoan()">가상 심사 진행</button>
      <div id="loanResult"></div>
    `;
  }

  if (type === "insurance") {
    panel.innerHTML = `
      <h2>🛡️ 공제 업무</h2>

      <div class="form-group">
        <label>상담 상품</label>
        <select id="insuranceType">
          <option>화재공제</option>
          <option>운전자공제</option>
          <option>간병공제</option>
        </select>
      </div>

      <div class="form-group">
        <label>상담 목적</label>
        <select id="insuranceNeed">
          <option>기존 보험 점검</option>
          <option>신규 보장 가입</option>
          <option>보험료 부담 완화</option>
        </select>
      </div>

      <button class="main-btn" onclick="processInsurance()">상담 기록</button>
      <div id="insuranceResult"></div>
    `;
  }

  if (type === "record") {
    let html = `
      <h2>📒 업무 일지</h2>
      <div class="result">
        누적 실적: ${sales.toLocaleString()}만원<br>
        예금 실적: ${depositTotal.toLocaleString()}만원<br>
        대출 실적: ${loanTotal.toLocaleString()}만원<br>
        공제 상담: ${insuranceTotal}건<br>
        고객 만족도: ${satisfaction}점
      </div>
      <h3>상담 기록</h3>
    `;

    if (logs.length === 0) {
      html += "<p>기록된 업무가 없습니다.</p>";
    }

    logs.slice().reverse().forEach(log => {
      const item = document.createElement("div");
      item.className = "log-item";
      item.textContent = log;
      html += item.outerHTML;
    });

    panel.innerHTML = html;
  }
}

// ======================================
// 예금 처리
// ======================================

function processDeposit() {
  const type = document.getElementById("depositType").value;
  const amount = Number(document.getElementById("depositAmount").value);
  const rate = Number(document.getElementById("depositRate").value);
  const months = Number(document.getElementById("depositMonths").value);

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(rate) ||
    !Number.isFinite(months) ||
    amount <= 0 ||
    rate < 0 ||
    months <= 0
  ) {
    alert("금액과 기간을 정확히 입력해 주세요.");
    return;
  }

  const interest = amount * rate / 100 * months / 12;
  const afterTax = interest * 0.846;

  depositTotal += amount;
  sales += amount;

  document.getElementById("depositResult").innerHTML = `
    <div class="result">
      <h3>가입 처리 완료</h3>
      상품: ${type}<br>
      가입 금액: ${amount.toLocaleString()}만원<br>
      예상 세전 이자: ${interest.toFixed(2)}만원<br>
      일반과세 가정 세후 이자: ${afterTax.toFixed(2)}만원<br>
      ※ 단순 예상 계산이며 실제 상품 조건 및 과세와 다를 수 있습니다.
    </div>
  `;

  addLog(type + " 가입 " + amount + "만원");
  satisfaction = Math.min(100, satisfaction + 2);

  updateScreen();
}

// ======================================
// 대출 가상 심사
// ======================================

function processLoan() {
  const type = document.getElementById("loanType").value;
  const amount = Number(document.getElementById("loanAmount").value);
  const income = Number(document.getElementById("income").value);
  const debt = Number(document.getElementById("existingDebt").value);
  const score = Number(document.getElementById("creditScore").value);

  if (
    !Number.isFinite(amount + income + debt + score) ||
    amount <= 0 ||
    income < 0 ||
    debt < 0 ||
    score < 0 ||
    score > 1000
  ) {
    alert("입력 정보를 확인해 주세요.");
    return;
  }

  let risk = 0;

  if (income === 0) risk += 3;
  if (income > 0 && debt > income * 3) risk += 2;
  if (score < 600) risk += 3;
  else if (score < 700) risk += 1;
  if (income > 0 && amount > income * 5) risk += 2;

  let result = "추가 확인 필요";

  if (risk <= 1) result = "기초 정보 양호";
  if (risk >= 5) result = "주의 필요";

  document.getElementById("loanResult").innerHTML = `
    <div class="result">
      <h3>가상 검토 결과: ${result}</h3>
      대출 종류: ${type}<br>
      신청 금액: ${amount.toLocaleString()}만원<br>
      연 소득: ${income.toLocaleString()}만원<br>
      기존 부채: ${debt.toLocaleString()}만원<br>
      신용점수: ${score}점<br><br>
      ※ 실제 대출 승인 및 한도를 의미하지 않습니다. 담보·보증·DSR·LTV·상환능력 등 정식 심사가 필요합니다.
    </div>
  `;

  addLog(type + " 가상 심사 진행");

  updateScreen();
}

// ======================================
// 공제 상담
// ======================================

function processInsurance() {
  const type = document.getElementById("insuranceType").value;
  const need = document.getElementById("insuranceNeed").value;

  let guide = "";

  if (type === "화재공제") {
    guide = "건물 구조, 용도, 면적, 임대 여부, 기존 보험의 보장금액과 특약을 확인하세요.";
  } else if (type === "운전자공제") {
    guide = "운전 빈도, 기존 운전자 보장, 벌금 및 변호사 선임 관련 보장과 약관을 확인하세요.";
  } else {
    guide = "간병 필요 상황, 보장 기간, 간호간병통합서비스 및 갱신 조건을 확인하세요.";
  }

  insuranceTotal++;

  document.getElementById("insuranceResult").innerHTML = `
    <div class="result">
      <h3>${type} 상담 기록</h3>
      고객 요구: ${need}<br><br>
      상담 확인 사항:<br>
      ${guide}
    </div>
  `;

  addLog(type + " 상담: " + need);
  satisfaction = Math.min(100, satisfaction + 2);

  updateScreen();
}

// ======================================
// 하루 마감
// ======================================

function endDay() {
  if (consultationActive) {
    alert("진행 중인 고객 상담을 먼저 마무리해 주세요.");
    return;
  }

  const result = document.getElementById("dayResult");

  result.innerHTML = `
    <div class="result">
      <h3>${day}일차 영업 마감</h3>
      오늘 응대한 고객: ${dailyCustomers}명<br>
      누적 실적: ${sales.toLocaleString()}만원<br>
      고객 만족도: ${satisfaction}점<br>
      현재 숙련도: ${skill}레벨<br>
      오늘도 수고하셨습니다!
    </div>
  `;

  addLog(day + "일차 영업 마감");

  day++;
  dailyCustomers = 0;

  document.getElementById("customerName").textContent =
    "새로운 영업일이 시작되었습니다.";

  document.getElementById("customerInfo").textContent =
    "다음 고객을 기다리고 있습니다.";

  document.getElementById("customerRequest").textContent = "";

  document.getElementById("dialogue").textContent =
    "새로운 영업일입니다. 고객을 응대해 주세요.";

  document.getElementById("choices").innerHTML = "";

  document.getElementById("customerStatus").textContent = "대기 중";
  document.getElementById("customerStatus").classList.remove("active");

  document.getElementById("consultProgress").style.width = "0%";
  document.getElementById("consultStep").textContent =
    "새로운 영업일이 시작되었습니다.";

  document.getElementById("nextCustomer").disabled = false;
  document.getElementById("finishConsult").disabled = true;

  updateScreen();
}

// ======================================
// 업무 기록
// ======================================

function addLog(message) {
  const time = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  logs.push(
    day + "일차 " + time + " | " + message
  );
}

// ======================================
// 게임 시작
// ======================================

updateScreen();
