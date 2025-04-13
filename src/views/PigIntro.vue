<script setup>
import { ref } from 'vue';
import PiggyFace from '@/components/Piggyface.vue';
import Header from '@/components/Header.vue';

const eyeOffset = ref({ x: 0, y: 0 });

const handleMouseMove = (e) => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  const angle = Math.atan2(dy, dx);
  const distance = 8;

  eyeOffset.value = {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
};
</script>

<template>
  <div class="entireContainer">
    <Header />
    <div class="wrapper" @mousemove="handleMouseMove">
      <h1 class="title">Piggy Bank</h1>
      <PiggyFace :eyeOffset="eyeOffset" />
      <div class="buttons">
        <router-link to="/login" class="btn">로그인</router-link>
        <router-link to="/signup" class="btn">회원가입</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title {
  color: #d6336c;
  font-size: 80px;
  font-weight: bold;
  margin-bottom: 93px;
  font-family: 'Nanum Gothic', sans-serif;
  text-align: center;
}

.wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f8f9fa;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /*background-color: #f8f9fa;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 60px;  이거 스타일 적용하면 header가 보임. */
}

/* 눈 깜빡임 애니메이션 */
.blink {
  animation: blinkAnim 3s infinite;
  transform-origin: center center;
}

@keyframes blinkAnim {
  0%,
  94%,
  100% {
    transform: scaleY(1);
  }
  95%,
  97% {
    transform: scaleY(0.1);
  }
}

/* 버튼 스타일 */
.buttons {
  margin-top: 100px;
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  background: white;
  color: #d6336c;
  font-weight: bold;
  border-radius: 15px;
  transition: transform 0.2s ease-in-out;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
}

.btn:hover {
  transform: scale(1.1);
}
</style>
