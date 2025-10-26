
export interface ComplianceIssue {
  type: 'HIPAA' | 'FDA' | 'General';
  description: string;
  suggestion: string;
}

export interface ComplianceResult {
  summary: 'No issues found' | 'Potential issues detected' | 'Error';
  issues: ComplianceIssue[];
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
}

export interface LocalDatabase {
  agents: Agent[];
  currentAgentId: string;
  chatHistory: {
    [agentId: string]: ChatMessage[];
  };
}
