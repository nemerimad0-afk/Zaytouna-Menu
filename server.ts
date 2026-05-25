import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { createServer as createViteServer } from "vite";

import { menuData } from "./src/data.js";

const app = express();
const PORT = 3000;
const SECRET_KEY = "gelato_lab_secret_key_12345"; // For demo purposes
const DATA_FILE = path.join(process.cwd(), "menuData.json");
const SETTINGS_FILE = path.join(process.cwd(), "settings.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const initialSettings = {
  musicUrl: "https://www.image2url.com/r2/default/audio/1779605277020-c303c35e-9a3a-48b9-9632-7122a3d4f357.mp3"
};

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(menuData, null, 2));
}

if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2));
}

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'Kanaan@731963') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/menu', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read menu data' });
  }
});

app.put('/api/menu', authenticateToken, (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));

    // Also update src/data.ts for static exports
    const dataTsContent = `export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  isPopular?: boolean;
}

export interface MenuCategory {
  id: string;
  title: string;
  icon?: string;
  image?: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = ${JSON.stringify(req.body, null, 2)};
`;
    fs.writeFileSync(path.join(process.cwd(), 'src', 'data.ts'), dataTsContent);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu data' });
  }
});

app.get('/api/settings', (req, res) => {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings data' });
  }
});

app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));

    // Also update src/settingsData.ts for static exports
    const settingsContent = `export const settingsData = ${JSON.stringify(req.body, null, 2)};\n`;
    fs.writeFileSync(path.join(process.cwd(), 'src', 'settingsData.ts'), settingsContent);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings data' });
  }
});

app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Construct a public URL path
  const filename = req.file.filename;
  res.json({ url: `/uploads/${filename}` });
});

import * as cheerio from 'cheerio';

app.get('/api/search-images', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json([]);
    
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
    const fetchRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
    const html = await fetchRes.text();
    const $ = cheerio.load(html);
    const images: string[] = [];
    
    $('a.iusc').each((i, el) => {
      const m = $(el).attr('m');
      if (m) {
        try {
          const data = JSON.parse(m);
          if (data.murl) images.push(data.murl);
        } catch(e) {}
      }
    });
    
    res.json({ images: images.slice(0, 20) });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

async function startServer() {
  app.use('/uploads', express.static(UPLOADS_DIR));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
