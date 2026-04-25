// =============================================================
// js/script.js — Class Website 7E Enormous
// SINGLE SOURCE OF TRUTH: semua konten berasal dari data.json
// =============================================================

(async function () {

  // ── 1. Load data.json ─────────────────────────────────────
  let data;
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error('[7E] Gagal memuat data.json:', err);
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="background:#f72585;color:#fff;padding:1rem;text-align:center">' +
      '⚠️ Gagal memuat data. Pastikan file data.json ada dan website diakses lewat server (bukan file://).</div>');
    return;
  }

  // ── 2. Terapkan warna tema via CSS variables ──────────────
  applyTheme(data.theme);

  // ── 3. Render komponen yang ada di semua halaman ──────────
  renderNavbar(data);
  renderFooter(data);
  initHamburger();

  // ── 4. Deteksi halaman & render konten spesifik ───────────
  const page = location.pathname.split('/').pop().replace(/^$/, 'index.html');

  if      (page === 'index.html'   || page === '') renderIndex(data);
  else if (page === 'people.html')                 renderPeople(data);
  else if (page === 'info.html')                   renderInfo(data);
  else if (page === 'gallery.html')                renderGallery(data);

  // ── 5. Visitor counter ────────────────────────────────────
  updateVisitorCount();


  // ═══════════════════════════════════════════════════════════
  //  TEMA
  // ═══════════════════════════════════════════════════════════

  function applyTheme(theme) {
    const r = document.documentElement;
    r.style.setProperty('--primary',   theme.primaryColor);
    r.style.setProperty('--secondary', theme.secondaryColor);
    r.style.setProperty('--accent',    theme.accentColor);
    r.style.setProperty('--cyan',      theme.cyan);
  }


  // ═══════════════════════════════════════════════════════════
  //  NAVBAR  (ada di semua halaman)
  // ═══════════════════════════════════════════════════════════

  function renderNavbar(data) {
    setAttr('.logo-img',        'src', data.logo);
    setAttr('.logo-img',        'alt', `Logo ${data.class.name}`);
    setText('.logo-text h1',    `${data.class.name} ${data.class.subtitle}`);
    setText('.logo-text p',     `${data.class.schoolShort} | ${data.class.year}`);
  }


  // ═══════════════════════════════════════════════════════════
  //  FOOTER  (ada di semua halaman)
  // ═══════════════════════════════════════════════════════════

  function renderFooter(data) {
    const { footer } = data;
    const copy = qs('.footer-content p');
    if (copy) copy.innerHTML = `&copy; ${footer.copyright} Made with ❤️ by ${footer.team}`;
    setAttr('.social-links a[title="Instagram"]', 'href', footer.instagram);
    setAttr('.social-links a[title="TikTok"]',    'href', footer.tiktok);
  }


  // ═══════════════════════════════════════════════════════════
  //  HAMBURGER MENU
  // ═══════════════════════════════════════════════════════════

  function initHamburger() {
    const btn  = qs('.hamburger');
    const menu = qs('.nav-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      menu.classList.toggle('active');
      btn.classList.toggle('active');
    });
    // Tutup menu saat klik link
    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        menu.classList.remove('active');
        btn.classList.remove('active');
      })
    );
  }


  // ═══════════════════════════════════════════════════════════
  //  INDEX.HTML
  // ═══════════════════════════════════════════════════════════

  function renderIndex(data) {
    // Hero
    setAttr('.hero-image',      'src', data.heroImage);
    setAttr('.hero-image',      'alt', `Foto Kelas ${data.class.name}`);
    setText('.hero-headline',   `Welcome to the Home of Class ${data.class.name}`);
    setText('.hero-subheadline',`Angkatan ${data.class.year} | ${data.class.school}`);

    // About
    setText('.about-text', data.aboutClass);

    // Stats
    setText('#total-students', data.class.totalStudents);

    // Captain = guru pertama
    const captain = data.teachers[0];
    if (captain) {
      setAttr('.captain-image', 'src', captain.image);
      setAttr('.captain-image', 'alt', captain.name);
      setText('.captain-info h3',    `${captain.name}, ${captain.title}`);
      setText('.captain-title',       captain.position);
      setText('.captain-quote',      `"${captain.quote}"`);
    }

    // Jadwal
    initScheduleTabs(data.schedule);

    // Countdown — event pertama
    if (data.events.length > 0) {
      const ev = data.events[0];
      setText('.event-card h3', ev.name);
      startCountdown(ev.date);
    }
  }


  // ═══════════════════════════════════════════════════════════
  //  PEOPLE.HTML
  // ═══════════════════════════════════════════════════════════

  function renderPeople(data) {
    renderWaliKelas(data.teachers[0]);
    renderPengurusKelas(data);
    renderAnggotaKelas(data.students);
    initStudentModal(data.students);
  }

  function renderWaliKelas(teacher) {
    const el = qs('#wali-kelas');
    if (!el || !teacher) return;
    el.innerHTML = `
      <img src="${teacher.image}" alt="${teacher.name}" class="wali-image"
           onerror="this.src='assets/img/students/student-placeholder.jpg'">
      <div class="wali-info">
        <h3>${teacher.name}, ${teacher.title}</h3>
        <p class="wali-title">${teacher.position}</p>
        <p class="wali-quote">"${teacher.quote}"</p>
        <div class="social-media">
          <a href="${teacher.instagram}" target="_blank" title="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
          <a href="${teacher.facebook}" target="_blank" title="Facebook">
            <i class="fab fa-facebook"></i>
          </a>
        </div>
      </div>`;
  }

  function renderPengurusKelas(data) {
    const container = qs('#pengurus-container');
    if (!container) return;

    let html = '';
    for (const group of data.pengurusGroups) {
      const members = data.students.filter(s => s.pengurusGroup === group.id);
      if (members.length === 0) continue;

      html += `
        <div class="pengurus-group">
          <h3 class="group-title">${group.title}</h3>
          <div class="students-grid">
            ${members.map(studentCardHTML).join('')}
          </div>
        </div>`;
    }

    container.innerHTML = html || '<p class="empty">Data pengurus belum tersedia.</p>';
  }

  function renderAnggotaKelas(students) {
    const grid = qs('#students-grid');
    if (!grid) return;

    // Tampilkan siswa yang bukan pengurus (pengurusGroup === null/undefined)
    const anggota = students.filter(s => !s.pengurusGroup);

    grid.innerHTML = anggota.length
      ? anggota.map(studentCardHTML).join('')
      : '<p class="empty">Data anggota kelas belum tersedia.</p>';
  }

  function studentCardHTML(s) {
    return `
      <div class="student-card" data-id="${s.id}">
        <img src="${s.image}" alt="${s.name}"
             onerror="this.src='assets/img/students/student-placeholder.jpg'">
        <div class="student-info">
          <h4>${s.name}</h4>
          <p class="nickname">${s.nickname || ''}</p>
          <p class="position">${s.position || ''}</p>
        </div>
      </div>`;
  }

  function initStudentModal(students) {
    const modal = qs('#student-modal');
    if (!modal) return;

    // Buka modal saat klik kartu
    document.addEventListener('click', e => {
      const card = e.target.closest('.student-card[data-id]');
      if (card) {
        const s = students.find(s => s.id == card.dataset.id);
        if (s) openStudentModal(s, modal);
        return;
      }
      // Tutup modal
      if (e.target === modal || e.target.closest('.close')) {
        modal.style.display = 'none';
      }
    });

    // Tutup dengan tombol Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') modal.style.display = 'none';
    });
  }

  function openStudentModal(s, modal) {
    setAttr('.modal-image',      'src', s.image);
    setAttr('.modal-image',      'alt', s.name);
    setText('#modal-name',        s.name);
    setText('#modal-nickname',    s.nickname || '');
    setText('#modal-position',    s.position || '');
    setText('#modal-ttl',         s.birthDate || '-');
    setText('#modal-hobi',        s.hobbies || '-');
    setText('#modal-pesan',       s.message || '-');

    const triviaList = qs('#modal-trivia-list');
    if (triviaList) {
      triviaList.innerHTML = (s.trivia || []).map(t => `<li>${t}</li>`).join('');
    }

    modal.style.display = 'flex';
  }


  // ═══════════════════════════════════════════════════════════
  //  INFO.HTML
  // ═══════════════════════════════════════════════════════════

  function renderInfo(data) {
    initScheduleTabs(data.schedule);
    renderPiket(data.piket);
    renderMBG(data.mbg);
    renderBirthdays(data.students);
  }

  function renderPiket(piket) {
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    for (const day of days) {
      const el = qs(`#piket-${day}`);
      if (!el) continue;
      const names = piket?.[day] || [];
      el.innerHTML = names.length
        ? names.map(n => `<span class="piket-name">${n}</span>`).join('')
        : '<span class="empty">-</span>';
    }
  }

  function renderMBG(mbgData) {
    const tbody = qs('#mbg-body');
    if (!tbody || !mbgData) return;
    tbody.innerHTML = mbgData.map(row => `
      <tr>
        <td>${row.day}</td>
        <td>${row.petugas.join(', ')}</td>
        <td>${row.time}</td>
      </tr>`).join('');
  }

  function renderBirthdays(students) {
    const grid     = qs('#birthday-grid');
    const monthEl  = qs('#current-month');
    const prevBtn  = qs('#prev-month');
    const nextBtn  = qs('#next-month');
    if (!grid) return;

    const MONTHS = [
      'Januari','Februari','Maret','April','Mei','Juni',
      'Juli','Agustus','September','Oktober','November','Desember'
    ];

    let month = new Date().getMonth();
    let year  = new Date().getFullYear();

    function show() {
      if (monthEl) monthEl.textContent = `${MONTHS[month]} ${year}`;

      const birthdays = students
        .filter(s => {
          if (!s.birthDate) return false;
          const m = parseInt(s.birthDate.split('-')[1], 10);
          return m - 1 === month;
        })
        .sort((a, b) => {
          return parseInt(a.birthDate.split('-')[0]) - parseInt(b.birthDate.split('-')[0]);
        });

      if (birthdays.length === 0) {
        grid.innerHTML = '<p class="no-birthday">Tidak ada ulang tahun bulan ini 🎂</p>';
        return;
      }

      grid.innerHTML = birthdays.map(s => {
        const [day] = s.birthDate.split('-');
        return `
          <div class="birthday-card">
            <img src="${s.image}" alt="${s.name}"
                 onerror="this.src='assets/img/students/student-placeholder.jpg'">
            <div class="birthday-info">
              <h4>${s.name}</h4>
              <p>🎂 ${parseInt(day, 10)} ${MONTHS[month]}</p>
            </div>
          </div>`;
      }).join('');
    }

    prevBtn?.addEventListener('click', () => {
      month--; if (month < 0)  { month = 11; year--; } show();
    });
    nextBtn?.addEventListener('click', () => {
      month++; if (month > 11) { month = 0;  year++; } show();
    });

    show();
  }


  // ═══════════════════════════════════════════════════════════
  //  GALLERY.HTML
  // ═══════════════════════════════════════════════════════════

  function renderGallery(data) {
    const grid            = qs('#gallery-grid');
    const filterContainer = qs('#gallery-filter');
    if (!grid) return;

    const categories = [
      { id: 'all',           label: 'Semua' },
      { id: 'class-meetings',label: 'Acara Kelas' },
      { id: 'study-tour',    label: 'Study Tour' },
      { id: 'daily-life',    label: 'Kehidupan Sehari-hari' }
    ];

    // Filter buttons
    if (filterContainer) {
      filterContainer.innerHTML = categories.map(c =>
        `<button class="filter-btn${c.id === 'all' ? ' active' : ''}" data-filter="${c.id}">
          ${c.label}
         </button>`
      ).join('');

      filterContainer.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showItems(btn.dataset.filter);
      });
    }

    function showItems(filter) {
      const items = filter === 'all'
        ? data.gallery
        : data.gallery.filter(g => g.category === filter);

      grid.innerHTML = items.length
        ? items.map(item => `
            <div class="gallery-item" data-category="${item.category}">
              <img src="${item.image}" alt="${item.title}"
                   loading="lazy"
                   onerror="this.parentElement.style.display='none'">
              <div class="gallery-overlay">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
              </div>
            </div>`).join('')
        : '<p class="empty">Belum ada foto di kategori ini.</p>';
    }

    showItems('all');
  }


  // ═══════════════════════════════════════════════════════════
  //  JADWAL PELAJARAN  (dipakai di index & info)
  // ═══════════════════════════════════════════════════════════

  function initScheduleTabs(schedule) {
    const tabs  = qsa('.day-btn');
    const tbody = qs('#schedule-body');
    if (!tabs.length || !tbody) return;

    function showDay(day) {
      const rows = schedule?.[day] || [];
      tbody.innerHTML = rows.length
        ? rows.map(r => `
            <tr>
              <td>${r.time}</td>
              <td>${r.subject}</td>
              <td>${r.teacher}</td>
              <td>${r.room}</td>
            </tr>`).join('')
        : '<tr><td colspan="4" class="empty">Tidak ada jadwal</td></tr>';

      tabs.forEach(t => t.classList.toggle('active', t.dataset.day === day));
    }

    tabs.forEach(tab => tab.addEventListener('click', () => showDay(tab.dataset.day)));
    showDay(tabs[0]?.dataset.day || 'senin');
  }


  // ═══════════════════════════════════════════════════════════
  //  COUNTDOWN
  // ═══════════════════════════════════════════════════════════

  function startCountdown(targetDate) {
    const target = new Date(targetDate).getTime();

    const ids = { days: '#days', hours: '#hours', minutes: '#minutes', seconds: '#seconds' };

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        Object.values(ids).forEach(sel => setText(sel, '0'));
        return;
      }
      setText('#days',    Math.floor(diff / 86_400_000));
      setText('#hours',   Math.floor((diff % 86_400_000) / 3_600_000));
      setText('#minutes', Math.floor((diff % 3_600_000)  / 60_000));
      setText('#seconds', Math.floor((diff % 60_000)     / 1_000));
    }

    tick();
    setInterval(tick, 1000);
  }


  // ═══════════════════════════════════════════════════════════
  //  VISITOR COUNTER
  // ═══════════════════════════════════════════════════════════

  function updateVisitorCount() {
    try {
      const key   = 'visitorCount_7E';
      const count = parseInt(localStorage.getItem(key) || '0') + 1;
      localStorage.setItem(key, count);
      setText('#visitor-count', count.toLocaleString('id-ID'));
    } catch (_) { /* localStorage mungkin diblokir di mode privat */ }
  }


  // ═══════════════════════════════════════════════════════════
  //  HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════

  function qs(sel)       { return document.querySelector(sel); }
  function qsa(sel)      { return document.querySelectorAll(sel); }
  function setText(sel, val) { const el = qs(sel); if (el) el.textContent = val; }
  function setAttr(sel, attr, val) { const el = qs(sel); if (el) el.setAttribute(attr, val); }

})();
