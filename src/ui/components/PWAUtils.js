// PWA utilities: install button, iOS "Add to Home Screen" hint and the
// offline indicator. All styling lives in style/components/pwa.styl.

const IOS_DISMISSED_KEY = 'ios-install-dismissed';

// Wait a moment after the first trained class before suggesting an install,
// and keep waiting while the tutorial bar or the recorder is on screen.
const ENGAGEMENT_DELAY = 4000;
const BUSY_RECHECK_DELAY = 5000;
const EXIT_DURATION = 300;

// The MobileNet weights are precached by the service worker and training runs
// on the device, so training keeps working without a connection.
const OFFLINE_MESSAGE = 'Offline — training still works on this device';

const CLOSE_ICON = '<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 14 14">' +
	'<path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

const INSTALL_ICON = '<svg class="pwa-install-button__icon" aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 18 18">' +
	'<path d="M9 2.5v8.5M5.5 7.5L9 11l3.5-3.5M3 14.5h12" stroke="currentColor" stroke-width="1.8" ' +
	'stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';

function readFlag(key) {
	try {
		return localStorage.getItem(key) === 'true';
	}catch (error) {
		return false;
	}
}

function writeFlag(key) {
	try {
		localStorage.setItem(key, 'true');
	}catch (error) {
		// Storage can be unavailable (e.g. blocked site data); nothing to do.
	}
}

// Show a floating element and let its CSS transition run.
function reveal(element) {
	clearTimeout(element.pwaExitTimer);
	element.hidden = false;
	element.getBoundingClientRect();
	element.classList.add('is-visible');
}

// Fade a floating element out, then take it out of the page.
function conceal(element, onDone) {
	element.classList.remove('is-visible');
	clearTimeout(element.pwaExitTimer);
	element.pwaExitTimer = setTimeout(() => {
		element.hidden = true;
		if (onDone) {
			onDone();
		}
	}, EXIT_DURATION);
}

class PWAUtils {
	constructor() {
		this.deferredPrompt = null;
		this.installButton = null;
		this.iosBanner = null;
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
			console.log('PWA Utils: development mode detected');
		}

		// Listen for the beforeinstallprompt event
		window.addEventListener('beforeinstallprompt', (event) => {
			// Prevent the mini-infobar from appearing
			event.preventDefault();
			// Save the event for later use
			this.deferredPrompt = event;
			this.showInstallOption();
		});

		// Listen for app installed event
		window.addEventListener('appinstalled', () => {
			this.isInstalled = true;
			this.hideInstallOption();
			this.deferredPrompt = null;
		});

		this.checkIfInstalled();
		this.createInstallButton();

