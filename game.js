/** @type {HTMLCanvasElement} */

const canvas = document.getElementById("myCanvas");
canvas.width = 1920/1.5;
canvas.height = 1080/1.5;
canvas.style.border = " 20px double #367e0a";
const ctx = canvas.getContext("2d");

let start = false; /* oyunu başlatmak için */
let gravity = 0.2; /*yer çekimi */
let floor; /* tek bir zeminim bulunduğu için kolaylık olması amacıyla bir değişken ile zeminin seviyesini tutup karakterlerimin zemin üstünde kalmasını sağladım */
let starCounter = 0; /*yıldız sayacı */
let point = 0; /*puan sayacı */
let functionEnder = 0; /* ana karakter ve düşman ilk temas halinden sonra temasın devam ettiğini varsayarsak canın anında bitmesini engellemek için eklediğim değişken */
let burgerCounter = 3; /* burger sayacı */
let burgerController = false; /*burger harcama kontrol değişkeni */
let hourglassController = false; /*kum saati harcama kontrol değişkeni */
let burger30 = false; /*burgerxx adlı değişkenlerim her bir seviyedeki burger sayısının sonsuza kadar artmasını engellemek için */
let burger50 = false;
let burger70 = false;
let burger100 = false;
let burgerAdded = false; /* burgeri bir kere ekleme kontrolü yaptım. aksi taktirde verdiğim sınıra kadar sürekli burger ekliyordu */
let hourglassCounter = 1; /* kum saati sayacı */
let hourglass50 = false; /*hourglassxx adlı değişkenlerim her bir seviyedeki kum saati sayısının sonsuza kadar artmasını engellemek için */
let hourglass70 = false;
let hourglass100 = false;
let isCUsed = false; /* 10, 30, 50, 70, 100 gibi hız arttırma seviyelerinde c tuşu çalışmıyordu. bu değişkeni kullanarak o sorunu çözdüm. */
let finalPoint; /* saniye başına puan vermemin oyun başladığı anda yani 't' tuşuna basıldığı anda başlamasını sağlamak için bu değişkeni ekledim. */
let yildizSure; /* yıldızın yeniden oluşturulması amacıyla oluşturduğum değişken */

let playerImage = new Image();
playerImage.src = "./characters/idleMc.png"; /* ana karakterimizin fotoğrafını ekledim */

let enemyImage = new Image();
enemyImage.src =  "./characters/ufo.png"; /* düşmanın fotoğrafını ekledim. */

let starImage = new Image();
starImage.src = "./images/star.png"; /* yıldızın fotoğrafını ekledim */

class Pictures{ /* can barı gibi fotoğraf tarzı eklediğim özellikleri eklemek ve güncellemek için bir sınıf */
    constructor({position, imageSrc}){
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
    }
    draw() {
        if (!this.image) return;
        ctx.drawImage(this.image, this.position.x, this.position.y);
    }
    update() { /*gerektiği yerlerde güncelleme yapmam için */
        this.draw();
    }
}

class Character{ /* ana karakterimizi oluşturmak ve çizmek için sınıf */

    hp = 3;
    picture = playerImage;

    constructor(position){
        this.position = position;
        this.velocity = {x:0, y:1};
        this.onGround = false; /* double jumpı engellemek için */
    }
    draw(width, height){
        this.width = width;
        this.height = height;
        ctx.drawImage(this.picture, this.position.x, this.position.y, this.width, this.height);
    }
    update(){ /*gerektiği yerlerde güncelleme yapmam için */
        this.draw(490/8.5, 710/8.5);
        
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if (this.position.y + this.height + this.velocity.y < canvas.height - floor){ /* map dışına çıkmasını engellemek için */
            this.velocity.y += gravity;
            this.onGround = false;
        }
        else {
            this.velocity.y = 0;
            this.onGround = true;
        }
        if (this.position.x + this.width + this.velocity.x < canvas.width && this.position.x + this.velocity.x >= 0){ /* map dışına çıkmasını engellemek için */
            this.position.x += this.velocity.x;
        }
        else if (this.position.x < 0){
            keys.a.pressed = false;
        }
        else {
            keys.d.pressed = false;
        }
    }
}


