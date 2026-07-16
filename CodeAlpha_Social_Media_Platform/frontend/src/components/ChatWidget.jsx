import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ArrowLeft, Loader2, Plus, Smile } from 'lucide-react';
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

  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      setActivePartner(e.detail);
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

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
            className="w-[92vw] sm:w-[400px] h-[75vh] sm:h-[580px] max-h-[700px] rounded-2xl flex flex-col overflow-hidden origin-bottom-right shadow-2xl glass-panel"
          >
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b glass-panel sticky top-0 z-10"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                {activePartner && (
                  <button onClick={() => setActivePartner(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                )}
                {!activePartner ? (
                  <h3 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>Messages</h3>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={activePartner.profilePicture || `https://ui-avatars.com/api/?name=${activePartner.name}&background=5c3ce6&color=fff`}
                        alt="" className="w-10 h-10 rounded-full object-cover border border-[var(--border)] shadow-sm" />
                      <div className="online-dot absolute bottom-0 right-0" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px] leading-tight" style={{ color: 'var(--foreground)' }}>{activePartner.name}</h3>
                      <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>@{activePartner.username}</p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: 'var(--background)' }}>
              {!activePartner ? (
                loadingInbox ? (
                  <div className="flex-1 flex justify-center items-center"><Loader2 size={24} className="animate-spin text-[var(--primary)]" /></div>
                ) : inbox?.length > 0 ? (
                  <div className="flex flex-col">
                    {inbox.map((chat) => (
                      <button key={chat.partner._id} onClick={() => setActivePartner(chat.partner)}
                        className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b text-left group"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="relative">
                          <img src={chat.partner.profilePicture || `https://ui-avatars.com/api/?name=${chat.partner.name}&background=5c3ce6&color=fff`}
                            alt="" className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:shadow-md transition-all border border-transparent group-hover:border-[var(--primary)]" />
                          <div className="online-dot absolute bottom-0 right-0 border-2 border-[var(--background)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-[15px] truncate group-hover:text-[var(--primary)] transition-colors">{chat.partner.name}</span>
                          </div>
                          <p className={`text-[13px] truncate ${chat.unread > 0 ? 'font-bold' : 'font-medium'}`} style={{ color: chat.unread > 0 ? 'var(--foreground)' : 'var(--foreground-muted)' }}>
                            {chat.lastMessage.sender._id === user?._id ? 'You: ' : ''}{chat.lastMessage.text || 'Sent an attachment'}
                          </p>
                        </div>
                        {chat.unread > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-white text-[11px] font-bold gradient-primary shadow-colored">
                            {chat.unread}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>No messages yet</div>
                )
              ) : (
                loadingChat ? (
                  <div className="flex-1 flex justify-center items-center"><Loader2 size={24} className="animate-spin text-[var(--primary)]" /></div>
                ) : (
                  <div className="p-4 flex flex-col gap-4">
                    {messages.map((msg, index) => {
                      const isMe = msg.sender._id === user?._id;
                      const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.sender._id !== msg.sender._id);

                      return (
                        <motion.div key={msg._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}
                        >
                          {!isMe && (
                            <div className="w-6 flex-shrink-0">
                              {showAvatar && (
                                <img src={msg.sender.profilePicture || `https://ui-avatars.com/api/?name=${msg.sender.name}&background=5c3ce6&color=fff`} 
                                  className="w-6 h-6 rounded-full object-cover shadow-sm" alt="" />
                              )}
                            </div>
                          )}
                          <div className={`px-4 py-2.5 text-[14px] shadow-sm font-medium ${isMe ? 'text-white rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`}
                            style={isMe
                              ? { background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)' }
                              : { background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }
                            }
                          >
                            {msg.text}
                          </div>
                        </motion.div>
                      );
                    })}
                    {typing[activePartner?._id] && (
                      <div className="self-start flex items-end gap-2 max-w-[85%] ml-8">
                        <div className="px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )
              )}
            </div>

            {/* Input Area (Discord Style) */}
            {activePartner && (
              <div className="p-4 border-t glass-panel" style={{ borderColor: 'var(--border)' }}>
                <form onSubmit={handleSend} className="flex gap-2 items-center rounded-xl px-3 py-2 border transition-all focus-within:ring-2 ring-[var(--primary-light)]"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
                >
                  <button type="button" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-[var(--primary)]">
                    <Plus size={20} />
                  </button>
                  <input type="text" placeholder={`Message @${activePartner.username}`} value={inputText}
                    onChange={(e) => { setInputText(e.target.value); handleTypingEmit(); }}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <button type="button" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-[var(--primary)]">
                    <Smile size={20} />
                  </button>
                  {inputText.trim() && (
                    <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} type="submit"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all gradient-primary shadow-colored"
                    >
                      <Send size={14} className="ml-0.5" />
                    </motion.button>
                  )}
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Widget Button */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-colored relative ${isOpen ? 'hidden' : 'flex'} gradient-primary`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare size={24} />
        {totalUnread > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full border-2 border-white dark:border-[var(--background)] flex items-center justify-center text-[11px] font-bold bg-red-500 text-white shadow-sm"
          >
            {totalUnread}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
