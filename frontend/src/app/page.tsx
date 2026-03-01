"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ThemeToggle from "@/components/ThemeToggle";

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

const STATS = [
  { value: "98%", label: "Match accuracy" },
  { value: "<30s", label: "Pitch analysis" },
  { value: "3x", label: "Faster funding" },
  { value: "500+", label: "Active investors" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "AI-Powered Scoring",
    desc: "Our ML engine evaluates pitch completeness, market viability, and financial projections — generating an actionable quality score in seconds.",
  },
  {
    icon: "🔗",
    title: "Semantic Matching",
    desc: "384-dimensional vector embeddings map your pitch against investor preferences for high-precision, context-aware matching.",
  },
  {
    icon: "🛡️",
    title: "KYC Verification",
    desc: "Automated document verification ensures every participant is authenticated before entering the ecosystem.",
  },
  {
    icon: "📊",
    title: "Live Analytics",
    desc: "Real-time dashboards track pitch performance, investor engagement, view counts, and match quality metrics.",
  },
  {
    icon: "🎙️",
    title: "Audio Summaries",
    desc: "AI-generated voice summaries let investors preview pitches on the go — no reading required.",
  },
  {
    icon: "💬",
    title: "Secure Messaging",
    desc: "Once matched, communicate directly with investors through encrypted, in-platform conversations.",
  },
];

const PLATFORM_FEATURES = [
  {
    title: "For Entrepreneurs",
    subtitle: "Everything you need to get funded",
    items: [
      "Guided multi-step pitch submission wizard",
      "Real-time AI feedback on pitch quality",
      "Document upload with OCR text extraction",
      "Investor match notifications",
      "Progress tracking dashboard",
      "Pitch revision and versioning",
    ],
  },
  {
    title: "For Investors",
    subtitle: "Discover high-quality deal flow",
    items: [
      "AI-curated pitch feed based on preferences",
      "Sector, stage, and amount filters",
      "Pitch quality scores at a glance",
      "Audio pitch previews",
      "Saved pitches and watchlist",
      "Direct messaging with founders",
    ],
  },
  {
    title: "For Administrators",
    subtitle: "Full platform control and oversight",
    items: [
      "User verification and management",
      "Submission review and moderation",
      "AI audit logs and transparency",
      "Platform health monitoring",
      "Role-based access control",
      "Bulk user status management",
    ],
  },
];

const STEPS = [
  {
    step: "01",
    title: "Submit your pitch",
    desc: "Fill out our guided 5-step form covering problem, solution, business model, financials, and supporting documents.",
  },
  {
    step: "02",
    title: "AI analyzes & scores",
    desc: "Our scoring engine evaluates completeness and quality. Low-confidence scores trigger Gemini LLM for deeper qualitative analysis.",
  },
  {
    step: "03",
    title: "Semantic matching",
    desc: "Your pitch embedding is compared against investor preference vectors to find the highest-relevance matches.",
  },
  {
    step: "04",
    title: "Connect & fund",
    desc: "Matched investors review your pitch, listen to audio summaries, and initiate direct conversations to move forward.",
  },
];

const TECH_STACK = [
  { name: "Next.js 16", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "shadcn/ui", category: "Components" },
  { name: "FastAPI", category: "AI Service" },
  { name: "Node.js", category: "Backend" },
  { name: "MongoDB", category: "Database" },
  { name: "Firebase Auth", category: "Authentication" },
  { name: "Gemini API", category: "LLM" },
  { name: "sentence-transformers", category: "Embeddings" },
  { name: "Tesseract OCR", category: "Document AI" },
];

const FAQ = [
  {
    q: "How does the AI scoring work?",
    a: "Our scoring engine analyzes 14 weighted fields across your pitch — from problem statement to financial projections. Each field is scored on completeness and quality. If the overall confidence is below 75%, the pitch is escalated to Google Gemini for deeper qualitative analysis.",
  },
  {
    q: "What is semantic matching?",
    a: "We convert both your pitch text and investor preferences into 384-dimensional vector embeddings using sentence-transformers. Cosine similarity between these vectors identifies the most relevant matches — going beyond simple keyword matching to understand context and intent.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use Firebase Authentication for secure login (including Google SSO), role-based access control for data isolation, and all communications are encrypted. KYC verification ensures every user is authenticated.",
  },
  {
    q: "What does it cost?",
    a: "SEPMS is free to join for both entrepreneurs and investors. Premium features like priority matching and advanced analytics are available on paid tiers.",
  },
  {
    q: "How long does pitch analysis take?",
    a: "The automated scoring engine processes pitches in under 30 seconds. If Gemini LLM deep analysis is triggered, it adds approximately 10–15 seconds. Audio summary generation takes about 5 seconds.",
  },
];

