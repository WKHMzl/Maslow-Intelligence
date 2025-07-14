/**
 * Aguarda o conteúdo do DOM ser totalmente carregado antes de executar os scripts.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa todas as funcionalidades do site.
    initMobileMenu();
    initProblemCarousel();
    initLogoTicker();
    initArsenalAccordion(); // <-- NOVA FUNÇÃO CHAMADA AQUI
});

/**
 * Função para inicializar a funcionalidade do menu móvel (hambúrguer).
 */
function initMobileMenu() {
    const menuToggleButton = document.getElementById('menu-toggle-btn');
    const navigationMenu = document.getElementById('nav-menu');

    if (!menuToggleButton || !navigationMenu) return;

    menuToggleButton.addEventListener('click', () => {
        const isExpanded = menuToggleButton.classList.toggle('ativo');
        navigationMenu.classList.toggle('ativo');
        menuToggleButton.setAttribute('aria-expanded', isExpanded);
    });

    navigationMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navigationMenu.classList.contains('ativo')) {
                menuToggleButton.classList.remove('ativo');
                navigationMenu.classList.remove('ativo');
                menuToggleButton.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

/**
 * Função para inicializar o carrossel da seção "Problemas" com funcionalidade de arraste.
 */
/**
 * Função para inicializar o carrossel da seção "Problemas"
 * com arraste, auto-play e dica visual animada.
 */
function initProblemCarousel() {
    const container = document.querySelector('.secao-problema-carrossel .carrossel-container');
    const track = document.querySelector('.secao-problema-carrossel .carrossel-track');
    const prevButton = document.querySelector('.secao-problema-carrossel .carrossel-btn.prev');
    const nextButton = document.querySelector('.secao-problema-carrossel .carrossel-btn.next');
    const dotsNav = document.querySelector('.secao-problema-carrossel .carrossel-dots');
    const swipeIndicator = document.querySelector('.secao-problema-carrossel .swipe-indicator'); // <-- NOVO: Seleciona o ícone

    if (!track || !container || !swipeIndicator) return;

    const slides = Array.from(track.children);
    if (slides.length <= 1) return;

    let isDragging = false, startPos = 0, currentTranslate = 0, prevTranslate = 0, animationID, currentIndex = 0;
    let autoPlayInterval;
    let indicatorHidden = false; // <-- NOVO: Controla se a dica já foi escondida

    // --- LÓGICA DA DICA VISUAL (NOVO) ---
    const hideSwipeIndicator = () => {
        if (!indicatorHidden) {
            indicatorHidden = true;
            swipeIndicator.classList.add('hidden');
        }
    };
    
    // Mostra a dica 1.5s após a página carregar
    setTimeout(() => {
        if (!indicatorHidden) {
            swipeIndicator.classList.add('visible');
        }
    }, 1500);

    // Esconde a dica automaticamente após 5 segundos, caso não haja interação
    setTimeout(hideSwipeIndicator, 5000);
    // --- FIM DA LÓGICA DA DICA ---


    // ... (O resto da sua função continua aqui, mas com pequenas adições)
    // Eu vou colar a função inteira e funcional abaixo para facilitar.
    
    let slideWidth = slides[0].offsetWidth;
    let gap = parseInt(window.getComputedStyle(track).gap) || 0;

    if (dotsNav) {
        dotsNav.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carrossel-dot');
            dot.setAttribute('aria-label', `Ir para o slide ${index + 1}`);
            dotsNav.appendChild(dot);
        });
    }
    const dots = dotsNav ? Array.from(dotsNav.children) : [];

    const goToSlide = (index) => {
        if (index < 0 || index >= slides.length) return;
        track.style.transition = 'transform 0.5s ease';
        currentTranslate = -index * (slideWidth + gap);
        setSliderPosition();
        updateUI(index);
        prevTranslate = currentTranslate;
    };

    const updateUI = (index) => {
        currentIndex = index;
        if (dots.length > 0) {
            dots.forEach((dot, idx) => dot.classList.toggle('ativo', idx === index));
        }
        if (prevButton && nextButton) {
            prevButton.disabled = index === 0;
            nextButton.disabled = index === slides.length - 1;
        }
    };

    const setSliderPosition = () => {
        track.style.transform = `translateX(${currentTranslate}px)`;
    };
    
    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % slides.length;
            goToSlide(nextIndex);
        }, 7000);
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
    };

    const getPositionX = (event) => event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    
    const dragStart = (event) => {
        hideSwipeIndicator(); // <-- NOVO: Esconde a dica
        stopAutoPlay();
        isDragging = true;
        startPos = getPositionX(event);
        track.style.transition = 'none';
        track.classList.add('dragging');
        animationID = requestAnimationFrame(animation);
    };

    const drag = (event) => {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    };

    const dragEnd = () => {
        isDragging = false;
        cancelAnimationFrame(animationID);
        track.classList.remove('dragging');
        
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy < -100 && currentIndex < slides.length - 1) currentIndex++;
        if (movedBy > 100 && currentIndex > 0) currentIndex--;
        
        goToSlide(currentIndex);
    };

    const animation = () => {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    };

    track.addEventListener('mousedown', dragStart);
    track.addEventListener('mousemove', drag);
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', () => isDragging && dragEnd());
    track.addEventListener('touchstart', dragStart, { passive: true });
    track.addEventListener('touchmove', drag, { passive: true });
    track.addEventListener('touchend', dragEnd);

    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            hideSwipeIndicator(); // <-- NOVO: Esconde a dica
            stopAutoPlay();
            goToSlide(currentIndex - 1);
        });
        nextButton.addEventListener('click', () => {
            hideSwipeIndicator(); // <-- NOVO: Esconde a dica
            stopAutoPlay();
            goToSlide(currentIndex + 1);
        });
    }

    if (dotsNav) {
        dotsNav.addEventListener('click', (e) => {
            const targetDot = e.target.closest('button.carrossel-dot');
            if (targetDot) {
                hideSwipeIndicator(); // <-- NOVO: Esconde a dica
                stopAutoPlay();
                goToSlide(dots.indexOf(targetDot));
            }
        });
    }

    window.addEventListener('resize', () => {
        slideWidth = slides[0].offsetWidth;
        gap = parseInt(window.getComputedStyle(track).gap) || 0;
        track.style.transition = 'none';
        goToSlide(currentIndex);
    });

    goToSlide(0);
    startAutoPlay();
}

