const canvas=document.getElementById("gameCanvas"),ctx=canvas.getContext("2d");
const scoreElement=document.getElementById("score"),bestElement=document.getElementById("best");
const startScreen=document.getElementById("startScreen"),gameOverScreen=document.getElementById("gameOverScreen");
const startButton=document.getElementById("startButton"),restartButton=document.getElementById("restartButton");
const finalScore=document.getElementById("finalScore"),finalBest=document.getElementById("finalBest");

let animationId,gameRunning=false,score=0;
let bestScore=Number(localStorage.getItem("uklonyaysyaBest"))||0;
let obstacles=[],obstacleTimer=0,obstacleInterval=65,gameSpeed=3,lastTime=0;
const player={x:0,y:0,width:45,height:45,speed:7};
const keys={left:false,right:false};
bestElement.textContent=bestScore;

function resizeCanvas(){
  const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  player.y=rect.height-75;
  if(player.x===0)player.x=rect.width/2-player.width/2;
  player.x=Math.max(0,Math.min(player.x,rect.width-player.width));
}
window.addEventListener("resize",resizeCanvas);resizeCanvas();

document.addEventListener("keydown",e=>{
  const k=e.key.toLowerCase();
  if(e.key==="ArrowLeft"||k==="a")keys.left=true;
  if(e.key==="ArrowRight"||k==="d")keys.right=true;
  if(e.code==="Space"&&!gameRunning)startGame();
});
document.addEventListener("keyup",e=>{
  const k=e.key.toLowerCase();
  if(e.key==="ArrowLeft"||k==="a")keys.left=false;
  if(e.key==="ArrowRight"||k==="d")keys.right=false;
});

canvas.addEventListener("touchstart",e=>{
  const rect=canvas.getBoundingClientRect(),x=e.touches[0].clientX-rect.left;
  if(x<rect.width/2)keys.left=true;else keys.right=true;
},{passive:true});
canvas.addEventListener("touchend",()=>{keys.left=false;keys.right=false});

function createObstacle(){
  const rect=canvas.getBoundingClientRect(),width=30+Math.random()*50,height=25+Math.random()*40;
  obstacles.push({x:Math.random()*(rect.width-width),y:-height,width,height,speed:gameSpeed+Math.random()*2});
}
function collision(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y}

function update(delta){
  const rect=canvas.getBoundingClientRect();
  if(keys.left)player.x-=player.speed;
  if(keys.right)player.x+=player.speed;
  player.x=Math.max(0,Math.min(player.x,rect.width-player.width));
  obstacleTimer+=delta;
  if(obstacleTimer>=obstacleInterval){
    createObstacle();obstacleTimer=0;obstacleInterval=Math.max(25,obstacleInterval-.5);gameSpeed+=.01;
  }
  for(let i=obstacles.length-1;i>=0;i--){
    const o=obstacles[i];o.y+=o.speed;
    if(collision(player,o)){endGame();return}
    if(o.y>rect.height+100){
      obstacles.splice(i,1);score++;scoreElement.textContent=score;
      if(score>bestScore){bestScore=score;bestElement.textContent=bestScore;localStorage.setItem("uklonyaysyaBest",bestScore)}
    }
  }
}

function draw(){
  const rect=canvas.getBoundingClientRect();
  ctx.clearRect(0,0,rect.width,rect.height);ctx.fillStyle="#080c18";ctx.fillRect(0,0,rect.width,rect.height);
  ctx.strokeStyle="rgba(255,255,255,.04)";ctx.lineWidth=1;
  for(let x=0;x<rect.width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,rect.height);ctx.stroke()}
  for(let y=0;y<rect.height;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(rect.width,y);ctx.stroke()}
  ctx.fillStyle="#4f7cff";ctx.shadowColor="#4f7cff";ctx.shadowBlur=15;
  ctx.fillRect(player.x,player.y,player.width,player.height);ctx.shadowBlur=0;
  ctx.fillStyle="white";ctx.fillRect(player.x+9,player.y+10,7,7);ctx.fillRect(player.x+29,player.y+10,7,7);
  for(const o of obstacles){ctx.fillStyle="#ff4057";ctx.shadowColor="#ff4057";ctx.shadowBlur=12;ctx.fillRect(o.x,o.y,o.width,o.height);ctx.shadowBlur=0}
}

function gameLoop(timestamp){
  if(!gameRunning)return;
  const delta=Math.min((timestamp-lastTime)/16.67,3);lastTime=timestamp;
  update(delta);draw();
  if(gameRunning)animationId=requestAnimationFrame(gameLoop);
}
function startGame(){
  cancelAnimationFrame(animationId);gameRunning=true;score=0;obstacles=[];obstacleTimer=0;obstacleInterval=65;gameSpeed=3;
  scoreElement.textContent="0";startScreen.classList.add("hidden");gameOverScreen.classList.add("hidden");
  const rect=canvas.getBoundingClientRect();player.x=rect.width/2-player.width/2;player.y=rect.height-75;
  lastTime=performance.now();animationId=requestAnimationFrame(gameLoop);
}
function endGame(){
  gameRunning=false;cancelAnimationFrame(animationId);finalScore.textContent=score;finalBest.textContent=bestScore;gameOverScreen.classList.remove("hidden");
}
startButton.addEventListener("click",startGame);restartButton.addEventListener("click",startGame);
draw();
