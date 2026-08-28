import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewsPost, UserProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { FileText, Send, Trash2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NewsHubProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isEditor: boolean;
}

export const NewsHub: React.FC<NewsHubProps> = ({ currentUser, userProfile, isEditor }) => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as NewsPost[];
      setPosts(fetchedPosts);
    });

    return () => unsubscribe();
  }, []);

  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'news'), {
        title: title.trim(),
        content: content.trim(),
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.email || 'Admin',
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error posting news:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 font-mono-code space-y-8">
      <div className="flex items-center gap-3 border-b border-[#30222a] pb-4">
        <div className="p-3 bg-[#e879f9]/10 rounded-lg">
          <Users className="w-6 h-6 text-[#e879f9]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#fbcfe8] uppercase tracking-wider">Diễn đàn</h2>
        </div>
      </div>

      {isEditor && (
        <form onSubmit={handlePostNews} className="bg-[#1f1017] p-4 rounded-xl border border-[#30222a] space-y-4 shadow-xl">
          <h3 className="font-bold text-[#fbcfe8] flex items-center gap-2">
            <FileText className="w-4 h-4" /> Đăng bài viết mới
          </h3>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-[#30222a] text-[#fbcfe8] px-3 py-2 text-sm rounded border border-transparent focus:border-[#e879f9] outline-none transition"
            />
          </div>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung bài viết (hỗ trợ nhập văn bản có xuống dòng)..."
              rows={4}
              className="w-full bg-[#30222a] text-[#fbcfe8] px-3 py-2 text-sm rounded border border-transparent focus:border-[#e879f9] outline-none transition resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#e879f9] text-[#1a0b12] text-sm font-bold rounded hover:opacity-90 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Đang đăng...' : 'Đăng bài'} <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-[#fbcfe8]/50 italic text-sm bg-[#1f1017]/50 rounded-xl border border-[#30222a]">
            Chưa có bài viết nào được đăng.
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-[#1f1017] p-5 rounded-xl border border-[#30222a] shadow-lg relative group">
              {isEditor && (
                <button
                  onClick={() => handleDeleteNews(post.id)}
                  className="absolute top-4 right-4 p-2 bg-[#30222a] hover:bg-rose-900/50 text-[#fbcfe8]/60 hover:text-rose-400 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Xóa bài viết"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <h3 className="text-lg font-bold text-[#fbcfe8] mb-2 pr-10">{post.title}</h3>
              <div className="flex items-center gap-2 text-[11px] text-[#fbcfe8]/60 mb-4 font-mono">
                <span className="font-bold text-[#e879f9]">{post.authorName}</span>
                <span>•</span>
                <span>
                  {post.createdAt 
                    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })
                    : 'Vừa xong'
                  }
                </span>
              </div>
              <div className="text-sm text-[#fbcfe8]/90 leading-relaxed whitespace-pre-wrap font-sans">
                {post.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
