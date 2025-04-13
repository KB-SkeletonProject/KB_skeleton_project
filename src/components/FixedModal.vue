<template>
  <!-- 메인 모달 -->
  <div class="modalOverlay" @click.self="emit('close')">
    <div class="modalContent">
      <h2>금융 일정 관리</h2>
      <p class="description">
        정기적인 지출을 저장해두고, 효과적으로 관리해보세요!
      </p>

      <!-- 탭 메뉴 -->
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'add' }"
          @click="activeTab = 'add'"
        >
          금융 일정 추가
        </button>
        <button
          :class="{ active: activeTab === 'edit' }"
          @click="activeTab = 'edit'"
        >
          금융 일정 수정
        </button>
      </div>

      <!-- 금융 일정 추가 탭 -->
      <div v-if="activeTab === 'add'" class="tabContent">
        <div class="formGroup">
          <label for="datePicker">날짜</label>
          <input
            id="datePicker"
            type="number"
            v-model="newExpense.day"
            placeholder="일자 입력 (예: 7)"
            class="dateInput"
          />
        </div>
        <div class="formGroup">
          <label>금액</label>
          <input
            type="number"
            v-model="newExpense.amount"
            placeholder="금액 입력"
            class="amountInput"
          />
        </div>
        <div class="formGroup">
          <label>일정 이름</label>
          <input
            type="text"
            v-model="newExpense.description"
            placeholder="일정 이름 입력"
            class="descriptionInput"
          />
        </div>
        <div class="formGroup">
          <label class="inlineLabel">
            <input type="checkbox" v-model="newExpense.notify" />
            일정 하루 전날 알림을 받으실 수 있습니다.
          </label>
        </div>
      </div>
      <div v-if="activeTab === 'add'" class="submitButton">
        <button @click="addFixedExpense">금융 일정 추가하기</button>
      </div>

      <!-- 금융 일정 수정 탭 -->
      <div v-if="activeTab === 'edit'" class="tabContent editTab">
        <div class="scheduleItem" :key="currentIndex">
          <p class="expenseDescription">{{ currentExpense.description }}</p>
          <p class="expenseDetails">
            매달 {{ currentExpense.day }}일 /
            {{ formatNumber(currentExpense.amount) }}원 / 지출
          </p>
          <p class="expenseNotify" v-if="currentExpense.notify">알림 설정됨</p>
          <p class="expenseNotify" v-else>알림 설정 안 됨</p>
        </div>

        <div class="navigationButtons">
          <button @click="prevExpense" :disabled="currentIndex === 0">
            이전
          </button>
          <button
            @click="nextExpense"
            :disabled="currentIndex === (expenses.value?.length || 0) - 1"
          >
            다음
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'edit'" class="modifyButton">
        <button @click="enableEditMode">수정하기</button>
        <!-- 삭제 버튼 클릭 시 삭제 옵션 모달을 띄움 -->
        <button @click="triggerDeleteOptions" class="deleteButton">
          삭제하기
        </button>
      </div>

      <button class="closeButton" @click="emit('close')">닫기</button>
    </div>
  </div>

  <!-- 삭제 옵션 모달 -->
  <div
    v-if="showDeleteOptions"
    class="modalOverlay deleteModalOverlay"
    @click.self="cancelDelete"
  >
    <div class="modalContent deleteModalContent">
      <p class="title">❗ 삭제 옵션을 선택해주세요</p>
      <div class="optionCards">
        <div
          :class="['optionCard', deleteOption === 'future' ? 'selected' : '']"
          @click="deleteOption = 'future'"
        >
          <p class="emoji">🗓️</p>
          <p class="optionTitle">이번 달까지 유지</p>
          <p class="optionDesc">이번 달까지 반영, 이후부터 삭제됩니다.</p>
        </div>
        <div
          :class="['optionCard', deleteOption === 'all' ? 'selected' : '']"
          @click="deleteOption = 'all'"
        >
          <p class="emoji">🚫</p>
          <p class="optionTitle">즉시 완전 삭제</p>
          <p class="optionDesc">이번 달부터 삭제됩니다.</p>
        </div>
      </div>

      <div class="editButtons">
        <button @click="cancelDelete">취소</button>
        <button @click="confirmDelete">삭제 진행</button>
      </div>
    </div>
  </div>

  <!-- 수정하기 모달 (별도 오버레이) -->
  <div v-if="editMode" class="editModalOverlay" @click.self="cancelEdit">
    <div class="editModalContent">
      <h2>수정하기</h2>
      <div class="formGroup">
        <label>날짜</label>
        <input type="number" v-model="editableExpense.day" />
      </div>
      <div class="formGroup">
        <label>금액</label>
        <input type="number" v-model="editableExpense.amount" />
      </div>
      <div class="formGroup">
        <label>일정 이름</label>
        <input type="text" v-model="editableExpense.description" />
      </div>
      <div class="formGroup">
        <label class="inlineLabel">
          <input type="checkbox" v-model="editableExpense.notify" />
          일정 하루 전날 알림
        </label>
      </div>
      <div class="editButtons">
        <button @click="updateFixedExpense">저장하기</button>
        <button @click="cancelEdit">취소하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 부모로부터 현재 달 정보를 prop으로 받음
