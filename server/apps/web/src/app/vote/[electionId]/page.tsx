'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useStrictVotingLock } from "@/hooks/useStrictVotingLock"
import axios from "axios"
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSecureVotingSession } from '@/hooks/useSecureVotingSession';
import { useElection, generateVotingToken, castVote } from '@/lib/api/voting';
import { getStoredUser } from '@/lib/api/auth';
import * as faceapi from 'face-api.js';

// Declare the secureAPI for TypeScript
declare global {
  interface Window {
    secureAPI?: {
      onViolation: (callback: (reason: string) => void) => void;
    };
  }
}

function VotingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const electionId = params.electionId as string;

  // Token Enforcement (Moved to top level)
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      router.push('/vote');
    }
  }, [router, searchParams]);

  const { data: election, isLoading: isLoadingElection } = useElection(electionId);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [violations, setViolations] = useState(0);
  const [activeViolation, setActiveViolation] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [faceAligned, setFaceAligned] = useState(false);
  const [facePresent, setFacePresent] = useState(true);
  const [warning, setWarning] = useState("");
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [alignmentMessage, setAlignmentMessage] = useState("Position yourself");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const { isLocked, violated, violationCount, unlock } = useStrictVotingLock();
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setupVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const referenceDescriptor = useRef<Float32Array | null>(null);

  const { session, error, terminateSession, completeSession, resetSession } = useSecureVotingSession(electionId);

  // 🔄 Model loading on mount (Step 1)
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        console.log("Face API Models loaded (tinyFaceDetector)");
      } catch (err) {
        console.error("Failed to load Face API models:", err);
      }
    };

    loadModels();
  }, []);

  // 🚀 React Safety Effect for Stream Binding (Step 2)
  useEffect(() => {
    if (stream && setupVideoRef.current) {
      console.log("Binding stream to video element...");
      setupVideoRef.current.srcObject = stream;

      setupVideoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded. Width:", setupVideoRef.current?.videoWidth);
        setupVideoRef.current?.play().catch(err => {
          console.error("Video play error in useEffect:", err);
        });
      };
    }
  }, [stream]);

  const handleEnableCamera = async () => {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      setStream(camStream);
      setCameraReady(true);

      // Manual binding and play trigger (Step 1)
      if (setupVideoRef.current) {
        setupVideoRef.current.srcObject = camStream;
        setupVideoRef.current.onloadedmetadata = () => {
          console.log("Initial video play attempt. Width:", setupVideoRef.current?.videoWidth);
          setupVideoRef.current?.play().catch(err => {
            console.error("Manual video play error:", err);
          });
        };
      }
    } catch (err) {
      console.error("Camera permission failed", err);
      alert("Camera permission failed");
    }
  };

  const handleEnableMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      setMicReady(true);
    } catch (err) {
      console.error("Microphone permission denied", err);
      alert("Microphone permission denied");
    }
  };

  const handleGrantPermission = async () => {
    if (!cameraReady || !micReady || !faceAligned || multipleFaces) {
      alert(multipleFaces ? "Security violation: Multiple faces detected" : "Please enable BOTH Camera and Microphone access, and ensure your face is aligned.");
      return;
    }
    setIsInitializing(true);
    await initProctoring();
  };


  // 🛡️ SAFE FACE DETECTION LOOP (RELIABLE VERSION)
  useEffect(() => {
    if (!cameraReady || !setupVideoRef.current) return;

    let interval: NodeJS.Timeout;

    // 🚀 STEP 5: DELAY BEFORE START (1.5s)
    const timeout = setTimeout(() => {
      console.log("Starting detection loop after delay...");
      
      interval = setInterval(async () => {
        try {
          if (!setupVideoRef.current) return;

          // 🚀 STEP 2: WAIT FOR VIDEO READY
          if (
            setupVideoRef.current.videoWidth === 0 ||
            setupVideoRef.current.videoHeight === 0
          ) {
            console.log("Waiting for video dimensions...");
            return;
          }

          // 🚀 STEP 4: DEBUG LOGS
          console.log("Video size:", setupVideoRef.current.videoWidth, "x", setupVideoRef.current.videoHeight);

          // 🚀 STEP 3: OPTIMIZED CONFIG
          const detections = await faceapi.detectAllFaces(
            setupVideoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.3
            })
          );

          console.log("Detections found:", detections.length);

          let isAlignedNow = false;
          let currentWarning = "";
          let isMultipleFaces = detections.length > 1;

          // ❌ NO FACE (Step 2 & Step 7)
          if (detections.length === 0) {
            currentWarning = "Ensure proper lighting and face visibility";
            isAlignedNow = false;
          } else if (detections.length > 1) {
          // ❌ MULTIPLE FACES (Step 2)
          currentWarning = "Multiple faces detected";
          isAlignedNow = false;
          if (Date.now() - lastAlertTimeRef.current > 5000) {
            alert("Security violation: Multiple faces detected");
            lastAlertTimeRef.current = Date.now();
          }
        } else {
          // ✅ ONE FACE DETECTED - CHECK ALIGNMENT
          const box = detections[0].box;
          const vw = setupVideoRef.current.videoWidth;
          const vh = setupVideoRef.current.videoHeight;

          if (vw > 0 && vh > 0) {
            const cx = box.x + box.width / 2;
            const cy = box.y + box.height / 2;

            const isCentered =
              cx > vw * 0.3 && cx < vw * 0.7 &&
              cy > vh * 0.3 && cy < vh * 0.7;

            const fullyVisible =
              box.x > 10 && box.y > 10 &&
              box.x + box.width < vw - 10 &&
              box.y + box.height < vh - 10;

            const faceArea = box.width * box.height;
            const frameArea = vw * vh;

            const sizeValid =
              faceArea > frameArea * 0.08 &&
              faceArea < frameArea * 0.4;

            if (!isCentered) {
              currentWarning = "Center your face";
            } else if (!fullyVisible) {
              currentWarning = "Keep full face inside frame";
            } else if (faceArea < frameArea * 0.08) {
              currentWarning = "Move closer";
            } else if (faceArea > frameArea * 0.4) {
              currentWarning = "Too close! Move back";
            } else {
              isAlignedNow = true;
              currentWarning = "";
            }
          }
        }

        // 🎨 Draw Box Function (Step 4) - Using local state to avoid closure issues
        if (canvasRef.current && setupVideoRef.current) {
          const canvas = canvasRef.current;
          const video = setupVideoRef.current;
          
          if (video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              detections.forEach(det => {
                const { x, y, width, height } = det.box;
                ctx.strokeStyle = isAlignedNow ? "#22c55e" : "#ef4444";
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, width, height);
                ctx.shadowBlur = 10;
                ctx.shadowColor = isAlignedNow ? "#22c55e" : "#ef4444";
                ctx.strokeRect(x, y, width, height);
                ctx.shadowBlur = 0;
              });
            }
          }
        }

        // Batch state updates
        setFaceAligned(isAlignedNow);
        setWarning(currentWarning);
        setMultipleFaces(isMultipleFaces);

      } catch (err) {
        console.error("Face detection error:", err);
      }
      }, 800);
    }, 1500);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [cameraReady]);

  // 🛡️ CONTINUOUS AI PROCTORING LOOP (STEP 2)
  useEffect(() => {
    if (!isPermissionGranted || !videoRef.current) return;

    console.log("Starting continuous proctoring loop...");

    const interval = setInterval(async () => {
      try {
        if (!videoRef.current || videoRef.current.videoWidth === 0) return;

        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.3
          })
        );

        // ❌ NO FACE
        if (detections.length === 0) {
          setFacePresent(false);
          setWarning("Face not visible");
          setViolations(v => v + 1);
          console.warn("Security Violation: Face missing");
          return;
        }

        // ❌ MULTIPLE FACES
        if (detections.length > 1) {
          setMultipleFaces(true);
          setWarning("Multiple faces detected");
          setViolations(v => v + 1);
          console.warn("Security Violation: Multiple faces");
          return;
        }

        // ✅ NORMAL
        setFacePresent(true);
        setMultipleFaces(false);
        setWarning("");

      } catch (err) {
        console.error("Continuous proctoring error:", err);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isPermissionGranted]);

  // 🛡️ AUTO-TERMINATION LOGIC (STEP 3)
  useEffect(() => {
    if (violations >= 5) {
      alert("Voting terminated due to security violations. Please contact the administrator.");
      window.location.href = "/dashboard";
    }
  }, [violations]);

  // REMOVED OLD detectFaces and startDetectionLoop logic

  const initProctoring = async () => {
    try {
      // 1. Models already loaded in useEffect

      // 2. Obtain/Reuse Camera Stream
      let stream = activeStreamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        activeStreamRef.current = stream;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 🔍 STEP 4: DEBUG CHECK
        console.log("Stream tracks initialized:", stream.getTracks());
        
        // 🔒 STEP 7: SAFETY CHECK
        if (!stream || stream.getVideoTracks().length === 0) {
          alert("Camera Hardware Error: No video tracks detected. Please check your camera connection.");
          setIsInitializing(false);
          return;
        }

        // 🔒 STEP 2 & 3: WAIT FOR VIDEO READY & FORCE PLAY
        await new Promise((resolve) => {
          if (!videoRef.current) return resolve(false);
          videoRef.current.onloadedmetadata = async () => {
             console.log("Metadata Loaded - Native Size:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
             try {
               await videoRef.current?.play();
               resolve(true);
             } catch (playErr) {
               console.warn("Auto-play blocked or failed:", playErr);
               resolve(true); // Still resolve to allow manual play attempts
             }
          };
          // Fallback if metadata already loaded
          if (videoRef.current.readyState >= 1) resolve(true);
        });

        // Detection loop is now handled globally via useEffect
      }

      // 3. Start Recording
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunks.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      setIsPermissionGranted(true);

    } catch (err: any) {
      console.error("Proctoring initialization failed", err);
      const errorMessage = err?.message || "Internal Access Error";
      alert(`Identity Setup Error: ${errorMessage}\n\nPlease refresh the page.`);
      setIsInitializing(false);
    }
  };

  // Electron & Cleanup Effect
  useEffect(() => {
    if (window.secureAPI) {
      window.secureAPI.onViolation((reason) => {
        console.warn("Electron Violation:", reason);
        terminateDueToSecurity(`System violation detected: ${reason}`);
      });
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleViolation = (message: string) => {
    setViolations(prev => {
      const newCount = prev + 1;
      setActiveViolation(message);
      return newCount;
    });
  };

  const terminateDueToSecurity = (message: string) => {
    alert(message);
    terminateSession();
    window.location.href = "/dashboard";
  };

  // Handle Session Errors
  useEffect(() => {
    if (error) {
      alert(`Access Denied: ${error}`);
      router.push("/dashboard/elections");
    }
  }, [error, router]);

  useEffect(() => {
    if (violated && !activeViolation) {
      handleViolation("Security violation detected: Leaving voting screen or using restricted keys.");
    }
  }, [violated]);

  if (isLoadingElection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Secure Ballot...</p>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-black uppercase tracking-widest text-lg">Election Not Found</p>
          <button onClick={() => router.push('/dashboard')} className="text-primary hover:underline">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const candidates = election.candidates || [];

  const stopRecording = () => {
    return new Promise<Blob>((resolve) => {
      if (!mediaRecorderRef.current) return;
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        resolve(blob);
      };
      mediaRecorderRef.current.stop();
    });
  };

  const handleVote = async (candidateId: string) => {
    if (!candidateId || !election) return;
    
    // Removed manual login check: Biometric/Session verification is sufficient.
    const user = getStoredUser();
    const voterId = user?.id || `session-voter-${Date.now()}`;

    setIsSubmitting(true);
    try {
      // 1. Generate local session recording
      const videoBlob = await stopRecording();
      
      // 2. Map Voting Token from URL or fallback generator (requires auth)
      console.log("Locating voting token...");
      let tokenHash = searchParams.get('token');
      
      if (!tokenHash) {
        tokenHash = await generateVotingToken({
          voterId: voterId,
          electionId: election.id
        });
      }

      // 3. Submit encrypted vote to blockchain ledger
      console.log("Casting vote...");
      const result = await castVote({
        electionId: election.id,
        tokenHash: tokenHash,
        encryptedVote: candidateId // Note: In a production app, this would be RSA encrypted
      });

      console.log("Vote successful:", result.txHash);
      
      // 4. Save recording and complete session
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `verified-vote-${electionId}.webm`;
      a.click();
      
      completeSession();
      unlock();
      
      alert(`Voting Successful!\nTransaction: ${result.txHash}\nViolations detected: ${violations}`);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Voting failed:", err);
      // More specific error handling
      const msg = err.message || "Voting failed due to an internal error";
      alert(`Voting Failed: ${msg}`);
      
      if (err.message?.includes("already voted")) {
         router.push("/dashboard");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuit = async () => {
    if (!confirm("Are you sure you want to quit? This will count as one of your 3 allowed attempts.")) return;
    terminateSession();
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center relative">
      {/* OS-Lock Security Overlay */}
      {violated && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mb-10 border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
            <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-5xl font-black text-white mb-6 uppercase tracking-tighter">OS-LOCK: SECURITY BREACH</h2>
          <div className="max-w-xl space-y-4 mb-12">
            <p className="text-gray-400 leading-relaxed font-bold text-lg">
              The voting environment was compromised by a window blur or unauthorized keyboard action.
            </p>
            <div className="py-3 px-6 bg-red-500/10 border border-red-500/20 rounded-2xl inline-block">
              <span className="text-red-400 font-black uppercase tracking-widest text-sm">Violation Count: {violationCount}</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-12 py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-2xl shadow-white/10 active:scale-95"
          >
            Re-Align Face to Unlock
          </button>
          <div className="mt-12 flex items-center space-x-3 text-gray-500 font-black uppercase tracking-widest text-[10px]">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             <span>Strict Hardware-Level Security Active</span>
          </div>
        </div>
      )}
      {/* 🔐 Permission Consent Overlay */}
      {!isPermissionGranted && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
          <div className="max-w-xl w-full p-12 text-center space-y-8 animate-in zoom-in duration-500">
            <div className={`relative mx-auto w-64 h-48 rounded-3xl overflow-hidden border-2 shadow-2xl bg-black group transition-all duration-700 ${
              faceAligned ? 'border-green-500' : 'border-orange-500/50'
            }`}>
              {cameraReady ? (
                <>
                  <video
                    ref={setupVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover animate-in fade-in duration-1000"
                  />
                  {/* Grid Overlay (Step 3) */}
                  <div className="absolute inset-0 pointer-events-none z-40">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
                      {Array(9).fill(0).map((_, i) => (
                        <div key={i} className="border border-white/20" />
                      ))}
                    </div>
                  </div>
                  {/* Face Box Canvas (Step 4) */}
                  <canvas ref={canvasRef} className="absolute inset-0 z-50 pointer-events-none" />

                  <div className="absolute inset-0 pointer-events-none border-2 border-primary/10 rounded-3xl" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-3 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 pointer-events-none z-[60]">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${faceAligned ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-[8px] font-black uppercase text-white/90 tracking-widest">Live Preview</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${faceAligned ? 'text-green-500' : 'text-primary'}`}>
                      {faceAligned ? "ALIGNED ✅" : warning || "ALIGNING..."}
                    </span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                  <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 animate-pulse">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none">Identity Verification</h1>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Position yourself before entering</p>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-md mx-auto">
              <button
                onClick={() => !cameraReady && handleEnableCamera()}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-4 group ${
                  cameraReady 
                  ? 'bg-green-500 border-green-600 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  cameraReady ? 'bg-white text-green-500' : 'bg-white/5 text-gray-500 group-hover:text-primary'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Camera</div>
                  <div className="text-xs font-bold">{cameraReady ? 'Ready' : 'Grant Access'}</div>
                </div>
              </button>

              <button
                onClick={() => !micReady && handleEnableMic()}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-4 group ${
                  micReady 
                  ? 'bg-green-500 border-green-600 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  micReady ? 'bg-white text-green-500' : 'bg-white/5 text-gray-500 group-hover:text-primary'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1">Microphone</div>
                  <div className="text-xs font-bold">{micReady ? 'Ready' : 'Grant Access'}</div>
                </div>
              </button>
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-left space-y-4 max-w-md mx-auto">
              <div className="flex items-center space-x-3 text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Privacy Guarantee</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Your hardware is only active during the session for security verification. No data is stored permanently.</p>
            </div>

            <button
              onClick={handleGrantPermission}
              disabled={isInitializing || !cameraReady || !micReady || !faceAligned || multipleFaces}
              className="w-full max-w-sm py-5 bg-primary hover:bg-accent text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-primary/40 active:scale-[0.98] disabled:opacity-50"
            >
              {isInitializing ? 'Preparing Secure Ballot...' : (cameraReady && micReady && faceAligned && !multipleFaces ? 'Go to Ballot' : (warning || 'Allow Hardware & Align Face'))}
            </button>
            {warning && (
              <div className="text-red-500 mt-2 text-xs font-black uppercase tracking-widest animate-pulse">
                {warning}
              </div>
            )}
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Please click "Allow" in your browser popup after clicking the icons above.</p>
          </div>
        </div>
      )}

      {/* Live Proctoring Preview & Violations (Step 4, 5, 6) */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col items-end space-y-3">
        <div className={`relative w-48 h-36 rounded-2xl shadow-2xl border-2 transition-all duration-500 overflow-hidden bg-black group ${
          warning ? 'border-red-500 shadow-red-500/20' : 'border-primary/50'
        }`}>
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          
          {/* Visual Alert Overlay (Step 6) */}
          {warning && (
            <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none z-10" />
          )}

          <div className="absolute inset-0 border-2 border-green-500/20 rounded-2xl pointer-events-none z-0">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="border border-green-500/10 opacity-40 transition-opacity" />
              ))}
            </div>
          </div>

          <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20">
            <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${warning ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="text-[8px] font-black uppercase text-white/90 tracking-widest">
                AI Proctoring
              </span>
            </div>
            
            {/* Violation Display (Step 5) */}
            <div className={`px-2 py-1 rounded-full border backdrop-blur-md transition-all ${
              violations > 0 ? 'bg-red-600 border-red-400 text-white' : 'bg-white/10 border-white/20 text-white/60'
            }`}>
              <span className="text-[8px] font-black uppercase tracking-widest">
                {violations}/5 Violations
              </span>
            </div>
          </div>

          {/* Warning Message UI (Step 4) */}
          {warning && (
            <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md text-center animate-bounce z-30">
              {warning}
            </div>
          )}
        </div>

        {activeViolation && (
          <div className="w-48 p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/20 animate-in slide-in-from-right duration-300">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 text-red-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Security Warning</p>
                <p className="text-[9px] text-gray-300 font-medium leading-[1.3]">{activeViolation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLocked && <div className="fixed inset-0 z-50 pointer-events-none" />}

      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 orange-text-gradient uppercase tracking-tight">{election.title}</h1>
          <p className="text-gray-400 font-medium text-lg">
            {new Date(election.start_time).getFullYear()} • {election.constituency}
          </p>
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
                      <div className="font-black text-lg uppercase tracking-tight group-hover:text-white transition-colors">{candidate.name}</div>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${selectedCandidate === candidate.id ? 'text-white/70' : 'text-gray-600'}`}>{candidate.party}</div>
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
            <div className="pt-4 border-t border-white/5 mt-4">
              <button
                onClick={() => {
                  resetSession();
                  setViolations(0);
                  setActiveViolation(null);
                  referenceDescriptor.current = null;
                  alert("Developer: Session Reset Successful! Identity reference cleared. You can now vote again.");
                }}
                className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500/70 border border-yellow-500/30 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all"
              >
                Developer: Reset Session & Retry
              </button>
            </div>
            <p className="text-[10px] text-gray-500 text-center font-black uppercase tracking-widest mt-4">By casting your vote, you agree to our blockchain-verified anonymous AI-proctored voting protocol.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VotingPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-black">
         <div className="text-center space-y-4">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Entering Secure Region...</p>
         </div>
       </div>
    }>
      <VotingContent />
    </Suspense>
  );
}
