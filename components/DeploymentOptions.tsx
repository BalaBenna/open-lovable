'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Zap, 
  Github, 
  GitBranch,
  Server,
  Cloud,
  Rocket,
  Settings,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Download,
  Share2,
  Lock,
  Gauge
} from 'lucide-react';

interface DeploymentProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  pricing: 'free' | 'paid' | 'freemium';
  deployTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  customDomain: boolean;
  ssl: boolean;
  analytics: boolean;
  color: string;
}

interface DeploymentOptionsProps {
  projectName: string;
  onDeploy: (provider: DeploymentProvider, config: any) => void;
  onClose: () => void;
  className?: string;
}

const deploymentProviders: DeploymentProvider[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deploy instantly with zero configuration. Perfect for React apps.',
    icon: <Zap className="w-6 h-6" />,
    features: ['Instant Deploy', 'Custom Domains', 'Edge Functions', 'Analytics', 'Preview URLs'],
    pricing: 'freemium',
    deployTime: '30 seconds',
    difficulty: 'easy',
    customDomain: true,
    ssl: true,
    analytics: true,
    color: 'from-black to-gray-800'
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'All-in-one platform for automating modern web projects.',
    icon: <Globe className="w-6 h-6" />,
    features: ['Continuous Deploy', 'Form Handling', 'Split Testing', 'Identity', 'Functions'],
    pricing: 'freemium',
    deployTime: '1-2 minutes',
    difficulty: 'easy',
    customDomain: true,
    ssl: true,
    analytics: true,
    color: 'from-teal-500 to-cyan-600'
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    description: 'Free hosting directly from your GitHub repository.',
    icon: <Github className="w-6 h-6" />,
    features: ['Free Hosting', 'GitHub Integration', 'Custom Domains', 'Jekyll Support', 'HTTPS'],
    pricing: 'free',
    deployTime: '2-5 minutes',
    difficulty: 'medium',
    customDomain: true,
    ssl: true,
    analytics: false,
    color: 'from-gray-800 to-gray-900'
  },
  {
    id: 'firebase',
    name: 'Firebase Hosting',
    description: 'Fast and secure web hosting backed by Google.',
    icon: <Cloud className="w-6 h-6" />,
    features: ['Global CDN', 'SSL Certificate', 'Custom Domains', 'Rollback', 'Preview Channels'],
    pricing: 'freemium',
    deployTime: '1-3 minutes',
    difficulty: 'medium',
    customDomain: true,
    ssl: true,
    analytics: true,
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'aws-amplify',
    name: 'AWS Amplify',
    description: 'Full-stack development platform with hosting and backend services.',
    icon: <Server className="w-6 h-6" />,
    features: ['Full-Stack', 'CI/CD', 'Custom Domains', 'Monitoring', 'Backend Integration'],
    pricing: 'paid',
    deployTime: '3-5 minutes',
    difficulty: 'hard',
    customDomain: true,
    ssl: true,
    analytics: true,
    color: 'from-orange-600 to-orange-700'
  },
  {
    id: 'surge',
    name: 'Surge.sh',
    description: 'Simple, single-command web publishing for front-end developers.',
    icon: <Rocket className="w-6 h-6" />,
    features: ['CLI Deploy', 'Custom Domains', 'SSL', 'Teardown', 'Collaboration'],
    pricing: 'freemium',
    deployTime: '10-30 seconds',
    difficulty: 'easy',
    customDomain: true,
    ssl: true,
    analytics: false,
    color: 'from-green-500 to-green-600'
  }
];

