<template>
  <div class="calendarWrapper">
    <header class="calendarHeader">
      <h2>{{ currentYear }}년 {{ currentMonth + 1 }}월</h2>
      <div class="rightSection">
        <div class="labelSection">
          <span class="label incomeLabel">● 수입</span>
          <span class="label expenseLabel">● 지출</span>
        </div>
        <button class="arrowButton" @click="prevMonth">
          <img src="/arrow2.png" alt="Previous Month" />
        </button>
        <button class="arrowButton" @click="nextMonth">
          <img src="/arrow.png" alt="Next Month" />
        </button>
      </div>
    </header>

    <div class="daynames">
      <div class="dayname" v-for="(dn, i) in dayNames" :key="i">
        {{ dn }}
      </div>
    </div>

    <div class="calendarGrid">
      <div
        v-for="(day, index) in calendarData"
        :key="index"
        class="calendarCell"
        @click="openModal(day)"
        :class="{ nonCurrent: !day.isCurrentMonth }"
      >
        <span class="cellDate">{{ day.date.getDate() }}</span>
        <div class="cellDetails">
          <p v-if="day.income" class="income">{{ formatNumber(day.income) }}</p>
          <p v-if="day.expense" class="expense">
            {{ formatNumber(day.expense) }}
          </p>
          <p v-if="day.fixedExpense" class="fixedExpense">
            {{ formatNumber(day.fixedExpense) }}
          </p>
        </div>
      </div>
    </div>
    <TransactionModal
      :isOpen="isModalOpen"
      :date="selectedDate"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import TransactionModal from './TransactionModal.vue';
import axios from 'axios';

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  const days = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      income: null,
      expense: null,
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
}

const props = defineProps({
  year: Number,
  month: Number,
});

const emit = defineEmits(['update:year', 'update:month']);

const currentYear = computed(() => props.year);
const currentMonth = computed(() => props.month);
const calendarData = ref([]);
const transactions = ref([]);
const fixedExpenses = ref([]);

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
const isModalOpen = ref(false);
const selectedDate = ref(null);

function openModal(day) {
  selectedDate.value = day.date;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}
function formatNumber(num) {
  if (!num) return '';
  return num.toLocaleString('ko-KR');
}

function updateCalendarData() {
  const days = getCalendarDays(currentYear.value, currentMonth.value);
  days.forEach((day) => {
    const formatted = day.date.toISOString().split('T')[0];
    const dayTx = transactions.value.filter((tx) => tx.date === formatted);
    const currentDisplayedMonth = currentMonth.value + 1;

    const fixedTx = fixedExpenses.value.filter((fx) => {
      if (fx.day !== day.date.getDate()) return false;
      if (fx.deletedAt !== null && fx.deletedAt !== undefined) {
        return currentDisplayedMonth < fx.deletedAt;
      }
      return true;
    });

    let incomeSum = 0,
      expenseSum = 0,
      fixedExpenseSum = 0;

    dayTx.forEach((tx) => {
      if (tx.typeid === 1) {
        incomeSum += tx.amount; // 수입
      } else if (tx.typeid === 2) {
        expenseSum += tx.amount; // 지출
      }
    });

    fixedTx.forEach((tx) => {
      fixedExpenseSum += tx.amount; // 고정 지출
    });

    day.income = incomeSum || null;
    day.expense = expenseSum || null;
    day.fixedExpense = fixedExpenseSum || null; // 고정 지출 추가
  });
  calendarData.value = days;
}

const isDataLoaded = ref(false);
const savingGoal = ref(null);
onMounted(async () => {
  try {
    const UserId = localStorage.getItem('loggedInUserId');
    const responseGoal = await axios.get(
      `http://localhost:3000/user/${UserId}`
    );
    savingGoal.value = responseGoal.data.goalSavings;

    const [moneyRes, fixedRes] = await Promise.all([
      axios.get('http://localhost:3000/money'),
      axios.get('http://localhost:3000/fixedExpenses'),
    ]);
    transactions.value = moneyRes.data.filter(
      (entry) => entry.userid == UserId
    );
    fixedExpenses.value = fixedRes.data.filter(
      (entry) => entry.userid == UserId
    );
    isDataLoaded.value = true;
    updateCalendarData(); // 최초 1회 수동 호출
  } catch (error) {
    console.error('데이터 불러오기 실패:', error);
  }
});

