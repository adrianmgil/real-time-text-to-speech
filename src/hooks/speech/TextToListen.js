import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '../../components/settings/settings.hook';
import { SettingEnum } from '../../enum/SwttingEnum';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export function useTextToListen({ isDebugMode, initListen, disabled }) {
    const [savedText, setSavedText] = useLocalStorage(SettingEnum.TRANSCRIPT);
    const [listeningEnabled, setListeningEnabled] = useState(false);
    const {
        transcript,
        listening,
        finalTranscript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        browserSupportsContinuousListening
    } = useSpeechRecognition({clearTranscriptOnListen: false});

    const onStartListen = (async(e) => {
        setListeningEnabled(true);
    });
    const onStopListen = ((e) => {
        setListeningEnabled(false);
    });

    const onTextListenClear = () => {
        setSavedText('')
        resetTranscript();
    };

    const getFullTranscript = useCallback(() => {
        return [savedText, (finalTranscript || transcript)].filter(Boolean).join('<br><br>');
    }, [savedText, transcript, finalTranscript]);

    const saveTranscript = useCallback(() => {
        if (transcript){
            setSavedText(getFullTranscript);
            resetTranscript();
        }
    }, [getFullTranscript, resetTranscript, setSavedText, transcript]);

    useEffect(() => {
        if (!disabled && listeningEnabled && !listening) {
            SpeechRecognition.startListening({ continuous: browserSupportsContinuousListening, interimResults: true, language:'en-US' });
        }
        if ((disabled || !listeningEnabled) && listening) {
            SpeechRecognition.stopListening();
        }
    }, [listeningEnabled, listening, browserSupportsContinuousListening, disabled]);

    useEffect(() => {
        if (finalTranscript) {
            saveTranscript();
        }
    }, [saveTranscript, finalTranscript]);

    useEffect(() => {
        if (initListen && !listeningEnabled) {
            onStartListen();
        }
    },[initListen, listeningEnabled])

    useEffect(() => {
        // const handleVisibilityChange = () => {
        //     if (document.visibilityState === 'hidden') {
        //         saveTranscript();
        //     }
        // };
        
        window.addEventListener('beforeunload', saveTranscript);
        //document.addEventListener('visibilitychange', handleVisibilityChange);
    
        return () => {
            window.removeEventListener('beforeunload', saveTranscript);
            //document.removeEventListener('visibilitychange', handleVisibilityChange);
        };    
    },[saveTranscript])

    return { textToListen: getFullTranscript(), listening, onStartListen, onStopListen, onTextListenClear, isSupport: browserSupportsSpeechRecognition && browserSupportsContinuousListening};
}
