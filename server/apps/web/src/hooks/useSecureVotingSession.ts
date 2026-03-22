import { useState, useEffect, useCallback } from "react";
import { getDeviceId } from "@/utils/deviceId";

export type SessionStatus = "ACTIVE" | "TERMINATED" | "COMPLETED" | "BLOCKED";

export interface VotingSession {
  deviceId: string;
  attemptCount: number;
  status: SessionStatus;
  lastUpdated: string;
}

export const useSecureVotingSession = (electionId: string) => {
  const [session, setSession] = useState<VotingSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSessionKey = (id: string) => `voter_session_${id}`;

  const loadSession = useCallback(() => {
    const key = getSessionKey(electionId);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as VotingSession;
    }
    return null;
  }, [electionId]);

  const saveSession = useCallback((newSession: VotingSession) => {
    const key = getSessionKey(electionId);
    localStorage.setItem(key, JSON.stringify(newSession));
    setSession(newSession);
  }, [electionId]);

  const startSession = useCallback(() => {
    const deviceId = getDeviceId();
    const existing = loadSession();

    if (existing) {
      if (existing.status === "COMPLETED") {
        setError("VOTING_ALREADY_COMPLETED");
        return;
      }

      if (existing.status === "BLOCKED" || existing.attemptCount >= 3) {
        setError("MAX_ATTEMPTS_EXCEEDED");
        return;
      }

      if (existing.deviceId !== deviceId) {
        setError("DEVICE_MISMATCH");
        return;
      }

      const updated: VotingSession = {
        ...existing,
        status: "ACTIVE",
        lastUpdated: new Date().toISOString(),
      };
      saveSession(updated);
    } else {
      const newSession: VotingSession = {
        deviceId,
        attemptCount: 0,
        status: "ACTIVE",
        lastUpdated: new Date().toISOString(),
      };
      saveSession(newSession);
    }
  }, [loadSession, saveSession]);

  const terminateSession = useCallback(() => {
    const existing = loadSession();
    if (!existing) return;

    const newAttemptCount = existing.attemptCount + 1;
    const newStatus = newAttemptCount >= 3 ? "BLOCKED" : "TERMINATED";

    const updated: VotingSession = {
      ...existing,
      attemptCount: newAttemptCount,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    };
    saveSession(updated);
  }, [loadSession, saveSession]);

  const completeSession = useCallback(() => {
    const existing = loadSession();
    if (!existing) return;

    const updated: VotingSession = {
      ...existing,
      status: "COMPLETED",
      lastUpdated: new Date().toISOString(),
    };
    saveSession(updated);
  }, [loadSession, saveSession]);

  const resetSession = useCallback(() => {
    const key = getSessionKey(electionId);
    localStorage.removeItem(key);
    setSession(null);
    setError(null);
    // Re-initialize directly
    const deviceId = getDeviceId();
    const newSession: VotingSession = {
      deviceId,
      attemptCount: 0,
      status: "ACTIVE",
      lastUpdated: new Date().toISOString(),
    };
    saveSession(newSession);
  }, [electionId, saveSession]);

  useEffect(() => {
    if (electionId) {
      startSession();
    }
  }, [electionId, startSession]);

  return { session, error, terminateSession, completeSession, resetSession };
};
