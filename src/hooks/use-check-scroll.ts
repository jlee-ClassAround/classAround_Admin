import { useEffect, useState } from "react";

export function useCheckScroll() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const sentinel = document.createElement("div");
    sentinel.style.position = "absolute";
    sentinel.style.top = "0px";
    sentinel.style.height = "1px";
    sentinel.style.width = "1px";
    sentinel.style.visibility = "hidden";
    document.body.appendChild(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  return isScrolled;
}
