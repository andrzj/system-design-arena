import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          System Design Arena &copy; {new Date().getFullYear()}
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/learn" className="text-muted-foreground transition-colors hover:text-foreground">
            Learn
          </Link>
          <Link href="/problems" className="text-muted-foreground transition-colors hover:text-foreground">
            Problems
          </Link>
          <Link href="/auth/sign-in" className="text-muted-foreground transition-colors hover:text-foreground">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
