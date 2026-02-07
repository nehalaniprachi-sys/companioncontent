import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CreatorProfile {
  niche: string;
  platform: string;
  experience: string;
  goal: string;
  displayName: string;
  aiProfile?: {
    archetype: string;
    strengths: string[];
    opportunities: string[];
    content_pillars: { name: string; description: string }[];
    platform_tips: string[];
  };
}

interface CreatorProfileContextType {
  profile: CreatorProfile | null;
  setProfile: (profile: CreatorProfile) => void;
  isOnboarded: boolean;
  clearProfile: () => void;
}

const CreatorProfileContext = createContext<CreatorProfileContextType | undefined>(undefined);

export function CreatorProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<CreatorProfile | null>(() => {
    const saved = localStorage.getItem("creator-profile");
    return saved ? JSON.parse(saved) : null;
  });

  const setProfile = (p: CreatorProfile) => {
    setProfileState(p);
    localStorage.setItem("creator-profile", JSON.stringify(p));
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem("creator-profile");
  };

  return (
    <CreatorProfileContext.Provider
      value={{ profile, setProfile, isOnboarded: !!profile, clearProfile }}
    >
      {children}
    </CreatorProfileContext.Provider>
  );
}

export function useCreatorProfile() {
  const ctx = useContext(CreatorProfileContext);
  if (!ctx) throw new Error("useCreatorProfile must be used within CreatorProfileProvider");
  return ctx;
}