class Enemy{ /* düşmanımızı oluşturmak ve çizmek için sınıf */

    picture = enemyImage;

    constructor(position){
        this.position = position;
        this.velocity = {x:0.75, y:1};
        this.onGround = false; /* double jumpı engellemek için */
    }
    draw(width, height){
        this.width = width;
        this.height = height;
        ctx.drawImage(this.picture, this.position.x, this.position.y, this.width, this.height);
    }
    update(){ /*gerektiği yerlerde güncelleme yapmam için */
        this.draw(380/3, 252/3);
        
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if (this.position.y + this.height + this.velocity.y < canvas.height - floor){ /* map dışına çıkmasını engellemek için */
            this.velocity.y += gravity;
            this.onGround = false;
        }
        else {
            this.velocity.y = 0;
            this.onGround = true;
        }
        if (this.position.x + this.width + this.velocity.x < canvas.width && this.position.x + this.velocity.x > 0){ /* map dışına çıkmasını engellemek için (sağdan) */
            this.position.x += this.velocity.x;
        }
        else {
            this.velocity.x = -this.velocity.x;
        }
    }
}

class Star{ /* toplanacak yıldız nesnesi */

    picture = starImage;

    constructor(position){
        this.position = position;
        this.velocity = {x:0, y:0};
    }
    draw(width, height){
        this.width = width;
        this.height = height;
        ctx.drawImage(this.picture, this.position.x, this.position.y, this.width, this.height);
    }
    update(){ /*gerektiği yerlerde güncelleme yapmam için */
        this.draw(74/2.75, 74/2.75);

        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
    }
}

function pointUpgradeBySecond(){ /* hayatta kalma bonusu olarak oyuncuya 1 puan verdim */
    point++;
    return 0;
}

function starTimer(){ /* haritada rastgele bir x pozisyonunda yıldız oluşmasını sağladım */
    star.position.x = Math.floor(Math.random() * 1000)+100;
}

const player = new Character({x:0, y:800/1.5});
const enemy = new Enemy({x:900, y:800/1.5});
const star = new Star({x:Math.floor(Math.random() * 1000)+100 , y:680/1.5});

const keys = { /*tuşlar için default olarak basılmadı değeri atadım */
    d: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    space: {
        pressed: false,
    },
    x: {
        pressed: false,
    },
    c: {
        pressed: false,
    },
    t:{
        pressed: false,
    }
}



const bground = new Pictures({position:{x:0, y:0}, imageSrc: "./images/gameBackground.png"}); /* arka planı oluşturdum */
let health = new Pictures({position:{x:10/1.5, y:10/1.5}, imageSrc: "./images/h3.png"}); /*can barını oluşturdum */

let finalBackground = new Pictures({position:{x:0, y:0}, imageSrc: "./images/finalBackground.png"});
let deadMc = new Pictures({position:{x:550, y:280/1.5}, imageSrc: "./characters/dead.png"});



