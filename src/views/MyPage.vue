<script setup>
import { ref } from 'vue';
import Profile from '@/components/Profile.vue';
import ProfileInput from '@/components/ProfileInput.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLogoutModalOpen = ref(false);
const isDarkMode = ref(false);

const goToHome = () => {
  router.push('/home');
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// 로그아웃 처리
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  router.push('/login');
};

const openLogoutModal = () => {
  isLogoutModalOpen.value = true;
};

const confirmLogout = () => {
  isLogoutModalOpen.value = false;
  logout();
};

const cancelLogout = () => {
  isLogoutModalOpen.value = false;
};

// 회원 탈퇴
const isDeleteModalOpen = ref(false);

const openDeleteModal = () => {
  isDeleteModalOpen.value = true;
};

const cancelDelete = () => {
  isDeleteModalOpen.value = false;
};

const confirmDelete = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('loggedInUserInfo'));
    const userId = userInfo?.id;

    if (!userId) {
      alert('유저 정보를 찾을 수 없습니다.');
      return;
    }

    const res = await fetch(`http://localhost:3000/user/${userId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('loggedInUserInfo');
      localStorage.removeItem('loggedInUserId');
      router.push('/login');
    } else {
      alert('회원 탈퇴에 실패했습니다.');
    }
  } catch (err) {
    console.error('회원 탈퇴 에러:', err);
    alert('문제가 발생했습니다.');
  } finally {
    isDeleteModalOpen.value = false;
  }
};

</script>

<template>
  <div :class="['dashboard', { dark: isDarkMode }]">
    <header class="dashboardHeader">
      <h1 class="dashboardTitle" @click="goToHome">
        <img
          src="/src/assets/icons/logo.png"
          class="iconImage"
          @click="goToHome"
        />Piggy Bank
      </h1>
      <div class="flex items-center gap-4 relative">
        <button @click="toggleDarkMode" class="darkModeButton">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>

        <button class="logout" @click="openLogoutModal">로그아웃</button>
        <button class="logout" @click="openDeleteModal">회원탈퇴</button>
        <div v-if="isLogoutModalOpen" class="modal">
          <div class="modal-content">
            <p>로그아웃 하시겠습니까?</p>
            <div class="button-group">
              <button @click="cancelLogout">취소</button>
              <button @click="confirmLogout">확인</button>
            </div>
          </div>
        </div>
        <!-- 탈퇴 모달 -->
        <div v-if="isDeleteModalOpen" class="modal">
          <div class="modal-content">
            <p>
              <h2>회원탈퇴</h2>계정 정보가 모두 삭제됩니다.
            </p>
            <div class="button-group">
              <button @click="cancelDelete">취소</button>
              <button @click="confirmDelete">확인</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="container">
      <h2 class="page-title">마이페이지</h2>
      <div class="wrapper">
        <div class="left-box">
          <Profile />
        </div>
        <div class="right-box">
          <ProfileInput />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fbcee8;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.darkModeButton {
  padding: 8px 12px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  cursor: pointer;
}

.logout {
  background-color: rgb(254, 235, 253);
  border: 1px solid rgb(251, 209, 251);
  border-radius: 0.5rem;
  padding: 12px 24px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font:var(--ng-reg-18);
  color: #333;
}

.dashboardTitle {
  cursor: pointer;
}
.dashboard {
  padding: 2rem;
  margin: 0;
  background: linear-gradient(to bottom, #fff9fe, #ffffff);
  font-family: sans-serif;
  box-sizing: border-box;
  color: black;
}

.dark .dashboard {
  background: linear-gradient(to bottom, #121212, #121212);
  color: #f3f3f3;
}

.dashboardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fbcee8;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark .dashboardHeader {
  background-color: #fbcee8;
  color: black;
}

.left-box,
.right-box {
  width: 50%;
}

.bottom-box {
  width: 50%;
  background-color: #ffe4e6;
}

.dark .left-box {
  color: black;
}

.dark .left-box div {
  box-shadow: 8px 8px 16px #646485, -8px -8px 16px #61617d;
}

.iconImage {
  width: 60px;
  height: 60px;
}

.flex {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.darkModeButton {
  padding: 8px 12px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  cursor: pointer;
  align-self: center;
}

.mypageButton,
.logout {
  background-color: rgb(254, 235, 253);
  border: 1px solid rgb(251, 209, 251);
  border-radius: 0.5rem;
  padding: 12px 24px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font:var(--ng-reg-18);
  color: #333;
}

.page-title {
  font-weight: bold;
  font-size: 1.8em;
}

.dark .page-title {
  color: #f3f3f3;
}

.container {
  width: 90%;
  max-width: 1100px;
  margin: 0 auto;
  padding-top: 2rem;
}

.wrapper {
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  padding: 2rem;
  border-radius: 8px;
}

.dark .wrapper {
  background-color: #2e2e4d;
  color: #f3f3f3;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.button-group {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.button-group button {
  padding: 8px 16px;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: #fbd6e7;
  font-weight: 600;
}

@media screen and (max-width: 830px) {
  .wrapper {
    flex-direction: column;
    padding: 1.5rem;
    min-width: 500px;
  }

  .left-box,
  .right-box {
    width: 100%;
  }
}
</style>
