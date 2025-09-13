import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatComponent from './agents/chat';

const Chat = () => {  
  const location = useLocation();
  const agentName = location.state?.agentName || 'sunny'; // default to sunny if no state
  
  return (
    <div>
      <div id="chat-container">
        <ChatComponent agentName={agentName} />
      </div>
    </div>
  );
};

export default Chat;