function animate(){
    window.requestAnimationFrame(animate);
    ctx.fillStyle = "black";
    ctx.fillRect (0, 0, canvas.width, canvas.height);

    ctx.save();
    bground.update();
    ctx.restore();
    floor = 130/1.5;
    star.update();
    player.update();
    enemy.update();
    health.update();
    ctx.fillStyle = "white";
    ctx.font = "20px Georgia";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "black";
    ctx.fillText("Puan ==>" + point, 1450/1.5, 50/1.5);
    ctx.fillText("Toplanan Yıldız ==>" + starCounter, 1450/1.5, 80/1.5);
    ctx.fillText("Düşmanın Hız Seviyesi ==>" + enemy.velocity.x, 1450/1.5, 110/1.5);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    let burger = new Pictures({position:{x:825/1.5, y:10/1.5}, imageSrc: "./images/Burger.png"}); /*hamburger çizdiricez (can için) */
    burger.update();
    ctx.fillText("==> " + burgerCounter, 885/1.5, 45/1.5);
    let hourglass = new Pictures({position:{x:825/1.5, y:60/1.5}, imageSrc: "./images/hourglass.png"}); /*hamburger çizdiricez (can için) */
    hourglass.update();
    ctx.fillText("==> " + hourglassCounter, 885/1.5, 105/1.5);



    if (player.hp == 3){ /*can 3 iken can barı */
        health = new Pictures({position:{x:10/1.5, y:10/1.5}, imageSrc: "./images/h3.png"});
    }
    else if(player.hp == 2.5){ /*can 2.5 iken can barı */
        health = new Pictures({position:{x:10/1.5, y:10/1.5}, imageSrc: "./images/h2.5.png"});
    }
    else if(player.hp == 2){ /*can 2 iken can barı */
        health = new Pictures({position:{x:10/1.5, y:10/1.5}, imageSrc: "./images/h2.png"});
    }
    else if(player.hp == 1.5){ /*can 1.5 iken can barı */
        health = new Pictures({position:{x:10/1.5, y:10/1.5}, imageSrc: "./images/h1.5.png"});
    }
    else if(player.hp == 1){ /*can 1 iken can barı */
        health = new Pictures({position:{x:10/1.5, y:10/1.5}, imageSrc: "./images/h1.png"});
    }
    else if(player.hp == 0.5){ /*can 0.5 iken can barı */
        health = new Pictures({position:{x:10/1.5, y:10/1.5}, imageSrc: "./images/h0.5.png"});
    }
    else{ /* canlar tükendiğinde oyunun bittiğini belirten ve toplanan yıldızlarla puanı gösteren bir ekran */
        clearInterval(finalPoint);
        finalBackground.update();
        deadMc.update();
        ctx.fillStyle = "white";
        ctx.font = "20px Georgia";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "black";
        ctx.fillText("GAME OVER", 830/1.5, 500/1.5);
        ctx.fillText("Toplam Puanınız ==>" + point, 790/1.5, 540/1.5);
        ctx.fillText("Toplanan Yıldız ==>" + starCounter, 800/1.5, 580/1.5);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        health = new Pictures({position:{x:850/1.5, y:400/1.5}, imageSrc: "./images/h0.png"});
        health.update();
        return 0;
    }
    
    if (player.position.x < star.position.x + star.width &&
        player.position.x + player.width - 5 > star.position.x &&
        player.position.y < star.position.y + star.height &&
        player.position.y + player.height - 5 > star.position.y){ /* yıldız toplama mekaniği */
        star.position.x = Math.floor(Math.random() * 1000)+100;
        starCounter++;
        point += 10; 
        clearInterval(yildizSure);
        yildizSure = setInterval(starTimer, 6000); /* 6 saniyeyi her yıldız toplandığında sıfırlaması için */
    }

    if (player.position.x < enemy.position.x + enemy.width && 
        player.position.x + player.width > enemy.position.x &&
        player.position.y < enemy.position.y + enemy.height &&
        player.position.y + player.height > enemy.position.y) { /* çarpışma algılama mekaniği */
        functionEnder ++;
    }
    else{
        functionEnder = 0;
    }

    if (functionEnder == 1){ /* her bir çarpışmada can 0.5 azalıyor */
        player.hp -= 0.5;
    }
    

    if (keys.x.pressed){ /*x tuşuna basıldığı zaman oyuncunun burgeri varsa burger kullanarak can verilmesi mekaniği ekledim */
        if ( (burgerCounter > 0) && burgerController == true ){
            if (player.hp == 2.5){
                player.hp = 3;
                burgerCounter--;
                burgerController = false;
            }
            else if (player.hp == 2){
                player.hp = 2.5;
                burgerCounter--;
                burgerController = false;
            }
            else if (player.hp == 1.5){
                player.hp = 2;
                burgerCounter--;
                burgerController = false;
            }
            else if (player.hp == 1){
                player.hp = 1.5;
                burgerCounter--;
                burgerController = false;
            }
            else if (player.hp == 0.5){
                player.hp = 1;
                burgerCounter--;
                burgerController = false;
            }
        }
    }

    if (keys.c.pressed){
        if (hourglassCounter != 0){ /* c tuşuna basılınca oyuncunun kum saati varsa düşmanın hızını yavaşlatma mekaniği ekledim */
            isCUsed = true;
            if(enemy.velocity.x > 0){
                enemy.velocity.x = 0.5;
            }
            else{
                enemy.velocity.x = -0.5;
            }
            if (enemy.position.x + enemy.width + enemy.velocity.x < canvas.width && enemy.position.x > 0){ /* map dışına çıkmasını engellemek için (sağdan) */
                enemy.position.x += enemy.velocity.x;
            }
            else {
                enemy.velocity.x = -enemy.velocity.x;
            }
            if((hourglassCounter > 0) && hourglassController == true){
                if(hourglassCounter == 4){
                    hourglassCounter = 3;
                    hourglassController = false;
                }
                else if(hourglassCounter == 3){
                    hourglassCounter = 2;
                    hourglassController = false;
                }
                else if(hourglassCounter == 2){
                    hourglassCounter = 1;
                    hourglassController = false;
                }
                else if(hourglassCounter == 1){
                    hourglassCounter = 0;
                    hourglassController = false;
                }
            }
            setTimeout(function(){ /*düşmanın hızını 5 saniye boyunca yavaşlatması için hızı azalttıktan 5 saniye sonra çalışacak bu fonksiyonu ekledim */
                if(enemy.velocity.x > 0){
                    if(starCounter < 10){
                        enemy.velocity.x = 0.75;
                    }
                    else if((starCounter>=10)&&(starCounter<30)){
                        enemy.velocity.x = 1.25;
                    }
                    else if((starCounter>=30)&&(starCounter<50)){
                        enemy.velocity.x = 1.5;
                    }
                    else if((starCounter>=50)&&(starCounter<70)){
                        enemy.velocity.x = 1.75;
                    }
                    else if((starCounter>=70)&&(starCounter<100)){
                        enemy.velocity.x = 2;
                    }
                    else if(starCounter >= 100){
                        enemy.velocity.x = 2.75;
                    }
                    else{
                        enemy.velocity.x = -2.75;
                    }
                }
                else{
                    if(starCounter < 10){
                        enemy.velocity.x = -0.75;
                    }
                    else if((starCounter>=10)&&(starCounter<30)){
                        enemy.velocity.x = -1.25;
                    }
                    else if((starCounter>=30)&&(starCounter<50)){
                        enemy.velocity.x = -1.5;
                    }
                    else if((starCounter>=50)&&(starCounter<70)){
                        enemy.velocity.x = -1.75;
                    }
                    else if((starCounter>=70)&&(starCounter<100)){
                        enemy.velocity.x = -2;
                    }
                    else if(starCounter >= 100){
                        enemy.velocity.x = -2.75;
                    }
                    else{
                        enemy.velocity.x = 2.75;
                    }
                }
                
                isCUsed = false;
            },5000)
        }
    }
    player.velocity.x = 0;
    if (keys.d.pressed){ 
        player.velocity.x = 1.5;
        playerImage.src = './characters/mcRight.png'; /* karakterim sağa giderken sağa bakması için fotoğrafı güncelledim */
    }
    else if (keys.a.pressed){
        player.velocity.x = -1.5;
        playerImage.src = './characters/mcLeft.png'; /* karakterim sola giderken sola bakması için fotoğrafı güncelledim */
    }
    else if(keys.a.pressed == false && keys.d.pressed == false){
        playerImage.src = './characters/idleMc.png'; /* karakter sağa ya da sola gitmiyorsa düz durması için fotoğrafı güncelledim */
    }
    enemy.position.x += enemy.velocity.x;

    if(enemy.velocity.x > 0){ /* toplanan yıldıza göre seviye seviye düşmanın hızını arttırarak oyunun zorlaşmasını sağladım, x ekseninde gittiğimiz için pozitif ve negatif yönde gitme durumumuza göre ayrı ayrı kontrol ettim, ayrıca burger ve kum saati kontrollerini de yaptım */
        if((starCounter == 10) && isCUsed == false){
            enemy.velocity.x = 1.25;
        }
        else if((starCounter == 30) && isCUsed == false){
            enemy.velocity.x = 1.5;
            if(burger30 == false){
                if(burgerCounter == 3){
                    burgerCounter = 4;
                }
                else if(burgerCounter == 2){
                    burgerCounter = 3;
                }
                else if(burgerCounter == 1){
                    burgerCounter = 2;
                }
                else if(burgerCounter == 0){
                    burgerCounter = 1;
                }
                burger30 = true;
            }
        }
        else if((starCounter == 50) && isCUsed == false){
            enemy.velocity.x = 1.75;
            if(burger50 == false){
                if(burgerCounter == 4){
                    burgerCounter = 5;
                }
                else if(burgerCounter == 3){
                    burgerCounter = 4;
                }
                else if(burgerCounter == 2){
                    burgerCounter = 3;
                }
                else if(burgerCounter == 1){
                    burgerCounter = 2;
                }
                else if(burgerCounter == 0){
                    burgerCounter = 1;
                }
                burger50 = true;
            }
            if(hourglass50 == false){
                if(hourglassCounter == 0 ){
                    hourglassCounter = 1;
                }
                else if(hourglassCounter == 1){
                    hourglassCounter = 2;
                }
                else if(hourglassCounter == 2){
                    hourglassCounter = 3;
                }
                else if(hourglassCounter == 3){
                    hourglassCounter = 4;
                }
                hourglass50 = true;
            }
        }
        else if((starCounter == 70) && isCUsed == false){
            enemy.velocity.x = 2;
            if(burger70 == false){
                if(burgerCounter == 5){
                    burgerCounter = 6;
                }
                else if(burgerCounter == 4){
                    burgerCounter = 5;
                }
                else if(burgerCounter == 3){
                    burgerCounter = 4;
                }
                else if(burgerCounter == 2){
                    burgerCounter = 3;
                }
                else if(burgerCounter == 1){
                    burgerCounter = 2;
                }
                else if(burgerCounter == 0){
                    burgerCounter = 1;
                }
                burger70 = true;   
            }
            if(hourglass70 == false){
                if(hourglassCounter == 0 ){
                    hourglassCounter = 1;
                }
                else if(hourglassCounter == 1){
                    hourglassCounter = 2;
                }
                else if(hourglassCounter == 2){
                    hourglassCounter = 3;
                }
                else if(hourglassCounter == 3){
                    hourglassCounter = 4;
                }
                hourglass70 = true;
            }
        }
        else if((starCounter == 100) && isCUsed == false){
            enemy.velocity.x = 2.75;
            if(burger100 == false){
                if(burgerCounter == 6){
                    burgerCounter = 7;
                }
                else if(burgerCounter == 5){
                    burgerCounter = 6;
                }
                else if(burgerCounter == 4){
                    burgerCounter = 5;
                }
                else if(burgerCounter == 3){
                    burgerCounter = 4;
                }
                else if(burgerCounter == 2){
                    burgerCounter = 3;
                }
                else if(burgerCounter == 1){
                    burgerCounter = 2;
                }
                else if(burgerCounter == 0){
                    burgerCounter = 1;
                }
                burger100 = true;
            }
            if(hourglass100 == false){
                if(hourglassCounter == 0 ){
                    hourglassCounter = 1;
                }
                else if(hourglassCounter == 1){
                    hourglassCounter = 2;
                }
                else if(hourglassCounter == 2){
                    hourglassCounter = 3;
                }
                else if(hourglassCounter == 3){
                    hourglassCounter = 4;
                }
                hourglass100 = true;
            }
        }
    }
    else{
        if((starCounter == 10) && isCUsed == false){
            enemy.velocity.x = -1.25;
        }
        else if((starCounter == 30) && isCUsed == false){
            enemy.velocity.x = -1.5;
            if(burger30 == false){
                if(burgerCounter == 3){
                    burgerCounter = 4;
                }
                else if(burgerCounter == 2){
                    burgerCounter = 3;
                }
                else if(burgerCounter == 1){
                    burgerCounter = 2;
                }
                else if(burgerCounter == 0){
                    burgerCounter = 1;
                }
                burger30 = true;
            }
        }
        else if((starCounter == 50) && isCUsed == false){
            enemy.velocity.x = -1.75;
            if(burger50 == false){ 
                if(burgerCounter == 4){
                    burgerCounter = 5;
                }
                else if(burgerCounter == 3){
                    burgerCounter = 4;
                }
                else if(burgerCounter == 2){
                    burgerCounter = 3;
                }
                else if(burgerCounter == 1){
                    burgerCounter = 2;
                }
                else if(burgerCounter == 0){
                    burgerCounter = 1;
                }
                burger50 = true;
            }
            if(hourglass50 == false){
                if(hourglassCounter == 0 ){
                    hourglassCounter = 1;
                }
                else if(hourglassCounter == 1){
                    hourglassCounter = 2;
                }
                else if(hourglassCounter == 2){
                    hourglassCounter = 3;
                }
                else if(hourglassCounter == 3){
                    hourglassCounter = 4;
                }
                hourglass50 = true;
            }
        }
        else if((starCounter == 70) && isCUsed == false){
            enemy.velocity.x = -2;
            if(burger70 == false){
                if(burgerCounter == 5){
                    burgerCounter = 6;
                }
                else if(burgerCounter == 4){
                    burgerCounter = 5;
                }
                else if(burgerCounter == 3){
                    burgerCounter = 4;
                }
                else if(burgerCounter == 2){
                    burgerCounter = 3;
                }
                else if(burgerCounter == 1){
                    burgerCounter = 2;
                }
                else if(burgerCounter == 0){
                    burgerCounter = 1;
                }
                burger70 = true;
            }
            if(hourglass70 == false){
                if(hourglassCounter == 0 ){
                    hourglassCounter = 1;
                }
                else if(hourglassCounter == 1){
                    hourglassCounter = 2;
                }
                else if(hourglassCounter == 2){
                    hourglassCounter = 3;
                }
                else if(hourglassCounter == 3){
                    hourglassCounter = 4;
                }
                
                hourglass70 = true;
            }
        }
        else if((starCounter == 100) && isCUsed == false){
            enemy.velocity.x = -2.75;
            if(burger100 == false){
                if(burgerCounter == 6){
                    burgerCounter = 7;
                }
                else if(burgerCounter == 5){
                    burgerCounter = 6;
                }
                else if(burgerCounter == 4){
                    burgerCounter = 5;
                }
                else if(burgerCounter == 3){
                    burgerCounter = 4;
                }
                else if(burgerCounter == 2){
                    burgerCounter = 3;
                }
                else if(burgerCounter == 1){
                    burgerCounter = 2;
                }
                else if(burgerCounter == 0){
                    burgerCounter = 1;
                }
                burger100 = true;
            }
            if(hourglass100 == false){
                if(hourglassCounter == 0 ){
                    hourglassCounter = 1;
                }
                else if(hourglassCounter == 1){
                    hourglassCounter = 2;
                }
                else if(hourglassCounter == 2){
                    hourglassCounter = 3;
                }
                else if(hourglassCounter == 3){
                    hourglassCounter = 4;
                }
                hourglass100 = true;
            }
        }
    }
}

