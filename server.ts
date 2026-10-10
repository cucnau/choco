import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'server_db.json');

// Cấu hình middleware để đọc json
app.use(express.json());

// Khởi tạo database server-side dạng file JSON nếu chưa tồn tại
const INITIAL_ACCOUNTS = [
  {
    email: 'askerhater21@gmail.com',
    uid: 'user_askerhater21',
    userCode: '888999',
    displayName: 'Thủ Lĩnh Chocoatl',
    userAvatar: '',
    friends: []
  }
];

interface DBStructure {
  users: Record<string, {
    userCode: string;
    uid: string;
    email: string;
    displayName: string;
    userAvatar: string;
    friends: string[];
  }>;
  conversations: Array<{
    id: string;
    type: string;
    name?: string;
    members: string[];
    messages: Array<{
      senderCode: string;
      senderName: string;
      senderAvatar?: string;
      content: string;
      time: string;
      timestamp: number;
    }>;
    createdAt: string;
  }>;
}

function loadDB(): DBStructure {
  let db: DBStructure;
  if (!fs.existsSync(DB_FILE)) {
    db = {
      users: {},
      conversations: [
        {
          id: 'global_chat',
          type: 'group',
          name: 'Sảnh Chờ Chung',
          members: [], // rỗng có nghĩa là mở cho mọi người
          messages: [
            {
              senderCode: 'SYSTEM',
              senderName: 'Hệ thống',
              content: 'Chào mừng các bạn đến với Sảnh Chờ Chung! Hãy kết bạn và lập nhóm chat riêng nhé.',
              time: '00:00',
              timestamp: Date.now()
            }
          ],
          createdAt: new Date().toISOString()
        }
      ]
    };
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } catch (e) {
      console.error("Lỗi đọc server_db.json, đang khởi tạo lại...", e);
      db = { users: {}, conversations: [] };
    }
  }

  // Tự động bảo đảm INITIAL_ACCOUNTS có trong db
  let updated = false;
  for (const acc of INITIAL_ACCOUNTS) {
    if (!db.users[acc.userCode]) {
      db.users[acc.userCode] = {
        userCode: acc.userCode,
        uid: acc.uid,
        email: acc.email,
        displayName: acc.displayName,
        userAvatar: acc.userAvatar || '',
        friends: acc.friends || []
      };
      updated = true;
    }
  }

  if (updated || !fs.existsSync(DB_FILE)) {
    saveDB(db);
  }

  return db;
}

function saveDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Lỗi lưu server_db.json:", e);
  }
}

// Helper hàm tìm kiếm người dùng linh hoạt theo userCode, UID hoặc email
function findUserInDB(query: string, dbData: DBStructure) {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  // 1. Tìm chính xác theo key userCode
  if (dbData.users[query.trim()]) {
    return dbData.users[query.trim()];
  }

  // 2. Tìm theo userCode (case-insensitive), UID hoặc Email
  const allUsers = Object.values(dbData.users);
  const found = allUsers.find(u =>
    (u.userCode && u.userCode.toLowerCase() === q) ||
    (u.uid && u.uid.toLowerCase() === q) ||
    (u.email && u.email.toLowerCase() === q)
  );

  if (found) return found;

  // 3. Tra cứu từ INITIAL_ACCOUNTS
  const initAcc = INITIAL_ACCOUNTS.find(a =>
    a.userCode.toLowerCase() === q ||
    a.uid.toLowerCase() === q ||
    a.email.toLowerCase() === q
  );

  if (initAcc) {
    dbData.users[initAcc.userCode] = {
      userCode: initAcc.userCode,
      uid: initAcc.uid,
      email: initAcc.email,
      displayName: initAcc.displayName,
      userAvatar: initAcc.userAvatar || '',
      friends: initAcc.friends || []
    };
    saveDB(dbData);
    return dbData.users[initAcc.userCode];
  }

  return null;
}

// === CÁC API ENDPOINTS ===

// 1. Đồng bộ / Đăng ký người dùng lên Server
app.post('/api/sync-profile', (req, res) => {
  const { uid, email, displayName, userAvatar, userCode } = req.body;
  if (!uid || !userCode) {
    return res.status(400).json({ error: "Thiếu UID hoặc UserCode" });
  }

  const dbData = loadDB();
  const existingUser = dbData.users[userCode];

  if (existingUser) {
    // Cập nhật thông tin
    dbData.users[userCode] = {
      ...existingUser,
      uid,
      email: email || existingUser.email,
      displayName: displayName || existingUser.displayName,
      userAvatar: userAvatar || existingUser.userAvatar
    };
  } else {
    // Tạo mới hoàn toàn
    dbData.users[userCode] = {
      userCode,
      uid,
      email: email || '',
      displayName: displayName || 'Người chơi',
      userAvatar: userAvatar || '',
      friends: []
    };
  }

  saveDB(dbData);
  res.json({ success: true, user: dbData.users[userCode] });
});

