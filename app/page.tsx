import { redirect } from 'next/navigation';

export default function Home() {
  // Simple redirect to login since this is an internal portal
  redirect('/login');
}