		// In development, show a helpful message about PWA features
		if (this.isDevelopment) {
			setTimeout(() => {
				console.log('PWA features in development:');
				console.log('   - Install prompts may not work with self-signed certificates');
				console.log('   - Service worker may fail due to SSL issues');
				console.log('   - This is normal for development - features will work in production');
			}, 2000);
		}
	}

	checkIfInstalled() {
		// Check if app is installed (standalone mode)
		if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
			this.isInstalled = true;
		}

		// Check for iOS Safari installed
		if (window.navigator.standalone === true) {
			this.isInstalled = true;
		}
	}

	createInstallButton() {
		// Only create install button if not already installed
		if (this.isInstalled) {
			return;
		}

		let button = document.createElement('button');
		button.type = 'button';
		button.className = 'pwa-install-button';
		button.hidden = true;
		button.setAttribute('aria-label', 'Install Teachable Machine');
		button.innerHTML = INSTALL_ICON + '<span class="pwa-install-button__label">Install</span>';
		button.addEventListener('click', () => {
			this.promptInstall();
		});

		this.installButton = button;
		document.body.appendChild(button);
	}

	showInstallOption() {
		if (this.installButton && !this.isInstalled) {
			reveal(this.installButton);
		}
	}

	hideInstallOption() {
		if (this.installButton && !this.installButton.hidden) {
			conceal(this.installButton);
		}
	}

	async promptInstall() {
		if (!this.deferredPrompt) {
			if (this.isDevelopment) {
				// Show a helpful message in development
				console.warn('Development mode: install prompts don\'t work with self-signed SSL certificates.');
				console.info('To test installation:');
				console.info('1. Deploy to production with proper SSL');
				console.info('2. Use ngrok for local testing');
				console.info('3. Or test on Android Chrome with "chrome://flags/#unsafely-treat-insecure-origin-as-secure"');
			}

			return;
		}

		// Show the install prompt and wait for the user's response
		this.deferredPrompt.prompt();
		await this.deferredPrompt.userChoice;

		// The event can only be used once
		this.deferredPrompt = null;
		this.hideInstallOption();
	}

	isIOS() {
		let iPhoneOrIPod = (/iPad|iPhone|iPod/).test(navigator.userAgent) && !window.MSStream;
		// iPadOS reports itself as a Mac; tell them apart by touch support.
		let iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

		return iPhoneOrIPod || iPadOS;
	}

	// True while something else owns the bottom of the screen or the user's
	// attention: the launch screen, the tutorial bar or the recorder sheet.
	isBusy() {
		let launchScreenUp = document.body.classList.contains('no-scroll');
		let tutorial = document.querySelector('.wizard__wrapper');
		let tutorialVisible = Boolean(tutorial) &&
			getComputedStyle(tutorial).display !== 'none' &&
			tutorial.offsetHeight > 0;
		let recorder = document.querySelector('#recording');
		let recorderOpen = Boolean(recorder) && !recorder.hidden;

		return launchScreenUp || tutorialVisible || recorderOpen;
	}

	// iOS has no install prompt, so explain how to add the app instead. Shown
	// at most once, and never on launch (see showInstallPromptAfterDelay).
	showIOSInstructions() {
		if (!this.isIOS() || this.isInstalled || this.iosBanner || readFlag(IOS_DISMISSED_KEY)) {
			return;
		}
		writeFlag(IOS_DISMISSED_KEY);

		let banner = document.createElement('section');
		banner.className = 'ios-install-banner';
		banner.hidden = true;
		banner.setAttribute('aria-labelledby', 'ios-install-title');
		banner.innerHTML = '<img class="ios-install-banner__icon" src="assets/static/favicon/favicon-152.png" alt="" width="40" height="40">' +
			'<div class="ios-install-banner__text">' +
			'<p class="ios-install-banner__title" id="ios-install-title">Install Teachable Machine</p>' +
			'<p class="ios-install-banner__body">Tap Share, then Add to Home Screen.</p>' +
			'</div>' +
			'<button type="button" class="ios-install-banner__close" aria-label="Close">' + CLOSE_ICON + '</button>';

		function dismiss() {
			conceal(banner, () => {
				banner.remove();
			});
		}
		banner.querySelector('.ios-install-banner__close').addEventListener('click', dismiss);
		banner.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				dismiss();
			}
		});

		this.iosBanner = banner;
		document.body.appendChild(banner);
		reveal(banner);
	}

	// Kept under its original name for index.js. Rather than a timer on
	// launch, the iOS hint now waits for real engagement: the first time a
	// class is trained, and only once the tutorial bar and recorder are gone.
	showInstallPromptAfterDelay() {
		if (this.isInstalled || !this.isIOS() || readFlag(IOS_DISMISSED_KEY)) {
			return;
		}

		this.classTrainedEvent = () => {
			window.removeEventListener('class-trained', this.classTrainedEvent);
			this.scheduleIOSInstructions(ENGAGEMENT_DELAY);
		};
		window.addEventListener('class-trained', this.classTrainedEvent);
	}

	scheduleIOSInstructions(delay) {
		clearTimeout(this.iosTimer);
		this.iosTimer = setTimeout(() => {
			if (this.isBusy()) {
				this.scheduleIOSInstructions(BUSY_RECHECK_DELAY);

				return;
			}
			this.showIOSInstructions();
		}, delay);
	}

	// Setup offline/online detection
	setupOfflineDetection() {
		// The live region exists from the start (empty) so that filling it in
		// is announced by screen readers.
		this.offlineIndicator = document.createElement('div');
		this.offlineIndicator.className = 'offline-indicator';
		this.offlineIndicator.setAttribute('role', 'status');
		document.body.appendChild(this.offlineIndicator);

		window.addEventListener('online', () => {
			this.hideOfflineIndicator();
		});

		window.addEventListener('offline', () => {
			this.showOfflineIndicator();
		});

		// Check initial state
		if (!navigator.onLine) {
			this.showOfflineIndicator();
		}
	}

	showOfflineIndicator() {
		if (this.offlineIndicator) {
			this.offlineIndicator.textContent = OFFLINE_MESSAGE;
			this.offlineIndicator.classList.add('show');
		}
	}

	hideOfflineIndicator() {
		if (this.offlineIndicator) {
			this.offlineIndicator.classList.remove('show');
			this.offlineIndicator.textContent = '';
		}
	}
}

export default PWAUtils;