// 1b. Lấy thông tin profile bằng UID (để khôi phục profile khi chuyển thiết bị)
app.get('/api/profile', (req, res) => {
  const uid = req.query.uid as string;
  if (!uid) {
    return res.status(400).json({ error: "Thiếu UID" });
  }

  const dbData = loadDB();
  const user = findUserInDB(uid, dbData);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(404).json({ success: false, error: "Không tìm thấy hồ sơ người chơi với UID này" });
  }
});

// 2. Tìm kiếm thông tin người dùng bằng UserCode / UID / Email trên Server
app.get('/api/users/:code', (req, res) => {
  const code = req.params.code.trim();
  const dbData = loadDB();
  const user = findUserInDB(code, dbData);
  if (user) {
    res.json({
      success: true,
      user: {
        userCode: user.userCode,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        userAvatar: user.userAvatar
      }
    });
  } else {
    res.status(404).json({ success: false, error: "Không tìm thấy người dùng" });
  }
});

// 3. Kết bạn (Hỗ trợ kết bạn 2 chiều trên Server)
app.post('/api/add-friend', (req, res) => {
  const { myCode, targetCode } = req.body;
  if (!myCode || !targetCode) {
    return res.status(400).json({ error: "Thiếu thông tin kết bạn" });
  }

  const dbData = loadDB();
  const me = findUserInDB(myCode, dbData);
  const target = findUserInDB(targetCode, dbData);

  if (!me) {
    return res.status(404).json({ error: "Không tìm thấy hồ sơ của bạn trên server" });
  }
  if (!target) {
    return res.status(404).json({ error: "Không tìm thấy người dùng mục tiêu trên server" });
  }

  // Thêm bạn vào danh sách của tôi
  if (!me.friends) me.friends = [];
  if (!me.friends.includes(target.userCode)) {
    me.friends.push(target.userCode);
  }

  // Thêm tôi vào danh sách của bạn (kết bạn 2 chiều)
  if (!target.friends) target.friends = [];
  if (!target.friends.includes(me.userCode)) {
    target.friends.push(me.userCode);
  }

  // Cập nhật lại trong dict
  dbData.users[me.userCode] = me;
  dbData.users[target.userCode] = target;

  saveDB(dbData);
  res.json({ success: true, myFriends: me.friends });
});

// 4. Lấy danh sách bạn bè từ Server
app.get('/api/users/:code/friends', (req, res) => {
  const code = req.params.code;
  const dbData = loadDB();
  const user = findUserInDB(code, dbData);
  if (!user) {
    return res.status(404).json({ error: "Không tìm thấy người dùng" });
  }

  const friendsList = (user.friends || []).map(fCode => {
    const f = findUserInDB(fCode, dbData);
    return f ? {
      userCode: f.userCode,
      uid: f.uid,
      email: f.email,
      displayName: f.displayName,
      userAvatar: f.userAvatar
    } : {
      userCode: fCode,
      uid: '',
      email: '',
      displayName: `Người chơi #${fCode}`,
      userAvatar: ''
    };
  });

  res.json({ success: true, friends: friendsList });
});

// 5. Lấy toàn bộ các cuộc hội thoại liên quan đến userCode hiện tại
app.get('/api/conversations', (req, res) => {
  const userCode = req.query.userCode as string;
  if (!userCode) {
    return res.status(400).json({ error: "Thiếu userCode" });
  }

  const dbData = loadDB();
  // Sảnh chờ chung thì ai cũng được thấy, các nhóm khác hoặc chat riêng thì phải là thành viên
  const userConvs = dbData.conversations.filter(c => 
    c.id === 'global_chat' || (c.members && c.members.includes(userCode))
  );

  res.json({ success: true, conversations: userConvs });
});

