import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import THEME from '../../../constants/theme';

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean']
    ],
    clipboard: {
        matchVisual: false
    }
};

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'check',
    'indent', 'align',
    'link', 'image', 'video'
];

export default function RichTextEditor({ value, onChange, placeholder, height = '400px', readOnly = false }) {
    const quillRef = useRef(null);

    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'rte-theme-overrides';
        style.innerHTML = `
            .ql-toolbar.ql-snow { 
                border: none;
                border-bottom: 3px solid ${THEME.colors.darkMedium}; 
                background: ${THEME.colors.surface}; 
                padding: 12px 8px;
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }
            .ql-toolbar.ql-snow .ql-formats {
                margin-right: 8px;
            }
            .ql-container.ql-snow { 
                border: none; 
                font-family: inherit;
            }
            .ql-editor { 
                font-weight: 400; 
                font-style: normal; 
                color: ${THEME.colors.dark}; 
                min-height: ${height};
                padding: 16px;
                line-height: 1.6;
                font-size: 14px;
            }
            .ql-editor p { 
                margin: 0 0 8px 0; 
            }
            .ql-editor.ql-blank::before { 
                color: ${THEME.colors.darkLight}; 
                font-style: normal; 
                left: 16px;
            }
            .ql-snow .ql-stroke {
                stroke: ${THEME.colors.dark};
            }
            .ql-snow .ql-fill {
                fill: ${THEME.colors.dark};
            }
            .ql-snow .ql-picker-label {
                color: ${THEME.colors.dark};
            }
            .ql-toolbar.ql-snow button:hover,
            .ql-toolbar.ql-snow button:focus,
            .ql-toolbar.ql-snow .ql-picker-label:hover,
            .ql-toolbar.ql-snow .ql-picker-label.ql-active {
                color: var(--primary);
            }
            .ql-toolbar.ql-snow button:hover .ql-stroke,
            .ql-toolbar.ql-snow button:focus .ql-stroke,
            .ql-toolbar.ql-snow .ql-picker-label:hover .ql-stroke,
            .ql-toolbar.ql-snow .ql-picker-label.ql-active .ql-stroke {
                stroke: var(--primary);
            }
            .ql-toolbar.ql-snow button:hover .ql-fill,
            .ql-toolbar.ql-snow button:focus .ql-fill,
            .ql-toolbar.ql-snow .ql-picker-label:hover .ql-fill,
            .ql-toolbar.ql-snow .ql-picker-label.ql-active .ql-fill {
                fill: var(--primary);
            }
            .ql-snow.ql-toolbar button.ql-active,
            .ql-snow .ql-toolbar button.ql-active {
                color: var(--primary);
            }
            .ql-snow.ql-toolbar button.ql-active .ql-stroke,
            .ql-snow .ql-toolbar button.ql-active .ql-stroke {
                stroke: var(--primary);
            }
            .ql-snow.ql-toolbar button.ql-active .ql-fill,
            .ql-snow .ql-toolbar button.ql-active .ql-fill {
                fill: var(--primary);
            }
            .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6 {
                font-weight: 600;
                margin: 8px 0;
            }
            .ql-editor ul, .ql-editor ol {
                padding-left: 1.5em;
                margin: 8px 0;
            }
            .ql-editor blockquote {
                border-left: 4px solid var(--primary);
                padding-left: 16px;
                margin: 8px 0;
                color: ${THEME.colors.darkLight};
            }
            .ql-editor pre.ql-syntax {
                background-color: #f5f5f5;
                border-radius: 4px;
                padding: 12px;
                margin: 8px 0;
                overflow-x: auto;
            }
            .ql-editor img {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
                margin: 8px 0;
            }
            .ql-editor a {
                color: var(--primary);
                text-decoration: underline;
            }
            .ql-snow .ql-tooltip {
                background-color: white;
                border: 1px solid ${THEME.colors.darkMedium};
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                border-radius: 4px;
            }
            .ql-snow .ql-tooltip input[type=text] {
                border: 1px solid ${THEME.colors.darkMedium};
                padding: 6px 8px;
                border-radius: 4px;
            }
            .ql-snow .ql-tooltip a.ql-action,
            .ql-snow .ql-tooltip a.ql-remove {
                color: var(--primary);
            }
        `;
        document.head.appendChild(style);
        return () => {
            const s = document.getElementById('rte-theme-overrides');
            if (s) s.remove();
        };
    }, [height]);

    return (
        <div style={{
            border: `1px solid ${THEME.colors.darkLight}`,
            borderRadius: 0,
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            <ReactQuill
                ref={quillRef}
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                theme="snow"
                readOnly={readOnly}
            />
        </div>
    );
}
