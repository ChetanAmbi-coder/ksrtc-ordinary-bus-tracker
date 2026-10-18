/**
 * KSRTC Ordinary Bus Tracker — Frontend Application
 * Interacts with Backend REST API, Leaflet Karnataka Map,
 * Driver GPS Telemetry Engine, 31 Karnataka Districts, and
 * Passenger Authentication & KSRTC Staff PF Login.
 */

const API_BASE = '/api';

// Application State
let currentBuses = [];
let allDistricts = [];
let activeCity = 'All';
let filterShakthiOnly = false;
let selectedBusId = null;
let hasUserSearched = false;

// Auth State
let currentUser = null;
let currentEmployee = null;

// Map State
let karnatakaMap = null;
let busMarkers = {};

// DOM Elements
const busesGrid = document.getElementById('buses-grid');
const filterBar = document.getElementById('filter-bar');
const searchForm = document.getElementById('search-form');
const fromInput = document.getElementById('from-stop');
const toInput = document.getElementById('to-stop');
const swapBtn = document.getElementById('swap-btn');
const shakthiCheckbox = document.getElementById('shakthi-filter-checkbox');

// District & Taluk Selector Elements
const districtDropdown = document.getElementById('district-dropdown');
const talukDropdown = document.getElementById('taluk-dropdown');
const talukCountLabel = document.getElementById('taluk-count-label');
const setFromBtn = document.getElementById('set-from-btn');
const setToBtn = document.getElementById('set-to-btn');
const placesDatalist = document.getElementById('karnataka-places-datalist');
const districtsCountBadge = document.getElementById('districts-count-badge');

