import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
}

export const ChatWidget: FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hi there! 👋 I'm Arsalan's AI assistant. Ask me anything about his skills, projects, or experience!", isUser: false }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const generateResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('skill') || lowerInput.includes('stack') || lowerInput.includes('tech')) {
            return `Arsalan is proficient in: ${portfolioData.skills.join(', ')}. He's always learning new things!`;
        }

        if (lowerInput.includes('project') || lowerInput.includes('work') || lowerInput.includes('built')) {
            const projectNames = portfolioData.projects.map(p => p.title).join(', ');
            return `He has worked on some cool projects like: ${projectNames}. Which one would you like to know more about?`;
        }

        if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('reach') || lowerInput.includes('hire')) {
            return `You can reach him at ${portfolioData.contact.email}. He's also on LinkedIn: ${portfolioData.contact.linkedin}`;
        }

        if (lowerInput.includes('experience') || lowerInput.includes('job') || lowerInput.includes('company')) {
            const latest = portfolioData.experience[0];
            return `Currently, he's a ${latest.title} at ${latest.company}. Before that, he worked at ${portfolioData.experience[1]?.company || 'other cool places'}.`;
        }

        if (lowerInput.includes('about') || lowerInput.includes('who') || lowerInput.includes('bio')) {
            return portfolioData.about.bio;
        }

        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
            return "Hello! How can I help you today? 😊";
        }

        return "I'm tuned to answer questions about Arsalan's professional work. Try asking about his 'skills', 'projects', or 'experience'!";
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputValue, isUser: true };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const responseText = generateResponse(userMsg.text);
            const aiMsg: Message = { id: (Date.now() + 1).toString(), text: responseText, isUser: false };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000); // Random delay between 1-2s
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                className="glass-card"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    cursor: 'pointer',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-alt)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
            >
                {isOpen ? (
                    <i className="fas fa-times" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
                ) : (
                    <i className="fas fa-sparkles" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="glass-card"
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '30px',
                            width: '350px',
                            height: '500px',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '20px'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '15px 20px',
                            borderBottom: '1px solid var(--glass-border)',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: '#00ff88',
                                boxShadow: '0 0 10px #00ff88'
                            }} />
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Portfolio AI</span>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            padding: '20px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%',
                                        padding: '12px 16px',
                                        borderRadius: '15px',
                                        background: msg.isUser ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        color: msg.isUser ? '#000' : 'var(--text-main)',
                                        borderBottomRightRadius: msg.isUser ? '2px' : '15px',
                                        borderBottomLeftRadius: msg.isUser ? '15px' : '2px',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.5
                                    }}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    padding: '12px 16px',
                                    borderRadius: '15px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderBottomLeftRadius: '2px'
                                }}>
                                    <motion.div
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                                    >
                                        Thinking...
                                    </motion.div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: '15px',
                            borderTop: '1px solid var(--glass-border)',
                            display: 'flex',
                            gap: '10px'
                        }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about skills, projects..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.2)',
                                    border: 'none',
                                    borderRadius: '20px',
                                    padding: '10px 15px',
                                    color: 'var(--text-main)',
                                    outline: 'none'
                                }}
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSend}
                                style={{
                                    background: 'var(--primary)',
                                    border: 'none',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#000'
                                }}
                            >
                                <i className="fas fa-paper-plane"></i>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
