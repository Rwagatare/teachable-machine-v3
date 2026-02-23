// PWA utilities for install prompts and app-like functionality

class PWAUtils {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.isInstalled = false;
    this.offlineIndicator = null;
    this.isDevelopment = this.checkDevelopmentMode();
    
    this.init();
    this.setupOfflineDetection();
  }
  
  checkDevelopmentMode() {
    return location.hostname === 'localhost' || 
           location.hostname === '127.0.0.1' || 
           location.hostname.includes('192.168') ||
           location.hostname.includes('10.');
  }
  
  init() {
    // In development mode with SSL issues, we might not get PWA events
    if (this.isDevelopment) {
      console.log('🔧 PWA Utils: Development mode detected');
    }
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('PWA install prompt available');
      // Prevent the mini-infobar from appearing
      event.preventDefault();
      // Save the event for later use
      this.deferredPrompt = event;
      // Show install button/banner
      this.showInstallOption();
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.isInstalled = true;
      this.hideInstallOption();
      // Clear the deferredPrompt
      this.deferredPrompt = null;
    });
    
    // Check if already installed
    this.checkIfInstalled();
    
    // Add install button to the page (but maybe hide it in development)
    this.createInstallButton();
    
    // In development, show a helpful message about PWA features
    if (this.isDevelopment) {
      setTimeout(() => {
        console.log('💡 PWA Features in Development:');
        console.log('   - Install prompts may not work with self-signed certificates');
        console.log('   - Service worker may fail due to SSL issues');
        console.log('   - This is normal for development - features will work in production');
      }, 2000);
    }
  }
  
  checkIfInstalled() {
    // Check if app is installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('App is running in standalone mode');
    }
    
    // Check for iOS Safari installed
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('App is installed on iOS');
    }
  }
  
  createInstallButton() {
    // Only create install button if not already installed
    if (this.isInstalled) {
      return;
    }
    
    // Create install button
    this.installButton = document.createElement('button');
    this.installButton.className = 'pwa-install-button';
    this.installButton.innerHTML = `
      <span class="install-icon">📱</span>
      <span class="install-text">Install App</span>
    `;
    this.installButton.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #1b73e8;
      color: white;
      border: none;
      border-radius: 25px;
      padding: 12px 20px;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(27, 115, 232, 0.3);
      transition: all 0.3s ease;
      transform: translateX(200px);
      opacity: 0;
      display: block;
      max-width: 120px;
      text-align: center;
    `;
    
    // Add responsive positioning for mobile
    const updateButtonPosition = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // On mobile, position at bottom to avoid camera area
        this.installButton.style.top = 'auto';
        this.installButton.style.bottom = '80px';
        this.installButton.style.right = '10px';
        this.installButton.style.left = 'auto';
        this.installButton.style.transform = this.installButton.style.opacity === '1' ? 'translateY(0)' : 'translateY(100px)';
        this.installButton.style.maxWidth = '100px';
        this.installButton.style.padding = '10px 16px';
        this.installButton.style.fontSize = '12px';
      }else {
        // On desktop, position at top-right
        this.installButton.style.top = '10px';
        this.installButton.style.bottom = 'auto';
        this.installButton.style.right = '10px';
        this.installButton.style.left = 'auto';
        this.installButton.style.transform = this.installButton.style.opacity === '1' ? 'translateX(0)' : 'translateX(200px)';
        this.installButton.style.maxWidth = '120px';
        this.installButton.style.padding = '12px 20px';
        this.installButton.style.fontSize = '14px';
      }
    };
    
    // Set initial position
    updateButtonPosition();
    
    // Update position on window resize
    window.addEventListener('resize', updateButtonPosition);
    
    // Add hover effects
    this.installButton.addEventListener('mouseenter', () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        this.installButton.style.transform = 'translateY(0) scale(1.05)';
      }else {
        this.installButton.style.transform = 'translateX(0) scale(1.05)';
      }
      this.installButton.style.boxShadow = '0 6px 16px rgba(27, 115, 232, 0.4)';
    });
    
    this.installButton.addEventListener('mouseleave', () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        this.installButton.style.transform = 'translateY(0) scale(1)';
      }else {
        this.installButton.style.transform = 'translateX(0) scale(1)';
      }
      this.installButton.style.boxShadow = '0 4px 12px rgba(27, 115, 232, 0.3)';
    });
    
    // Add click handler
    this.installButton.addEventListener('click', () => {
      this.promptInstall();
    });
    
    document.body.appendChild(this.installButton);
    
  }
  
  showInstallOption() {
    if (this.installButton && !this.isInstalled) {
      this.installButton.style.display = 'block';
      // Animate in based on screen size
      setTimeout(() => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          this.installButton.style.transform = 'translateY(0)';
        }else {
          this.installButton.style.transform = 'translateX(0)';
        }
        this.installButton.style.opacity = '1';
      }, 100);
    }
  }
  
  hideInstallOption() {
    if (this.installButton) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        this.installButton.style.transform = 'translateY(100px)';
      }else {
        this.installButton.style.transform = 'translateX(200px)';
      }
      this.installButton.style.opacity = '0';
      setTimeout(() => {
        this.installButton.style.display = 'none';
      }, 300);
    }
  }
  
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('No install prompt available');
      
      if (this.isDevelopment) {
        // Show a helpful message in development
        console.warn('🔧 Development Mode: Install prompts don\'t work with self-signed SSL certificates.');
        console.info('To test installation:');
        console.info('1. Deploy to production with proper SSL');
        console.info('2. Use ngrok for local testing');
        console.info('3. Or test on Android Chrome with "chrome://flags/#unsafely-treat-insecure-origin-as-secure"');
      }

      return;
    }
    
    // Show the install prompt
    this.deferredPrompt.prompt();
    
    // Wait for the user's response
    const {outcome} = await this.deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    this.deferredPrompt = null;
    this.hideInstallOption();
  }
  
  // Add iOS Safari install instructions
  showIOSInstructions() {
    if (this.isIOS() && !this.isInstalled) {
      // Create iOS install banner
      const iosBanner = document.createElement('div');
      iosBanner.className = 'ios-install-banner';
      iosBanner.innerHTML = `
        <div class="ios-banner-content">
          <span class="ios-banner-icon">📱</span>
          <div class="ios-banner-text">
            <strong>Install Teachable Machine</strong>
            <p>Tap <strong>Share</strong> and then <strong>Add to Home Screen</strong></p>
          </div>
          <button class="ios-banner-close">×</button>
        </div>
      `;
      iosBanner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #1b73e8;
        color: white;
        padding: 16px;
        z-index: 10000;
        transform: translateY(100%);
        transition: transform 0.3s ease;
      `;
      
      // Add banner styles
      const style = document.createElement('style');
      style.textContent = `
        .ios-banner-content {
          display: flex;
          align-items: center;
          max-width: 600px;
          margin: 0 auto;
        }
        .ios-banner-icon {
          font-size: 2rem;
          margin-right: 12px;
        }
        .ios-banner-text {
          flex: 1;
          font-family: 'Poppins', sans-serif;
        }
        .ios-banner-text strong {
          font-weight: 600;
        }
        .ios-banner-text p {
          margin: 4px 0 0 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }
        .ios-banner-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 8px;
          margin-left: 12px;
        }
      `;
      document.head.appendChild(style);
      
      // Add close functionality
      const closeBtn = iosBanner.querySelector('.ios-banner-close');
      closeBtn.addEventListener('click', () => {
        iosBanner.style.transform = 'translateY(100%)';
        setTimeout(() => iosBanner.remove(), 300);
        localStorage.setItem('ios-install-dismissed', 'true');
      });
      
      document.body.appendChild(iosBanner);
      
      // Animate in
      setTimeout(() => {
        iosBanner.style.transform = 'translateY(0)';
      }, 500);
    }
  }
  
  isIOS() {
    return (/iPad|iPhone|iPod/).test(navigator.userAgent) && !window.MSStream;
  }
  
  // Show install instructions after a delay
  showInstallPromptAfterDelay() {
    if (this.isInstalled) {
      return;
    }
    
    setTimeout(() => {
      if (this.isIOS() && localStorage.getItem('ios-install-dismissed') !== 'true') {
        this.showIOSInstructions();
      }
    }, 10000);
  }
  
  // Setup offline/online detection
  setupOfflineDetection() {
    // Create offline indicator
    this.offlineIndicator = document.createElement('div');
    this.offlineIndicator.className = 'offline-indicator';
    this.offlineIndicator.textContent = 'Working Offline';
    document.body.appendChild(this.offlineIndicator);
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('App is online');
      this.hideOfflineIndicator();
    });
    
    window.addEventListener('offline', () => {
      console.log('App is offline');
      this.showOfflineIndicator();
    });
    
    // Check initial state
    if (!navigator.onLine) {
      this.showOfflineIndicator();
    }
  }
  
  showOfflineIndicator() {
    if (this.offlineIndicator) {
      this.offlineIndicator.classList.add('show');
    }
  }
  
  hideOfflineIndicator() {
    if (this.offlineIndicator) {
      this.offlineIndicator.classList.remove('show');
    }
  }
}

export default PWAUtils;