// Bus Details Modal Elements
const busModal = document.getElementById('bus-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalBusNo = document.getElementById('modal-bus-no');
const modalBusStatus = document.getElementById('modal-bus-status');
const modalTelemetrySource = document.getElementById('modal-telemetry-source');
const modalTelemetryTime = document.getElementById('modal-telemetry-time');
const modalCurrentStop = document.getElementById('modal-current-stop');
const modalNextStop = document.getElementById('modal-next-stop');
const modalEta = document.getElementById('modal-eta');
const modalTimeline = document.getElementById('modal-timeline');
const modalSimulateBtn = document.getElementById('modal-simulate-btn');

// Auth Modal Elements
const authModal = document.getElementById('auth-modal');
const openAuthBtn = document.getElementById('open-auth-btn');
const authCloseBtn = document.getElementById('auth-close-btn');
const navbarAuthContainer = document.getElementById('navbar-auth-container');
const tabPassengerBtn = document.getElementById('tab-passenger-btn');
const tabEmployeeBtn = document.getElementById('tab-employee-btn');
const passengerAuthPanel = document.getElementById('passenger-auth-panel');
const employeeAuthPanel = document.getElementById('employee-auth-panel');
const authShowLoginBtn = document.getElementById('auth-show-login-btn');
const authShowRegisterBtn = document.getElementById('auth-show-register-btn');
const passengerLoginForm = document.getElementById('passenger-login-form');
const passengerRegisterForm = document.getElementById('passenger-register-form');
const employeeLoginForm = document.getElementById('employee-login-form');
const googleLoginBtn = document.getElementById('google-login-btn');
const regPasswordInput = document.getElementById('reg-password');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const authAlertBox = document.getElementById('auth-alert-box');

/**
 * Initialize application on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initKarnatakaMap();
  loadDistricts();
  restoreSession();
  loadBuses(false); // Initial render showing clean search guide
  loadStats();

  // Periodic sync every 15 seconds to reflect driver GPS updates live
  setInterval(() => {
    if (hasUserSearched) {
      loadBuses(false);
    }
  }, 15000);
});

/**
 * Setup UI Event Listeners
 */
function setupEventListeners() {
  // Search form submit — Trigger bus search
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hasUserSearched = true;
      loadBuses(true, {
        from: fromInput.value.trim(),
        to: toInput.value.trim()
      });
      
      const busesSection = document.getElementById('buses');
      if (busesSection) {
        busesSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Swap From / To stops
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = fromInput.value;
      fromInput.value = toInput.value;
      toInput.value = temp;
    });
  }

  // Shakthi Scheme Filter Checkbox
  if (shakthiCheckbox) {
    shakthiCheckbox.addEventListener('change', (e) => {
      filterShakthiOnly = e.target.checked;
      hasUserSearched = true;
      loadBuses(true);
    });
  }

  // Filter Bar (City & Shakthi Filter)
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      hasUserSearched = true;
      if (btn.getAttribute('data-shakthi') === 'only') {
        filterShakthiOnly = true;
        if (shakthiCheckbox) shakthiCheckbox.checked = true;
      } else {
        activeCity = btn.getAttribute('data-city') || 'All';
        if (btn.getAttribute('data-city') === 'All') {
          filterShakthiOnly = false;
          if (shakthiCheckbox) shakthiCheckbox.checked = false;
        }
      }

      loadBuses(true, {
        city: activeCity !== 'All' ? activeCity : '',
        from: fromInput.value.trim(),
        to: toInput.value.trim()
      });
    });
  }

  // District Dropdown Change Event
  if (districtDropdown) {
    districtDropdown.addEventListener('change', (e) => {
      const districtName = e.target.value;
      const found = allDistricts.find(d => d.district === districtName);
      if (found) {
        talukCountLabel.textContent = found.talukCount;
        talukDropdown.disabled = false;
        talukDropdown.innerHTML = `
          <option value="${found.district}">${found.district} (All Taluks)</option>
          ${found.taluks.map(t => `<option value="${t}">${t}</option>`).join('')}
        `;
        setFromBtn.disabled = false;
        setToBtn.disabled = false;
      } else {
        talukCountLabel.textContent = '0';
        talukDropdown.disabled = true;
        talukDropdown.innerHTML = `<option value="">-- Choose District First --</option>`;
        setFromBtn.disabled = true;
        setToBtn.disabled = true;
      }
    });
  }

  // Set as From Button
  if (setFromBtn) {
    setFromBtn.addEventListener('click', () => {
      const selectedValue = talukDropdown.value || districtDropdown.value;
      if (selectedValue) {
        fromInput.value = selectedValue;
        highlightInput(fromInput);
      }
    });
  }

  // Set as To Button
  if (setToBtn) {
    setToBtn.addEventListener('click', () => {
      const selectedValue = talukDropdown.value || districtDropdown.value;
      if (selectedValue) {
        toInput.value = selectedValue;
        highlightInput(toInput);
      }
    });
  }

  // Popular routes click binding
  document.querySelectorAll('.route-card').forEach(card => {
    const link = card.querySelector('.route-card__link');
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cities = card.querySelectorAll('.route-card__city');
        if (cities.length >= 2) {
          fromInput.value = cities[0].textContent.trim();
          toInput.value = cities[1].textContent.trim();
          hasUserSearched = true;
          loadBuses(true, {
            from: fromInput.value,
            to: toInput.value
          });
          const busesSection = document.getElementById('buses');
          if (busesSection) {
            busesSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }
  });

  // Bus Details Modal Close Events
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeBusModal);
  }
  if (busModal) {
    busModal.addEventListener('click', (e) => {
      if (e.target === busModal) closeBusModal();
    });
  }

  // Auth Modal Setup
  setupAuthModalListeners();

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBusModal();
      closeAuthModal();
    }
  });

  // Simulate Telemetry Ping Button
  if (modalSimulateBtn) {
    modalSimulateBtn.addEventListener('click', handleSimulatePing);
  }
}

/**
 * Setup Authentication Modal & Form Listeners
 */
