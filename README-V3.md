# Teachable Machine v3 - Getting Started Guide

## What's New in v3?

This version combines the best features from previous versions with new enhancements:

### 1. Enhanced Image Classification

- Temporal smoothing for more stable predictions
- Weighted confidence averaging to reduce flickering
- Smart thresholding to prevent false positives
- Improved accuracy in varying lighting conditions

### 2. Better Accessibility

- Higher contrast interface elements
- Improved keyboard navigation with visible focus indicators
- Touch-friendly targets for mobile users
- Clear, readable text with optimal contrast ratios

### 3. Improved User Interface

- Cleaner, more intuitive training interface
- Real-time feedback during training
- Mobile-optimized controls
- Smoother transitions between states

## Try It on Your Laptop

### Step 1: System Requirements

- A modern web browser (Chrome, Firefox, or Edge recommended)
- Webcam
- Node.js version 14 or higher
- Yarn package manager
- Git

### Step 2: Installation

1. Open your terminal and clone the repository:

```bash
git clone https://github.com/googlecreativelab/teachable-machine-v1.git
cd teachable-machine-v1
```

2. Switch to the v3 branch:

```bash
git checkout v3-livingstone
```

3. Install the dependencies:

```bash
yarn
```

4. Build the project:

```bash
yarn build
```

### Step 3: Running Locally

1. Start the development server:

```bash
yarn run watch
```

2. Open your browser and go to:

```
http://localhost:3000
```

### Step 4: Testing on Mobile or Other Devices

To access from other devices on your network, you'll need to use HTTPS:

1. Find your computer's IP address:

   - On macOS/Linux: Run `ifconfig` in terminal
   - On Windows: Run `ipconfig` in command prompt

2. Generate SSL certificates (replace YOUR_IP with your IP address):

```bash
openssl genrsa -out server.key 2048
openssl req -new -x509 -sha256 -key server.key -out server.cer -days 365 -subj /CN=YOUR_IP
```

3. Start the HTTPS server:

```bash
yarn run watch-https
```

4. On your mobile device:
   - Go to `https://YOUR_IP:3000`
   - Accept the security warning (this appears because we're using a self-signed certificate)
   - Allow camera access when prompted

## Using Teachable Machine

1. **Training the Model**

   - Click the first empty class button
   - Hold down to record examples while moving/changing the subject
   - Repeat for other classes
   - Add at least 30 examples per class for best results

2. **Testing**

   - After training, the model will automatically start classifying
   - Try different angles and lighting conditions
   - The confidence bar shows how sure the model is about its prediction

3. **Tips for Better Results**
   - Train with varied backgrounds
   - Move the subject around while training
   - Include different angles and distances
   - Train in different lighting conditions
   - Add more examples if the model isn't accurate enough

## Troubleshooting

### Camera Issues

- Make sure you've allowed camera access in your browser
- Try refreshing the page if the camera doesn't start
- For mobile devices, ensure you're using HTTPS
- Check that no other apps are using your camera

### Performance Issues

- Close other resource-intensive browser tabs
- Try reducing video quality in the settings
- Ensure good lighting for better classification
- Clear your browser cache if the app feels slow

### Training Issues

- Provide more varied examples during training
- Keep the background consistent for each class
- Ensure good lighting while training
- Try retraining if results are inconsistent

## Need Help?

- Check the [original documentation](https://g.co/teachablemachine)
- File issues on [GitHub](https://github.com/googlecreativelab/teachable-machine-v1/issues)
- Make sure to mention you're using v3 when reporting issues

---

## Credit

This v3 enhancement is built upon the original Teachable Machine experiment by Google Creative Lab and friends from [Støj](http://stoj.io/), [Use All Five](https://useallfive.com/), and [PAIR](https://ai.google/pair/) teams at Google. The v3 improvements focus on accessibility, reliability, and user experience.
