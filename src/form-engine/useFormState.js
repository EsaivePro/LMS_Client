
import { useState } from "react";

export default function useFormState(initialData = {}, mode) {
  const [state, setState] = useState(initialData);
  const [formMode, setFormMode] = useState(mode);

  const updateValue = (key, value) => setState(prev => ({ ...prev, [key]: value }));
  return { state, updateValue, formMode, setFormMode };
}
