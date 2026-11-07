import { useEffect, useRef } from 'react';
import useVolumeMeter from './volume-meter.hook';

function VolumeMeter({ listening, isSupport }) {
    const { level, setIsListening } = useVolumeMeter();
    const containerRef = useRef(null);

    useEffect(() => {
        if (isSupport) {
            setIsListening(listening);
        }
    },[listening, setIsListening, isSupport])

    const clientHeight = containerRef.current && listening ? containerRef.current.getBoundingClientRect().bottom : 0;
    const height = clientHeight * level * 0.01;

    return (
        <div ref={containerRef} style={{ position: 'absolute', bottom:'2px', left: '1px' }}>
            <div style={{ backgroundColor: 'var(--colorText)', width:'3px', height: height + 'px' }}></div>
        </div>
    );
}

export default VolumeMeter;