import { useCreatorProfile } from "@/contexts/CreatorProfileContext";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { isOnboarded } = useCreatorProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOnboarded) {
      navigate("/dashboard");
    }
  }, [isOnboarded, navigate]);

  if (isOnboarded) return null;

  return <OnboardingFlow />;
};

export default Index;