const DeploymentOptions: React.FC<DeploymentOptionsProps> = ({
  projectName,
  onDeploy,
  onClose,
  className = ''
}) => {
  const [selectedProvider, setSelectedProvider] = useState<DeploymentProvider | null>(null);
  const [deploymentConfig, setDeploymentConfig] = useState({
    projectName: projectName || 'my-lovable-app',
    customDomain: '',
    envVars: [] as { key: string; value: string }[],
    buildCommand: 'npm run build',
    outputDir: 'dist',
    nodeVersion: '18'
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');

  const handleDeploy = async () => {
    if (!selectedProvider) return;

    setIsDeploying(true);
    setDeploymentStatus('deploying');

    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      onDeploy(selectedProvider, deploymentConfig);
      setDeploymentStatus('success');
    } catch (error) {
      setDeploymentStatus('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const addEnvVar = () => {
    setDeploymentConfig(prev => ({
      ...prev,
      envVars: [...prev.envVars, { key: '', value: '' }]
    }));
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    setDeploymentConfig(prev => ({
      ...prev,
      envVars: prev.envVars.map((env, i) => 
        i === index ? { ...env, [field]: value } : env
      )
    }));
  };

  const removeEnvVar = (index: number) => {
    setDeploymentConfig(prev => ({
      ...prev,
      envVars: prev.envVars.filter((_, i) => i !== index)
    }));
  };

  const getPricingBadge = (pricing: DeploymentProvider['pricing']) => {
    switch (pricing) {
      case 'free':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Free</span>;
      case 'paid':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Paid</span>;
      case 'freemium':
        return <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Freemium</span>;
    }
  };

  const getDifficultyColor = (difficulty: DeploymentProvider['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Deploy Your App</h2>
                <p className="text-gray-600">Choose a platform to deploy "{projectName}"</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Providers List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Deployment Providers</h3>
              <div className="space-y-3">
                {deploymentProviders.map(provider => (
                  <motion.div
                    key={provider.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProvider?.id === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${provider.color} rounded-lg flex items-center justify-center text-white`}>
                        {provider.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                          {getPricingBadge(provider.pricing)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{provider.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            <span>{provider.deployTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Settings className="w-3 h-3" />
                            <span className={getDifficultyColor(provider.difficulty)}>
                              {provider.difficulty}
                            </span>
                          </div>
                          {provider.customDomain && <Lock className="w-3 h-3 text-green-500" />}
                          {provider.ssl && <CheckCircle className="w-3 h-3 text-green-500" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="w-1/2 overflow-y-auto">
            {selectedProvider ? (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 bg-gradient-to-br ${selectedProvider.color} rounded-lg flex items-center justify-center text-white`}>
                    {selectedProvider.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedProvider.name}</h3>
                    <p className="text-sm text-gray-600">Configure your deployment</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Features Included</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedProvider.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configuration Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={deploymentConfig.projectName}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, projectName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {selectedProvider.customDomain && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Domain (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="example.com"
                        value={deploymentConfig.customDomain}
                        onChange={(e) => setDeploymentConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Build Command
                      </label>
                      <input
                        type="text"
                        value={deploymentConfig.buildCommand}
                        onChange={(e) => setDeploymentConfig(prev => ({ ...prev, buildCommand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Output Directory
                      </label>
                      <input
                        type="text"
                        value={deploymentConfig.outputDir}
                        onChange={(e) => setDeploymentConfig(prev => ({ ...prev, outputDir: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Environment Variables
                      </label>
                      <button
                        onClick={addEnvVar}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add Variable
                      </button>
                    </div>
                    <div className="space-y-2">
                      {deploymentConfig.envVars.map((env, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="KEY"
                            value={env.key}
                            onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="value"
                            value={env.value}
                            onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => removeEnvVar(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Deployment Status */}
                <AnimatePresence>
                  {deploymentStatus !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`mt-6 p-4 rounded-lg ${
                        deploymentStatus === 'success' 
                          ? 'bg-green-50 border border-green-200'
                          : deploymentStatus === 'error'
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {deploymentStatus === 'deploying' && (
                          <>
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-blue-700">Deploying your app...</span>
                          </>
                        )}
                        {deploymentStatus === 'success' && (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <span className="text-green-700 font-medium">Deployment successful!</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-green-600">https://{deploymentConfig.projectName}.vercel.app</span>
                                <button className="text-green-600 hover:text-green-700">
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button className="text-green-600 hover:text-green-700">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                        {deploymentStatus === 'error' && (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-700">Deployment failed. Please try again.</span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Deploy Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying || deploymentStatus === 'success'}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      deploymentStatus === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                    }`}
                  >
                    {isDeploying ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deploying...</span>
                      </div>
                    ) : deploymentStatus === 'success' ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Deployed Successfully</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Rocket className="w-5 h-5" />
                        <span>Deploy to {selectedProvider.name}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Provider</h3>
                  <p className="text-sm">Choose a deployment provider to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeploymentOptions;
