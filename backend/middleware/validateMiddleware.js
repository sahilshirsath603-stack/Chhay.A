// ─── Input Validation Middleware ──────────────────────────────────────────────

/**
 * Validates that req.body.email is present and valid format.
 */
const validateEmail = (req, res, next) => {
  const email = (req.body?.email || '').trim();
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address format.' });
  }
  req.body.email = email.toLowerCase(); // normalize
  next();
};

/**
 * Validates that req.body.otp is exactly 6 digits.
 */
const validateOTP = (req, res, next) => {
  const otp = (req.body?.otp || '').toString().trim();
  if (!otp) {
    return res.status(400).json({ message: 'OTP is required.' });
  }
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'OTP must be exactly 6 digits.' });
  }
  req.body.otp = otp;
  next();
};

/**
 * Validates that req.body.newPassword meets minimum requirements.
 */
const validateNewPassword = (req, res, next) => {
  const password = req.body?.newPassword || '';
  if (!password) {
    return res.status(400).json({ message: 'New password is required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }
  next();
};

module.exports = { validateEmail, validateOTP, validateNewPassword };
