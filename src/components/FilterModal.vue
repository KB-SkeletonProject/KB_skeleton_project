<script setup>
import { ref, computed } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
});

const emits = defineEmits(['close', 'apply']);

const startDate = ref('');

const endDate = ref('');

const selectedType = ref('all');

const selectedCategories = ref([]);

const closeModal = () => {
  emits('close');
};

const applyFilter = () => {
  emits('apply', {
    startDate: startDate.value,
    endDate: endDate.value,
    type: selectedType.value,
    categories: selectedCategories.value,
  });
  closeModal(); // 모달 닫기 추가!
};

const categories = {
  income: ['급여', '용돈', '부수입', '환급/지원금', '기타수입'],
  expense: [
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
  ],
};

const toggleCategory = (category) => {
  if (selectedCategories.value.includes(category)) {
    selectedCategories.value = selectedCategories.value.filter(
      (item) => item !== category
    );
  } else {
    selectedCategories.value.push(category);
  }
};

const isCategorySelected = (category) => {
  return selectedCategories.value.includes(category);
};
</script>
<template>
  <div v-show="isOpen" class="modalBackdrop">
    <div class="modalContent">
      <div class="modalHeader">
        <h3 class="title">상세 필터</h3>
        <i class="fa-solid fa-xmark close-icon" @click="$emit('close')"></i>
      </div>
      <div class="modalBody">
        <!-- 날짜 필터 -->
        <div class="filterSection">
          <label>기간 선택</label>
          <div class="dateRange">
            <input type="date" v-model="startDate" class="inputField" />
            <span>~</span>
            <input type="date" v-model="endDate" class="inputField" />
          </div>
        </div>
        <div class="lineDivider"></div>
        <!-- 구분 필터 -->
        <div class="filterSection">
          <label>구분</label>
          <select v-model="selectedType" class="selectBox">
            <option value="all">전체</option>
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
        </div>

        <div v-if="selectedType !== 'all'" class="filterSection">
          <label>카테고리</label>
          <div class="categoryButtons">
            <button
              v-for="category in categories[selectedType]"
              :key="category"
              :class="[
                'categoryBtn',
                isCategorySelected(category) ? 'selected' : '',
              ]"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </div>
      <div class="modalFooter">
        <button class="applyBtn" @click="applyFilter">완료</button>
        <button class="cancelBtn" @click="$emit('close')">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modalBackdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modalContent {
  background-color: var(--background-color);
  padding: 30px 30px;
  border-radius: 16px;
  min-width: 350px;
  max-width: 420px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dark .modalContent {
  background-color: #1f2937;
  color: white;
  padding: 30px 30px;
  border-radius: 16px;
  min-width: 350px;
  max-width: 420px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}
.title {
  font: var(--ng-bold-20);
  color: var(--text-color);
}
.dark .title {
  color: white;
}
.closeIcon {
  cursor: pointer;
  font-size: 28px;
  color: var(--text-secondary);
}

.modalBody {
  margin: 10px 0;
}
.filterSection {
  margin-bottom: 18px;
}
.filterSection label {
  font: var(--ng-reg-15);
  color: var(--text-color);
  margin-bottom: 8px;
  display: block;
}
.dark .filterSection label {
  font: var(--ng-reg-15);
  color: white;
  margin-bottom: 8px;
  display: block;
}
.inputField,
.selectBox {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font: var(--ng-reg-15);
  background-color: #f4f4f4;
}
.inputField:focus,
.selectBox:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: #fff;
}
.dateRange {
  display: flex;
  gap: 10px;
  align-items: center;
}
.modalFooter {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}
.button {
  width: 100px;
  height: 35px;
  padding: 10px 20px;
  font: var(--ng-reg-14);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cancelBtn,
.applyBtn {
  background-color: #f4f4f4;
  color: var(--text-color);
  border: 1px solid transparent;
}
.dark .cancelBtn,
.dark .applyBtn {
  background-color: #f4f4f4;
  color: black;
  border: 1px solid transparent;
}

.cancelBtn.selected,
.applyBtn.selected {
  background-color: var(--primary-color);
  color: var(--text-white);
}
.lineDivider {
  border-top: 1px solid #e0e0e0;
  margin: 12px 0;
}
.categoryButtons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.categoryBtn {
  padding: 8px 14px;
  margin: 5px 0;
  background-color: #f4f4f4;
  color: var(--text-color);
  cursor: pointer;
}

.categoryBtn.selected {
  background-color: var(--primary-color);
  color: var(--text-white);
}
.selectBox {
  font: var(--ng-reg-14);
  background-color: #f4f4f4;
}
input[type='date']::-webkit-calendar-picker-indicator {
  color: var(--primary-color);
  cursor: pointer;
}
input[type='date'] {
  color: var(--text-color);
  background-color: #f4f4f4;
}
button:focus {
  outline: none;
}
</style>
