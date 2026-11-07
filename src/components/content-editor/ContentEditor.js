import './ContentEditor.css'
import { useEffect, useRef, useState } from 'react';
import { ReactComponent as TrashIcon } from './trash.svg';
import ContentEditable from 'react-contenteditable';

function ContentEditor({
    className,
    html,
    disabled,
    height,
    onChange,
    onClear,
    allowEdit = true,
    indexLocked = null,
    components = null,
}) {
    const [scrollLocked, setScrollLocked] = useState(false);
    const editorRef = useRef(null);
    const htmlRegex = /<\/?[a-z][\s\S]*|\/?[a-z][\s\S]*>/i;

    const handlePaste = (e) => {
        e.preventDefault();
        if (isLocked()) {
            return;
        }

        if (!disabled && allowEdit) {
            const text = e.clipboardData.getData('text/plain');
            const contained = htmlRegex.test(text);
            const selection = window.getSelection();
            if (!contained && selection && selection.rangeCount){
                const range = selection.getRangeAt(0);
                selection.deleteFromDocument();
                const textNode = document.createTextNode(text);
                range.insertNode(textNode);
                selection.collapseToEnd(false);
            }
        }
    }

    const onBeforeInput = (e) => {
        if (isLocked()) {
            e.preventDefault();
        }
    }

    const isLocked = () => {
        if (indexLocked > 0) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(editorRef.current.el.current);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);

            // Plain-text character index relative to the container
            const startOffset = preSelectionRange.toString().length;
            //const selectedText = range.toString();
            //const textOnlyEndOffset = textOnlyStartOffset + selectedText.length;

            return  !editorRef.current.lastHtml
                || (startOffset === 0 && range.startContainer.textContent !== '')
                || (startOffset !== 0 && startOffset < indexLocked);
        }
        return false;
    }

    const handleSelect = (e) => {
        if (e.nativeEvent.type === 'mouseup' && isLocked()) {
            const selection = window.getSelection();
            if (selection.toString().length === 0) {
                setFocusToEnd();
                return;
            }
        }
    };
        
    const setFocusToEnd = () => {
        const length = editorRef.current.lastHtml.length;
        if (length) {
            const el = editorRef.current.el.current;
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    const scrollContainerDown = () => {
        if (editorRef.current) {
            editorRef.current.el.current.scrollTo({
                top: editorRef.current.el.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    const handleToggleScrollLocked = () => {
        setScrollLocked(!scrollLocked);
    }

    useEffect(() => {
        if (!scrollLocked) {
            scrollContainerDown();
        }
    }, [html, scrollLocked]);

    return (
        <div className={'content-editor-contrainer'} style={{ height: height }}>
            <ContentEditable
                html={html ?? ''}
                className={className}
                tagName='div'
                disabled={disabled}
                onChange={onChange}
                onPaste={handlePaste}
                onBeforeInput={onBeforeInput}
                draggable={false}
                onMouseDown={handleToggleScrollLocked}
                onSelect={handleSelect}
                ref={editorRef} />
            <TrashIcon
                className='buttonClear'
                onMouseDown={onClear} />
            { components }
        </div>
    );
}

export default ContentEditor;