// ES6 문제 풀이

// 1) 객체 리터럴 축약
let name = "noona's fruit store";
let fruits = ["banana", "apple", "mango"];
let address = "Seoul";

let store = { name, fruits, address };
console.log(store);

// 2) 템플릿 리터럴 출력
console.log(`제 가게 이름은 ${store.name} 입니다. 위치는 ${store.address} 에 있습니다`);

// 3) 매개변수 Destructuring
function calculate({ a, b, c }) {
  return a + b + c;
}
console.log(calculate({ a: 1, b: 2, c: 3 }));

// 4) 매개변수만 사용
let name2 = "noona store";
let fruits2 = ["banana", "apple", "mango"];
let address2 = { country: "Korea", city: "Seoul" };

function findStore({ name, address: { city } }) {
  return name === "noona store" && city === "Seoul";
}
console.log(findStore({ name: name2, fruits: fruits2, address: address2 }));

// 5) 배열 Destructuring + 객체 리턴
function getNumber() {
  let array = [1, 2, 3, 4, 5, 6];
  const [first, , third, forth] = array;
  return { first, third, forth };
}
console.log(getNumber());

// 6) Rest 파라미터 테스트
function getCalendar(first, ...rest) {
  return (
    first === "January" &&
    rest[0] === "Febuary" &&
    rest[1] === "March" &&
    rest[2] === undefined
  );
}
console.log(getCalendar("January", "Febuary", "March"));

// 7) 최소값 찾기
function getMinimum() {
  let a = [45, 23, 78];
  let b = [54, 11, 9];
  return Math.min(...a, ...b);
}
console.log(getMinimum());

// 8) 화살표 함수 변환
const sumNumber = () => {
  const sum = (a, b) => a + b;
  return sum(40, 10);
};
console.log(sumNumber());

// 9) 커링 화살표 함수
const sumNumber2 = () => {
  const addNumber = a => b => c => a + b + c;
  return addNumber(1)(2)(3);
};
console.log(sumNumber2());
