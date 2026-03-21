'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStrictVotingLock } from "@/hooks/useStrictVotingLock"
import axios from "axios"
import { useParams, useRouter } from 'next/navigation';
import { useSecureVotingSession } from '@/hooks/useSecureVotingSession';

// Declare the secureAPI for TypeScript
declare global {
  interface Window {
    secureAPI?: {
      onViolation: (callback: (reason: string) => void) => void;
    };
  }
}

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLocked, violated, unlock } = useStrictVotingLock();
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const electionId = params.electionId as string;
  const { session, error, terminateSession, completeSession } = useSecureVotingSession(electionId);

  // Mock voter ID for demo
  const voterId = "db7a4175-91fb-40d2-97ab-afaa1febdcdc";

  // 🛡️ Electron & Camera Integration
  useEffect(() => {
    // 1. Electron Isolation Check
    if (window.secureAPI) {
      window.secureAPI.onViolation((reason) => {
        console.warn("Electron Violation:", reason);
        alert(`Security violation detected: ${reason}. Voting terminated.`);
        window.location.href = "/dashboard";
      });
    }

    // 2. Camera Proctoring & Recording
    const startCameraAndRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const mediaRecorder = new MediaRecorder(stream);
        recordedChunks.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
          }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        console.log("Proctoring recording started");
      } catch (err) {
        console.error("Camera access denied", err);
        alert("Camera and Microphone access are required for secure voting. Please enable them to proceed.");
        window.location.href = "/dashboard";
      }
    };

    startCameraAndRecording();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Handle Session Errors
  useEffect(() => {
    if (error) {
      alert(`Access Denied: ${error}`);
      router.push("/dashboard/elections");
    }
  }, [error, router]);

  useEffect(() => {
    if (violated) {
      alert("Voting session terminated due to security violation");
      
      // [MOCK] 1 & 2: Simulate backend processing for demonstration
      console.log("Mock: Violation reported", {
        reason: "tab_switch_or_escape",
        election_id: params.electionId
      });

      window.location.href = "/dashboard";
    }
  }, [violated, params.electionId]);

  const candidates = [
    { id: '1', name: 'Arvind Sharma', party: 'Independent' },
    { id: '2', name: 'Priya Verma', party: 'Socialist Party' },
    { id: '3', name: 'Rahul Gupta', party: 'National Party' },
    { id: '4', name: 'Sneha Reddy', party: 'Regional Front' },
  ];

  const stopRecording = () => {
    return new Promise<Blob>((resolve) => {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: "video/webm"
        });
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  };

  const handleVote = async (candidateId: string) => {
    if (!candidateId) return;
    setIsSubmitting(true);
    try {
      // [MOCK] 1 & 2: Simulate backend processing for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Mock: Vote successfully recorded for candidate", candidateId);

      // 3. Stop Proctoring Recording
      const videoBlob = await stopRecording();
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voting-session-${params.electionId}.webm`;
      a.click();

      // 4. Complete session locally
      completeSession();

      // 5. Unlock system
      unlock()

      // 6. Show confirmation and redirect
      alert("Voting Successful! Your session recording has been downloaded.");
      router.push("/dashboard");

    } catch (error) {
      console.error(error)
      alert("Voting failed")
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuit = async () => {
    if (!confirm("Are you sure you want to quit? This will count as one of your 3 allowed attempts.")) return;
    
    // Terminate session locally
    terminateSession();
    
    alert("Session terminated. You must re-verify to try again.");
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="fixed top-4 right-4 w-40 h-32 rounded-lg shadow-2xl z-[60] border-2 border-primary/50 object-cover"
      />
      {isLocked && (
        <div className="fixed inset-0 z-50 pointer-events-none" />
      )}
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 orange-text-gradient uppercase tracking-tight">Digital Ballot</h1>
          <p className="text-gray-400 font-medium text-lg">General Assembly 2024 • South Delhi</p>
        </header>

        <div className="glass-card p-8 md:p-12 border-white/5 space-y-8 shadow-2xl shadow-primary/5">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Select Candidate</h3>
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between group ${
                    selectedCandidate === candidate.id
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20'
                    : 'bg-secondary/50 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border transition-all ${
                      selectedCandidate === candidate.id 
                      ? 'bg-white text-primary border-transparent' 
                      : 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20'
                    }`}>
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-lg uppercase tracking-tight group-hover:text-white transition-colors">
                        {candidate.name}
                      </div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${
                        selectedCandidate === candidate.id ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {candidate.party}
                      </div>
                    </div>
                  </div>
                  {selectedCandidate === candidate.id && (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 space-y-4">
            <button
              onClick={() => selectedCandidate && handleVote(selectedCandidate)}
              disabled={!selectedCandidate || isSubmitting}
              className="w-full py-5 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Securing Vote on Blockchain...' : 'Cast Anonymous Vote'}
            </button>
            <button
              onClick={handleQuit}
              className="w-full py-4 glass-card border-white/10 text-gray-500 hover:text-red-500 font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              Quit Voting
            </button>
            <p className="text-[10px] text-gray-500 text-center font-black uppercase tracking-widest">
              By casting your vote, you agree to our blockchain-verified anonymous voting protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
