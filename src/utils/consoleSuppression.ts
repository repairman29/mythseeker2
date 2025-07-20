// Utility to suppress Cross-Origin-Opener-Policy warnings from Firebase Auth
export function suppressCOOPWarnings() {
  // Store original console.warn
  const originalWarn = console.warn;
  
  // Override console.warn to filter out COOP warnings
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suppress COOP-related warnings
    if (message.includes('Cross-Origin-Opener-Policy') || 
        message.includes('window.close call')) {
      return; // Don't log these warnings
    }
    
    // Log all other warnings normally
    originalWarn.apply(console, args);
  };
  
  // Return function to restore original console.warn
  return () => {
    console.warn = originalWarn;
  };
}

// Auto-suppress COOP warnings on import
suppressCOOPWarnings(); 