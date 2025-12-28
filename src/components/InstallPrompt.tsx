import { useState, useEffect } from 'react';
import './InstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DISMISSAL_PERIOD_DAYS = 7;

function shouldShowPrompt(): boolean {
  const dismissed = localStorage.getItem('installPromptDismissed');
  if (!dismissed) {
    return true;
  }
  
  const dismissedDate = new Date(dismissed);
  if (isNaN(dismissedDate.getTime())) {
    // Invalid date in localStorage, clear it and show prompt
    localStorage.removeItem('installPromptDismissed');
    return true;
  }
  
  const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / MS_PER_DAY;
  return daysSinceDismissed >= DISMISSAL_PERIOD_DAYS;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Check if user dismissed recently on initial render
  const [showPrompt, setShowPrompt] = useState(() => {
    return false; // Will be set to true when beforeinstallprompt fires
  });

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the custom install prompt only if not recently dismissed
      if (shouldShowPrompt()) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    
    // Clear the deferredPrompt for the next time
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed, don't show again for 7 days
    localStorage.setItem('installPromptDismissed', new Date().toISOString());
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <button 
          className="install-prompt-close" 
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          ×
        </button>
        
        <div className="install-prompt-icon">📱</div>
        
        <div className="install-prompt-text">
          <h3>Install SmartBudget</h3>
          <p>Add to your home screen for quick access and offline use</p>
        </div>
        
        <div className="install-prompt-actions">
          <button 
            className="install-prompt-button primary"
            onClick={handleInstallClick}
          >
            Install
          </button>
          <button 
            className="install-prompt-button secondary"
            onClick={handleDismiss}
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
