import { usePinch } from "@use-gesture/react";
import { fontSizeMax, fontSizeMin, fontSizeInterval } from '../components/settings/Settings';

export function useGestures(fontSize, setFontSize, containObjects) 
{
    const bind = usePinch(({event, offset: [s]}) => 
    {
        event.preventDefault();

        if (containObjects && containObjects.containsClass && !containObjects.containsClass.some(c => event.target.classList.contains(c))) {
            return;
        }

        setFontSize(Math.round(s) * fontSizeInterval + fontSizeMin);
    }, {
        from: [((fontSize - fontSizeMin + 1)/fontSizeInterval), 0],
        scaleBounds: { min: 0.0, max: (fontSizeMax-fontSizeMin)/fontSizeInterval},
        eventOptions: { passive: false },
    });

    return { bind };
}