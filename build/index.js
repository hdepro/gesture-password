"use strict";

/**
 * Created by heben.hb on 2017/7/26.
 */

var device_width = void 0;
var initFontSize = function initFontSize() {
    device_width = document.documentElement.getBoundingClientRect().width;
    document.documentElement.style.fontSize = device_width / 10 + "px";
    document.body.style.fontSize = device_width / 30 + "px";
};

var content = document.querySelector(".content");
var gesture = document.querySelector(".content .gesture");
var circle_width = void 0,
    circle_left = void 0;

var initDom = function initDom() {
    var domStr = "";
    for (var i = 0; i < 9; i++) {
        domStr += '<div class="circle"><span class="point"></span></div>';
    }
    gesture.innerHTML = domStr;
    circle_width = document.querySelector(".circle").offsetWidth;
    circle_left = document.querySelector(".circle").offsetLeft;
};
var info = document.querySelector(".info");
var showInfo = function showInfo(msg) {
    info.innerText = msg;
};

var canvas = void 0,
    ctx = void 0,
    offset = {};
var initCanvas = function initCanvas() {
    canvas = document.getElementById("my-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; //保证元素大小与画布表面大小一致
    canvas.height = canvas.offsetHeight;
    offset.x = canvas.offsetLeft;
    offset.y = content.offsetTop + canvas.offsetTop;
};

var main = function main() {
    initFontSize();
    initDom();
    initCanvas();
};
main();

var calcPosition = function calcPosition(num) {
    var x = canvas.width / 2 * (num % 3);
    var y = canvas.height / 2 * parseInt(num / 3);
    return { x: x, y: y };
};

var drawLine = function drawLine(startPos, endPos, globalCompositeOperation) {
    ctx.beginPath(); // 开始路径绘制
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    console.log(startPos, endPos);
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = "#CC0000";
    if (globalCompositeOperation === "xor") {
        ctx.globalCompositeOperation = globalCompositeOperation;
        ctx.lineWidth += 2;
        ctx.strokeStyle = "#ffffff";
    }
    ctx.stroke(); // 进行线的着色，这时整条线才变得可见
};

var clearLine = function clearLine(startPos, endPos) {
    if (startPos) ctx.clearRect(startPos.x, startPos.y, endPos.x, endPos.y);else ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var judgePointInCircle = function judgePointInCircle(point) {
    //这里顺便将传进来的点的x,y坐标格式化为画布的坐标
    var dx = void 0,
        dy = void 0;
    point.x -= offset.x;
    point.y -= offset.y;
    for (var i = 0; i < 9; i++) {
        var ci = calcPosition(i);
        dx = point.x - ci.x;
        dy = point.y - ci.y;
        if (dx * dx + dy * dy <= Math.pow(circle_width, 2) / 4) {
            return i;
        }
    }
    return -1;
};

var judgeBetweenTwoPoint = function judgeBetweenTwoPoint(one, two) {
    var onePoint = calcPosition(one);
    var twoPoint = calcPosition(two);
    var middle = (one + two) / 2;
    var mod = (one + two) % 2;
    console.log(onePoint, twoPoint);
    if (mod === 0) {
        //判断两个点的中间是否有点
        var midPoint = calcPosition(middle);
        if ((midPoint.y - onePoint.y) * (twoPoint.x - midPoint.x) === (midPoint.x - onePoint.x) * (twoPoint.y - midPoint.y)) {
            return middle;
        }
    }
    return -1;
};

/*const obj = {x:1000,y:2000};
console.log(obj);
console.log(judgePointInCircle(obj));
console.log(obj);*/

var result = "";
var prevPoint = { x: 0, y: 0, num: -1 },
    currentPoint = { x: 0, y: 0, num: -1 },
    cachePoint = { x: 0, y: 0, num: -1 };

var repaintLine = function repaintLine() {
    for (var i = 0; i < result.length - 1; i++) {
        drawLine(calcPosition(result.charAt(i)), calcPosition(result.charAt(i + 1)));
    }
};

var gestureStart = function gestureStart(e) {
    result = "";
    var touch = e.touches[0];
    //console.log("gestureStart",touch);
    prevPoint.x = touch.pageX;
    prevPoint.y = touch.pageY;
    var judge = judgePointInCircle(prevPoint);
    if (judge >= 0) {
        prevPoint.num = judge;
        result += judge;
    }
};

var gestureMove = function gestureMove(e) {
    var touch = e.touches[0];
    //console.log(touch);
    currentPoint.x = touch.pageX;
    currentPoint.y = touch.pageY;
    var judge = judgePointInCircle(currentPoint);
    console.log("judgePointInCircle judge:", judge);
    //console.log("gestureMove:",judge);
    if (!result.includes(judge)) {
        //判断是否路线中已经有这个点
        //clearLine(prevPoint,{x:cachePoint.x+1,y:cachePoint.y+1});
        clearLine();
        //drawLine(prevPoint,cachePoint,"xor");
        console.log("clearLine", prevPoint, cachePoint);
        cachePoint.x = currentPoint.x;
        cachePoint.y = currentPoint.y;
        cachePoint.num = currentPoint.num;
        if (judge >= 0) {
            var middle = judgeBetweenTwoPoint(prevPoint.num, judge);
            if (middle >= 0) {
                result += middle;
            }
            currentPoint.num = judge;
            repaintLine();
            drawLine(calcPosition(prevPoint.num), calcPosition(currentPoint.num));
            prevPoint.x = currentPoint.x;
            prevPoint.y = currentPoint.y;
            prevPoint.num = currentPoint.num;
            result += judge;
        } else {
            throttle(function () {
                repaintLine();
                drawLine(calcPosition(prevPoint.num), cachePoint);
            }, 100);
        }
    }
};

var type = "set",
    first_input = "",
    delay = 1000;

var getPassword = function getPassword() {
    if (!localStorage.getItem("password")) {
        localStorage.setItem("password", "");
    }
    return localStorage.getItem("password");
};

var setPassword = function setPassword(password) {
    getPassword();
    localStorage.setItem("password", password);
};

var clear = function clear() {
    setTimeout(clearLine, delay);
    first_input = "";
};

var gestureEnd = function gestureEnd(e) {
    console.log("gestureEnd result:", result);
    clearLine();
    repaintLine();
    var radios = document.querySelectorAll("input[type=radio]");
    radios.forEach(function (radio) {
        if (radio.checked) type = radio.value;
    });
    if (result.length < 5) {
        showInfo("密码长度太短，不能少于5位");
        setTimeout(clearLine, delay);
        return;
    }
    if (type === "set") {
        if (first_input) {
            if (result === first_input) {
                setPassword(result);
                showInfo("设置密码成功！");
                clear();
            } else {
                showInfo("两次输入密码不一致");
                setTimeout(clearLine, delay);
            }
            return;
        }
        showInfo("请确认手势密码");
        setTimeout(clearLine, delay);
        first_input = result;
    } else if (type === "verify") {
        if (result === getPassword()) {
            showInfo("密码验证成功！");
        } else {
            showInfo("输入的密码不正确");
        }
        clear();
    }
};

var throttle = function throttle(cb, delay) {
    var on = false;
    return function () {
        var context = this;
        var args = arguments;
        //console.log("args",args);
        if (!on) {
            on = true;
            setTimeout(function () {
                cb.call(context, args[0]);
                on = false;
            }, delay);
        }
    };
};

content.addEventListener("touchstart", gestureStart);
content.addEventListener("touchmove", throttle(gestureMove, 10));
content.addEventListener("touchend", throttle(gestureEnd, 10));

var handleRadioChange = function handleRadioChange(ele) {
    clear();
};