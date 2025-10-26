
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import EmailEditor from './components/EmailEditor';
import KnowledgeBase from './components/KnowledgeBase';
import { loadDatabase, saveDatabase, exportData, importData } from './services/localDbService';
import type { LocalDatabase, Agent } from './types';

const App: React.FC = () => {
  const [knowledgeBaseContext, setKnowledgeBaseContext] = useState<string>('');
  const [db, setDb] = useState<LocalDatabase>(loadDatabase());

  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  const handleEmailUpdate = useCallback((sanitizedContent: string) => {
    setKnowledgeBaseContext(sanitizedContent);
  }, []);

  const handleAgentChange = (agentId: string) => {
    setDb(prevDb => ({ ...prevDb, currentAgentId: agentId }));
  };

  const handleSendMessage = (newMessage: string, agent: Agent) => {
    setDb(prevDb => {
      const newHistory = [...(prevDb.chatHistory[agent.id] || []), { sender: 'user' as const, text: newMessage }];
      return {
        ...prevDb,
        chatHistory: { ...prevDb.chatHistory, [agent.id]: newHistory }
      };
    });
  };
  
  const handleAiResponse = (responseText: string, agent: Agent) => {
    setDb(prevDb => {
        const newHistory = [...(prevDb.chatHistory[agent.id] || []), { sender: 'ai' as const, text: responseText }];
        return {
          ...prevDb,
          chatHistory: { ...prevDb.chatHistory, [agent.id]: newHistory }
        };
      });
  };

  const handleImport = async () => {
    try {
      const newDb = await importData();
      if (newDb) {
        setDb(newDb);
        alert('Database imported successfully!');
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert('Failed to import database. Please check the console for details.');
    }
  };

  const currentAgent = useMemo(() => 
    db.agents.find(a => a.id === db.currentAgentId) || db.agents[0],
    [db.agents, db.currentAgentId]
  );
  
  const currentChatHistory = useMemo(() => 
    db.chatHistory[currentAgent.id] || [],
    [db.chatHistory, currentAgent]
  );

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="absolute top-0 left-0 right-0 p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 z-10">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          GhostManager
        </h1>
        <p className="text-sm text-gray-400">Your AI-Powered Compliance Co-Pilot</p>
      </header>
      
      <main className="flex w-full h-full pt-20">
        <div className="w-[70%] h-full p-4 border-r border-gray-800">
          <EmailEditor onContentUpdate={handleEmailUpdate} />
        </div>
        <div className="w-[30%] h-full p-4">
          <KnowledgeBase
            context={knowledgeBaseContext}
            agents={db.agents}
            currentAgent={currentAgent}
            messages={currentChatHistory}
            onAgentChange={handleAgentChange}
            onSendMessage={handleSendMessage}
            onAiResponse={handleAiResponse}
            onExport={exportData}
            onImport={handleImport}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
