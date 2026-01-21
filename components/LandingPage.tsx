
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-['Space_Grotesk'] selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md" role="navigation">
        <div className="flex items-center justify-between p-4 h-16 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500 text-2xl" aria-hidden="true">monitoring</span>
            <span className="text-lg font-bold tracking-tight">
              SCULPT<span className="text-indigo-500">AI</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              LOGIN
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all uppercase tracking-widest"
            >
              JOIN ELITE
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative px-4 pt-16 pb-24 overflow-hidden text-center">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-[120px] -z-10" aria-hidden="true"></div>
          
          <div className="space-y-6 max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tighter">
              BUILD AN ELITE FRAME WITH <br/>
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-fill-transparent text-transparent">PROPORTIONAL SCULPTING</span>
            </h1>
            
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
              Master your foundations with AI-driven form coaching and precision ratio tracking. Build a symmetrical, powerful physique from day one.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 pt-6 px-4 max-w-md mx-auto">
              <button 
                onClick={onGetStarted}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all group"
              >
                <span className="material-symbols-outlined">rocket_launch</span>
                START 14-DAY TRIAL
              </button>
              
              <button className="flex-1 bg-white/5 border border-white/10 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">play_circle</span>
                WATCH DEMO
              </button>
            </div>
          </div>
          
          {/* Analytics Card Mockup */}
          <div className="max-w-md mx-auto px-4">
            <article className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
              <div className="flex justify-between items-start mb-8 text-left">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">
                    Sculpt Symmetry Index
                  </p>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter">1.48 : 1</h2>
                </div>
                
                <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  +0.12 Gain
                </div>
              </div>
              
              <div className="relative h-48 w-full flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-40 h-40 rounded-full border-[8px] border-white/10"></div>
                </div>
                <div className="absolute w-40 h-40 rounded-full border-[8px] border-indigo-500 border-t-transparent border-l-transparent rotate-[140deg] shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
                
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Frame Balance</p>
                  <p className="text-3xl font-black italic">88%</p>
                </div>
              </div>
              
              <div className="flex justify-between text-[10px] text-slate-400 border-t border-white/10 pt-6">
                <div className="flex flex-col gap-1 text-left">
                  <span className="font-bold tracking-widest">SHOULDERS</span>
                  <span className="text-white font-black text-lg italic">126.5 <span className="text-[8px] font-normal not-italic">CM</span></span>
                </div>
                
                <div className="flex flex-col gap-1 text-right">
                  <span className="font-bold tracking-widest">WAIST</span>
                  <span className="text-white font-black text-lg italic">78.5 <span className="text-[8px] font-normal not-italic">CM</span></span>
                </div>
              </div>
            </article>
          </div>
        </section>
        
        {/* Problem Section */}
        <section className="px-4 py-24 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 text-center md:text-left">
              Why 90% of Beginners <br/>
              <span className="text-slate-500">Build Imbalanced Frames</span>
            </h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: 'visibility_off', color: 'text-red-400', title: 'Guesswork', text: 'Relying on mirrors alone lead to imbalanced development and hidden weak points.' },
                { icon: 'event_busy', color: 'text-red-400', title: 'Static Plans', text: 'Generic routines don\'t account for your specific skeletal structure or weak links.' },
                { icon: 'warning', color: 'text-red-400', title: 'Poor Form', text: 'Lifting heavy before mastering mechanics is the #1 cause of stunted long-term growth.' }
              ].map((item, idx) => (
                <article key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4 items-start hover:border-indigo-500/30 transition-all group">
                  <div className={`bg-red-500/10 p-2 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats Grid */}
        <section className="px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Form Accuracy', value: '98%', icon: 'verified' },
                { label: 'Sculpt Weeks', value: '12-24', icon: 'calendar_today' },
                { label: 'Pro Data Points', value: '10K+', icon: 'database' },
                { label: 'Golden Ratio', value: '1.618', icon: 'target' }
              ].map((stat, idx) => (
                <div key={idx} className="border border-white/10 rounded-3xl p-8 text-center hover:border-indigo-500/50 transition-all bg-white/[0.01]">
                  <span className="material-symbols-outlined text-indigo-500 mb-2">{stat.icon}</span>
                  <p className="text-3xl font-black italic tracking-tighter text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="px-4 py-24 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" aria-hidden="true"></div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center font-black text-xl border border-indigo-500/30 text-indigo-400 italic">AR</div>
                <div>
                  <h3 className="font-bold text-white">Alex Rivera</h3>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Elite Physique Coach</p>
                </div>
              </div>
              
              <blockquote className="italic text-slate-200 mb-10 leading-relaxed text-xl font-medium">
                "SculptAI has redefined how I onboard beginners. Instead of guessing, my athletes follow data-driven ratios from day one. It's the difference between a workout and a transformation."
              </blockquote>
              
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Baseline</p>
                  <p className="font-black text-2xl italic">1.31</p>
                </div>
                
                <div className="text-indigo-500">
                  <span className="material-symbols-outlined text-3xl">trending_flat</span>
                </div>
                
                <div className="text-center">
                  <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest mb-1">Sculpted</p>
                  <p className="font-black text-2xl text-emerald-400 italic">1.52</p>
                </div>
                
                <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
                  <span className="material-symbols-outlined">insights</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="px-4 py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="bg-indigo-600/10 rounded-[3rem] p-12 border border-indigo-500/20 space-y-8 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none italic uppercase">
                READY TO <br/>
                <span className="text-indigo-500 text-5xl md:text-6xl">TRANSFORM?</span>
              </h2>
              
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                Join 5,000+ beginners building the best frame of their lives with AI-powered guidance.
              </p>
              
              <button 
                onClick={onGetStarted}
                className="w-full bg-indigo-600 h-16 rounded-2xl font-black text-lg uppercase tracking-widest italic shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:scale-[1.02] transition-all"
              >
                START YOUR JOURNEY
              </button>
              
              <div className="flex flex-col items-center gap-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No credit card required • Cancel anytime</p>
                
                <div className="flex gap-6 text-slate-600">
                  <span className="material-symbols-outlined">lock</span>
                  <span className="material-symbols-outlined">shield</span>
                  <span className="material-symbols-outlined">bolt</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-12 text-center border-t border-white/10 text-slate-500 bg-[#0a0f18]">
        <div className="max-w-6xl mx-auto">
          <nav className="flex flex-wrap justify-center gap-8 mb-8">
            {['Pricing', 'Methodology', 'Support', 'Privacy', 'Terms'].map((item) => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">{item}</a>
            ))}
          </nav>
          
          <p className="text-[10px] font-bold tracking-[0.2em] leading-loose">
            © 2024 SCULPTAI ANALYTICS. ALL RIGHTS RESERVED. <br/>
            BUILT FOR ARCHITECTS OF THE PHYSIQUE.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
