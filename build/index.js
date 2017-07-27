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
    var x = (circle_width + circle_left) * (num % 3);
    var y = (circle_width + circle_left) * parseInt(num / 3);
    return { x: x, y: y };
};

var drawLine = function drawLine(startPos, endPos) {
    ctx.beginPath(); // 开始路径绘制
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    //console.log(startPos,endPos);
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = "#CC0000";
    ctx.stroke(); // 进行线的着色，这时整条线才变得可见
};

var clearLine = function clearLine() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var judgePointInCircle = function judgePointInCircle(_ref) {
    var x = _ref.x,
        y = _ref.y;

    var dx = x - offset.x;
    var dy = y - offset.y;
    for (var i = 0; i < 9; i++) {
        var ci = calcPosition(i);
        dx = x - offset.x - ci.x;
        dy = y - offset.y - ci.y;
        //console.log("judgePointInCircle dx,dy:",dx,dy,circle_width);
        if (dx * dx + dy * dy <= Math.pow(circle_width, 2) / 4) {
            return i;
        }
    }
    return -1;
};

var result = "";
var prevPoint = { x: 0, y: 0, num: -1 },
    currentPoint = { x: 0, y: 0, num: -1 };
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
    //console.log("gestureMove:",judge);
    if (judge >= 0 && !result.includes(judge)) {
        currentPoint.num = judge;
        drawLine(calcPosition(prevPoint.num), calcPosition(currentPoint.num));
        prevPoint.x = currentPoint.x;
        prevPoint.y = currentPoint.y;
        prevPoint.num = currentPoint.num;
        result += judge;
    }
};

var type = "set",
    first_input = "";

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
    clearLine();
    first_input = "";
};

var gestureEnd = function gestureEnd(e) {
    console.log("gestureEnd result:", result);
    var radios = document.querySelectorAll("input[type=radio]");
    radios.forEach(function (radio) {
        if (radio.checked) type = radio.value;
    });
    if (result.length < 5) {
        showInfo("密码长度太短，不能少于5位");
        clearLine();
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
                clearLine();
            }
            return;
        }
        showInfo("请确认手势密码");
        clearLine();
        first_input = result;
    } else if (type === "verify") {
        if (result === getPassword()) {
            showInfo("密码验证成功！");
        } else {
            showInfo("输入的密码不正确");
            clear();
        }
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
content.addEventListener("touchmove", throttle(gestureMove, 20));
content.addEventListener("touchend", gestureEnd);

var handleRadioChange = function handleRadioChange(ele) {
    clear();
};