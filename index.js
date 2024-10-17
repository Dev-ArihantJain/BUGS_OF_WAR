
var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


var c = canvas.getContext('2d');


//variables
var mouse ={
    x:100,
    y:300
}

var colorArray = [
    '#078C03',
    '#067302',
    '#044002',
    '#062601',
    '#52BF04',
    '#04D939'
]


//event listeners
window.addEventListener('mousemove',
    function(e){
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }
)

window.addEventListener('resize',
    function(){
        canvas.width=window.innerWidth
        canvas.height=window.innerHeight
    }  
)


//utility function

function randomIntFromRange(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function randomColor(color){
    return color[Math.floor(Math.random()*color.length)];
}

//calc the distance first
function getDistance(x1,x2,y1,y2){
    let xDistance = x2-x1;
    let yDistance = y2-y1;

    return Math.sqrt(Math.pow(xDistance,2)+Math.pow(yDistance,2));
}

// selectors
const scoreElement = document.querySelector('#score');
const startButtonElement = document.querySelector('#startBtn');
const overlayElement = document.querySelector('#overlay');
const totalScoreElement = document.querySelector('#totalScore');
const healthElement = document.querySelector('#health');






let bulletArray = [];
let EnemyArray = [];
let splashParticleArray = [];


function init(){
 player = new Player(
        innerWidth/2,
        innerHeight/2,
        20,
        'red',)
 bulletArray = [];
 EnemyArray = [];
 splashParticleArray = [];
 score =0;
 scoreElement.innerHTML = "Score = 0";
 addAutoFire();
 }

// objects and classes
class Player {
    constructor(x,y,radius,color){
        this.x =x
        this.y =y
        this.radius =radius
        this.color =color
        this.velocity = {
            x:0,
            y:0}
        this.speed = 2
        this.leg=1
        this.leg_dir=1
    }

    draw (){
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.strokeStyle ='black'
        c.stroke();
        c.fillStyle = this.color
        c.fill();
        c.closePath();
    }

    update (){
        this.x += this.velocity.x *this.speed;
        this.y += this.velocity.y *this.speed;

        if(this.velocity.x !==0 || this.velocity.y !==0){
            this.speed = 2
        }else{
            this.speed = 0
        }

        this.leg += this.speed / 2 * this.leg_dir;
        if (this.leg < -5) this.leg_dir = 1;
        else if (this.leg > 5) this.leg_dir = -1;

        this.draw();
    }

}


class Bullet {
    constructor(x,y,radius,color,angle){
        this.x =x
        this.y =y
        this.radius =radius
        this.color =color
        this.velocity = {
            x:Math.cos(angle)*5,
            y:Math.sin(angle)*5} 
    }


    draw (){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = 'black';
        c.fill();
        c.closePath();

        c.save();
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(this.x - this.velocity.x *2, this.y - this.velocity.y*2);
        c.lineWidth = this.radius * 2;
        c.strokeStyle = 'black';
        c.stroke();
        c.closePath();
        c.restore();
    }

    update (){

        this.x += (this.velocity.x) 
        this.y += (this.velocity.y) 
    
        if(this.y - this.radius > innerHeight || this.y + this.radius < 0 || this.x - this.radius > innerWidth || this.x + this.radius < 0){
                
            setTimeout(() => {
                bulletArray.splice(bulletArray.indexOf(this),1)
            }, 0);

        }       
        
        this.draw();
    }

}



class Enemy {
    constructor(x,y,radius,color,angle){
        this.x =x
        this.y =y
        this.radius =radius
        this.color =color
        this.velocity = {
            x:Math.cos(angle),
            y:Math.sin(angle)} 
        this.s= 20
    }


    draw (){
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.strokeStyle ='black'
        c.stroke();
        c.fillStyle = this.color
        c.fill();
        c.closePath();


        let a = Math.atan2(player.y - this.y, player.x - this.x);
        c.beginPath();
        c.lineWidth = this.radius / 15;
        c.fillStyle = "rgb(150, 0, 0)";
        for (let x = -1; x <= 1; x += 2) {
          c.save();
          c.beginPath();
          c.arc(this.x + Math.cos(a + x * 30 * Math.PI / 180) * this.radius , this.y + Math.sin(a + x * 30 * Math.PI / 180) * this.radius , this.radius / 3, 0, 2 * Math.PI);
          c.fill();
          c.stroke();
          c.restore();
        }
    }

    update (){

        this.angle = Math.atan2(this.y-player.y,this.x-player.x);
        this.velocity = {
            x:Math.cos(this.angle)*Math.min((score/50 + 1),2),
            y:Math.sin(this.angle)*Math.min((score/50 + 1),2)} 

        this.x += -(this.velocity.x)
        this.y += -(this.velocity.y)
        
        this.draw();
    }

}


class SplashParticle {
    constructor(x,y,radius,color,velocity){
        this.x =x
        this.y =y
        this.radius =radius
        this.color =color
        this.velocity = velocity
        this.alpha = 1
    }


    draw (){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.strokeStyle ='black'
        c.stroke();
        c.fillStyle = this.color
        c.fill();
        c.closePath();
        c.restore()
    }

    update (){

        this.x += -(this.velocity.x)
        this.y += (-this.velocity.y)
        this.alpha -= 0.01
        this.velocity.x *= 0.99
        this.velocity.y *= 0.99
        
        this.draw();
    }

}


// helping variables
let animationId;
let spawnIntervalId;
let score =0;

let throttleTimeout = null;
const throttleInterval = 200; 

let health = 3;

let isAutoFiring = false; // Auto-fire state
let fireRate = 200; // Fire rate in milliseconds
let lastFired = 0; // Last fired time


//initialization


let player = new Player(
    innerWidth/2,
    innerHeight/2,
    20,
    'red',)

function spawnEnemy (){
    spawnIntervalId = setInterval(()=>{
        const radius = Math.random()*10+20;
        let x , y;
        
        if(Math.random()<0.5){
            x = Math.random()<0.5 ? 0-radius : innerWidth+radius;
            y = Math.random()*innerHeight
        }else{
            y = Math.random()<0.5 ? 0-radius : innerHeight+radius;
            x = Math.random()*innerWidth
        }
        const color = randomColor(colorArray);
        let angle = Math.atan2(y-player.y,x-player.x)    


        EnemyArray.push(new Enemy(
            x,
            y,
            radius,
            color,
            angle
        ))

    },1000)

}


function addAutoFire() {
    // autoFire event listener for starting/stopping auto-fire
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') { // Space bar for auto-fire toggle
            isAutoFiring = !isAutoFiring; // Toggle auto-fire
        }
    });
}

