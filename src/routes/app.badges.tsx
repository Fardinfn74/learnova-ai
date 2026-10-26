import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listBadges } from "@/lib/learnova.functions";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/app/badges")({ component: BadgesPage });

function BadgesPage() {
  const fn = useServerFn(listBadges);
  const { data: badges } = useQuery({ queryKey: ["badges"], queryFn: () => fn() });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow"><Trophy className="h-6 w-6"/></div>
        <h1 className="text-2xl font-bold">Your badges</h1>
      </div>
      {!badges?.length && (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-muted-foreground">No badges yet. Keep learning to unlock achievements! 🏆</p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {badges?.map(b => (
          <div key={b.id} className="glass rounded-2xl p-6 text-center shadow-glow hover:scale-105 transition">
            <div className="text-6xl mb-2">{b.icon}</div>
            <div className="font-bold">{b.name}</div>
            <div className="text-sm text-muted-foreground mt-1">{b.description}</div>
            <div className="text-xs text-muted-foreground mt-3">Earned {new Date(b.earned_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
