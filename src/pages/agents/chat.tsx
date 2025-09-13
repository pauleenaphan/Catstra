import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLightBulb, HiOutlineSparkles } from 'react-icons/hi';

interface ChatProps {
  agentName: string;
}

export default function Chat({ agentName }: ChatProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  // Generate a consistent thread ID for this session
  const [threadId] = useState(() => {
    const key = `${agentName}-thread-id`;
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'thread-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(key, id);
    }
    return id;
  });

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send only the current message with user ID - let the agent's memory handle the context
      const res = await fetch(`http://localhost:4112/api/agents/${agentName}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: input }],
          threadId: threadId,
          resourceId: `${agentName}-chat-session`
        }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let responseText = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('0:"')) {
              // Extract the text content from the streaming format
              const text = line.slice(3, -1); // Remove '0:"' and '"'
              responseText += text;
            }
          }
        }
      }
      
      // Clean up the response text
      const cleanResponse = responseText
        .replace(/\\n/g, '\n')  // Convert literal \n to actual newlines
        .replace(/\\"/g, '"')   // Convert literal \" to actual quotes
        .trim();
      
      const botMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: cleanResponse || 'Meow! Something went wrong! 😿' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Meow! I can't connect to my brain right now! 😿" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const resetUser = () => {
    localStorage.removeItem(`${agentName}-thread-id`);
    setMessages([]);
    window.location.reload(); // Reload to get new thread ID
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-yellow-100 relative">
      {/* Icons in top right corner */}
      <div className="absolute top-4 right-4 flex gap-3">
        {/* Sparkle icon */}
        <div className="relative group">
          <div className="cursor-pointer">
            <HiOutlineSparkles className="w-15 h-15 text-black" />
          </div>
          <div className="absolute top-full right-0 mt-2 w-80 p-3 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <div className="text-xl">
              <strong>Fun Interactions:</strong><br/>
              • Send me a cat treat!<br/>
              • Give me some catnip!<br/>
            </div>
            <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
          </div>
        </div>
        
        {/* Light bulb icon */}
        <div className="relative group">
          <div className="cursor-pointer">
            <HiOutlineLightBulb className="w-15 h-15 text-black" />
          </div>
          <div className="absolute top-full right-0 mt-2 w-80 p-3 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <div className="text-xl">
              <strong>Chat Tips:</strong><br/>
              • Ask me about my personality<br/>
              • I remember our conversations<br/>
              • Ask me about cats!
            </div>
            <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
          </div>
        </div>
      </div>
      
      <div className="md:w-1/2 w-4/5 h-3/4 flex flex-col border-4 rounded-lg shadow-lg bg-white">
      {/* Header */}
      <div className="border-b p-4 bg-yellow-200">
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 border-4 border-black rounded bg-green-900 text-white hover:bg-green-700 cursor-pointer"
          >
            ← Back to Home
          </button>
          <div className="flex gap-2">
            <button 
              onClick={clearChat} 
              className="px-3 py-1 bg-red-800 text-white border-4 border-black rounded hover:bg-red-700 cursor-pointer"
            >
              Clear Chat
            </button>
            {/* <button 
              onClick={resetUser} 
              className="px-3 py-1 border-4 rounded hover:bg-gray-100"
            >
              Reset User
            </button> */}
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4">
          <img 
            src={`/images/${agentName}.png`} 
            alt={agentName}
            className="w-12 h-12 rounded-full"
          />
          <h1 className="text-4xl font-bold capitalize"> Chat with {agentName} </h1>
        </div>
      </div>
      
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 border-t-4 border-b-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4 p-4 bg-gray-100 rounded">
            <div className="flex items-start gap-3">
              {message.role === 'user' ? (
                <div className="w-15 h-15 rounded-full bg-pink-400 flex items-center justify-center text-white font-bold">
                  U
                </div>
              ) : (
                <img 
                  src={`/images/${agentName}.png`} 
                  alt={agentName}
                  className="w-15 h-15 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <strong className="text-blue-600 text-xl capitalize"> {message.role === 'user' ? 'You' : agentName}: </strong> 
                <div className="text-xl mt-1 break-words overflow-wrap-anywhere"> {message.content} </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4 p-3 rounded bg-gray-100">
            <div className="flex items-center gap-3">
              <img 
                src={`/images/${agentName}.png`} 
                alt={agentName}
                className="w-15 h-15 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <strong className="text-blue-600 text-xl">{agentName}:</strong>
                <div className="mt-1 text-gray-600 text-xl break-words overflow-wrap-anywhere">
                  <span className="inline-flex items-center">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-100">●</span>
                    <span className="animate-pulse delay-200">●</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          )}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t p-4 bg-yellow-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
            placeholder={`Type a message to ${agentName}...`}
            disabled={isLoading}
            className="flex-1 p-3 border-4 rounded-lg focus:border-green-900 focus:outline-none text-xl bg-white"
          />
          <button 
            onClick={sendMessage}
            disabled={isLoading}
            className="px-6 py-3 border-4 border-black bg-green-900 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-700"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}