// watch 안에서 조건 걸기
watch([currentYear, currentMonth], () => {
  if (isDataLoaded.value) {
    updateCalendarData();
  }
});

function prevMonth() {
  if (currentMonth.value === 0) {
    emit('update:year', currentYear.value - 1);
    emit('update:month', 11);
  } else {
    emit('update:month', currentMonth.value - 1);
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    emit('update:year', currentYear.value + 1);
    emit('update:month', 0);
  } else {
    emit('update:month', currentMonth.value + 1);
  }
}
</script>

<style scoped>
.dark .calendarWrapper,
.dark .calendarHeader,
.dark .calendarGrid {
  background-color: #1f2937;
  color: #e5e7eb;
}
.dark .calendarCell {
  background-color: #374151;
  border: 1px solid #4b5563;
}
.calendarWrapper {
  max-width: 1200px;
  margin: 1rem auto;
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.labelSection {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  margin-left: 2rem;
}

.label {
  display: flex;
  align-items: center;
}

.incomeLabel {
  color: #16a34a;
}
.fixedExpense {
  color: #facc15; /* 노란색 */
  font-weight: bold;
}
.expenseLabel {
  color: #ef4444;
}
.calendarHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.rightSection {
  display: flex;
  gap: 0.5rem;
}

.arrowButton {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}
.arrowButton img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}
.daynames {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #64748b;
}

.calendarGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
}

.calendarCell {
  position: relative;
  height: 100px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer; /* 클릭 가능한 상태로 설정 */
}

.cellDate {
  position: absolute;
  top: 8px;
  left: 8px;
  font-weight: 500;
}

.cellDetails {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}
.income,
.expense,
.fixedExpense {
  margin: 0.8rem 0 0.1rem 0;
  padding: 0;
  line-height: 1.2;
}

.income {
  color: #16a34a;
}

.expense {
  color: #ef4444;
}

.nonCurrent {
  opacity: 0.5;
  pointer-events: none; /* 비활성화된 날짜는 클릭 불가 */
}
@media (max-width: 1024px) {
  .calendarWrapper {
    padding: 1rem;
  }

  .calendarGrid {
    gap: 0.5rem;
  }

  .calendarCell {
    height: 80px;
    padding: 6px;
  }

  .cellDetails {
    font-size: 0.75rem;
  }

  .income,
  .expense,
  .fixedExpense {
    display: none; /* 수입, 지출, 고정 지출 숨기기 */
  }

  .arrowButton img {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .calendarHeader {
    flex-direction: column; /* 헤더를 세로로 정렬 */
    align-items: flex-start;
  }

  .labelSection {
    margin-left: 0;
    margin-bottom: 1rem;
  }

  .calendarGrid {
    gap: 0.5rem;
  }

  .calendarCell {
    height: 70px;
    padding: 4px;
  }

  .cellDetails {
    font-size: 0.7rem;
  }

  .income,
  .expense,
  .fixedExpense {
    display: none; /* 수입, 지출, 고정 지출 숨기기 */
  }

  .arrowButton img {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 480px) {
  .calendarWrapper {
    padding: 0.5rem;
  }

  .calendarGrid {
    gap: 0.25rem;
  }

  .calendarCell {
    height: 60px;
    padding: 4px;
  }

  .cellDetails {
    font-size: 0.65rem;
  }

  .income,
  .expense,
  .fixedExpense {
    display: none; /* 수입, 지출, 고정 지출 숨기기 */
  }

  .arrowButton img {
    width: 25px;
    height: 25px;
  }
}
</style>
