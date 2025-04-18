<template>
  <!-- header -->

  <div class="dashboard">
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
        <button class="logout" @click="logout">로그아웃</button>
      </div>
    </header>
    <div class="calendar-dashboard">
      <!-- Calendar 컴포넌트는 연도와 월을 양방향 바인딩(v-model)을 통해 관리 -->
      <Calendar v-model:year="currentYear" v-model:month="currentMonth" />

      <!-- SummaryChart는 현재 연도와 월을 props로 받아 해당 달 분석 그래프를 그림 -->
      <div class="summary-section">
        <SummaryChart :year="currentYear" :month="currentMonth + 1" />
      </div>

      <!-- 추가 분석 영역: 소비 패턴 분석 카드, FixedExpense 버튼 등 -->
      <div class="analysis-section">
        <div class="analysis-card" @click="expense">
          <h3>소비 패턴 분석</h3>
          <div class="analysis-content">
            <div>
              <p>충동적 소비</p>
              <h2 class="negative">{{ impulsiveCount }}회</h2>
            </div>
            <div>
              <p>계획적 소비</p>
              <h2 class="positive">{{ plannedCount }}회</h2>
            </div>
          </div>
          <!-- 분할 진행 바 -->
          <div class="segmented-progress-bar">
            <div
              class="segment segment-impulsive"
              :style="{ width: (impulsiveCount / totalCount) * 100 + '%' }"
            ></div>
            <div
              class="segment segment-planned"
              :style="{ width: (plannedCount / totalCount) * 100 + '%' }"
            ></div>
          </div>
          <p class="summary">총 지출 횟수 : {{ totalCount }}회</p>
        </div>

        <div class="analysis-card" @click="openModal">
          <FixedExpense />
        </div>
      </div>

      <FixedModal
        v-if="isModalOpen"
        :month="currentMonth + 1"
        :UserId="UserId"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Calendar from '@/components/Calendar.vue';
import SummaryChart from '@/components/SummaryChart.vue';
import FixedExpense from '@/components/FixedExpense.vue';
import FixedModal from '@/components/FixedModal.vue';
import axios from 'axios';
// import Header from '@/components/Header.vue';
import { useRouter } from 'vue-router';
const isDarkMode = ref(false);
const mypageClick = () => {
  router.push('./myPage');
};
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};
const goToHome = () => {
  router.push('./home');
};
const logout = () => {
  alert('안녕히가세요!');

  localStorage.removeItem('loggedInUserId');
  localStorage.removeItem('loggedInUserInfo');

  router.push('/');
};
// Calendar에서 관리하는 연도, 월 (Calendar에서는 0-indexed로 관리하므로 SummaryChart에 전달할 때는 +1)
const currentYear = ref(2025);
const currentMonth = ref(3); // 3이면 달력에서는 4월
const router = useRouter();
const transactions = ref([]);
const savingGoal = ref(null);

const UserId = localStorage.getItem('loggedInUserId');

// 소비 패턴 데이터 (예시)

const monthlyTransactions = computed(() => {
  return transactions.value.filter((tx) => {
    const [txYear, txMonth] = tx.date.split('-');
    return (
      Number(txYear) === currentYear.value &&
      Number(txMonth) === currentMonth.value + 1
    );
  });
});
const impulsiveCount = computed(() => {
  return monthlyTransactions.value.filter((tx) => tx.tendencyid === 1).length;
});

const plannedCount = computed(() => {
  return monthlyTransactions.value.filter((tx) => tx.tendencyid === 2).length;
});

const totalCount = computed(() => {
  return impulsiveCount.value + plannedCount.value;
});

// 모달 제어
const isModalOpen = ref(false);
const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};
const expense = () => {
  router.push('./expenseTendency');
};
onMounted(async () => {
  try {
    const UserId = localStorage.getItem('loggedInUserId');
    const responseGoal = await axios.get(
      `http://localhost:3000/user/${UserId}`
    );
    savingGoal.value = responseGoal.data.goalSavings;

    const res = await axios.get('http://localhost:3000/money');
    transactions.value = res.data.filter((entry) => entry.userid == UserId);
  } catch (error) {
    console.error('Failed to fetch transaction data:', error);
  }
});
</script>
<style scoped>
/* header */
.iconImage {
  width: 60px;
  height: 60px;
  /* object-fit: contain; */
}
.dashboardTitle {
  gap: 10px;
}
.dashboard {
  padding: 2rem;
  margin: 0;
  background: linear-gradient(to bottom, #fff9fe, #ffffff);
  font-family: sans-serif;
  box-sizing: border-box;
  color: black;
}

.flex {
  display: flex;
  align-items: center;
  gap: 1rem; /* 버튼들 간 간격 */
}

/* 다크모드 버튼 */
.darkModeButton {
  padding: 8px 12px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  cursor: pointer;
}
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

/* 새 거래추가 버튼 */
.inputValue {
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
.dark .calendar-dashboard {
  background-color: #121212;
}
.dark .dashboard {
  background: linear-gradient(to bottom, #121212, #121212);
  color: #1a1a2e;
}
.dark .dashboardHeader {
  background-color: #fbcee8;
}
.dark .analysis-card {
  background: #1f2937;
  color: #e5e7eb;
  border: 1px solid #1f2937;
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
/* Calendar 컴포넌트 스타일 */

.calendar-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.analysis-section {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  cursor: pointer;
}

.analysis-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analysis-card:first-child {
  flex: 1;
  margin-right: 1rem;
}

/* 두 번째 카드의 비율을 2로 설정 */
.analysis-card:last-child {
  flex: 2;
  margin-right: 0;
}

.analysis-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.analysis-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.analysis-content div {
  text-align: center;
}

.negative {
  color: #ef4444;
  font-size: 2rem;
  font-weight: bold;
}

.positive {
  color: #22c55e;
  font-size: 2rem;
  font-weight: bold;
}

.summary {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}
/* 분할 진행 바 스타일 */
.segmented-progress-bar {
  position: relative;
  width: 100%;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.segmented-progress-bar .segment {
  height: 100%;
}

.segment.segment-impulsive {
  background-color: #ef4444; /* 충동적 소비: 빨간색 */
}

.segment.segment-planned {
  background-color: #10b981; /* 계획적 소비: 초록색 */
}
@media (max-width: 1024px) {
  .dashboard {
    padding: 1.5rem;
  }

  .dashboardHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .calendar-dashboard {
    padding: 1.5rem;
  }

  .analysis-section {
    flex-direction: column; /* 세로 정렬 */
    gap: 1rem;
  }

  .analysis-card {
    flex: none;
    width: 100%; /* 카드가 화면 너비에 맞게 확장 */
  }

  .analysis-card h3 {
    font-size: 1.1rem;
  }

  .negative,
  .positive {
    font-size: 1.8rem;
  }

  .summary {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .calendar-dashboard {
    padding: 1rem;
  }

  .dashboardHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .analysis-section {
    flex-direction: column;
    gap: 1rem;
  }

  .analysis-card {
    padding: 1rem;
  }

  .analysis-card h3 {
    font-size: 1rem;
  }

  .negative,
  .positive {
    font-size: 1.5rem;
  }

  .summary {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 0.5rem;
  }

  .calendar-dashboard {
    padding: 0.5rem;
  }

  .dashboardHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .analysis-section {
    flex-direction: column;
    gap: 0.5rem;
  }

  .analysis-card {
    padding: 0.75rem;
  }

  .analysis-card h3 {
    font-size: 0.9rem;
  }

  .negative,
  .positive {
    font-size: 1.2rem;
  }

  .summary {
    font-size: 0.7rem;
  }
}
</style>
