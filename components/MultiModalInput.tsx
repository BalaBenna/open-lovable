'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Camera, 
  FileText, 
  X, 
  Eye,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  Palette,
  Layout,
  Zap
} from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  analysis?: {
    description: string;
    designElements: string[];
    colors: string[];
    layout: string;
    components: string[];
    accessibility: string[];
  };
  isAnalyzing: boolean;
}

interface MultiModalInputProps {
  onImageAnalysis: (analysis: UploadedImage['analysis'], imageUrl: string) => void;
  onVoiceInput: (transcript: string) => void;
  isListening?: boolean;
  className?: string;
}

const MultiModalInput: React.FC<MultiModalInputProps> = ({
  onImageAnalysis,
  onVoiceInput,
  isListening = false,
  className = ''
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [onVoiceInput]);

  const analyzeImage = async (image: UploadedImage): Promise<UploadedImage['analysis']> => {
    // Simulate AI image analysis
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Mock analysis based on image characteristics
    const mockAnalysis: UploadedImage['analysis'] = {
      description: "Modern landing page with clean design, featuring a hero section with gradient background, navigation bar, and call-to-action buttons. The layout follows contemporary web design principles with good use of whitespace and typography hierarchy.",
      designElements: [
        "Hero section with large heading",
        "Navigation bar with logo and menu items",
        "Gradient background (purple to blue)",
        "Call-to-action buttons with rounded corners",
        "Card-based content layout",
        "Clean typography with sans-serif fonts"
      ],
      colors: [
        "#6366f1", // Indigo
        "#8b5cf6", // Purple  
        "#3b82f6", // Blue
        "#ffffff", // White
        "#f8fafc", // Gray-50
        "#1f2937"  // Gray-800
      ],
      layout: "Single-page layout with header, hero section, features grid, and footer. Mobile-responsive design with breakpoints for tablet and desktop views.",
      components: [
        "Header with navigation",
        "Hero section with CTA",
        "Features grid (3-column)",
        "Testimonials carousel",
        "Pricing cards",
        "Footer with links"
      ],
      accessibility: [
        "Semantic HTML structure",
        "Alt text for images",
        "Proper heading hierarchy (h1, h2, h3)",
        "Focus states for interactive elements",
        "Color contrast compliance",
        "ARIA labels for screen readers"
      ]
    };

    return mockAnalysis;
  };

  const handleImageUpload = useCallback(async (files: FileList) => {
    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const imageId = `img-${Date.now()}-${i}`;
        const imageUrl = URL.createObjectURL(file);
        
        const newImage: UploadedImage = {
          id: imageId,
          file,
          url: imageUrl,
          isAnalyzing: true
        };
        
        newImages.push(newImage);
      }
    }

    setUploadedImages(prev => [...prev, ...newImages]);

    // Analyze each image
    for (const image of newImages) {
      try {
        const analysis = await analyzeImage(image);
        
        setUploadedImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, analysis, isAnalyzing: false }
              : img
          )
        );

        onImageAnalysis(analysis, image.url);
      } catch (error) {
        console.error('Image analysis failed:', error);
        setUploadedImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, isAnalyzing: false }
              : img
          )
        );
      }
    }
  }, [onImageAnalysis]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const startVoiceRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  }, [isRecording]);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const removeImage = useCallback((imageId: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter(img => img.id !== imageId);
    });
  }, []);

  const openImagePreview = useCallback((imageUrl: string) => {
    setShowImagePreview(imageUrl);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          dragOver 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={!recognitionRef.current}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Stop Recording' : 'Voice Input'}
            </button>
          </div>
          
          <div className="text-gray-600">
            <p className="text-sm">Drag & drop images for design analysis</p>
            <p className="text-xs text-gray-500 mt-1">
              Supports JPG, PNG, WebP • Max 10MB per file
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Voice Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <Mic className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-red-700 font-medium">Recording... Speak your request</span>
            <div className="flex gap-1 ml-auto">
              <div className="w-1 h-4 bg-red-400 rounded animate-pulse"></div>
              <div className="w-1 h-6 bg-red-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-3 bg-red-400 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-5 bg-red-400 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Images */}
      <AnimatePresence>
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Design References ({uploadedImages.length})
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              {uploadedImages.map(image => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Image Thumbnail */}
                    <div className="relative">
                      <img
                        src={image.url}
                        alt="Design reference"
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImagePreview(image.url)}
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Analysis Content */}
                    <div className="flex-1 min-w-0">
                      {image.isAnalyzing ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Analyzing design...</span>
                        </div>
                      ) : image.analysis ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Analysis Complete</span>
                          </div>
                          
                          <div className="text-sm text-gray-700">
                            <p>{image.analysis.description}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Colors */}
                            <div>
                              <div className="flex items-center gap-1 mb-2">
                                <Palette className="w-3 h-3 text-purple-500" />
                                <span className="font-medium text-gray-900">Colors</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {image.analysis.colors.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="w-6 h-6 rounded border border-gray-200"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Components */}
                            <div>
                              <div className="flex items-center gap-1 mb-2">
                                <Layout className="w-3 h-3 text-blue-500" />
                                <span className="font-medium text-gray-900">Components</span>
                              </div>
                              <div className="space-y-1">
                                {image.analysis.components.slice(0, 3).map((component, idx) => (
                                  <div key={idx} className="text-gray-600">• {component}</div>
                                ))}
                                {image.analysis.components.length > 3 && (
                                  <div className="text-gray-500">+{image.analysis.components.length - 3} more</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Analysis failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img
                src={showImagePreview}
                alt="Design reference preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setShowImagePreview(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiModalInput;
