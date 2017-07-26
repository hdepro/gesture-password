/**
 * Created by heben.hb on 2017/7/26.
 */

let device_width;
const initFontSize = () => {
    device_width = document.documentElement.getBoundingClientRect().width;
    document.documentElement.style.fontSize = device_width/10+"px";
    document.body.style.fontSize = device_width/30+"px";
};

let content = document.querySelector(".content");
let gesture = document.querySelector(".content .gesture");
let circle_width,circle_left;

const initDom = () => {
    let domStr = "";
    for(let i=0;i<9;i++){
        domStr += '<div class="circle"><span class="point"></span></div>';
    }
    gesture.innerHTML = domStr;
    circle_width = document.querySelector(".circle").offsetWidth;
    circle_left = document.querySelector(".circle").offsetLeft;
};
let info = document.querySelector(".info");
const showInfo = (msg) => {
    info.innerText = msg;
};

let canvas,ctx,offset={};
const initCanvas = () => {
    canvas = document.getElementById("my-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;  //保证元素大小与画布表面大小一致
    canvas.height = canvas.offsetHeight;
    offset.x = canvas.offsetLeft;
    offset.y = content.offsetTop+canvas.offsetTop;
};

const main = () =>{
    initFontSize();
    initDom();
    initCanvas();
};
main();

const calcPosition = (num) => {
    let x = (circle_width + circle_left)*(num%3);
    let y = (circle_width + circle_left)*parseInt(num/3);
    return {x, y};
};

const drawLine = (startPos,endPos) => {
    ctx.beginPath();           // 开始路径绘制
    ctx.moveTo(startPos.x,startPos.y);
    ctx.lineTo(endPos.x,endPos.y,);
    //console.log(startPos,endPos);
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = "#CC0000";
    ctx.stroke();         // 进行线的着色，这时整条线才变得可见
};

const clearLine = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
};

const judgePointInCircle = ({x,y}) => {
    let dx = x - offset.x;
    let dy = y - offset.y;
    for(let i=0;i<9;i++){
        let ci = calcPosition(i);
        dx = x - offset.x -  ci.x;
        dy = y - offset.y -  ci.y;
        //console.log("judgePointInCircle dx,dy:",dx,dy,circle_width);
        if(dx*dx + dy*dy<=Math.pow(circle_width,2)/4){
            return i;
        }
    }
    return -1;
};

let result = "";
let prevPoint = {x:0,y:0,num:-1},currentPoint = {x:0,y:0,num:-1};
const gestureStart = (e)=>{
    result = "";
    let touch = e.touches[0];
    //console.log("gestureStart",touch);
    prevPoint.x =  touch.pageX;
    prevPoint.y =  touch.pageY;
    let judge = judgePointInCircle(prevPoint);
    if(judge >= 0){
        prevPoint.num = judge;
        result += judge;
    }
};

const gestureMove = (e)=>{
    let touch = e.touches[0];
    //console.log(touch);
    currentPoint.x =  touch.pageX;
    currentPoint.y =  touch.pageY;
    let judge = judgePointInCircle(currentPoint);
    //console.log("gestureMove:",judge);
    if(judge >= 0 && !result.includes(judge)){
        currentPoint.num = judge;
        drawLine(calcPosition(prevPoint.num),calcPosition(currentPoint.num));
        prevPoint.x = currentPoint.x;
        prevPoint.y = currentPoint.y;
        prevPoint.num = currentPoint.num;
        result += judge;
    }
};

let type = "set",first_input="";

const getPassword = () => {
    if(!localStorage.getItem("password")){
        localStorage.setItem("password","");
    }
    return localStorage.getItem("password");
};

const setPassword = (password) => {
    getPassword();
    localStorage.setItem("password",password);
};

const clear = () => {
    clearLine();
    first_input = "";
};

const gestureEnd = (e)=>{
    console.log("gestureEnd result:",result);
    let radios = document.querySelectorAll("input[type=radio]");
    radios.forEach(radio => {
        if(radio.checked) type = radio.value;
    });
    if(result.length < 5){
        showInfo("密码长度太短，不能少于5位");
        clearLine();
        return;
    }
    if(type === "set"){
        if(first_input){
            if(result === first_input){
                setPassword(result);
                showInfo("设置密码成功！");
                clear();
            }else{
                showInfo("两次输入密码不一致");
                clearLine();
            }
            return ;
        }
        showInfo("请确认手势密码");
        clearLine();
        first_input = result;
    }else if(type === "verify"){
        if(result === getPassword()){
            showInfo("密码验证成功！");
        }else{
            showInfo("输入的密码不正确");
            clear();
        }
    }
};

const throttle = (cb,delay) => {
    let on = false;
    return function(){
        let context = this;
        let args = arguments;
        //console.log("args",args);
        if(!on){
            on = true;
            setTimeout(() => {
                cb.call(context,args[0]);
                on = false;
            },delay)
        }
    }
};

content.addEventListener("touchstart",gestureStart);
content.addEventListener("touchmove",throttle(gestureMove,20));
content.addEventListener("touchend",gestureEnd);

const handleRadioChange = (ele) => {
    clear();
};
