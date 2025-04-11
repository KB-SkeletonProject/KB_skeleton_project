<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import ExpenseChart from '../components/ExpenseChart.vue';
import CategoryFilterModal from '../components/CategoryFilterModal.vue';

const allLabels = [
  '식사/카페',
  '배달/간식',
  '쇼핑',
  '교통/차량',
  '주거/관리',
  '건강/병원',
  '취미/여가',
  '구독서비스',
  '여행/외출',
  '기타지출',
];

//  필터 모달 제어
const selectedCategories = ref([...allLabels]);
const isFilterModalOpen = ref(false);
const openFilterModal = () => (isFilterModalOpen.value = true);
const closeFilterModal = () => (isFilterModalOpen.value = false);
const applyFilter = (newSelection) => {
  selectedCategories.value = [...newSelection];
  closeFilterModal();
};

// 거래 추가 모달 제어
const isTransactionModalOpen = ref(false);
const openTransactionModal = () => (isTransactionModalOpen.value = true);
const closeTransactionModal = () => (isTransactionModalOpen.value = false);

//  로그인 유저 기반 데이터 로딩
const currentUser = ref(null);
const moneyData = ref([]);
const userList = ref([]);
const categoryList = ref([]);

const mySpending = ref(Array(allLabels.length).fill(0));
const avgSpending = ref(Array(allLabels.length).fill(0));

const getCategoryNameById = (id) => {
  const found = categoryList.value.find((cat) => cat.id === id);
  return found ? found.name : '';
};

onMounted(async () => {
  try {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    const [moneyRes, userRes, categoryRes] = await Promise.all([
      axios.get('http://localhost:3000/money'),
      axios.get('http://localhost:3000/user'),
      axios.get('http://localhost:3000/category'),
    ]);

    moneyData.value = moneyRes.data;
    userList.value = userRes.data;
    categoryList.value = categoryRes.data;

    currentUser.value = userList.value.find((u) => u.id === loggedInUserId);
    if (!currentUser.value) return;

    const ageGroup = currentUser.value.age;

    const myExpenses = moneyData.value.filter(
      (m) => m.userid === loggedInUserId && m.typeid === 2
    );

    const sameAgeUsers = userList.value
      .filter((u) => u.age === ageGroup)
      .map((u) => u.id);

    const ageGroupExpenses = moneyData.value.filter(
      (m) => sameAgeUsers.includes(m.userid) && m.typeid === 2
    );

    allLabels.forEach((label, index) => {
      mySpending.value[index] = myExpenses
        .filter((m) => getCategoryNameById(m.categoryid) === label)
        .reduce((sum, cur) => sum + cur.amount, 0);

      const groupValues = ageGroupExpenses
        .filter((m) => getCategoryNameById(m.categoryid) === label)
        .map((m) => m.amount);

      avgSpending.value[index] =
        groupValues.length > 0
          ? Math.round(
              groupValues.reduce((a, b) => a + b, 0) / groupValues.length
            )
          : 0;
    });
  } catch (err) {
    console.error('데이터 불러오기 오류:', err);
  }
});

// 필터링된 데이터 계산
const filteredLabels = computed(() =>
  allLabels.filter((label) => selectedCategories.value.includes(label))
);
const filteredMySpending = computed(() =>
  allLabels
    .map((label, i) =>
      selectedCategories.value.includes(label) ? mySpending.value[i] : null
    )
    .filter((v) => v !== null)
);
const filteredAvgSpending = computed(() =>
  allLabels
    .map((label, i) =>
      selectedCategories.value.includes(label) ? avgSpending.value[i] : null
    )
    .filter((v) => v !== null)
);

//  헤더
import { useRouter } from 'vue-router';
const router = useRouter();
const isDarkMode = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};
const goToHome = () => router.push('/home');
const mypageClick = () => router.push('/myPage');
const logout = () => {
  alert('안녕히가세요!');

  localStorage.removeItem('loggedInUserId');
  localStorage.removeItem('loggedInUserInfo');

  router.push('/');
};
</script>

<template>
  <header class="dashboardHeader">
    <h1 class="dashboardTitle">
      <img
        src="/src/assets/icons/logo.png"
        class="iconImage"
        @click="goToHome"
      />Piggy Bank
    </h1>
    <div class="flex items-center gap-2 relative">
      <button @click="toggleDarkMode" class="darkModeButton">
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
      <button class="mypageButton" @click="mypageClick">마이페이지</button>
      <button class="inputValue" @click="openTransactionModal">
        새 거래추가
      </button>
      <button class="logout" @click="logout">로그아웃</button>
    </div>
  </header>

  <div class="age-expense-analysis">
    <div class="header">
      <button @click="openFilterModal" class="filter-button">카테고리</button>
    </div>

    <ExpenseChart
      :labels="filteredLabels"
      :my-data="filteredMySpending"
      :avg-data="filteredAvgSpending"
    />

    <CategoryFilterModal
      v-if="isFilterModalOpen"
      :isOpen="isFilterModalOpen"
      :categories="allLabels"
      :selectedCategories="selectedCategories"
      @close="closeFilterModal"
      @apply="applyFilter"
    />
  </div>
</template>

<style scoped>
.age-expense-analysis {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  padding-right: 20px;
}
.chart-title {
  font: var(--ng-bold-24);
  color: var(--primary-color);
}

.filter-button {
  padding: 8px 16px;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background-color: white;
  color: var(--primary-color);
  font: var(--ng-reg-14);
  cursor: pointer;
}

/* 헤더  */
.dashboard {
  padding: 2rem;
  margin: 0;
  background: linear-gradient(to bottom, #fff9fe, #ffffff);
  font-family: sans-serif;
  box-sizing: border-box;
  color: black;
}
.dark .dashboard {
  background: linear-gradient(to bottom, #121212, #121212);
  color: #f1f1f1;
}
.dashboardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fbcee8;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.dashboardTitle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
}
.iconImage {
  width: 60px;
  height: 60px;
  cursor: pointer;
}

.flex {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.darkModeButton {
  padding: 8px 12px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  cursor: pointer;
}

.mypageButton,
.logout,
.inputValue {
  background-color: rgb(254, 235, 253);
  border: 1px solid rgb(251, 209, 251);
  border-radius: 0.5rem;
  padding: 12px 24px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-weight: 600;
  color: #333;
}
</style>
