import Link from "next/link";
import Image from "next/image";
import AuthNav from "@/components/AuthNav";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Navbar() {
  return (
    <nav className="bg-stone-950 px-6 pt-6 text-stone-100">
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center gap-4">
        {/* Left */}
        <div className="justify-self-start">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.3em] text-amber-500 transition hover:text-amber-400"
          >
            Wideman Leatherworks Forum
          </Link>
        </div>

        {/* Center Logo */}
        <div className="justify-self-center">
          <Link href="/" className="block">
            <Image
              src="/widemanLeatherworksColorLogo.svg"
              alt="Wideman Leatherworks"
              width={150}
              height={150}
              className="h-auto w-[150px]"
              priority
            />
          </Link>
        </div>

        {/* Right */}
        <div className="justify-self-end">
          <div className="flex flex-col items-end gap-2">
            <ThemeSwitcher />
            <AuthNav />
          </div>
        </div>

        <div className="justify-self-end">
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}
