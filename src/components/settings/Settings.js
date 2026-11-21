import './settings.css';
import { useLocalStorage } from './settings.hook';
import { Slider, Switch, ColorPicker } from 'antd';
import { useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { SettingEnum } from '../../enum/SwttingEnum';

export const fontSizeMin = 14;
export const fontSizeMax = 30;
export const fontSizeInterval = 4;
  
function Settings({ onClose, onChange }) {

  const defaultFontSize = 18;
  const defaultLanguage = 'en-US'
  const minDelaySpeak = 5;
  const maxDelaySpeak = 12;
  const marksSpeakDelay = {}; for (let i = minDelaySpeak; i <= maxDelaySpeak; i++) { marksSpeakDelay[`${i}`] = { label:`${i}`}; }
  const marksFontSize = {}; for (let i = fontSizeMin; i <= fontSizeMax; i+=fontSizeInterval) { marksFontSize[`${i}`] = { label:`${i}`}; }

  const { voices } = useSpeechSynthesis();
  const [ darkTheme, setDarkTheme ] = useLocalStorage(SettingEnum.DARK_THEME, true);
  const [ speakDelay, setSpeakDelay ] = useLocalStorage(SettingEnum.SPEAK_DELAY, Math.round((maxDelaySpeak - minDelaySpeak)/2));
  const [ colorHighlight, setColorHighlight ] = useLocalStorage(SettingEnum.COLOR_HIGHLIGHT, '#FFFFB0');
  const [ colorText, setColorText ] = useLocalStorage(SettingEnum.COLOR_TEXT, '#00FF88');
  const [ voice, setVoice ] = useLocalStorage(SettingEnum.VOICE, defaultLanguage);
  const [ fontSize, setFontSize ] = useLocalStorage(SettingEnum.FONT_SIZE, defaultFontSize);
  const [ InitListen, setInitListen ] = useLocalStorage(SettingEnum.INIT_LISTEN, false);
  const [ showListen, setShowListen ] = useLocalStorage(SettingEnum.SHOW_LISTEN, true);
  const [ showSpeaking, setShowSpeaking ] = useLocalStorage(SettingEnum.SHOW_SPEAKING, true);
  
  useEffect(()  => {
    onChange();
  },[onChange, darkTheme, colorHighlight, colorText, voice, speakDelay, fontSize, showListen]);

  const Field = (component, label) => {
    return <div className={'fieldRow'}><label>{label ? `${label}:`:``}</label><div className={'component'}>{component}</div></div>
  }
  
  const SelectVoice = () => {
    return (
      <select id='selectVoice' className='settings-select' defaultChecked={voice} onChange={(e) => setVoice(e.target.value)}>
        {voices.filter(x => x.lang === defaultLanguage || x.lang === defaultLanguage.replace('-','_')).map((voice, index) => (
          <option key={index} value={voice.name}>{voice.name}</option>
        ))}
      </select>
    )
  }

  const SwitchField = (title, component, leftlabel, rightLabel) => {
      return Field(<div><label>{leftlabel}</label>&nbsp;{component}&nbsp;<label>{rightLabel}</label></div>, title);
  }

  const SampleHighlightText = () => {
    return <div className='sample-text'>The <span className='text-highlight'>highlight speaking text</span> sample</div>;
  };

  return (
    <div className='settings'>
      <div>
        {SwitchField('Theme', <Switch defaultValue={darkTheme} onChange={setDarkTheme} />, 'Light', 'Dark')}
        {SwitchField('Listening', <Switch defaultValue={showListen} onChange={setShowListen} />, 'Hide', 'Show')}
        {SwitchField('Initial Listening', <Switch defaultValue={InitListen} onChange={setInitListen} />, 'Disabled', 'Enabled')}
        {SwitchField('Initial Speaking', <Switch defaultValue={showSpeaking} onChange={setShowSpeaking} />, 'Disabled', 'Enabled')}
        {Field(<Slider min={minDelaySpeak} max={maxDelaySpeak} marks={marksSpeakDelay} included={false} defaultValue={speakDelay} onChange={setSpeakDelay} />, 'Speak Delay (sec)')}
        {Field(SelectVoice(), 'Voice')}
        {Field(<ColorPicker value={colorHighlight} onChange={(c) => setColorHighlight(c.toHexString())}/>, 'Highlight Color')}
        {Field(<ColorPicker value={colorText} onChange={(c) => setColorText(c.toHexString())}/>, 'Color')}
        {Field(<Slider min={fontSizeMin} max={fontSizeMax} marks={marksFontSize} included={false} defaultValue={fontSize} onChange={setFontSize}/>, 'Font Size')}
        {Field(SampleHighlightText())}
        <button onClick={onClose} className='settings-buttonClose'>Close</button>
      </div>
    </div>
  );
}

export default Settings;