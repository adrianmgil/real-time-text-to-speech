import './index.css';
import { useCallback, useState, useRef } from 'react';
import { useTextToSpeech } from './hooks/speech/TextToSpeech';
import { useTextToListen } from './hooks/speech/TextToListen';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useKeyboardHeight } from 'react-simplikit';
import { useLocalStorage } from './components/settings/settings.hook';
import { useGestures } from './hooks/gestures.hook';
import { useWindowResize } from './hooks/windowresize.hook';
import { SettingEnum } from './enum/SwttingEnum';
import VolumeMeter from './components/volume-meter/VolumeMeter';
import ContentEditor from './components/content-editor/ContentEditor';
import ResizableLine from './components/resizable-line/ResiableLine';
import ListeningButton from './components/buttons/listening/ListeningButton';
import FullScreenButton from './components/buttons/fullscreen/FullScreenButton';
import SettingsButton from './components/buttons/settings/SettingButton';
import SpeakingButton from './components/buttons/speaking/SpeakingButton';
import Settings from './components/settings/Settings';

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const isDebugMode = searchParams.has('debug');
  
  const isDarkTheme = localStorage.getItem(SettingEnum.DARK_THEME);
  const colorHighlight = (localStorage.getItem(SettingEnum.COLOR_HIGHLIGHT) ?? '').replace(/"/g,'');
  const colorText = (localStorage.getItem(SettingEnum.COLOR_TEXT) ?? '').replace(/"/g,'');
  const fontSize = localStorage.getItem(SettingEnum.FONT_SIZE);
  const showSpeaking = localStorage.getItem(SettingEnum.SHOW_SPEAKING) === 'true';
  const showListen = localStorage.getItem(SettingEnum.SHOW_LISTEN) === 'true';
  const initListen = localStorage.getItem(SettingEnum.INIT_LISTEN) === 'true' && showListen;
  const [,setFontSize] = useLocalStorage(SettingEnum.FONT_SIZE);

  const fullScreenHandle = useFullScreenHandle();
  const contentEditorsRef = useRef(null);
  const { textToSpeak, onKeyDown, onBeforeInput, onTextToSpeakClear, onTextToSpeakChange, onBeforePaste, indexLocked } = useTextToSpeech({ isDebugMode });
  const { textToListen, listening, onStartListen, onStopListen, onTextListenClear, isSupport: isListenSupport } = useTextToListen({ isDebugMode, initListen, disabled: !showListen });
  const { keyboardHeight } = useKeyboardHeight();
  const [ win, setWin ] = useState({ innerHeight: window.innerHeight, innerWidth: window.innerWidth });
  const [ startSpeaking, setStartSpeaking ] = useState(showSpeaking);
  const [isSettingsDisplay, setSettingsDisplay] = useState(false);

  const containerStyle = {
    '--keyboardHeight': keyboardHeight + 'px',
    '--windowHeight': win.innerHeight + 'px',
    '--windowWidth': win.innerWidth +'px',
    '--colorHighlight': colorHighlight,
    '--colorText': colorText,
    '--colorTextDefault': '#5bb189',
    '--fontSize': (fontSize ?? 18) + 'px',
    'touchAction': 'none',
  };
  
  const { bind } = useGestures(fontSize, setFontSize, { containsClass: ['textListen','textSpeak']});
  const { handleReize, resize } = useWindowResize(setWin, contentEditorsRef);
  
  const [,setUpdate] = useState({});
  const onSettingsChange = useCallback(()  => {
    setUpdate({});
  },[]);
  
  return (
    <div style={containerStyle} {...bind()}>
      <FullScreen handle={fullScreenHandle} onInput={onTextToSpeakChange} className={`App color-theme-${isDarkTheme === 'true' ? 'dark':'light'}`}>
        <div className='contentEditors' ref={contentEditorsRef}>
          {showListen && <>
            <ContentEditor
              className={`textListen ${listening?'':'invert'}`}
              html={textToListen}
              height={resize.topHeight}
              onClear={onTextListenClear}
              disabled={true}
              components={<VolumeMeter listening={listening} isSupport={isListenSupport} />}
            />
            <ResizableLine onResize={handleReize}/>            
          </>}
          {startSpeaking && <>
            <ContentEditor
              className='textSpeak'
              html={textToSpeak}
              onKeyDown={onKeyDown}
              onBeforeInput={onBeforeInput}
              onChange={onTextToSpeakChange}
              onBeforePaste={onBeforePaste}
              onClear={onTextToSpeakClear}
              height={resize.bottomHeight}
              indexLocked={indexLocked}
            />
          </>}
        </div>
        <div className='bottomBar'>
          <SettingsButton onClick={() => setSettingsDisplay(!isSettingsDisplay)} />
          {isSettingsDisplay && <Settings onChange={onSettingsChange} onClose={() => setSettingsDisplay(false)}/>}
          {showListen &&<ListeningButton listening={listening} onStopListen={onStopListen} onStartListen={onStartListen} />}
          <SpeakingButton speaking={startSpeaking} onStartSpeaking={()=>setStartSpeaking(true)} onStopSpeaking={()=>setStartSpeaking(false)} />
          <FullScreenButton handle={fullScreenHandle} />
        </div>
      </FullScreen>
    </div>
  );
}

export default App;