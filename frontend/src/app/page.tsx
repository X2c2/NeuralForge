'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image, 
  Video, 
  Code, 
  MessageCircle, 
  Zap, 
  Users, 
  Share2, 
  Heart, 
  Eye, 
  Download, 
  Upload, 
  Crown, 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  Star, 
  BarChart3, 
  Music, 
  Brain, 
  Rocket, 
  X, 
  Bookmark, 
  MoreHorizontal 
} from 'lucide-react';

interface AITool {
  id: string;
  name: string;
  icon: any;
  color: string;
  desc: string;
  gradient: string;
}

interface Post {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  title: string;
  type: string;
  likes: number;
  views: number;
  shares: number;
  description: string;
  model: string;
  tags: string[];
  timestamp: string;
  gradient: string;
}

export default function NeuralForgeApp() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedTool, setSelectedTool] = useState('chat');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuickShare, setShowQuickShare] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const aiTools: AITool[] = [
    { 
      id: 'chat', 
      name: 'AI Chat', 
      icon: MessageCircle, 
      color: 'blue', 
      desc: 'GPT-4o, Claude 3.7, Gemini', 
      gradient: 'from-blue-500 to-cyan-500' 
    },
    { 
      id: 'image', 
      name: 'Image Gen', 
      icon: Image, 
      color: 'purple', 
      desc: 'DALL-E 3, Midjourney, SD', 
      gradient: 'from-purple-500 to-pink-500' 
    },
    { 
      id: 'video', 
      name: 'Video Gen', 
      icon: Video, 
      color: 'red', 
      desc: 'Sora, RunwayML, Pika', 
      gradient: 'from-red-500 to-orange-500' 
    },
    { 
      id: 'code', 
      name: 'Code Gen', 
      icon: Code, 
      color: 'green', 
      desc: 'GitHub Copilot, DeepSeek', 
      gradient: 'from-green-500 to-emerald-500' 
    },
    { 
      id: 'voice', 
      name: 'Voice Gen', 
      icon: Music, 
      color: 'orange', 
      desc: 'ElevenLabs, Azure Speech', 
      gradient: 'from-orange-500 to-yellow-500' 
    },
    { 
      id: 'analysis', 
      name: 'Data Analysis', 
      icon: BarChart3, 
      color: 'indigo', 
      desc: 'Python, R, SQL generation', 
      gradient: 'from-indigo-500 to-purple-500' 
    }
  ];

  const samplePosts: Post[] = [
    {
      id: 1,
      user: { name: "Sarah Chen", username: "@sarahdesigns", avatar: "SC" },
      title: "AI-Generated Marketing Campaign",
      type: "video",
      likes: 234,
      views: 1520,
      shares: 45,
      description: "Created this entire video campaign using Sora + custom prompts. The AI perfectly captured our brand aesthetic!",
      model: "Sora",
      tags: ["marketing", "video", "ai"],
      timestamp: "2 hours ago",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      id: 2,
      user: { name: "Mike Rodriguez", username: "@codemaster", avatar: "MR" },
      title: "Legal Document Analysis Bot",
      type: "code",
      likes: 189,
      views: 892,
      shares: 23,
      description: "Fine-tuned Claude for contract analysis - achieved 95% accuracy rate! Code and training data included.",
      model: "Claude 3.5",
      tags: ["legal", "nlp", "automation"],
      timestamp: "4 hours ago",
      gradient: "from-green-500 to-teal-500"
    },
    {
      id: 3,
      user: { name: "Emma Watson", username: "@aiartist", avatar: "EW" },
      title: "Cyberpunk City Collection",
      type: "image",
      likes: 445,
      views: 2100,
      shares: 78,
      description: "12-piece cyberpunk cityscape series. Each image tells a story of our digital future.",
      model: "Midjourney v6",
      tags: ["art", "cyberpunk", "concept"],
      timestamp: "6 hours ago",
      gradient: "from-purple-500 to-blue-500"
    }
  ];

  const [currentPosts, setCurrentPosts] = useState(samplePosts);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setNotifications(prev => prev + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowQuickShare(true);
    }, 3000);
  };

  const handleQuickShare = (type: string) => {
    const newPost: Post = {
      id: Date.now(),
      user: { name: "You", username: "@yourname", avatar: "Y" },
      title: `New ${type} creation`,
      type: type,
      likes: 0,
      views: 1,
      shares: 0,
      description: `Just created this amazing ${type} with AI!`,
      model: selectedTool,
      tags: [type, "ai", "creative"],
      timestamp: "just now",
      gradient: aiTools.find(t => t.id === selectedTool)?.gradient || "from-purple-500 to-pink-500"
    };
    
    setCurrentPosts(prev => [newPost, ...prev]);
    setShowQuickShare(false);
  };

  const selectedToolData = aiTools.find(t => t.id === selectedTool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  NeuralForge
                </h1>
                <p className="text-xs text-gray-400">Where AI Creators Unite</p>
              </div>
            </div>
            
            <nav className="flex space-x-6">
              {['workspace', 'community', 'marketplace', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab 
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/25' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-2 rounded-lg border border-yellow-500/30">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 font-medium">Creator</span>
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full cursor-pointer transform hover:scale-110 transition-transform duration-200"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                  AI Tools
                </h3>
                <div className="space-y-3">
                  {aiTools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id)}
                      className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        selectedTool === tool.id
                          ? 'shadow-lg shadow-purple-500/25'
                          : 'hover:shadow-lg hover:shadow-white/10'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                      <div className="relative flex items-center space-x-3 p-3 border border-white/10 group-hover:border-white/20">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${tool.gradient} bg-opacity-20`}>
                          <tool.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-white font-medium">{tool.name}</div>
                          <div className="text-gray-400 text-xs">{tool.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Brain className="w-6 h-6 mr-2 text-purple-400" />
                    AI Workspace
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Rocket className="w-4 h-4 mr-2" />
                          Generate
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="h-96 bg-black/20 rounded-xl border border-white/10 flex flex-col">
                  <div className="p-4 border-b border-white/10">
                    <textarea 
                      className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none"
                      placeholder={`Enter your ${selectedTool === 'image' ? 'image description' : selectedTool === 'video' ? 'video concept' : selectedTool === 'code' ? 'coding request' : 'prompt'}...`}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    {isGenerating ? (
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h4 className="text-white font-medium mb-2">Creating with AI...</h4>
                        <p className="text-gray-400">Using {selectedToolData?.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${selectedToolData?.gradient} rounded-full flex items-center justify-center mx-auto mb-4 opacity-50`}>
                          {selectedToolData && <selectedToolData.icon className="w-8 h-8 text-white" />}
                        </div>
                        <h4 className="text-white font-medium mb-2">Ready to Create</h4>
                        <p className="text-gray-400">Enter a prompt and click Generate</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Community Showcase</h2>
                <p className="text-gray-400">Discover amazing AI creations from our community</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input 
                    className="bg-transparent text-white placeholder-gray-400 outline-none w-32"
                    placeholder="Search..."
                  />
                </div>
                <button className="p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:scale-105">
                  <Upload className="w-5 h-5 inline mr-2" />
                  Share Creation
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPosts.map((post) => (
                <div key={post.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                  <div className={`h-48 bg-gradient-to-br ${post.gradient} relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {post.user.avatar}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{post.user.name}</div>
                          <div className="text-white/70 text-xs">{post.user.username}</div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        post.type === 'video' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        post.type === 'code' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {post.type}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg mb-1">{post.title}</h3>
                      <div className="text-white/80 text-sm">Made with {post.model}</div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-300 text-sm mb-4">{post.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 text-gray-300 rounded-md text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <button className="flex items-center space-x-1 hover:text-red-400 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Bookmark className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-3">{post.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">AI Model Marketplace</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Buy, sell, and share custom AI models with the community. Coming soon with advanced features!</p>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:scale-105">
              <Star className="w-5 h-5 inline mr-2" />
              Join Waitlist
            </button>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Usage Analytics</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Track your AI usage, costs, and performance metrics across all models and providers</p>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:scale-105">
              <BarChart3 className="w-5 h-5 inline mr-2" />
              View Dashboard
            </button>
          </div>
        )}
      </div>

      {showQuickShare && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 flex items-center space-x-4 shadow-2xl">
            <span className="text-white font-medium">🎉 Great creation! Share it:</span>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleQuickShare('image')}
                className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/50 hover:to-pink-500/50 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 border border-purple-500/30"
              >
                <Image className="w-5 h-5 text-purple-300" />
              </button>
              <button 
                onClick={() => handleQuickShare('video')}
                className="w-12 h-12 bg-gradient-to-r from-red-500/30 to-orange-500/30 hover:from-red-500/50 hover:to-orange-500/50 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 border border-red-500/30"
              >
                <Video className="w-5 h-5 text-red-300" />
              </button>
              <button 
                onClick={() => handleQuickShare('code')}
                className="w-12 h-12 bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/50 hover:to-emerald-500/50 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 border border-green-500/30"
              >
                <Code className="w-5 h-5 text-green-300" />
              </button>
              <button 
                onClick={() => handleQuickShare('chat')}
                className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 border border-blue-500/30"
              >
                <MessageCircle className="w-5 h-5 text-blue-300" />
              </button>
              <button 
                onClick={() => setShowQuickShare(false)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 ml-2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-40">
        <button className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-110">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
