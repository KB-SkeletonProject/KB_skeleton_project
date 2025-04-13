<template>
  <div class="loginWrapper">
    <Piggyface :eyeOffset="eyeOffset" :isEyeClosed="isEyeClosed" />
    <div class="loginContainer">
      <div class="loginBox">
        <h2 class="title">로그인</h2>
        <form @submit.prevent="handleLogin">
          <label>아이디</label>
          <input
            type="email"
            placeholder="example@email.com"
            v-model="email"
            @input="handleEmailInput"
          />
          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            v-model="password"
            @input="handlePasswordInput"
          />
          <button type="submit" class="loginBtn">로그인</button>
        </form>
        <p class="signupText">
          아직 회원이 아니신가요?
          <router-link to="/signup" class="signupLink">회원가입</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Piggyface from '@/components/Piggyface.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const isEyeClosed = ref(false);
const eyeOffset = ref({ x: 0, y: 0 });
const email = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/user');
    const users = await response.json();

    const user = users.find((u) => u.userId === email.value);

    if (!user) {
      alert('아이디 혹은 비밀번호가 일치하지 않습니다!');
      return;
    }

    if (user.password !== password.value) {
      alert('아이디 혹은 비밀번호가 일치하지 않습니다!');
      return;
    }

    console.log('로그인 성공:', user);
    alert(`${user.name}님 환영합니다!`);

    localStorage.setItem('loggedInUserId', user.id);
    localStorage.setItem('loggedInUserInfo', JSON.stringify(user));
    router.push('/home');
  } catch (error) {
    console.error('로그인 오류:', error);
    alert('로그인 중 오류가 발생했습니다.');
  }
};

//눈이 이메일을 입력하면 입력하는 이메일을 따라갑니다.
const handleEmailInput = (e) => {
  email.value = e.target.value;

  const length = email.value.length;
  const maxX = 11; // 눈이 이동하는 총 범위 (절대값)
  const maxChars = 90; // 최대 기준 문자 수

  // 입력 길이에 따라 이동
  const offsetX = -7 + (Math.min(length, maxChars) / maxChars) * maxX;
  const offsetY = 3; // 살짝 아래로 고정

  eyeOffset.value = {
    x: offsetX,
    y: offsetY,
  };
};

// 비밀번호 입력 시 눈 감도록 처리
const handlePasswordInput = (e) => {
  password.value = e.target.value;

  // 비밀번호 입력 중일 때 눈을 감도록 설정
  isEyeClosed.value = password.value.length > 0;
};
</script>

<style scoped>
.loginWrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.loginBox {
  background-color: white;
  border: 2px solid #a6d1f2;
  border-radius: 10px;
  padding: 40px;
  width: 350px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
  color: #181818;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #181818;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.loginBtn {
  width: 100%;
  padding: 12px;
  background-color: #ffb6dc;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
}

.loginBtn:hover {
  background-color: #f59fc8;
}

.signupText {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #181818;
}

.signupLink {
  color: #ff6aa6;
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
}

.signupLink:hover {
  text-decoration: underline;
}
</style>
