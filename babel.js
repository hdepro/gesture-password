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

let browserSync = require('browser-sync');
let reload = browserSync.reload;
let files = [
    '*.html',
    {
        match: ['js/*.js'],
        fn:function (event, file) {
            babel.transformFile("js/index.js", {
                presets: ['es2015','stage-0']
            }, function (err, result) {
                if(err) {
                    console.log("babel err : ",err);
                    return ;
                }
                fs.writeFileSync("build/index.js", result.code);
            });
        }
    },
    'build/*.js',
    'css/*.css'
];

browserSync.init(files, {
    proxy: 'http://localhost:80',
    browser: 'chrome',
    notify: false,
    port: 3000
});


let http = require("http");
let url = require("url");
console.log("server");
const server = http.createServer((request,response)=>{
    console.log("server start");
    let pathname=url.parse(request.url).pathname;
    //console.log(pathname);
    pathname = pathname.slice(1);
    //console.log("slice",pathname);
    if(pathname === ""){
        fs.readFile('./index.html',(err,data)=>{
            if(err) console.log("res err ",err);
            else response.end(data);
        });
    }else{
        fs.exists(pathname,(exist)=>{
            console.log(exist);
            if(exist){
                fs.readFile(pathname,(err,data)=>{
                    response.end(data);
                });
            }else{
                response.writeHead(404,'file is not exist',{"Content-Type":'text/html'});
                response.end("<h1>404 Not Found</h1>");
            }
        });
    }
});

server.listen(80);

