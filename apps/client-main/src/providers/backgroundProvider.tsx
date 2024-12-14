"use client"
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { usePathname } from 'next/navigation';

export const BackgroundProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    return (
        <>
            {
                pathname !== "/" ?  
                    <BackgroundGradientAnimation>
                        {children}
                    </BackgroundGradientAnimation>
                :
                <>
                    {children}
                </>
            }
        </>
    )
};