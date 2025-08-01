# Teachable Machine v3

## About

Teachable Machine is an experiment that makes it easier for anyone to explore machine learning, live in the browser – no coding required. Learn more about the experiment and try it yourself on [g.co/teachablemachine](https://g.co/teachablemachine).

This is version 3 of Teachable Machine, which combines the best elements of v1 and v2:

- Mobile-friendly interface from v1 with improved accessibility and contrast
- Interactive outputs (sounds, text-to-speech, etc.) from v1
- Cleaner "Train" button interface from v2
- Enhanced image classification algorithm from v2

The experiment is built using the [TensorFlow.js](https://js.tensorflow.org/) library.

## New Features in v3

### Enhanced Image Classification

The EnhancedWebcamClassifier provides improved prediction results by:

- Using temporal smoothing of confidence values
- Applying weighted averaging to reduce flickering
- Implementing confidence thresholding for more stable results

### Improved Accessibility

- Better color contrast throughout the interface
- Enhanced focus indicators for keyboard navigation
- Mobile-optimized touch targets
- More readable text with better contrast

### Cleaner Train Button Interface

- Improved visual design inspired by v2
- More responsive interaction with feedback
- Better mobile support with touch-friendly targets

## Development

#### Install dependencies by running (similar to `npm install`)

```
yarn
```

#### Build project

```
yarn build
```

#### Start local server by running

```
yarn run watch
```

#### Code Styles

- There’s a pre-commit hook set up that will prevent commits when there are errors
- Run `yarn eslint` for es6 errors & warnings
- Run `yarn stylint` for stylus errors & warnings

#### To run https locally:

https is required to get camera permissions to work when not working with `localhost`

1. Generate Keys

```
openssl genrsa -out server.key 2048
openssl req -new -x509 -sha256 -key server.key -out server.cer -days 365 -subj /CN=YOUR_IP
```

2. Use `yarn run watch-https`
3. Go to `https://YOUR_IP:3000`, then accept the insecure privacy notice, and proceed.

## Credit

This is not an official Google product, but an experiment that was a collaborative effort by friends from [Støj](http://stoj.io/), [Use All Five](https://useallfive.com/) and Creative Lab and [PAIR](https://ai.google/pair/) teams at Google.

Version 3 enhancements were added in 2023 to improve the user experience and accessibility.
