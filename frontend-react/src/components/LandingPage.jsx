import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* Hero Section - E-commerce Style */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea] text-white pt-20 pb-16 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-semibold mb-8 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            🎉 New Season Collection Now Live
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
            Shop Smarter with
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
              AI-Powered Assistant
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl opacity-95 leading-relaxed max-w-3xl mx-auto mb-12">
            Experience personalized shopping like never before. Get instant recommendations, 
            real-time availability, and exclusive deals—all powered by intelligent AI.
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center mb-16">
            <button 
              onClick={onGetStarted}
              className="px-10 py-5 bg-white text-[#667eea] text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-white/40 transition-all duration-300 hover:-translate-y-1 hover:scale-105 flex items-center gap-3"
            >
              🛍️ Start Shopping Now
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/40 text-white text-lg font-bold rounded-xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              Watch How It Works
            </button>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap gap-8 justify-center items-center opacity-90">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <span className="font-semibold">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">↩️</span>
              <span className="font-semibold">30-Day Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="font-semibold">Secure Checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Discover our curated collections</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '👗', name: "Women's Fashion", color: 'from-pink-500 to-rose-500' },
              { icon: '👔', name: "Men's Fashion", color: 'from-blue-500 to-indigo-500' },
              { icon: '👶', name: 'Kids Wear', color: 'from-yellow-500 to-orange-500' },
              { icon: '👟', name: 'Footwear', color: 'from-purple-500 to-pink-500' },
              { icon: '💍', name: 'Accessories', color: 'from-emerald-500 to-teal-500' },
              { icon: '👜', name: 'Bags & Luggage', color: 'from-amber-500 to-red-500' },
              { icon: '⌚', name: 'Watches', color: 'from-slate-500 to-zinc-500' },
              { icon: '🎽', name: 'Sportswear', color: 'from-cyan-500 to-blue-500' }
            ].map((category, idx) => (
              <button 
                key={idx}
                onClick={onGetStarted}
                className="group relative p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#667eea] transition-colors">{category.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-[#667eea]/10 text-[#667eea] rounded-full text-sm font-bold mb-6">
              🤖 AI-POWERED SHOPPING
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Your Personal Shopping Assistant
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get personalized recommendations, instant answers, and seamless shopping—all powered by advanced AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Smart Recommendations',
                desc: 'AI analyzes your style preferences and suggests products you\'ll love',
                color: 'bg-gradient-to-br from-purple-500 to-indigo-500'
              },
              {
                icon: '💬',
                title: 'Instant Assistance',
                desc: '24/7 AI chat support for product queries, sizing, and availability',
                color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
              },
              {
                icon: '🎁',
                title: 'Exclusive Deals',
                desc: 'Get personalized offers and loyalty rewards based on your shopping',
                color: 'bg-gradient-to-br from-pink-500 to-rose-500'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#667eea] hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '2M+', label: 'Happy Customers', icon: '😊' },
              { number: '50K+', label: 'Products Available', icon: '🛍️' },
              { number: '4.9⭐', label: 'Average Rating', icon: '⭐' },
              { number: '24/7', label: 'AI Support', icon: '🤖' }
            ].map((stat, idx) => (
              <div key={idx} className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-black text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            Start Your Smart Shopping Journey Today
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 leading-relaxed">
            Experience the future of online shopping with AI-powered personalization
          </p>
          <button 
            onClick={onGetStarted}
            className="px-12 py-5 bg-white text-[#667eea] text-xl font-bold rounded-xl hover:shadow-2xl hover:shadow-white/40 transition-all duration-300 hover:-translate-y-1 hover:scale-105 inline-flex items-center gap-3"
          >
            🚀 Launch AI Shopping Assistant
          </button>
          <p className="mt-6 text-sm opacity-75">No credit card required • Free to start</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-[#667eea] text-xl font-black">R</span>
                </div>
                <span className="text-2xl font-black text-white">RETAIL AI</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered retail intelligence platform transforming customer experiences worldwide.
              </p>
            </div>
            
            {[
              {
                title: 'Platform',
                links: ['Features', 'Pricing', 'Integrations', 'API']
              },
              {
                title: 'Solutions',
                links: ['Fashion', 'Electronics', 'Grocery', 'Enterprise']
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Blog', 'Contact']
              }
            ].map((column, idx) => (
              <div key={idx}>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href={`#${link.toLowerCase()}`} className="hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-wrap justify-between items-center gap-4">
            <p className="text-sm">© 2025 RETAIL AI. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Security'].map((item, i) => (
                <a key={i} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-white transition-colors text-sm">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
