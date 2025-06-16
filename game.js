const config = {
  type: Phaser.AUTO,
  width: 1152,
  height: 768,
  physics: { default:'arcade', arcade:{ debug:false } },
  scene: { preload, create, update }
};
new Phaser.Game(config);

let player, cursors, items=[], dropZones=[], carrying=[], score=0, timer=60;
let scoreText, timerText;

function preload(){
  this.load.image('bg','assets/background.png');
  this.load.image('box','assets/kit_box.png');
  for(let i=1;i<=5;i++){
    this.load.image(`item${i}`,`assets/kitting_item${i}.png`);
  }
  this.load.spritesheet('player','assets/wallace_employee_walk.png',{ frameWidth:64, frameHeight:64 });
  this.load.image('idle','assets/wallace_employee_idle.png');
}

function create(){
  this.add.image(576,384,'bg');
  player = this.physics.add.sprite(576,700,'idle').setScale(1);
  player.setCollideWorldBounds(true);
  this.anims.create({
    key:'walk', frames:this.anims.generateFrameNumbers('player',{start:0,end:3}),
    frameRate:8, repeat:-1
  });
  cursors = this.input.keyboard.createCursorKeys();
  const positions = [200,350,500,650,800];
  positions.forEach((x,i)=>{
    let itm = this.physics.add.image(x,480,`item${i+1}`);
    itm.setData('type',`item${i+1}`);
    items.push(itm);
  });
  [300,576,852].forEach((x,i)=>{
    let box = this.physics.add.image(x,200,'box');
    box.setData('type',`item${i+1}`);
    dropZones.push(box);
  });
  scoreText = this.add.text(16,16,'Jobs Done: 0',{ fontSize:'24px', fill:'#fff' });
  timerText = this.add.text(960,16,`Time: ${timer}`,{ fontSize:'24px', fill:'#fff' });
  this.time.addEvent({
    delay:1000, loop:true, callback:()=>{
      timer--;
      timerText.setText(`Time: ${timer}`);
      if(timer<=0){
        this.scene.pause();
        this.add.text(450,360,'Shift Over!',{fontSize:'48px',fill:'#ff0'});
      }
    }
  });
}

function update(){
  player.setVelocity(0);
  if(cursors.left.isDown) player.setVelocityX(-200);
  if(cursors.right.isDown) player.setVelocityX(200);
  if(cursors.up.isDown) player.setVelocityY(-200);
  if(cursors.down.isDown) player.setVelocityY(200);
  if(player.body.velocity.x||player.body.velocity.y) player.anims.play('walk',true);
  else player.anims.stop(), player.setTexture('idle');
  items.forEach((itm,idx)=>{
    if(Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(),itm.getBounds())){
      carrying.push(itm.getData('type'));
      itm.destroy();
      items.splice(idx,1);
    }
  });
  dropZones.forEach(z=>{
    if(Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(),z.getBounds())){
      const type = z.getData('type');
      if(carrying.includes(type)){
        score++;
        scoreText.setText(`Jobs Done: ${score}`);
        carrying = [];
      }
    }
  });
}
