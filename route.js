'use strict';

//compares 2 values as string and ups score if its right
function checkMath (value1, value2){
    if (String(value1) == String(value2)){
        score++;
        total++;
    } else {
        total++;
    }
}

//checks all 5 parts of each address for grades
function subnetScore (arr1, arr2){
    for (let i = 0; i < 5; i++){
        checkMath(arr1[i], arr2[i]);
    }
}

//starting address with cidr and random number only containing first 3 bits of octet
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

//checks what power of 2 is suitable for a number
function powerCheck(num) {
    let exponent = 0;
    while (2 ** exponent < num) {
        exponent++;
    }
    return exponent;
}

//creates addresses to summarize using magic numbers
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

//random number generator - not inclusive
const randomNum = (min,max) => (Math.floor(Math.random() * (max - min)) + min);

//variable declaration
const binaryValues = [128,64,32,16,8,4,2,1];
const startValues = [32,96,160,224,64,192,128];
let score = 0;
let total = 0;
const addressList = [0];
const startAddress = chooseClass();
let exclusions = [];
let sumRoute = [];

//adds addresses to array, between 5 and 10 addresses
addressList.push(startAddress);
for (let i = 0; i <(randomNum(5,11)); i++){
    addressList.push(createSubnet(addressList[i + 1]));
}

//removes 0 at start and then takes out first address as summarized route
addressList.shift();
sumRoute = addressList.shift();

//takes random exclusions out of address array,not first or last and amount of exclusions dependsa on the amount of addresses
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

//displays addresses to summarize in html paragraph elements
const addresses = document.querySelectorAll("p.routes");
for (let i = 0; i < addressList.length; i++){
    addresses[i].innerHTML = `${addressList[i][0]}.${addressList[i][1]}.${addressList[i][2]}.${addressList[i][3]}/${addressList[i][4]}`;
    addresses[i].style.display = 'block';
}

//buttons to add and remove exclusions, keeps track of how many exclusions there are for min and max
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

//submitbutton to checks results
let submitButton = document.querySelector('#submitButton');
submitButton.addEventListener('click', event =>{
    //formatting input
    const sumInputs = document.querySelectorAll("input.sumRoute");
    const sumInput = Array.from(sumInputs, input => input.value.trim());
    const exInputs = document.querySelectorAll("input.exclusions");
    const excludeArray = Array.from(exInputs, input => input.value.trim());
    
    //grades summarized route first
    subnetScore(sumRoute, sumInput);
    
    //hides input boxes to show results
    const inputBox = document.querySelectorAll('div p');
    for (let i = 0; i < inputBox.length; i++){
        inputBox[i].style.display = 'none';
    }
    for (let i = 0; i < addresses.length; i++){
        addresses[i].style.display = 'none';
    }
    
    //displays exclusions
    let excludeText = "";
    for (let i = 0; i < exclusions.length; i++){
        excludeText = excludeText.concat(`
        ${exclusions[i][0][0]}.${exclusions[i][0][1]}.${exclusions[i][0][2]}.${exclusions[i][0][3]}/${exclusions[i][0][4]} <br />`);
    }
    
    //grades exclusions
    for (let i = 0; i < exclusions.length; i++){
        if (exclusions.includes(excludeArray[i])){
            subnetScore(excludeArray[i], exclusions[i]);
        } else {
            total += 5;
        }
    }
    
    //checks if amount of exclusions is right
    if (exclusions.length == (excludeArray.length / 5)){
        total += exclusions.length;
        score += exclusions.length;
    } else {
        total += exclusions.length;
    }
    
    //other display output to show grades and correct answers
    document.querySelector('div').innerHTML = `${sumRoute[0]}.${sumRoute[1]}.${sumRoute[2]}.${sumRoute[3]}/${sumRoute[4]}`;
    document.querySelector('h4').innerHTML = `You scored ${score}/${total}. The correct answers are displayed below:`;
    document.querySelector('div#exclusion').innerHTML = excludeText;
    submitButton.style.display = 'none';
    
    //clearing values at the end
    score = 0;
    total = 0;
    sumInputs.forEach(input => {input.value = "";});
    exInputs.forEach(input => {input.value = "";});
});
