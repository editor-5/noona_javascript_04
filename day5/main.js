// 문제 1
// greet 함수: "안녕 내 이름은 제시카야"를 출력하는 함수
function greet(){
    console.log("안녕 내 이름은 제시카야")
}


// 문제 2, 3
// greet 함수: 이름을 매개변수로 받아 "안녕 내 이름은 [이름]야"를 출력하고, 이름을 반환하는 함수
function greet(name){
    console.log(`안녕 내 이름은 ${name}야`);
    return name;
}
// 결과 확인 예시
const name = greet("지영")
console.log("안녕 내 이름은",name,"이야")


// 문제 4
// meetAt 함수: 년, 월, 일 인자에 따라 다른 형식의 날짜 문자열을 반환하는 함수
// - meetAt(2022) => "2022년"
// - meetAt(2032, 3) => "2032년 3월"
// - meetAt(1987, 10, 28) => "1987/10/28"
function meetAt(year, month, date) {
    if (date) {
        return `${year}/${month}/${date}`;
    }
    if (month) {
        return `${year}년 ${month}월`;
    }
    if (year) {
        return `${year}년`;
    }
}
console.log(meetAt(2022,1,7))


// 문제 5
// findSmallestElement 함수: 숫자 배열에서 가장 작은 값을 반환, 배열이 비어있으면 0 반환
function findSmallestElement(arr) {
    if (arr.length === 0 ) {
        return 0;
    }
    let result = arr[0];
    for (let i = 1; i < arr.length; i++){
        if(result > arr[i]){
            result = arr[i];
        }
    }
    return result;
}
let smallestNumber = findSmallestElement([100,200,3,0,2,1])
console.log(smallestNumber)


// 문제 6
// changeCalculate 함수: 돈을 입력받아 각 화폐 단위별 최소 개수를 콘솔에 출력
// 예시: 12300 입력 시
// 50000 X 0
// 10000 X 1
// 5000 X 0
// 1000 X 2
// 500 X 0
// 100 X 3
let unit = [50000,10000,5000,1000,500,100]
function changeCalculate(money) {
    for(let i=0;i<unit.length;i++){
        let num = Math.floor(money / unit[i])
        console.log(unit[i]+"X"+num)
        money = money - (unit[i]*num)
    }
}
changeCalculate(12300)


     