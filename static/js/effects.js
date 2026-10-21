/**
 * ✨ Модуль спецэффектов: частицы, конфетти, свечение
 */

(function () {
    'use strict';

    // ============ КАНВАС ЧАСТИЦ ============
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Звёздные частицы
    class Star {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedY = Math.random() * 0.5 + 0.1;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.twinkleSpeed = Math.random() * 0.03 + 0.01;
            this.twinkleOffset = Math.random() * Math.PI * 2;
            this.color = Math.random() > 0.7 ?
                `rgba(240, 165, 0, ${this.opacity})` :
                `rgba(255, 255, 255, ${this.opacity})`;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.twinkleOffset += this.twinkleSpeed;

            if (this.y > canvas.height) {
                this.y = -10;
                this.x = Math.random() * canvas.width;
            }
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
        }

        draw() {
            const twinkle = Math.sin(this.twinkleOffset) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * twinkle, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // Свечение
            if (this.size > 1.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(240, 165, 0, ${twinkle * 0.1})`;
                ctx.fill();
            }
        }
    }

    const STAR_COUNT = window.innerWidth < 768 ? 50 : 120;
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }

    // Медовые капли
    class HoneyDrop {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.size = Math.random() * 6 + 3;
            this.speed = Math.random() * 2 + 0.5;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
            this.opacity = Math.random() * 0.3 + 0.1;
        }

        update() {
            this.y += this.speed;
            this.wobble += this.wobbleSpeed;
            this.x += Math.sin(this.wobble) * 0.5;

            if (this.y > canvas.height + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.beginPath();

            // Форма капли
            ctx.moveTo(this.x, this.y - this.size);
            ctx.bezierCurveTo(
                this.x + this.size, this.y - this.size * 0.5,
                this.x + this.size * 0.7, this.y + this.size * 0.5,
                this.x, this.y + this.size
            );
            ctx.bezierCurveTo(
                this.x - this.size * 0.7, this.y + this.size * 0.5,
                this.x - this.size, this.y - this.size * 0.5,
                this.x, this.y - this.size
            );

            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );
            gradient.addColorStop(0, `rgba(255, 200, 50, ${this.opacity})`);
            gradient.addColorStop(1, `rgba(200, 140, 0, ${this.opacity * 0.5})`);

            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
        }
    }

    const DROP_COUNT = window.innerWidth < 768 ? 8 : 20;
    const drops = [];
    for (let i = 0; i < DROP_COUNT; i++) {
        const drop = new HoneyDrop();
        drop.y = Math.random() * canvas.height; // Начальное распределение
        drops.push(drop);
    }

    // Мышиные частицы
    let mouseParticles = [];
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Создаём частицу при движении мыши
        if (Math.random() > 0.6) {
            mouseParticles.push({
                x: mouseX + (Math.random() - 0.5) * 20,
                y: mouseY + (Math.random() - 0.5) * 20,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 3,
                speedY: (Math.random() - 0.5) * 3 - 1,
                life: 1,
                decay: Math.random() * 0.03 + 0.01,
                color: Math.random() > 0.5 ? [240, 165, 0] : [255, 215, 0]
            });
        }
    });

    // Конфетти при клике
    document.addEventListener('click', (e) => {
        for (let i = 0; i < 30; i++) {
            mouseParticles.push({
                x: e.clientX,
                y: e.clientY,
                size: Math.random() * 6 + 2,
                speedX: (Math.random() - 0.5) * 12,
                speedY: (Math.random() - 0.5) * 12 - 3,
                life: 1,
                decay: Math.random() * 0.015 + 0.005,
                color: [
                    [240, 165, 0],
                    [255, 107, 107],
                    [78, 205, 196],
                    [255, 215, 0],
                    [255, 150, 50]
                ][Math.floor(Math.random() * 5)],
                gravity: 0.15,
                isConfetti: true
            });
        }
    });

    // Главный цикл рендеринга
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Звёзды
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        // Медовые капли
        drops.forEach(drop => {
            drop.update();
            drop.draw();
        });

        // Мышиные частицы
        mouseParticles = mouseParticles.filter(p => p.life > 0);
        mouseParticles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= p.decay;

            if (p.gravity) {
                p.speedY += p.gravity;
            }

            if (p.isConfetti) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.speedX * 0.5);
                ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.life})`;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.life})`;
                ctx.fill();
            }
        });

        requestAnimationFrame(render);
    }

    render();

    // ============ ПЕРИОДИЧЕСКИЕ ЭФФЕКТЫ ============

    // Волна пчёл каждые 15 секунд
    function beeWave() {
        const waveContainer = document.getElementById('bees-container');
        const beeCount = window.innerWidth < 768 ? 5 : 10;

        for (let i = 0; i < beeCount; i++) {
            setTimeout(() => {
                const bee = document.createElement('div');
                bee.classList.add('flying-bee');
                bee.textContent = '🐝';
                bee.style.fontSize = `${Math.random() * 2 + 1.5}rem`;
                bee.style.left = '-50px';
                bee.style.top = `${Math.random() * window.innerHeight}px`;
                bee.style.transition = 'none';
                waveContainer.appendChild(bee);

                let posX = -50;
                const posY = parseFloat(bee.style.top);
                const speed = Math.random() * 5 + 3;
                let time = 0;

                function moveBee() {
                    posX += speed;
                    time += 0.05;
                    const wobbleY = Math.sin(time * 3) * 30;
                    bee.style.transform = `translate(${posX}px, ${wobbleY}px) scaleX(1)`;

                    if (posX < window.innerWidth + 100) {
                        requestAnimationFrame(moveBee);
                    } else {
                        bee.remove();
                    }
                }

                moveBee();
            }, i * 200);
        }
    }

    setInterval(beeWave, 15000);
    setTimeout(beeWave, 3000); // Первая волна через 3 секунды

    // Экспорт для других модулей
    window.spawnConfetti = function (x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            mouseParticles.push({
                x: x,
                y: y,
                size: Math.random() * 8 + 2,
                speedX: (Math.random() - 0.5) * 15,
                speedY: (Math.random() - 0.5) * 15 - 5,
                life: 1,
                decay: Math.random() * 0.01 + 0.005,
                color: [
                    [240, 165, 0],
                    [255, 107, 107],
                    [78, 205, 196],
                    [255, 215, 0],
                    [255, 150, 50],
                    [150, 100, 255]
                ][Math.floor(Math.random() * 6)],
                gravity: 0.12,
                isConfetti: true
            });
        }
    };

})();