<script setup>
import Piggyface from './Piggyface.vue';

const userInfo = JSON.parse(localStorage.getItem('loggedInUserInfo'));
</script>

<template>
  <div class="infoContainer">
    <div class="photoBox">
      <Piggyface :eye-offset="{ x: 0, y: 0 }" :is-eye-closed="false" />
    </div>

    <div class="userName">{{ userInfo.name }}님</div>

    <div class="infoItem">
      <span class="value">{{ userInfo.userId }}</span>
    </div>
  </div>
</template>

<style scoped>
* {
  text-align: center;
}

.userName {
  font-size: 25px;
  font-weight: bold;
  margin: 30px 0 35px 0;
}

/* 프로필 사진 박스 */
.photoBox {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin: 50px auto 0 auto;
  position: relative;
  overflow: visible;
}

/* 유저 정보 컨테이너 */
.infoContainer {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 30px;
  max-width: 300px;
  margin: 30px auto;
  box-shadow: 8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff;
}

.infoItem {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.value {
  font-size: 16px;
  color: #888;
}
</style>
