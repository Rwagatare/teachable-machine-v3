// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import GLOBALS from '../config.js';
import *as tf from '@tensorflow/tfjs';
import WebcamClassifier from './WebcamClassifier.js';

/**
 * Enhanced WebcamClassifier class with improved classification algorithms
 * inspired by Teachable Machine v2
 */

class EnhancedWebcamClassifier {
  constructor() {
    // Create a new instance of the original classifier
    this.originalClassifier = new WebcamClassifier();
    
    // Access the video element from the original classifier
    this.video = this.originalClassifier.video;
    
    // Initialize state variables
    this.isTraining = false;
    this.trainingComplete = false;
    
    // Initialize confidence history for smoothing predictions
    this.confidenceHistory = {};
    for (let index = 0; index < 3; index += 1) {
      this.confidenceHistory[index] = [];
    }
  }
  
  /**
   * Enhanced prediction method that improves the stability and accuracy
   * of the original classifier's predictions
   * @param {Object} image - The image to classify
   * @return {Object} - Enhanced prediction with more stable results
   */
  async predict(image) {
    // Get original prediction from wrapped classifier
    const originalPrediction = await this.originalClassifier.predict(image);
    
    // Apply enhancements
    return this.enhancePrediction(originalPrediction);
  }
  
  enhancePrediction(prediction) {
    // Constants for confidence threshold and smoothing
    const CONFIDENCE_THRESHOLD = 0.65;
    const CONFIDENCE_HISTORY_SIZE = 10;
    const STABILITY_THRESHOLD = 3;
    
    if (!prediction || !prediction.confidences) {
      return prediction;
    }
    
    // Store confidence values in history for each class
    Object.keys(prediction.confidences).forEach((classIndex) => {
      // Add the new confidence value
      if (!this.confidenceHistory[classIndex]) {
        this.confidenceHistory[classIndex] = [];
      }
      
      this.confidenceHistory[classIndex].push(prediction.confidences[classIndex]);
      
      // Keep only the most recent values
      if (this.confidenceHistory[classIndex].length > CONFIDENCE_HISTORY_SIZE) {
        this.confidenceHistory[classIndex].shift();
      }
    });
    
    // Calculate weighted average confidence for each class
    // More recent predictions have higher weight
    const smoothedConfidences = {};
    
    Object.keys(prediction.confidences).forEach((classIndex) => {
      smoothedConfidences[classIndex] = 0;
      
      if (this.confidenceHistory[classIndex] && this.confidenceHistory[classIndex].length > 0) {
        let weightedSum = 0;
        let totalClassWeight = 0;
        
        // Apply linear weighting - more recent predictions count more
        this.confidenceHistory[classIndex].forEach((conf, index) => {
          // Weight increases with recency
          const weight = index + 1;
          weightedSum += conf * weight;
          totalClassWeight += weight;
        });
        
        smoothedConfidences[classIndex] = weightedSum / totalClassWeight;
      }
    });
    
    // Find the class with highest smoothed confidence
    let highestClassIndex = -1;
    let highestConfidence = 0;
    
    Object.keys(smoothedConfidences).forEach((classIndex) => {
      if (smoothedConfidences[classIndex] > highestConfidence) {
        highestConfidence = smoothedConfidences[classIndex];
        highestClassIndex = parseInt(classIndex, 10);
      }
    });
    
    // Apply confidence threshold
    if (highestConfidence < CONFIDENCE_THRESHOLD) {
      // Return uncertain prediction
      return {
        classIndex: -1,
        confidences: smoothedConfidences
      };
    }
    
    // Create enhanced prediction
    const enhancedPrediction = {
      classIndex: highestClassIndex,
      confidences: smoothedConfidences
    };
    
    return enhancedPrediction;
  }
  
  /**
   * Ensure the output section is enabled after training
   * @returns {void}
   */
  enableOutput() {
    if (GLOBALS.outputSection) {
      console.log('Enabling output section');
      GLOBALS.outputSection.element.classList.remove('section--disabled');
      
      if (GLOBALS.outputSection.arrow) {
        GLOBALS.outputSection.arrow.show();
        
        // Hide the arrow after a few seconds
        setTimeout(() => {
          GLOBALS.outputSection.arrow.hide();
        }, 3000);
      }
    }
  }
  
  // Proxy methods to the original classifier
  startWebcam() {
    return this.originalClassifier.startWebcam();
  }
  
  /**
   * Initializes the classifier
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   */
  async init() {
    await this.originalClassifier.init();
  }
  
  train(image, index) {
    this.isTraining = true;
    const result = this.originalClassifier.train(image, index);
    
    // Check if we should enable output section
    const trained = Object.values(GLOBALS.classesTrained).every((value) => value === true);
    if (trained && !this.trainingComplete) {
      this.trainingComplete = true;
      this.enableOutput();
    }
    
    return result;
  }
  
  clear(index) {
    return this.originalClassifier.clear(index);
  }
  
  deleteClassData(index) {

    /* Reset confidence history for this class */
    this.confidenceHistory[index] = [];
    
    return this.originalClassifier.deleteClassData(index);
  }
  
  ready() {
    return this.originalClassifier.ready();
  }
  
  videoLoaded() {
    return this.originalClassifier.videoLoaded();
  }
  
  blur() {
    return this.originalClassifier.blur();
  }
  
  focus() {
    return this.originalClassifier.focus();
  }
  
  buttonDown(id, canvas, learningClass) {
    this.isTraining = true;
    
    return this.originalClassifier.buttonDown(id, canvas, learningClass);
  }
  
  buttonUp(id) {
    this.isTraining = false;
    
    return this.originalClassifier.buttonUp(id);
  }
  
  startTimer() {
    return this.originalClassifier.startTimer();
  }
  
  stopTimer() {
    return this.originalClassifier.stopTimer();
  }
  
  animate() {
    return this.originalClassifier.animate();
  }
}

export default EnhancedWebcamClassifier;