/* ──────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────── */

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  const getDashboardRoute = () => {
    if (user && userProfile?.role) {
      const redirects: Record<string, string> = {
        admin: "/admin/oversight",
        entrepreneur: "/entrepreneur/dashboard",
        investor: "/investor/feed",
      };
      return redirects[userProfile.role] || "/entrepreneur/dashboard";
    }
    return "/sign-in";
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) {
        setNavVisible(true);
      } else if (currentY > lastScrollY.current) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <div className="flex min-h-screen flex-col">
      {/* ─── Floating Navbar ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center md:px-4 md:pt-4">
        <header
          className={`w-full border-b border-border/50 bg-background/80 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 md:max-w-3xl md:rounded-2xl md:border md:shadow-lg md:shadow-black/5 ${navVisible ? "translate-y-0 opacity-100" : "max-md:translate-y-0 max-md:opacity-100 md:-translate-y-[calc(100%+2rem)] md:opacity-0"
            }`}
        >
          <div className="flex h-14 items-center justify-between px-5">
            <a href="/" className="flex items-center gap-2.5 cursor-pointer">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs">
                S
              </div>
              <span className="font-semibold text-sm tracking-tight">SEPMS</span>
            </a>

            <nav className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
              <a href="#platform" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Platform</a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              {user ? (
                <Button size="sm" className="h-8 text-xs ml-2" onClick={() => router.push(getDashboardRoute())}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button size="sm" className="h-8 text-xs" onClick={() => router.push("/sign-up")}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
      </div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] dark:block hidden" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:64px_64px] dark:hidden block" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="relative w-full px-4 sm:px-8 lg:px-16 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-52 lg:pb-40">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium tracking-wide">
              AI-Powered Investment Matching Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
              Where great ideas
              <br />
              meet the right capital
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              SEPMS uses machine learning to score your pitch, verify your documents,
              and semantically match you with investors who align with your vision.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {user ? (
                <Button size="lg" className="h-12 px-8 text-sm font-semibold" onClick={() => router.push(getDashboardRoute())}>
                  Go to my Dashboard
                </Button>
              ) : (
                <>
                  <Button size="lg" className="h-12 px-8 text-sm font-semibold" onClick={() => router.push("/sign-up?role=entrepreneur")}>
                    Start pitching — it&apos;s free
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-semibold" onClick={() => router.push("/sign-up?role=investor")}>
                    I&apos;m an investor
                  </Button>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground/60">
              No credit card required · Free tier available · Setup in 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section id="stats" className="border-y border-border/50">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Features ─── */}
      <section id="features" className="py-20 sm:py-28">
        <div className="w-full px-4 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">Core Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to get funded
            </h2>
            <p className="mt-4 text-muted-foreground">
              From submission to funding, our platform handles the heavy lifting so you can focus on building.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="group border-border/50 bg-background hover:bg-background hover:border-border transition-all duration-300">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Features (3 columns) ─── */}
      <section id="platform" className="border-y border-border/50 py-20 sm:py-28 bg-background">
        <div className="w-full px-4 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">Platform</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for every stakeholder
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three roles, one seamless experience — tailored dashboards for entrepreneurs, investors, and admins.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_FEATURES.map((role) => (
              <Card key={role.title} className="border-border/50 bg-background">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-1">{role.title}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{role.subtitle}</p>
                  <ul className="space-y-3">
                    {role.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 text-primary">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="w-full px-4 sm:px-8 lg:px-16">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">How it works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From pitch to partnership in four steps
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our intelligent pipeline takes your raw pitch and transforms it into a funded opportunity.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                <div className="text-5xl font-bold text-muted-foreground/15 mb-4">{step.step}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-muted-foreground/20 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section className="border-y border-border/50 py-16 bg-background">
        <div className="w-full px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Powered by modern technology
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enterprise-grade stack built for performance, security, and scalability.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech) => (
              <Badge key={tech.name} variant="outline" className="px-4 py-2 text-xs font-medium">
                {tech.name}
                <span className="ml-2 text-muted-foreground font-normal">{tech.category}</span>
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 sm:py-28">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border/50 border rounded-lg px-5 bg-background">
                <AccordionTrigger className="text-left font-medium text-sm py-5 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 sm:py-28 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4">
          <Card className="overflow-hidden border-border/50 bg-background">
            <CardContent className="relative p-8 sm:p-12 lg:p-16 text-center">
              <div className="pointer-events-none absolute inset-0" />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                  Ready to accelerate your funding?
                </h2>
                <p className="mx-auto max-w-lg text-muted-foreground mb-8">
                  Join hundreds of entrepreneurs who&apos;ve already connected with the right investors through AI-powered matching.
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {user ? (
                    <Button size="lg" className="h-12 px-8 font-semibold" onClick={() => router.push(getDashboardRoute())}>
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" className="h-12 px-8 font-semibold" onClick={() => router.push("/sign-up")}>
                        Create free account
                      </Button>
                      <Button size="lg" variant="outline" className="h-12 px-8 font-semibold" onClick={() => router.push("/sign-in")}>
                        Sign in
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 bg-background">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-12 lg:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background font-bold text-xs">
                  S
                </div>
                <span className="font-semibold text-sm">SEPMS</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Smart Entrepreneurial Pitching & Matching System — connecting founders with capital through AI-powered analysis and semantic matching.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5">
                {["AI Scoring", "Semantic Matching", "Document Verification", "Audio Summaries", "Analytics Dashboard"].map((item) => (
                  <li key={item}>
                    <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5">
                {["How it Works", "FAQ", "API Documentation", "System Architecture", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2.5">
                {["About SEPMS", "Contact", "Careers", "Terms of Service", "Cookie Policy"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} SEPMS — Smart Entrepreneurial Pitching & Matching System. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
