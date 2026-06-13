import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, AlertCircle } from 'lucide-react';
import { chat } from '../api';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m your medical assistant specialized in skin health. Ask me anything about skin conditions, symptoms, treatments, or skin care advice.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chat(input);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        is_medical: response.data.is_medical,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What is melanoma?",
    "How to treat acne?",
    "What causes eczema?",
    "How to prevent skin cancer?",
    "What is the difference between a mole and melanoma?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Medical Assistant</h1>
              <p className="text-gray-600">Ask me about skin health and conditions</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-semibold">Medical-Only Assistant</p>
                <p className="text-sm text-amber-700 mt-1">
                  I can only answer questions about skin health, conditions, and treatments. 
                  Non-medical questions will be politely declined.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Questions:</h3>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6" style={{ height: '500px', overflowY: 'auto' }}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    {message.role === 'user' ? (
                      <div className="bg-blue-500 p-2 rounded-full">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-full">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div>
                    <div
                      className={`rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.isError
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : message.is_medical === false
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-3xl">
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-full mr-3">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-end space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about skin conditions, symptoms, treatments..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>⚕️ Medical Disclaimer:</strong> This chatbot provides general medical information only. 
            Always consult with a qualified dermatologist for proper diagnosis and treatment of skin conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
