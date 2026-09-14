import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import RafflesSection from '../components/RafflesSection'
import HowItWorks from '../components/HowItWorks'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <RafflesSection />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
