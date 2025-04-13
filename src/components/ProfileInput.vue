<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import axios from 'axios';

const form = ref({});
const initialForm = ref({});
const isModifyModalOpen = ref(false);

onBeforeMount(() => {
  const userInfo = JSON.parse(localStorage.getItem('loggedInUserInfo'));

  form.value = {
    ...userInfo,
    confirmPassword: userInfo.password,
  };
  initialForm.value = { ...form.value };
});

// 비밀번호 보기/숨기기
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 비밀번호 일치 확인
const passwordMatchMessage = computed(() => {
  if (!form.value.password || !form.value.confirmPassword) {
    return '비밀번호를 입력해 주세요';
  }
  return form.value.password === form.value.confirmPassword
    ? '비밀번호가 일치합니다.'
    : '비밀번호가 일치하지 않습니다.';
});

const isPasswordMatch = computed(
  () => form.value.password === form.value.confirmPassword
);

// 초기화 버튼 클릭 이벤트
const initInfo = () => {
  showPassword.value = false;
  showConfirmPassword.value = false;
  form.value = { ...initialForm.value };
};

// 비밀번호 보기/숨기기
const toggleShowPassword = (field) => {
  if (field === 'password') {
    showPassword.value = !showPassword.value;
  } else {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
};

// 정보 수정 사항 있는지 체크
const isFormChanged = computed(() => {
  return Object.keys(form.value).some(
    (key) => form.value[key] !== initialForm.value[key]
  );
});

// 정보 수정 확정 여부 모달창
const openModifyModal = () => {
  isModifyModalOpen.value = true;
};

// 수정 취소
const cancelModify = () => {
  isModifyModalOpen.value = false;
};

/// 수정 확정
const confirmModify = async () => {
  if (!isPasswordMatch.value) {
    return;
  }

  isModifyModalOpen.value = false;
  localStorage.setItem('loggedInUserInfo', JSON.stringify(form.value));

  try {
    const userId = form.value.id;
    const updatedData = {
      password: form.value.password,
      age: form.value.age,
      gender: form.value.gender,
    };

    const response = await axios.patch(
      `http://localhost:3000/user/${userId}`,
      updatedData
    );
    alert('정보가 수정되었습니다.');

    showPassword.value = false;
    showConfirmPassword.value = false;
  } catch (error) {
    console.error('서버 업데이트 실패:', error);
    alert('정보를 수정하는 데 실패했어요.');
  }
};
</script>

<template>
  <h3>정보 변경</h3>
  <hr />
  <div class="wrapper">
    <label class="labelWrapper">연령</label>

    <select v-model="form.age">
      <option value="1">10대</option>
      <option value="2">20대</option>
      <option value="3">30대</option>
      <option value="4">40대</option>
      <option value="5">50대 이상</option>
    </select>

    <label class="labelWrapper">성별</label>
    <div class="genderButtons">
      <button
        type="button"
        :class="{ selected: form.gender === '남성' }"
        @click="form.gender = '남성'"
      >
        남성
      </button>
      <button
        type="button"
        :class="{ selected: form.gender === '여성' }"
        @click="form.gender = '여성'"
      >
        여성
      </button>
    </div>

    <label class="labelWrapper">비밀번호</label>
    <div class="inputWithIcon">
      <input
        :type="showPassword ? 'text' : 'password'"
        v-model="form.password"
        class="inputWrapper"
      />
      <button type="button" @click="toggleShowPassword('password')">
        {{ showPassword ? '숨기기' : '보기' }}
      </button>
    </div>

    <label class="labelWrapper">비밀번호 확인</label>
    <div class="inputWithIcon">
      <input
        :type="showConfirmPassword ? 'text' : 'password'"
        v-model="form.confirmPassword"
        class="inputWrapper"
      />
      <button type="button" @click="toggleShowPassword('confirmPassword')">
        {{ showConfirmPassword ? '숨기기' : '보기' }}
      </button>
    </div>

    <label
      class="passwordCheckMessage"
      :class="{
        errorText: !isPasswordMatch,
        successText: isPasswordMatch,
      }"
    >
      {{ passwordMatchMessage }}
    </label>
    <div class="buttonBox">
      <button class="initButton" @click="initInfo" :disabled="!isFormChanged">
        초기화
      </button>
      <button
        class="modifyButton"
        @click="openModifyModal"
        :disabled="!isFormChanged || !isPasswordMatch"
      >
        수정
      </button>

      <div v-if="isModifyModalOpen" class="modal">
        <div class="modalContent">
          <p>정보를 수정 하시겠습니까?</p>
          <div class="buttonGroup">
            <button @click="cancelModify">취소</button>
            <button @click="confirmModify">확인</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.labelWrapper {
  display: block;
  margin: 20px 0 2.5px 0;
}
.inputWrapper {
  width: 95%;
  height: 35px;
  padding-left: 10px;
  border: 1px solid #716a6c;
  border-radius: 10px;
}

/* 연령대 선택 박스 */
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

/* 성별 선택 버튼 */
.genderButtons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.genderButtons button {
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

.genderButtons button:hover {
  background-color: #fbcee8;
  color: black;
}

.genderButtons button.selected {
  background-color: #fbcee8;
  color: black;
  border: 1px solid #fbcee8;
}

/* 비밀번호 input (비밀번호 보기) */
.inputWithIcon {
  position: relative;
  width: 100%;
}

/* 비밀번호 보기/숨기기 버튼 */
.inputWithIcon button {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: grey;
  z-index: 1;
}
.successText,
.errorText {
  display: block;
  margin-top: 10px;
  font-size: 15px;
}

/* 비밀번호 비교 (일치 -> grey) (불일치 -> red) */
.errorText {
  color: red;
}
.successText {
  color: grey;
}

/* 수정, 초기화 버튼 */
.modifyButton,
.initButton {
  width: 49%;
  height: 40px;
  margin-top: 20px;
  font-weight: bold;
  border-style: none;
  border-radius: 10px;
  cursor: pointer;
}

.modifyButton {
  margin-left: 5px;
  background-color: #fbcee8;
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

.modalContent {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.buttonGroup {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.buttonGroup button {
  padding: 8px 16px;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: #fbd6e7;
  font-weight: 600;
}
</style>
