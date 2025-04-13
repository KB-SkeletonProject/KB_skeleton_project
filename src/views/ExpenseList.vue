<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import TransactionEditModal from '../components/TransactionEditModal.vue';
import FilterModal from '../components/FilterModal.vue';
import TransactionDetailModal from '../components/TransactionDetailModal.vue';
import TransactionModal from '../components/TransactionModal.vue';

const router = useRouter();
const goToHome = () => router.push('/home');
const mypageClick = () => router.push('/myPage');
const logout = () => {
  alert('안녕히가세요!');

  localStorage.removeItem('loggedInUserId');
  localStorage.removeItem('loggedInUserInfo');

  router.push('/');
};

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 10;

const paginatedTransactions = computed(() => {
  if (!transactions.value || transactions.value.length === 0) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  return transactions.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() =>
  transactions.value && transactions.value.length > 0
    ? Math.ceil(transactions.value.length / itemsPerPage)
    : 1
);

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const isDarkMode = ref(false);
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

const transactions = ref([]);
const originalTransactions = ref([]);
const categories = ref([]);

const isFilterModalOpen = ref(false);
const openFilterModal = () => (isFilterModalOpen.value = true);
const closeFilterModal = () => (isFilterModalOpen.value = false);

const isTransactionModalOpen = ref(false);
const openTransactionModal = () => (isTransactionModalOpen.value = true);
const closeTransactionModal = () => (isTransactionModalOpen.value = false);

const isDetailModalOpen = ref(false);
const selectedDetailTransaction = ref(null);
const openDetailModal = (transaction) => {
  selectedDetailTransaction.value = transaction;
  isDetailModalOpen.value = true;
};
const closeDetailModal = () => (isDetailModalOpen.value = false);

const showEditModal = ref(false);
const editTarget = ref(null);

const handleEditClick = (transaction) => {
  editTarget.value = { ...transaction };
  showEditModal.value = true;
};
const closeEdit = () => {
  showEditModal.value = false;
  editTarget.value = null;
};

const applyEdit = async (updated) => {
  try {
    await axios.patch(`http://localhost:3000/money/${updated.id}`, updated);

    const categoryName = getCategoryName(updated.categoryid);
    const updatedDisplayData = {
      id: updated.id,
      date: updated.date,
      category: categoryName,
      amount: updated.amount,
      description: updated.memo,
      type: updated.typeid === 1 ? 'income' : 'expense',
    };

    const index = transactions.value.findIndex((t) => t.id === updated.id);
    if (index !== -1) transactions.value[index] = { ...updatedDisplayData };

    closeEdit();
    calculateTotals();
  } catch (err) {
    console.error('수정 실패:', err);
    alert('수정 중 오류가 발생했습니다.');
  }
};

const deleteTransaction = async (id) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    try {
      await axios.delete(`http://localhost:3000/money/${id}`);
      transactions.value = transactions.value.filter((t) => t.id !== id);
      calculateTotals();
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }
};

const sortKey = ref('');
const sortOrder = ref('asc');
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }

  transactions.value.sort((a, b) => {
    let aVal = key === 'date' ? new Date(a[key]) : Number(a[key]) || a[key];
    let bVal = key === 'date' ? new Date(b[key]) : Number(b[key]) || b[key];
    return sortOrder.value === 'asc'
      ? aVal > bVal
        ? 1
        : -1
      : aVal < bVal
      ? 1
      : -1;
  });
};

const getCategoryName = (id) => {
  const cat = categories.value.find((c) => c.id === id);
  return cat ? cat.name : '기타';
};

const totalIncome = ref(0);
const totalExpense = ref(0);
const allAccount = ref(0);

const calculateTotals = () => {
  totalIncome.value = transactions.value
    .filter((item) => item.type === 'income')
    .reduce((acc, item) => acc + Number(item.amount), 0);

  totalExpense.value = transactions.value
    .filter((item) => item.type === 'expense')
    .reduce((acc, item) => acc + Number(item.amount), 0);

  allAccount.value = totalIncome.value - totalExpense.value;
};

