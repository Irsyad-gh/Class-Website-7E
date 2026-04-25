// ============================================
// MOBILE NAVIGATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    const appState = {
        data: null,
        scheduleData: null,
        birthdayData: null
    };

    await initApp();

    async function initApp() {
        const data = await loadJsonData('data.json');
        if (data) {
            appState.data = data;
            applyTheme(data.theme);
            applyGlobalBranding(data);
            applyHero(data);
            applyFooter(data);
            applyAboutSection(data.aboutClass);
            applyHomeCaptain(data.teachers?.[0]);
            renderWaliKelas(data.teachers?.[0]);
            renderStudents(data.students || []);
            renderGallery(data.gallery || []);
            setupSchedule(data.schedule || {});
            setupBirthdayData(data.students || []);
        } else {
            setupSchedule({});
            setupBirthdayData([]);
        }

        initCountdown(data?.events?.[0]);
        initGalleryFilter();
        initPiketSchedule();
        initMbgSchedule();
        initVisitorCounter();
        initSmoothScroll();
        highlightToday();
    }

    async function loadJsonData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Gagal memuat ${url}: ${response.statusText}`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.warn(`Kesalahan saat memuat ${url}:`, error);
            return null;
        }
    }

    function applyTheme(theme = {}) {
        const root = document.documentElement;
        if (theme.primaryColor) root.style.setProperty('--primary-color', theme.primaryColor);
        if (theme.secondaryColor) root.style.setProperty('--secondary-color', theme.secondaryColor);
        if (theme.accentColor) root.style.setProperty('--accent-color', theme.accentColor);
        if (theme.cyan) root.style.setProperty('--cyan', theme.cyan);
    }

    function applyGlobalBranding(data = {}) {
        const logoImgs = document.querySelectorAll('.logo-img');
        const logoTitle = document.querySelector('.logo-text h1');
        const logoSubtitle = document.querySelector('.logo-text p');

        if (logoImgs.length && data.logo) {
            logoImgs.forEach(img => img.src = data.logo);
        }
        if (logoTitle && data.class) {
            logoTitle.textContent = `${data.class.name}${data.class.subtitle ? ' ' + data.class.subtitle : ''}`.trim();
        }
        if (logoSubtitle && data.class) {
            logoSubtitle.textContent = `${data.class.school} | ${data.class.year}`;
        }
    }

    function applyHero(data = {}) {
        const heroImage = document.querySelector('.hero-image');
        const heroHeadline = document.querySelector('.hero-headline');
        const heroSubheadline = document.querySelector('.hero-subheadline');

        if (heroImage && data.heroImage) {
            heroImage.src = data.heroImage;
        }
        if (heroHeadline && data.class) {
            heroHeadline.textContent = `Welcome to the Home of Class ${data.class.name}`;
        }
        if (heroSubheadline && data.class) {
            heroSubheadline.textContent = `${data.class.school} | ${data.class.year}`;
        }
    }

    function applyFooter(data = {}) {
        const copyrightEl = document.querySelector('.footer-content p');
        const instagramLink = document.querySelector('.social-links a[href*="instagram"]');
        const tiktokLink = document.querySelector('.social-links a[href*="tiktok"]');

        if (copyrightEl && data.footer) {
            copyrightEl.innerHTML = `&copy; ${data.footer.copyright} Made with ❤️ by ${data.footer.team}`;
        }
        if (instagramLink && data.footer && data.footer.instagram) {
            instagramLink.href = data.footer.instagram;
        }
        if (tiktokLink && data.footer && data.footer.tiktok) {
            tiktokLink.href = data.footer.tiktok;
        }
    }

    function renderGallery(galleryData = []) {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        galleryData.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-category', item.category);
            galleryItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="gallery-overlay">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `;
            galleryGrid.appendChild(galleryItem);
        });
    }
    function applyAboutSection(text) {
        const aboutText = document.querySelector('.about-text');
        if (aboutText && text) {
            aboutText.textContent = text;
        }
    }

    function applyHomeCaptain(teacher) {
        if (!teacher) return;

        const captainImage = document.querySelector('.captain-image');
        const captainName = document.querySelector('.captain-info h3');
        const captainTitle = document.querySelector('.captain-title');
        const captainQuote = document.querySelector('.captain-quote');

        if (captainImage) captainImage.src = teacher.image;
        if (captainName) captainName.textContent = teacher.name;
        if (captainTitle) captainTitle.textContent = teacher.position || teacher.title || 'Wali Kelas 7E';
        if (captainQuote) captainQuote.textContent = teacher.quote || '';
    }

    function renderWaliKelas(teacher) {
        const waliCard = document.getElementById('wali-kelas');
        if (!waliCard || !teacher) return;

        const img = waliCard.querySelector('.wali-image');
        const nameEl = waliCard.querySelector('h3');
        const titleEl = waliCard.querySelector('.wali-title');
        const quoteEl = waliCard.querySelector('.wali-quote');
        const instagramLink = waliCard.querySelector('a[href="#"]');
        const facebookLink = waliCard.querySelectorAll('a[href="#"]')[1];

        if (img) img.src = teacher.image;
        if (nameEl) nameEl.textContent = teacher.name;
        if (titleEl) titleEl.textContent = teacher.title;
        if (quoteEl) quoteEl.textContent = teacher.quote;
        if (instagramLink && teacher.instagram) instagramLink.href = teacher.instagram;
        if (facebookLink && teacher.facebook) facebookLink.href = teacher.facebook;
    }

    function renderStudents(students) {
        const gridContainer = document.getElementById('students-grid');
        if (!gridContainer) return;

        gridContainer.innerHTML = '';

        const modal = document.getElementById('student-modal');
        const closeBtn = modal ? modal.querySelector('.close') : null;

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (modal) {
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        students.forEach(student => {
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <img src="${student.image}" alt="${student.name}">
                <div class="student-info">
                    <h4>${student.name}</h4>
                    <p class="nickname">${student.nickname || ''}</p>
                    <p class="position">${student.position || ''}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                if (!modal) return;

                const studentBirth = formatBirthDate(student.birthDate || student.ttl);
                const triviaItems = student.trivia || [];

                document.getElementById('modal-name').textContent = student.name;
                document.getElementById('modal-nickname').textContent = student.nickname || '';
                document.getElementById('modal-position').textContent = student.position || '';
                document.querySelector('.modal-image').src = student.image;
                document.getElementById('modal-ttl').textContent = studentBirth;
                document.getElementById('modal-hobi').textContent = student.hobbies || student.hobi || '';
                document.getElementById('modal-pesan').textContent = student.message || student.pesan || '';

                const triviaList = document.getElementById('modal-trivia-list');
                triviaList.innerHTML = '';
                triviaItems.forEach(trivia => {
                    const li = document.createElement('li');
                    li.textContent = trivia;
                    triviaList.appendChild(li);
                });

                modal.style.display = 'block';
            });

            gridContainer.appendChild(card);
        });
    }

    function formatBirthDate(dateString = '') {
        const parts = dateString.split(/[-\/]/);
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${day.padStart(2, '0')} ${getMonthName(parseInt(month, 10) - 1)} ${year}`;
        }
        return dateString;
    }

    function getMonthName(index) {
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return monthNames[index] || '';
    }

    function setupSchedule(scheduleJson) {
        const scheduleBody = document.getElementById('schedule-body');
        const dayBtns = document.querySelectorAll('.day-btn');

        appState.scheduleData = mapScheduleData(scheduleJson);

        function updateSchedule(day) {
            const schedule = appState.scheduleData[day] || [];
            if (!scheduleBody) return;
            scheduleBody.innerHTML = '';
            schedule.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.jam}</td>
                    <td>${item.pelajaran}</td>
                    <td>${item.guru}</td>
                    <td>${item.ruangan}</td>
                `;
                scheduleBody.appendChild(row);
            });
        }

        dayBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                dayBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateSchedule(btn.getAttribute('data-day'));
            });
        });

        if (scheduleBody && appState.scheduleData.senin?.length) {
            updateSchedule('senin');
        }
    }

    function mapScheduleData(scheduleJson) {
        const result = {
            senin: [],
            selasa: [],
            rabu: [],
            kamis: [],
            jumat: [],
            sabtu: []
        };

        Object.keys(result).forEach(day => {
            const dayEntries = scheduleJson[day] || [];
            result[day] = dayEntries.map(item => ({
                jam: item.time || item.jam || '',
                pelajaran: item.subject || item.pelajaran || '',
                guru: item.teacher || item.guru || '',
                ruangan: item.room || item.ruangan || ''
            }));
        });

        return result;
    }

    function setupBirthdayData(students) {
        const birthdays = students
            .filter(student => student.birthDate)
            .map(student => {
                const parts = student.birthDate.split(/[-\/]/);
                if (parts.length !== 3) {
                    return null;
                }
                const [day, month] = parts;
                return {
                    name: student.name,
                    date: day,
                    month: parseInt(month, 10) - 1
                };
            })
            .filter(Boolean);

        appState.birthdayData = birthdays.length ? birthdays : [
            { name: "Nama Siswa", date: "15", month: new Date().getMonth() },
            { name: "Nama Siswa 2", date: "22", month: new Date().getMonth() },
            { name: "Nama Siswa 3", date: "28", month: new Date().getMonth() }
        ];

        updateBirthdayCalendar();
    }

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    let currentMonth = new Date().getMonth();

    function updateBirthdayCalendar() {
        const birthdayGrid = document.getElementById('birthday-grid');
        const currentMonthSpan = document.getElementById('current-month');
        if (!birthdayGrid || !currentMonthSpan) return;

        currentMonthSpan.textContent = monthNames[currentMonth];
        birthdayGrid.innerHTML = '';

        const birthdayItems = (appState.birthdayData || []).filter(b => b.month === currentMonth);
        if (!birthdayItems.length) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'birthday-card';
            emptyCard.innerHTML = '<div class="birthday-name">Tidak ada ulang tahun bulan ini</div>';
            birthdayGrid.appendChild(emptyCard);
            return;
        }

        birthdayItems.forEach(birthday => {
            const card = document.createElement('div');
            card.className = 'birthday-card';
            card.innerHTML = `
                <div class="birthday-date">${birthday.date}</div>
                <div class="birthday-name">${birthday.name}</div>
                <div class="birthday-month">${monthNames[currentMonth]}</div>
            `;
            birthdayGrid.appendChild(card);
        });
    }

    function initCountdown(event) {
        if (!event || !event.date) return;

        function updateCountdown() {
            const targetDate = new Date(event.date).getTime();
            const now = Date.now();
            const timeLeft = targetDate - now;
            if (timeLeft <= 0) return;
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours;
            document.getElementById('minutes').textContent = minutes;
            document.getElementById('seconds').textContent = seconds;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    function initGalleryFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        setTimeout(() => item.style.opacity = '1', 10);
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    function initPiketSchedule() {
        const piketData = {
            senin: "Adi, Budi",
            selasa: "Citra, Dina",
            rabu: "Eka, Faris",
            kamis: "Gita, Hendra",
            jumat: "Irma, Joko",
            sabtu: "Karin, Leo"
        };
        Object.keys(piketData).forEach(day => {
            const element = document.getElementById(`piket-${day}`);
            if (element) element.textContent = piketData[day];
        });

        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        const currentWeekSpan = document.getElementById('current-week');
        let weekOffset = 0;

        function updateWeekDisplay() {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const options = { month: 'short', day: 'numeric' };
            if (currentWeekSpan) {
                currentWeekSpan.textContent = `${weekStart.toLocaleDateString('id-ID', options)} - ${weekEnd.toLocaleDateString('id-ID', options)}`;
            }
        }

        if (prevWeekBtn && nextWeekBtn) {
            prevWeekBtn.addEventListener('click', () => { weekOffset--; updateWeekDisplay(); });
            nextWeekBtn.addEventListener('click', () => { weekOffset++; updateWeekDisplay(); });
            updateWeekDisplay();
        }
    }

    function initMbgSchedule() {
        const mbgData = [
            { hari: "Senin", nama: "Adi, Budi", waktu: "06:45" },
            { hari: "Selasa", nama: "Citra, Dina", waktu: "06:45" },
            { hari: "Rabu", nama: "Eka, Faris", waktu: "06:45" },
            { hari: "Kamis", nama: "Gita, Hendra", waktu: "06:45" },
            { hari: "Jumat", nama: "Irma, Joko", waktu: "06:45" },
            { hari: "Sabtu", nama: "Karin, Leo", waktu: "06:45" },
        ];
        const mbgBody = document.getElementById('mbg-body');
        if (!mbgBody) return;
        mbgBody.innerHTML = '';
        mbgData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.hari}</td>
                <td>${item.nama}</td>
                <td>${item.waktu}</td>
            `;
            mbgBody.appendChild(row);
        });
    }

    function initVisitorCounter() {
        let visitors = localStorage.getItem('visitors');
        if (!visitors) {
            visitors = Math.floor(Math.random() * 1000) + 100;
        } else {
            visitors = parseInt(visitors, 10) + 1;
        }
        localStorage.setItem('visitors', visitors);
        const visitorCountEl = document.getElementById('visitor-count');
        if (visitorCountEl) {
            visitorCountEl.textContent = visitors.toLocaleString('id-ID');
        }
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    function highlightToday() {
        const dayBtns = document.querySelectorAll('.day-btn');
        if (!dayBtns.length) return;
        const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase();
        const todayBtn = Array.from(dayBtns).find(btn => btn.textContent.toLowerCase().includes(today));
        if (todayBtn) {
            dayBtns.forEach(btn => btn.classList.remove('active'));
            todayBtn.classList.add('active');
        }
    }

    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth = (currentMonth - 1 + 12) % 12;
            updateBirthdayCalendar();
        });
        nextMonthBtn.addEventListener('click', () => {
            currentMonth = (currentMonth + 1) % 12;
            updateBirthdayCalendar();
        });
    }
});