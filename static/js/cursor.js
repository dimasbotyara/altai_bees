/**
 * 🎯 Модуль кастомного курсора с хвостом из эмодзи
 */

(function () {
    'use strict';

    // Не показывать на мобильных
    if ('ontouchstart' in window && window.innerWidth < 768) return;

    const TRAIL_LENGTH = 15;
    const TRAIL_EMOJIS = ['🍯', '✨', '⭐', '🌟', '💛', '🐝', '🌸'];
    const cursorContainer = document.getElementById('cursor-trail');

    // Основной курсор
    const mainCursor = document.createElement('div');
    mainCursor.classList.add('custom-cursor');
    mainCursor.textContent = '🐝';
    document.body.appendChild(mainCursor);

    // Частицы хвоста
    class TrailParticle {
        constructor(index) {
            this.element = document.createElement('div');
            this.element.classList.add('cursor-dot');
            this.element.textContent = TRAIL_EMOJIS[index % TRAIL_EMOJIS.length];
            this.element.style.fontSize = `${1.2 - index * 0.06}rem`;
            cursorContainer.appendChild(this.element);

            this.x = 0;
            this.y = 0;
            this.targetX = 0;
            this.targetY = 0;
            this.delay = index * 3;
        }

        update(targetX, targetY) {
            this.targetX = targetX;
            this.targetY = targetY;

            // Плавное следование с задержкой
            this.x += (this.targetX - this.x) * (0.15 - this.delay * 0.005);
            this.y += (this.targetY - this.y) * (0.15 - this.delay * 0.005);

            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            this.element.style.opacity = 1 - (this.delay / (TRAIL_LENGTH * 3)) * 0.8;
        }
    }

    const trail = [];
    for (let i = 0; i < TRAIL_LENGTH; i++) {
        trail.push(new TrailParticle(i));
    }

    let cursorX = 0;
    let cursorY = 0;
    let isMoving = false;
    let moveTimeout;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        isMoving = true;

        mainCursor.style.left = cursorX + 'px';
        mainCursor.style.top = cursorY + 'px';
        mainCursor.style.transform = 'translate(-50%, -50%) scale(1.2)';

        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
            isMoving = false;
            mainCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
    });

    // Клик-эффект
    document.addEventListener('mousedown', () => {
        mainCursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        mainCursor.textContent = '💥';
        setTimeout(() => {
            mainCursor.textContent = '🐝';
            mainCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 200);
    });

    // Обновление хвоста
    let prevPositions = [];
    for (let i = 0; i < TRAIL_LENGTH; i++) {
        prevPositions.push({ x: 0, y: 0 });
    }

    function updateTrail() {
        // Сдвигаем историю позиций
        prevPositions.unshift({ x: cursorX, y: cursorY });
        if (prevPositions.length > TRAIL_LENGTH * 4) {
            prevPositions.pop();
        }

        trail.forEach((particle, index) => {
            const posIndex = Math.min(index * 3, prevPositions.length - 1);
            const pos = prevPositions[posIndex];
            particle.update(pos.x, pos.y);
        });

        requestAnimationFrame(updateTrail);
    }

    updateTrail();

})();