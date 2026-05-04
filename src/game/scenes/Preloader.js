import { Scene } from 'phaser';
export class Preloader extends Scene {
    constructor() { super('Preloader'); }
    preload() {
        const g = this.make.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 80, 15);
        g.generateTexture('platform', 80, 15);
        g.clear();
        this.load.image('player', '/chick.png');
    }
    create() { this.scene.start('MainMenu'); }
}

