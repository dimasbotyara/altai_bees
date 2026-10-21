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

    // Все кликабельные элементы со словами
    const clickableWords = document.querySelectorAll('[data-word]');

    // Звуковой эффект жужжания (Web Audio API)
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
            // Не все браузеры поддерживают Web Audio API
        }
    }

    // Открытие оверлея
    async function openOverlay(word) {
        playBuzz();

        // Конфетти на месте клика
        if (window.spawnConfetti) {
            const rect = event.target.getBoundingClientRect();
            window.spawnConfetti(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                60
            );
        }

        try {
            const response = await fetch(`/api/definition/${encodeURIComponent(word)}`);
            const data = await response.json();

            if (data.error) {
                overlayTitle.textContent = '❌ Ошибка';
                overlayText.textContent = 'Слово не найдено!';
                overlayEmojis.textContent = '😢😢😢';
            } else {
                overlayTitle.textContent = data.title;
                overlayText.textContent = data.text;
                overlayEmojis.textContent = data.emoji;
            }

            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Анимация печатания текста
            typewriterEffect(overlayText, data.text);

        } catch (err) {
            console.error('Ошибка загрузки:', err);
            overlayTitle.textContent = '🐝 Упс!';
            overlayText.textContent = 'Пчёлы съели данные. Попробуйте ещё раз!';
            overlayEmojis.textContent = '🐝🐝🐝';
            overlay.classList.add('active');
        }
    }

    // Эффект печатания
    function typewriterEffect(element, text) {
        element.textContent = '';
        let index = 0;
        const speed = 15; // мс на символ

        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                // Быстрее для пробелов
                const delay = text.charAt(index - 1) === ' ' ? speed / 2 : speed;
                setTimeout(type, delay);
            }
        }

        type();
    }

    // Закрытие оверлея
    function closeOverlay() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        // Конфетти при закрытии
        if (window.spawnConfetti) {
            window.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
        }
    }

    // Обработчики событий
    clickableWords.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const word = el.getAttribute('data-word');
            openOverlay(word);
        });

        // Эффект при наведении
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'transform 0.2s';
            if (el.classList.contains('card')) {
                // Для карточек - bounce эффект
                el.style.animation = 'none';
                setTimeout(() => {
                    el.style.animation = '';
                }, 10);
            }
        });
    });

    // Закрытие по кнопке
    overlayClose.addEventListener('click', closeOverlay);

    // Закрытие по клику на фон
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeOverlay();
        }
    });

    // Закрытие по Escape
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
                // СУПЕРЭФФЕКТ!
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

    // ============ ДВОЙНОЙ КЛИК - ДОЖДЬ ИЗ ПЧЁЛ ============
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
                emoji.style.transform = `translate(${(Math.random() - 0.5) * 300}px, ${(Math.random() - 0.5) * 300}px) rotate(${Math.random() * 720}deg)`;
                emoji.style.opacity = '0';
            });

            setTimeout(() => emoji.remove(), 1500);
        }
    });

})();