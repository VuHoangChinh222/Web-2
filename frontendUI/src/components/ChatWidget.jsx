/* 
 * PREMIUM AI CHATBOT WIDGET WITH PURE STANDARD CSS (NO BOOTSTRAP REQUIRED)
 * Sinh viên: Vũ Hoàng Chính - 2122110380
 */

import React, { useState, useEffect, useRef } from 'react';
import { AI_CHATBOT_URL } from '../config';
import '../assets/css/ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chinh_hoops_ai_chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Lỗi parse lịch sử chat:", e);
      }
    } else {
      // Welcome message from AI
      const welcomeMsg = {
        sender: 'ai',
        text: 'Xin chào! Tôi là Trợ lý AI tư vấn bán hàng của Chinh Hoops. Bạn cần tôi hỗ trợ tìm kiếm sản phẩm hay thông tin gì hôm nay?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMsg]);
      sessionStorage.setItem('chinh_hoops_ai_chat_history', JSON.stringify([welcomeMsg]));
    }
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chinh_hoops_ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll to bottom when new messages arrive, user is typing, or when chat window is opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');

    // Add user message
    const userMsg = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Initial structure for AI message (empty text to accumulate stream)
    const aiMsgId = Date.now();
    const newAiMsg = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newAiMsg]);

    try {
      const response = await fetch(`${AI_CHATBOT_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối tới server AI');
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          // Update the specific AI message text in real-time
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg
            )
          );
        }
      } else {
        const text = await response.text();
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId ? { ...msg, text } : msg
          )
        );
      }
    } catch (error) {
      console.error('Lỗi gọi API AI Chat:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMsgId
            ? { ...msg, text: 'Rất tiếc, đã xảy ra lỗi kết nối với trợ lý AI. Vui lòng kiểm tra xem Server AI (FastAPI) đã hoạt động chưa.' }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử trò chuyện này không?")) {
      const welcomeMsg = {
        sender: 'ai',
        text: 'Xin chào! Tôi là Trợ lý AI tư vấn bán hàng của Chinh Hoops. Bạn cần tôi hỗ trợ tìm kiếm sản phẩm hay thông tin gì hôm nay?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMsg]);
      sessionStorage.setItem('chinh_hoops_ai_chat_history', JSON.stringify([welcomeMsg]));
    }
  };

  return (
    <>
      <div className="chinh-hoops-chatbot-container">
        {/* 1. CHAT BUBBLE BUTTON */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="chat-bubble-button"
            title="Tư vấn với AI"
            id="chat-widget-bubble-trigger"
          >
            {/* Chat Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" style={{ color: '#ffffff' }} viewBox="0 0 16 16">
              <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15z" />
            </svg>
            {/* Pulsing indicator */}
            <span className="pulse-dot-indicator" />
          </button>
        )}

        {/* 2. CHAT WINDOW */}
        {isOpen && (
          <div
            className="glass-chat-window"
            id="chat-widget-window-container"
          >
            {/* Chat Header */}
            <div className="chat-header">
              <div className="header-info">
                {/* Bot Avatar */}
                <div className="bot-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" style={{ color: '#ffffff' }} viewBox="0 0 16 16">
                    <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935 20.097 20.097 0 0 1-8.47 0A.933.933 0 0 1 3 9.22V8.062Zm2.05-1.35a.5.5 0 0 0-.05.698L6.223 9H5.5a.5.5 0 0 0 0 1h1.391l.05-.05 1-1a.5.5 0 0 0-.707-.707L6.34 9.135l-.592-.722a.5.5 0 0 0-.698-.052Zm4.8 0a.5.5 0 0 0-.698.05L8.56 9.135l-.592-.722a.5.5 0 1 0-.75.666l.75.917a.5.5 0 0 0 .75 0l1.5-1.833a.5.5 0 0 0-.05-.698Z" />
                    <path d="M5 2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v9.5A1.5 1.5 0 0 1 13.5 16h-11A1.5 1.5 0 0 1 1 14.5V5a2 2 0 0 1 2-2h2V2Zm1 1h4V2H6v1Zm-3 2v9.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V5H3Z" />
                  </svg>
                </div>
                <div>
                  <h6 className="header-title-text">Trợ Lý AI Chinh Hoops</h6>
                  <div className="status-wrapper">
                    <span className="status-dot" />
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Trực tuyến</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="header-actions">
                {/* Clear chat */}
                <button
                  onClick={handleClearChat}
                  className="action-icon-button"
                  title="Xóa lịch sử chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                  </svg>
                </button>
                {/* Close window */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="action-icon-button"
                  title="Thu nhỏ"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages-container">
              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`message-row ${msg.sender === 'user' ? 'user-align' : 'ai-align'}`}
                >
                  <div className={`message-bubble ${msg.sender === 'user' ? 'user-theme' : 'ai-theme'}`}>
                    {msg.text || (
                      <span style={{ display: 'flex', alignItems: 'center', padding: '4px 0' }}>
                        <span className="dot-loader" />
                        <span className="dot-loader" />
                        <span className="dot-loader" />
                      </span>
                    )}
                  </div>
                  <span className="message-timestamp">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Footer */}
            <div className="chat-footer">
              <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div className="input-bar-wrapper">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi AI về sản phẩm, kích cỡ..."
                    className="chat-text-input"
                    disabled={isTyping}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="send-icon-button"
                    style={{ opacity: (input.trim() && !isTyping) ? 1 : 0.4 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" style={{ color: '#f97316' }} viewBox="0 0 16 16">
                      <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338L2.01 6.13l12.122-4.814Z" />
                    </svg>
                  </button>
                </div>
              </form>
              <div className="footer-copyright">
                Bản quyền thuộc về Chinh Hoops AI Assistant
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