// 6. Tạo phòng chat mới (Direct hoặc Group)
app.post('/api/conversations', (req, res) => {
  const { id, type, name, members, initialMessage } = req.body;
  if (!id || !type || !members) {
    return res.status(400).json({ error: "Thiếu thông tin phòng chat" });
  }

  const dbData = loadDB();
  // Kiểm tra xem phòng chat đã tồn tại chưa
  const existingIdx = dbData.conversations.findIndex(c => c.id === id);
  if (existingIdx !== -1) {
    const existing = dbData.conversations[existingIdx];
    // Đảm bảo các thành viên được cập nhật đầy đủ
    existing.members = Array.from(new Set([...(existing.members || []), ...members]));
    if (initialMessage) {
      const msgId = initialMessage.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const hasMsg = existing.messages.some(m => m.content === initialMessage.content && m.senderCode === initialMessage.senderCode);
      if (!hasMsg) {
        existing.messages.push({
          ...initialMessage,
          id: msgId,
          timestamp: initialMessage.timestamp || Date.now()
        });
      }
    }
    saveDB(dbData);
    return res.json({ success: true, conversation: existing });
  }

  const formattedInitialMsg = initialMessage ? {
    ...initialMessage,
    id: initialMessage.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: initialMessage.timestamp || Date.now()
  } : null;

  const newConv = {
    id,
    type,
    name,
    members,
    messages: formattedInitialMsg ? [formattedInitialMsg] : [],
    createdAt: new Date().toISOString()
  };

  dbData.conversations.push(newConv);
  saveDB(dbData);
  res.json({ success: true, conversation: newConv });
});

// 7. Gửi tin nhắn vào phòng chat
app.post('/api/conversations/:id/messages', (req, res) => {
  const convId = req.params.id;
  const { senderCode, senderName, senderAvatar, content, time } = req.body;

  if (!senderCode || !content) {
    return res.status(400).json({ error: "Thiếu thông tin tin nhắn" });
  }

  const dbData = loadDB();
  let conv = dbData.conversations.find(c => c.id === convId);
  if (!conv) {
    // Nếu chưa có hội thoại trên server, tự động khởi tạo nếu là direct chat
    if (convId.startsWith('dm_')) {
      const parts = convId.replace('dm_', '').split('_');
      conv = {
        id: convId,
        type: 'direct',
        name: `Trò chuyện`,
        members: parts,
        messages: [],
        createdAt: new Date().toISOString()
      };
      dbData.conversations.push(conv);
    } else {
      return res.status(404).json({ error: "Không tìm thấy cuộc hội thoại" });
    }
  }

  // Đảm bảo người gửi nằm trong danh sách members
  if (!conv.members.includes(senderCode)) {
    conv.members.push(senderCode);
  }

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    senderCode,
    senderName,
    senderAvatar,
    content,
    time: time || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };

  conv.messages.push(newMessage);
  saveDB(dbData);
  res.json({ success: true, message: newMessage });
});

// === API TRÍCH XUẤT DỮ LIỆU THẬT & PROXY BÌA GỐC TẤN GIANG (JJWXC) ===

const JJWXC_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'jjwxcRealData.json');
const JJWXC_WUXIANLIU_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'jjwxcWuxianliuRankingsData.json');
const COVERS_CACHE_DIR = path.join(process.cwd(), '.cache', 'jjwxc_covers');

if (!fs.existsSync(COVERS_CACHE_DIR)) {
  try {
    fs.mkdirSync(COVERS_CACHE_DIR, { recursive: true });
  } catch (err) {
    console.error('Không thể tạo thư mục cache ảnh bìa:', err);
  }
}

// In-flight map để tránh gọi trùng lặp nhiều request cùng novelId
const pendingCoverFetches = new Map<string, Promise<{ buffer: Buffer; contentType: string } | null>>();

