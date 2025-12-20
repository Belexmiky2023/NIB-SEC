
import React, { useState } from 'react';
import { User, Chat, Message } from '../types';

interface MainViewProps {
  user: User;
  onStartCall: () => void;
}

const MainView: React.FC<MainViewProps> = ({ user, onStartCall }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const mockChats: Chat[] = [
    { id: '1', name: 'NIB HQ', type: 'channel', avatar: 'https://picsum.photos/101', unreadCount: 12, membersCount: 450, lastMessage: 'Update on secure protocols.' },
    { id: '2', name: 'Dev Hive', type: 'group', avatar: 'https://picsum.photos/102', unreadCount: 0, membersCount: 8, lastMessage: 'Check the honeycomb logic.' },
    { id: '3', name: '@the_queen', type: 'direct', avatar: 'https://picsum.photos/103', unreadCount: 1, lastMessage: 'Protocol 7 initiated.' },
    { id: '4', name: '@drone_01', type: 'direct', avatar: 'https://picsum.photos/104', unreadCount: 0, lastMessage: 'Standby mode active.' },
  ];

  const activeChat = mockChats.find(c => c.id === activeChatId);

  const mockMessages: Message[] = [
    { id: 'm1', senderId: '3', text: 'Operation Honeycomb is go.', timestamp: Date.now() - 3600000 },
    { id: 'm2', senderId: 'user', text: 'Acknowledged. Scanners are live.', timestamp: Date.now() - 3000000 },
    { id: 'm3', senderId: '3', text: 'Encryption keys have been rotated. Check terminal logs.', timestamp: Date.now() - 2000000, reactions: ['🔥', '🐝'] },
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessageInput('');
    // Logic for sending
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Sidebar: Navigation & Chat List */}
      <div className="w-20 lg:w-80 border-r border-white/5 bg-black flex flex-col">
        <div className="p-4 lg:p-6 border-b border-white/5 flex items-center space-x-4">
          <div className="w-10 h-10 hexagon bg-yellow-400 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-shield text-black"></i>
          </div>
          <span className="hidden lg:block font-bold text-xl text-yellow-400">NIB SEC</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-1">
          <div className="hidden lg:block px-4 py-2 text-[10px] text-gray-600 uppercase tracking-widest font-bold">Encrypted Streams</div>
          {mockChats.map(chat => (
            <button 
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all ${
                activeChatId === chat.id 
                ? 'bg-yellow-400/10 border border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.05)]' 
                : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <img src={chat.avatar} alt={chat.name} className="w-10 h-10 hexagon object-cover border border-white/10" />
                {chat.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col items-start flex-1 min-w-0">
                <div className="flex justify-between w-full">
                  <span className="font-semibold text-sm truncate">{chat.name}</span>
                  <span className="text-[10px] text-gray-600">12:45</span>
                </div>
                <p className="text-xs text-gray-500 truncate w-full">{chat.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 flex items-center lg:space-x-3">
          <div className="w-10 h-10 hexagon border border-yellow-400/50 p-0.5">
            <img src={user.avatarUrl} className="w-full h-full hexagon object-cover" />
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-bold truncate">{user.username}</div>
            <div className="text-[10px] text-green-500 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              Secured Online
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <div className="h-16 lg:h-20 border-b border-white/5 bg-black/50 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <img src={activeChat?.avatar} className="w-10 h-10 hexagon object-cover border border-white/10" />
            <div>
              <div className="font-bold flex items-center">
                {activeChat?.name}
                {activeChat?.type === 'channel' && <i className="fa-solid fa-bullhorn text-[10px] ml-2 text-yellow-400"></i>}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-tighter">
                {activeChat?.membersCount ? `${activeChat.membersCount} operatives` : 'Private Tunnel'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <button onClick={onStartCall} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center">
              <i className="fa-solid fa-phone"></i>
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          <div className="flex justify-center">
            <span className="bg-neutral-900 text-[10px] text-gray-600 px-4 py-1 rounded-full uppercase tracking-widest border border-white/5">Encrypted Connection Established</span>
          </div>
          
          {mockMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%] lg:max-w-[60%] space-y-1">
                <div className={`p-4 rounded-3xl text-sm relative transition-all group ${
                  msg.senderId === 'user' 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-medium shadow-[0_4px_15px_rgba(250,204,21,0.2)]' 
                  : 'bg-neutral-900 border border-yellow-400/10 text-white'
                }`}>
                  {msg.text}
                  {msg.reactions && (
                    <div className="absolute -bottom-3 right-4 flex space-x-1">
                      {msg.reactions.map(r => (
                        <span key={r} className="bg-neutral-800 text-xs px-2 py-0.5 rounded-full border border-yellow-400/20">{r}</span>
                      ))}
                    </div>
                  )}
                  <div className={`absolute top-0 -right-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1 ${msg.senderId === 'user' ? 'hidden' : ''}`}>
                    <button className="text-gray-600 hover:text-yellow-400"><i className="fa-solid fa-heart"></i></button>
                  </div>
                </div>
                <div className={`text-[10px] px-2 text-gray-600 ${msg.senderId === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.senderId === 'user' && <i className="fa-solid fa-check-double ml-1 text-blue-500"></i>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-black/80 border-t border-white/5">
          <div className="relative flex items-center space-x-2 lg:space-x-4 max-w-5xl mx-auto">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-2xl hover:text-yellow-400 transition-colors shrink-0"
            >
              <i className="fa-regular fa-face-smile text-lg"></i>
            </button>
            <div className="flex-1 relative">
              <input 
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Secure message..."
                className="w-full bg-neutral-900 border border-white/5 focus:border-yellow-400/50 rounded-2xl py-3 px-6 outline-none transition-all placeholder:text-gray-700"
              />
            </div>
            <button 
              onClick={handleSendMessage}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shrink-0 ${
                messageInput.trim() ? 'bg-yellow-400 text-black shadow-lg scale-110' : 'bg-neutral-900 text-gray-700'
              }`}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-4 bg-neutral-900 border border-yellow-400/20 p-4 rounded-3xl grid grid-cols-6 gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                {['🐝', '🔥', '⚡️', '🛡️', '💻', '🔒', '🚀', '🛠️', '🕵️', '🤖', '👑', '📡'].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => { setMessageInput(prev => prev + emoji); setShowEmojiPicker(false); }}
                    className="text-2xl p-2 hover:bg-yellow-400/10 rounded-xl transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Column: Profile / Security (Desktop Only) */}
      <div className="hidden xl:flex w-80 bg-black border-l border-white/5 flex-col p-8 space-y-8 overflow-y-auto">
        <div className="text-center space-y-4">
          <div className="w-32 h-32 hexagon mx-auto border-2 border-yellow-400 p-1">
             <img src={activeChat?.avatar} className="w-full h-full hexagon object-cover" />
          </div>
          <h3 className="text-xl font-bold">{activeChat?.name}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest">{activeChat?.type}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
            <h4 className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Security Stats</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Encryption</span>
              <span className="text-green-500 font-mono">ENABLED</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Latency</span>
              <span className="text-yellow-400 font-mono">14ms</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Tunnel ID</span>
              <span className="text-gray-300 font-mono truncate ml-4">#NX-921-A</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2">Shared Files</h4>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-yellow-400/20">
                  <div className="w-10 h-10 bg-yellow-400/5 rounded-lg flex items-center justify-center text-yellow-400">
                    <i className="fa-solid fa-file-shield"></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">Log_NX_{i}.bin</div>
                    <div className="text-[10px] text-gray-600">4.2 MB • Yesterday</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainView;
