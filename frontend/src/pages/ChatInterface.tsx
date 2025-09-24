import React, { useState, useRef, useEffect } from "react";
import { Send, Zap, Code, Plus, BarChart3 } from "lucide-react";
import { verifySession } from "../sessions/verifySessions";


// Mock context and components for demonstration
const useApp = () => {
  const [messages, setMessages] = useState([]);
  const addMessage = (content :string, role: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now(), content, role }]);
  };
  return { messages, addMessage };
};

const ChatMessage = ({ message }: { message: { content: string; role: 'user' | 'bot' } }) => (
  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
      message.role === 'user' 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
        : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-white/20'
    }`}>
      <p className="text-sm leading-relaxed">{message.content}</p>
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  </div>
);

interface ChatInterfaceProps {
  onStartBuild: (prompt: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onStartBuild }) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage } = useApp();


   useEffect(() => {
    const checkSession = async () => {
      await verifySession();
      
    };
    checkSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage(userMessage, "user");
    setIsLoading(true);

    setTimeout(() => {
      addMessage(
        "Perfect! I'll help you build that amazing application. I'm analyzing your requirements and preparing a modern, responsive design with cutting-edge features.",
        "bot"
      );
      setIsLoading(false);
    }, 2000);
  };


  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 via-red-900 to-yellow-600">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-white font-semibold text-lg">Sparkly AI</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-white/80 text-sm">
            <span className="hover:text-white cursor-pointer">Community</span>
            <span className="hover:text-white cursor-pointer">Pricing</span>
            <span className="hover:text-white cursor-pointer">Enterprise</span>
            <span className="hover:text-white cursor-pointer">Learn</span>
            <span className="hover:text-white cursor-pointer">Launched</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-white/80 hover:text-white text-sm">Log in</button>
            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Get started
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">
          {/* Welcome Section */}
          {messages.length === 0 && (
            <>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 max-w-4xl leading-tight">
                Build website{" "}
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <span>Sparkly AI</span>
                </div>
              </h1>
              
              <p className="text-xl text-white/70 mb-12 max-w-2xl">
                Create apps and websites by chatting with AI
              </p>

              {/* Input Section */}
              <div className="w-full max-w-2xl mb-8">
                <div className=" bg-black/30 backdrop-blur-[20px] border border-white/10 focus-within:border-white/20 p-2 outline-none transition-colors rounded-2xl p-1 mb-4">
                  <div className="flex items-center">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      placeholder="Ask Build to create a landing page for my..."
                      className="flex-1 bg-transparent text-white placeholder-white/50 px-6 py-4 outline-none resize-none text-lg"
                      rows={1}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!input.trim() || isLoading}
                      className="mr-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Bottom Controls */}
                <div className="flex items-center justify-between text-sm text-white/60">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 hover:text-white/80 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Public</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span>Supabase</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <div className="w-4 h-4 border border-current rounded"></div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="w-full max-w-4xl">
              <div className="space-y-6 mb-8">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {isLoading && <TypingIndicator />}

                {messages.length >= 2 && !isLoading && (
                  <div className="flex justify-center pt-8">
                    <button
                      onClick={() => onStartBuild && onStartBuild(input)}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                    >
                      <Code className="w-5 h-5" />
                      <span>Start Building</span>
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input for chat mode */}
              <div className="bg-black/30 backdrop-blur-[20px] border border-white/10 focus-within:border-white/20 rounded-md px-4 py-2 outline-none transition-colors rounded-2xl p-1">
                <div className="flex items-center">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Continue the conversation..."
                    className="flex-1 bg-transparent text-white placeholder-white/50 px-6 py-4 outline-none resize-none"
                    rows={1}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    className="mr-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatInterface;