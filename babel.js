/**
 * Created by heben.hb on 2017/7/27.
 */

let fs = require("fs");
let babel = require("babel-core");

babel.transformFile("js/index.js", {
    presets: ['es2015','stage-0']
}, function (err, result) {
    if(err) {
        console.log("babel err : ",err);
        return ;
    }
    fs.writeFileSync("build/index.js", result.code);
});

let http = require("http");
http.createServer();