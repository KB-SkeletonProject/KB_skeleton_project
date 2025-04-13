<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Chart } from 'chart.js/auto';

const props = defineProps({
  labels: Array,
  myData: Array,
  avgData: Array,
  isDarkMode: Boolean,
});

const barChartRef = ref(null);
const donutChartRef = ref(null);

let barChart = null;
let donutChart = null;

const myTotal = computed(() => props.myData.reduce((a, b) => a + b, 0));
const avgTotal = computed(() => props.avgData.reduce((a, b) => a + b, 0));

const primaryColor = '#FF69B4';
const softColor = '#FFD1E8';

const barChartHeight = computed(() => {
  const categoryCount = props.labels.length;
  const calculated = categoryCount * 60;
  return (calculated < 400 ? 400 : calculated) + 'px';
});
const initBarChart = () => {
  if (barChart) barChart.destroy();

  const tickColor = props.isDarkMode ? '#fdfdfd' : '#333';

  const textColor = props.isDarkMode ? '#fdfdfd' : '#333';
  barChart = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: '나의 소비',
          data: props.myData,
          backgroundColor: primaryColor,
          borderRadius: 5,
          barThickness: 22,
          categoryPercentage: 0.8,
          barPercentage: 0.9,
        },
        {
          label: '평균 소비',
          data: props.avgData,
          backgroundColor: softColor,
          borderRadius: 5,
          barThickness: 22,
          categoryPercentage: 0.8,
          barPercentage: 0.9,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: tickColor,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ₩${ctx.raw.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `₩${v.toLocaleString()}`,
            color: tickColor,
          },
          grid: {
            color: props.isDarkMode ? '#444' : '#ccc',
          },
        },
        y: {
          ticks: {
            color: tickColor,
          },
          grid: {
            color: props.isDarkMode ? '#444' : '#ccc',
          },
        },
      },
    },
  });
};
const initDonutChart = () => {
  if (donutChart) donutChart.destroy();

  const textColor = props.isDarkMode ? '#f5f5f5' : '#333';

  donutChart = new Chart(donutChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['나의 소비', '평균 소비'],
      datasets: [
        {
          data: [myTotal.value, avgTotal.value],
          backgroundColor: [primaryColor, softColor],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ₩${ctx.raw.toLocaleString()}`,
          },
        },
      },
    },
  });
};

onMounted(() => {
  console.log('🔥 myData:', props.myData);
  console.log('🔥 avgData:', props.avgData);
  console.log('🔥 labels:', props.labels);

  initBarChart();
  initDonutChart();
});

watch(
  () => [props.myData, props.avgData],
  () => {
    initBarChart();
    initDonutChart();
  }
);
</script>

<template>
  <div class="chartContainer">
    <div class="chartSection" :style="{ height: barChartHeight }">
      <h3 class="chartTitle">카테고리별 소비 비교</h3>
      <canvas
        ref="barChartRef"
        class="chartCanvas"
        :height="parseInt(barChartHeight)"
      ></canvas>
    </div>

    <div class="summarySection">
      <p class="summaryText">
        총 소비 : <strong>{{ myTotal.toLocaleString() }}원</strong><br />
        또래 평균 : <strong>{{ avgTotal.toLocaleString() }}원</strong>
      </p>

      <p class="resultText">
        <span v-if="myTotal > avgTotal" class="overMsg">
          ⚠️ 평균보다
          <strong>{{ (myTotal - avgTotal).toLocaleString() }}원</strong> 더
          사용하셨습니다.
        </span>
        <span v-else class="goodMsg">
          🎉 평균보다
          <strong>{{ (avgTotal - myTotal).toLocaleString() }}원</strong> 적게
          사용하셨습니다!
        </span>
      </p>

      <div class="chartSection">
        <h3 class="chartTitle">총 소비 비교</h3>
        <canvas ref="donutChartRef" class="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chartContainer {
  display: flex;
  flex-direction: column;
  gap: 50px;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px 10px;
  margin-bottom: 50px;
}

.chartSection {
  width: 100%;
  max-width: 1000px;
  height: 500px;
}

.chartTitle {
  font: var(--ng-reg-24);
  text-align: center;
  margin-bottom: 16px;
  color: var(--primary-color);
}

.chartCanvas {
  width: 100%;
  height: 100% !important;
  display: block;
}

.summarySection {
  text-align: center;
  margin-top: 30px;
  height: 100%;
  font: var(--ng-reg-20);
  color: var(--text-color);
}

.summaryText {
  margin-bottom: 20px;
  font: var(--ng-reg-22);
}

.resultText {
  margin-bottom: 30px;
  font-size: 16px;
  font: var(--ng-reg-20);
}

.overMsg {
  color: #ff4d4f;
  font: var(--ng-reg-20);
}

.goodMsg {
  color: var(--text-success);
  font: var(--ng-reg-20);
}

.dark .chartTitle {
  color: #f9a8d4;
}
.dark .chartContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-bottom: 50px;
}

.dark .summarySection {
  background-color: #e7e5e4;
  color: #f5f5f5;
  border-radius: 1rem;
  height: 100%;
  padding: 2.5rem;
  box-shadow: 0 2px 6px rgba(255, 255, 255, 0.05);
}

.dark .summaryText {
  color: black;
}

.dark .resultText {
  color: black;
}

.dark .goodMsg {
  color: #4ade80;
}

.dark .overMsg {
  color: #f87171;
}

.dark .chartSection {
  background-color: #e7e5e4;
  padding: 2rem 2rem 5.5rem 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 1000px;
  min-height: 500px;
  position: relative;
  box-shadow: 0 2px 6px rgba(255, 255, 255, 0.05);
}

.dark .chartTitle {
  color: #ec4899;
}
</style>
