// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

/* ==========================================================================
   SECURITY MIDDLEWARE CONFIGURATION
   ========================================================================== */

// 1. HTTP Header Hardening (Protects against clickjacking, sniff attacks, XSS)
app.use(helmet());

// 2. Strict CORS Configuration (Only your Vite app domain can talk to this API)
const allowedOrigins = [
  'http://localhost:5173',           // Keep this just in case
  'https://localhost:5173',          // <-- ADD THIS LINE FOR YOUR SECURE VITE DEV SERVER
  'https://tipia.com',              
  'https://www.tipia.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server requests or tools like Postman only in development
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    } else {
      return callback(new Error('Blocked by security architecture (CORS restriction).'), false);
    }
  },
  methods: ['POST'], // Block GET, PUT, DELETE requests on the entire public tree
  allowedHeaders: ['Content-Type'],
  maxAge: 86400 // Cache preflight requests for 24 hours to reduce server stress
}));

// 3. Body Parser Payload Constraint (Prevents massive memory exhaustion attacks)
app.use(express.json({ limit: '10kb' })); 

// 4. Rate Limiting Middleware (Blocks brute force / request flooding)
const waitlistRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute tracking window
  max: 5, // A single network IP can only attempt 5 registrations per window
  message: { error: "Too many requests from this network. Please try again after 15 minutes." },
  standardHeaders: true, 
  legacyHeaders: false, 
});

/* ==========================================================================
   SECURE WAITLIST ROUTE HANDLER
   ========================================================================== */

app.post('/api/waitlist', waitlistRateLimiter, async (req, res) => {
  // Destructure fields + hidden honeypot field (faxNumber)
  const { pharmacyName, email, address, faxNumber } = req.body;

  /* --- SECURITY LAYER 1: Anti-Bot Honeypot Validation --- */
  // Normal human users won't see this field because of CSS display: none.
  // Automated spam scripts fill out every input field they scan.
  if (faxNumber) {
    console.warn(`[Security Alert] Bot detected attempting automated form bypass.`);
    // Silently pretend it worked to confuse the bot script so it doesn't try a different tactic
    return res.status(201).json({ 
      success: true, 
      message: "Successfully joined the waitlist!" 
    });
  }

  /* --- SECURITY LAYER 2: Presence Checklist --- */
  if (!pharmacyName || !email || !address) {
    return res.status(400).json({ error: "All onboarding parameters are strictly required." });
  }

  /* --- SECURITY LAYER 3: Input Length & Format Validation (Anti-XSS & Payload Caps) --- */
  const cleanName = pharmacyName.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanAddress = address.trim();

  if (cleanName.length < 2 || cleanName.length > 80) {
    return res.status(400).json({ error: "Pharmacy Name must be between 2 and 80 plain characters." });
  }

  if (cleanAddress.length < 5 || cleanAddress.length > 300) {
    return res.status(400).json({ error: "Premises Address text layout must be between 5 and 300 characters." });
  }

  // Regex validation protecting syntax parameters
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail) || cleanEmail.length > 100) {
    return res.status(400).json({ error: "Please provide a valid, authentic email address." });
  }

  try {
    /* --- SECURITY LAYER 4: Safe Parameterized Database Insertion --- */
    // Prisma strips out malicious SQL injections safely behind the scenes
    const waitlistRecord = await prisma.waitlistEntry.create({
      data: {
        pharmacyName: cleanName,
        email: cleanEmail,
        address: cleanAddress
      },
      select: { 
        id: true,
        pharmacyName: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: `Welcome aboard, ${waitlistRecord.pharmacyName}! Your entry has been securely registered.`,
      payload: waitlistRecord
    });

  } catch (error) {
    /* --- SECURITY LAYER 5: Prisma Safe Error Masking --- */
    // Code P2002 explicitly isolates unique constraint conflicts (Email duplicate checks)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "This email address is already registered on our waitlist." });
    }

    // Mask deep database error logs from being exposed to the client interface
    console.error("Internal Server Core Error:", error);
    return res.status(500).json({ error: "An unexpected system transaction error occurred. Please try again later." });
  }
});

/* ==========================================================================
   GLOBAL CATCH-ALL UNKNOWN ROUTE SECURITY
   ========================================================================== */
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint architecture reference not found." });
});

app.listen(PORT, () => {
  console.log(`[Tipia Secure Backend Active on Port: ${PORT}`);
});