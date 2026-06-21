import { useState, useCallback } from 'react';
import PatientOnboardingModal from '@/components/PatientOnboardingModal';

export function useProfileGuard() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const executeWithGuard = useCallback((action: () => void) => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem("sd_current_user_email");
      const isComplete = localStorage.getItem("sd_current_user_profile_complete");
      
      if (!email) {
        // Not logged in at all -> send to login
        const currentUrl = window.location.href;
        const authCenterBase = window.location.hostname === "localhost" 
          ? "http://localhost:3000" 
          : "/login";
        window.location.href = `${authCenterBase}?redirect_uri=${encodeURIComponent(currentUrl)}`;
        return;
      }

      if (isComplete !== "true") {
        // Logged in but profile incomplete -> show onboarding modal
        setPendingAction(() => action);
        setShowOnboarding(true);
        return;
      }

      // Already complete -> execute immediately
      action();
    }
  }, []);

  const handleOnboardingComplete = useCallback((data: any) => {
    // Save to local storage to mark as complete
    localStorage.setItem("sd_current_user_profile_complete", "true");
    
    // In a real app, you would also save data.phone, data.whatsapp, etc to Firestore here
    
    setShowOnboarding(false);
    
    // Execute the action they were trying to do!
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleOnboardingSkip = useCallback(() => {
    setShowOnboarding(false);
    setPendingAction(null); // They skipped, so we don't execute the action
  }, []);

  // Return the execute function, and the Modal component to be rendered in the host tree
  const ProfileGuardModal = () => (
    <PatientOnboardingModal 
      isOpen={showOnboarding}
      onComplete={handleOnboardingComplete}
      onSkip={handleOnboardingSkip}
    />
  );

  return { executeWithGuard, ProfileGuardModal };
}