function setupAuthModalListeners() {
  if (openAuthBtn) {
    openAuthBtn.addEventListener('click', openAuthModal);
  }
  if (authCloseBtn) {
    authCloseBtn.addEventListener('click', closeAuthModal);
  }
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Role Tab Switching (Passenger vs KSRTC Employee)
  if (tabPassengerBtn && tabEmployeeBtn) {
    tabPassengerBtn.addEventListener('click', () => {
      tabPassengerBtn.classList.add('auth-role-tab--active');
      tabEmployeeBtn.classList.remove('auth-role-tab--active');
      passengerAuthPanel.style.display = 'block';
      employeeAuthPanel.style.display = 'none';
      hideAuthAlert();
    });

    tabEmployeeBtn.addEventListener('click', () => {
      tabEmployeeBtn.classList.add('auth-role-tab--active');
      tabPassengerBtn.classList.remove('auth-role-tab--active');
      employeeAuthPanel.style.display = 'block';
      passengerAuthPanel.style.display = 'none';
      hideAuthAlert();
    });
  }

  // Sub Toggle (Sign In vs Create Account)
  if (authShowLoginBtn && authShowRegisterBtn) {
    authShowLoginBtn.addEventListener('click', () => {
      authShowLoginBtn.classList.add('sub-toggle-btn--active');
      authShowRegisterBtn.classList.remove('sub-toggle-btn--active');
      passengerLoginForm.style.display = 'block';
      passengerRegisterForm.style.display = 'none';
      hideAuthAlert();
    });

    authShowRegisterBtn.addEventListener('click', () => {
      authShowRegisterBtn.classList.add('sub-toggle-btn--active');
      authShowLoginBtn.classList.remove('sub-toggle-btn--active');
      passengerRegisterForm.style.display = 'block';
      passengerLoginForm.style.display = 'none';
      hideAuthAlert();
    });
  }

  // Password Strength Meter Listener
  if (regPasswordInput) {
    regPasswordInput.addEventListener('input', () => {
      const val = regPasswordInput.value;
      const strength = checkPasswordStrength(val);
      strengthBar.style.width = strength.percent + '%';
      strengthBar.style.background = strength.color;
      strengthText.textContent = `Password Strength: ${strength.label}`;
      strengthText.style.color = strength.color;
    });
  }

  // Passenger Register Form Submit
  if (passengerRegisterForm) {
    passengerRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const gender = document.getElementById('reg-gender').value;
      const password = regPasswordInput.value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;

      // Strict email format check (@gmail.com or valid domain)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAuthAlert('Invalid email format. Please provide a valid email (e.g. name@gmail.com).', 'red');
        return;
      }

      // Password strength validation
      const strength = checkPasswordStrength(password);
      if (strength.label === 'Weak') {
        showAuthAlert('Password is too weak. Please combine letters and numbers (Medium or Strong required).', 'red');
        return;
      }

      if (password !== confirmPassword) {
        showAuthAlert('Passwords do not match. Please re-enter confirm password.', 'red');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, gender, password, confirmPassword })
        });
        const json = await res.json();
        if (json.success) {
          currentUser = json.user;
          saveSession('user', currentUser);
          updateNavbarSession();
          showAuthAlert('Account created successfully! Welcome to KSRTC Tracker.', 'green');
          setTimeout(closeAuthModal, 1500);
        } else {
          showAuthAlert(json.message || 'Registration failed.', 'red');
        }
      } catch (err) {
        showAuthAlert('Server error: ' + err.message, 'red');
      }
    });
  }

  // Passenger Login Form Submit
  if (passengerLoginForm) {
    passengerLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const json = await res.json();
        if (json.success) {
          currentUser = json.user;
          saveSession('user', currentUser);
          updateNavbarSession();
          showAuthAlert(`Welcome back, ${currentUser.name}!`, 'green');
          setTimeout(closeAuthModal, 1200);
        } else {
          showAuthAlert(json.message || 'Invalid credentials.', 'red');
        }
      } catch (err) {
        showAuthAlert('Server error: ' + err.message, 'red');
      }
    });
  }

  // Continue with Google Login
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleEmail: 'kavitha.gowda@gmail.com',
            googleName: 'Kavitha Gowda'
          })
        });
        const json = await res.json();
        if (json.success) {
          currentUser = json.user;
          saveSession('user', currentUser);
          updateNavbarSession();
          showAuthAlert(`Google Sign-In successful: ${currentUser.name}`, 'green');
          setTimeout(closeAuthModal, 1200);
        }
      } catch (err) {
        showAuthAlert('Google Sign-In failed: ' + err.message, 'red');
      }
    });
  }

  // KSRTC Employee (Driver / Conductor) Login Form Submit
  if (employeeLoginForm) {
    employeeLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pfNumber = document.getElementById('emp-pf').value.trim();
      const password = document.getElementById('emp-password').value;

      try {
        const res = await fetch(`${API_BASE}/auth/employee-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pfNumber, password })
        });
        const json = await res.json();
        if (json.success) {
          currentEmployee = json.employee;
          saveSession('employee', currentEmployee);
          updateNavbarSession();
          showAuthAlert(`Verified: ${currentEmployee.role} ${currentEmployee.name} (${currentEmployee.depot}). Entering Driver Cockpit...`, 'green');
          setTimeout(() => {
            closeAuthModal();
            window.location.href = `driver.html?bus=${encodeURIComponent(currentEmployee.assignedBus)}`;
          }, 1500);
        } else {
          showAuthAlert(json.message || 'Employee authentication failed.', 'red');
        }
      } catch (err) {
        showAuthAlert('Server error: ' + err.message, 'red');
      }
    });
  }
}

/**
 * Check password strength (returns Weak / Medium / Strong)
 */
function checkPasswordStrength(password) {
  if (!password || password.length < 6) {
    return { label: 'Weak', percent: 30, color: '#ef4444' };
  }
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  if (password.length >= 8 && hasLetters && hasNumbers && (hasSpecial || hasUpper)) {
    return { label: 'Strong (Great!)', percent: 100, color: '#10b981' };
  }
  if (hasLetters && hasNumbers) {
    return { label: 'Medium (Acceptable)', percent: 65, color: '#f59e0b' };
  }
  return { label: 'Weak (Need letters + numbers)', percent: 30, color: '#ef4444' };
}

function showAuthAlert(msg, type) {
  if (!authAlertBox) return;
  authAlertBox.style.display = 'block';
  authAlertBox.textContent = msg;
  if (type === 'green') {
    authAlertBox.style.background = '#ecfdf5';
    authAlertBox.style.color = '#065f46';
    authAlertBox.style.border = '1px solid #a7f3d0';
  } else {
    authAlertBox.style.background = '#fef2f2';
    authAlertBox.style.color = '#991b1b';
    authAlertBox.style.border = '1px solid #fecaca';
  }
}

function hideAuthAlert() {
  if (authAlertBox) authAlertBox.style.display = 'none';
}

function openAuthModal() {
  if (authModal) {
    authModal.classList.add('modal-backdrop--open');
    authModal.setAttribute('aria-hidden', 'false');
  }
}

function closeAuthModal() {
  if (authModal) {
    authModal.classList.remove('modal-backdrop--open');
    authModal.setAttribute('aria-hidden', 'true');
  }
  hideAuthAlert();
}

/**
 * Quick fill helper for hackathon demo credentials
 */
window.fillEmployeeDemo = function(pf, pass) {
  document.getElementById('emp-pf').value = pf;
  document.getElementById('emp-password').value = pass;
};

/**
 * Save & Restore Session from localStorage
 */
function saveSession(type, data) {
  localStorage.setItem(`ksrtc_${type}`, JSON.stringify(data));
}

function restoreSession() {
  const userJson = localStorage.getItem('ksrtc_user');
  const empJson = localStorage.getItem('ksrtc_employee');
  if (userJson) currentUser = JSON.parse(userJson);
  if (empJson) currentEmployee = JSON.parse(empJson);
  updateNavbarSession();
}

function updateNavbarSession() {
  if (!navbarAuthContainer) return;

  if (currentEmployee) {
    navbarAuthContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.8rem; background: #064e3b; color: #a7f3d0; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
          🚍 ${escapeHtml(currentEmployee.role)}: ${escapeHtml(currentEmployee.name.split(' ')[0])} (${currentEmployee.pfNumber})
        </span>
        <button class="btn btn--outline btn--small" style="font-size: 0.75rem; padding: 4px 8px;" onclick="handleLogout()">Logout</button>
      </div>
    `;
  } else if (currentUser) {
    navbarAuthContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.8rem; color: var(--color-secondary); font-weight: 600;">
          👤 ${escapeHtml(currentUser.name.split(' ')[0])}
          ${currentUser.shakthiEligible ? '<span style="color: #ec4899; margin-left: 2px;">🌸</span>' : ''}
        </span>
        <button class="btn btn--outline btn--small" style="font-size: 0.75rem; padding: 4px 8px;" onclick="handleLogout()">Logout</button>
      </div>
    `;
  } else {
    navbarAuthContainer.innerHTML = `
      <button class="btn btn--small btn--primary" id="open-auth-btn" type="button" onclick="openAuthModal()">
        👤 Login / Sign Up
      </button>
    `;
  }
}

window.handleLogout = function() {
  localStorage.removeItem('ksrtc_user');
  localStorage.removeItem('ksrtc_employee');
  currentUser = null;
  currentEmployee = null;
  updateNavbarSession();
};

/**
 * Initialize Karnataka Leaflet Live Map
 */
function initKarnatakaMap() {
  const mapElement = document.getElementById('karnataka-map');
  if (!mapElement || typeof L === 'undefined') return;

  karnatakaMap = L.map('karnataka-map').setView([14.2, 75.8], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors | KSRTC Karnataka Tracker'
  }).addTo(karnatakaMap);
}

/**
 * Update Leaflet Map Markers for Buses
 */
function updateMapMarkers(buses) {
  if (!karnatakaMap || typeof L === 'undefined') return;

  buses.forEach(bus => {
    if (!bus.currentLocation || !bus.currentLocation.lat || !bus.currentLocation.lng) return;

    const lat = bus.currentLocation.lat;
    const lng = bus.currentLocation.lng;
    const isOrdinary = bus.shaktiSchemeEligible !== false;
    const pinColor = isOrdinary ? '#2a9d8f' : '#e63946';

    const customIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div style="background: ${pinColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid #fff; cursor: pointer;">
          🚍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const popupHtml = `
      <div class="map-popup-card">
        <p class="map-popup-bus">${escapeHtml(bus.busNumber)}</p>
        <p class="map-popup-route">${escapeHtml(bus.origin)} ⟶ ${escapeHtml(bus.destination)}</p>
        
        <div style="margin: 6px 0;">
          ${isOrdinary
            ? '<span style="background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">🌸 Shakthi Free for Women</span>'
            : '<span style="background: #fef2f2; color: #991b1b; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid #fecaca;">🚫 Shakthi NOT Applicable</span>'
          }
        </div>

        <div class="map-popup-meta">
          <strong>Current:</strong> ${escapeHtml(bus.currentStop)}<br/>
          <strong>Next Stop:</strong> ${escapeHtml(bus.nextStop)}<br/>
          <strong>ETA Destination:</strong> <span style="color: #c1121f; font-weight: 700;">${escapeHtml(bus.eta)}</span><br/>
          <strong>Speed:</strong> ${bus.speedKmH || 45} km/h • <em>${escapeHtml(bus.currentLocation.source || 'Driver GPS')}</em>
        </div>

        <button onclick="openBusModal('${bus.id}')" style="background: #1d3557; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; width: 100%; margin-top: 4px;">
          View Route Details &amp; Timeline →
        </button>
      </div>
    `;

    if (busMarkers[bus.id]) {
      busMarkers[bus.id].setLatLng([lat, lng]);
      busMarkers[bus.id].setPopupContent(popupHtml);
    } else {
      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(karnatakaMap)
        .bindPopup(popupHtml);
      busMarkers[bus.id] = marker;
    }
  });
}

/**
 * Load Karnataka 31 Districts and Taluks
 */
async function loadDistricts() {
  try {
    const res = await fetch(`${API_BASE}/districts`);
    const json = await res.json();
    if (json.success && json.data) {
      allDistricts = json.data;

      if (districtsCountBadge) {
        districtsCountBadge.textContent = `${allDistricts.length} Karnataka Districts`;
      }

      if (districtDropdown) {
        districtDropdown.innerHTML = `
          <option value="">-- Choose from all ${allDistricts.length} Districts --</option>
          ${allDistricts.map(d => `
            <option value="${d.district}">
              ${d.district} (${d.districtKannada}) — ${d.talukCount} Taluks
            </option>
          `).join('')}
        `;
      }

      if (placesDatalist) {
        const placeItems = [];
        allDistricts.forEach(d => {
          placeItems.push(`<option value="${d.district}">${d.district} District (${d.districtKannada})</option>`);
          d.taluks.forEach(t => {
            placeItems.push(`<option value="${t}">${t} (Taluk, ${d.district})</option>`);
          });
        });
        placesDatalist.innerHTML = placeItems.join('');
      }
    }
  } catch (err) {
    console.error('Failed to load Karnataka districts:', err);
  }
}

/**
 * Fetch and render buses from REST API
 * (Only shows buses when searched or filtered)
 */
async function loadBuses(showLoading = true, customFilters = {}) {
  // If user has not performed a search yet, show initial search guide
  if (!hasUserSearched && (!customFilters.from && !customFilters.to && !customFilters.city)) {
    renderInitialSearchState();
    return;
  }

  try {
    if (showLoading && busesGrid) {
      busesGrid.innerHTML = `
        <li style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-text-muted);">
          <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🔄</span>
          Loading Karnataka buses and live driver GPS stream...
        </li>
      `;
    }

    const params = new URLSearchParams();
    if (customFilters.city || (activeCity && activeCity !== 'All')) {
      params.append('city', customFilters.city || activeCity);
    }
    if (customFilters.from || fromInput.value.trim()) {
      params.append('from', customFilters.from || fromInput.value.trim());
    }
    if (customFilters.to || toInput.value.trim()) {
      params.append('to', customFilters.to || toInput.value.trim());
    }

    const url = `${API_BASE}/buses?${params.toString()}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.success) {
      let buses = json.data;

      // Apply Shakthi Scheme filter if enabled
      if (filterShakthiOnly) {
        buses = buses.filter(b => b.shaktiSchemeEligible !== false);
      }

      currentBuses = buses;
      renderBusList(currentBuses);
      updateMapMarkers(currentBuses);

      if (selectedBusId) {
        const updatedSelected = currentBuses.find(b => b.id === selectedBusId);
        if (updatedSelected) {
          populateModalDetails(updatedSelected);
        }
      }
    }
  } catch (err) {
    console.error('Failed to load buses from API:', err);
    if (busesGrid) {
      busesGrid.innerHTML = `
        <li style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; background: #fff3cd; border-radius: 8px;">
          <p style="color: #856404; font-weight: 600;">Could not connect to backend REST API.</p>
          <p style="font-size: 0.875rem; color: #856404;">Please ensure the backend server is running on http://localhost:5000.</p>
        </li>
      `;
    }
  }
}

