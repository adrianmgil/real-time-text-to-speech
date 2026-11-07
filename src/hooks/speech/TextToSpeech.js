import { useState, useRef, useMemo } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import './speech.css';

export function useTextToSpeech({ isDebugMode }) {

    const [textToSpeak, setTextToSpeak] = useState('');
    const { speak, speaking, voices } = useSpeechSynthesis({onEnd: () => { onSpeakStopped(); }});
    const data = useMemo(() => { return { text: '', index: 0, timestamp:[] }}, []);
    const speakDelay = +localStorage.getItem('speakDelay') * 1000;
    const langSepak = voices.find(v => v.name === localStorage.getItem('voice')) ?? voices.find(v => v.lang.includes('en-US'));
    const speakDelayTimer = useRef(null);
    const maxWords = 5;
    const delimiters = useMemo(() => /[.?!]( +)|[.?!]&nbsp;|[.?!]$/gmi, []);

    const log = (message) => { if (isDebugMode) { console.log(JSON.parse(JSON.stringify(message))); }};

    const findEndIndexByTimestamp = () => {
        if (data.timestamp.length === 0) { return data.text.length; }

        let index = -1;
        while (data.timestamp.length > 0 && data.timestamp[0].datetime < new Date()) {
            const timestamp = data.timestamp.shift();
            index = timestamp.index;
        }

        if (speaking && index === -1 && data.timestamp.length > 0) {
            setTimeout(() => startSpeak('-'), 300);
        }

        return index;
    }

    const getShortTextToSpeak = () => {
        const lastIndex = findEndIndexByTimestamp();
        if (lastIndex === -1 || !data.text) return null;
        while (data.text[data.index] === ' ') { data.index++; }
        const text = (data.text ?? '').substring(data.index, lastIndex);
        const indexDelimiter = text.search(delimiters);
        const words = text.substring(0, indexDelimiter === -1 ? text.length : indexDelimiter+1).split(' ');
        const minWords = words.length !== 1 && words.length > maxWords ? maxWords -1 : maxWords;
        const shortText = words.slice(0, minWords).join(' ').trim();
        return shortText;
    };

    const setHighlight = (text) => {
        const textBefore = data.text.substring(0, data.index);
        const textAfter = data.text.substring(data.index);
        const textReplace = `<span class='text-highlight'>${text}</span>`;
        const newText = textBefore + textAfter.replace(text, textReplace);
        setTextToSpeak(newText);
    };

    const getPlainText = (htmlString) => {
        const temp = document.createElement('div');
        htmlString = htmlString.replace(/<div>/g,'\n');
        temp.innerHTML = htmlString;
        return (temp.innerText || temp.innerText || '');
    }

    const clearHighlight = () => {
        if (data.text) {            
            data.text = getPlainText(data.text);
            setTextToSpeak(data.text);
        }
    };

    const startSpeak = (startChar = '') => {
        clearHighlight();

        const speakText = getShortTextToSpeak();

        if (speakText) {
            const tempSpeakText = speakText.replace(/[.,?!]/g,'').replace(/&nbsp;/g,' ').trim();
            setHighlight(speakText);
            if (tempSpeakText) {
                log(startChar + '[' + tempSpeakText + ']');
            }
            speak({text: tempSpeakText, voice: langSepak, rate: 1.0});
            data.index += speakText.length;
        }
    };

    const onSpeakStopped = () => {
        startSpeak('*');
    };

    const onTextToSpeakClear = (e) => {
        data.text = '';
        data.index = 0;
        setTextToSpeak('');
        e.preventDefault();
    };

    const startSpeakDelayTimeout = () => {
        if (!speakDelayTimer.current) {
            speakDelayTimer.current = setTimeout(() => {
                stopTimeout(speakDelayTimer);
                if (speaking) {
                    const plainText = getPlainText(data.text);
                    data.timestamp.push({ index: plainText.length, datetime: new Date(Date.now() + speakDelay)});
                    log(data.timestamp);
                }
                startSpeak('^');
            }, speakDelay);
        }
    }

    const stopTimeout = (timer) => {
        clearTimeout(timer.current);
        timer.current = null;
    }

    const onChange = (e) => {
        data.text = e.target.value || e.target.innerText;
        setTextToSpeak(data.text);
        startSpeakDelayTimeout();
   };

    return { textToSpeak, onTextToSpeakChange: onChange, onTextToSpeakClear, indexLocked: data.index };
}