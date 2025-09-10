// 랜덤번호를 지정한다
// 유저가 번호를 입력하고 '바둑' 버튼을 누른다
// 만약에 유저가 랜덤번호를 맞추면, '정답입니다'가 나온다
// 유저번호가 랜덤번호보다 작으면 UP!!!!
// 유저번호가 랜덤번호보다 크면 DOWN!!!!!!
// Reset 버튼을 누르면 게임이 리셋된다
// 5번의 기회를 다 쓰면 게임이 끝난다 (더이상 추측 불가, 버튼이 disable)
// 유저가 1~100 범위 밖의 숫자를 입력하면 알려준다. 기회를 깎지 않는다
// 유저가 이미 입력한 숫자를 입력하면, 알려준다. 기회를 깎지 않는다

// 숫자 맞추기 게임

let computerNum = 0;
const playButton = document.getElementById("play-button");
const userInput = document.getElementById("user-input");
const resultArea = document.getElementById("result-area");
const resetButton = document.getElementById("reset-button");
const chanceArea = document.getElementById("chance-area");
let historyArea = document.getElementById("history-area");

let chances = 5;
let gameOver = false;
let guessHistory = []; // window.history 혼동 방지

function pickRandomNum() {
  computerNum = Math.floor(Math.random() * 100) + 1;
  // console.log("정답", computerNum);
}

function updateChance() {
  chanceArea.textContent = `남은기회: ${chances}번`;
}

function endGame(message) {
  gameOver = true;
  resultArea.textContent = message;
  playButton.disabled = true;
  userInput.disabled = true;
}

function play() {
  if (gameOver) return;

  const raw = String(userInput.value).trim();
  const userValue = Number(raw);

  if (!Number.isInteger(userValue)) {
    resultArea.textContent = "숫자를 입력하세요.";
    userInput.focus();
    return;
  }

  if (userValue < 1 || userValue > 100) {
    resultArea.textContent = "1과 100 사이 숫자를 입력해 주세요.";
    userInput.focus();
    return;
  }

  if (guessHistory.includes(userValue)) {
    resultArea.textContent = "이미 입력한 숫자입니다. 다른 숫자를 입력해 주세요.";
    return;
  }

  // 유효 입력 → 기회 차감
  chances--;
  updateChance();

  if (userValue < computerNum) {
    resultArea.textContent = "UP!!!!";
  } else if (userValue > computerNum) {
    resultArea.textContent = "DOWN!!!!!!";
  } else {
    endGame("정답입니다 🎉");
    return;
  }

  guessHistory.push(userValue);
  historyArea.textContent = "입력한 숫자: " + guessHistory.join(", ");

  if (chances < 1) {
    endGame(`게임 종료! 정답은 ${computerNum}입니다.`);
  }
}

function reset() {
  userInput.value = "";
  userInput.disabled = false;

  chances = 5;
  guessHistory = [];
  gameOver = false;

  updateChance();
  resultArea.textContent = "새 게임 시작! 1~100 사이 숫자를 입력해 주세요.";
  historyArea.textContent = "입력한 숫자: 없음";

  playButton.disabled = false;
  pickRandomNum();
}

playButton.addEventListener("click", play);
resetButton.addEventListener("click", reset);
userInput.addEventListener("focus", () => (userInput.value = ""));
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") play();
});

// 시작 시 정답 뽑기
pickRandomNum();
