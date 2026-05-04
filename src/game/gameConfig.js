import Phaser from 'phaser';

export function gameConfig(parent) {
  class MainScene extends Phaser.Scene {
    constructor() {
      super({ key: 'Main' });
      this.gfx = null;
      this.vx = 180;
    }

    create() {
      const w = this.scale.width;
      const h = this.scale.height;

      this.add.rectangle(w / 2, h / 2, w, h, 0xe8f4e8).setOrigin(0.5);
      this.add.text(20, 18, 'StairGame (Phaser)', { color: '#111', fontSize: '16px', fontFamily: 'sans-serif' });

      const g = this.add.graphics();
      g.fillStyle(0x111111, 1);
      g.fillRoundedRect(10, 10, w - 20, h - 20, 12);
      g.fillStyle(0xffd84d, 1);
      g.fillCircle(60, h / 2, 18);
      this.gfx = g;
    }

    update(_, dt) {
      if (!this.gfx) return;
      const w = this.scale.width;
      const dx = (this.vx * dt) / 1000;
      this.gfx.x += dx;
      if (this.gfx.x > w - 90) this.vx = -Math.abs(this.vx);
      if (this.gfx.x < 0) this.vx = Math.abs(this.vx);
      this.gfx.y = Math.sin(performance.now() / 260) * 18;
    }
  }

  return {
    type: Phaser.AUTO,
    parent,
    width: parent?.clientWidth || 960,
    height: parent?.clientHeight || 340,
    backgroundColor: '#e8f4e8',
    scene: MainScene,
  };
}

