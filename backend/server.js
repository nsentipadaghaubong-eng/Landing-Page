// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3300;

/* ==========================================================================\
   SECURITY MIDDLEWARE CONFIGURATION
   ========================================================================== */

// 1. HTTP Header Hardening (Protects against clickjacking, sniff attacks, XSS)
app.use(helmet());

// 2. Strict CORS Configuration (Only your Vite app domain can talk to this API)
const allowedOrigins = [
  'http://localhost:5173',           
  'https://localhost:5173',          
  process.env.FRONTEND_URL          // Dynamically reads your production Vercel link
].filter(Boolean);                  // Filters out any undefined values safely

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server requests or tools like Postman only in development
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS architecture safety controls.'));
    }
  },
  credentials: true
}));

// 3. Global Rate Limiting (Prevents Denial of Service and Brute-force submission attacks)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, 
  legacyHeaders: false,
  message: { error: "Too many requests originating from this endpoint. Please try again after 15 minutes." }
});

// Apply rate limiting specifically to the onboarding endpoint
app.use('/waitlist', apiLimiter);

// 4. Content Type Body Parsing Parsing Layer
app.use(express.json());

/* ==========================================================================\
   CORE WAITING ARCHITECTURE API ROUTES
   ========================================================================== */

app.post('/waitlist', async (req, res) => {
  try {
    const { pharmacyName, email, address, faxNumber } = req.body;

    /* --- SECURITY LAYER 1: Honeypot Validation --- */
    if (faxNumber) {
      // Immediate silent rejection if a bot populates the hidden field
      return res.status(400).json({ error: "Spam block validation triggered." });
    }

    /* --- SECURITY LAYER 2: Server-side Empty Boundary Verification --- */
    if (!pharmacyName || !email || !address) {
      return res.status(422).json({ error: "Missing required onboarding entities." });
    }

    /* --- SECURITY LAYER 3: Regular Expression Data Sanitization --- */
    const cleanName = pharmacyName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanAddress = address.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Provided parameter is not a structurally valid email address." });
    }

    /* --- SECURITY LAYER 4: Database Storage Transaction --- */
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
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "This email address is already registered on our waitlist." });
    }

    console.error("Internal Server Core Error:", error);
    return res.status(500).json({ error: "An unexpected system transaction error occurred. Please try again later." });
  }
});

/* ==========================================================================\
   GLOBAL CATCH-ALL UNKNOWN ROUTE SECURITY
   ========================================================================== */
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint architecture reference not found." });
});

// Initialize server thread
app.listen(PORT, () => {
  console.log(`[Tipia Engine v1.0 Production Cluster Running on Port ${PORT}]`);
});