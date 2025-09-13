import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentCard({ agentName, about, image }: { agentName: string, about: string, image: string }) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center bg-yellow-200 border-4 rounded-lg md:w-1/3 min-h-150 h-fit md:gap-8 gap-4 p-8">
      <h1 className="capitalize text-5xl font-bold">{agentName}</h1>
      {image && (
        <img 
          src={image} 
          alt={agentName} 
          className="w-[50%] h-[100%] rounded-lg border-4 border-black"
        />
      )}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xl w-2/3 text-center">{about}</p>
      </div>
      <button 
        className="text-lg bg-green-900 text-white py-2 px-4 rounded-md border-4 border-black hover:bg-green-800 cursor-pointer"
        onClick={() => { navigate('/chat', { state: { agentName: agentName } }) }}
      >
        Talk to {agentName}
      </button>
    </div>
  );
}