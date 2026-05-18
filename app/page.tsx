import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, BarChart3, Globe } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Read the Qur'an",
    description:
      "Access the full Qur'an with translations and audio recitations directly within the dashboard.",
  },
  {
    icon: Shield,
    title: "Block Distracting Sites",
    description:
      "Add websites you want to avoid. When you try to visit them, you'll be guided to reflect instead.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description:
      "Monitor your engagement, verses read, and how often you stayed on track throughout your day.",
  },
  {
    icon: Globe,
    title: "Chrome Extension",
    description:
      "Works seamlessly with the Quran Discipline Chrome Extension to keep you mindful while browsing.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">
            Quran Discipline
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Button asChild size="sm">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <div className="inline-flex items-center gap-2 text-primary text-sm font-medium border border-primary/20 bg-primary/5 rounded-full px-4 py-1.5">
          <BookOpen className="w-4 h-4" />
          Qur'an-based discipline
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Stay focused. Reflect deeper.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
          Quran Discipline helps you block distracting websites and replace idle
          browsing with meaningful Qur'an reflection — one verse at a time.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/privacy-policy">Privacy Policy</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-semibold text-center mb-12">
            Everything you need to stay disciplined
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="shrink-0 mt-1 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center gap-5">
          <h2 className="text-2xl font-semibold">Ready to get started?</h2>
          <p className="text-muted-foreground max-w-md">
            Open your dashboard to manage blocked sites, read Qur'an, and track
            your progress.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()} Quran Discipline. All rights reserved.
          </span>
          <Link
            href="/privacy-policy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
