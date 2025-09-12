let names = [
  "Steven Paul Jobs",
  "Bill Gates",
  "Mark Elliot Zuckerberg",
  "Elon Musk",
  "Jeff Bezos",
  "Warren Edward Buffett",
  "Larry Page",
  "Larry Ellison",
  "Tim Cook",
  "Lloyd Blankfein",
];

// ----------------- map -----------------
console.log("map 문제");

// 1. 모든 이름을 대문자로
let upperNames = names.map(n => n.toUpperCase());
console.log(upperNames);

// 2. 성을 제외한 이름만
let firstNames = names.map(n => n.split(" ")[0]);
console.log(firstNames);

// 3. 이니셜만
let initials = names.map(n => 
  n.split(" ").map(word => word[0]).join("")
);
console.log(initials);

// ----------------- filter -----------------
console.log("filter 문제");

// 1. 이름에 a 포함
let hasA = names.filter(n => n.toLowerCase().includes("a"));
console.log(hasA);

// 2. 같은 글자가 연속
let doubleChar = names.filter(n => /(.)\1/.test(n.toLowerCase()));
console.log(doubleChar);

// ----------------- some -----------------
console.log("some 문제");

// 1. 전체 이름 길이가 20자 이상
let someLongName = names.some(n => n.length >= 20);
console.log(someLongName);

// 2. 성 제외한 이름에 p 포함 (대소문자 구분 x)
let someP = names.some(n => 
  n.split(" ").slice(0, -1).join(" ").toLowerCase().includes("p")
);
console.log(someP);

// ----------------- every -----------------
console.log("every 문제");

// 1. 모두의 전체 이름이 20자 이상?
let everyLong = names.every(n => n.length >= 20);
console.log(everyLong);

// 2. 모두의 이름에 a가 포함?
let everyA = names.every(n => n.toLowerCase().includes("a"));
console.log(everyA);

// ----------------- find -----------------
console.log("find 문제");

// 1. 전체 이름 길이가 20자 이상
let findLong = names.find(n => n.length >= 20);
console.log(findLong);

// 2. 미들네임이 있는 첫번째 사람
let findMiddle = names.find(n => n.split(" ").length > 2);
console.log(findMiddle);

// ----------------- findIndex -----------------
console.log("findIndex 문제");

// 1. 전체 이름 길이 20자 이상인 사람 인덱스
let findIndexLong = names.findIndex(n => n.length >= 20);
console.log(findIndexLong);

// 2. 미들네임이 있는 사람 인덱스
let findIndexMiddle = names.findIndex(n => n.split(" ").length > 2);
console.log(findIndexMiddle);
