import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';

const StartGame = (parent) => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        width: 400,
        height: 600,
        parent: parent,
        backgroundColor: '#87CEEB',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 },
                debug: false
            }
        },
        scene: [Preloader, MainMenu, Game]
    });
};

export default StartGame;

