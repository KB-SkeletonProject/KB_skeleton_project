<template>
  <div class="signup-container">
    <div class="signup-box">
      <h2 class="title">회원가입</h2>
      <form @submit.prevent="handleSignUp">
        <label class="label-text">아이디</label>
        <div class="input-with-button">
          <input
            type="email"
            placeholder="example@email.com"
            v-model="email"
            :readonly="emailChecked"
          />
          <button type="button" @click="checkDuplicateEmail" class="check-btn">
            중복 확인
          </button>
        </div>
        <!-- <p
          v-if="emailChecked !== null"
          :class="emailChecked ? 'valid' : 'invalid'"
        >
          {{
            emailChecked
              ? '사용 가능한 이메일입니다!'
              : '이미 사용 중인 이메일입니다.'
          }}
        </p> -->

        <p
          v-if="emailMessage"
          :class="
            emailChecked === true
              ? 'valid'
              : emailChecked === false
              ? 'invalid'
              : 'warning'
          "
        >
          {{ emailMessage }}
        </p>

        <label class="label-text">이름</label>
        <input type="text" placeholder="이름을 입력하세요" v-model="name" />

        <label class="label-text">비밀번호</label>
        <div class="password-field">
          <input
            :type="showPassword ? 'text' : 'password'"
            placeholder="8자 이상 입력해주세요"
            v-model="password"
          />
          <span @click="togglePassword" class="toggle">보기</span>
        </div>

        <label class="label-text">비밀번호 확인</label>
        <div class="password-field">
          <input
            :type="showConfirm ? 'text' : 'password'"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            v-model="confirmPassword"
          />
          <span @click="toggleConfirm" class="toggle">보기</span>
        </div>

        <p
          v-if="confirmPassword"
          :class="passwordMatch ? 'match' : 'not-match'"
        >
          {{ passwordMatch ? '비밀번호가 같습니다!' : '비밀번호가 다릅니다!' }}
        </p>

        <label class="label-text">연령대</label>
        <select v-model="ageGroup">
          <option>10대</option>
          <option>20대</option>
          <option>30대</option>
          <option>40대</option>
          <option>50대 이상</option>
        </select>

        <label class="label-text">성별(선택)</label>
        <div class="gender-buttons">
          <button
            type="button"
            :class="{ selected: gender === '남성' }"
            @click="gender = '남성'"
          >
            남성
          </button>
          <button
            type="button"
            :class="{ selected: gender === '여성' }"
            @click="gender = '여성'"
          >
            여성
          </button>
        </div>

        <button type="submit" class="signup-btn">회원가입</button>
      </form>

      <p class="login-text">
        이미 계정이 있으신가요?
        <router-link to="/login" class="login-link">로그인</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = ref('');
const name = ref('');
const password = ref('');
const confirmPassword = ref('');
const ageGroup = ref('10대');
const gender = ref('');
const showPassword = ref(false);
const showConfirm = ref(false);

const emailChecked = ref(null); // 중복 확인 결과 저장
const emailMessage = ref('');

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirm = () => {
  showConfirm.value = !showConfirm.value;
};

const passwordMatch = computed(() => {
  return (
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value
  );
});

const checkDuplicateEmail = async () => {
  // 이메일 입력값이 비어 있으면 메시지 출력
  if (!email.value) {
    emailChecked.value = null;
    emailMessage.value = '아이디를 입력해주세요.';
    return;
  }

  // 이메일 형식이 잘못된 경우
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    emailChecked.value = null;
    emailMessage.value = '이메일 형식에 맞춰서 입력해주세요.';
    return;
  }

  try {
    const response = await axios.get('http://localhost:3000/user');
    const exists = response.data.some((user) => user.userId === email.value);
    emailChecked.value = !exists;
    emailMessage.value = exists
      ? '이미 사용 중인 이메일입니다.'
      : '사용 가능한 이메일입니다!';
  } catch (error) {
    console.error('중복 확인 실패:', error);
    alert('중복 확인 중 오류가 발생했습니다.');
  }
};

const handleSignUp = async () => {
  if (!emailChecked.value) {
    alert('이메일 중복 확인을 해주세요.');
    return;
  }

  if (!passwordMatch.value) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  try {
    const ageResponse = await axios.get('http://localhost:3000/ageArea');
    const ageEntry = ageResponse.data.find((age) => age.age === ageGroup.value);
    const ageId = ageEntry ? ageEntry.id : null;

    if (!ageId) {
      alert('유효한 연령대를 선택해주세요.');
      return;
    }

    const newUser = {
      userId: email.value,
      password: password.value,
      name: name.value,
      age: ageId,
      gender: gender.value || '미선택',
      goalSavings: 0,
    };

    await axios.post('http://localhost:3000/user', newUser);

    alert('회원가입 성공!');
    router.push('/login');
  } catch (error) {
    console.error('회원가입 실패:', error);
    alert('회원가입 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 + 중복 확인 스타일 추가 */
.signup-container {
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

.signup-box {
  background-color: white;
  border-radius: 12px;
  padding: 40px;
  width: 400px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.input-with-button {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.input-with-button input {
  flex: 1;
}

.check-btn {
  height: auto;
  cursor: pointer;
  margin-bottom: 20px;
  background-color: #ffb6dc;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.valid {
  color: green;
  font-size: 14px;
  margin-bottom: 10px;
}

.invalid {
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
}

/* 이하 기존 스타일 유지 */
.title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
  color: #181818;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #181818;
}

input,
select {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

.password-field {
  position: relative;
}

.toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: #888;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
}

.match {
  color: green;
  font-size: 14px;
  margin-top: -15px;
  margin-bottom: 20px;
  text-align: left;
}

.not-match {
  color: red;
  font-size: 14px;
  margin-top: -15px;
  margin-bottom: 20px;
  text-align: left;
}

.gender-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.gender-buttons button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.gender-buttons button:hover {
  background-color: #ffc7ef;
  color: black;
}

.gender-buttons button.selected {
  background-color: #ffc7ef;
  color: black;
  border: 1px solid #ffc7ef;
}

.signup-btn {
  width: 100%;
  padding: 12px;
  background-color: #ffb6dc;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.signup-btn:hover {
  background-color: #f59fc8;
}

.login-text {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #181818;
}

.login-link {
  color: #ff6aa6;
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
}

.login-link:hover {
  text-decoration: underline;
}
.warning {
  color: #f0ad4e;
  font-size: 14px;
  margin-bottom: 10px;
}

.valid {
  color: green;
  font-size: 14px;
  margin-bottom: 10px;
}

.invalid {
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
}
</style>
