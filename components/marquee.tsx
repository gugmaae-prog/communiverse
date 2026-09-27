export function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className={`overflow-hidden border-y border-black/10 ${className}`}>
      <div className="animate-marquee flex w-max gap-10 py-4">
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="font-sans text-sm font-medium uppercase tracking-[0.18em]">
            {`// ${item} //`}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ImageMarquee({
  images,
}: {
  images: { src: string; alt: string }[];
}) {
  const row = [...images, ...images];
  return (
    <div className="overflow-hidden">
      <div className="animate-marquee flex w-max gap-3">
        {row.map((image, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${image.src}-${i}`}
            src={image.src}
            alt={i < images.length ? image.alt : ""}
            className="h-44 w-32 object-cover md:h-64 md:w-44"
          />
        ))}
      </div>
    </div>
  );
}
