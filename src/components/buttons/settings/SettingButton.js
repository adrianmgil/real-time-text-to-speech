import { ReactComponent as SettingsIcon } from './settings-cog.svg';

function SettingsButton({ onClick }) {

    return (
        <>
          <SettingsIcon onClick={onClick} />
        </>
    );
}

export default SettingsButton;