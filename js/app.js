// EstudaFlow — Main Application Controller (Pure JavaScript ES6+)

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentView = 'dashboard';
  let activeSubjectId = window.store.subjects[0]?.id || null;
  let activeTaskFilter = 'pendentes';
  let activeTopicFilter = 'todos';
  let activeFlashcardFilter = 'all';

  // Calendar State
  let currentCalDate = new Date();
  let selectedCalDayStr = new Date().toISOString().split('T')[0];

  // Timer State
  let timerMode = 'pomodoro'; // 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch'
  let timerRunning = false;
  let timerInterval = null;
  let timerSecondsLeft = (window.store.settings.pomodoroWork || 25) * 60;
  let stopwatchSeconds = 0;
  let pomodoroCycles = 0;
  let currentAmbient = 'none';

  // Flashcards Study Mode State
  let isStudyingCards = false;
  let studyCardIndex = 0;
  let studyCardFlipped = false;
  let activeStudyCards = [];

  // Initialize theme from store
  window.store.setTheme(window.store.theme);
  updateThemeIcons();

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Set formatted date in header
  updateHeaderDate();

  // Initial View Rendering
  renderAll();

  // ==========================================
  // EVENT LISTENERS & NAVIGATION
  // ==========================================

  // Tab Navigation (Sidebar & Mobile Nav)
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = btn.dataset.view;
      if (view) {
        if (window.audioService) window.audioService.playClick();
        switchView(view);
      }
    });
  });

  // Direct view links
  document.querySelectorAll('.nav-item-link').forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.view;
      if (view) switchView(view);
    });
  });

  // Theme Toggle Buttons
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const mobileThemeBtn = document.getElementById('mobile-theme-btn');
  const handleToggleTheme = () => {
    const nextTheme = window.store.toggleTheme();
    updateThemeIcons();
    if (currentView === 'analytics') renderAnalyticsView();
  };
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', handleToggleTheme);
  if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', handleToggleTheme);

  // Quick Action Buttons
  const quickStartBtn = document.getElementById('btn-quick-start-pomodoro');
  if (quickStartBtn) {
    quickStartBtn.addEventListener('click', () => {
      switchView('timer');
      if (!timerRunning) toggleTimer();
    });
  }

  const headerTimerPill = document.getElementById('header-timer-pill');
  if (headerTimerPill) {
    headerTimerPill.addEventListener('click', () => switchView('timer'));
  }

  // Modals Open Buttons
  document.getElementById('btn-open-task-modal')?.addEventListener('click', () => openModal('modal-task'));
  document.getElementById('btn-open-subject-modal')?.addEventListener('click', () => {
    document.getElementById('sub-edit-id').value = '';
    document.getElementById('sub-input-name').value = '';
    document.getElementById('sub-input-prof').value = '';
    document.getElementById('sub-input-target').value = '6';
    document.getElementById('sub-input-color').value = '#6366f1';
    document.getElementById('subject-modal-title').innerText = 'Nova Disciplina';
    openModal('modal-subject');
  });
  document.getElementById('btn-open-spaced-modal')?.addEventListener('click', () => openModal('modal-spaced'));
  document.getElementById('btn-open-flashcard-modal')?.addEventListener('click', () => openModal('modal-flashcard'));

  const scheduleActionBtn = document.getElementById('btn-schedule-action');
  if (scheduleActionBtn) {
    scheduleActionBtn.addEventListener('click', () => {
      const weeklyActive = document.getElementById('tab-btn-weekly').classList.contains('active');
      if (weeklyActive) openModal('modal-slot');
      else openModal('modal-deadline');
    });
  }

  // Modal Close buttons
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      if (modalId) closeModal(modalId);
    });
  });

  // Modal Backdrop Click & Escape
  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', (e) => {
      if (e.target === bd) closeModal(bd.id);
    });
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(bd => closeModal(bd.id));
    }
  });

  // Task Filters
  document.querySelectorAll('.task-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.task-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTaskFilter = btn.dataset.filter;
      renderDashboardTasks();
    });
  });

  // Schedule Sub-tabs (Weekly vs Calendar)
  const tabBtnWeekly = document.getElementById('tab-btn-weekly');
  const tabBtnCalendar = document.getElementById('tab-btn-calendar');
  if (tabBtnWeekly && tabBtnCalendar) {
    tabBtnWeekly.addEventListener('click', () => {
      tabBtnWeekly.classList.add('active');
      tabBtnCalendar.classList.remove('active');
      document.getElementById('schedule-sub-weekly').style.display = 'block';
      document.getElementById('schedule-sub-calendar').style.display = 'none';
      document.getElementById('btn-schedule-action-text').innerText = 'Novo Bloco de Horário';
    });
    tabBtnCalendar.addEventListener('click', () => {
      tabBtnCalendar.classList.add('active');
      tabBtnWeekly.classList.remove('active');
      document.getElementById('schedule-sub-weekly').style.display = 'none';
      document.getElementById('schedule-sub-calendar').style.display = 'block';
      document.getElementById('btn-schedule-action-text').innerText = 'Nova Prova / Prazo';
      renderCalendar();
    });
  }

  // Calendar Month Navigation
  document.getElementById('cal-prev-btn')?.addEventListener('click', () => {
    currentCalDate.setMonth(currentCalDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('cal-next-btn')?.addEventListener('click', () => {
    currentCalDate.setMonth(currentCalDate.getMonth() + 1);
    renderCalendar();
  });
  document.getElementById('cal-today-btn')?.addEventListener('click', () => {
    currentCalDate = new Date();
    selectedCalDayStr = new Date().toISOString().split('T')[0];
    renderCalendar();
  });

  // Timer Mode Switchers
  document.querySelectorAll('.timer-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchTimerMode(btn.dataset.mode);
    });
  });

  document.getElementById('btn-timer-toggle')?.addEventListener('click', toggleTimer);
  document.getElementById('btn-timer-reset')?.addEventListener('click', resetTimer);
  document.getElementById('btn-timer-skip')?.addEventListener('click', () => {
    if (timerMode === 'pomodoro') switchTimerMode('shortBreak');
    else switchTimerMode('pomodoro');
  });

  // Ambient Sounds
  document.querySelectorAll('.ambient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.ambient;
      if (currentAmbient === type) {
        stopAmbientSound();
      } else {
        startAmbientSound(type);
      }
    });
  });
  document.getElementById('btn-ambient-stop')?.addEventListener('click', stopAmbientSound);

  // Flashcards Study Mode Handlers
  document.getElementById('btn-start-review-mode')?.addEventListener('click', startFlashcardStudy);
  document.getElementById('btn-close-study-mode')?.addEventListener('click', stopFlashcardStudy);
  document.getElementById('flashcard-3d-box')?.addEventListener('click', flipFlashcard);
  document.getElementById('btn-reveal-answer')?.addEventListener('click', flipFlashcard);
  document.getElementById('btn-rate-hard')?.addEventListener('click', () => rateCurrentCard('dificil'));
  document.getElementById('btn-rate-good')?.addEventListener('click', () => rateCurrentCard('bom'));
  document.getElementById('btn-rate-easy')?.addEventListener('click', () => rateCurrentCard('facil'));

  // Form Submissions
  setupForms();

  // Settings Actions
  document.getElementById('btn-export-backup')?.addEventListener('click', () => window.store.exportBackup());
  document.getElementById('input-import-backup')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const ok = window.store.importBackup(evt.target.result);
      if (ok) {
        alert('Backup restaurado com sucesso!');
        renderAll();
      } else {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  });
  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    if (confirm('Restaurar dados de demonstração originais?')) {
      window.store.resetDemo();
      renderAll();
    }
  });
  document.getElementById('btn-clear-all')?.addEventListener('click', () => {
    if (confirm('ATENÇÃO: Deseja apagar TODOS os seus dados? Esta ação não pode ser desfeita.')) {
      window.store.clearAll();
      renderAll();
    }
  });

  // ==========================================
  // CORE FUNCTIONS
  // ==========================================

  function switchView(viewId) {
    currentView = viewId;

    // Update nav item active states
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.view === viewId) item.classList.add('active');
      else item.classList.remove('active');
    });

    // Update view container
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');

    // Update header title
    const titles = {
      dashboard: 'Painel Geral',
      schedule: 'Planejador & Cronograma',
      subjects: 'Disciplinas & Edital Verticalizado',
      timer: 'Foco & Pomodoro',
      flashcards: 'Flashcards & Revisão Ativa',
      analytics: 'Estatísticas & Relatórios',
      settings: 'Configurações do Sistema'
    };
    const titleEl = document.getElementById('header-view-title');
    if (titleEl) titleEl.innerText = titles[viewId] || 'EstudaFlow';

    // Refresh view data
    if (viewId === 'dashboard') renderDashboardView();
    if (viewId === 'schedule') renderScheduleView();
    if (viewId === 'subjects') renderSubjectsView();
    if (viewId === 'timer') renderTimerView();
    if (viewId === 'flashcards') renderFlashcardsView();
    if (viewId === 'analytics') renderAnalyticsView();
    if (viewId === 'settings') renderSettingsView();

    if (window.lucide) window.lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderAll() {
    renderSidebarData();
    renderDashboardView();
    renderScheduleView();
    renderSubjectsView();
    renderTimerView();
    renderFlashcardsView();
    renderAnalyticsView();
    renderSettingsView();
    populateSelects();
    if (window.lucide) window.lucide.createIcons();
  }

  function renderSidebarData() {
    const streak = window.store.getStreakData();
    const todayMinutes = window.store.getTodayMinutes();
    const todayHours = (todayMinutes / 60).toFixed(1);
    const goalHours = window.store.settings.dailyGoalHours || 4;
    const percent = Math.min(100, Math.round((todayMinutes / (goalHours * 60)) * 100));

    // Sidebar
    const streakText = document.getElementById('sidebar-streak-text');
    if (streakText) streakText.innerText = `${streak.current} ${streak.current === 1 ? 'dia seguido' : 'dias seguidos'}`;

    const goalPercent = document.getElementById('sidebar-goal-percent');
    if (goalPercent) goalPercent.innerText = `${percent}%`;

    const goalBar = document.getElementById('sidebar-goal-bar');
    if (goalBar) goalBar.style.width = `${percent}%`;

    const goalHoursEl = document.getElementById('sidebar-goal-hours');
    if (goalHoursEl) goalHoursEl.innerText = `${todayHours}h / ${goalHours}h`;

    const goalStatus = document.getElementById('sidebar-goal-status');
    if (goalStatus) {
      goalStatus.innerText = percent >= 100 ? 'Meta batida! 🎉' : 'Em andamento';
      goalStatus.style.color = percent >= 100 ? 'var(--success)' : 'var(--text-muted)';
    }

    // Header Pill
    const headerStreak = document.getElementById('header-streak-count');
    if (headerStreak) headerStreak.innerText = `${streak.current} ${streak.current === 1 ? 'dia' : 'dias'}`;
  }

  // 1. DASHBOARD VIEW
  function renderDashboardView() {
    renderSidebarData();
    const streak = window.store.getStreakData();
    const todayMinutes = window.store.getTodayMinutes();
    const todayHours = (todayMinutes / 60).toFixed(1);
    const goalHours = window.store.settings.dailyGoalHours || 4;
    const percent = Math.min(100, Math.round((todayMinutes / (goalHours * 60)) * 100));

    // Hero
    const heroTitle = document.getElementById('dashboard-hero-title');
    if (heroTitle) {
      heroTitle.innerText = streak.studiedToday ? 'Mandou bem hoje! 🚀' : 'Pronto para bater sua meta hoje? 🎯';
    }
    const heroStreakDays = document.getElementById('hero-streak-days');
    if (heroStreakDays) heroStreakDays.innerText = `${streak.current} Dias`;

    // KPI Cards
    const kpiHours = document.getElementById('kpi-study-hours');
    if (kpiHours) kpiHours.innerText = `${todayHours}h`;

    const kpiFill = document.getElementById('kpi-goal-fill');
    if (kpiFill) kpiFill.style.width = `${percent}%`;

    const completedTasksCount = window.store.tasks.filter(t => t.completed).length;
    const pendingTasksCount = window.store.tasks.filter(t => !t.completed).length;
    const kpiTasks = document.getElementById('kpi-tasks-done');
    if (kpiTasks) kpiTasks.innerText = completedTasksCount;

    const kpiTasksSub = document.getElementById('kpi-tasks-sub');
    if (kpiTasksSub) kpiTasksSub.innerText = `concluídas (${pendingTasksCount} restantes)`;

    // Next Exam KPI
    const exams = window.store.deadlines
      .filter(d => new Date(d.date) >= new Date(new Date().setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const nextExamTitle = document.getElementById('kpi-next-exam-title');
    const nextExamTime = document.getElementById('kpi-next-exam-time');
    if (exams.length > 0) {
      if (nextExamTitle) nextExamTitle.innerText = exams[0].title;
      if (nextExamTime) nextExamTime.innerText = getDaysRemaining(exams[0].date);
    } else {
      if (nextExamTitle) nextExamTitle.innerText = 'Nenhuma prova';
      if (nextExamTime) nextExamTime.innerText = 'Agenda livre';
    }

    renderDashboardTasks();
    renderDashboardDeadlines();
    renderDashboardSubjectsProgress();
  }

  function renderDashboardTasks() {
    const list = document.getElementById('dashboard-tasks-list');
    if (!list) return;

    let tasks = window.store.tasks;
    if (activeTaskFilter === 'pendentes') tasks = tasks.filter(t => !t.completed);
    else if (activeTaskFilter === 'concluidas') tasks = tasks.filter(t => t.completed);

    if (tasks.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          <i data-lucide="check-circle" style="width: 32px; height: 32px; margin-bottom: 8px; opacity: 0.4;"></i>
          <p style="font-size: 13px; font-weight: 600;">Nenhuma tarefa nesta categoria!</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    list.innerHTML = tasks.map(task => {
      const sub = window.store.subjects.find(s => s.id === task.subjectId);
      return `
        <div class="task-item ${task.completed ? 'completed' : ''}">
          <div class="task-left">
            <button class="task-check-btn" onclick="window.toggleTask('${task.id}')">
              ${task.completed ? '<i data-lucide="check" style="width: 14px; height: 14px; stroke-width: 3;"></i>' : ''}
            </button>
            <div style="min-width: 0; flex: 1;">
              <div class="task-title" style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${task.title}</div>
              <div class="task-meta">
                ${sub ? `<span class="badge" style="background: ${sub.color}20; color: ${sub.color};">${sub.name}</span>` : ''}
                <span class="badge priority-${task.priority}">${task.priority}</span>
              </div>
            </div>
          </div>
          <button class="btn-icon" onclick="window.deleteTask('${task.id}')" style="width: 28px; height: 28px; color: var(--danger); border: none; background: transparent;">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function renderDashboardDeadlines() {
    const list = document.getElementById('dashboard-deadlines-list');
    if (!list) return;

    const upcoming = window.store.deadlines
      .filter(d => new Date(d.date) >= new Date(new Date().setHours(0,0,0,0)))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);

    if (upcoming.length === 0) {
      list.innerHTML = `<p style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 12px;">Nenhum prazo próximo.</p>`;
      return;
    }

    list.innerHTML = upcoming.map(d => {
      const sub = window.store.subjects.find(s => s.id === d.subjectId);
      const isExam = d.type === 'prova';
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-radius: var(--radius-md); background: var(--bg-surface-alt); margin-bottom: 8px;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="badge ${isExam ? 'priority-alta' : 'badge-revisado'}">${d.type}</span>
              ${d.weight ? `<span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">${d.weight}</span>` : ''}
            </div>
            <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">${d.title}</div>
            ${sub ? `<div style="font-size: 10px; color: var(--text-muted);">${sub.name}</div>` : ''}
          </div>
          <div style="text-align: right; font-size: 11px; font-weight: 700; color: var(--primary);">
            ${getDaysRemaining(d.date)}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderDashboardSubjectsProgress() {
    const list = document.getElementById('dashboard-subjects-progress-list');
    if (!list) return;

    list.innerHTML = window.store.subjects.slice(0, 4).map(sub => {
      const total = sub.topics.length;
      const done = sub.topics.filter(t => t.status === 'dominado' || t.status === 'revisado').length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      return `
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${sub.name}</span>
            <span style="font-family: var(--font-mono); font-size: 11px;">${pct}%</span>
          </div>
          <div class="progress-bar-bg" style="height: 6px;">
            <div class="progress-bar-fill" style="width: ${pct}%; background: ${sub.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. SCHEDULE VIEW
  function renderScheduleView() {
    renderWeeklyTimetable();
    renderCalendar();
  }

  function renderWeeklyTimetable() {
    const container = document.getElementById('timetable-container');
    if (!container) return;

    const days = [
      { id: 1, name: 'Segunda-feira', short: 'Seg' },
      { id: 2, name: 'Terça-feira', short: 'Ter' },
      { id: 3, name: 'Quarta-feira', short: 'Qua' },
      { id: 4, name: 'Quinta-feira', short: 'Qui' },
      { id: 5, name: 'Sexta-feira', short: 'Sex' },
      { id: 6, name: 'Sábado', short: 'Sáb' },
      { id: 0, name: 'Domingo', short: 'Dom' },
    ];

    container.innerHTML = days.map(day => {
      const slots = window.store.scheduleSlots
        .filter(s => s.dayOfWeek === day.id)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      const slotsHtml = slots.length === 0
        ? `<div style="text-align: center; color: var(--text-muted); font-size: 11px; margin: auto;">Livre</div>`
        : slots.map(slot => {
            const sub = window.store.subjects.find(s => s.id === slot.subjectId);
            return `
              <div class="schedule-block-card" style="background: ${sub ? sub.color + '15' : 'var(--bg-surface)'}; border-color: ${sub ? sub.color + '50' : 'var(--border)'};">
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 700; color: ${sub ? sub.color : 'var(--primary)'}; font-family: var(--font-mono);">
                  <span>${slot.startTime} - ${slot.endTime}</span>
                  <button onclick="window.deleteSlot('${slot.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0 2px;">&times;</button>
                </div>
                <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">${sub ? sub.name : 'Disciplina'}</div>
                ${slot.title ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${slot.title}</div>` : ''}
                ${slot.roomOrLink ? `<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">📍 ${slot.roomOrLink}</div>` : ''}
              </div>
            `;
          }).join('');

      return `
        <div class="timetable-col">
          <div class="timetable-col-header">
            <span>${day.name}</span>
            <span style="background: var(--border); padding: 1px 6px; border-radius: var(--radius-full); font-size: 10px;">${slots.length}</span>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column;">
            ${slotsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderCalendar() {
    const titleEl = document.getElementById('cal-month-title');
    const gridEl = document.getElementById('calendar-cells-grid');
    if (!gridEl) return;

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    if (titleEl) titleEl.innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let cellsHtml = '';
    for (let i = 0; i < adjustedFirstDay; i++) {
      cellsHtml += `<div class="calendar-cell" style="opacity: 0.2; pointer-events: none;"></div>`;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = window.store.deadlines.filter(ev => ev.date === dateStr);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedCalDayStr;

      const eventsHtml = dayEvents.slice(0, 2).map(ev => {
        const isExam = ev.type === 'prova';
        return `
          <div class="cal-event-dot ${isExam ? 'priority-alta' : 'badge-revisado'}">
            ${ev.title}
          </div>
        `;
      }).join('');

      cellsHtml += `
        <div class="calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" onclick="window.selectCalDay('${dateStr}')">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="cal-num" style="font-size: 11px; font-weight: 700;">${d}</span>
            ${dayEvents.length > 0 ? `<span style="font-size: 10px; font-weight: 800; color: var(--primary);">${dayEvents.length}</span>` : ''}
          </div>
          <div>${eventsHtml}</div>
        </div>
      `;
    }

    gridEl.innerHTML = cellsHtml;
    renderSelectedCalDayEvents();
  }

  function renderSelectedCalDayEvents() {
    const titleEl = document.getElementById('cal-selected-date-title');
    const listEl = document.getElementById('cal-selected-events-list');
    if (!listEl) return;

    const parts = selectedCalDayStr.split('-');
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    if (titleEl) titleEl.innerText = `Eventos para ${formatted}`;

    const events = window.store.deadlines.filter(ev => ev.date === selectedCalDayStr);
    if (events.length === 0) {
      listEl.innerHTML = `
        <p style="font-size: 12px; color: var(--text-muted); padding: 12px 0;">Nenhum evento registrado nesta data.</p>
        <button class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;" onclick="window.openDeadlineWithDate('${selectedCalDayStr}')">
          + Adicionar prazo nesta data
        </button>
      `;
      return;
    }

    listEl.innerHTML = events.map(ev => {
      const sub = window.store.subjects.find(s => s.id === ev.subjectId);
      return `
        <div style="padding: 10px; border-radius: var(--radius-md); background: var(--bg-surface-alt); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span class="badge ${ev.type === 'prova' ? 'priority-alta' : 'badge-revisado'}">${ev.type}</span>
            <div style="font-size: 13px; font-weight: 700; margin-top: 4px;">${ev.title}</div>
            ${sub ? `<div style="font-size: 11px; color: var(--text-muted);">${sub.name}</div>` : ''}
          </div>
          <button class="btn-icon" onclick="window.deleteDeadline('${ev.id}')" style="width: 26px; height: 26px; border: none; color: var(--danger); background: transparent;">
            &times;
          </button>
        </div>
      `;
    }).join('');
  }

  // 3. SUBJECTS VIEW
  function renderSubjectsView() {
    const listEl = document.getElementById('subjects-card-list');
    const panelEl = document.getElementById('subject-detail-panel');
    if (!listEl || !panelEl) return;

    if (!activeSubjectId && window.store.subjects.length > 0) {
      activeSubjectId = window.store.subjects[0].id;
    }

    // Left List
    listEl.innerHTML = window.store.subjects.map(sub => {
      const isSelected = sub.id === activeSubjectId;
      const total = sub.topics.length;
      const mastered = sub.topics.filter(t => t.status === 'dominado').length;
      const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

      return `
        <div class="card" onclick="window.selectSubject('${sub.id}')" style="cursor: pointer; padding: 16px; border-color: ${isSelected ? 'var(--primary)' : 'var(--border)'}; background: ${isSelected ? 'var(--bg-surface)' : 'var(--bg-surface)'}; box-shadow: ${isSelected ? '0 0 0 2px var(--primary-light)' : 'var(--shadow-sm)'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${sub.color};"></span>
              <span style="font-size: 13px; font-weight: 700;">${sub.name}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <button onclick="event.stopPropagation(); window.editSubject('${sub.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 11px;">Editar</button>
              <button onclick="event.stopPropagation(); window.deleteSubject('${sub.id}')" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 11px;">Excluir</button>
            </div>
          </div>
          <div class="progress-bar-bg" style="height: 6px; margin: 8px 0 4px;">
            <div class="progress-bar-fill" style="width: ${pct}%; background: ${sub.color};"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
            <span>${mastered}/${total} dominados</span>
            <span style="font-weight: 700;">${pct}%</span>
          </div>
        </div>
      `;
    }).join('');

    // Right Topics Detail
    const activeSub = window.store.subjects.find(s => s.id === activeSubjectId);
    if (!activeSub) {
      panelEl.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 40px;">Nenhuma disciplina selecionada.</p>`;
      return;
    }

    let topics = activeSub.topics;
    if (activeTopicFilter !== 'todos') {
      topics = topics.filter(t => t.status === activeTopicFilter);
    }

    const topicsHtml = topics.length === 0
      ? `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Nenhum tópico encontrado.</div>`
      : topics.map(topic => {
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: var(--radius-md); background: var(--bg-surface-alt); margin-bottom: 8px;">
              <div>
                <div style="font-size: 13px; font-weight: 700;">${topic.title}</div>
                ${topic.notes ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">📝 ${topic.notes}</div>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <select class="form-select badge badge-${topic.status}" onchange="window.updateTopicStatus('${activeSub.id}', '${topic.id}', this.value)" style="padding: 4px 8px; cursor: pointer; font-weight: 700;">
                  <option value="a_estudar" ${topic.status === 'a_estudar' ? 'selected' : ''}>A Estudar</option>
                  <option value="em_andamento" ${topic.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
                  <option value="revisado" ${topic.status === 'revisado' ? 'selected' : ''}>Revisado</option>
                  <option value="dominado" ${topic.status === 'dominado' ? 'selected' : ''}>Dominado 🏆</option>
                </select>
                <button onclick="window.deleteTopic('${activeSub.id}', '${topic.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer;">&times;</button>
              </div>
            </div>
          `;
        }).join('');

    panelEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 14px;">
        <div>
          <h3 style="font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
            <span style="width: 14px; height: 14px; border-radius: 50%; background: ${activeSub.color};"></span>
            ${activeSub.name}
          </h3>
          <p style="font-size: 12px; color: var(--text-muted);">${activeSub.professor || 'Sem professor cadastrado'} • Meta: ${activeSub.targetHoursPerWeek}h/semana</p>
        </div>
        <button class="btn btn-primary" onclick="window.openTopicModal('${activeSub.id}')" style="font-size: 12px;">+ Adicionar Tópico</button>
      </div>

      <div style="display: flex; gap: 6px; margin-bottom: 16px; overflow-x: auto;">
        ${['todos', 'a_estudar', 'em_andamento', 'revisado', 'dominado'].map(st => `
          <button class="btn btn-secondary ${activeTopicFilter === st ? 'active' : ''}" onclick="window.filterTopics('${st}')" style="font-size: 11px; padding: 4px 10px; text-transform: capitalize;">
            ${st.replace('_', ' ')}
          </button>
        `).join('')}
      </div>

      <div>${topicsHtml}</div>
    `;
  }

  // 4. TIMER (POMODORO & CRONÔMETRO)
  function renderTimerView() {
    updateTimerDisplay();
    populateSelects();

    const listEl = document.getElementById('timer-today-sessions-list');
    if (!listEl) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const sessions = window.store.sessions.filter(s => s.date === todayStr);

    if (sessions.length === 0) {
      listEl.innerHTML = `<p style="text-align: center; font-size: 12px; color: var(--text-muted); padding: 14px;">Nenhuma sessão registrada hoje.</p>`;
      return;
    }

    listEl.innerHTML = sessions.map(ses => {
      const sub = window.store.subjects.find(s => s.id === ses.subjectId);
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-radius: var(--radius-md); background: var(--bg-surface-alt); margin-bottom: 6px; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${sub ? sub.color : 'var(--primary)'};"></span>
            <strong>${sub ? sub.name : 'Geral'}</strong>
            <span style="color: var(--text-muted);">${ses.notes || ''}</span>
          </div>
          <span class="badge badge-revisado">+${ses.durationMinutes} min</span>
        </div>
      `;
    }).join('');
  }

  function switchTimerMode(mode) {
    pauseTimer();
    timerMode = mode;

    const workMins = window.store.settings.pomodoroWork || 25;
    const shortMins = window.store.settings.pomodoroShortBreak || 5;
    const longMins = window.store.settings.pomodoroLongBreak || 15;

    if (mode === 'pomodoro') timerSecondsLeft = workMins * 60;
    else if (mode === 'shortBreak') timerSecondsLeft = shortMins * 60;
    else if (mode === 'longBreak') timerSecondsLeft = longMins * 60;
    else if (mode === 'stopwatch') stopwatchSeconds = 0;

    const labelEl = document.getElementById('timer-mode-label');
    if (labelEl) {
      const labels = {
        pomodoro: 'Foco Profundo',
        shortBreak: 'Descanso Curto',
        longBreak: 'Descanso Longo',
        stopwatch: 'Estudo Livre'
      };
      labelEl.innerText = labels[mode] || 'Foco';
    }

    updateTimerDisplay();
  }

  function toggleTimer() {
    if (timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    timerRunning = true;
    updateTimerControls();

    const ring = document.getElementById('timer-progress-ring');
    const badge = document.getElementById('sidebar-timer-badge');
    const headerPill = document.getElementById('header-timer-pill');
    if (badge) badge.style.display = 'inline-block';
    if (headerPill) headerPill.style.display = 'inline-flex';

    timerInterval = setInterval(() => {
      if (timerMode === 'stopwatch') {
        stopwatchSeconds++;
      } else {
        if (timerSecondsLeft <= 1) {
          handleTimerFinished();
          return;
        }
        timerSecondsLeft--;
      }
      updateTimerDisplay();
    }, 1000);
  }

  function pauseTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    updateTimerControls();

    const badge = document.getElementById('sidebar-timer-badge');
    const headerPill = document.getElementById('header-timer-pill');
    if (badge) badge.style.display = 'none';
    if (headerPill) headerPill.style.display = 'none';
  }

  function resetTimer() {
    pauseTimer();
    switchTimerMode(timerMode);
  }

  function handleTimerFinished() {
    pauseTimer();
    if (window.store.settings.soundAlerts && window.audioService) {
      window.audioService.playBell();
    }

    if (timerMode === 'pomodoro') {
      const subId = document.getElementById('timer-subject-select')?.value || window.store.subjects[0]?.id;
      window.store.logSession({
        durationMinutes: window.store.settings.pomodoroWork || 25,
        subjectId: subId,
        mode: 'pomodoro',
        notes: 'Sessão Pomodoro concluída!'
      });

      pomodoroCycles++;
      const cyclesEl = document.getElementById('timer-cycles-text');
      if (cyclesEl) cyclesEl.innerText = `Ciclo #${pomodoroCycles + 1}`;

      if (pomodoroCycles % (window.store.settings.pomodoroLongBreakInterval || 4) === 0) {
        switchTimerMode('longBreak');
      } else {
        switchTimerMode('shortBreak');
      }
    } else {
      switchTimerMode('pomodoro');
    }

    renderAll();
    alert('Tempo concluído! Excelente dedicação.');
  }

  function updateTimerControls() {
    const textEl = document.getElementById('btn-timer-text');
    const toggleBtn = document.getElementById('btn-timer-toggle');
    if (textEl) textEl.innerText = timerRunning ? 'Pausar' : 'Iniciar Foco';
    if (toggleBtn) {
      const iconName = timerRunning ? 'pause' : 'play';
      const existing = toggleBtn.querySelector('svg, i');
      if (existing) {
        existing.outerHTML = `<i data-lucide="${iconName}" style="width: 20px; height: 20px; fill: white;"></i>`;
      }
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function updateTimerDisplay() {
    const sec = timerMode === 'stopwatch' ? stopwatchSeconds : timerSecondsLeft;
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const displayEl = document.getElementById('timer-display-digits');
    if (displayEl) displayEl.innerText = formatted;

    const headerDigits = document.getElementById('header-timer-digits');
    if (headerDigits) headerDigits.innerText = formatted;

    // SVG Ring progress
    const ring = document.getElementById('timer-progress-ring');
    if (ring && timerMode !== 'stopwatch') {
      let total = (window.store.settings.pomodoroWork || 25) * 60;
      if (timerMode === 'shortBreak') total = (window.store.settings.pomodoroShortBreak || 5) * 60;
      if (timerMode === 'longBreak') total = (window.store.settings.pomodoroLongBreak || 15) * 60;

      const circumference = 722.56; // 2 * PI * 115
      const offset = circumference - ((total - timerSecondsLeft) / total) * circumference;
      ring.style.strokeDashoffset = offset;
    }
  }

  function startAmbientSound(type) {
    currentAmbient = type;
    if (window.audioService) window.audioService.startAmbient(type);
    document.querySelectorAll('.ambient-btn').forEach(b => {
      if (b.dataset.ambient === type) {
        b.classList.add('active');
        b.style.background = 'var(--primary)';
        b.style.color = '#fff';
      } else {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '';
      }
    });
    const stopBtn = document.getElementById('btn-ambient-stop');
    if (stopBtn) stopBtn.style.display = 'inline-block';
  }

  function stopAmbientSound() {
    currentAmbient = 'none';
    if (window.audioService) window.audioService.stopAmbient();
    document.querySelectorAll('.ambient-btn').forEach(b => {
      b.classList.remove('active');
      b.style.background = '';
      b.style.color = '';
    });
    const stopBtn = document.getElementById('btn-ambient-stop');
    if (stopBtn) stopBtn.style.display = 'none';
  }

  // 5. FLASHCARDS VIEW
  function renderFlashcardsView() {
    renderFlashcardFilterPills();
    renderFlashcardsGrid();
  }

  function renderFlashcardFilterPills() {
    const pills = document.getElementById('flashcards-filter-pills');
    if (!pills) return;

    pills.innerHTML = `
      <button class="btn btn-secondary ${activeFlashcardFilter === 'all' ? 'active' : ''}" onclick="window.filterFlashcards('all')" style="font-size: 11px; padding: 4px 12px;">
        Todas (${window.store.flashcards.length})
      </button>
      ${window.store.subjects.map(sub => {
        const count = window.store.flashcards.filter(c => c.subjectId === sub.id).length;
        const isSel = activeFlashcardFilter === sub.id;
        return `
          <button class="btn btn-secondary ${isSel ? 'active' : ''}" onclick="window.filterFlashcards('${sub.id}')" style="font-size: 11px; padding: 4px 12px; border-color: ${isSel ? sub.color : 'var(--border)'};">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${sub.color}; display: inline-block; margin-right: 4px;"></span>
            ${sub.name} (${count})
          </button>
        `;
      }).join('')}
    `;
  }

  function renderFlashcardsGrid() {
    const grid = document.getElementById('flashcards-grid-list');
    if (!grid) return;

    let cards = window.store.flashcards;
    if (activeFlashcardFilter !== 'all') {
      cards = cards.filter(c => c.subjectId === activeFlashcardFilter);
    }

    if (cards.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhum flashcard nesta categoria.</div>`;
      return;
    }

    grid.innerHTML = cards.map(c => {
      const sub = window.store.subjects.find(s => s.id === c.subjectId);
      return `
        <div class="card" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              ${sub ? `<span class="badge" style="background: ${sub.color}20; color: ${sub.color};">${sub.name}</span>` : '<span></span>'}
              <button onclick="window.deleteFlashcard('${c.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer;">&times;</button>
            </div>
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 6px;">${c.front}</div>
            <div style="font-size: 12px; color: var(--text-muted); white-space: pre-line;">${c.back}</div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 14px; padding-top: 8px; border-top: 1px solid var(--border);">
            <span>Status: <strong>${c.difficulty || 'Novo'}</strong></span>
            <span>${c.reviewsCount || 0} revisões</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function startFlashcardStudy() {
    let cards = window.store.flashcards;
    if (activeFlashcardFilter !== 'all') cards = cards.filter(c => c.subjectId === activeFlashcardFilter);
    if (cards.length === 0) {
      alert('Nenhum flashcard disponível para estudar.');
      return;
    }

    activeStudyCards = cards;
    studyCardIndex = 0;
    studyCardFlipped = false;
    isStudyingCards = true;

    document.getElementById('flashcard-study-container').style.display = 'block';
    document.getElementById('flashcards-grid-list').style.display = 'none';
    showCurrentStudyCard();
  }

  function stopFlashcardStudy() {
    isStudyingCards = false;
    document.getElementById('flashcard-study-container').style.display = 'none';
    document.getElementById('flashcards-grid-list').style.display = 'grid';
    renderFlashcardsView();
  }

  function showCurrentStudyCard() {
    const card = activeStudyCards[studyCardIndex];
    if (!card) {
      stopFlashcardStudy();
      return;
    }

    studyCardFlipped = false;
    document.getElementById('flashcard-3d-inner').classList.remove('flipped');
    document.getElementById('study-rating-buttons').style.display = 'none';
    document.getElementById('btn-reveal-answer').style.display = 'block';

    document.getElementById('study-card-counter').innerText = `Card ${studyCardIndex + 1} de ${activeStudyCards.length}`;
    document.getElementById('study-front-text').innerText = card.front;
    document.getElementById('study-back-text').innerText = card.back;
  }

  function flipFlashcard() {
    studyCardFlipped = !studyCardFlipped;
    const inner = document.getElementById('flashcard-3d-inner');
    if (studyCardFlipped) {
      inner.classList.add('flipped');
      document.getElementById('study-rating-buttons').style.display = 'grid';
      document.getElementById('btn-reveal-answer').style.display = 'none';
    } else {
      inner.classList.remove('flipped');
    }
  }

  function rateCurrentCard(difficulty) {
    const card = activeStudyCards[studyCardIndex];
    if (card) {
      window.store.rateFlashcard(card.id, difficulty);
    }

    if (studyCardIndex + 1 < activeStudyCards.length) {
      studyCardIndex++;
      showCurrentStudyCard();
    } else {
      alert('🎉 Parabéns! Você concluiu todos os flashcards desta rodada!');
      stopFlashcardStudy();
    }
  }

  // 6. ANALYTICS VIEW
  function renderAnalyticsView() {
    const isDark = window.store.theme === 'dark';

    const totalMinutes = window.store.sessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const uniqueDays = Math.max(1, new Set(window.store.sessions.map(s => s.date)).size);
    const dailyAvg = (totalMinutes / (uniqueDays * 60)).toFixed(1);

    document.getElementById('analytics-total-hours').innerText = `${totalHours}h`;
    document.getElementById('analytics-sessions-count').innerText = `${window.store.sessions.length} sessões`;
    document.getElementById('analytics-daily-avg').innerText = `${dailyAvg}h/dia`;

    const goal = window.store.settings.dailyGoalHours || 4;
    const consistency = Math.min(100, Math.round((Number(dailyAvg) / goal) * 100));
    document.getElementById('analytics-consistency-percent').innerText = `${consistency}%`;

    // Leader subject
    const subjectTotals = {};
    window.store.sessions.forEach(s => {
      subjectTotals[s.subjectId] = (subjectTotals[s.subjectId] || 0) + (s.durationMinutes || 0);
    });
    let topId = null, max = -1;
    Object.keys(subjectTotals).forEach(id => {
      if (subjectTotals[id] > max) { max = subjectTotals[id]; topId = id; }
    });
    const topSub = window.store.subjects.find(s => s.id === topId);
    if (topSub) {
      document.getElementById('analytics-top-subject').innerText = topSub.name;
      document.getElementById('analytics-top-hours').innerText = `${((max || 0) / 60).toFixed(1)} horas dedicadas`;
    }

    // Chart 1: Last 7 days
    const dailyData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const mins = window.store.sessions.filter(s => s.date === str).reduce((acc, curr) => acc + curr.durationMinutes, 0);
      dailyData.push({
        day: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        dayShort: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        hours: Number((mins / 60).toFixed(1))
      });
    }
    window.chartEngine.renderDailyChart(document.getElementById('chart-daily-container'), dailyData, goal, isDark);

    // Chart 2: Donut subject distribution
    const subData = window.store.subjects.map(s => {
      const mins = subjectTotals[s.id] || 0;
      return { name: s.name, hours: Number((mins / 60).toFixed(1)), color: s.color };
    }).filter(d => d.hours > 0);
    window.chartEngine.renderDonutChart(document.getElementById('chart-donut-container'), subData, isDark);

    // Chart 3: Comparison planned vs real
    const comparisonData = window.store.subjects.map(s => {
      const mins = subjectTotals[s.id] || 0;
      return {
        name: s.name,
        realHours: Number((mins / 60).toFixed(1)),
        plannedHours: s.targetHoursPerWeek || 5,
        color: s.color
      };
    });
    window.chartEngine.renderComparisonChart(document.getElementById('chart-comparison-container'), comparisonData, isDark);
  }

  // 7. SETTINGS VIEW
  function renderSettingsView() {
    const s = window.store.settings;
    document.getElementById('setting-daily-goal').value = s.dailyGoalHours || 4;
    document.getElementById('setting-pomodoro-work').value = s.pomodoroWork || 25;
    document.getElementById('setting-pomodoro-short').value = s.pomodoroShortBreak || 5;
    document.getElementById('setting-pomodoro-long').value = s.pomodoroLongBreak || 15;
    document.getElementById('setting-sound-alerts').checked = s.soundAlerts !== false;
  }

  // Setup Form Submissions
  function setupForms() {
    // New Task Form
    document.getElementById('form-new-task')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-input-title').value;
      const subjectId = document.getElementById('task-input-subject').value;
      const priority = document.getElementById('task-input-priority').value;
      const dueDate = document.getElementById('task-input-date').value;

      window.store.addTask({ title, subjectId, priority, dueDate });
      closeModal('modal-task');
      e.target.reset();
      renderAll();
    });

    // New Slot Form
    document.getElementById('form-new-slot')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const dayOfWeek = document.getElementById('slot-input-day').value;
      const startTime = document.getElementById('slot-input-start').value;
      const endTime = document.getElementById('slot-input-end').value;
      const subjectId = document.getElementById('slot-input-subject').value;
      const title = document.getElementById('slot-input-title').value;
      const roomOrLink = document.getElementById('slot-input-room').value;

      window.store.addScheduleSlot({ dayOfWeek, startTime, endTime, subjectId, title, roomOrLink });
      closeModal('modal-slot');
      e.target.reset();
      renderAll();
    });

    // New Deadline Form
    document.getElementById('form-new-deadline')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('dl-input-title').value;
      const date = document.getElementById('dl-input-date').value;
      const type = document.getElementById('dl-input-type').value;
      const subjectId = document.getElementById('dl-input-subject').value;
      const weight = document.getElementById('dl-input-weight').value;

      window.store.addDeadline({ title, date, type, subjectId, weight });
      closeModal('modal-deadline');
      e.target.reset();
      renderAll();
    });

    // Spaced Review Form
    document.getElementById('form-new-spaced')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const subjectId = document.getElementById('spaced-input-subject').value;
      const title = document.getElementById('spaced-input-title').value;

      window.store.addSpacedReviews(title, subjectId);
      closeModal('modal-spaced');
      e.target.reset();
      renderAll();
      alert('3 revisões geradas com sucesso (24h, 7d e 30d)!');
    });

    // Subject Form
    document.getElementById('form-new-subject')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('sub-edit-id').value;
      const name = document.getElementById('sub-input-name').value;
      const professor = document.getElementById('sub-input-prof').value;
      const targetHoursPerWeek = document.getElementById('sub-input-target').value;
      const color = document.getElementById('sub-input-color').value;

      if (editId) {
        window.store.updateSubject(editId, { name, professor, targetHoursPerWeek, color });
      } else {
        const newSub = window.store.addSubject({ name, professor, targetHoursPerWeek, color });
        activeSubjectId = newSub.id;
      }
      closeModal('modal-subject');
      e.target.reset();
      renderAll();
    });

    // Topic Form
    document.getElementById('form-new-topic')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('topic-input-title').value;
      const notes = document.getElementById('topic-input-notes').value;

      window.store.addTopic(activeSubjectId, title, notes);
      closeModal('modal-topic');
      e.target.reset();
      renderAll();
    });

    // Flashcard Form
    document.getElementById('form-new-flashcard')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const subjectId = document.getElementById('fc-input-subject').value;
      const front = document.getElementById('fc-input-front').value;
      const back = document.getElementById('fc-input-back').value;

      window.store.addFlashcard({ subjectId, front, back });
      closeModal('modal-flashcard');
      e.target.reset();
      renderAll();
    });

    // Settings Form
    document.getElementById('settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const dailyGoalHours = Number(document.getElementById('setting-daily-goal').value);
      const pomodoroWork = Number(document.getElementById('setting-pomodoro-work').value);
      const pomodoroShortBreak = Number(document.getElementById('setting-pomodoro-short').value);
      const pomodoroLongBreak = Number(document.getElementById('setting-pomodoro-long').value);
      const soundAlerts = document.getElementById('setting-sound-alerts').checked;

      window.store.updateSettings({
        dailyGoalHours,
        pomodoroWork,
        pomodoroShortBreak,
        pomodoroLongBreak,
        soundAlerts
      });

      if (window.audioService) window.audioService.playSuccess();
      alert('Configurações salvas!');
      renderAll();
    });
  }

  // Helpers
  function populateSelects() {
    const subjects = window.store.subjects;
    const options = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    ['task-input-subject', 'slot-input-subject', 'dl-input-subject', 'spaced-input-subject', 'fc-input-subject', 'timer-subject-select'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const val = el.value;
        el.innerHTML = (id === 'task-input-subject' ? '<option value="">Geral</option>' : '') + options;
        if (val) el.value = val;
      }
    });
  }

  function updateThemeIcons() {
    const isDark = window.store.theme === 'dark';
    const iconName = isDark ? 'sun' : 'moon';
    [themeToggleBtn, mobileThemeBtn].forEach(btn => {
      if (btn) btn.innerHTML = `<i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>`;
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function updateHeaderDate() {
    const el = document.getElementById('header-current-date');
    if (el) {
      el.innerText = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date());
    }
  }

  function getDaysRemaining(targetDateStr) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(targetDateStr);
    target.setHours(0,0,0,0);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje!';
    if (diff === 1) return 'Amanhã';
    if (diff < 0) return 'Atrasado';
    return `Em ${diff} dias`;
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  }

  // Window exposed helpers for HTML onclick events
  window.toggleTask = (id) => {
    window.store.toggleTask(id);
    renderAll();
  };

  window.deleteTask = (id) => {
    window.store.deleteTask(id);
    renderAll();
  };

  window.deleteSlot = (id) => {
    window.store.deleteScheduleSlot(id);
    renderAll();
  };

  window.selectCalDay = (dateStr) => {
    selectedCalDayStr = dateStr;
    renderCalendar();
  };

  window.openDeadlineWithDate = (dateStr) => {
    document.getElementById('dl-input-date').value = dateStr;
    openModal('modal-deadline');
  };

  window.deleteDeadline = (id) => {
    window.store.deleteDeadline(id);
    renderAll();
  };

  window.selectSubject = (id) => {
    activeSubjectId = id;
    renderSubjectsView();
  };

  window.editSubject = (id) => {
    const sub = window.store.subjects.find(s => s.id === id);
    if (!sub) return;
    document.getElementById('sub-edit-id').value = sub.id;
    document.getElementById('sub-input-name').value = sub.name;
    document.getElementById('sub-input-prof').value = sub.professor || '';
    document.getElementById('sub-input-target').value = sub.targetHoursPerWeek || 6;
    document.getElementById('sub-input-color').value = sub.color || '#6366f1';
    document.getElementById('subject-modal-title').innerText = 'Editar Disciplina';
    openModal('modal-subject');
  };

  window.deleteSubject = (id) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina e todos os seus tópicos?')) {
      window.store.deleteSubject(id);
      activeSubjectId = window.store.subjects[0]?.id || null;
      renderAll();
    }
  };

  window.openTopicModal = (subjectId) => {
    activeSubjectId = subjectId;
    openModal('modal-topic');
  };

  window.filterTopics = (status) => {
    activeTopicFilter = status;
    renderSubjectsView();
  };

  window.updateTopicStatus = (subjectId, topicId, status) => {
    window.store.updateTopicStatus(subjectId, topicId, status);
    renderAll();
  };

  window.deleteTopic = (subjectId, topicId) => {
    window.store.deleteTopic(subjectId, topicId);
    renderAll();
  };

  window.filterFlashcards = (subjectId) => {
    activeFlashcardFilter = subjectId;
    renderFlashcardsView();
  };

  window.deleteFlashcard = (id) => {
    window.store.deleteFlashcard(id);
    renderAll();
  };
});