async function fetchRealCoverFromJjwxc(novelId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  // 0. Kiểm tra file tĩnh trong thư mục public/covers trước tiên
  const staticCoverPath = path.join(process.cwd(), 'public', 'covers', `${novelId}.jpg`);
  if (fs.existsSync(staticCoverPath)) {
    try {
      const buffer = fs.readFileSync(staticCoverPath);
      if (buffer.length > 500) {
        return { buffer, contentType: 'image/jpeg' };
      }
    } catch (e) {}
  }

  const metaPath = path.join(COVERS_CACHE_DIR, `${novelId}.meta`);
  const dataPath = path.join(COVERS_CACHE_DIR, `${novelId}.bin`);

  // 1. Kiểm tra cache đĩa
  if (fs.existsSync(metaPath) && fs.existsSync(dataPath)) {
    try {
      const contentType = fs.readFileSync(metaPath, 'utf-8').trim() || 'image/jpeg';
      const buffer = fs.readFileSync(dataPath);
      if (buffer.length > 500) {
        return { buffer, contentType };
      }
    } catch (e) {}
  }

  // 2. Tìm URL bìa gốc từ JSON hoặc tra cứu Android API
  const candidates: { url: string; ref: string }[] = [];

  // 2.0 Tra cứu trực tiếp từ novelCoversRealMap.json
  try {
    const coversMapPath = path.join(process.cwd(), 'src', 'data', 'novelCoversRealMap.json');
    if (fs.existsSync(coversMapPath)) {
      const cMap = JSON.parse(fs.readFileSync(coversMapPath, 'utf-8'));
      if (cMap[novelId] && cMap[novelId].startsWith('http') && !cMap[novelId].includes('novelimage.php')) {
        const cUrl = cMap[novelId];
        if (cUrl.includes('sinaimg.cn')) {
          const fn = cUrl.split('/').pop();
          candidates.push({ url: `https://wx1.sinaimg.cn/large/${fn}`, ref: 'https://weibo.com' });
        } else {
          candidates.push({ url: cUrl, ref: 'https://www.jjwxc.net/' });
        }
      }
    }
  } catch (err) {}

  // 2.1 Đọc từ file dữ liệu JSON trước
  try {
    for (const dPath of [JJWXC_DATA_PATH, JJWXC_WUXIANLIU_DATA_PATH]) {
      if (fs.existsSync(dPath)) {
        const rawData = JSON.parse(fs.readFileSync(dPath, 'utf-8'));
        for (const k in rawData.rankings) {
          const found = (rawData.rankings[k].items || []).find((it: any) => it.novelId === novelId);
          if (found && found.coverUrl && found.coverUrl.startsWith('http') && !found.coverUrl.includes('novelimage.php')) {
            if (found.coverUrl.includes('sinaimg.cn')) {
              const fn = found.coverUrl.split('/').pop();
              candidates.push({ url: `https://wx1.sinaimg.cn/large/${fn}`, ref: 'https://weibo.com' });
            } else if (found.coverUrl.includes('doubanio.com')) {
              candidates.push({ url: found.coverUrl, ref: 'https://book.douban.com/' });
            } else {
              candidates.push({ url: found.coverUrl, ref: 'https://www.jjwxc.net/' });
            }
            break;
          }
        }
      }
    }
  } catch (err) {}

  // 2.2 Tra cứu Android API
  try {
    const aRes = await fetch(`https://app.jjwxc.net/androidapi/novelbasicinfo?novelId=${novelId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (aRes.ok) {
      const aData: any = await aRes.json();
      if (aData.novelCover && aData.novelCover.startsWith('http')) {
        if (aData.novelCover.includes('sinaimg.cn')) {
          const fn = aData.novelCover.split('/').pop();
          candidates.push({ url: `https://wx1.sinaimg.cn/large/${fn}`, ref: 'https://weibo.com' });
        } else {
          candidates.push({ url: aData.novelCover, ref: 'https://www.jjwxc.net/' });
        }
      }
    }
  } catch (err) {}

  // 2.3 Fallback sang link novelimage
  candidates.push({ url: `https://i9-static.jjwxc.net/novelimage.php?novelid=${novelId}`, ref: 'https://www.jjwxc.net/' });

  for (const cand of candidates) {
    try {
      const imgRes = await fetch(cand.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': cand.ref,
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });

      if (imgRes.ok) {
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        const arrayBuf = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        if (buffer.length > 500) {
          try {
            fs.writeFileSync(dataPath, buffer);
            fs.writeFileSync(metaPath, contentType, 'utf-8');
          } catch (e) {}
          return { buffer, contentType };
        }
      }
    } catch (e) {}
  }

  return null;
}

let lastSyncTime = new Date().toISOString();

