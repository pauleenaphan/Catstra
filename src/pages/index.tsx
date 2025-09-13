import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return(
    <div>
      <h1>choose your agent</h1>
      <p>Sunny</p>
      <button onClick={() => { navigate('/chat', { state: { agentName: 'sunny' } }) }}>talk to sunny</button>
      <p>Luna</p>
      <button onClick={() => { navigate('/chat', { state: { agentName: 'luna' } }) }}>talk to luna</button>
      <p>Stella</p>
      <button onClick={() => { navigate('/chat', { state: { agentName: 'stella' } }) }}>talk to stella</button>
    </div>
  )
}
