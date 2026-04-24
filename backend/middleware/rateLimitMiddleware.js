const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// ─── OTP Request Rate Limiter ─────────────────────────────────────────────────
// Max 5 OTP send requests per IP per 5 minutes
// (Per-user Redis limiting is handled inside otpService.checkOTPRequestRate)
const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  keyGenerator: (req) => {
    // Key by IP + email combo to prevent one IP requesting for many accounts
    const email = (req.body?.email || '').toLowerCase().trim();
    return `${ipKeyGenerator(req)}_${email}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many OTP requests. Please wait 5 minutes before trying again.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// ─── OTP Verification Rate Limiter ───────────────────────────────────────────
// Max 10 verify attempts per IP per 5 minutes
// (Per-user attempt tracking is handled inside otpService.checkVerifyAttempts)
const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many verification attempts. Please wait before trying again.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── General Auth Rate Limiter ────────────────────────────────────────────────
// Protect login and signup from brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests from this IP. Please try again later.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { otpRequestLimiter, otpVerifyLimiter, authLimiter };
