
import React from 'react';

const TechnicalBlueprint: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-zinc-950 min-h-full">
      <header className="border-b border-emerald-500/30 pb-6">
        <h2 className="text-2xl font-black italic tracking-tighter">NEXUS <span className="text-emerald-400">BLUEPRINT v1.0</span></h2>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Immutable System Architecture & Logic</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-l-2 border-emerald-400 pl-3">1. HARD-PARTITIONED ARCHITECTURE</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Nexus Sports operates as two physically distinct environments. Minor data is isolated in a separate AWS Local Zone cluster with its own encryption keys. The API gateway performs mandatory age-checks via JWT headers; any cross-environment request triggers an immediate security lockout.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-l-2 border-emerald-400 pl-3">2. ELO MATCHMAKING (MODIFIED)</h3>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 font-mono text-[10px] text-emerald-300">
          Ra' = Ra + 32 * (Sa - (1 / (1 + 10^((Rb - Ra) / 400))))
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Calculated per-sport. Skill levels (1-5) acts as an entry gate, while ELO handles seeding and reward multipliers. Tournament brackets use a standard power-of-two recursive tree structure.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-l-2 border-emerald-400 pl-3">3. THE "GUARDIAN" SAFETY SERVICE</h3>
        <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
          <li>NLP Scanning: Real-time filtering of PII (phone/social handles).</li>
          <li>Mirroring: All minor messages are archived and visible to linked Parent accounts.</li>
          <li>Location Blur: Locations are obfuscated within a 0.5-mile radius until a "Handshake" confirmation.</li>
          <li>White-List Venues: Match creation is limited to OSM-verified public leisure venues.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest border-l-2 border-emerald-400 pl-3">4. TOURNAMENT LOGIC</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Automated 90-day cycles. Eligibility: Within 50-mile radius of the Regional Hub (centroid of local density). Winning requires photo-verification of score boards cross-referenced by opponent reporting.
        </p>
      </section>

      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center">
        <p className="text-[10px] font-black text-emerald-400 tracking-widest uppercase italic">Logic Sealed & Validated</p>
      </div>
    </div>
  );
};

export default TechnicalBlueprint;
