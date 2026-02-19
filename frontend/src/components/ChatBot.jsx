import React, { useState } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! 👋 I am PrePick Assistant. How can I help you?", sender: "bot" }
  ]);

  // Pre-defined Questions
  const faq = [
    { q: "How to place an order?", a: "Go to the 'Shops' page, select a shop, add items to cart, and checkout! 🍔" },
    { q: "Payment failed?", a: "Don't worry! If money was deducted, it will be refunded within 24 hours. You can try paying via Cash on Pickup." },
    { q: "Where is my order?", a: "Go to 'My Orders' to check the live status (Preparing/Ready). ✅" },
    { q: "How to contact support?", a: "Go to Profile > Support to send us a message directly." },
  ];

  const handleQuestionClick = (answer) => {
    // User ka sawal dikhao
    setMessages((prev) => [...prev, { text: "Selected a question...", sender: "user" }]);
    
    // Thoda delay karke Bot ka jawab dikhao (Real feel ke liye)
    setTimeout(() => {
      setMessages((prev) => [...prev, { text: answer, sender: "bot" }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 w-80 h-96 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden mb-4 animate-fade-in-up">
          {/* Header */}
          <div className="bg-primary p-4 text-white font-bold flex justify-between items-center">
            <span>🤖 PrePick Help</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">✖</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'bot' ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm' : 'bg-blue-500 text-white'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Buttons */}
          <div className="p-2 bg-gray-100 dark:bg-gray-800 grid grid-cols-1 gap-2">
            <p className="text-xs text-center text-gray-500 mb-1">Select a query:</p>
            {faq.map((item, index) => (
              <button 
                key={index} 
                onClick={() => handleQuestionClick(item.a)}
                className="text-xs bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full py-2 px-3 hover:bg-primary hover:text-white transition-colors text-left truncate"
              >
                {item.q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Button (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-red-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform transform hover:scale-110"
      >
        {isOpen ? '🔽' : '💬'}
      </button>
    </div>
  );
};

export default ChatBot;