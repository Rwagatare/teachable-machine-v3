// Modern bundle optimization for Teachable Machine with Workbox
// This script loads modules dynamically to reduce initial bundle size

console.log('🚀 Teachable Machine - Optimized Loading');

// Performance monitoring
const perfStart = performance.now();

// Lazy load heavy dependencies
async function loadTensorFlow() {
  console.log('📚 Loading TensorFlow...');
  const [tf, mobilenet, knnClassifier] = await Promise.all([
    import('@tensorflow/tfjs'),
    import('@tensorflow-models/mobilenet'),
    import('@tensorflow-models/knn-classifier')
  ]);
  
  console.log('✅ TensorFlow loaded');
  return { tf, mobilenet, knnClassifier };
}

// Lazy load UI components
async function loadUIComponents() {
  console.log('🎨 Loading UI components...');
  const [pwaUtils] = await Promise.all([
    import('./ui/components/PWAUtils.js').catch(() => {
      console.warn('PWAUtils not found, using fallback');
      return { default: class { constructor() {} } };
    })
  ]);
  
  console.log('✅ UI components loaded');
  return { pwaUtils };
}

// Initialize app in phases for better performance
class OptimizedApp {
  constructor() {
    this.initPhase1(); // Critical above-the-fold content
  }
  
  async initPhase1() {
    console.log('🎬 Phase 1: Critical rendering');
    
    // Show the app immediately
    this.showInitialUI();
    
    // Start loading heavy dependencies in background
    const loadingPromises = {
      ml: this.loadMLDependencies(),
      ui: this.loadUIDependencies()
    };
    
    // Initialize phase 2 when ready
    setTimeout(() => this.initPhase2(loadingPromises), 100);
  }
  
  showInitialUI() {
    // Remove loading screen if present
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.remove(), 300);
    }
    
    // Show intro content
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) {
      wrapper.style.opacity = '1';
    }
  }
  
  async loadMLDependencies() {
    // Load ML libraries only when needed (not immediately)
    return new Promise(resolve => {
      // Defer ML loading until user interaction
      const loadML = async () => {
        const ml = await loadTensorFlow();
        resolve(ml);
      };
      
      // Load on first user interaction
      const events = ['click', 'touchstart', 'keydown'];
      const handleInteraction = () => {
        events.forEach(event => 
          document.removeEventListener(event, handleInteraction)
        );
        loadML();
      };
      
      events.forEach(event => 
        document.addEventListener(event, handleInteraction, { once: true })
      );
      
      // Or load after 3 seconds if no interaction
      setTimeout(loadML, 3000);
    });
  }
  
  async loadUIDependencies() {
    return loadUIComponents();
  }
  
  async initPhase2(loadingPromises) {
    console.log('⚡ Phase 2: Enhanced features');
    
    // Initialize PWA features immediately (lightweight)
    try {
      const { ui } = await loadingPromises.ui;
      if (ui.pwaUtils && ui.pwaUtils.default) {
        new ui.pwaUtils.default();
        console.log('✅ PWA features initialized');
      }
    } catch (error) {
      console.warn('PWA features failed to load:', error);
    }
    
    // Initialize other features
    this.initializeFeatures();
    
    // ML libraries will load on demand
    loadingPromises.ml.then(ml => {
      console.log('✅ ML ready for use');
      this.mlReady = true;
      this.ml = ml;
    });
    
    // Report performance
    const perfEnd = performance.now();
    console.log(`📊 App initialized in ${(perfEnd - perfStart).toFixed(2)}ms`);
  }
  
  initializeFeatures() {
    // Initialize lightweight features first
    this.initTutorial();
    this.initButtonHandlers();
    this.initResponsiveFeatures();
  }
  
  initTutorial() {
    const startButton = document.getElementById('start-tutorial-button');
    if (startButton) {
      startButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Show loading if ML not ready
        if (!this.mlReady) {
          console.log('🔄 Waiting for ML libraries...');
          startButton.textContent = 'Loading...';
          startButton.disabled = true;
          
          await this.ml;
          
          startButton.textContent = 'Get Started';
          startButton.disabled = false;
        }
        
        // Start the tutorial
        this.startTutorial();
      });
    }
  }
  
  initButtonHandlers() {
    // Add click handlers for other buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.button, .intro__cta a')) {
        // Add subtle interaction feedback
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
          e.target.style.transform = 'scale(1)';
        }, 100);
      }
    });
  }
  
  initResponsiveFeatures() {
    // Handle responsive behavior
    const handleResize = () => {
      // Optimize for mobile/desktop
      const isMobile = window.innerWidth <= 768;
      document.body.classList.toggle('mobile', isMobile);
      document.body.classList.toggle('desktop', !isMobile);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
  }
  
  async startTutorial() {
    console.log('🎯 Starting tutorial...');
    
    // Ensure ML is loaded
    if (!this.mlReady) {
      await this.ml;
    }
    
    // Initialize the actual teachable machine logic
    // (This would connect to your existing tutorial code)
    console.log('✅ Tutorial ready with ML capabilities');
  }
}

// Initialize the optimized app
new OptimizedApp();

// Export for global access if needed
window.TeachableMachine = OptimizedApp;
