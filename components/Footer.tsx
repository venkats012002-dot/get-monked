export function Footer() {
  return (
    <footer className="w-full text-center py-6 px-4 text-sm text-muted-foreground">
      <p className="mt-2 text-xs font-pt-serif text-[rgba(82,82,82,1)] text-[14px]">
        This page contains AI-generated content. The idea is inspired by{" "}
        <a
          href="https://www.instagram.com/philosophymonkeyofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary transition-colors"
        >
          @philosophymonkeyofficial
        </a>{" "}
        on Instagram. Do give them the love they deserve.
      </p>
    </footer>
  );
}
