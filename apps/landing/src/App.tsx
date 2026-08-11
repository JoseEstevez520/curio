import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Spot } from './components/Spot';
import { Problem } from './components/Problem';
import { HowItWorks } from './components/HowItWorks';
import { GenUI } from './components/GenUI';
import { Explorable } from './components/Explorable';
import { Principles } from './components/Principles';
import { Thesis } from './components/Thesis';
import { TryIt } from './components/TryIt';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <>
      <Header />
      <Hero />
      <Spot />
      <Problem />
      <HowItWorks />
      <GenUI />
      <Explorable />
      <Principles />
      <Thesis />
      <TryIt />
      <Footer />
    </>
  );
}
