import Phaser, { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.score = 0;
        this.highestY = 0;
        this.stairsClimbed = 0;
        this.lastQuizStair = 0;

        this.cameras.main.setBounds(0, -Infinity, 400, Infinity);
        this.physics.world.setBounds(0, -Infinity, 400, Infinity);

        this.platforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        this.createPlatform(200, 550);
        for (let i = 0; i < 10; i++) {
            this.spawnPlatform(450 - (i * 100));
        }

        this.player = this.physics.add.sprite(200, 500, 'player');
        this.player.setScale(0.1);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(false);

        this.physics.add.collider(this.player, this.platforms, this.handlePlatformCollision, (player, platform) => {
            return player.body.velocity.y >= 0;
        }, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        EventBus.on('quiz-correct', () => {
            if (this.scene) this.scene.resume('Game');
        }, this);
        EventBus.on('quiz-incorrect', this.triggerGameOver, this);

        EventBus.emit('current-scene-ready', this);
    }

    createPlatform(x, y) {
        const platform = this.platforms.create(x, y, 'platform');
        platform.stairIndex = this.stairsClimbed++;
        return platform;
    }

    spawnPlatform(y) {
        const x = Phaser.Math.Between(50, 350);
        this.createPlatform(x, y);
    }

    handlePlatformCollision(player, platform) {
        player.setVelocityY(-550);
        if (platform.stairIndex > this.score) {
            this.score = platform.stairIndex;
            EventBus.emit('score-updated', this.score);
            if (this.score % 10 === 0 && this.score > this.lastQuizStair) {
                this.lastQuizStair = this.score;
                this.time.delayedCall(100, () => {
                    if (this.scene) {
                        this.scene.pause();
                        EventBus.emit('show-quiz');
                    }
                });
            }
        }
    }

    update() {
        if (this.player.x < 0) this.player.x = 400;
        else if (this.player.x > 400) this.player.x = 0;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.player.y < this.cameras.main.scrollY + 300) {
            this.cameras.main.scrollY = this.player.y - 300;
        }

        const highestPlatformY = this.getHighestPlatformY();
        if (highestPlatformY > this.cameras.main.scrollY - 100) {
            this.spawnPlatform(highestPlatformY - Phaser.Math.Between(80, 120));
        }

        this.platforms.getChildren().forEach(platform => {
            if (platform.y > this.cameras.main.scrollY + 600) {
                platform.destroy();
            }
        });

        if (this.player.y > this.cameras.main.scrollY + 600) {
            this.triggerGameOver();
        }
    }

    getHighestPlatformY() {
        let min = Infinity;
        this.platforms.getChildren().forEach(platform => {
            if (platform.y < min) min = platform.y;
        });
        return min === Infinity ? 0 : min;
    }

    triggerGameOver() {
        if (this.scene) {
            this.scene.pause();
            EventBus.emit('game-over');
        }
    }

    shutdown() {
        EventBus.removeListener('quiz-correct');
        EventBus.removeListener('quiz-incorrect');
    }
}

