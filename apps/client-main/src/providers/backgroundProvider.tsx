"use client"
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import { usePathname } from 'next/navigation';
// import { useResetRecoilState } from 'recoil';
// import { appbarOpenUtil as appbarOpenUtilAtom } from "../store/atoms";
import { useSetAppbarUtilStore } from "@/store/atoms";

export const BackgroundProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    //console.log("pathName :: ",pathname)
    // const resetRecoilOnReload = useResetRecoilState(appbarOpenUtilAtom);
    const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();

    // // // useEffect(() => {
    //console.log("THE RECOIL STATE ");
    // resetRecoilOnReload();
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