const fetchTransactions = async () => {
  try {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) return alert('로그인이 필요합니다.');

    const response = await axios.get('http://localhost:3000/money');
    const userData = response.data.filter((item) => item.userid === userId);
    const mapped = userData.map((item) => ({
      id: item.id,
      date: item.date,
      category: getCategoryName(item.categoryid),
      amount: Number(item.amount),
      description: item.memo,
      type: item.typeid === 1 ? 'income' : 'expense',
    }));
    transactions.value = mapped;
    originalTransactions.value = mapped;
    calculateTotals();
  } catch (error) {
    console.error('데이터 불러오기 실패:', error);
  }
};

const applyFilter = (filterData) => {
  const { startDate, endDate, type, categories } = filterData;
  let filtered = [...originalTransactions.value];

  if (startDate) filtered = filtered.filter((t) => t.date >= startDate);
  if (endDate) filtered = filtered.filter((t) => t.date <= endDate);
  if (type !== 'all') filtered = filtered.filter((t) => t.type === type);
  if (categories?.length)
    filtered = filtered.filter((t) => categories.includes(t.category));

  transactions.value = filtered;
  calculateTotals();
};
const handleAddTransaction = async (newTransaction) => {
  try {
    const userId = localStorage.getItem('loggedInUserId');
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 사용자 ID 포함한 payload 생성
    const payload = {
      ...newTransaction,
      userid: userId,
    };

    const res = await axios.post(`http://localhost:3000/money`, payload);

    const newItem = {
      id: res.data.id,
      date: res.data.date,
      category: getCategoryName(res.data.categoryid),
      amount: Number(res.data.amount),
      description: res.data.memo,
      type: res.data.typeid === 1 ? 'income' : 'expense',
    };

    const exists = transactions.value.some((t) => t.id === newItem.id);
    if (!exists) {
      transactions.value.unshift(newItem);
    }

    closeTransactionModal();
    calculateTotals();
  } catch (err) {
    console.error('추가 실패:', err);
    alert('추가 중 오류가 발생했습니다.');
  }
};

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/category');
    categories.value = res.data;

    await fetchTransactions();
  } catch (err) {
    console.error('카테고리 불러오기 실패:', err);
  }
});
</script>