/**
 * Render initial state before passenger searches
 */
function renderInitialSearchState() {
  if (!busesGrid) return;
  busesGrid.innerHTML = `
    <li style="grid-column: 1 / -1; text-align: center; padding: 3rem 2rem; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 12px;">
      <span style="font-size: 3rem; display: block; margin-bottom: 0.5rem;">🔍</span>
      <h3 style="font-size: 1.35rem; color: var(--color-secondary); margin-bottom: 0.5rem;">
        Search to View Ordinary Buses Across Karnataka
      </h3>
      <p style="color: var(--color-text-muted); font-size: 0.95rem; max-width: 520px; margin: 0 auto 1.5rem; line-height: 1.6;">
        Enter your <strong>From</strong> and <strong>To</strong> destinations above, or pick from any of the <strong>31 Karnataka Districts &amp; Taluks</strong> to view active buses, stop timelines, exact fares, and Shakthi scheme status.
      </p>
      <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn--small btn--primary" onclick="quickSearchDemo('Bengaluru', 'Mysuru')">
          Try: Bengaluru ⟶ Mysuru
        </button>
        <button class="btn btn--small btn--outline" onclick="quickSearchDemo('Hubballi', 'Belagavi')">
          Try: Hubballi ⟶ Belagavi
        </button>
        <button class="btn btn--small btn--outline" onclick="quickSearchDemo('Udupi', 'Kundapura')">
          Try: Udupi ⟶ Kundapura
        </button>
      </div>
    </li>
  `;
}

