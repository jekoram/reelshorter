"use client"

import { useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { useSession } from "next-auth/react"
import { Cloud, ArrowLeftRight, Clock, BarChart3, Shield } from "lucide-react"
import { SiInstagram, SiYoutube } from "react-icons/si"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { GlassCard } from "@/components/ui/card"
import { GradientButton } from "@/components/ui/button"

// ── Floating Orbs (background decoration) ──

const ORBS = [
  { size: 280, top: "5%", left: "10%", duration: 10, yOffset: 30 },
  { size: 200, top: "15%", right: "8%", duration: 12, yOffset: -25 },
  { size: 150, top: "40%", left: "5%", duration: 14, yOffset: 35 },
  { size: 120, top: "55%", right: "15%", duration: 9, yOffset: -20 },
  { size: 250, top: "70%", left: "20%", duration: 11, yOffset: 40 },
  { size: 180, top: "80%", right: "5%", duration: 13, yOffset: -30 },
  { size: 100, top: "30%", left: "50%", duration: 15, yOffset: 25 },
]

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent)",
            filter: "blur(60px)",
          }}
          animate={{ y: [0, orb.yOffset, 0] }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// ── Hero Section ──

function HeroSection() {
  return (
    <section className="text-center max-w-4xl mx-auto px-4 pt-6 mb-12">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
        Upload Once, Share Everywhere
      </h1>
      <p className="text-base md:text-lg text-white/70 mt-4">
        Instantly publish your videos to Reels &amp; Shorts simultaneously
      </p>
    </section>
  )
}

// ── Upload Section (demo-only dropzone) ──

function UploadSection() {
  const { data: session } = useSession()
  const router = useRouter()

  const onDrop = useCallback(() => {
    router.push(session ? "/dashboard" : "/signup")
  }, [session, router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: false,
    accept: { "video/*": [".mp4", ".mov", ".webm"] },
  })

  return (
    <section className="max-w-xl mx-auto w-full px-4 mb-10">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl backdrop-blur-sm px-12 py-10 flex items-center gap-4 cursor-pointer transition-colors ${
          isDragActive
            ? "border-white/60 bg-white/10"
            : "border-white/30 bg-white/5 hover:border-white/50"
        }`}
      >
        <input {...getInputProps()} />
        <Cloud className="w-10 h-10 text-white/50 shrink-0" />
        <div>
          <p className="text-base text-white/80 font-medium">
            Drag &amp; Drop Your Video Here
          </p>
          <p className="text-sm text-white/50">or Click to Upload</p>
        </div>
      </div>
    </section>
  )
}

// ── Platform Section (Instagram <-> YouTube) ──

function PlatformSection() {
  return (
    <section className="flex items-center justify-center gap-4 mb-12">
      {/* Instagram */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
        <SiInstagram className="w-6 h-6 text-white" />
      </div>

      <ArrowLeftRight className="w-6 h-6 text-white/40" />

      {/* YouTube */}
      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
        <SiYoutube className="w-6 h-6 text-white" />
      </div>
    </section>
  )
}

// ── Features Section ──

const FEATURES = [
  {
    icon: Clock,
    title: "Save Time.",
    description: "Automate your workflow",
  },
  {
    icon: BarChart3,
    title: "Reach Wider Audiences",
    description: "Maximize your views",
  },
  {
    icon: Shield,
    title: "Easy & Secure",
    description: "Your content you safe",
  },
]

function FeaturesSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto px-4 mb-10">
      {FEATURES.map(({ icon: Icon, title, description }) => (
        <GlassCard key={title} className="p-6 text-center" hover>
          <div className="mx-auto mb-4 bg-white/10 rounded-xl w-12 h-12 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-white mt-3">{title}</h3>
          <p className="text-xs text-white/60 mt-1">{description}</p>
        </GlassCard>
      ))}
    </section>
  )
}

// ── CTA Section ──

function CTASection() {
  const { data: session } = useSession()

  return (
    <section className="text-center mb-10">
      <Link href={session ? "/dashboard" : "/signup"}>
        <GradientButton>
          {session ? "GO TO DASHBOARD" : "GET STARTED FOR FREE"}
        </GradientButton>
      </Link>
    </section>
  )
}

// ── Landing Page ──

export default function LandingPage() {
  return (
    <div className="page-bg relative overflow-hidden">
      <FloatingOrbs />
      <div className="relative z-10">
        <Header />
        <main className="flex flex-col items-center">
          <HeroSection />
          <UploadSection />
          <PlatformSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  )
}