const props = defineProps({
  month: Number,
  UserId: String,
});

const emit = defineEmits(['close']);

const expenses = ref([]);
const currentIndex = ref(0);
const currentExpense = ref({});
const savingGoal = ref(null);
const activeTab = ref('add');
const newExpense = ref({
  day: null,
  description: '',
  amount: null,
  notify: false,
});

// 수정하기 모달 관련 상태
const editMode = ref(false);
const editableExpense = ref({});

// 삭제 옵션 관련 상태
const showDeleteOptions = ref(false);
const deleteOption = ref('future');

const fetchData = async () => {
  try {
    const UserId = localStorage.getItem('loggedInUserId');
    const res = await axios.get('http://localhost:3000/fixedExpenses');
    // deletedAt이 null인 데이터만 필터링
    expenses.value = Array.isArray(res.data)
      ? res.data.filter(
          (entry) => entry.deletedAt === null && entry.userid === UserId
        )
      : [];
    if (expenses.value.length > 0) {
      currentExpense.value = expenses.value[currentIndex.value];
    }
  } catch (error) {
    console.error('데이터 로딩 실패:', error);
  }
};
const prevExpense = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    currentExpense.value = expenses.value[currentIndex.value];
  }
};

const nextExpense = () => {
  if (currentIndex.value < (expenses.value?.length || 0) - 1) {
    currentIndex.value++;
    currentExpense.value = expenses.value[currentIndex.value];
  }
};

