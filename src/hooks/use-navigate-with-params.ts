import { useRouter, useSearchParams } from "next/navigation";

export function useNavigateWithParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateWithParams = (url: string) => {
    const params = new URLSearchParams(searchParams);

    try {
      const newUrl = new URL(url, window.location.origin);
      const newPath = newUrl.pathname;
      const newSearchParams = newUrl.searchParams;

      for (const [key, value] of newSearchParams.entries()) {
        params.set(key, value);
      }

      router.push(`${newPath}?${params.toString()}`);
    } catch {
      router.push(url);
    }
  };

  return navigateWithParams;
}
