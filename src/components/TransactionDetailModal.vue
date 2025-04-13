<script setup>
const props = defineProps({
  isOpen: Boolean,
  transaction: Object,
});
const emit = defineEmits(['close']);
</script>

<template>
  <div v-if="isOpen" class="modalBackdrop">
    <div class="modalCard">
      <div class="modalHeader">
        <h3 class="title">거래 상세</h3>
        <i class="fa-solid fa-xmark close-icon" @click="$emit('close')"></i>
      </div>
      <p class="date">{{ transaction.date }}</p>
      <div
        class="amount"
        :class="transaction.type === 'income' ? 'text-income' : 'text-expense'"
      >
        ₩{{ transaction.amount.toLocaleString() }}
      </div>
      <div class="infoSection">
        <div class="infoItem">
          <span class="label">카테고리</span>
          <div class="infoValue">{{ transaction.category }}</div>
        </div>
        <div class="infoItem">
          <span class="label">소비 유형</span>
          <div class="infoValue">{{ transaction.subCategory || '-' }}</div>
        </div>
        <div class="infoItem">
          <span class="label">내용</span>
          <div class="infoValue">{{ transaction.description }}</div>
        </div>
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
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modalCard {
  background-color: var(--background-color);
  padding: 28px;
  border-radius: 16px;
  max-width: 420px;
  width: 90%;
}
.dark .modalCard {
  background-color: var(--background-color);
  padding: 28px;
  border-radius: 16px;
  max-width: 420px;
  width: 90%;
}
.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font: var(--ng-bold-20);
}
.closeIcon {
  font-size: 24px;
  cursor: pointer;
}
.amount {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin: 18px 0;
}
.textIncome {
  color: var(--text-income);
}
.textExpense {
  color: var(--text-expense);
}
.infoSection {
  margin-top: 10px;
}
.infoItem {
  margin: 12px 0;
}
.label {
  font: var(--ng-bold-16);
  color: var(--text-subtitle);
}
.infoValue {
  background-color: var(--card-color);
  padding: 12px;
  border-radius: 8px;
  margin-top: 6px;
  font: var(--ng-reg-16);
}
</style>