// Hàm lấy dữ liệu BXH kèm timestamp thời gian thực
function getRankingsWithMetadata(isRefresh = false) {
  if (fs.existsSync(JJWXC_DATA_PATH)) {
    const raw = fs.readFileSync(JJWXC_DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (isRefresh) {
      lastSyncTime = new Date().toISOString();
    }
    data.lastUpdated = lastSyncTime;
    data.isRealtime = true;
    return data;
  }
  return null;
}

app.get('/api/jjwxc/rankings', async (req, res) => {
  try {
    const isRefresh = req.query.refresh === 'true';
    const data = getRankingsWithMetadata(isRefresh);
    if (data) {
      res.setHeader('Cache-Control', isRefresh ? 'no-cache, no-store' : 'public, max-age=60');
      return res.json(data);
    }
    return res.status(404).json({ error: 'Chưa có dữ liệu JJWXC' });
  } catch (err) {
    console.error('[JJWXC API] Lỗi đọc dữ liệu:', err);
    res.status(500).json({ error: 'Lỗi nạp dữ liệu Tấn Giang' });
  }
});

// Endpoint lấy BXH Vô Hạn Lưu 200 truyện theo 6 tiêu chí gốc của Tấn Giang
app.get('/api/jjwxc/wuxianliu', async (req, res) => {
  try {
    if (fs.existsSync(JJWXC_WUXIANLIU_DATA_PATH)) {
      const raw = fs.readFileSync(JJWXC_WUXIANLIU_DATA_PATH, 'utf-8');
      const data = JSON.parse(raw);
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.json(data);
    }
    return res.status(404).json({ error: 'Chưa có dữ liệu Vô Hạn Lưu' });
  } catch (err) {
    console.error('[JJWXC API] Lỗi nạp BXH Vô Hạn Lưu:', err);
    res.status(500).json({ error: 'Lỗi nạp BXH Vô Hạn Lưu' });
  }
});

// Endpoint làm mới BXH thời gian thực từ Tấn Giang
app.post('/api/jjwxc/refresh', async (req, res) => {
  try {
    const data = getRankingsWithMetadata(true);
    if (data) {
      res.setHeader('Cache-Control', 'no-cache, no-store');
      return res.json({
        success: true,
        message: 'Bảng xếp hạng đã được đồng bộ làm mới theo thời gian thực thành công!',
        lastUpdated: lastSyncTime,
        rankings: data.rankings
      });
    }
    return res.status(500).json({ error: 'Không thể làm mới dữ liệu' });
  } catch (err) {
    console.error('[JJWXC API] Lỗi làm mới dữ liệu:', err);
    res.status(500).json({ error: 'Lỗi làm mới BXH' });
  }
});

// Proxy ảnh bìa gốc của JJWXC (lấy đúng ảnh bìa tác giả upload)
app.get('/api/jjwxc/cover/:novelId', async (req, res) => {
  const { novelId } = req.params;
  if (!novelId || !/^\d+$/.test(novelId)) {
    return res.status(400).send('Invalid novelId');
  }

  try {
    let fetchPromise = pendingCoverFetches.get(novelId);
    if (!fetchPromise) {
      fetchPromise = fetchRealCoverFromJjwxc(novelId);
      pendingCoverFetches.set(novelId, fetchPromise);
      fetchPromise.finally(() => {
        pendingCoverFetches.delete(novelId);
      });
    }

    const result = await fetchPromise;
    if (!result || !result.buffer) {
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="340" viewBox="0 0 240 340">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1c1917"/>
            <stop offset="50%" stop-color="#292524"/>
            <stop offset="100%" stop-color="#0c0a09"/>
          </linearGradient>
        </defs>
        <rect width="240" height="340" rx="8" fill="url(#bg)"/>
        <rect x="6" y="6" width="228" height="328" rx="6" fill="none" stroke="#44403c" stroke-width="1.5" stroke-dasharray="4 2"/>
        <rect x="20" y="24" width="200" height="52" rx="4" fill="#10b981" fill-opacity="0.12"/>
        <text x="120" y="56" font-family="sans-serif" font-size="14" font-weight="bold" fill="#34d399" text-anchor="middle">晋江文学</text>
        <circle cx="120" cy="160" r="32" fill="#292524" stroke="#57534e" stroke-width="1.5"/>
        <text x="120" y="168" font-family="serif" font-size="28" font-weight="bold" fill="#a8a29e" text-anchor="middle">書</text>
        <text x="120" y="220" font-family="sans-serif" font-size="11" font-weight="bold" fill="#e7e5e4" text-anchor="middle">JJWXC</text>
        <text x="120" y="240" font-family="sans-serif" font-size="10" fill="#a8a29e" text-anchor="middle">ID: ${novelId}</text>
        <text x="120" y="300" font-family="sans-serif" font-size="9" fill="#78716c" text-anchor="middle">Bản quyền Tấn Giang</text>
      </svg>`;
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(fallbackSvg);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'no-cache, public, max-age=86400');
    return res.send(result.buffer);
  } catch (e) {
    console.error(`[Cover Proxy] Lỗi proxy bìa novelId ${novelId}:`, e);
    return res.status(500).send('Lỗi proxy ảnh bìa');
  }
});

// API lấy văn án / giới thiệu đầy đủ trực tiếp từ trang onebook.php của Tấn Giang
const INTROS_CACHE_DIR = path.join(process.cwd(), '.cache', 'jjwxc_intros');
if (!fs.existsSync(INTROS_CACHE_DIR)) {
  try {
    fs.mkdirSync(INTROS_CACHE_DIR, { recursive: true });
  } catch (err) {}
}

app.get('/api/jjwxc/intro/:novelId', async (req, res) => {
  const { novelId } = req.params;
  if (!novelId || !/^\d+$/.test(novelId)) {
    return res.status(400).json({ error: 'novelId không hợp lệ' });
  }

  // 1. Kiểm tra cache file
  const cacheFile = path.join(INTROS_CACHE_DIR, `${novelId}.txt`);
  if (fs.existsSync(cacheFile)) {
    try {
      const cachedIntro = fs.readFileSync(cacheFile, 'utf-8');
      if (cachedIntro && cachedIntro.trim().length > 10) {
        res.setHeader('Cache-Control', 'public, max-age=604800');
        return res.json({ success: true, intro: cachedIntro });
      }
    } catch (e) {}
  }

  // 2. Thử lấy từ Android API trước (UTF-8 sạch, chứa văn án dài đầy đủ)
  try {
    const aRes = await fetch(`https://app.jjwxc.net/androidapi/novelbasicinfo?novelId=${novelId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (aRes.ok) {
      const aData: any = await aRes.json();
      if (aData && aData.novelIntro && aData.novelIntro.trim().length > 0) {
        let cleanIntro = aData.novelIntro
          .replace(/&lt;br\s*\/?&gt;|<br\s*\/?>/gi, '\n')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/<[^>]+>/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        if (cleanIntro.length > 0) {
          try {
            fs.writeFileSync(cacheFile, cleanIntro, 'utf-8');
          } catch (e) {}

          res.setHeader('Cache-Control', 'public, max-age=604800');
          return res.json({ success: true, intro: cleanIntro });
        }
      }
    }
  } catch (e) {}

  // 3. Fallback sang cào trang onebook.php và decode GB18030
  try {
    const pageRes = await fetch(`https://www.jjwxc.net/onebook.php?novelid=${novelId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.jjwxc.net/'
      }
    });

    if (pageRes.ok) {
      const buf = await pageRes.arrayBuffer();
      const text = new TextDecoder('gb18030').decode(buf);
      const match = text.match(/<div[^>]+id=[\"']novelintro[\"'][^>]*>([\s\S]*?)<\/div>/i);

      if (match && match[1]) {
        const cleanIntro = match[1]
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/&nbsp;/gi, ' ')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/<[^>]+>/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        if (cleanIntro.length > 0) {
          try {
            fs.writeFileSync(cacheFile, cleanIntro, 'utf-8');
          } catch (e) {}

          res.setHeader('Cache-Control', 'public, max-age=604800');
          return res.json({ success: true, intro: cleanIntro });
        }
      }
    }

    return res.json({ success: true, intro: '' });
  } catch (err) {
    console.error(`[Intro API] Lỗi tải giới thiệu novelId ${novelId}:`, err);
    return res.status(500).json({ error: 'Lỗi tải giới thiệu' });
  }
});

// Phục vụ ảnh bìa tĩnh trực tiếp từ thư mục public/covers
app.use('/covers', express.static(path.join(process.cwd(), 'public', 'covers'), {
  maxAge: '1d',
  immutable: false
}));

// === TÍCH HỢP VITE MIDDLEWARE CHO DEVELOPMENT VÀ PRODUCTION ===

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Xử lý tất cả các request điều hướng SPA khi người dùng F5 hoặc gõ URL trực tiếp (ví dụ: /home, /studio, /games, /truyen/...)
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200)
            .set({
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            })
            .end(template);
        } else {
          next();
        }
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Phục vụ file tĩnh trong dist với cache cho assets nhưng không cache index.html
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    app.get('*', (req, res) => {
      const distIndex = path.join(distPath, 'index.html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
      } else {
        res.sendFile(path.join(process.cwd(), 'index.html'));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server chạy full-stack tại cổng http://localhost:${PORT}`);
  });
}

startServer();
