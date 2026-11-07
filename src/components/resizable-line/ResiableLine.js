import './ResizableLine.css'

function ResizableLine({ onResize, ref}) {

    const handleMouseMove = (e) => {
        if (e.buttons === 1) {
            onResize(e.clientY);
        }
    }

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        onResize(touch.clientY);
    }

    return (
        <div className='resizable-line' ref={ref}>
            <div onMouseMove={handleMouseMove} onTouchMove={handleTouchMove}></div>
        </div>
    );
}

export default ResizableLine;