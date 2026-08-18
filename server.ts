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

// API đồng bộ dữ liệu truyện, chương vào file code
app.post('/api/sync-code-data', (req, res) => {
  const { stories, chapters, comments } = req.body;
  
  if (!Array.isArray(stories) || !Array.isArray(chapters)) {
    return res.status(400).json({ error: "Dữ liệu truyện hoặc chương không hợp lệ" });
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'sampleStories.ts');
    const finalComments = Array.isArray(comments) ? comments : [];

    const fileContent = `import { Story, Chapter, Comment } from '../types';

export const INITIAL_STORIES: Story[] = ${JSON.stringify(stories, null, 2)};

export const INITIAL_CHAPTERS: Chapter[] = ${JSON.stringify(chapters, null, 2)};

export const INITIAL_COMMENTS: Comment[] = ${JSON.stringify(finalComments, null, 2)};
`;

    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`[Sync Code] Đã đồng bộ thành công ${stories.length} truyện và ${chapters.length} chương vào file code.`);
    res.json({ success: true, message: "Đã đồng bộ vào file code thành công" });
  } catch (err: any) {
    console.error("[Sync Code] Lỗi khi ghi file code:", err);
    res.status(500).json({ error: "Lỗi khi ghi dữ liệu vào file code: " + err.message });
  }
});

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

// API đồng bộ dữ liệu vào server
app.post("/api/sync-code-data", (req, res) => {
  try {
    const { stories, chapters, comments } = req.body;
    console.log(`[Sync Data] Nhận yêu cầu đồng bộ: ${stories?.length || 0} truyện, ${chapters?.length || 0} chương.`);
    res.json({ success: true, message: "Đã đồng bộ dữ liệu thành công" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// === TÍCH HỢP VITE MIDDLEWARE CHO DEVELOPMENT VÀ PRODUCTION ===

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Bắt tất cả đường dẫn SPA (như /truyen/..., /tu-sach, /tro-choi...) trả về index.html để không bị 404 khi nhấn F5
    app.get('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server chạy full-stack tại cổng http://localhost:${PORT}`);
  });
}

startServer();
