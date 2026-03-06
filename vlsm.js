'use strict';

const randomHosts = (min,max) => (Math.floor(Math.random() * (max - min)) + min);

function arrayToString(array) {
    let string = `${array[0]}.${array[1]}.${array[2]}.${array[3]}`;
    return string;
}

function checkMath (value1, value2){
    if (String(value1) == String(value2)){
        score++;
        console.log(score);
        console.log(`${value1} and ${value2}`);
    }
}

function checkInput(inputArray, answersObject){
    checkMath(inputArray[0], answersObject.numHosts);
    checkMath(inputArray[1], answersObject.hostBits);
    checkMath(inputArray[2], arrayToString(answersObject.netAddress));
    inputArray[3].replace("/", "");
    checkMath(inputArray[3], answersObject.prefix);
    checkMath(inputArray[4], arrayToString(answersObject.subAddress));
    checkMath(inputArray[5], arrayToString(answersObject.broadcastAddress));
    checkMath(inputArray[6], arrayToString(answersObject.firstHost));
    checkMath(inputArray[7], arrayToString(answersObject.lastHost));
    checkMath(inputArray[8], answersObject.magicNum);
    checkMath(inputArray[9], answersObject.splitOctet);
    
    answersArray.push(answersObject.row, answersObject.numHosts, answersObject.hostBits, arrayToString(answersObject.netAddress), answersObject.prefix, arrayToString(answersObject.subAddress), arrayToString(answersObject.broadcastAddress), arrayToString(answersObject.firstHost), arrayToString(answersObject.lastHost), answersObject.magicNum, answersObject.splitOctet);
}

class Answers {
    constructor(row, numHosts, netAddress, hostBits, prefix, splitOctet, magicNum, broadcastAddress, firstHost, lastHost, subAddress) {
        this.row = row;
        this.numHosts = numHosts;
        this.hostBits = hostBits;
        this.netAddress = netAddress;
        this.prefix = prefix;
        this.splitOctet = splitOctet;
        this.magicNum = magicNum;
        this.broadcastAddress = broadcastAddress;
        this.firstHost = firstHost;
        this.lastHost = lastHost;
        this.subAddress = subAddress;
    }
    
    //method for all elements that dont depend on row above
    mathCalc() {
        //host bits
        let power = 2;
        let exponent = 1;
        do {
            power *= 2;
            exponent++;
        }
        while (this.numHosts > power);
        this.hostBits = exponent;
        
        //prefix
        this.prefix = 32 - this.hostBits;
        
        //sub mask calculation with magic num and split octet found at the same time
        let splitPrefix = this.prefix - 16;
        let lastOctet = 0;
        let subAddress = [255,255];
        let newSplitPrefix = 0;
        
        if (splitPrefix > 8){
            subAddress.push(255);
            this.splitOctet = 4;
            splitPrefix -= 8;
            for (let i = 0; i < splitPrefix; i++){
                lastOctet += binaryValues[i];
            }
            subAddress.push(lastOctet);
        } else {
            for (let i = 0; i < splitPrefix; i++){
                lastOctet += binaryValues[i];
            }
            subAddress.push(lastOctet);
            subAddress.push(0);
            this.splitOctet = 3;
        }
        this.magicNum = 256-lastOctet;
        
        this.subAddress = subAddress;
    }
    //method for first subnet (net address the same as original)
    aMath() {
        //broadcast address
        let bitsInThird = this.magicNum - 1;
        this.broadcastAddress = [this.netAddress[0],this.netAddress[1],bitsInThird,255];
        //first host
        this.firstHost = [this.netAddress[0],this.netAddress[1], 0, 1];
        //last host
        this.lastHost = [this.netAddress[0],this.netAddress[1],bitsInThird,254];
    }
    
