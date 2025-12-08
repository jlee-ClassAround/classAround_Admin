import Image from "next/image";
import Marquee from "@/components/ui/marquee";

interface MarqueeItem {
  label: string;
}

export function MarqueeSection() {
  const items: MarqueeItem[] = [
    {
      label: "Cojubu Class",
    },
    {
      label: "Coin",
    },
    {
      label: "Stock",
    },
    {
      label: "Real Estate",
    },
    {
      label: "A Powerful Weapon For Success",
    },
  ];

  return (
    <div className="py-8">
      <Marquee className="[--duration:30s]">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-x-4 md:gap-x-8 md:mr-6"
          >
            <span className="text-5xl md:8xl lg:text-[112px] whitespace-nowrap font-clashDisplay text-primary">
              {item.label}
            </span>
            <Image
              src="/marquee/star.svg"
              width={64}
              height={64}
              alt={item.label}
              className="object-contain size-10 md:size-14 lg:size-20"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
