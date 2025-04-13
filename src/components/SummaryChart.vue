<template>
  <div class="monthSummaryContainer">
    <!-- 상단 요약 영역 -->
    <div class="summaryHeader">
      <div class="summaryBox income">
        총 수입<br />{{ formatMoney(totalIncome) }}
      </div>
      <div class="summaryBox expense">
        총 지출<br />{{ formatMoney(totalExpense) }}
      </div>
      <div class="summaryBox balance">잔액<br />{{ formatMoney(balance) }}</div>
    </div>

    <!-- 그래프 영역 (두개로 분리해서 나란히 배치) -->
    <div class="graphsFlexContainer">
      <!-- 카테고리별 수입 그래프 -->
      <div class="categoryBars incomeBars">
        <h3>카테고리별 수입 현황</h3>
        <div
          v-for="catId in incomeCategoryIds"
          :key="'income' + catId"
          class="categoryBar"
        >
          <div class="label">{{ getCategoryName(catId) }}</div>
          <div class="barContainer">
            <div
              class="bar incomeBar"
              :style="{ width: getIncomeBarWidth(catId) + '%' }"
            ></div>
          </div>
          <div class="amount incomeAmount">
            {{ formatMoney(categoryIncomes[catId]) }}
          </div>
        </div>
      </div>

      <!-- 카테고리별 지출 그래프 -->
      <div class="categoryBars expenseBars">
        <h3>카테고리별 지출 현황</h3>
        <div
          v-for="catId in expenseCategoryIds"
          :key="'expense' + catId"
          class="categoryBar"
        >
          <div class="label">{{ getCategoryName(catId) }}</div>
          <div class="barContainer">
            <div
              class="bar expenseBar"
              :style="{ width: getExpenseBarWidth(catId) + '%' }"
            ></div>
          </div>
          <div class="amount expenseAmount">
            {{ formatMoney(categoryExpenses[catId]) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
});

const transactions = ref([]);
const categoryData = ref([]);
const fixedExpenses = ref([]);
// 전달받은 연도와 월에 해당하는 거래 내역 필터링
const monthlyTransactions = computed(() => {
  return transactions.value.filter((tx) => {
    const [txYear, txMonth] = tx.date.split('-');
    return Number(txYear) === props.year && Number(txMonth) === props.month;
  });
});
const incomeCategoryIds = computed(() => Object.keys(categoryIncomes.value));
const expenseCategoryIds = computed(() => Object.keys(categoryExpenses.value));
const getCategoryName = (catId) => {
  const cat = categoryData.value.find((c) => c.id === Number(catId));
  return cat ? cat.name : '기타';
};

// 총 수입: typeid === 1
const totalIncome = computed(() =>
  monthlyTransactions.value
    .filter((tx) => tx.typeid === 1) // 수입만 필터링
    .reduce((sum, tx) => sum + tx.amount, 0)
);

// 총 지출: typeid === 2
const totalExpense = computed(() => {
  const transactionExpenses = monthlyTransactions.value
    .filter((tx) => tx.typeid === 2) // 지출만 필터링
    .reduce((sum, tx) => sum + tx.amount, 0);

  const fixedExpensesTotal = fixedExpenses.value
    .filter((expense) => !expense.deletedAt || expense.deletedAt > props.month) // deletedAt이 null이거나 현재 달보다 큰 경우만 포함
    .reduce((sum, expense) => sum + expense.amount, 0);

  return transactionExpenses + fixedExpensesTotal;
});

// 잔액: 수입 - 지출
const balance = computed(() => totalIncome.value - totalExpense.value);

const categoryExpenses = computed(() => {
  const result = {};

  // 월별 거래 데이터에서 지출 합산
  monthlyTransactions.value.forEach((tx) => {
    if (tx.typeid === 2) {
      if (!result[tx.categoryid]) result[tx.categoryid] = 0;
      result[tx.categoryid] += tx.amount;
    }
  });

  // 고정 지출 데이터에서 지출 합산
  fixedExpenses.value
    .filter((expense) => !expense.deletedAt || expense.deletedAt > props.month) // deletedAt이 null이거나 현재 달보다 큰 경우만 포함
    .forEach((expense) => {
      if (!result[expense.categoryid]) result[expense.categoryid] = 0;
      result[expense.categoryid] += expense.amount;
    });

  return result;
});

const categoryIncomes = computed(() => {
  const result = {};
  monthlyTransactions.value.forEach((tx) => {
    if (tx.typeid === 1) {
      if (!result[tx.categoryid]) result[tx.categoryid] = 0;
      result[tx.categoryid] += tx.amount;
    }
  });
  return result;
});

const maxExpense = computed(() =>
  Math.max(...Object.values(categoryExpenses.value), 1)
);
const maxIncome = computed(() =>
  Math.max(...Object.values(categoryIncomes.value), 1)
);

const getExpenseBarWidth = (catId) => {
  const amount = categoryExpenses.value[catId] || 0;
  return Math.round((amount / maxExpense.value) * 100);
};

const getIncomeBarWidth = (catId) => {
  const amount = categoryIncomes.value[catId] || 0;
  return Math.round((amount / maxIncome.value) * 100);
};

