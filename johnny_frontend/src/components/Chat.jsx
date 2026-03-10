import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { User, Power, Code } from 'react-feather';
import PulsingMic from './PulsingMic';
import { useVoiceAudio } from '../hooks/useVoiceAudio';

const MessageBubble = ({ msg }) => {
    const isUser = msg.sender === 'user';
    const [displayedText, setDisplayedText] = useState(isUser ? msg.text : '');
    
    useEffect(() => {
        if (isUser || !msg.isStreaming) {
            setDisplayedText(msg.text);
            return;
        }
        
        // Typing effect for AI
        let i = 0;
        setDisplayedText('');
        const timer = setInterval(() => {
            if (i < msg.text.length) {
                setDisplayedText(prev => prev + msg.text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 30);
        
        return () => clearInterval(timer);
    }, [msg.text, isUser, msg.isStreaming]);

    return (
        <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-1 rounded-full ${isUser ? 'bg-accent order-2' : 'bg-gray-600 order-1'} shadow-md`}>
                {isUser ? <User size={20} className="text-primary" /> : <Code size={20} className="text-accent" />}
            </div>
            <div className={`px-4 py-3 rounded-lg max-w-lg shadow-sm transition-all duration-300 ${isUser ? 'bg-accent text-primary order-1 rounded-tr-none' : 'bg-primary/80 backdrop-blur-sm border border-border-color order-2 rounded-tl-none'}`}>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{displayedText}</p>
            </div>
        </div>
    );
};

export default function Chat({ user }) {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    // Fetch initial history
    useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });
            
            if (!error && data) {
                const formatted = data.map(m => ({...m, isStreaming: false}));
                setMessages(formatted);
            }
        };
        fetchHistory();
    }, [user.id]);

    const saveMessage = async (text, sender) => {
        const msgData = {
            user_id: user.id,
            text,
            sender
        };
        // We catch errors silently here as the table might not be created by the user yet.
        await supabase.from('messages').insert([msgData]).select();
    };

    const handleTranscript = async (transcript) => {
        if (!transcript) return;
        
        setConversationState('processing');
        const userMessage = { id: Date.now(), text: transcript, sender: 'user', isStreaming: false };
        setMessages(prev => [...prev, userMessage]);
        await saveMessage(transcript, 'user');

        try {
            // Build history context for API
            const historyContext = messages.map(m => ({ 
                role: m.sender === 'user' ? 'user' : 'model', 
                content: m.text 
            })).slice(-10); // send last 10 messages for context

            const apiUrl = import.meta.env.VITE_API_URL || 'https://johnny-backend.vercel.app/api/v1/chat/';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: transcript, user_id: user.id, history: historyContext })
            });

            if (!response.ok) throw new Error('Network response was not ok.');

            const data = await response.json();
            const aiResponse = { id: Date.now() + 1, text: data.reply, sender: 'johnny', isStreaming: true };
            
            setMessages(prev => [...prev, aiResponse]);
            await saveMessage(data.reply, 'johnny');
            
            speak(data.reply);

        } catch (error) {
            console.error('API Error:', error);
            const errorMsg = "I seem to be having trouble connecting. Please ensure the backend server is running.";
            setMessages(prev => [...prev, { id: Date.now() + 1, text: errorMsg, sender: 'johnny', isStreaming: true }]);
            speak(errorMsg, () => setConversationState('idle'));
        }
    };

    const {
        conversationState,
        setConversationState,
        analyser,
        startListening,
        stopListening,
        speak,
        interruptSpeaking
    } = useVoiceAudio({ onTranscriptReceived: handleTranscript });

    // Automatically scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSignOut = async () => {
        stopListening();
        interruptSpeaking();
        await supabase.auth.signOut();
    };

    useEffect(() => {
        if (messages.length === 0) {
            const initialGreeting = "System online. I am ready when you are.";
            setMessages([{ id: 1, text: initialGreeting, sender: 'johnny', isStreaming: true }]);
            speak(initialGreeting, () => setConversationState('idle'));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMicClick = () => {
        if (conversationState === 'listening') {
            stopListening();
        } else if (['idle', 'speaking'].includes(conversationState)) {
            interruptSpeaking();
            startListening();
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-transparent text-text-primary overflow-hidden">
            <header className="flex items-center justify-between p-4 border-b border-border-color/50 bg-primary/70 backdrop-blur-md shadow-md z-10 w-full">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
                        <Code className="text-accent" size={24} />
                    </div>
                    <h1 className="text-xl font-bold tracking-wider text-accent drop-shadow-sm">Johnny</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-text-secondary/80 hidden sm:block tracking-wide">{user.email}</span>
                    <button onClick={handleSignOut} className="p-2 rounded-md hover:bg-white/5 transition-colors duration-200" title="Sign Out">
                        <Power size={20} className="text-text-secondary hover:text-red-400 transition-colors" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto flex flex-col pb-32">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 w-full p-6 z-20 flex justify-center items-center pointer-events-none">
                <div className="bg-primary/50 backdrop-blur-md border border-border-color/30 rounded-full p-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] pointer-events-auto transition-transform hover:scale-105 duration-300">
                    <PulsingMic
                        state={conversationState}
                        onClick={handleMicClick}
                        analyserNode={analyser}
                    />
                </div>
            </footer>
        </div>
    );
}
