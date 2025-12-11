import React, { useState, useEffect } from 'react';
import { Upload, Clock, Sparkles, Award, Zap, AlertCircle } from 'lucide-react';

// Import example images so Vite bundles them into production build
import biryaniImg from '../examples/biryani.jpg';
import masalaDosaImg from '../examples/masala_dosa.jpg';
import gulabJamunImg from '../examples/gulab_jamun.jpg';
import paniPuriImg from '../examples/pani_puri.jpg';
import haraBharaKababImg from '../examples/hara_bhara_kabab.jpg';
import faloodaImg from '../examples/falooda.jpg';
import chickenPizzaImg from '../examples/chicken_pizza.jpg';
import sandwichImg from '../examples/sandwich.jpg';

export default function IndianFoodVision() {
  const [imagePreview, setImagePreview] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warmed, setWarmed] = useState(false);

  // Warm up the API on component mount to eliminate cold start for first real request
  useEffect(() => {
    const warmupAPI = async () => {
      try {
        const formData = new FormData();
        formData.append('file', new File([''], 'warmup.jpg', { type: 'image/jpeg' }));
        
        await fetch('https://indianfoodvision.onrender.com/predict', {
          method: 'POST',
          body: formData,
          keepalive: true,
        });
      } catch {}
      setWarmed(true);
    };
    warmupAPI();
  }, []);

  // Example images - will be loaded from /examples folder
  const exampleImages = [
    { path: biryaniImg, name: 'Biryani' },
    { path: masalaDosaImg, name: 'Masala Dosa' },
    { path: gulabJamunImg, name: 'Gulab Jamun' },
    { path: paniPuriImg, name: 'Pani Puri' },
    { path: haraBharaKababImg, name: 'Hara Bhara Kabab' },
    { path: faloodaImg, name: 'Falooda' },
    { path: chickenPizzaImg, name: 'Chicken Pizza' },
    { path: sandwichImg, name: 'Sandwich' }
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Generate preview in parallel with API call
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      
      // Start API call immediately
      await classifyImage(file);
      
      // Reset file input so the same file can be selected again
      e.target.value = '';
    }
  };

  const classifyImage = async (file) => {
    setIsLoading(true);
    setPredictions(null);
    setError(null);

    try {
      // Sanitize filename (remove spaces) to avoid any edge cases on server
      const safeFileName = file.name ? file.name.replace(/\s+/g, '_') : `upload.${file.type.split('/').pop()}`;
      const safeFile = new File([file], safeFileName, { type: file.type });

      const formData = new FormData();
      formData.append('file', safeFile);

      // minimal logging retained for critical info

      // Primary attempt
      let response;
      try {
        response = await fetch('https://indianfoodvision.onrender.com/predict', {
          method: 'POST',
          body: formData,
          keepalive: true,
        });
      } catch (primaryErr) {
        console.warn('Primary fetch failed; retrying with fallback options');

        // Retry with more explicit options (no keepalive) to work around some network/CORS edge cases
        try {
          response = await fetch('https://indianfoodvision.onrender.com/predict', {
            method: 'POST',
            body: formData,
            mode: 'cors',
            cache: 'no-store',
          });
        } catch (secondaryErr) {
          console.error('Both primary and fallback fetch attempts failed');
          throw secondaryErr || primaryErr;
        }
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setPredictions({
        predictions: data.predictions.map(([label, probability]) => ({
          label,
          probability,
        })),
        time: data.processing_time.toFixed(3),
      });
    } catch (err) {
      console.error('Classification error:', err && (err.message || err));
      // If it's a network-level failure, provide a specific hint
      const msg = err && err.message && err.message.includes('Failed to fetch')
        ? 'Network error: failed to contact prediction API. Check CORS, network, or server status.'
        : (err.message || 'Failed to classify image');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = async (example) => {
    setImagePreview(example.path);
    try {
      const response = await fetch(example.path);
      if (!response.ok) throw new Error(`Failed to load image: ${response.status}`);
      const blob = await response.blob();
      
      // Extract the actual file extension from the path
      const ext = example.path.split('.').pop();
      const file = new File([blob], `${example.name}.${ext}`, { type: blob.type });
      
      await classifyImage(file);
    } catch (err) {
      console.error('Example image error:', err);
      setError(`Failed to load example: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-6 mb-4">
            <img src="/pizza.png" alt="Food" className="w-20 h-20 object-contain" />
            <h1 className="text-6xl font-bold">Indian Food Vision</h1>
          </div>
          <p className="text-center text-xl text-white/90 mb-8">
            AI-Powered Deep Learning Model for Indian Cuisine Classification
          </p>
          
          {/* Project Details */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <Award className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">80+ Food Classes</h3>
              <p className="text-sm text-white/80">Trained to recognize popular Indian dishes with high accuracy</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <Zap className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Real-Time Detection</h3>
              <p className="text-sm text-white/80">Lightning-fast inference with MobileNetV3 architecture</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
              <Clock className="w-8 h-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Sub-Second Speed</h3>
              <p className="text-sm text-white/80">Get predictions in milliseconds with confidence scores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-1">Check browser console for more details</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Plate with Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-full aspect-square shadow-2xl p-8 relative border-8 border-gray-200">
              {/* Plate design */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-300 m-4"></div>
              <div className="absolute inset-0 rounded-full border-2 border-gray-200 m-8"></div>
              
              {/* Upload area or image */}
              <div className="relative w-full h-full flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Food"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="w-20 h-20 text-orange-400 mb-4" />
                    <p className="text-xl font-semibold text-gray-600">Click to Upload</p>
                    <p className="text-sm text-gray-400 mt-2">Place your food image on the plate</p>
                  </label>
                )}
              </div>

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center m-8">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">Analyzing...</p>
                    <p className="text-xs text-gray-500 mt-2">{warmed ? 'Processing...' : 'Waking up server (first request)...'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Table surface effect */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-5/6 h-8 bg-gradient-to-b from-gray-300/50 to-transparent rounded-full blur-xl"></div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-orange-500" />
                Classification Results
              </h2>

              {!predictions && !isLoading && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-10 h-10 text-orange-500" />
                  </div>
                  <p className="text-gray-500 text-lg">Upload an image to see AI predictions</p>
                  <p className="text-gray-400 text-sm mt-2">Or try one of the examples below</p>
                </div>
              )}

              {predictions && !isLoading && (
                <div className="space-y-6">
                  {/* Top Prediction - Large Card */}
                  <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-6 h-6" />
                        <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Top Prediction</p>
                      </div>
                      <h3 className="text-4xl font-bold mb-4 capitalize">{predictions.predictions[0].label}</h3>
                      
                      <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Confidence</span>
                          <span className="text-2xl font-bold">{(predictions.predictions[0].probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-white h-full rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${predictions.predictions[0].probability * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other Predictions */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">Other Possibilities</h4>
                    <div className="space-y-3">
                      {predictions.predictions.slice(1, 5).map((pred, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800 text-lg capitalize">{pred.label}</span>
                            <span className="text-lg font-bold text-orange-600">
                              {(pred.probability * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-400 to-red-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${pred.probability * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processing Time */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-gray-700">Processing Time</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">{predictions.time}s</span>
                    </div>
                  </div>

                  {/* Clear Button */}
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setPredictions(null);
                      setError(null);
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition-all"
                  >
                    Clear & Try Another
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Example Images Section */}
        <div className="mt-12 bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-xl p-8 border border-orange-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">Try Example Images</h3>
          <p className="text-gray-600 text-center mb-8">Click on any example below to classify it with the AI model</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {exampleImages.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-4 border-white hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={example.path}
                    alt={example.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="text-gray-400 text-center p-4 text-sm">Image not found<br/>${example.name}</div>`;
                    }}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white font-bold text-center text-lg">{example.name}</p>
                </div>
                <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-all duration-300"></div>
              </button>
            ))}
          </div>
          
          
        </div>

        {/* Model Info Footer */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">About This Model</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-bold text-orange-600 mb-3 text-lg">🎯 Model Architecture</h4>
              <p className="text-gray-600 leading-relaxed">
                Built using MobileNetV3 with transfer learning and fine-tuning. The model is optimized for mobile and edge deployment while maintaining high accuracy on 80+ Indian cuisine categories.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-orange-600 mb-3 text-lg">📊 Training Details</h4>
              <p className="text-gray-600 leading-relaxed">
                Trained on thousands of images with data augmentation techniques. Achieved 88% test accuracy after 15 epochs with strategic layer unfreezing for optimal performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}