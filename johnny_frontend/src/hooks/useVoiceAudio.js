import { useState, useCallback, useEffect, useRef } from 'react';

// Initialize SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = true; 
    recognition.lang = 'en-US';
    recognition.interimResults = false; 
}

export function useVoiceAudio({ onTranscriptReceived }) {
    const [conversationState, setConversationState] = useState('idle'); // idle, listening, processing, speaking
    const [analyser, setAnalyser] = useState(null);
    
    // Web Audio API refs
    const [audioContext, setAudioContext] = useState(null);
    const [analyserNode, setAnalyserNode] = useState(null);
    const [sourceNode, setSourceNode] = useState(null);

    // Keep latest ref to avoid infinite loops in dependency arrays
    const onTranscriptRef = useRef(onTranscriptReceived);
    useEffect(() => {
        onTranscriptRef.current = onTranscriptReceived;
    }, [onTranscriptReceived]);

    const startListening = useCallback(async () => {
        if (!recognition || conversationState === 'listening') return;

        try {
            let ctx = audioContext;
            let aNode = analyserNode;
            if (!ctx) {
                ctx = new window.AudioContext();
                aNode = ctx.createAnalyser();
                setAudioContext(ctx);
                setAnalyserNode(aNode);
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const sNode = ctx.createMediaStreamSource(stream);
            sNode.connect(aNode);
            setSourceNode(sNode);

            setAnalyser(aNode);
            setConversationState('listening');
            recognition.start();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access the microphone. Please check your browser's permissions.");
            setConversationState('idle');
        }
    }, [conversationState, audioContext, analyserNode]);

    const stopListening = useCallback(() => {
        if (!recognition || conversationState !== 'listening') return;

        if (sourceNode) {
            sourceNode.disconnect();
            sourceNode.mediaStream.getTracks().forEach(track => track.stop());
            setSourceNode(null);
        }

        setAnalyser(null);
        recognition.stop();
        setConversationState('idle');
    }, [conversationState, sourceNode]);

    const speak = useCallback((text, onEndCallback) => {
        window.speechSynthesis.cancel();
        stopListening();

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

    const interruptSpeaking = useCallback(() => {
        if (conversationState === 'speaking') {
            window.speechSynthesis.cancel();
            setConversationState('idle');
        }
    }, [conversationState]);

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
                if (onTranscriptRef.current) {
                    onTranscriptRef.current(finalTranscript.trim());
                }
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
    }, [conversationState, stopListening]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
            window.speechSynthesis.cancel();
        }
    }, [stopListening]);

    return {
        conversationState,
        setConversationState,
        analyser,
        startListening,
        stopListening,
        speak,
        interruptSpeaking
    };
}