canvas.style.backgroundColor = "#384848";
ctx.fillStyle = "white";
ctx.font = "20px Arial";
ctx.fillText("OYUNA BAŞLAMAK İÇİN 'T' VEYA 'S' TUŞUNA BASIN", (canvas.width/3)-40 , (canvas.height/2)-5); // oyun başlamadan önce canvasta gözükecek olan ekran

window.addEventListener("keydown", (event) =>{ /* ana karakterimiz için basılan tuşların algılanması amaçlı event listener */
    let key = event.key;
    if ((key == 't' || key == 'T' || key =='s' || key == 'S') && start == false){
        keys.t.pressed = true;
        animate();
        finalPoint = setInterval(pointUpgradeBySecond, 1000); /* hayatta kalma bonusunun saniyede bir olmasını sağladım */
        yildizSure = setInterval(starTimer, 6000); /* 6 saniyede bir yıldızın yok olup başka yerde oluşturulmasını sağlıyor */
        start = true;
    }
    else{
        if (key == 'd' || key == 'D'){
            keys.d.pressed = true;
        }
        else if (key == 'a' || key == 'A'){
            keys.a.pressed = true;
        }
        else if (key == ' ' && player.onGround){
            player.velocity.y = -8.5;
            event.preventDefault();
        }
        else if (key == 'x' || key == 'X'){
            keys.x.pressed = true;
            burgerController = true;
        }
        else if (key == 'c' || key == 'C'){
            keys.c.pressed = true;
            hourglassController = true;
        }
    }
})

