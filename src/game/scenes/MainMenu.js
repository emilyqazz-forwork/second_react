import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
export class MainMenu extends Scene {
    constructor() { super('MainMenu'); }
    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.add.text(w/2, h/2-50, 'Infinite Stairs', { fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff', stroke: '#000000', strokeThickness: 8 }).setOrigin(0.5);
        const t = this.add.text(w/2, h/2+50, 'Click to Start', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' }).setOrigin(0.5);
        this.tweens.add({ targets: t, alpha: 0.2, duration: 800, ease: 'Power1', yoyo: true, repeat: -1 });
        this.input.once('pointerdown', () => { this.scene.start('Game'); });
        EventBus.emit('current-scene-ready', this);
    }
}

