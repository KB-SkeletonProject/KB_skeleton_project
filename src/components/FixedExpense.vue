<template>
  <h3>고정 지출</h3>
  <div class="fixedExpenses">
    <!-- 테이블 헤더 -->
    <div class="expenseHeader">
      <span>일자</span>
      <span>항목</span>
      <span>금액</span>
    </div>

    <!-- 고정 지출 항목 -->
    <div v-for="expense in expenses" :key="expense.id" class="expenseItem">
      <span>{{ expense.day }}일</span>
      <span>{{ expense.description }}</span>
      <span>{{ expense.amount.toLocaleString() }}원</span>
    </div>

    <!-- 총합 -->
    <div class="totalExpenses">총 {{ totalAmount.toLocaleString() }}원</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 고정 지출 데이터
const expenses = ref([]);

// 총합 계산
const totalAmount = ref(0);
const savingGoal = ref(null);

// 데이터 가져오기
const fetchData = async () => {
  try {
    const userId = localStorage.getItem('loggedInUserId');
    const responseGoal = await axios.get(
      `http://localhost:3000/user/${userId}`
    );
    savingGoal.value = responseGoal.data.goalSavings;

    const res = await axios.get('http://localhost:3000/fixedExpenses');
    expenses.value = Array.isArray(res.data)
      ? res.data
          .filter((entry) => entry.userid == userId && entry.deletedAt === null)
          .sort((a, b) => a.day - b.day)
      : [];

    totalAmount.value = expenses.value.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  } catch (error) {
    console.error('데이터 로딩 실패:', error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dark .fixedExpenses {
  background-color: #374151;
  border: 1px solid #4b5563;
  color: #e5e7eb;
}
.dark .expenseItem,
.dark .totalExpenses {
  color: #e5e7eb;
}
.dark .expenseHeader {
  color: #83a4eb;
}

.fixedExpenses {
  border-radius: 8px;
  padding: 1rem;
  background-color: #f9fafb;
}

.expenseHeader {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2563eb;
}

.expenseItem {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.totalExpenses {
  text-align: right;
  font-weight: bold;
  color: #111827;
  margin-top: 1rem;
}
</style>