window.quickSearchDemo = function(from, to) {
  fromInput.value = from;
  toInput.value = to;
  hasUserSearched = true;
  loadBuses(true, { from, to });
};

/**
 * Render bus cards in DOM with explicit Ticket Fares and Shakthi Scheme tags
 */
function renderBusList(buses) {
  if (!busesGrid) return;

  if (buses.length === 0) {
    busesGrid.innerHTML = `
      <li style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border: 1px dashed var(--color-border); border-radius: 12px;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🚍</span>
        <h3 style="font-size: 1.25rem; color: var(--color-secondary); margin-bottom: 0.5rem;">No Buses Found</h3>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; max-width: 400px; margin: 0 auto 1.5rem;">
          No buses matched your criteria. Try choosing another taluk or clearing the filter.
        </p>
        <button class="btn btn--outline btn--small" onclick="resetSearchFilters()">Clear Search</button>
      </li>
    `;
    return;
  }

  busesGrid.innerHTML = buses.map(bus => {
    const badgeClass = bus.status === 'On Time'
      ? 'badge--green'
      : (bus.status === 'Slight Delay' ? 'badge--yellow' : 'badge--red');

    const isShakthiFree = bus.shaktiSchemeEligible !== false;

    return `
      <li class="bus-card" data-bus-id="${bus.id}">
        <div class="bus-card__header">
          <div class="bus-card__number-wrap">
            <span class="bus-card__icon" aria-hidden="true">🚍</span>
            <div>
              <span class="bus-card__number">${escapeHtml(bus.busNumber)}</span>
              <span style="display: block; font-size: 0.7rem; color: var(--color-text-muted);">${escapeHtml(bus.busType || 'Ordinary')}</span>
            </div>
          </div>
          <span class="badge ${badgeClass}">${escapeHtml(bus.status)}</span>
        </div>

        <!-- Shakthi Scheme Badge -->
        <div class="shakthi-tag ${isShakthiFree ? 'shakthi-tag--free' : 'shakthi-tag--paid'}">
          ${isShakthiFree 
            ? '🌸 <strong>Shakthi Scheme:</strong> FREE for Women (Karnataka Domicile)'
            : '🚫 <strong>Special Bus:</strong> Full Ticket Required (Shakthi NOT Allowed)'}
        </div>

        <!-- Ticket Fare Breakdown -->
        <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; margin: 8px 0; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
          <span>
            👩 <strong>Women:</strong> 
            <span style="color: ${isShakthiFree ? '#059669' : '#dc2626'}; font-weight: 700;">
              ${isShakthiFree ? '₹0 (FREE)' : (bus.fareDetails?.female || 'Full Ticket')}
            </span>
          </span>
          <span>
            👨 <strong>Men Ticket:</strong> 
            <span style="color: #0f172a; font-weight: 700;">
              ${bus.fareDetails?.male || ('₹' + (bus.stops ? bus.stops[bus.stops.length-1].fare : '45'))}
            </span>
          </span>
        </div>

        <div class="bus-card__route" style="margin-top: 0.5rem;">
          <span class="bus-card__origin">${escapeHtml(bus.origin)}</span>
          <span class="bus-card__route-arrow" aria-hidden="true">⟶</span>
          <span class="bus-card__destination">${escapeHtml(bus.destination)}</span>
        </div>

        <div class="bus-card__info">
          <div class="bus-card__detail">
            <span class="bus-card__detail-label">Current Stop</span>
            <span class="bus-card__detail-value">${escapeHtml(bus.currentStop)}</span>
          </div>
          <div class="bus-card__detail">
            <span class="bus-card__detail-label">Next Stop</span>
            <span class="bus-card__detail-value">${escapeHtml(bus.nextStop)}</span>
          </div>
          <div class="bus-card__detail">
            <span class="bus-card__detail-label">ETA ${escapeHtml(bus.destination.split(' ')[0])}</span>
            <span class="bus-card__detail-value bus-card__detail-value--highlight">${escapeHtml(bus.eta)}</span>
          </div>
        </div>

        <div class="bus-card__footer">
          <span class="bus-card__stops">${bus.totalStops || (bus.stops ? bus.stops.length : 0)} stops total</span>
          <button class="btn btn--outline btn--small btn--view-details" type="button" onclick="openBusModal('${bus.id}')">
            View Details →
          </button>
        </div>
      </li>
    `;
  }).join('');
}