// 금액을 천 단위 콤마로 포맷
const formatMoney = (num) => {
  if (!num) return '0';
  return num.toLocaleString('ko-KR');
};
const savingGoal = ref(null);
// 거래 데이터 로드
onMounted(async () => {
  try {
    const UserId = localStorage.getItem('loggedInUserId');
    const responseGoal = await axios.get(
      `http://localhost:3000/user/${UserId}`
    );
    savingGoal.value = responseGoal.data.goalSavings;

    const [moneyRes, categoryRes, expenseRes] = await Promise.all([
      axios.get('http://localhost:3000/money'),
      axios.get('http://localhost:3000/category'),
      axios.get('http://localhost:3000/fixedExpenses'),
    ]);

    transactions.value = moneyRes.data.filter(
      (entry) => entry.userid == UserId
    );
    categoryData.value = categoryRes.data;
    fixedExpenses.value = expenseRes.data
      .filter((entry) => entry.userid == UserId)
      .map((entry) => ({
        ...entry,
        categoryid: Number(entry.categoryid),
      }));
  } catch (error) {
    console.error('Failed to fetch transactions or categories:', error);
  }
});
</script>

<style scoped>
.dark .monthSummaryContainer,
.dark .summaryHeader {
  background-color: #1f2937; /* dark:bg-gray-800 */
  color: #f9fafb; /* dark:text-gray-200 */
  border: 1px solid #1f2937; /* 어두운 테두리 */
}
.dark .summaryBox {
  background-color: #374151; /* 어두운 배경 */
  border: 1px solid #4b5563; /* 어두운 테두리 */
}
/* 카테고리 바 리스트 */
.dark .categoryBars h3 {
  color: #f9fafb; /* 밝은 텍스트 */
}

.dark .categoryBar .label {
  color: #f9fafb; /* 밝은 텍스트 */
}
.dark .categoryBar .amount {
  color: #f9fafb; /* 밝은 텍스트 */
}

.monthSummaryContainer {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

/* 상단 요약 영역 */
.summaryHeader {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  text-align: center;
}
.graphsFlexContainer {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.categoryBars {
  flex: 1;
}

.categoryBars h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #374151;
}

.categoryBar {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.label {
  width: 80px;
  font-size: 0.875rem;
}

.barContainer {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  margin: 0 1rem;
  position: relative;
}

.bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.expenseBar {
  background-color: #3b82f6; /* 파랑 (지출) */
}

.incomeBar {
  background-color: #22c55e; /* 초록 (수입) */
}

.amount {
  width: 80px;
  text-align: right;
  font-size: 0.875rem;
}

.expenseAmount {
  color: #3b82f6;
}

.incomeAmount {
  color: #22c55e;
}

.summaryBox {
  flex: 1;
  margin: 0 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}
.categoryBar {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 10px;
}

.barContainer {
  flex: 1;
  display: flex;
  position: relative;
  background-color: #f0f4f8;
  border-radius: 5px;
  height: 8px;
}

.bar {
  height: 100%;
  border-radius: 5px;
}

.expenseBar {
  background-color: #3b82f6; /* 파란색 (지출) */
  position: absolute;
  left: 0;
}

.incomeBar {
  background-color: #22c55e; /* 초록색 (수입) */
  position: absolute;
  left: 0;
  opacity: 0.7;
}

.label {
  width: 100px;
}

.amounts {
  width: 120px;
  font-size: 0.9rem;
  text-align: right;
}

.expenseAmount {
  color: #3b82f6;
}

.incomeAmount {
  color: #22c55e;
}

/* 예시 색상 (녹색 / 빨간색 / 파랑) */
.summaryBox.income {
  color: #10b981; /* 녹색 */
}
.summaryBox.expense {
  color: #ef4444; /* 빨간색 */
}
.summaryBox.balance {
  color: #3b82f6; /* 파랑 */
}

/* 카테고리 바 리스트 */
.categoryBars {
  margin-top: 2rem;
}
.categoryBars h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #374151;
}

.categoryBar {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

/* 카테고리 이름 */
.categoryBar .label {
  width: 80px;
  font-size: 0.875rem;
  color: #374151;
}

/* 가로 막대 컨테이너 */
.barContainer {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  margin: 0 1rem;
  position: relative;
}

/* 실제 막대 */
.barContainer .bar {
  height: 100%;
  background: #3b82f6; /* 파랑 막대 */
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 금액 표시 */
.categoryBar .amount {
  width: 80px;
  text-align: right;
  font-size: 0.875rem;
  color: #374151;
}
@media (max-width: 1024px) {
  .summaryHeader {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .summaryBox {
    flex: 1 1 calc(50% - 1rem);
    margin: 0.5rem;
  }

  .graphsFlexContainer {
    flex-direction: column;
    gap: 1.5rem;
  }

  .categoryBars h3 {
    font-size: 1.1rem;
  }

  .label {
    font-size: 0.8rem;
  }

  .amount {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .summaryHeader {
    flex-direction: column;
    gap: 1rem;
  }

  .summaryBox {
    flex: none;
    width: 100%;
    margin: 0.5rem 0;
  }

  .graphsFlexContainer {
    gap: 1rem;
  }

  .categoryBars h3 {
    font-size: 1rem;
  }

  .label {
    font-size: 0.75rem;
  }

  .amount {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .monthSummaryContainer {
    padding: 0.5rem;
  }

  .summaryHeader {
    gap: 0.5rem;
  }

  .summaryBox {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .graphsFlexContainer {
    gap: 0.5rem;
  }

  .categoryBars h3 {
    font-size: 0.9rem;
  }

  .label {
    font-size: 0.7rem;
  }

  .amount {
    font-size: 0.7rem;
  }
}
</style>
