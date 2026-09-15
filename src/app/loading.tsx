import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Affiché instantanément (streaming) pendant que le serveur interroge la base,
// à la place d'une page blanche. Reprend la silhouette du dashboard, la page
// la plus visitée.
export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Chargement">
      <div
        role="progressbar"
        aria-label="Chargement en cours"
        className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15"
      >
        <div className="h-full w-1/3 bg-primary animate-[loading-bar_1.2s_ease-in-out_infinite]" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="ml-auto h-8 w-32" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-5 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>

      {[0, 1].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
