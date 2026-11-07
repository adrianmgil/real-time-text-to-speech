function SpeakingButton({ speaking, onStopSpeaking, onStartSpeaking }) {

    return (
        <>
          {speaking && <button onMouseDown={onStopSpeaking}>Hide Speaking</button>}
          {!speaking && <button onMouseDown={onStartSpeaking}>Show Speaking</button>}
        </>
    );
}

export default SpeakingButton;