import React from "react";
import RecordAssignedForm from "./RecordAssignedForm";
import {
    ArrayFormField,
    CheckboxFormField,
    DateTimeFormField,
    DefaultFormField,
    FileUploadFormField,
    NumberFormField,
    RecordDailogField,
    RecordPickerField,
    SelectFormField,
    TableField,
    TextareaFormField,
    TextFormField,
} from "./fields";

export default function FormRender({
    field,
    value,
    formValues,
    recordId,
    onChange,
    editing,
    invalidFields,
    setInvalidFields,
    optionsCache,
    optionsLoading,
    handleSearchInput,
    fetchOptionsForSource,
    resolveOptionLabel,
    showError,
    saveKey,
}) {
    switch (field.type) {
        case "text":
            return <TextFormField field={field} value={value} onChange={onChange} editing={editing} invalidFields={invalidFields} setInvalidFields={setInvalidFields} />;
        case "number":
            return <NumberFormField field={field} value={value} onChange={onChange} editing={editing} invalidFields={invalidFields} setInvalidFields={setInvalidFields} />;
        case "textarea":
            return <TextareaFormField field={field} value={value} onChange={onChange} editing={editing} invalidFields={invalidFields} setInvalidFields={setInvalidFields} />;
        case "checkbox":
            return <CheckboxFormField field={field} value={value} onChange={onChange} editing={editing} invalidFields={invalidFields} setInvalidFields={setInvalidFields} />;
        case "array":
            return <ArrayFormField field={field} value={value} onChange={onChange} editing={editing} invalidFields={invalidFields} setInvalidFields={setInvalidFields} />;
        case "select":
        case "autocomplete":
            return (
                <SelectFormField
                    field={field}
                    value={value}
                    formValues={formValues}
                    onChange={onChange}
                    editing={editing}
                    invalidFields={invalidFields}
                    setInvalidFields={setInvalidFields}
                    optionsCache={optionsCache}
                    optionsLoading={optionsLoading}
                    handleSearchInput={handleSearchInput}
                />
            );
        case "record-assigned":
            return (
                <RecordAssignedForm
                    key={`${field.name}-${saveKey}`}
                    field={field}
                    value={value}
                    formValues={formValues}
                    recordId={recordId}
                    editing={editing}
                    onChange={onChange}
                    saveKey={saveKey}
                />
            );
        case "record-dailog":
            return <RecordDailogField field={field} value={value || []} onChange={onChange} editing={editing} showError={showError} />;
        case "datetime":
            return <DateTimeFormField field={field} value={value} onChange={onChange} editing={editing} invalidFields={invalidFields} setInvalidFields={setInvalidFields} />;
        case "fileupload":
            return (
                <FileUploadFormField
                    field={field}
                    value={value}
                    onChange={onChange}
                    editing={editing}
                    invalidFields={invalidFields}
                    setInvalidFields={setInvalidFields}
                    showError={showError}
                />
            );
        case "record-picker":
            return <RecordPickerField field={field} value={value || []} formValues={formValues} recordId={recordId} onChange={onChange} editing={editing} />;
        case "table":
            return (
                <TableField
                    field={field}
                    value={value || []}
                    onChange={onChange}
                    editing={editing}
                    optionsCache={optionsCache}
                    optionsLoading={optionsLoading}
                    handleSearchInput={handleSearchInput}
                    fetchOptionsForSource={fetchOptionsForSource}
                    resolveOptionLabel={resolveOptionLabel}
                    showError={showError}
                />
            );
        default:
            return <DefaultFormField field={field} value={value} onChange={onChange} editing={editing} invalidFields={invalidFields} setInvalidFields={setInvalidFields} />;
    }
}