const formatNumber = (num) => {
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const addFixedExpense = async () => {
  try {
    if (
      !newExpense.value.day ||
      !newExpense.value.description ||
      !newExpense.value.amount
    ) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    const UserId = localStorage.getItem('loggedInUserId');
    const responseGoal = await axios.get(
      `http://localhost:3000/user/${UserId}`
    );
    savingGoal.value = responseGoal.data.goalSavings;
    await axios.post('http://localhost:3000/fixedExpenses', {
      day: newExpense.value.day,
      description: newExpense.value.description,
      amount: newExpense.value.amount,
      notify: newExpense.value.notify,
      userid: UserId,
      categoryid: 13,
      deletedAt: null,
    });
    alert('금융 일정이 성공적으로 추가되었습니다.');
    newExpense.value = {
      day: null,
      description: '',
      amount: null,
      notify: false,
    };
    emit('close');
  } catch (error) {
    console.error('금융 일정 추가 중 오류 발생:', error);
    alert('금융 일정 추가에 실패했습니다.');
  }
};

const enableEditMode = () => {
  editMode.value = true;
  editableExpense.value = { ...currentExpense.value };
};

const cancelEdit = () => {
  editMode.value = false;
};

const updateFixedExpense = async () => {
  try {
    if (
      !editableExpense.value.day ||
      !editableExpense.value.description ||
      !editableExpense.value.amount
    ) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    const id = editableExpense.value.id;
    await axios.patch(`http://localhost:3000/fixedExpenses/${id}`, {
      day: editableExpense.value.day,
      description: editableExpense.value.description,
      amount: editableExpense.value.amount,
      notify: editableExpense.value.notify,
    });
    currentExpense.value = { ...editableExpense.value };
    expenses.value[currentIndex.value] = { ...editableExpense.value };
    alert('금융 일정이 수정되었습니다.');
    editMode.value = false;
  } catch (error) {
    console.error('금융 일정 수정 중 오류 발생:', error);
    alert('금융 일정 수정에 실패했습니다.');
  }
};

// 삭제 옵션 모달 관련 로직
// 삭제 버튼 클릭 시 삭제 옵션 모달 표시
const triggerDeleteOptions = () => {
  showDeleteOptions.value = true;
};

// 삭제 옵션 취소
const cancelDelete = () => {
  showDeleteOptions.value = false;
};

// 삭제 진행 시 실제로 삭제 대신 deletedAt 필드를 업데이트 (부모로부터 받은 currentMonth 사용)
const confirmDelete = async () => {
  try {
    // id가 올바르게 존재하는지 확인
    const id = currentExpense.value.id;
    // if (!id) {
    //   alert('해당 금융 일정의 id가 없습니다.');
    //   return;
    // }
    const newDeletedAt =
      deleteOption.value === 'future' ? props.month + 1 : props.month;
    await axios.patch(`http://localhost:3000/fixedExpenses/${id}`, {
      deletedAt: newDeletedAt,
    });
    // 로컬 데이터에도 반영
    // expenses.value[currentIndex.value].deletedAt = props.month;
    alert('금융 일정이 삭제되었습니다.');
    showDeleteOptions.value = false;
    editMode.value = false;
  } catch (error) {
    console.error('금융 일정 삭제 중 오류 발생:', error);
    alert('금융 일정 삭제에 실패했습니다.');
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dark h2 {
  color: #f9fafb;
}

.dark .modalOverlay {
  background: rgba(0, 0, 0, 0.8);
}

.dark .modalContent {
  background-color: #1f2937;
  color: #f9fafb;
  border: 1px solid #374151;
}

.dark .tabs button {
  background-color: #374151;
  color: #f9fafb;
  border: 1px solid #4b5563;
}

.dark .tabs button.active {
  background-color: #4b5563;
  color: #ffffff;
  border-color: #6b7280;
}

.dark input[type='text'],
.dark input[type='number'] {
  background-color: #374151;
  color: #f9fafb;
  border: 1px solid #4b5563;
}

.dark input[type='text']::placeholder,
.dark input[type='number']::placeholder {
  color: #9ca3af;
}

.dark .submitButton button,
.dark .modifyButton button,
.dark .editButtons button,
.dark .deleteButton button {
  background-color: #4b5563;
  color: #f9fafb;
  border: 1px solid #6b7280;
  transition: background-color 0.3s ease;
}

.dark .submitButton button:hover,
.dark .modifyButton button:hover,
.dark .editButtons button:hover,
.dark .deleteButton button:hover {
  background-color: #6b7280;
}

.dark .deleteButton {
  background-color: #ef4444;
  color: #ffffff;
  border: 1px solid #b91c1c;
}

.dark .deleteButton:hover {
  background-color: #dc2626;
}

.dark .editModalContent {
  background-color: #1f2937;
  color: #f9fafb;
  border: 1px solid #374151;
}

.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modalContent {
  position: relative;
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  text-align: left;
}

h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: #111827;
  text-align: center;
}

.description {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  text-align: center;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #374151;
  transition: background 0.2s ease;
}

.tabs button.active {
  background: #ffc7ef;
  color: #1a1a1a;
  border-color: #ffc7ef;
}

.tabContent {
  margin-bottom: 2.5rem;
}

.formGroup {
  margin-bottom: 1rem;
}

.formGroup label {
  display: block;
  font-size: 0.95rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

input[type='text'],
input[type='number'] {
  width: 95%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #374151;
  background-color: #f9fafb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.inlineLabel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #374151;
}

.closeButton {
  width: 100%;
  padding: 0.75rem;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.closeButton:hover {
  background: #d1d5db;
}

.navigationButtons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.navigationButtons button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s ease;
}

.navigationButtons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submitButton {
  margin-top: 2rem;
  text-align: left;
  display: flex;
}

.submitButton button {
  width: 100%;
  padding: 0.75rem;
  background: #ffc7ef;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 1rem;
}

.modifyButton {
  display: flex;
  padding: 0.75rem 0;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
}

.submitButton button:hover {
  background: #ffb3e6;
}

.modifyButton button {
  background-color: #ffc7ef;
  width: 600px;
  color: #1a1a1a;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modifyButton button:hover {
  background-color: #ffb3e6;
}

.editModalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.editModalContent {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  text-align: left;
}

.editButtons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.optionCards {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.optionCard {
  flex: 1;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.optionCard:hover {
  border-color: #aaa;
}

.optionCard.selected {
  border-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.optionTitle {
  font-weight: bold;
  margin: 0.5rem 0;
}

.optionDesc {
  font-size: 0.875rem;
  color: #6b7280;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.editButtons button {
  background-color: #ffc7ef;
  color: #1a1a1a;
  border: none;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.editButtons button:hover {
  background-color: #ffb3e6;
}
</style>