    //method for other subnets with different network addresses
    otherMath(prevNetAddress, prevMagicNumber, prevPrefix) {
        let lastOctet = 0;
        
        //network address
        if(prevPrefix > 24){
            lastOctet = prevNetAddress[3] + prevMagicNumber;
            this.netAddress = [prevNetAddress[0], prevNetAddress[1], prevNetAddress[2], lastOctet];
        } else {
            lastOctet = prevNetAddress[2] + prevMagicNumber;
            this.netAddress = [prevNetAddress[0], prevNetAddress[1], lastOctet, 0];
        }
        let netAddress = [...this.netAddress];
        
        //broadcast address
        if (this.hostBits >=8) {
            this.broadcastAddress = [netAddress[0], netAddress[1], (netAddress[2] + this.magicNum - 1), 255];
        } else {
            this.broadcastAddress = [netAddress[0], netAddress[1], netAddress[2], (netAddress[3] + this.magicNum - 1)];
        }
        let broadcast = [...this.broadcastAddress];
        
        //first host
        this.firstHost = [netAddress[0], netAddress[1], netAddress[2], (netAddress[3] + 1)];
        
        //last host
        this.lastHost = [netAddress[0], netAddress[1], broadcast[2], (broadcast[3] - 1)];
        
    }
}

const A = randomHosts(1200,3500);
const B = randomHosts(400,(A*0.7));
const C = randomHosts(60,(B*0.7));
const D = randomHosts(10,(C*0.7));
const E = 2;

const initNetAddress = [10,randomHosts(1,254),0,0];

const binaryValues = [128,64,32,16,8,4,2,1];

const answersA = new Answers("A", A, initNetAddress);
const answersB = new Answers("B", B);
const answersC = new Answers("C", C);
const answersD = new Answers("D", D);
const answersE = new Answers("E", E);

const answersArray = [];

answersA.mathCalc();
answersA.aMath();
answersB.mathCalc();
answersB.otherMath(answersA.netAddress, answersA.magicNum, answersA.prefix);
answersC.mathCalc();
answersC.otherMath(answersB.netAddress, answersB.magicNum, answersB.prefix);
answersD.mathCalc();
answersD.otherMath(answersC.netAddress, answersC.magicNum, answersC.prefix);
answersE.mathCalc();
answersE.otherMath(answersD.netAddress, answersD.magicNum, answersD.prefix);

let subheader = document.querySelector('h4');

subheader.innerHTML = `Based on the diagram above assuming Network A has ${A} hosts, Network B has ${B} hosts, Network C has ${C} hosts, and Network D has ${D} hosts, please fill out the VLSM table below. Start with 10.${initNetAddress[1]}.0.0/16.`;

let submitButton = document.querySelector('#submitButton');
let table = document.querySelector('table');
let diagram = document.querySelector('img');
let header = document.querySelector('h1');

let score = 0;

submitButton.addEventListener('click', event =>{
    const inputs = document.querySelectorAll("table input");
    const inputArray = Array.from(inputs, input => input.value.trim());
    
    const inputA = inputArray.slice(0,10);
    const inputB = inputArray.slice(10,20);
    const inputC = inputArray.slice(20,30);
    const inputD = inputArray.slice(30,40);
    const inputE = inputArray.slice(40,50);
    
    checkInput(inputA, answersA);
    checkInput(inputB, answersB);
    checkInput(inputC, answersC);
    checkInput(inputD, answersD);
    checkInput(inputE, answersE);
    
    header.innerHTML = 'VLSM Practice Results';
    subheader.innerHTML = `<span class='finish'>You scored ${score} out of 50. The following table shows the correct answers.</span>`;
    //table.style.display = 'none';
    submitButton.style.display = 'none';
    diagram.style.display = 'none';
    
    inputs.forEach(input => {input.value = "";});
    
    const tds = document.querySelectorAll("td");
    
    for(let i = 0; i < (tds.length); i++){
        tds[i].innerHTML = answersArray[i];
    }
    
    const hiddenRow = document.querySelectorAll(".row");
    
    for (let i = 0; i < (hiddenRow.length); i++){
        hiddenRow[i].style.display = 'table-cell';
    }
});