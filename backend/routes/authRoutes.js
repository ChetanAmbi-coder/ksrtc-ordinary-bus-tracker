const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
const employeesFilePath = path.join(__dirname, '..', 'data', 'employees.json');

function getUsers() {
  return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
}

function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

function getEmployees() {
  return JSON.parse(fs.readFileSync(employeesFilePath, 'utf8'));
}

/**
 * Helper to assess password strength
 * Returns { score: 'Weak' | 'Medium' | 'Strong', valid: boolean }
 */
function evaluatePasswordStrength(password) {
  if (!password || password.length < 6) {
    return { score: 'Weak', valid: false, message: 'Password must be at least 6 characters.' };
  }

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  if (password.length >= 8 && hasLetters && hasNumbers && (hasSpecial || hasUpper)) {
    return { score: 'Strong', valid: true, message: 'Strong password.' };
  }

  if (hasLetters && hasNumbers) {
    return { score: 'Medium', valid: true, message: 'Medium password.' };
  }

  return {
    score: 'Weak',
    valid: false,
    message: 'Password too weak. Please combine letters and numbers (Medium or Strong required).'
  };
}

/**
 * @route   POST /api/auth/register
 * @desc    Create new passenger user account
 */
router.post('/register', (req, res) => {
  try {
    const { name, email, password, confirmPassword, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Validate email format (strict check for valid email like @gmail.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format. Please provide a valid email (e.g. yourname@gmail.com).'
      });
    }

    // Password strength evaluation
    const strength = evaluatePasswordStrength(password);
    if (!strength.valid) {
      return res.status(400).json({
        success: false,
        strength: strength.score,
        message: strength.message
      });
    }

    // Confirm password matching
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please re-enter confirm password.'
      });
    }

    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login instead.'
      });
    }

    const isFemale = (gender && gender.toLowerCase() === 'female');
    const newUser = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password,
      gender: gender || 'Unspecified',
      shakthiEligible: isFemale,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return res.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        gender: newUser.gender,
        shakthiEligible: newUser.shakthiEligible
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Passenger Login with email & password
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        shakthiEligible: user.shakthiEligible
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/auth/google
 * @desc    Simulate Google OAuth One-Click Login
 */
router.post('/google', (req, res) => {
  try {
    const { googleEmail, googleName } = req.body;
    const email = googleEmail || 'karnataka.passenger@gmail.com';
    const name = googleName || 'Google User';

    const users = getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: `USR-G-${Date.now()}`,
        name,
        email,
        password: 'OAUTH_GOOGLE_USER',
        gender: 'Female',
        shakthiEligible: true,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);
    }

    return res.json({
      success: true,
      message: `Signed in with Google as ${user.name}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        shakthiEligible: user.shakthiEligible
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/auth/employee-login
 * @desc    KSRTC Government Employee (Driver / Conductor) Login via PF Number
 */
router.post('/employee-login', (req, res) => {
  try {
    const { pfNumber, password } = req.body;

    if (!pfNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'KSRTC Employee PF Number and Password are required.'
      });
    }

    const cleanPF = pfNumber.trim().toUpperCase();
    const employees = getEmployees();
    const employee = employees.find(e => e.pfNumber.toUpperCase() === cleanPF);

    if (!employee || employee.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Employee PF Number or Password. Only official government registered KSRTC staff can access.'
      });
    }

    return res.json({
      success: true,
      message: `Verified: ${employee.role} ${employee.name} (${employee.depot})`,
      employee: {
        pfNumber: employee.pfNumber,
        name: employee.name,
        role: employee.role,
        depot: employee.depot,
        assignedBus: employee.assignedBus,
        status: employee.status
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/auth/demo-employees
 * @desc    Returns list of demo KSRTC Employee PF Numbers for convenient hackathon testing
 */
router.get('/demo-employees', (req, res) => {
  const employees = getEmployees().map(e => ({
    pfNumber: e.pfNumber,
    name: e.name,
    role: e.role,
    depot: e.depot,
    assignedBus: e.assignedBus
  }));
  res.json({ success: true, data: employees });
});

module.exports = router;
