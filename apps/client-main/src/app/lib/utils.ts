import { twMerge } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';
import { getSession } from '@nonrml/configs';
import { redirect } from 'next/navigation';

export function classMerge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const redirectToHomeIfNotLoggedIn = async () => {
  const session = await getSession();
  if(!session) {
    redirect("/")
  }
}