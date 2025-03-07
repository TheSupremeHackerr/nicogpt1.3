import NicoGPT from "@/components/nico-gpt"
import CreditsDisplay from "@/components/credits-display"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">NicoGPT</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <NicoGPT />
          </div>
          <div className="md:col-span-1">
            <CreditsDisplay />
          </div>
        </div>
      </div>
    </main>
  )
}
