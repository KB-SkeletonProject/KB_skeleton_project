<script setup>
import { defineProps } from 'vue';
import { Bar, Line, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  chartType: {
    type: String,
    required: true,
  },
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({
      responsive: true,
      maintainAspectRatio: false,
    }),
  },
});
</script>

<template>
  <div class="chartCard">
    <h3>{{ title }}</h3>
    <div class="chartContainer">
      <Bar
        v-if="chartType === 'bar'"
        :data="chartData"
        :options="chartOptions"
      />
      <Line
        v-if="chartType === 'line'"
        :data="chartData"
        :options="chartOptions"
      />
      <Doughnut
        v-if="chartType === 'doughnut'"
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<style scoped>
.chartCard {
  background-color: var(--background-color);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin: 10px;
  text-align: center;
}

.chartCard h3 {
  font: var(--ng-bold-20);
  margin-bottom: 10px;
  color: var(--text-color);
}

.chartContainer {
  height: 300px;
  width: 100%;
}
</style>
