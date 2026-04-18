import { createContext, useContext, useRef, useState } from "react";

const FormHeaderContext = createContext(null);

export function FormHeaderProvider({ children }) {
    const [formHeader, setFormHeader] = useState(null);
    // Keep a ref to the latest handlers so BreadcrumbsNav always calls fresh ones
    const handlersRef = useRef({});

    const registerFormHeader = (config) => {
        if (!config) {
            setFormHeader(null);
            handlersRef.current = {};
            return;
        }
        const { onToggleEdit, onCancel, onCopy, onSubmit, ...rest } = config;
        handlersRef.current = { onToggleEdit, onCancel, onCopy, onSubmit };
        setFormHeader({
            ...rest,
            onToggleEdit: () => handlersRef.current.onToggleEdit?.(),
            onCancel: () => handlersRef.current.onCancel?.(),
            onCopy: () => handlersRef.current.onCopy?.(),
            onSubmit: () => handlersRef.current.onSubmit?.(),
        });
    };

    return (
        <FormHeaderContext.Provider value={{ formHeader, registerFormHeader }}>
            {children}
        </FormHeaderContext.Provider>
    );
}

export function useFormHeader() {
    return useContext(FormHeaderContext);
}