window.addEventListener("keyup", (event) =>{ /* ana karakterimiz için basılan tuşlardan temasın bitmesinin algılanması amaçlı event listener */
    let key = event.key;
    if (key == 'd' || key == 'D'){
        keys.d.pressed = false;
    }
    else if (key == 'a' || key == 'A'){
        keys.a.pressed = false;
    }
    else if (key == 'x'){
        keys.x.pressed = false;
    }
    else if (key == 'c'){
        keys.c.pressed = false;
    }
})

let bilgiButon = document.getElementById("bilgi");
bilgiButon.addEventListener("click", function() {
    this.blur(); // Butonun odaklanmasını kaldır
});

function bilgiVer(){
    
    if((bilgiButon.innerHTML == "")){
        bilgiButon.innerHTML ="<p style='color: white;'>Oyunda sarı saçlı karakter Ryanı canlandıracaksınız. Etrafta çıkan yıldız nesnelerini toplayarak ve aynı zamanda düşman UFOya temas etmeden oldukça fazla puan almaya çalışıyoruz. Hayatta kalınan her saniye başına 1 puan, toplanan yıldız başına ise 10 puan kazanmaktasınız. Sol üstteki kalpler de canınızı temsil etmekte. Orta kısımda da kaç hamburgere ve kaç kum saatine sahip olduğumuz gösteriliyor. Bol Şanslar!</p><ul>Oynanış:<li>A -> Sola ilerleme</li><li> D -> Sağa ilerleme</li><li>Boşluk -> Zıplama</li><li>X -> Hamburger yeme (0.5 can yeniler)</li><li>C -> Kum saati kullanma (Düşmanın hızını 5 saniyeliğine 0.5'e düşürür)</li><li>! Düşmanınız UFO'ya her temas 0.5 can götürmektedir.</li><li>! Her toplanan yıldız 10 puan, her hayatta kalınan saniye 1 puan kazandırmaktadır.</li><li>! 10, 30, 50, 70, 100 toplanan yıldız seviyelerinde düşmanın hızı yükselmektedir.</li><li>! 30 toplanan yıldız seviyesinde 1 burger kazanmaktasınız.</li><li>! 50, 70, 100 toplanan yıldız seviyelerinde 1 burger ve 1 kum saati kazanmaktasınız. </li><li>! Oyunu başlatmak için T veya S tuşuna basabilirsiniz. T veya S tuşuna bastığınızda alttaki canvas alanında oyun başlayacaktır. </li></ul>";
    }
    else{
        bilgiButon.innerHTML = "";
    }
}
