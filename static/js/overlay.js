/**
 * 📖 Модуль оверлея с определениями слов
 */

(function () {
    'use strict';

    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayText = document.getElementById('overlay-text');
    const overlayEmojis = document.getElementById('overlay-emojis');
    const overlayClose = document.getElementById('overlay-close');

    const clickableWords = document.querySelectorAll('[data-word]');

    // Звуковой эффект жужжания
    function playBuzz() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            // Web Audio API может быть недоступен
        }
    }

    async function openOverlay(word, originEvent) {
        playBuzz();

        // Конфетти из точки клика
        if (window.spawnConfetti && originEvent) {
            const rect = originEvent.currentTarget.getBoundingClientRect();
            window.spawnConfetti(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                60
            );
        }

        try {
            // cache-bust + no-store, чтобы всегда получать случайный вариант
            const url = `/api/definition/${encodeURIComponent(word)}?_=${Date.now()}`;
            const response = await fetch(url, { cache: 'no-store' });
            const data = await response.json();

            if (data.error) {
                overlayTitle.textContent = '❌ Ошибка';
                overlayText.textContent = 'Слово не найдено!';
                overlayEmojis.textContent = '😢😢😢';
            } else {
                overlayTitle.textContent = data.title;
                overlayEmojis.textContent = data.emoji;
                // Печатаем текст через typewriter
                typewriterEffect(overlayText, data.text);
            }

            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            overlayTitle.textContent = '🐝 Упс!';
            overlayText.textContent = 'Пчёлы съели данные. Попробуйте ещё раз!';
            overlayEmojis.textContent = '🐝🐝🐝';
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Эффект печатания
    function typewriterEffect(element, text) {
        element.textContent = '';
        let index = 0;
        const speed = 12;

        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                const delay = text.charAt(index - 1) === ' ' ? speed / 2 : speed;
                setTimeout(type, delay);
            }
        }

        type();
    }

    function closeOverlay() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        if (window.spawnConfetti) {
            window.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
        }
    }

    // Обработчики клика на слова
    clickableWords.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const word = el.getAttribute('data-word');
            openOverlay(word, e);
        });
    });

    overlayClose.addEventListener('click', closeOverlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOverlay();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeOverlay();
        }
    });

    // ============ ПАСХАЛКА: Код Конами ============
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                document.body.style.animation = 'rainbow 1s linear infinite';
                if (window.spawnConfetti) {
                    for (let i = 0; i < 10; i++) {
                        setTimeout(() => {
                            window.spawnConfetti(
                                Math.random() * window.innerWidth,
                                                 Math.random() * window.innerHeight,
                                                 30
                            );
                        }, i * 200);
                    }
                }
                setTimeout(() => {
                    document.body.style.animation = '';
                }, 5000);
            }
        } else {
            konamiIndex = 0;
        }
    });

    // ============ ДВОЙНОЙ КЛИК — ДОЖДЬ ИЗ ПЧЁЛ ============
    document.addEventListener('dblclick', (e) => {
        const emojis = ['🐝', '🍯', '🌸', '🏔️', '⭐', '🌻', '💛'];
        for (let i = 0; i < 20; i++) {
            const emoji = document.createElement('div');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.position = 'fixed';
            emoji.style.left = e.clientX + 'px';
            emoji.style.top = e.clientY + 'px';
            emoji.style.fontSize = `${Math.random() * 2 + 1}rem`;
            emoji.style.pointerEvents = 'none';
            emoji.style.zIndex = '9997';
            emoji.style.transition = 'all 1.5s ease-out';
            document.body.appendChild(emoji);

            requestAnimationFrame(() => {
                emoji.style.transform =
                `translate(${(Math.random() - 0.5) * 300}px, ${(Math.random() - 0.5) * 300}px) rotate(${Math.random() * 720}deg)`;
                emoji.style.opacity = '0';
            });

            setTimeout(() => emoji.remove(), 1500);
        }
    });

})();
