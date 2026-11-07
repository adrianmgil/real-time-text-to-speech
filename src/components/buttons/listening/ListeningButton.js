function ListeningButton({ listening, onStopListen, onStartListen }) {

    return (
        <>
          {listening && <button onMouseDown={onStopListen}>Stop Listening</button>}
          {!listening && <button onMouseDown={onStartListen}>Start Listening</button>}
        </>
    );
}

export default ListeningButton;