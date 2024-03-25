import { Features } from "./components/features";
import { Hero } from "./components/hero";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <div className="h-40"></div>
    </main>
  );
}
