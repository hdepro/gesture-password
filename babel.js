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
let url = require("url");

const server = http.createServer((request,response)=>{
    let pathname=url.parse(request.url).pathname;
    console.log(pathname);
    pathname = pathname.slice(1);
    console.log("slice",pathname);
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
                    setTimeout(function(){response.end(data)},5000);
                });
            }else{
                response.writeHead(404,'file is not exist',{"Content-Type":'text/html'});
                response.end("<h1>404 Not Found</h1>");
            }
        });
    }
});

server.listen(80);

