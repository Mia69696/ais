import { Zap } from 'lucide-react';

const links = {
  Product: ['AI Video Engine', 'Video Ranking Tool', 'Voice Cloning', 'Auto-Clipping', 'Brand Kits', 'Pricing'],
  Platform: ['YouTube Shorts', 'TikTok', 'Instagram Reels', 'Story Shorts'],
  Company: ['About', 'Blog', 'Changelog', 'Affiliate Program'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

export default function Footer() {
  return (
    <footer className="section border-t border-purple-900/20 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="font-black text-xl">
                <span className="neon-text">Foufou</span><span className="text-white">.AI</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              The AI video automation platform for creators who want to go viral — without the grind.
            </p>
            <div className="flex gap-3">
              {['🐦', '📘', '📸', '▶️'].map((icon, i) => (
                <div key={i} className="w-9 h-9 glass-card rounded-full flex items-center justify-center text-base cursor-pointer hover:scale-110 transition-transform">
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">{group}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-purple-900/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">
            © 2025 Foufou.AI · The Future of AI Video Automation
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="w-2 h-2 bg-green-400 rounded-full pulse-dot" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
