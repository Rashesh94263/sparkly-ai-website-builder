import React from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex items-start space-x-4 ${isBot ? '' : 'flex-row-reverse space-x-reverse'} animate-fade-in`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isBot 
          ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
          : 'bg-gradient-to-br from-gray-600 to-gray-700'
      }`}>
        {isBot ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isBot ? '' : 'flex justify-end'}`}>
        <div className={`px-6 py-4 rounded-2xl shadow-sm ${
          isBot 
            ? 'bg-white border border-gray-200/50 text-gray-900' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;