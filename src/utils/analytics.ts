// Declare gtag as a global function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = 'G-XY4H2C61EY';

let isInitialized = false;

// Initialize Google Analytics
export const initGA = () => {
  if (isInitialized) return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;

  script1.onload = () => {
    // Initialize the dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID);
    isInitialized = true;
  };

  document.head.appendChild(script1);
};

// Safe gtag wrapper
const safeGtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Track page views
export const pageview = (url: string) => {
  if (!isInitialized) return;
  safeGtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (!isInitialized) return;
  safeGtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Custom events for our app
export const trackEvents = {
  recordingCreated: () => {
    event({
      action: 'create_recording',
      category: 'Recording',
      label: 'New recording created',
    });
  },
  recordingShared: () => {
    event({
      action: 'share_recording',
      category: 'Recording',
      label: 'Recording shared',
    });
  },
  recordingPlayed: () => {
    event({
      action: 'play_recording',
      category: 'Recording',
      label: 'Recording played',
    });
  },
  profileViewed: () => {
    event({
      action: 'view_profile',
      category: 'Profile',
      label: 'Profile viewed',
    });
  },
  feedbackSubmitted: () => {
    event({
      action: 'submit_feedback',
      category: 'Feedback',
      label: 'Feedback submitted',
    });
  },
  userSignedIn: () => {
    event({
      action: 'user_signed_in',
      category: 'Auth',
      label: 'User signed in',
    });
  },
  userSignedOut: () => {
    event({
      action: 'user_signed_out',
      category: 'Auth',
      label: 'User signed out',
    });
  },
};
