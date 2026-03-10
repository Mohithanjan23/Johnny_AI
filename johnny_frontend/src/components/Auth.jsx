import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
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
        <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-4 z-10">
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
}
