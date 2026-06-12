import Image from "next/image";

/** Bandera del equipo. Usa flagcdn con el codigo ISO; cae a un emoji si no hay. */
export function Flag({ code, name, size = 28 }: { code: string; name: string; size?: number }) {
  const clean = (code || "").toLowerCase();
  if (!clean) {
    return (
      <span style={{ fontSize: size * 0.7 }} aria-label={name}>
        🏳️
      </span>
    );
  }
  const w = Math.round(size);
  const h = Math.round(size * 0.7);
  const cdnH = size >= 56 ? 80 : 40;
  return (
    <Image
      src={`https://flagcdn.com/h${cdnH}/${clean}.png`}
      alt={name}
      width={w}
      height={h}
      className="rounded object-cover shadow-md ring-1 ring-white/20"
      unoptimized
    />
  );
}
