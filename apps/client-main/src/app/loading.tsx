import { BackgroundProvider } from "@/providers/backgroundProvider";
import { Backdrop } from '@mui/material';
import Image from "next/image";
import logo from "@/images/logo.jpg"

export default function Loading() {
    return (
        <BackgroundProvider>
            <Backdrop open={true} className='bg-transparent'>
                <Image
                    src={logo}
                    alt="No NRML logo"
                    priority
                    width={0} height={0} 
                    sizes="100vw" 
                    style={{ color:"white",width: 'auto', height: "100px"}}
                    className="animate-bounce"
                ></Image>
            </Backdrop>
        </BackgroundProvider>
    )
}