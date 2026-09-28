import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Nạp dữ liệu Bảng Xếp Hạng Tấn Giang từ master data
const MASTER_DATA_FILE = path.join(process.cwd(), 'src', 'data', 'jjwxcRealData.json');
let masterDataCache: any = null;

function getMasterData() {
  if (!masterDataCache && fs.existsSync(MASTER_DATA_FILE)) {
    try {
      const raw = fs.readFileSync(MASTER_DATA_FILE, 'utf-8');
      masterDataCache = JSON.parse(raw);
    } catch (e) {
      console.error('Lỗi khi đọc jjwxcRealData.json:', e);
    }
  }
  return masterDataCache || { crawledAt: new Date().toISOString(), rankings: {}, tagRankings: {} };
}

// 1. API Lấy dữ liệu Bảng Xếp Hạng & Danh sách truyện
app.get('/api/jjwxc/rankings', (req, res) => {
  const data = getMasterData();
  res.json({
    crawledAt: data.crawledAt,
    rankings: data.rankings || {},
    tagRankings: data.tagRankings || {}
  });
});

// 2. API Chi tiết truyện
app.get('/api/jjwxc/novel-detail/:id', (req, res) => {
  const data = getMasterData();
  const novelId = String(req.params.id);
  
  let found: any = null;
  if (data.rankings) {
    for (const rank of Object.values(data.rankings) as any[]) {
      found = rank.items?.find((n: any) => String(n.novelId) === novelId);
      if (found) break;
    }
  }
  if (!found && data.tagRankings) {
    for (const items of Object.values(data.tagRankings) as any[]) {
      found = items?.find((n: any) => String(n.novelId) === novelId);
      if (found) break;
    }
  }

  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ error: 'Không tìm thấy truyện' });
  }
});

// 3. API Proxy ảnh bìa
app.get('/api/jjwxc/image-proxy', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send('Thiếu url');
  }
  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://www.jjwxc.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!response.ok) {
      return res.status(response.status).send('Không thể tải ảnh');
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).send('Lỗi tải ảnh: ' + err.message);
  }
});

// Phục vụ tĩnh từ dist và fallback SPA
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

app.get('*', (req, res) => {
  const distIndex = path.join(distPath, 'index.html');
  if (fs.existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.sendFile(path.join(process.cwd(), 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Server chạy tại http://localhost:${PORT}`);
});
