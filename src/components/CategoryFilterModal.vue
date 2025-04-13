<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  categories: Array,
  selectedCategories: Array,
});

const selectedCategoriesInternal = ref([...props.selectedCategories]);

watch(
  () => props.selectedCategories,
  (newVal) => {
    selectedCategoriesInternal.value = [...newVal];
  }
);

const allCategories = props.categories;
</script>

<template>
  <div class="modalBackdrop" @click.self="$emit('close')">
    <div class="modalCard">
      <h3 class="modalTitle">카테고리 선택</h3>
      <div class="checkboxes">
        <label
          v-for="category in allCategories"
          :key="category"
          class="checkboxItem"
        >
          <input
            type="checkbox"
            v-model="selectedCategoriesInternal"
            :value="category"
          />
          <span class="customCheckbox">{{ category }}</span>
        </label>
      </div>
      <div class="modalActions">
        <button
          class="applyBtn"
          @click="$emit('apply', selectedCategoriesInternal)"
        >
          적용
        </button>
        <button class="cancelBtn" @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modalBackdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modalCard {
  background-color: var(--card-color);
  border-radius: 16px;
  padding: 30px;
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
}

.modalTitle {
  font: var(--ng-bold-20);
  text-align: center;
  margin-bottom: 24px;
  color: var(--text-color);
}

.checkboxes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px;
  margin-bottom: 24px;
}

.checkboxItem {
  display: flex;
  align-items: center;
  font: var(--ng-reg-16);
  color: var(--text-color);
  gap: 10px;
}

.checkboxItem input[type='checkbox'] {
  accent-color: var(--primary-color);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.modalActions {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.applyBtn,
.cancelBtn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font: var(--ng-reg-16);
}

.applyBtn {
  background-color: var(--primary-color);
  color: white;
}

.cancelBtn {
  background-color: #e4e4e4;
  color: var(--text-color);
}
</style>
