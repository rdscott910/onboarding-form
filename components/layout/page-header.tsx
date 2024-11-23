import Link from 'next/link';
import VirnikaLogoLockup from '@/components/icons/virnika-logo-lockup';

export default function Header() {
  return (
    <header className="flex items-center justify-start text-lg font-semibold mb-8">
      <Link href="/" className="text-primary">
        <VirnikaLogoLockup />
      </Link>
    </header>
  );
}