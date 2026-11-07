import { ReactComponent as FullScreenIcon } from './fullscreen-alt.svg';
import { isDesktop } from 'react-device-detect';

function FullScreenButton({ handle }) {

    return (
        <div className='buttonFullscreen'>
            {isDesktop && <FullScreenIcon onClick={() => handle.enter()}/>}
            {(!isDesktop && !handle.active) && <FullScreenIcon onMouseDown={(e)=> { handle.enter(); e.preventDefault(); }}/>}
        </div>
    );
}

export default FullScreenButton;