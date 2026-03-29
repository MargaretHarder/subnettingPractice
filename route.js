'use strict';

function checkMath (value1, value2){
    if (String(value1) == String(value2)){
        score++;
        total++;
    } else {
        total++;
    }
}

function subnetScore (arr1, arr2){
    for (let i = 0; i < 5; i++){
        checkMath(arr1[i], arr2[i]);
    }
}

//CHOOSE CIDR CLASS ALL SUBNETS WILL BE CREATED FROM
function chooseClass() {
    let cidrChoice = randomNum(1,4);
    let cidr = [];
    let free = randomNum(0,7);
    
    if (cidrChoice == 1){
        cidr.push(10,0,0,0,8);
        cidr[1] = startValues[free];
        
    } else if (cidrChoice == 2){
        cidr.push(172,16,0,0,16);
        cidr[2] = startValues[free];
        
    } else {
        cidr.push(192,168,0,0,16);
        cidr[2] = startValues[free];
        
    }
    
    if(free < 4){
        cidr[4] += 3;
    } else if (free < 6){
        cidr[4] += 2;
        if(randomNum(0,2) == 0) {
            cidr[4]++;
        }
    } else {
        cidr[4] += 1;
        if(randomNum(0,2) == 0) {
            cidr[4]++;
        }
        if(randomNum(0,2) == 0) {
            cidr[4]++;
        }
    }
    
    return cidr;
}

//CHECKS WHAT POWER OF TWO IS SUITABLE FOR AN INPUTED NUMBER
function powerCheck(num) {
    let exponent = 0;
    while (2 ** exponent < num) {
        exponent++;
    }
    return exponent;
}

function createSubnet (current) {
    let tempAdd = [...current];
    let temp = tempAdd[4];
    let pos = 0;

    while (temp >= 8){
        temp -= 8;
        pos++;
    }
    
    if (temp == 0){
        tempAdd[pos - 1] += binaryValues[7];
    } else {
        tempAdd[pos] += binaryValues[temp];
    }
    tempAdd[4]++;
    
    if(randomNum(0,2) == 0 && tempAdd[4] != 8 && tempAdd[4] != 16 && tempAdd[4] != 24) {
        tempAdd[4]++;
    }
    
    for (let i = 3; i >= 0; i--) {
        if (tempAdd[i] > 255) {
            let carry = Math.floor(tempAdd[i] / 256);
            tempAdd[i] = tempAdd[i] % 256;
            if (i > 0) {
                tempAdd[i - 1] += carry;
            }
        }
    }
    
    
    return tempAdd;
}

const randomNum = (min,max) => (Math.floor(Math.random() * (max - min)) + min);
const binaryValues = [128,64,32,16,8,4,2,1];
const startValues = [32,96,160,224,64,192,128];
let score = 0;
let total = 0;

const addressList = [0];
const startAddress = chooseClass();
let exclusions = [];
let sumRoute = [];
addressList.push(startAddress);

for (let i = 0; i <(randomNum(5,11)); i++){
    addressList.push(createSubnet(addressList[i + 1]));
}

addressList.shift();
sumRoute = addressList.shift();

if (addressList.length == 5){
    exclusions.push(addressList.splice(randomNum(1,(addressList.length - 2)),1));
} else if (addressList.length < 8){
    exclusions.push(addressList.splice(randomNum(1,(addressList.length - 2)),1));
    exclusions.push(addressList.splice(randomNum(1,(addressList.length - 2)),1));
} else {
    exclusions.push(addressList.splice(randomNum(1,(addressList.length - 2)),1));
    exclusions.push(addressList.splice(randomNum(1,(addressList.length - 2)),1));
    exclusions.push(addressList.splice(randomNum(1,(addressList.length - 2)),1));
}

console.log(exclusions);


const addresses = document.querySelectorAll("p.routes");
for (let i = 0; i < addressList.length; i++){
    addresses[i].innerHTML = `${addressList[i][0]}.${addressList[i][1]}.${addressList[i][2]}.${addressList[i][3]}/${addressList[i][4]}`;
    addresses[i].style.display = 'block';
}

let exAdded = 1;

let exclusionAdder = document.querySelector('#exclusionAdd');
exclusionAdder.addEventListener('click', event =>{
    if (exAdded < 6) {
        let ex = document.getElementById('exclusion').lastElementChild;
        let newEx = ex.cloneNode(true);
        document.getElementById('exclusion').appendChild(newEx);
        
        exAdded++;
    }
});

let exclusionMinuser = document.querySelector('#exclusionSub');
exclusionMinuser.addEventListener('click', event =>{
    if (exAdded > 1) {
        let exP = document.getElementById('exclusion');
        let lastEx = exP.lastElementChild;
        
        exP.removeChild(lastEx);
        exAdded--;
    }
});


let submitButton = document.querySelector('#submitButton');
submitButton.addEventListener('click', event =>{
    const inputs = document.querySelectorAll("div p input");
    const inputArray = Array.from(inputs, input => input.value.trim());
    
    const sumInput = inputArray.slice(0,5);
    const excludeArray = inputArray;
    
    subnetScore(sumRoute, sumInput);
    
    const inputBox = document.querySelectorAll('div p');
    for (let i = 0; i < inputBox.length; i++){
        inputBox[i].style.display = 'none';
    }
    
    for (let i = 0; i < addresses.length; i++){
        addresses[i].style.display = 'none';
    }
    
    let excludeText = "";
    
    for (let i = 0; i < exclusions.length; i++){
        excludeText = excludeText.concat(`
        ${exclusions[i][0][0]}.${exclusions[i][0][1]}.${exclusions[i][0][2]}.${exclusions[i][0][3]}/${exclusions[i][0][4]} <br />`);
    }
    
    for (let i = 0; i < exclusions.length; i++){
        
        if (exclusions.includes(excludeArray[i])){
            subnetScore(excludeArray[i], exclusions[i]);
        } else {
            total += 5;
        }
    }
    
    document.querySelector('div').innerHTML = `${sumRoute[0]}.${sumRoute[1]}.${sumRoute[2]}.${sumRoute[3]}/${sumRoute[4]}`;
    document.querySelector('h4').innerHTML = `You scored ${score}/${total}. The correct answers are displayed below:`;
    document.querySelector('div#exclusion').innerHTML = excludeText;
    submitButton.style.display = 'none';
    
    score = 0;
    total = 0;
    inputs.forEach(input => {input.value = "";});
});