function autoFire(currentTime) {
    if (isAutoFiring && currentTime - lastFired > fireRate) {
        fire();
        lastFired = currentTime; // Update last fired time
    }
}


function fire() {
    let angle = Math.atan2(mouse.y-player.y,mouse.x-player.x)    
    const bullet = new Bullet(
        player.x,
        player.y,
        3,
        'blue',
        angle
    )
  bulletArray.push(bullet);

}


// animation
function animationLoop(){
    animationId = requestAnimationFrame(animationLoop);  // request animation frame

    const currentTime = Date.now();
    autoFire(currentTime);

    c.clearRect(0,0,innerWidth,innerHeight);

    bulletArray.forEach(bullet => {                     // update and draw bullet
        bullet.update();
    });

    let p = player;
    let a = Math.atan2(mouse.y - p.y, mouse.x - p.x);

    for (let x = -1; x <= 1; x += 2) {                    // draw player
        c.beginPath();
        c.lineWidth = p.radius / 10;
        c.strokeStyle ="black";
        c.fillStyle = "rgb(150, 100, 50)";
        c.arc(p.x + p.radius * Math.cos(a + x * 30 * Math.PI / 180) 
        + x * p.leg * 0.7*
        Math.cos(a), p.y + p.radius * Math.sin(a + x * 30 * Math.PI / 180) 
        + x * p.leg * 0.7* 
        Math.sin(a), p.radius / 3, 0, 2 * Math.PI);
        c.fill();
        c.stroke();
      }

      c.save();
      c.beginPath();
      c.lineWidth = p.radius / 2 *0.8;
      c.strokeStyle = "rgb(255, 0, 0)";
      c.moveTo(p.x , p.y);
      c.lineTo(p.x + Math.cos(a) *2* p.radius, p.y +
      Math.sin(a)*2* p.radius);
      c.stroke();
      c.restore();

      player.update();    

      for (let x = -1; x <= 1; x += 2) {                              // draw enemy
        c.beginPath();
        c.fillStyle = "white";
        c.strokeStyle = "black";
        c.arc(p.x + Math.cos(a + x * 35 * Math.PI / 180) * p.radius / 2, p.y + 
        Math.sin(a + x * 35 * Math.PI / 180) * p.radius / 2, p.radius / 4, 0, 2 * Math.PI);
        c.fill();
        c.stroke();
        c.beginPath();
        c.fillStyle = "black";
        c.arc(p.x + Math.cos(a + x * 35 * Math.PI / 180) * p.radius / 2 + 
        Math.cos(a) * p.radius / 8, p.y + Math.sin(a + x * 35 * Math.PI / 180) * p.radius / 2 + 
        Math.sin(a) * p.radius / 8, p.radius / 8, 0, 2 * Math.PI);
        c.fill();
      }

      EnemyArray.forEach((Enemy,index) => {
        Enemy.update();

        const dist = Math.hypot(Enemy.x - player.x, Enemy.y - player.y);                // collision detection

        if(dist - Enemy.radius - player.radius < 1){
            if(health === 1){
                health = 0;
            healthElement.innerHTML = "Health = " + health;
            cancelAnimationFrame(animationId);
            overlayElement.style.display = "flex";
            totalScoreElement.innerHTML = score;
            clearInterval(spawnIntervalId);}
            else{
                setTimeout(()=>{
                    health--;
                    EnemyArray.splice(index,1);
                    healthElement.innerHTML = "Health = " + health;
                    
                },0)
            }
        }

        bulletArray.forEach((bullet,bulletIndex) => {                                               // collision detection with bullet
            const dist = Math.hypot(bullet.x - Enemy.x, bullet.y - Enemy.y);
            if(dist - bullet.radius - Enemy.radius < 1){

                score +=10;
                scoreElement.innerHTML =  "Score = " + score;

                for( let i =0 ; i<10;i++){
                        splashParticleArray.push(new SplashParticle(
                            Enemy.x,Enemy.y,
                            Math.random()*2,
                            Enemy.color,
                            {
                                x:Math.random()-0.5 *Math.random()*5 ,
                                y:Math.random()-0.5 *Math.random()*5
                            }
                        )
                    );
                }

                if(Enemy.radius - 10 > 10){
                    gsap.to(Enemy,{
                        radius: Enemy.radius - 10
                    })
                    setTimeout(()=>{
                        bulletArray.splice(bulletIndex,1);
                    },0)
                }else{
                    score +=20;
                    scoreElement.innerHTML = "Score = " + score;
                    setTimeout(()=>{
                        EnemyArray.splice(index,1);
                        bulletArray.splice(bulletIndex,1);
                    },0)
                }
                // have to put under a callback function other wise all enemies will be blinked up for a period of time
            }
        })


      });



      splashParticleArray.forEach((particle,index) => {                                         // update splash particles
          if(particle.alpha <=0.1){
                  splashParticleArray.splice(index,1);
            }
            else{
                particle.update();
            }
      });


    }


