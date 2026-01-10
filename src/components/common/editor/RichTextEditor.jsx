import React, { useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import THEME from '../../../constants/theme';

const modules = {
    toolbar: [
        [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['clean']
    ]
};

const formats = [
    'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block', 'header', 'list', 'bullet', 'indent', 'link', 'image'
];

export default function RichTextEditor({ value, onChange, placeholder }) {
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'rte-theme-overrides';
        style.innerHTML = `
            .ql-toolbar.ql-snow { border-bottom: 1px solid ${THEME.colors.darkMedium}; background: ${THEME.colors.surface}; }
            .ql-container.ql-snow { border: none; }
            /* Use normal font by default so toolbar bold/italic toggles work as expected */
            .ql-editor { font-weight: 400; font-style: normal; color: ${THEME.colors.dark}; min-height: 140px; }
            .ql-editor p { margin: 0; }
            /* Quill placeholder selector */
            .ql-editor.ql-blank::before { color: ${THEME.colors.darkLight}; font-style: italic; }
        `;
        document.head.appendChild(style);
        return () => {
            const s = document.getElementById('rte-theme-overrides');
            if (s) s.remove();
        };
    }, []);

    return (
        <div style={{ border: `1px solid ${THEME.colors.darkMedium}`, borderRadius: 6, overflow: 'hidden' }}>
            <ReactQuill
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                theme="snow"
            />
        </div>
    );
}
