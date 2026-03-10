import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import CanvasBackground from './components/CanvasBackground';
import Auth from './components/Auth';
import Chat from './components/Chat';

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
            <div className="absolute top-0 left-0 w-full h-full text-text-primary z-10 flex flex-col">
                {!session ? <Auth /> : <Chat key={session.user.id} user={session.user} />}
            </div>
        </div>
    );
}

export default App;
