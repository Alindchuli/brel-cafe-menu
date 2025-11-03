// Database connection with Railway PostgreSQL support
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection - supports both SQLite (local) and PostgreSQL (production)
let db;

if (process.env.DATABASE_URL) {
    // Production: Use PostgreSQL
    const { Pool } = require('pg');
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('🐘 Using PostgreSQL database');
} else {
    // Development: Use SQLite
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, '..', 'database', 'menu.db');
    db = new sqlite3.Database(dbPath);
    console.log('📁 Using SQLite database');
}

module.exports = { db, app, PORT };