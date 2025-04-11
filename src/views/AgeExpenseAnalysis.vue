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

// 카테고리 이름을 id로부터 매핑 함수
const getCategoryNameById = (id) => {
  const found = categoryList.value.find((cat) => cat.id === id);
  return found ? found.name : '';
};

// 데이터 불러오기 및 분석 계산
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
    const categoryIds = categoryList.value.map((cat) => cat.id);

    // 초기화
    mySpending.value = {};
    avgSpending.value = {};
    categoryIds.forEach((id) => {
      mySpending.value[id] = 0;
      avgSpending.value[id] = 0;
    });

    selectedCategories.value = [...categoryIds];

    const myExpenses = moneyData.value.filter(
      (m) => m.userid === loggedInUserId && m.typeid === 2
    );

    const sameAgeUsers = userList.value
      .filter((u) => u.age === ageGroup)
      .map((u) => u.id);

    const ageGroupExpenses = moneyData.value.filter(
      (m) => sameAgeUsers.includes(m.userid) && m.typeid === 2
    );

    categoryIds.forEach((id) => {
      // 내 지출 합산
      mySpending.value[id] = myExpenses
        .filter((m) => m.categoryid === id)
        .reduce((sum, cur) => sum + cur.amount, 0);

      // 같은 연령대 평균 지출 계산
      const groupAmounts = sameAgeExpenses
        .filter((m) => m.categoryid === id)
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
  <div class="dashboard">
    <!-- 헤더  -->
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

    <!-- 연령대 소비 분석 영역  -->
    <div class="age-expense-analysis">
      <ExpenseChart
        :labels="filteredLabels"
        :my-data="filteredMySpending"
        :avg-data="filteredAvgSpending"
        :isDarkMode="isDarkMode"
      />
    </div>
  </div>

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
/* 기본 대시보드 스타일  */
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
  color: #1a1a2e;
}

/* 분석 섹션  */
.age-expense-analysis {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

/* 헤더  */
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

/* 공통 버튼 스타일 */
.mypageButton {
  background-color: rgb(254, 235, 253);
  border: 1px solid rgb(251, 209, 251);
  border-radius: 0.5rem;
  padding: 12px 24px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font: var(--ng-reg-18);
  color: #333;
}
.logout {
  background-color: rgb(254, 235, 253);
  border: 1px solid rgb(251, 209, 251);
  border-radius: 0.5rem;
  padding: 12px 24px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font: var(--ng-reg-18);
  color: #333;
  margin-right: 20px;
}

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

/* 다크모드  */

.dark .dashboard,
.dark,
.dark .body {
  background-color: #121212;
  color: black;
}

.darkModeButton {
  padding: 8px 12px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  cursor: pointer;
}
.dark .age-expense-analysis {
  /* background: linear-gradient(to bottom, #1a1a1a, #121212); */
  color: #f5f5f5;
}

.dark .filter-button {
  background-color: #2c2c2c;
  border: 1px solid #f3daf0;
  color: #f9a8d4;
}

.dark .chart-title {
  color: #f9a8d4;
}

.dark canvas {
  background-color: transparent !important;
}

.dark .modal {
  background-color: #222;
  color: #fff;
  border: 1px solid #444;
}

/* 반응형  */
@media (max-width: 1024px) {
  .dashboardHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dashboardTitle {
    font-size: 20px;
  }

  .inputValue,
  .logout,
  .mypageButton {
    padding: 10px 18px;
    font-size: 14px;
  }

  .chart-title {
    font-size: 20px;
  }

  .age-expense-analysis {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .dashboardTitle {
    font-size: 18px;
    gap: 8px;
  }

  .iconImage {
    width: 50px;
    height: 50px;
  }

  .inputValue,
  .logout,
  .mypageButton {
    width: 100%;
    padding: 10px;
    font-size: 13px;
    margin-bottom: 6px;
  }

  .darkModeButton {
    font-size: 1rem;
    padding: 6px 10px;
  }

  .chart-title {
    font-size: 18px;
  }

  .filter-button {
    font-size: 13px;
    padding: 6px 12px;
  }

  .age-expense-analysis {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    align-items: flex-end;
    padding-right: 10px;
  }
}

@media (max-width: 480px) {
  .dashboardHeader {
    padding: 0.8rem;
  }

  .dashboardTitle {
    font-size: 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .iconImage {
    width: 40px;
    height: 40px;
  }

  .inputValue,
  .logout,
  .mypageButton {
    font-size: 12px;
    padding: 8px;
  }

  .darkModeButton {
    font-size: 0.9rem;
    padding: 5px 8px;
  }

  .chart-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .filter-button {
    font-size: 12px;
    padding: 5px 10px;
  }

  .age-expense-analysis {
    padding: 8px;
  }

  .header {
    padding-right: 0;
    margin-bottom: 16px;
  }
}
</style>
