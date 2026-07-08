import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [activePartner, setActivePartner] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState({});
  const messagesEndRef = useRef(null);

  const { data: inbox, isLoading: loadingInbox } = useQuery({
    queryKey: ['inbox'],
    queryFn: () => api.get('/messages/inbox').then(res => res.data),
    enabled: isOpen && !activePartner
  });

  const { isLoading: loadingChat } = useQuery({
    queryKey: ['conversation', activePartner?._id],
    queryFn: () => api.get(`/messages/conversation/${activePartner._id}`).then(res => {
      setMessages(res.data);
      return res.data;
    }),
    enabled: !!activePartner
  });

  useEffect(() => {
    if (!window.socket) return;
    const handleReceiveMessage = (msg) => {
      if (activePartner && (msg.sender._id === activePartner._id || msg.receiver._id === activePartner._id)) {
        setMessages(prev => [...prev, msg]);
        window.socket.emit('mark_read', { senderId: activePartner._id, receiverId: user._id });
      }
      qc.invalidateQueries(['inbox']);
    };
    const handleMessageSent = (msg) => {
      if (activePartner && (msg.receiver._id === activePartner._id)) {
        setMessages(prev => [...prev, msg]);
      }
      qc.invalidateQueries(['inbox']);
    };
    const handleTyping = (data) => {
      if (data.senderId === activePartner?._id) {
        setTyping({ [data.senderId]: true });
        setTimeout(() => setTyping({}), 2000);
      }
    };
    window.socket.on('receive_message', handleReceiveMessage);
    window.socket.on('message_sent', handleMessageSent);
    window.socket.on('typing', handleTyping);
    return () => {
      window.socket?.off('receive_message', handleReceiveMessage);
      window.socket?.off('message_sent', handleMessageSent);
      window.socket?.off('typing', handleTyping);
    };
  }, [activePartner, user, qc]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartner) return;
    window.socket.emit('send_message', {
      senderId: user._id,
      receiverId: activePartner._id,
      text: inputText
    });
    setInputText('');
  };

  const handleTypingEmit = () => {
    if (activePartner) {
      window.socket.emit('typing', { senderId: user._id, receiverId: activePartner._id });
    }
  };

  const totalUnread = inbox?.reduce((acc, curr) => acc + curr.unread, 0) || 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[380px] h-[520px] rounded-2xl flex flex-col overflow-hidden origin-bottom-right shadow-2xl card"
          >
            <div className="p-4 flex justify-between items-center border-b"
              style={{ background: 'linear-gradient(135deg, #2563EB, #8B5CF6)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3">
                {activePartner && (
                  <button onClick={() => setActivePartner(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors text-white">
                    <ArrowLeft size={18} />
                  </button>
                )}
                {!activePartner ? (
                  <h3 className="font-bold text-lg text-white">Messages</h3>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img src={activePartner.profilePicture || `https://ui-avatars.com/api/?name=${activePartner.name}&background=fff&color=2563EB`}
                        alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white/50" />
                      <div className="online-dot absolute -bottom-0.5 -right-0.5" style={{ width: 8, height: 8 }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight text-white">{activePartner.name}</h3>
                      <p className="text-xs text-white/70">@{activePartner.username}</p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: 'var(--background)' }}>
              {!activePartner ? (
                loadingInbox ? (
                  <div className="flex-1 flex justify-center items-center"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
                ) : inbox?.length > 0 ? (
                  <div className="flex flex-col">
                    {inbox.map((chat) => (
                      <button key={chat.partner._id} onClick={() => setActivePartner(chat.partner)}
                        className="flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b text-left"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="relative">
                          <img src={chat.partner.profilePicture || `https://ui-avatars.com/api/?name=${chat.partner.name}&background=2563EB&color=fff`}
                            alt="" className="w-11 h-11 rounded-full object-cover" />
                          <div className="online-dot absolute -bottom-0.5 -right-0.5" style={{ width: 8, height: 8 }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="font-bold text-sm truncate">{chat.partner.name}</span>
                          </div>
                          <p className={`text-xs truncate ${chat.unread > 0 ? 'font-bold' : ''}`} style={{ color: chat.unread > 0 ? 'var(--foreground)' : 'var(--foreground-muted)' }}>
                            {chat.lastMessage.sender._id === user?._id ? 'You: ' : ''}{chat.lastMessage.text || 'Sent an attachment'}
                          </p>
                        </div>
                        {chat.unread > 0 && (
                          <span className="w-5 h-5 flex items-center justify-center rounded-full text-white text-[10px] font-bold gradient-primary">
                            {chat.unread}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--foreground-muted)' }}>No messages yet</div>
                )
              ) : (
                loadingChat ? (
                  <div className="flex-1 flex justify-center items-center"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
                ) : (
                  <div className="p-4 flex flex-col gap-3">
                    {messages.map((msg) => {
                      const isMe = msg.sender._id === user?._id;
                      return (
                        <motion.div key={msg._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex flex-col max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}
                        >
                          <div className={`p-3 text-sm shadow-sm ${isMe ? 'text-white rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}
                            style={isMe
                              ? { background: 'linear-gradient(135deg, #2563EB, #8B5CF6)' }
                              : { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)' }
                            }
                          >
                            {msg.text}
                          </div>
                        </motion.div>
                      );
                    })}
                    {typing[activePartner?._id] && (
                      <div className="self-start flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: 'var(--muted)' }}>
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--foreground-muted)', animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--foreground-muted)', animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--foreground-muted)', animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>typing...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )
              )}
            </div>

            {activePartner && (
              <form onSubmit={handleSend} className="p-3 border-t flex gap-2 items-center"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <input type="text" placeholder="Type a message..." value={inputText}
                  onChange={(e) => { setInputText(e.target.value); handleTypingEmit(); }}
                  className="flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none border"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
                <button type="submit" disabled={!inputText.trim()}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${inputText.trim() ? 'gradient-primary' : 'opacity-50'}`}
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg relative ${isOpen ? 'hidden' : 'flex'}`}
        style={{ background: 'linear-gradient(135deg, #2563EB, #8B5CF6)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare size={24} />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold gradient-primary">
            {totalUnread}
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
