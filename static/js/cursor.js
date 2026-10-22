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

            this.x += (this.targetX - this.x) * (0.15 - this.delay * 0.005);
            this.y += (this.targetY - this.y) * (0.15 - this.delay * 0.005);

            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            this.element.style.opacity = 1 - (this.delay / (TRAIL_LENGTH * 3)) * 0.8;
        }

        // Мгновенный перенос в точку (без плавного догона)
        snapTo(x, y) {
            this.x = x;
            this.y = y;
            this.element.style.transform = `translate(${x}px, ${y}px)`;
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

    // Состояние видимости курсора (используется ниже)
    let cursorVisible = true;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        isMoving = true;

        // Если курсор был скрыт (вернулся в окно) — показываем
        if (!cursorVisible) showCursor();

        mainCursor.style.left = cursorX + 'px';
        mainCursor.style.top = cursorY + 'px';
        if (!mainCursor.classList.contains('cursor-hover')) {
            mainCursor.style.transform = 'translate(-50%, -50%) scale(1.2)';
        }

        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
            isMoving = false;
            if (!mainCursor.classList.contains('cursor-hover')) {
                mainCursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        }, 100);
    });

    // Клик-эффект
    document.addEventListener('mousedown', () => {
        mainCursor.textContent = '💥';
        mainCursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        setTimeout(() => {
            mainCursor.textContent = '🐝';
            if (mainCursor.classList.contains('cursor-hover')) {
                mainCursor.style.transform = 'translate(-50%, -50%) scale(1.45)';
            } else {
                mainCursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        }, 200);
    });

    // ============ УВЕЛИЧЕНИЕ КУРСОРА НА ИНТЕРАКТИВНЫХ ЭЛЕМЕНТАХ ============
    const HOVER_SELECTOR =
    'button, .card, .word, .fact-item, [data-word], .overlay-close, a, .overlay-content';

                document.addEventListener('mouseover', (e) => {
                    if (e.target.closest(HOVER_SELECTOR)) {
                        mainCursor.classList.add('cursor-hover');
                    }
                });

                document.addEventListener('mouseout', (e) => {
                    if (
                        e.target.closest(HOVER_SELECTOR) &&
                        !(e.relatedTarget && e.relatedTarget.closest(HOVER_SELECTOR))
                    ) {
                        mainCursor.classList.remove('cursor-hover');
                    }
                });

                // ============ СКРЫТИЕ КУРСОРА ПРИ ВЫХОДЕ ЗА ОКНО ============
                function hideCursor() {
                    if (!cursorVisible) return;
                    cursorVisible = false;

                    mainCursor.classList.remove('cursor-hover');
                    mainCursor.style.opacity = '0';
                    mainCursor.style.transform = 'translate(-50%, -50%) scale(0.6)';

                    cursorContainer.style.opacity = '0';
                }

                function showCursor() {
                    if (cursorVisible) return;
                    cursorVisible = true;

                    mainCursor.style.opacity = '1';
                    mainCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    cursorContainer.style.opacity = '1';

                    // Переснапить трейл в текущую позицию, чтобы он не тянулся
                    // из последней точки, где был курсор до выхода за окно
                    for (let i = 0; i < TRAIL_LENGTH; i++) {
                        trail[i].snapTo(cursorX, cursorY);
                    }
                    prevPositions = [];
                    for (let i = 0; i < TRAIL_LENGTH; i++) {
                        prevPositions.push({ x: cursorX, y: cursorY });
                    }
                }

                // Основные события выхода/входа
                document.addEventListener('mouseleave', hideCursor);
                document.addEventListener('mouseenter', showCursor);

                // Страховка для браузеров, где mouseleave на document глючит
                // (Firefox, Safari в некоторых случаях)
                document.addEventListener('mouseout', (e) => {
                    if (!e.relatedTarget && !e.toElement) {
                        hideCursor();
                    }
                });

                // Если окно потеряло фокус (переключение на другое приложение) — тоже скрываем
                window.addEventListener('blur', hideCursor);
                window.addEventListener('focus', () => {
                    // показываем только когда мышь вернётся в окно (mouseenter/mousemove)
                    // сам курсор пока не показываем, чтобы не висел в углу
                });

                // Если вкладка стала невидимой — на всякий случай тоже
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) hideCursor();
                });

                    // ============ ОБНОВЛЕНИЕ ХВОСТА ============
                    let prevPositions = [];
                    for (let i = 0; i < TRAIL_LENGTH; i++) {
                        prevPositions.push({ x: 0, y: 0 });
                    }

                    function updateTrail() {
                        prevPositions.unshift({ x: cursorX, y: cursorY });
                        if (prevPositions.length > TRAIL_LENGTH * 4) {
                            prevPositions.pop();
                        }

                        if (cursorVisible) {
                            trail.forEach((particle, index) => {
                                const posIndex = Math.min(index * 3, prevPositions.length - 1);
                                const pos = prevPositions[posIndex];
                                particle.update(pos.x, pos.y);
                            });
                        }

                        requestAnimationFrame(updateTrail);
                    }

                    updateTrail();

})();
