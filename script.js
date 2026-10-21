document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. CONFIGURAÇÃO E VARIÁVEIS GLOBAIS
    // ==========================================
    const WHATSAPP_NUMBER = '5511967305168';
    
    // ==========================================
    // 2. RASTREAMENTO DE UTM (Growth Marketing)
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {
        source: urlParams.get('utm_source') || 'direto',
        medium: urlParams.get('utm_medium') || 'none',
        campaign: urlParams.get('utm_campaign') || 'none'
    };

    if (urlParams.has('utm_source')) {
        localStorage.setItem('consultagro_utm', JSON.stringify(utmData));
    }

    function generateWhatsAppLink(mensagemPersonalizada = '') {
        const savedUtm = JSON.parse(localStorage.getItem('consultagro_utm') || '{"source":"direto"}');
        let baseMsg = `Olá, Denis! Me chamo *${mensagemPersonalizada || 'Visitante'}* e gostaria de mais informações sobre a ConsultAgro.`;
        
        if (savedUtm.source !== 'direto') {
            baseMsg += ` (Vim através de: ${savedUtm.source})`;
        }
        
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMsg)}`;
    }

    // Aplicar UTM a TODOS os botões de WhatsApp (incluindo o flutuante)
    const waButtons = document.querySelectorAll('.wa-link');
    waButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            trackEvent('conversion', 'whatsapp_click', utmData.source);
            btn.href = generateWhatsAppLink();
        });
    });

    // ==========================================
    // 3. DARK MODE (Com LocalStorage)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('consultagro_theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('consultagro_theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        trackEvent('engagement', 'theme_toggle', newTheme);
    });

    // ==========================================
    // 4. HEADER GLASSMORPHISM & MOBILE MENU
    // ==========================================
    const header = document.getElementById('main-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        mobileMenuBtn.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
    });

    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        });
    });

    // ==========================================
    // 5. FAQ ACCORDION ANIMADO
    // ==========================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-content').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.accordion-content');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // ==========================================
    // 6. FORMULÁRIO INTELIGENTE (Sem Backend)
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        const savedValue = localStorage.getItem(`form_draft_${input.name}`);
        if (savedValue) input.value = savedValue;
        input.addEventListener('input', (e) => {
            localStorage.setItem(`form_draft_${e.target.name}`, e.target.value);
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const service = formData.get('service');
        const message = formData.get('message');

        formInputs.forEach(input => localStorage.removeItem(`form_draft_${input.name}`));

        const fullMessage = `*Novo Contato via Site*\n\n👤 *Nome:* ${name}\n📱 *Telefone:* ${phone}\n🌾 *Serviço:* ${service}\n💬 *Mensagem:* ${message || 'Sem mensagem adicional'}`;
        const finalWaLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;
        
        trackEvent('conversion', 'form_submit', service);
        alert('Obrigado! Você será redirecionado para o WhatsApp do Denis para finalizar o atendimento.');
        window.open(finalWaLink, '_blank');
        contactForm.reset();
    });

    // ==========================================
    // 7. COOKIE BANNER (LGPD) & TRACKING
    // ==========================================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    let cookiesAccepted = localStorage.getItem('consultagro_cookies') === 'true';

    if (!cookiesAccepted) {
        setTimeout(() => { cookieBanner.classList.remove('hidden'); }, 1000);
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('consultagro_cookies', 'true');
        cookieBanner.classList.add('hidden');
        trackEvent('compliance', 'cookies_accepted');
    });

    function trackEvent(action, category, label) {
        if (!cookiesAccepted && action !== 'compliance') {
            console.log('Rastreamento bloqueado: Cookies não aceitos.');
            return;
        }
        console.log(`[TRACKING] Event: ${action} | Category: ${category} | Label: ${label}`);
        // Descomente e insira seus IDs reais aqui para GA4/Meta Pixel
    }

    // ==========================================
    // 8. SCROLL ANIMATIONS
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.card, .image-block, .testimonial, .section-title').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});