import { AgentChat } from "@/components/AgentChat";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-12 font-sans text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-10 -right-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <main className="relative z-10 flex w-full max-w-4xl flex-col">
        <AgentChat />
      </main>
    </div>
  );
}
