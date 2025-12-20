
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message } from '../types';

interface MainViewProps {
  user: User;
  onStartCall: () => void;
}

const initialMockChats: Chat[] = [
  { id: '1', name: 'NIB HQ', type: 'channel', avatar: 'https://picsum.photos/101', unreadCount: 12, membersCount: 450, lastMessage: 'Update on secure protocols.', isPinned: true },
  { id: '2', name: 'Dev Hive', type: 'group', avatar: 'https://picsum.photos/102', unreadCount: 0, membersCount: 8, lastMessage: 'Check the honeycomb logic.' },
  { id: '3', name: '@the_queen', type: 'direct', avatar: 'https://picsum.photos/103', unreadCount: 1, lastMessage: 'Protocol 7 initiated.' },
  { id: '4', name: '@drone_01', type: 'direct', avatar: 'https://picsum.photos/104', unreadCount: 0, lastMessage: 'Standby mode active.' },
];

const MainView: React.FC<MainViewProps> = ({ user, onStartCall }) => {
  const [chats, setChats] = useState<Chat[]>(initialMockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chatId: string } | null>(null);
  
  // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout for browser compatibility
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeChat = chats.find(c => c.id === activeChatId);

  const mockMessages: Message[] = [
    { id: 'm1', senderId: '3', text: 'Operation Honeycomb is go.', timestamp: Date.now() - 3600000 },
    { id: 'm2', senderId: 'user', text: 'Acknowledged. Scanners are live.', timestamp: Date.now() - 3000000 },
    { id: 'm3', senderId: '3', text: 'Encryption keys have been rotated. Check terminal logs.', timestamp: Date.now() - 2000000, reactions: ['🔥', '🐝'] },
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessageInput('');
  };

  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, chatId: string) => {
    if ('preventDefault' in e) e.preventDefault();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const menuWidth = 180;
    const menuHeight = 110;
    const x = clientX + menuWidth > window.innerWidth ? clientX - menuWidth : clientX;
    const y = clientY + menuHeight > window.innerHeight ? clientY - menuHeight : clientY;

    setContextMenu({ x, y, chatId });
  };

  const handleTouchStart = (chatId: string) => (e: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => {
      handleContextMenu(e, chatId);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const togglePin = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
    setContextMenu(null);
  };

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const pinnedChats = chats.filter(c => c.isPinned);
  const unpinnedChats = chats.filter(c => !c.isPinned);

  const renderChatItem = (chat: Chat) => (
    <button 
      key={chat.id}
      onClick={() => setActiveChatId(chat.id)}
      onContextMenu={(e) => handleContextMenu(e, chat.id)}
      onTouchStart={handleTouchStart(chat.id)}
      onTouchEnd={handleTouchEnd}
      className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all relative group ${
        activeChatId === chat.id 
        ? 'bg-yellow-400/15 border border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]' 
        : chat.isPinned 
          ? 'bg-white/5 border border-yellow-400/10 hover:bg-white/10'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="relative shrink-0">
        <div className={`w-10 h-10 hexagon p-0.5 ${chat.isPinned ? 'bg-yellow-400/50' : 'bg-white/10'}`}>
          <img src={chat.avatar} alt={chat.name} className="w-full h-full hexagon object-cover" />
        </div>
        {chat.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-black">
            {chat.unreadCount}
          </span>
        )}
        {chat.isPinned && (
          <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-yellow-400/30">
            <i className="fa-solid fa-thumbtack text-[8px] text-yellow-400 rotate-45"></i>
          </div>
        )}
      </div>
      <div className="hidden lg:flex flex-col items-start flex-1 min-w-0">
        <div className="flex justify-between w-full">
          <span className="font-semibold text-sm truncate flex items-center">
            {chat.name}
            {chat.isPinned && <i className="fa-solid fa-thumbtack text-[10px] ml-1.5 text-yellow-400/40 rotate-45"></i>}
          </span>
          <span className="text-[10px] text-gray-600">12:45</span>
        </div>
        <p className="text-xs text-gray-500 truncate w-full">{chat.lastMessage}</p>
      </div>
    </button>
  );

  return (
    <div className="h-full flex overflow-hidden">
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-neutral-900 border border-yellow-400/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-2 min-w-[180px] animate-in fade-in zoom-in duration-150 backdrop-blur-xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => togglePin(contextMenu.chatId)}
            className="w-full text-left px-4 py-3 text-sm hover:bg-yellow-400/10 flex items-center space-x-3 transition-colors group"
          >
            <i className={`fa-solid ${chats.find(c => c.id === contextMenu.chatId)?.isPinned ? 'fa-thumbtack-slash' : 'fa-thumbtack'} text-yellow-400 group-hover:scale-110 transition-transform`}></i>
            <span className="font-medium">{chats.find(c => c.id === contextMenu.chatId)?.isPinned ? 'Unpin Chat' : 'Pin to Top'}</span>
          </button>
          <div className="h-px bg-white/5 my-1 mx-2"></div>
          <button className="w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 text-red-400 flex items-center space-x-3 transition-colors">
            <i className="fa-solid fa-trash-can"></i>
            <span className="font-medium">Delete Tunnel</span>
          </button>
        </div>
      )}

      {/* Left Sidebar */}
      <div className="w-20 lg:w-80 border-r border-white/5 bg-black flex flex-col">
        <div className="p-4 lg:p-6 border-b border-white/5 flex items-center space-x-4">
          <div className="w-10 h-10 hexagon bg-yellow-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
            <i className="fa-solid fa-shield text-black"></i>
          </div>
          <span className="hidden lg:block font-bold text-xl text-yellow-400 tracking-tighter">NIB SEC</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-1">
          {pinnedChats.length > 0 && (
            <>
              <div className="hidden lg:flex items-center space-x-2 px-4 py-2 text-[10px] text-yellow-400/50 uppercase tracking-widest font-bold">
                <i className="fa-solid fa-thumbtack text-[8px] rotate-45"></i>
                <span>Pinned</span>
              </div>
              {pinnedChats.map(renderChatItem)}
              <div className="h-4"></div>
            </>
          )}

          <div className="hidden lg:block px-4 py-2 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            {pinnedChats.length > 0 ? 'All Messages' : 'Encrypted Streams'}
          </div>
          {unpinnedChats.map(renderChatItem)}
        </div>

        <div className="p-4 border-t border-white/5 flex items-center lg:space-x-3 bg-neutral-900/20">
          <div className="w-10 h-10 hexagon border border-yellow-400/30 p-0.5">
            <img src={user.avatarUrl} className="w-full h-full hexagon object-cover" />
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{user.username}</div>
            <div className="text-[10px] text-green-500 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Secured Online
            </div>
          </div>
          <button className="hidden lg:block text-gray-600 hover:text-white transition-colors">
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-black/40">
        {/* Chat Header */}
        <div className="h-16 lg:h-20 border-b border-white/5 bg-black/60 backdrop-blur-2xl px-4 lg:px-8 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 hexagon p-0.5 bg-white/10">
              <img src={activeChat?.avatar} className="w-full h-full hexagon object-cover" />
            </div>
            <div>
              <div className="font-bold flex items-center text-lg lg:text-xl tracking-tight">
                {activeChat?.name}
                {activeChat?.type === 'channel' && <i className="fa-solid fa-bullhorn text-[10px] ml-2 text-yellow-400/70"></i>}
                {activeChat?.isPinned && <i className="fa-solid fa-thumbtack text-[10px] ml-2 text-yellow-400/30 rotate-45"></i>}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                {activeChat?.membersCount ? `${activeChat.membersCount.toLocaleString()} operatives` : 'Direct Terminal'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button onClick={onStartCall} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center border border-white/5">
              <i className="fa-solid fa-phone"></i>
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center border border-white/5">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          <div className="flex justify-center sticky top-0 z-0 py-4">
            <span className="bg-neutral-900/80 backdrop-blur text-[10px] text-yellow-400/70 px-6 py-2 rounded-full uppercase tracking-[0.2em] border border-yellow-400/20 font-bold">
              <i className="fa-solid fa-lock mr-2"></i>
              End-to-End Encryption Active
            </span>
          </div>
          
          {mockMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] lg:max-w-[70%] space-y-1">
                <div className={`p-4 rounded-3xl text-sm relative transition-all group ${
                  msg.senderId === 'user' 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-semibold shadow-[0_8px_25px_rgba(250,204,21,0.2)]' 
                  : 'bg-neutral-900 border border-white/5 text-gray-100'
                }`}>
                  {msg.text}
                  {msg.reactions && (
                    <div className="absolute -bottom-3 right-4 flex space-x-1">
                      {msg.reactions.map(r => (
                        <span key={r} className="bg-neutral-800 text-xs px-2 py-0.5 rounded-full border border-yellow-400/20 shadow-lg">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`text-[10px] px-2 text-gray-600 font-mono ${msg.senderId === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.senderId === 'user' && <i className="fa-solid fa-check-double ml-1 text-blue-500"></i>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-black/60 backdrop-blur-xl border-t border-white/5">
          <div className="relative flex items-center space-x-2 lg:space-x-4 max-w-5xl mx-auto">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-12 h-12 flex items-center justify-center bg-neutral-900/50 rounded-2xl hover:text-yellow-400 transition-all border border-white/5 shrink-0"
            >
              <i className="fa-regular fa-face-smile text-lg"></i>
            </button>
            <div className="flex-1 relative">
              <input 
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Transmit secure signal..."
                className="w-full bg-neutral-900/50 border border-white/5 focus:border-yellow-400/50 rounded-2xl py-3.5 px-6 outline-none transition-all placeholder:text-gray-700 font-medium"
              />
            </div>
            <button 
              onClick={handleSendMessage}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shrink-0 ${
                messageInput.trim() ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-105' : 'bg-neutral-900 text-gray-700'
              }`}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-4 bg-neutral-900/95 border border-yellow-400/20 p-4 rounded-3xl grid grid-cols-6 gap-2 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4 backdrop-blur-2xl">
                {['🐝', '🔥', '⚡️', '🛡️', '💻', '🔒', '🚀', '🛠️', '🕵️', '🤖', '👑', '📡'].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => { setMessageInput(prev => prev + emoji); setShowEmojiPicker(false); }}
                    className="text-2xl p-2 hover:bg-yellow-400/20 rounded-xl transition-all hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainView;
