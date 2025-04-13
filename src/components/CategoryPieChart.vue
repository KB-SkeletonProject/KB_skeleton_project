<template>
  <div class="categoryChart">
    <Pie v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  categorySpending: {
    type: Array,
    required: true,
  },
});

const chartData = ref(null);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      enabled: true,
      position: 'nearest',
      animation: {
        duration: 0,
      },
      callbacks: {
        label: (context) => `₩${Number(context.raw).toLocaleString()}`,
      },
    },
  },
};

watch(
  () => props.categorySpending,
  (newData) => {
    if (newData && newData.length > 0) {
      chartData.value = {
        labels: newData.map((item) => item.category),
        datasets: [
          {
            data: newData.map((item) => item.amount),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#C9CBCF',
              '#8DD17E',
              '#FF6F91',
              '#00C49F',
            ],
            borderColor: 'white',
            borderWidth: 2,
          },
        ],
      };
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.categoryChart {
  width: 100%;
  height: 300px;
  padding: 1rem;
}
</style>