/**
 * Open Bus Details Modal
 */
async function openBusModal(busId) {
  selectedBusId = busId;
  const bus = currentBuses.find(b => b.id === busId);
  if (bus) {
    populateModalDetails(bus);
  }

  if (busModal) {
    busModal.classList.add('modal-backdrop--open');
    busModal.setAttribute('aria-hidden', 'false');
  }

  try {
    const res = await fetch(`${API_BASE}/buses/${busId}`);
    const json = await res.json();
    if (json.success) {
      populateModalDetails(json.data);
    }
  } catch (err) {
    console.error('Failed to fetch detailed bus info:', err);
  }
}

/**
 * Populate modal fields with bus data
 */
function populateModalDetails(bus) {
  if (!bus) return;

  if (modalBusNo) modalBusNo.textContent = `${bus.busNumber} (${bus.origin} ⟶ ${bus.destination})`;
  
  if (modalBusStatus) {
    modalBusStatus.textContent = bus.status;
    modalBusStatus.className = 'badge ' + (
      bus.status === 'On Time' ? 'badge--green' :
      (bus.status === 'Slight Delay' ? 'badge--yellow' : 'badge--red')
    );
  }

  if (modalTelemetrySource && bus.currentLocation) {
    modalTelemetrySource.textContent = bus.currentLocation.source || 'Driver Smartphone Live GPS';
  }

  if (modalTelemetryTime && bus.currentLocation) {
    modalTelemetryTime.textContent = `Updated: ${bus.currentLocation.lastUpdated} • Accuracy: ${bus.currentLocation.confidence || 'High'}`;
  }

  if (modalCurrentStop) modalCurrentStop.textContent = bus.currentStop;
  if (modalNextStop) modalNextStop.textContent = bus.nextStop;
  if (modalEta) modalEta.textContent = bus.eta;

  // Render Stop Timeline
  if (modalTimeline && bus.stops) {
    modalTimeline.innerHTML = bus.stops.map(stop => {
      let itemModifier = '';
      let statusIcon = '⚪';
      if (stop.status === 'completed') {
        itemModifier = 'timeline__item--completed';
        statusIcon = '✅ Reached';
      } else if (stop.status === 'current') {
        itemModifier = 'timeline__item--current';
        statusIcon = '🚍 (Current Location)';
      } else {
        statusIcon = '⏳ Scheduled';
      }

      return `
        <li class="timeline__item ${itemModifier}">
          <div class="timeline__stop-row">
            <div>
              <span class="timeline__stop-name">${escapeHtml(stop.name)}</span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block;">
                ${statusIcon} ${stop.fare !== undefined ? `• Fare ₹${stop.fare}` : ''}
              </span>
            </div>
            <span class="timeline__stop-time">${escapeHtml(stop.time)}</span>
          </div>
        </li>
      `;
    }).join('');
  }
}

