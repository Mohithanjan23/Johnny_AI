import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { LogIn, Send, User, Power, Loader, Code } from 'react-feather';

// --- Authentication Component ---
const AuthComponent = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            alert('Check your email for the login link!');
        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex flex-col justify-center items-center text-text-primary p-4">
            <div className="w-full max-w-md bg-secondary border border-border-color rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-accent">Johnny</h1>
                    <p className="text-text-secondary mt-2">Your Personal AI Assistant</p>
                </div>
                <form onSubmit={handleLogin}>
                    <p className="text-text-secondary mb-4">Sign in via magic link with your email below</p>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            id="email"
                            className="w-full px-4 py-3 bg-primary border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            type="email"
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-6">
                        <button
                            className="w-full flex items-center justify-center px-4 py-3 bg-accent text-primary font-bold rounded-md hover:bg-blue-400 transition-colors duration-300 disabled:bg-gray-500"
                            disabled={loading}
                        >
                            {loading ? <Loader className="animate-spin" /> : 'Send Magic Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Chat Component ---
const ChatComponent = ({ user }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "System online. How may I assist you?", sender: 'johnny' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false); // To show a loading state
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '' || isLoading) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    user_id: user.id // Sending user_id for future use
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = { id: Date.now() + 1, text: data.reply, sender: 'johnny' };
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            console.error("Failed to send message:", error);
            const errorResponse = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to my brain. Please try again later.", sender: 'johnny' };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-secondary text-text-primary">
            {/* Header (no changes here) */}
            <header className="flex items-center justify-between p-4 border-b border-border-color bg-primary shadow-md">
                <div className="flex items-center gap-3">
                    <Code className="text-accent" size={24} />
                    <h1 className="text-xl font-bold text-accent">Johnny</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary hidden sm:block">{user.email}</span>
                    <button
                        onClick={handleSignOut}
                        className="p-2 rounded-md hover:bg-border-color transition-colors"
                        title="Sign Out"
                    >
                        <Power size={20} />
                    </button>
                </div>
            </header>

            {/* Message Area (no changes here) */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 my-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-1 rounded-full ${msg.sender === 'user' ? 'bg-accent order-2' : 'bg-gray-600 order-1'}`}>
                                {msg.sender === 'user' ? <User size={20} className="text-primary"/> : <Code size={20} className="text-accent" />}
                            </div>
                            <div className={`px-4 py-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-accent text-primary order-1' : 'bg-primary border border-border-color order-2'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 my-4 justify-start">
                            <div className="p-1 rounded-full bg-gray-600">
                                <Code size={20} className="text-accent" />
                            </div>
                            <div className="px-4 py-3 rounded-lg bg-primary border border-border-color">
                                <Loader className="animate-spin text-accent" size={20} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Form (no changes here) */}
            <footer className="p-4 md:p-6 border-t border-border-color bg-primary">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isLoading ? "Awaiting response..." : "Type your command..."}
                            className="flex-1 w-full px-4 py-3 bg-secondary border border-border-color rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                            disabled={isLoading}
                        />
                        <button type="submit" className="p-3 bg-accent text-primary rounded-md hover:bg-blue-400 transition-colors disabled:bg-gray-500" disabled={isLoading}>
                            <Send size={24} />
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
};

// --- Main App Component (no changes here) ---
function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
        {!session ? <AuthComponent /> : <ChatComponent key={session.user.id} user={session.user} />}
    </div>
  );
}

export default App;