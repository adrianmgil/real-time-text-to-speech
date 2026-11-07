import { useEffect, useState } from "react";
import useWakeLock from "react-use-wake-lock";

export function useWindowResize(setWin, contentEditorsRef) {
    const { isSupported: isWakeLockSupported, isLocked: isWakeLocked, request: requestWakeLock } = useWakeLock();
    const [ resize, setResize ] = useState({topHeight: 0, bottomHeight: 0});
  
    const handleReize = (clientY) => {
        const midHeight = contentEditorsRef.current.offsetHeight / 2;
        if ( midHeight < clientY) {
            setResize({topHeight: (clientY - midHeight)*2 + 'px', bottomHeight: 0 });
        }else{
            setResize({topHeight: 0, bottomHeight: (midHeight - clientY)*2 + 'px' });
        }
    }

    useEffect(() => {
        const handleResize = () => { setWin({ innerHeight: window.innerHeight, innerWidth: window.innerWidth }); };

        window.addEventListener("resize", handleResize);

        if (isWakeLockSupported && !isWakeLocked) {
            requestWakeLock();
        }

        return () => {
            window.removeEventListener("resize", handleResize);
        };    
    },[isWakeLockSupported, requestWakeLock, isWakeLocked, setWin])

    return { handleReize, resize };
}