/**
 * Close Bus Details Modal
 */
function closeBusModal() {
  if (busModal) {
    busModal.classList.remove('modal-backdrop--open');
    busModal.setAttribute('aria-hidden', 'true');
  }
  selectedBusId = null;
}

/**
 * Simulate driver location update
 */
async function handleSimulatePing() {
  if (!selectedBusId) return;

  try {
    modalSimulateBtn.disabled = true;
    modalSimulateBtn.textContent = '📡 Ingesting Driver GPS...';

    const res = await fetch(`${API_BASE}/telemetry/simulate-step/${selectedBusId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const json = await res.json();
    if (json.success) {
      populateModalDetails(json.data);
      await loadBuses(false);

      modalSimulateBtn.textContent = '✅ Location Updated!';
      setTimeout(() => {
        modalSimulateBtn.disabled = false;
        modalSimulateBtn.textContent = '📡 Simulate Driver Location Ping';
      }, 1200);
    }
  } catch (err) {
    console.error('Failed to simulate telemetry ping:', err);
    modalSimulateBtn.disabled = false;
    modalSimulateBtn.textContent = '❌ Simulation Failed';
  }
}

/**
 * Visual highlight for selected inputs
 */
function highlightInput(inputEl) {
  inputEl.style.transition = 'all 0.3s ease';
  inputEl.style.backgroundColor = '#ecfdf5';
  inputEl.style.borderColor = '#10b981';
  setTimeout(() => {
    inputEl.style.backgroundColor = '';
    inputEl.style.borderColor = '';
  }, 1200);
}

/**
 * Clear search inputs
 */
function resetSearchFilters() {
  if (fromInput) fromInput.value = '';
  if (toInput) toInput.value = '';
  activeCity = 'All';
  filterShakthiOnly = false;
  hasUserSearched = false;
  if (shakthiCheckbox) shakthiCheckbox.checked = false;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('filter-btn--active', b.getAttribute('data-city') === 'All');
  });
  renderInitialSearchState();
}

/**
 * Fetch platform stats
 */
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const json = await res.json();
    if (json.success && json.data) {
      const stats = json.data;
      const statCards = document.querySelectorAll('.stat-card');
      if (statCards.length >= 3) {
        statCards[0].querySelector('.stat-card__number').textContent = `${stats.routesCovered}+`;
        statCards[1].querySelector('.stat-card__number').textContent = `${stats.stopsCataloged}+`;
        statCards[2].querySelector('.stat-card__number').textContent = `${stats.districtsCovered}`;
      }
    }
  } catch (err) {
    // Fallback
  }
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