// listeners


window.addEventListener('click',(e)=>{

    if (!throttleTimeout && !isAutoFiring) {
        
        // event throttling
        let angle = Math.atan2(mouse.y-player.y,mouse.x-player.x)    
        const bullet = new Bullet(
            player.x,
            player.y,
            3,
            'blue',
            angle
        )
      bulletArray.push(bullet);

        throttleTimeout = setTimeout(() => {     
              throttleTimeout = null;
            }, throttleInterval);
          }
})



// let keys = {};
// window.addEventListener('keydown', function (e) {
//     keys[e.code] = true;
//     console.log(keys)
//     if (keys['ArrowUp'] || keys['KeyW']) {
//         player.velocity.y = -5;
//     }
//     if (keys['ArrowDown'] || keys['KeyS'] ) {
//         player.velocity.y = 5;
//     }
//     if (keys['ArrowLeft'] || keys['KeyA']) {
//         player.velocity.x = -5;
//     }
//     if (keys['ArrowRight'] || keys['KeyD']) {
//         player.velocity.x = 5;
//     }
// });

// window.addEventListener('keyup', function (e) {
//     delete keys[e.code];
//     if (!keys['ArrowUp'] && !keys['ArrowDown'] && !keys['KeyW'] && !keys['KeyS'] ) {
//         player.velocity.y = 0;
//     }
//     if (!keys['ArrowLeft'] && !keys['ArrowRight'] && !keys['KeyA'] && !keys['KeyD'] ) {
//         player.velocity.x = 0;
//     }
// });

                                                                                            //OR

window.addEventListener('keydown', (event) => {
    switch (event.key ) {
        case 'ArrowUp': 
        case  'w':
            player.velocity.y = -1;
            break;
        case 'ArrowDown':
        case 's':

            player.velocity.y = 1;
            break;
        case 'ArrowLeft':
        case 'a':

            player.velocity.x = -1;
            break;
        case 'ArrowRight':
        case  'd':

            player.velocity.x = 1;
            break;
    }

}); 

window.addEventListener('keyup', (event) => {
console.log(event.key )
    switch (event.key ) {
        case 'ArrowUp': 
        case  'w':
  
        case 'ArrowDown':
        case 's':
            player.velocity.y = 0;
            break;
        case 'ArrowLeft':
        case 'a':

        case 'ArrowRight':
        case  'd':

            player.velocity.x = 0;
            break;

    }

});





startButtonElement.addEventListener('click',()=>{
    init()
    animationLoop();
    spawnEnemy();
    overlayElement.style.display = "none";
    health=3;
    healthElement.innerHTML = "Health = " + health;
})