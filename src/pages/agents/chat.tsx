import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ChatProps {
  agentName: string;
}

export default function Chat({ agentName }: ChatProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
    <div>
      <div>
        <div>
          <div>
            <button 
              onClick={() => navigate('/')} 
            >
              ← Back to Home
            </button>
            <div>
              <button 
                onClick={clearChat} 
              >
                Clear Chat
              </button>
              <button 
                onClick={resetUser} 
              >
                Reset User
              </button>
            </div>
          </div>
          
          <h1>
            🤖 Chat with {agentName}
          </h1>
          
          <div>
            {messages.map((message) => (
              <div key={message.id}>
                <strong>
                  {message.role === 'user' ? 'You' : agentName}:
                </strong> 
                <div>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div>
                {agentName} is typing... 🤖
              </div>
            )}
          </div>
          
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder={`Type a message to ${agentName}...`}
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}