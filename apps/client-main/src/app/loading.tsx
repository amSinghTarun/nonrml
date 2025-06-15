import React from 'react';
import AnimatedLoadingClient from '@/components/LoadingPageAnimation';

export default function Loading({className}: {className?: string}) {
  return <AnimatedLoadingClient className={className}/>;
}