import { cn } from "@/lib/utils";

// Pour une image dont le ratio ne correspond pas au conteneur (4/3, 16/9...),
// on centre l'image entière (object-contain) au lieu de la recadrer, et on
// comble les bords avec une copie de l'image agrandie + floutée en fond.
export function BlurredThumbnail({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="relative size-full object-contain" />
    </div>
  );
}