<template>
  <body>
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
          <button class="inputValue" @click="openTransactionModal">
            새 거래추가
          </button>
          <button class="logout" @click="logout">로그아웃</button>
        </div>
      </header>
      <div class="expenseListContainer">
        <div class="container">
          <div class="summaryHeader">
            <div class="summaryCards">
              <div class="summaryCard">
                <span>총 수입</span>
                <span class="income">{{ totalIncome.toLocaleString() }}원</span>
              </div>
              <div class="summaryCard">
                <span>총 지출</span>
                <span class="expense"
                  >{{ totalExpense.toLocaleString() }}원</span
                >
              </div>
              <div class="summaryCard">
                <span>총 자산</span>
                <span class="balance">{{ allAccount.toLocaleString() }}원</span>
              </div>
            </div>
          </div>
          <!-- 필터 버튼 상단 우측 -->
          <div class="tableToolbar">
            <button class="roundBtn" @click="openFilterModal">
              <i class="fa-solid fa-filter"></i>
              <span>필터</span>
            </button>
            <button
              class="roundBtn"
              @click="
                applyFilter({
                  startDate: '',
                  endDate: '',
                  type: 'all',
                  categories: [],
                })
              "
            >
              <i class="fa-solid fa-arrow-rotate-left"></i>
              <span>초기화</span>
            </button>
          </div>

          <!-- 거래 목록 -->
          <table class="transactionTable" v-if="paginatedTransactions.length">
            <thead>
              <tr>
                <th @click="sortBy('date')">
                  날짜
                  <i class="fa-solid fa-sort"></i>
                </th>
                <th>카테고리</th>
                <th @click="sortBy('amount')">
                  금액
                  <i class="fa-solid fa-sort"></i>
                </th>
                <th>내용</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="transaction in paginatedTransactions"
                :key="transaction.id"
                @click="openDetailModal(transaction)"
              >
                <td>{{ transaction?.date }}</td>
                <td>{{ transaction?.category }}</td>
                <td :class="['transactionAmount', transaction?.type]">
                  {{ transaction?.amount.toLocaleString() }}원
                </td>
                <td>{{ transaction?.description }}</td>
                <td class="actionIcons">
                  <i
                    class="fa-solid fa-pen-to-square edit-icon"
                    @click.stop="handleEditClick(transaction)"
                  ></i>

                  <i
                    class="fa-solid fa-trash delete-icon"
                    @click="
                      (e) => {
                        e.stopPropagation();
                        deleteTransaction(transaction.id);
                      }
                    "
                  ></i>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 페이지네이션 컨트롤 -->
          <div class="pagination">
            <button
              class="paginationBtn"
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
            >
              이전
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              :class="['paginationBtn', { active: page === currentPage }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              class="paginationBtn"
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              다음
            </button>
          </div>

          <TransactionEditModal
            v-if="showEditModal && editTarget"
            :isOpen="showEditModal"
            :transaction="editTarget"
            @close="closeEdit"
            @update="applyEdit"
          />

          <FilterModal
            v-if="isFilterModalOpen"
            :isOpen="isFilterModalOpen"
            @close="closeFilterModal"
            @apply="applyFilter"
          />

          <TransactionDetailModal
            v-if="isDetailModalOpen"
            :isOpen="isDetailModalOpen"
            :transaction="selectedDetailTransaction"
            @close="closeDetailModal"
          />

          <button class="addButton" @click="openTransactionModal">
            <i class="fa-solid fa-plus"></i>
          </button>
          <TransactionModal
            v-if="isTransactionModalOpen"
            :isOpen="isTransactionModalOpen"
            @close="closeTransactionModal"
            @add="handleAddTransaction"
          />
        </div>
      </div>
    </div>
  </body>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  margin: 0;
  background: linear-gradient(to bottom, #fff9fe, #ffffff);
  font-family: sans-serif;
  box-sizing: border-box;
  color: black;
}
body {
  background-color: var(--background-color);
  color: var(--text-color);
  margin: 0 auto;
  padding: 0;
  min-height: 100vh;
  box-sizing: border-box;
}

.container {
  padding: 20px;
}
.filterBar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.dateBtn,
.categoryBtn {
  background-color: var(--primary-color);
  color: var(--text-white);
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font: var(--ng-bold-14);
}
.summaryHeader {
  display: flex;
  justify-content: center;
  margin: 30px 0 10px;
}
.summaryCards {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin: 20px 0;
  justify-content: center;
  max-width: 100%;
}
.summaryCard {
  background-color: var(--background-color);
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px 30px;
  text-align: center;
  min-width: 220px;
  width: 250px;
  flex: 1 1 250px;
  font: var(--ng-reg-18);
}
.summaryCard span {
  display: block;
  margin: 10px 0;
}

.income {
  color: var(--text-income);
  font-size: 24px;
}
.expense {
  color: var(--text-expense);
  font-size: 24px;
}
.balance {
  color: var(--text-balance);
  font-size: 24px;
}
.transactionTable {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.transactionTable th,
.transactionTable td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  font: var(--ng-reg-15);
}
.transactionTable th {
  font: var(--ng-reg-18);
  color: var(--text-color);
  letter-spacing: 0.5px;
}
th {
  cursor: pointer;
}

th i {
  margin-left: 4px;
  color: var(--text-secondary);
  font-size: 14px;
}

.transactionTable td {
  font: var(--ng-reg-16);
  color: var(--text-color);
  letter-spacing: 0.3px;
}

.transactionAmount.income {
  color: var(--text-income);
  font: var(--ng-reg-16);
}

.transactionAmount.expense {
  color: var(--text-expense);
  font: var(--ng-reg-16);
}

.editIcon {
  cursor: pointer;
  color: var(--text-secondary);
}

