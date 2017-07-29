/**
 * Created by heben.hb on 2017/7/26.
 */

//初始化整个页面以及canvas

let device_width;
const initFontSize = () => {    //通过rem方式完成适配
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

let canvas,ctx,offset={};
const initCanvas = () => {
    canvas = document.getElementById("my-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;     //保证元素大小与画布表面大小一致
    canvas.height = canvas.offsetHeight;
    offset.x = canvas.offsetLeft;
    offset.y = content.offsetTop+canvas.offsetTop;
};

const init = () =>{
    initFontSize();
    initDom();
    initCanvas();
};
init();

const throttle = (cb,delay) => {   //节流阀
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

let info = document.querySelector(".info");
const showInfo = (msg) => {
    info.innerText = msg;
};

const calcPosition = (num) => {
    let x = (canvas.width/2)*(num%3);
    let y = (canvas.height/2)*parseInt(num/3);
    return {x, y};
};

const drawLine = (startPos,endPos,globalCompositeOperation) => {
    ctx.beginPath();           // 开始路径绘制
    ctx.moveTo(startPos.x,startPos.y);
    ctx.lineTo(endPos.x,endPos.y);
    console.log(startPos,endPos);
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = "#CC0000";
    if(globalCompositeOperation === "xor") {
        ctx.globalCompositeOperation = globalCompositeOperation;
        //ctx.lineWidth += 2;
        ctx.strokeStyle = "#ffffff";
    }
    ctx.stroke();         // 进行线的着色，这时整条线才变得可见
};

const clearLine = (startPos,endPos) => {
        if(startPos) ctx.clearRect(startPos.x,startPos.y,endPos.x,endPos.y);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
};

const repaintLine = () => {
    for(let i=0;i<result.length-1;i++){
        drawLine(calcPosition(result.charAt(i)),calcPosition(result.charAt(i+1)));
    }
};

const judgePointInCircle = (point) => {   //这里顺便将传进来的点的x,y坐标格式化为画布的坐标
    let dx,dy;
    point.x -= offset.x;
    point.y -= offset.y;
    for(let i=0;i<9;i++){
        let ci = calcPosition(i);
        dx = point.x -  ci.x;
        dy = point.y -  ci.y;
        if(dx*dx + dy*dy<=Math.pow(circle_width,2)/4){
            return i;
        }
    }
    return -1;
};

const judgeBetweenTwoPoint = (one,two) => {
    let onePoint = calcPosition(one);
    let twoPoint = calcPosition(two);
    let middle = (one + two)/2;
    let mod = (one + two)%2;
    console.log(onePoint,twoPoint);
    if(mod === 0) {  //判断两个点的中间是否有点
        let midPoint = calcPosition(middle);
        if((midPoint.y - onePoint.y) * (twoPoint.x - midPoint.x)
            === (midPoint.x - onePoint.x) * (twoPoint.y - midPoint.y)){
            return middle;
        }
    }
    return -1;
};

let circleDoms = document.getElementsByClassName("circle");
const addTouchStyle = (num) => {
    let dom = circleDoms[num];
    dom && dom.classList.add("touch");
};

let result = "";
let prevPoint = {x:0,y:0,num:-1},currentPoint = {x:0,y:0,num:-1},cachePoint = {x:0,y:0,num:-1};

const gestureStart = (e)=>{
    console.log("gestureStart",new Date().getTime());
    result = "";
    let touch = e.touches[0];
    //console.log("gestureStart",touch);
    prevPoint.x =  touch.pageX;
    prevPoint.y =  touch.pageY;
    let judge = judgePointInCircle(prevPoint);
    if(judge >= 0){
        addTouchStyle(judge);
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
    console.log("judgePointInCircle judge:",judge);
    //console.log("gestureMove:",judge);
    if(!result.includes(judge)){     //判断是否路线中已经有这个点
        //clearLine(prevPoint,{x:cachePoint.x+1,y:cachePoint.y+1});
        //drawLine(prevPoint,cachePoint,"xor");
        clearLine();
        cachePoint.x = currentPoint.x;
        cachePoint.y = currentPoint.y;
        cachePoint.num = currentPoint.num;
        if(judge>=0){
            if(result === ""){
                addTouchStyle(judge);
                prevPoint.x = currentPoint.x;
                prevPoint.y = currentPoint.y;
                prevPoint.num = judge;
                result += judge;
                return ;
            }
            addTouchStyle(judge);
            clearLine();
            let middle = judgeBetweenTwoPoint(prevPoint.num,judge);
            if(middle >= 0){
                result += middle;
                addTouchStyle(middle);
            }
            currentPoint.num = judge;
            repaintLine();
            drawLine(calcPosition(prevPoint.num),calcPosition(currentPoint.num));
            prevPoint.x = currentPoint.x;
            prevPoint.y = currentPoint.y;
            prevPoint.num = currentPoint.num;
            result += judge;
        }else{
            repaintLine();
            drawLine(calcPosition(prevPoint.num),cachePoint);
        }
    }
};

let type = "set",first_input="",delay=1000;

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
    setTimeout(() => {
        let domArray = Array.prototype.slice.call(circleDoms,0);
        domArray.forEach(dom => {
            dom.classList.remove("touch");    //清理圆盘上的触摸效果;
        });
        clearLine();
    },delay);
};

const gestureEnd = (e)=>{
    console.log("gestureEnd result:",result);
    console.log("gestureEnd",new Date().getTime());
    clearLine();
    repaintLine();
    if(result.length < 5){
        showInfo("密码长度太短，不能少于5位");
        clear();
        return;
    }
    if(type === "set"){
        if(first_input){
            if(result === first_input){
                setPassword(result);
                showInfo("设置密码成功！");
                first_input = "";
                clear();
            }else{
                showInfo("两次输入密码不一致");
                clear();
            }
            return ;
        }
        showInfo("请确认手势密码");
        clear();
        first_input = result;
    }else if(type === "verify"){
        if(result === getPassword()){
            showInfo("密码验证成功！");
        }else{
            showInfo("输入的密码不正确");
        }
        clear();
    }
};


content.addEventListener("touchstart",gestureStart);
//content.addEventListener("touchmove",gestureMove);
content.addEventListener("touchmove",throttle(gestureMove,10));
content.addEventListener("touchend",throttle(gestureEnd,10));

const handleRadioChange = (ele) => {
    first_input = "";
    clear();
    let radios = Array.prototype.slice.call(document.querySelectorAll("input[type=radio]"),0);
    radios.forEach(radio => {
        if(radio.checked) type = radio.value;
    });
    if(type === "set") {
        showInfo("请设置手势密码");
    }else{
        showInfo("请输入手势密码");
    }
};