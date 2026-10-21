/**
 * 🐝 Модуль летающих пчёл из эмодзи
 * Создаёт пчёл, которые хаотично летают по экрану
 */

(function () {
    'use strict';

    const BEE_EMOJIS = ['🐝', '🐝', '🐝', '🐝', '🐝', '🐝', '🐝', '🐝', '🐝', '🐝', '🍯', '🌸', '🌻'];
    const BEE_COUNT = window.innerWidth < 768 ? 12 : 25;
    const container = document.getElementById('bees-container');

    class FlyingBee {
        constructor() {
            this.element = document.createElement('div');
            this.element.classList.add('flying-bee');
            this.element.textContent = BEE_EMOJIS[Math.floor(Math.random() * BEE_EMOJIS.length)];

            // Начальная позиция
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;

            // Скорость
            this.speedX = (Math.random() - 0.5) * 3;
            this.speedY = (Math.random() - 0.5) * 3;

            // Параметры движения
            this.wobbleSpeed = Math.random() * 0.05 + 0.02;
            this.wobbleAmount = Math.random() * 30 + 10;
            this.time = Math.random() * Math.PI * 2;
            this.size = Math.random() * 1.5 + 0.8;

            this.element.style.fontSize = `${this.size}rem`;
            this.element.style.opacity = Math.random() * 0.5 + 0.5;

            container.appendChild(this.element);
        }

        update() {
            this.time += this.wobbleSpeed;

            // Волнообразное движение
            this.x += this.speedX + Math.sin(this.time) * 0.5;
            this.y += this.speedY + Math.cos(this.time * 0.7) * 0.5;

            // Границы экрана — перенос на другую сторону
            if (this.x > window.innerWidth + 50) this.x = -50;
            if (this.x < -50) this.x = window.innerWidth + 50;
            if (this.y > window.innerHeight + 50) this.y = -50;
            if (this.y < -50) this.y = window.innerHeight + 50;

            // Поворот в сторону движения
            const angle = Math.atan2(this.speedY, this.speedX) * (180 / Math.PI);
            const wobble = Math.sin(this.time * 3) * 15;

            this.element.style.transform =
                `translate(${this.x}px, ${this.y}px) rotate(${angle + wobble}deg) scaleX(${this.speedX > 0 ? 1 : -1})`;
        }

        // Пчела пугается курсора
        fleeFrom(mx, my, radius = 150) {
            const dx = this.x - mx;
            const dy = this.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius && dist > 0) {
                const force = (radius - dist) / radius;
                this.speedX += (dx / dist) * force * 0.8;
                this.speedY += (dy / dist) * force * 0.8;
            }

            // Затухание скорости
            this.speedX *= 0.99;
            this.speedY *= 0.99;

            // Ограничение скорости
            const maxSpeed = 4;
            const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (speed > maxSpeed) {
                this.speedX = (this.speedX / speed) * maxSpeed;
                this.speedY = (this.speedY / speed) * maxSpeed;
            }

            // Минимальная скорость
            if (speed < 0.3) {
                this.speedX += (Math.random() - 0.5) * 0.5;
                this.speedY += (Math.random() - 0.5) * 0.5;
            }
        }
    }

    // Создаём пчёл
    const bees = [];
    for (let i = 0; i < BEE_COUNT; i++) {
        bees.push(new FlyingBee());
    }

    // Позиция мыши
    let mouseX = -1000;
    let mouseY = -1000;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('touchmove', (e) => {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    });

    // Анимационный цикл
    function animate() {
        bees.forEach(bee => {
            bee.fleeFrom(mouseX, mouseY);
            bee.update();
        });
        requestAnimationFrame(animate);
    }

    animate();

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        bees.forEach(bee => {
            if (bee.x > window.innerWidth) bee.x = window.innerWidth * Math.random();
            if (bee.y > window.innerHeight) bee.y = window.innerHeight * Math.random();
        });
    });

    // Экспортируем для использования в других модулях
    window.flyingBees = bees;

})();