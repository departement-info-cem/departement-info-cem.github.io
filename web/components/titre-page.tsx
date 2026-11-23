// Bandeau de titre en haut de chaque page.
export function TitrePage({ titre, sousTitre, children }: { titre: string; sousTitre?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b bg-secondary/60">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="mb-3 h-1 w-16 rounded bg-cem-vert" />
        <h1 className="text-3xl font-bold md:text-4xl">{titre}</h1>
        {sousTitre && <p className="mt-2 max-w-3xl text-lg text-muted-foreground">{sousTitre}</p>}
        {children}
      </div>
    </section>
  );
}

export function Conteneur({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 py-8 ${className}`}>{children}</div>;
}
