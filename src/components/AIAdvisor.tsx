/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, CalculationResult } from '../types';
import { MessageSquare, Send, Sparkles, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';

interface AIAdvisorProps {
  calculationData: CalculationResult | null;
  deceasedName: string;
  deceasedGender: 'M' | 'F';
}

const SMART_SUGGESTIONS = [
  "Explain why full sisters are excluded in this case.",
  "Why is the wife's share 1/8 instead of 1/4?",
  "What is the religious backing or Quranic verses for daughter shares?",
  "Can you explain what the Gharrawain case means?",
  "What happens if there's a non-Muslim relative in the family?"
];

export default function AIAdvisor({
  calculationData,
  deceasedName,
  deceasedGender,
}: AIAdvisorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Assalamu Alaikum. I am your Sharia Faraidh AI Scholar. 
      
I have studied your active calculation and family structure. I can explain the legal basis for any share, describe Sunni exclusion (Hajb) rules, or detail how complex cases like Al-Awl or Al-Radd apply here.

What can I clarify for you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorStatus(null);
    const userMsgId = 'msg-' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/faraid/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: textToSend,
          calculationData: calculationData ? { 
            ...calculationData, 
            deceasedName, 
            deceasedGender 
          } : null,
          chatHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the Sharia AI Consultant server.');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || 'Connecting to Faraid AI Consultant failed.');
      
      // Inject friendly error message
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'assistant',
          text: `⚠️ I apologize, there was a temporary difficulty connecting to our Sharia Scholarly servers. Please make sure your Gemini API key is configured in the secrets panel or retry.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg text-stone-200">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-950 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-white font-display">Sharia Faraid AI Consultant</h3>
            <span className="text-[10px] text-emerald-500 font-mono tracking-wide">Powered by Gemini 3.5 & Faraidh Jurisprudence</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[9px] font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </div>
      </div>

      {/* Messages Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[340px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div
              className={`px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-stone-800 text-stone-100 rounded-bl-none border border-stone-700/50'
              }`}
            >
              {/* Maintain whitespaces/markdown layout roughly in chat */}
              <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                {msg.text}
              </div>
            </div>
            <span className="text-[9px] text-stone-500 mt-1 font-mono">
              {msg.sender === 'user' ? 'You' : 'AI Consultant'} • {msg.timestamp}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-400 text-left bg-stone-800/40 p-2.5 rounded-lg border border-stone-800 w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            <span>AI Scholar is formulating Sharia reasoning...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions Tray */}
      <div className="bg-stone-950 p-2 border-t border-stone-800">
        <span className="text-[9px] text-stone-500 uppercase tracking-wider font-semibold block px-1 mb-1">
          Quick Inquiry Templates
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
          {SMART_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              disabled={isLoading}
              className="text-[10px] text-stone-300 bg-stone-900 border border-stone-800 px-2 py-1 rounded-full whitespace-nowrap hover:bg-stone-800 hover:border-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Input */}
      <div className="p-3 bg-stone-950 border-t border-stone-800 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about exclusions, fractions, Gharrawain, Wills basis..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(inputValue);
          }}
          className="flex-1 text-xs bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-white placeholder-stone-500 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-stone-850"
        />
        <button
          onClick={() => handleSend(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="bg-emerald-600 text-white rounded-lg p-2 hover:bg-emerald-500 hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