.addButton {
  position: fixed;
  bottom: 40px;
  right: 40px;
  background-color: var(--primary-color);
  color: var(--text-white);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.deleteIcon {
  cursor: pointer;
  margin-left: 20px;
}

.actionIcons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
}

.editIcon,
.deleteIcon {
  font-size: 18px;
}

.editIcon {
  color: var(--text-secondary);
}

.deleteIcon {
  color: var(--text-error);
}

.filterBtn {
  align-self: flex-start;
  background-color: var(--background-color);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  margin-left: auto;
  font: var(--ng-reg-16);
  color: var(--hot-pink);
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  margin-left: auto;
}
.resetBtn {
  background-color: var(--background-color);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  margin-left: 10px;
  font: var(--ng-reg-16);
  color: var(--hot-pink);
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  cursor: pointer;
}
.tableToolbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin: 10px 0;
}

.roundBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #fbcee8;
  border-radius: 999px;
  background-color: white;
  color: black;
  padding: 6px 14px;
  font: var(--ng-reg-14);
  cursor: pointer;
}

.dashboardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fbcee8;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.dashboardTitle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 30px;
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
  font: var(--ng-reg-18);
  color: #333;
}

.dark .dashboard {
  background: linear-gradient(to bottom, #121212, #121212);
  color: #1a1a2e;
}
.dark body {
  background-color: #121212;
  color: black;
}

.dark .container {
  background-color: #1e1e1e;
}

.dark .summaryCard {
  background-color: #2a2a2a;
  color: #f5f5f5;
}

.dark .summaryHeader,
.dark .summaryCards {
  background-color: transparent;
}

.dark .transactionTable th,
.dark .transactionTable td {
  background-color: #1e1e1e;
  color: #f5f5f5;
  border-color: #444;
}

.dark .paginationBtn {
  background-color: #2a2a2a;
  color: #f5f5f5;
  border: 1px solid #fbcee8;
}
.dark .paginationBtn:hover {
  background-color: #3a3a3a;
}
.dark .paginationBtn.active {
  background-color: #fbcee8;
  color: #1e1e1e;
}

.dark .roundBtn {
  background-color: #2a2a2a;
  color: #f5f5f5;
  border: 1px solid #fbcee8;
}

.dark .addButton {
  background-color: #fbcee8;
  color: #1e1e1e;
}

.dark .editIcon {
  color: #ddd;
}
.dark .deleteIcon {
  color: #f87171;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}
.pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
}
.pagination button.active {
  background-color: #fbcee8;
  font: var(--ng-reg-14);
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 반응형  */
@media (max-width: 1024px) {
  .summaryCards {
    flex-direction: column;
    align-items: center;
  }

  .summaryCard {
    width: 90%;
    max-width: 400px;
  }

  .transactionTable th,
  .transactionTable td {
    font-size: 14px;
    padding: 10px 6px;
  }

  .dashboardHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .dashboardHeader {
    font-size: 18px;
  }

  .dashboardTitle {
    font-size: 20px;
    flex-wrap: wrap;
  }

  .inputValue,
  .logout,
  .mypageButton {
    padding: 10px 18px;
    font-size: 14px;
  }

  .tableToolbar {
    flex-direction: column;
    align-items: flex-end;
  }

  .transactionTable th,
  .transactioTable td {
    font-size: 13px;
  }

  .summaryCard {
    padding: 20px;
  }

  .addButton {
    width: 60px;
    height: 60px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .dashboardHeader {
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  .inputValue,
  .logout,
  .mypageButton {
    width: 100%;
    padding: 10px;
    font-size: 13px;
    margin-bottom: 6px;
  }

  .summaryCard {
    width: 95%;
  }

  .transactionTable {
    font-size: 12px;
  }

  .actionIcons i {
    font-size: 14px;
  }

  .roundBtn {
    font-size: 13px;
    padding: 6px 10px;
  }

  .pagination button {
    padding: 5px 10px;
    font-size: 12px;
  }
}
</style>
