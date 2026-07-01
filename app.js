/* ==========================================================================
   Lemonly Walking Challenge 2026 - Main Application Logic
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Firebase Compat Initialization
// --------------------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyCwoL-6WhuSLkWIPld3xPpqRr26hmfZp70",
    authDomain: "lemonly-walking-challenge.firebaseapp.com",
    projectId: "lemonly-walking-challenge",
    storageBucket: "lemonly-walking-challenge.firebasestorage.app",
    messagingSenderId: "888431680562",
    appId: "1:888431680562:web:2a10f6b76614e153ad702b",
    measurementId: "G-HSBTSNXBVX"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// --------------------------------------------------------------------------
// 2. Constants
// --------------------------------------------------------------------------
const TARGET_STEPS = 3224000;
const TARGET_MILES = 1612;
const TARGET_KM    = 2595;
const STEPS_PER_MILE = 2000;

const TEAM_MEMBERS = [
    { name: "Alex Munce",         photo: "assets/team-headshots/alex-munce.jpg" },
    { name: "Amy Moore",          photo: "assets/team-headshots/amy-moore.JPG" },
    { name: "Ashton Dockendorf",  photo: "assets/team-headshots/ashton-dockendorf.JPG" },
    { name: "Brett Hanes",        photo: "assets/team-headshots/brett-hanes.jpg" },
    { name: "Carly Schultz",      photo: "assets/team-headshots/carly-schultz.jpg" },
    { name: "Carly Vavra",        photo: "assets/team-headshots/carly-vavra.jpg" },
    { name: "Chris Prendergast",  photo: "assets/team-headshots/chris-prendergast.jpg" },
    { name: "Cortney Carmody",    photo: "assets/team-headshots/cortney-carmody.jpg" },
    { name: "Dafne Sagastume",    photo: "assets/team-headshots/dafne-sagastume.JPG" },
    { name: "Deirdre Nuebel",     photo: "assets/team-headshots/deirdre-nuebel.jpg" },
    { name: "Ella Olsen",         photo: "assets/team-headshots/ella-olsen.jpg" },
    { name: "Emily Larson",       photo: "assets/team-headshots/emily-larson.jpg" },
    { name: "Emily Petoske",      photo: "assets/team-headshots/emily-petoske.JPG" },
    { name: "Greta Feist",        photo: "assets/team-headshots/greta-feist.jpg" },
    { name: "Hayleigh Elkins",    photo: "assets/team-headshots/hayleigh-elkins.jpg" },
    { name: "Jade Delaney",       photo: "assets/team-headshots/jade-delaney.jpg" },
    { name: "Kaley Schweitzer",   photo: "assets/team-headshots/kaley-schweitzer.jpg" },
    { name: "Maddie Mack",        photo: "assets/team-headshots/maddie-mack.JPG" },
    { name: "Madisyn Stogsdill",  photo: "assets/team-headshots/madisyn-stogsdill.jpg" },
    { name: "Michael Mazourek",   photo: "assets/team-headshots/michael-mazourek.JPG" },
    { name: "Natalie Eisenberg",  photo: "assets/team-headshots/natalie-eisenberg.jpg" },
    { name: "Nicholas Schnell",   photo: "assets/team-headshots/nicholas-schnell.jpg" },
    { name: "Nick Lorang",        photo: "assets/team-headshots/nick-lorang.JPG" },
    { name: "Quinn Tisdale",      photo: "assets/team-headshots/quinn-tisdale.jpg" },
    { name: "Rachel Meyer",       photo: "assets/team-headshots/rachel-meyer.jpg" },
    { name: "Reagan Monson",      photo: "assets/team-headshots/reagan-monson.jpg" },
    { name: "Tessa Sánchez",      photo: "assets/team-headshots/tessa-sanchez.jpg" },
    { name: "Ty MacConnell",      photo: "assets/team-headshots/ty-macconnell.jpg" }
];

function getFirstName(name) { return name.split(' ')[0]; }
function getPhotoUrl(name) {
    const m = TEAM_MEMBERS.find(m => m.name === name);
    return m ? m.photo : "assets/lemonly-logo.svg";
}

// --------------------------------------------------------------------------
// 3. Application State
// --------------------------------------------------------------------------
let state = {
    currentUser:  null,
    stepsData:    [],
    viewMode:     "month", // "month" | "day" | "range"
    rangeStart:   null,    // 1–31
    rangeEnd:     null,    // 1–31
    selectedDay:  null,
    sortMode:     "steps", // "alpha" | "steps"
    editingDocId: null
};

// --------------------------------------------------------------------------
// 4. DOM References
// --------------------------------------------------------------------------
const loginBtn          = document.getElementById('loginBtn');
const logoutBtn         = document.getElementById('logoutBtn');
const logStepsBtn       = document.getElementById('logStepsBtn');
const userProfile       = document.getElementById('userProfile');
const userNameEl        = document.getElementById('userName');
const userEmailEl       = document.getElementById('userEmail');
const userAvatarEl      = document.getElementById('userAvatar');

const globalPercentBadge       = document.getElementById('globalPercentBadge');
const thermometerProgressText  = document.getElementById('thermometerProgressText');
const thermometerFill          = document.getElementById('thermometerFill');
const statMiles        = document.getElementById('statMiles');
const statKm           = document.getElementById('statKm');
const statSteps        = document.getElementById('statSteps');
const statGoalDiff     = document.getElementById('statGoalDiff');
const statDailyAvg     = document.getElementById('statDailyAvg');
const statPersonAvg    = document.getElementById('statPersonAvg');

const calendarCurrentHeader    = document.getElementById('calendarCurrentHeader');
const btnCalToday              = document.getElementById('btnCalToday');
const btnCalClear              = document.getElementById('btnCalClear');
const calendarSelectionFeedback= document.getElementById('calendarSelectionFeedback');
const calendarGrid             = document.getElementById('calendarGrid');

const leaderboardScopeBadge    = document.getElementById('leaderboardScopeBadge');
const leaderboardScopeText     = document.getElementById('leaderboardScopeText');
const btnClearLeaderboardFilter= document.getElementById('btnClearLeaderboardFilter');
const leaderboardList          = document.getElementById('leaderboardList');

const sortAlpha       = document.getElementById('sortAlpha');
const sortMonthTotal  = document.getElementById('sortMonthTotal');
const sortThisWeek    = document.getElementById('sortThisWeek');

const entryModal          = document.getElementById('entryModal');
const modalCloseBtn       = document.getElementById('modalCloseBtn');
const modalTitle          = document.getElementById('modalTitle');
const modalDateText       = document.getElementById('modalDateText');
const existingEntriesList = document.getElementById('existingEntriesList');
const logFormSection      = document.getElementById('logFormSection');
const authRequiredNotice  = document.getElementById('authRequiredNotice');
const modalLoginBtn       = document.getElementById('modalLoginBtn');

const entryForm         = document.getElementById('entryForm');
const entryDocIdInput   = document.getElementById('entryDocId');
const entryDateInput    = document.getElementById('entryDate');
const entryUserNameInput= document.getElementById('entryUserName');
const entryStepsInput   = document.getElementById('entrySteps');
const btnCancelEdit     = document.getElementById('btnCancelEdit');
const btnSubmitEntry    = document.getElementById('btnSubmitEntry');
const formActionTitle   = document.getElementById('formActionTitle');
const entryFormError    = document.getElementById('entryFormError');
const entryFormSuccess  = document.getElementById('entryFormSuccess');

// --------------------------------------------------------------------------
// 5. Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    populateUserDropdown();
    setupEventListeners();
    subscribeToSteps();
});

function populateUserDropdown() {
    entryUserNameInput.innerHTML = '<option value="" disabled selected>Select a Lemonhead…</option>';
    TEAM_MEMBERS.forEach(m => {
        const opt = document.createElement('option');
        opt.value       = m.name;
        opt.textContent = m.name;
        entryUserNameInput.appendChild(opt);
    });
}

// --------------------------------------------------------------------------
// 6. Authentication
// --------------------------------------------------------------------------
auth.onAuthStateChanged(user => {
    if (user) {
        const email = user.email || "";
        if (email.endsWith("@lemonly.com") || email.endsWith("@clickrain.com")) {
            state.currentUser = user;
            updateAuthUI(true, user);
        } else {
            alert("Access restricted to @lemonly.com and @clickrain.com accounts.");
            auth.signOut();
            state.currentUser = null;
            updateAuthUI(false, null);
        }
    } else {
        state.currentUser = null;
        updateAuthUI(false, null);
    }
});

function updateAuthUI(isLoggedIn, user) {
    if (isLoggedIn) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userNameEl.textContent  = user.displayName || "User";
        userEmailEl.textContent = user.email || "";
        userAvatarEl.src        = user.photoURL || "assets/lemonly-logo.svg";
        logFormSection.classList.remove('hidden');
        authRequiredNotice.classList.add('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
        logFormSection.classList.add('hidden');
        authRequiredNotice.classList.remove('hidden');
    }
    renderModalEntriesList();
}

async function signInWithGoogle() {
    try { await auth.signInWithPopup(provider); }
    catch (err) { console.error("Sign-in failed:", err); alert("Google Sign-In failed. Please try again."); }
}

// --------------------------------------------------------------------------
// 7. Firestore Real-time Sync
// --------------------------------------------------------------------------
function subscribeToSteps() {
    db.collection("steps").onSnapshot(snapshot => {
        state.stepsData = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            state.stepsData.push({
                id:          doc.id,
                userName:    d.userName,
                date:        d.date,
                steps:       parseInt(d.steps) || 0,
                submittedAt: d.submittedAt
            });
        });
        calculateGlobalStats();
        renderCalendar();
        updateLeaderboard();
        renderModalEntriesList();
    }, err => console.error("Firestore sync error:", err));
}

// --------------------------------------------------------------------------
// 8. Statistics Calculations
// --------------------------------------------------------------------------
function getElapsedDays() {
    const now = new Date();
    const y   = now.getFullYear();
    const mo  = now.getMonth(); // 0-indexed; 6 = July
    if (y < 2026 || (y === 2026 && mo < 6)) return 1;
    if (y === 2026 && mo === 6) return now.getDate();
    return 31;
}

function calculateGlobalStats() {
    const totalSteps  = state.stepsData.reduce((s, e) => s + e.steps, 0);
    const totalMiles  = totalSteps / STEPS_PER_MILE;
    const totalKm     = totalMiles * (TARGET_KM / TARGET_MILES);
    const stepsToGoal = Math.max(TARGET_STEPS - totalSteps, 0);
    const progress    = Math.min((totalSteps / TARGET_STEPS) * 100, 100);
    const elapsed     = getElapsedDays();
    const avgTeam     = elapsed > 0 ? totalSteps / elapsed : 0;
    const avgPerson   = elapsed > 0 ? totalSteps / (TEAM_MEMBERS.length * elapsed) : 0;

    statSteps.textContent  = totalSteps.toLocaleString();
    statMiles.textContent  = totalMiles.toLocaleString(undefined, { maximumFractionDigits: 1 });
    statKm.textContent     = totalKm.toLocaleString(undefined, { maximumFractionDigits: 1 }) + " km";
    statDailyAvg.textContent  = Math.round(avgTeam).toLocaleString();
    statPersonAvg.textContent = Math.round(avgPerson).toLocaleString();

    if (stepsToGoal > 0) {
        statGoalDiff.textContent = `${stepsToGoal.toLocaleString()} to go`;
        statGoalDiff.style.color = "";
    } else {
        statGoalDiff.textContent = "Goal Achieved! 🎉";
        statGoalDiff.style.color = "var(--color-coral)";
    }

    globalPercentBadge.textContent    = `${progress.toFixed(1)}% Complete`;
    thermometerProgressText.textContent = `${totalSteps.toLocaleString()} / ${TARGET_STEPS.toLocaleString()} steps`;
    thermometerFill.style.width        = `${progress}%`;
}

// --------------------------------------------------------------------------
// 9. Calendar Rendering & Range Selection
// --------------------------------------------------------------------------
// July 2026 starts on Wednesday (day index 3, where Sun=0)
const JULY_START_OFFSET = 3;
const JULY_DAYS         = 31;

function getTodayDay() {
    const now = new Date();
    if (now.getFullYear() === 2026 && now.getMonth() === 6) return now.getDate();
    return null;
}

function renderCalendar() {
    calendarGrid.innerHTML = "";
    const todayDay = getTodayDay();

    // Blank offset cells
    for (let i = 0; i < JULY_START_OFFSET; i++) {
        const blank = document.createElement('div');
        blank.className = "calendar-day empty";
        calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= JULY_DAYS; day++) {
        const cell = document.createElement('div');
        cell.className = "calendar-day";
        cell.dataset.day = day;
        cell.textContent = day;

        // Today outline
        if (day === todayDay) cell.classList.add('today');

        // Range states
        if (state.rangeStart !== null) {
            if (state.rangeEnd !== null) {
                if (day === state.rangeStart)  cell.classList.add('range-start');
                else if (day === state.rangeEnd) cell.classList.add('range-end');
                else if (day > state.rangeStart && day < state.rangeEnd) cell.classList.add('range-in');
            } else {
                if (day === state.rangeStart) cell.classList.add('range-start');
            }
        }

        // Dot indicator for days with step data
        const dateStr = `2026-07-${String(day).padStart(2,'0')}`;
        const hasData = state.stepsData.some(e => e.date === dateStr && e.steps > 0);
        if (hasData) {
            const dot = document.createElement('div');
            dot.className = "calendar-dot";
            cell.appendChild(dot);
        }

        cell.addEventListener('click',      () => onDayClick(day));
        cell.addEventListener('mouseenter', () => onDayHover(day));
        calendarGrid.appendChild(cell);
    }

    calendarGrid.onmouseleave = () => clearHoverPreviews();
    updateCalendarBadge();
}

function onDayClick(day) {
    if (state.rangeStart === null || state.rangeEnd !== null) {
        // Starting a new range — open modal for this day
        state.rangeStart = day;
        state.rangeEnd   = null;
        state.viewMode   = "day";
        openLogModal(day);
    } else {
        // Second click
        if (day === state.rangeStart) {
            // Same day — keep as single-day selection, re-open modal
            openLogModal(day);
        } else if (day < state.rangeStart) {
            // Earlier day — restart range from here
            state.rangeStart = day;
            state.rangeEnd   = null;
            state.viewMode   = "day";
            openLogModal(day);
        } else {
            // Complete the range
            state.rangeEnd = day;
            state.viewMode = "range";
        }
    }

    renderCalendar();
    updateLeaderboard();
}

function onDayHover(hoveredDay) {
    if (state.rangeStart !== null && state.rangeEnd === null) {
        document.querySelectorAll('.calendar-day').forEach(cell => {
            const d = parseInt(cell.dataset.day);
            if (d) {
                cell.classList.remove('range-preview');
                if (d > state.rangeStart && d <= hoveredDay) {
                    cell.classList.add('range-preview');
                }
            }
        });
    }
}

function clearHoverPreviews() {
    document.querySelectorAll('.calendar-day.range-preview').forEach(c => c.classList.remove('range-preview'));
}

function updateCalendarBadge() {
    let badgeText = "Month Total";
    if (state.viewMode === "month") {
        calendarSelectionFeedback.textContent = "Month Total";
        calendarSelectionFeedback.className   = "badge badge-teal";
    } else if (state.viewMode === "day") {
        const d = state.rangeStart;
        badgeText = `Jul ${d}`;
        calendarSelectionFeedback.textContent = badgeText;
        calendarSelectionFeedback.className   = "badge badge-coral";
    } else if (state.viewMode === "range") {
        badgeText = `Jul ${state.rangeStart}–${state.rangeEnd}`;
        calendarSelectionFeedback.textContent = badgeText;
        calendarSelectionFeedback.className   = "badge badge-coral";
    }
}

function resetToMonthView() {
    state.viewMode  = "month";
    state.rangeStart = null;
    state.rangeEnd   = null;
    renderCalendar();
    updateLeaderboard();
}

function getSelectedRange() {
    if (state.viewMode === "month")  return { start: 1, end: 31, days: getElapsedDays() };
    if (state.viewMode === "day")    return { start: state.rangeStart, end: state.rangeStart, days: 1 };
    if (state.viewMode === "range")  return { start: state.rangeStart, end: state.rangeEnd, days: state.rangeEnd - state.rangeStart + 1 };
    return { start: 1, end: 31, days: getElapsedDays() };
}

// Returns the Monday-to-Sunday range for the current week within July 2026.
function getThisWeekRange() {
    const now = new Date();
    const refDate = (now.getFullYear() === 2026 && now.getMonth() === 6)
        ? now
        : new Date(2026, 6, 1); // fallback to July 1 if not in July 2026
    const dow = refDate.getDay(); // 0=Sun
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const mondayDate = new Date(refDate);
    mondayDate.setDate(refDate.getDate() + mondayOffset);
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const start = clamp(mondayDate.getDate(), 1, 31);
    const end   = clamp(sundayDate.getDate(), 1, 31);

    // Confirm we're actually in July for both
    const julyStart = new Date(2026, 6, 1);
    const julyEnd   = new Date(2026, 6, 31);
    const realStart = mondayDate < julyStart ? 1  : start;
    const realEnd   = sundayDate > julyEnd   ? 31 : end;
    return { start: realStart, end: realEnd, days: realEnd - realStart + 1 };
}

// --------------------------------------------------------------------------
// 10. Leaderboard
// --------------------------------------------------------------------------
function updateLeaderboard() {
    leaderboardList.innerHTML = "";

    // Determine scope text
    let scopeText = "";
    if (state.viewMode === "month") {
        scopeText = "Showing: July 2026 (Month total)";
        leaderboardScopeBadge.textContent = "Month Total";
        leaderboardScopeBadge.className   = "badge badge-teal";
        btnClearLeaderboardFilter.classList.add('hidden');
    } else if (state.viewMode === "day") {
        scopeText = `Showing: July ${state.rangeStart}, 2026`;
        leaderboardScopeBadge.textContent = `July ${state.rangeStart}`;
        leaderboardScopeBadge.className   = "badge badge-coral";
        btnClearLeaderboardFilter.classList.remove('hidden');
    } else if (state.viewMode === "range") {
        scopeText = `Showing: July ${state.rangeStart}–${state.rangeEnd}, 2026`;
        leaderboardScopeBadge.textContent = `Jul ${state.rangeStart}–${state.rangeEnd}`;
        leaderboardScopeBadge.className   = "badge badge-coral";
        btnClearLeaderboardFilter.classList.remove('hidden');
    }
    leaderboardScopeText.textContent = scopeText;

    const standings = getAggregatedStandings();

    standings.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.className = "leaderboard-item";
        const photo   = getPhotoUrl(entry.userName);
        const miles   = (entry.steps / STEPS_PER_MILE).toFixed(1);
        const avgSteps = Math.round(entry.avgSteps);

        li.innerHTML = `
            <div class="leaderboard-left">
                <span class="rank-badge">${idx + 1}</span>
                <img src="${photo}" alt="${entry.userName}" class="leaderboard-photo" onerror="this.src='assets/lemonly-logo.svg'">
                <span class="leaderboard-name">${entry.userName}</span>
            </div>
            <div class="leaderboard-right">
                <span class="leaderboard-steps">${entry.steps.toLocaleString()} <small>steps</small></span>
                <span class="leaderboard-miles">${miles} mi &nbsp;|&nbsp; Avg: ${avgSteps.toLocaleString()}</span>
            </div>
        `;
        leaderboardList.appendChild(li);
    });
}

function getAggregatedStandings() {
    const range = getSelectedRange();
    const totals = {};
    TEAM_MEMBERS.forEach(m => { totals[m.name] = 0; });

    state.stepsData.forEach(entry => {
        const dayNum = parseInt(entry.date.split('-')[2]);
        if (dayNum >= range.start && dayNum <= range.end) {
            if (totals[entry.userName] !== undefined) {
                totals[entry.userName] += entry.steps;
            }
        }
    });

    const activeDays = range.days;
    const hasData = Object.values(totals).some(v => v > 0);

    const list = Object.keys(totals).map(name => ({
        userName: name,
        steps:    totals[name],
        avgSteps: activeDays > 0 ? totals[name] / activeDays : 0
    }));

    if (state.sortMode === "alpha") {
        list.sort((a, b) => getFirstName(a.userName).localeCompare(getFirstName(b.userName)));
    } else {
        // Steps descending, then alpha by first name for ties
        list.sort((a, b) => {
            if (b.steps !== a.steps) return b.steps - a.steps;
            return getFirstName(a.userName).localeCompare(getFirstName(b.userName));
        });
        // When no data, fall back to alpha
        if (!hasData && state.sortMode === "steps") {
            list.sort((a, b) => getFirstName(a.userName).localeCompare(getFirstName(b.userName)));
        }
    }

    return list;
}

// --------------------------------------------------------------------------
// 11. Sort Preset Buttons
// --------------------------------------------------------------------------
function setActiveSortBtn(btnEl) {
    [sortAlpha, sortMonthTotal, sortThisWeek].forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
}

sortAlpha.addEventListener('click', () => {
    state.sortMode = "alpha";
    setActiveSortBtn(sortAlpha);
    updateLeaderboard();
});

sortMonthTotal.addEventListener('click', () => {
    state.sortMode = "steps";
    setActiveSortBtn(sortMonthTotal);
    resetToMonthView();
});

sortThisWeek.addEventListener('click', () => {
    state.sortMode = "steps";
    setActiveSortBtn(sortThisWeek);
    const week = getThisWeekRange();
    state.rangeStart = week.start;
    state.rangeEnd   = week.end;
    state.viewMode   = "range";
    renderCalendar();
    updateLeaderboard();
});

// --------------------------------------------------------------------------
// 12. Log Modal
// --------------------------------------------------------------------------
function openLogModal(day) {
    // day may be null if opened from the header button
    const targetDay = day || state.rangeStart || getTodayDay() || 1;
    state.selectedDay = targetDay;

    const dateStr = `2026-07-${String(targetDay).padStart(2,'0')}`;
    entryDateInput.value = dateStr;
    modalDateText.textContent = formatDayLabel(targetDay);
    resetLogForm();
    renderModalEntriesList();
    entryModal.classList.remove('hidden');
}

function openLogModalFromHeader() {
    const today = new Date();
    let day = 1;
    if (today.getFullYear() === 2026 && today.getMonth() === 6) {
        day = today.getDate();
    }
    // Don't change the calendar selection state; just open the modal
    state.selectedDay = day;
    const dateStr = `2026-07-${String(day).padStart(2,'0')}`;
    entryDateInput.value = dateStr;
    modalDateText.textContent = formatDayLabel(day);
    resetLogForm();
    renderModalEntriesList();
    entryModal.classList.remove('hidden');
}

function formatDayLabel(day) {
    return `July ${day}, 2026`;
}

function closeLogModal() {
    entryModal.classList.add('hidden');
    resetLogForm();
}

function resetLogForm() {
    entryForm.reset();
    state.editingDocId = null;
    entryDocIdInput.value = '';
    entryUserNameInput.disabled = false;
    btnCancelEdit.style.display = 'none';
    formActionTitle.textContent = "Add Entry";
    btnSubmitEntry.innerHTML = '<i class="fas fa-save"></i> Save Entry';
    clearFormFeedback();
    // Restore date picker to selected day
    const d = state.selectedDay || 1;
    entryDateInput.value = `2026-07-${String(d).padStart(2,'0')}`;
}

function clearFormFeedback() {
    entryFormError.classList.add('hidden');
    entryFormSuccess.classList.add('hidden');
}

// Update modal entries when the date input changes
entryDateInput.addEventListener('change', () => {
    const parts = entryDateInput.value.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[2]);
        if (day >= 1 && day <= 31) {
            state.selectedDay = day;
            modalDateText.textContent = formatDayLabel(day);
            renderModalEntriesList();
        }
    }
});

function renderModalEntriesList() {
    existingEntriesList.innerHTML = '';
    const day     = state.selectedDay;
    if (!day) {
        existingEntriesList.innerHTML = '<p class="no-entries">Pick a date to view entries.</p>';
        return;
    }
    const dateStr = `2026-07-${String(day).padStart(2,'0')}`;
    const entries = state.stepsData.filter(e => e.date === dateStr);

    if (entries.length === 0) {
        existingEntriesList.innerHTML = '<p class="no-entries">No steps logged for this day yet.</p>';
        return;
    }

    entries.sort((a, b) => a.userName.localeCompare(b.userName));
    entries.forEach(entry => {
        const item = document.createElement('div');
        item.className = "existing-entry-item";
        const photo = getPhotoUrl(entry.userName);
        let actionHtml = '';
        if (state.currentUser) {
            actionHtml = `
                <div class="entry-actions">
                    <button class="btn-icon btn-edit-entry"   title="Edit"   data-id="${entry.id}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn-icon btn-delete-entry" title="Delete" data-id="${entry.id}"><i class="fas fa-trash-alt"></i></button>
                </div>`;
        }
        item.innerHTML = `
            <div class="entry-user-details">
                <img src="${photo}" alt="${entry.userName}" class="entry-user-photo" onerror="this.src='assets/lemonly-logo.svg'">
                <span class="entry-info">${entry.userName}: <strong>${entry.steps.toLocaleString()}</strong> steps</span>
            </div>
            ${actionHtml}`;

        if (state.currentUser) {
            item.querySelector('.btn-edit-entry').addEventListener('click', () => loadEntryForEditing(entry));
            item.querySelector('.btn-delete-entry').addEventListener('click', () => deleteEntry(entry.id));
        }
        existingEntriesList.appendChild(item);
    });
}

function loadEntryForEditing(entry) {
    clearFormFeedback();
    state.editingDocId = entry.id;
    entryDocIdInput.value         = entry.id;
    entryUserNameInput.value      = entry.userName;
    entryUserNameInput.disabled   = true;
    entryStepsInput.value         = entry.steps;
    btnCancelEdit.style.display   = 'inline-flex';
    formActionTitle.textContent   = "Edit Entry";
    btnSubmitEntry.innerHTML      = '<i class="fas fa-check"></i> Update Entry';
    entryStepsInput.focus();
}

btnCancelEdit.addEventListener('click', resetLogForm);

entryForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearFormFeedback();
    if (!state.currentUser) { showFormError("Sign in to save entries."); return; }

    const userName = entryUserNameInput.value;
    const steps    = parseInt(entryStepsInput.value);
    const day      = state.selectedDay;
    const dateStr  = `2026-07-${String(day).padStart(2,'0')}`;

    if (!userName)             { showFormError("Please select a team member.");             return; }
    if (isNaN(steps) || steps < 0) { showFormError("Please enter a valid step count (0 or more)."); return; }

    btnSubmitEntry.disabled = true;
    try {
        if (state.editingDocId) {
            await db.collection("steps").doc(state.editingDocId).set(
                { userName, date: dateStr, steps, submittedAt: firebase.firestore.FieldValue.serverTimestamp() },
                { merge: true }
            );
            showFormSuccess("Entry updated!");
        } else {
            const existing = state.stepsData.find(e => e.userName === userName && e.date === dateStr);
            if (existing) {
                await db.collection("steps").doc(existing.id).set(
                    { userName, date: dateStr, steps, submittedAt: firebase.firestore.FieldValue.serverTimestamp() },
                    { merge: true }
                );
                showFormSuccess("Steps updated for this day.");
            } else {
                await db.collection("steps").add({
                    userName, date: dateStr, steps,
                    submittedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                showFormSuccess("Steps saved!");
            }
        }
        setTimeout(() => { resetLogForm(); renderModalEntriesList(); }, 1200);
    } catch (err) {
        console.error("Firestore error:", err);
        showFormError("Error saving: " + err.message);
    } finally {
        btnSubmitEntry.disabled = false;
    }
});

async function deleteEntry(docId) {
    if (!confirm("Delete this step entry?")) return;
    try {
        await db.collection("steps").doc(docId).delete();
        showFormSuccess("Entry deleted.");
        setTimeout(() => { clearFormFeedback(); renderModalEntriesList(); }, 1000);
    } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete: " + err.message);
    }
}

function showFormError(msg) {
    entryFormError.textContent = msg;
    entryFormError.classList.remove('hidden');
    entryFormSuccess.classList.add('hidden');
}
function showFormSuccess(msg) {
    entryFormSuccess.textContent = msg;
    entryFormSuccess.classList.remove('hidden');
    entryFormError.classList.add('hidden');
}

// --------------------------------------------------------------------------
// 13. Event Listeners
// --------------------------------------------------------------------------
function setupEventListeners() {
    loginBtn.addEventListener('click',      () => signInWithGoogle());
    modalLoginBtn.addEventListener('click', () => signInWithGoogle());
    logoutBtn.addEventListener('click',     () => auth.signOut());
    logStepsBtn.addEventListener('click',   () => openLogModalFromHeader());

    calendarCurrentHeader.addEventListener('click', resetToMonthView);
    btnCalClear.addEventListener('click', () => {
        state.rangeStart = null;
        state.rangeEnd   = null;
        state.viewMode   = "month";
        renderCalendar();
        updateLeaderboard();
    });

    btnCalToday.addEventListener('click', () => {
        const today = new Date();
        const day   = (today.getFullYear() === 2026 && today.getMonth() === 6) ? today.getDate() : 1;
        state.rangeStart = day;
        state.rangeEnd   = null;
        state.viewMode   = "day";
        renderCalendar();
        updateLeaderboard();
    });

    btnClearLeaderboardFilter.addEventListener('click', resetToMonthView);

    modalCloseBtn.addEventListener('click', closeLogModal);
    entryModal.addEventListener('click', e => { if (e.target === entryModal) closeLogModal(); });
    document.addEventListener('keydown', e => {
        if (e.key === "Escape" && !entryModal.classList.contains('hidden')) closeLogModal();
    });
}
