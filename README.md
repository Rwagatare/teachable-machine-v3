# Teachable Machine v3 - Getting Started Guide

## What's New in v3?

Version 3 transforms Teachable Machine into a modern, accessible, and offline-capable application with significant improvements:

### 1. Enhanced Machine Learning

- **TensorFlow.js Integration**: Upgraded to the latest TensorFlow.js for better performance
- **Temporal Smoothing**: More stable predictions without flickering
- **Smart Confidence Thresholding**: Reduced false positives in ambiguous situations
- **Adaptive Processing**: Better performance across varying device capabilities

### 2. Better Accessibility & User Experience

- **High Contrast Interface**: Improved visibility for all users
- **Keyboard Navigation**: Complete keyboard support with visible focus indicators
- **Mobile Optimization**: Responsive design with touch-friendly controls
- **Real-time Feedback**: Clear visual cues during model training and inference

### 3. Progressive Web App (PWA) Support

- **Offline Functionality**: Use the app without an internet connection
- **Install on Any Device**: Add to home screen on mobile or desktop
- **Automatic Updates**: Always get the latest features
- **Responsive Design**: Optimized for all screen sizes

## Run It Locally

### System Requirements

- Modern web browser (Chrome, Firefox, or Edge recommended)
- Webcam
- Node.js version 14 or higher
- Yarn package manager (or npm)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Rwagatare/teachable-machine-v3.git
cd teachable-machine-v3
```

2. Install dependencies:

```bash
yarn install
# or if using npm
npm install
```

3. Build the project:

```bash
yarn build
# or if using npm
npm run build
```

### Running Locally

1. Start the development server:

```bash
yarn run watch
# or if using npm
npm run watch
```

2. Open your browser and navigate to:

```
http://localhost:3000
```

### Testing on Mobile or Other Devices

To access from other devices on your network:

1. Find your computer's IP address:

   - On macOS/Linux: Run `ifconfig` in terminal
   - On Windows: Run `ipconfig` in command prompt

2. Generate SSL certificates (for HTTPS):

```bash
openssl genrsa -out server.key 2048
openssl req -new -x509 -sha256 -key server.key -out server.cer -days 365 -subj /CN=YOUR_IP
```

3. Start the HTTPS server:

```bash
yarn run watch-https
# or if using npm
npm run watch-https
```

4. On your mobile device:
   - Go to `https://YOUR_IP:3000`
   - Accept the security warning about the self-signed certificate
   - Allow camera access when prompted

## Using Teachable Machine

### Training a Custom Model

1. **Add Examples to Classes**

   - Click an empty class button (Green, Purple, or Orange)
   - Hold down to record examples while showing different variations
   - Add at least 30-50 examples per class for reliable results
   - Use the "Add Class" button to add more classes beyond the default three (desktop only)
   - You can add up to 6 different classes for more complex models

2. **Adding More Classes** (Desktop Only)

- The ability to add additional classes is available on desktop devices only
- The feature is disabled on mobile to optimize the user experience for touch interfaces
- The idea is borrowed from V2's ability to add another class making V1 as dynamic

3. **Training Best Practices**

   - Vary positions, angles, and distances for each class
   - Include different lighting conditions in your examples
   - Maintain consistent backgrounds for each class
   - Consider what distinguishing features the model should learn

4. **Testing Your Model**
   - After training, the model automatically starts classifying
   - Test with new examples not used during training
   - Monitor the confidence bars to understand prediction certainty
   - If accuracy is low, add more examples or retrain with better variations

### Using the PWA Features

### Using the PWA Features

#### Installing on Desktop

1. **Chrome/Edge**: (this will be worked on)

   - Visit the Teachable Machine v3 website ( this well be done)
   - Look for the install icon (➕) in the address bar
   - Click "Install Teachable Machine"
   - The app will open in its own window and appear in your applications

2. **Firefox**:
   - Visit the site in Firefox
   - Click the three dots (⋮) in the address bar
   - Select "Install Teachable Machine"

#### Installing on Mobile Devices

1. **Android (Chrome)**:

   - Visit the site in Chrome
   - When prompted, tap "Add to Home Screen"
   - Or tap the menu (⋮) and select "Add to Home Screen"
   - The app will appear on your home screen with its own icon

2. **iOS (Safari)**:
   - Visit the site in Safari
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add" in the upper right corner
   - The app will appear on your home screen

#### Offline Capabilities

Once installed as a PWA, Teachable Machine offers:

- **Full Offline Access**: Use the app without an internet connection
- **Local Model Training**: Train and use models without connectivity
- **Camera Integration**: Camera functionality works completely offline
- **Automatic Syncing**: Changes sync when connectivity is restored

If you open the app offline for the first time, you'll see a friendly offline page with instructions.

## Advanced Features

### Exporting Your Model

1. After training your model, click the "Export" button
2. Choose from available export options:
   - **JavaScript**: Embed in web applications
   - **TensorFlow.js**: Use with custom TensorFlow.js projects
   - **TensorFlow Lite**: Deploy on mobile or edge devices

### Custom Integration

The models created with Teachable Machine v3 can be integrated into:

- Web applications using JavaScript
- Mobile apps using TensorFlow Lite
- Art installations using p5.js or Processing
- IoT devices using TensorFlow for microcontrollers

## Troubleshooting

### Camera Issues

- **No camera access**: Check browser permissions in site settings
- **Camera not starting**: Refresh the page or restart the browser
- **Poor camera quality**: Ensure good lighting and clean camera lens
- **Camera lag**: Close other applications using the camera

### Performance Issues

- **Slow response**: Try using Chrome for best performance
- **High CPU usage**: Close other resource-intensive applications
- **Model inaccuracy**: Add more training examples with greater variety
- **PWA not installing**: Make sure you're using a supported browser

### PWA Specific Issues

- **Can't see install option**: Make sure you've visited the site at least once
- **App not working offline**: Visit all sections while online first to cache resources
- **PWA updates**: Check for updates by refreshing the app while online

## Contributing

We welcome contributions to Teachable Machine v3! To get started:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please follow the coding standards and include tests for new features.

## Need Help?

- Check the [original documentation](https://g.co/teachablemachine)
- Visit our [community forum](https://support.google.com/teachablemachine)
- File issues on [GitHub](https://github.com/Rwagatare/teachable-machine-v3/issues)

---

## Credit

This v3 enhancement builds upon the original Teachable Machine experiment by Google Creative Lab and friends from [Støj](http://stoj.io/), [Use All Five](https://useallfive.com/), and [PAIR](https://ai.google/pair/) teams at Google.

Version 3 adds PWA support, accessibility improvements, enhanced machine learning capabilities, and a more intuitive user experience.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