/**
 * Função para inicializar o ticker de logos, duplicando-os para o efeito contínuo.
 */
function initLogoTicker() {
    const track = document.querySelector('.logo-ticker-track');
    if (!track || track.children.length === 0) return;

    const originalLogos = Array.from(track.children);
    // Limpa o track para evitar duplicação em HMR (Hot Module Replacement)
    track.innerHTML = ''; 
    
    // Adiciona originais e clones
    [...originalLogos, ...originalLogos].forEach(logo => {
        const clone = logo.cloneNode(true);
        if (track.children.length >= originalLogos.length) {
            clone.setAttribute('aria-hidden', 'true');
        }
        track.appendChild(clone);
    });
}

/**
 * Inicializa o acordeão da seção Arsenal com animação suave.
 * Cada card abre e fecha de forma independente.
 */
function initImprovedArsenal() {
    const cards = document.querySelectorAll('#arsenal .arsenal-card');

    cards.forEach(card => {
        const header = card.querySelector('.arsenal-header');
        const panel = card.querySelector('.arsenal-painel');

        header.addEventListener('click', () => {
            // Verifica se o card já está ativo
            const isActive = card.classList.contains('ativo');

            // Adiciona ou remove a classe 'ativo'
            card.classList.toggle('ativo');

            // Atualiza o atributo de acessibilidade
            header.setAttribute('aria-expanded', !isActive);

            // A MÁGICA DA ANIMAÇÃO ACONTECE AQUI
            if (!isActive) {
                // Se o card NÃO estava ativo (agora está), define max-height
                // para a altura real do seu conteúdo, permitindo a transição.
                panel.style.maxHeight = panel.scrollHeight + 'px';
            } else {
                // Se o card ESTAVA ativo (agora não está), remove o max-height
                // para que ele volte a 0, conforme definido no CSS.
                panel.style.maxHeight = null;
            }
        });
    });
}

// Chame esta nova função quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // ... suas outras funções
    initImprovedArsenal(); // Substitua a chamada da função antiga por esta
});