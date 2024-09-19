import Link from 'next/link';
import VirnikaLogoLockup from '@/components/icons/virnika-logo-lockup';

export default function Header() {
  return (
    <>
      <header className="flex mx-5 items-center justify-start text-lg font-semibold">
        <Link className="text-primary uppercase text-3xl" href={'/'}>
          <VirnikaLogoLockup />
        </Link>
      </header>
    </>
  );
}