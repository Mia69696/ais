import ParticleCanvas from './components/ParticleCanvas';
import Nav from './components/Nav';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import VideoModes from './components/VideoModes';
import Features from './components/Features';
import AutoClipper from './components/AutoClipper';
import HowItWorks from './components/HowItWorks';
import VideoDemo from './components/VideoDemo';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="relative min-h-screen">
      {/* Background layers */}
      <div className="gradient-bg" />
      <div className="grid-overlay" />
      <ParticleCanvas />

      {/* Modals (always mounted, shown via store state) */}
      <AuthModal />
      <Dashboard />

      {/* Content */}
      <div className="relative z-10">
        <Nav />
        <Hero />
        <StatsBar />
        <VideoModes />
        <Features />
        <AutoClipper />
        <HowItWorks />
        <VideoDemo />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
