<template>
  <div class="card chartCard">
    <div class="chartHeader">
      <h3 class="chartTitle">월별 지출 패턴</h3>
      <!-- 범례는 Chart.js 내부에서 오른쪽 정렬됨 -->
    </div>
    <canvas ref="chartRef" height="200"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';

const chartRef = ref(null);

onMounted(async () => {
  // 로그인된 유저 ID 가져오기
  const userInfo = JSON.parse(localStorage.getItem('loggedInUserInfo') || '{}');
  const userId = userInfo.id;

  // 전체 거래 내역 불러오기
  const res = await fetch('http://localhost:3000/money');
  const data = await res.json();

  // 로그인된 유저의 거래만 필터링
  const userData = data.filter((item) => item.userid === userId);

  // 경향 매핑
  const tendencyMap = {
    1: '계획',
    2: '충동',
    3: '수입',
  };

  // tendency 또는 tendencyid 중 하나 사용
  const normalizedData = userData.map((item) => ({
    ...item,
    tendency: item.tendency ?? item.tendencyid ?? null,
  }));

  // 수입 제외
  const filtered = normalizedData.filter(
    (item) => item.tendency !== null && item.tendency !== 3
  );

  // 최근 6개월 구하기 (오래된 → 최신순)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const recentMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentYear, currentMonth - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`; // 예: "2025-03"
  }).reverse();

  // 월별로 그룹핑
  const grouped = {};
  filtered.forEach((item) => {
    const ym = item.date.slice(0, 7); // "YYYY-MM"
    const monthLabel = parseInt(ym.split('-')[1], 10) + '월'; // "n월"
    const feel = tendencyMap[item.tendency];

    if (!grouped[monthLabel]) grouped[monthLabel] = { 계획: 0, 충동: 0 };
    if (feel === '계획') grouped[monthLabel].계획 += item.amount;
    else if (feel === '충동') grouped[monthLabel].충동 += item.amount;
  });

  // 항상 6개월 라벨 유지
  const labels = recentMonths.map(
    (ym) => parseInt(ym.split('-')[1], 10) + '월'
  );

  // 데이터가 없는 달은 0으로 채움
  const 계획Data = labels.map((month) => grouped[month]?.계획 ?? 0);
  const 충동Data = labels.map((month) => grouped[month]?.충동 ?? 0);

  // 차트 렌더링
  new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '충동 지출',
          data: 충동Data,
          backgroundColor: '#EF4444',
          borderRadius: 4,
          borderSkipped: false,
          stack: '지출',
          maxBarThickness: 80,
        },
        {
          label: '계획 지출',
          data: 계획Data,
          backgroundColor: '#22C55E',
          borderRadius: 4,
          borderSkipped: false,
          stack: '지출',
          maxBarThickness: 80,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
            font: { size: 13 },
          },
        },
        title: { display: false },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 13 } },
          categoryPercentage: 0.5,
          barPercentage: 0.7,
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { display: false },
          ticks: {
            maxTicksLimit: 5,
            callback: (value) => `₩${value.toLocaleString()}`,
            font: { size: 13 },
          },
        },
      },
    },
  });
});
</script>

<style scoped>
.card {
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  max-width: 1300px;
  margin: 0 auto 2rem auto; /* 가운데 정렬 및 하단 여백 */
}
.dark .card {
  background: #e7e5e4;
}

.chartHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.chartTitle {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}
</style>
