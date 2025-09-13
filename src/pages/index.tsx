import React from 'react';

import AgentCard from '../components/agentCard';

export default function Home() {

  return(
    <div className="bg-yellow-100 h-screen flex items-center flex-col gap-12 p-12">
        <h1 className="text-8xl font-bold"> Catstra </h1>
        <h2 className="text-4xl text-center">Choose Your Agent</h2>
        <div className="flex gap-4 h-100 flex-col md:flex-row">
          <AgentCard 
            agentName="sunny" 
            about="A friendly and playful cat who loves to play with toys and chase after birds." 
            image="/images/sunny.png"/>
          <AgentCard 
            agentName="luna" 
            about="A mysterious and sleek cat who loves to hunt and lounge." 
            image="/images/luna.png"/>
          <AgentCard 
            agentName="stella" 
            about="A super chill and laid back cat who loves to cuddle and do nothing." 
            image="/images/stella.png"/>
        </div>
    </div>
  )
}
