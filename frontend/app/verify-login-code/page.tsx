import { redirect } from 'next/navigation';

export default function VerifyLoginCodePage() {
  redirect('/?auth=login');
}
