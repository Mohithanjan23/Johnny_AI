import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { User, Power, Code } from 'react-feather';
import CanvasBackground from './components/CanvasBackground';
import PulsingMic from './components/PulsingMic';

// --- Web Audio API and Speech Recognition Setup ---
// These are initialized lazily on user interaction to comply with browser policies.
let audioContext;
let analyserNode;
let sourceNode;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = true; // Allows for continuous conversation flow
    recognition.lang = 'en-US';
    recognition.interimResults = false; // We only care about the final transcript
}

// --- Authentication Component ---
// Handles the user login interface.
const AuthComponent = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: window.location.origin
                }
            });
            if (error) throw error;
            alert('Check your email for the magic login link!');
        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col justify-center items-center text-text-primary p-4 z-10">
            <div className="w-full max-w-md bg-secondary/80 backdrop-blur-md border border-border-color rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-accent">Johnny</h1>
                    <p className="text-text-secondary mt-2">Your Personal AI Assistant</p>
                </div>
                <form onSubmit={handleLogin}>
                    <p className="text-text-secondary mb-4">Sign in or create an account via magic link</p>
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
                            {loading ? 'Sending link...' : 'Send Magic Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Chat Component ---
// This is the core interface after the user logs in.
const ChatComponent = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [conversationState, setConversationState] = useState('idle'); // States: idle, listening, processing, speaking
    const [analyser, setAnalyser] = useState(null); // To pass the analyser to the mic component
    const messagesEndRef = useRef(null);

    const startListening = useCallback(async () => {
        if (!recognition || conversationState === 'listening') return;

        try {
            if (!audioContext) {
                audioContext = new AudioContext();
                analyserNode = audioContext.createAnalyser();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            sourceNode = audioContext.createMediaStreamSource(stream);
            sourceNode.connect(analyserNode);

            setAnalyser(analyserNode);
            setConversationState('listening');
            recognition.start();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access the microphone. Please grant permission in your browser's settings and refresh the page.");
            setConversationState('idle');
        }
    }, [conversationState]);

    // Function to stop speech recognition
    const stopListening = useCallback(() => {
        if (!recognition || conversationState !== 'listening') return;

        if (sourceNode) {
            sourceNode.disconnect();
            sourceNode.mediaStream.getTracks().forEach(track => track.stop());
            sourceNode = null;
        }

        setAnalyser(null);
        recognition.stop();
        setConversationState('idle');
    }, [conversationState]);

    // Function to speak text using the browser's TTS engine
    const speak = useCallback((text, onEndCallback) => {
        window.speechSynthesis.cancel();
        stopListening(); // Ensure microphone is off when AI speaks

        setConversationState('speaking');
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onend = () => {
            if (onEndCallback) {
                onEndCallback();
            } else {
                startListening();
            }
        };

        window.speechSynthesis.speak(utterance);
    }, [startListening, stopListening]);

    // Automatically scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // Function to sign the user out
    const handleSignOut = async () => {
        stopListening();
        window.speechSynthesis.cancel();
        await supabase.auth.signOut();
    };

    // Function to send a transcript to the backend API
    const processTranscript = useCallback(async (transcript) => {
        if (!transcript || conversationState === 'processing') return;

        setConversationState('processing');
        const userMessage = { id: Date.now(), text: transcript, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch('https://johnny-backend.vercel.app/api/v1/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: transcript, user_id: user.id })
            });

            if (!response.ok) throw new Error('Network response was not ok.');

            const data = await response.json();
            const aiResponse = { id: Date.now() + 1, text: data.reply, sender: 'johnny' };
            setMessages(prev => [...prev, aiResponse]);
            speak(data.reply);

        } catch (error) {
            console.error('API Error:', error);
            const errorMsg = "I seem to be having trouble connecting. Please ensure the backend server is running.";
            setMessages(prev => [...prev, { id: Date.now() + 1, text: errorMsg, sender: 'johnny' }]);
            speak(errorMsg, () => setConversationState('idle')); // Go to idle state after error
        }
    }, [conversationState, speak]);


    // Setup recognition event handlers once on component mount
    useEffect(() => {
        if (!recognition) return;

        const handleResult = (event) => {
            if (conversationState === 'speaking') {
                window.speechSynthesis.cancel();
            }

            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                stopListening();
                processTranscript(finalTranscript.trim());
            }
        };

        const handleEnd = () => {
            if (conversationState === 'listening') {
                stopListening();
            }
        };

        recognition.addEventListener('result', handleResult);
        recognition.addEventListener('end', handleEnd);

        return () => {
            recognition.removeEventListener('result', handleResult);
            recognition.removeEventListener('end', handleEnd);
        };
    }, [conversationState, processTranscript, stopListening]);

    // Handle clicks on the microphone orb
    const handleMicClick = () => {
        if (conversationState === 'listening') {
            stopListening();
        } else if (['idle', 'speaking'].includes(conversationState)) {
            window.speechSynthesis.cancel();
            startListening();
        }
    };

    // Speak the initial greeting message when the component mounts
    useEffect(() => {
        const initialGreeting = "System online. I am ready when you are.";
        setMessages([{ id: 1, text: initialGreeting, sender: 'johnny' }]);
        speak(initialGreeting, () => setConversationState('idle'));

        // Cleanup function to stop everything when the component unmounts (e.g., on logout)
        return () => {
            stopListening();
            window.speechSynthesis.cancel();
        }
    }, [speak, stopListening]);

    return (
        <div className="h-screen w-screen flex flex-col bg-transparent text-text-primary">
            <header className="flex items-center justify-between p-4 border-b border-border-color bg-primary/70 backdrop-blur-sm shadow-md z-10">
                <div className="flex items-center gap-3">
                    <Code className="text-accent" size={24} />
                    <h1 className="text-xl font-bold text-accent">Johnny</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary hidden sm:block">{user.email}</span>
                    <button onClick={handleSignOut} className="p-2 rounded-md hover:bg-border-color" title="Sign Out">
                        <Power size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10">
                <div className="max-w-4xl mx-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 my-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-1 rounded-full ${msg.sender === 'user' ? 'bg-accent order-2' : 'bg-gray-600 order-1'}`}>
                                {msg.sender === 'user' ? <User size={20} className="text-primary" /> : <Code size={20} className="text-accent" />}
                            </div>
                            <div className={`px-4 py-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-accent text-primary order-1' : 'bg-primary/80 backdrop-blur-sm border border-border-color order-2'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="p-4 md:p-6 z-10 flex justify-center items-center">
                <PulsingMic
                    state={conversationState}
                    onClick={handleMicClick}
                    analyserNode={analyser}
                />
            </footer>
        </div>
    );
};

// --- Main App Component ---
// This is the root component that handles session state and renders either the Auth or Chat component.
function App() {
    const [session, setSession] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsAuthReady(true);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Show a loading indicator until the session is checked to prevent UI flashing.
    if (!isAuthReady) {
        return (
            <div className="w-screen h-screen bg-primary flex justify-center items-center text-accent">
                <p className="text-2xl">Initializing Systems...</p>
            </div>
        );
    }

    return (
        <div className="relative w-screen h-screen">
            <CanvasBackground />
            <div className="absolute top-0 left-0 w-full h-full">
                {!session ? <AuthComponent /> : <ChatComponent key={session.user.id} user={session.user} />}
            </div>
        </div>
    );
}

export default App;

