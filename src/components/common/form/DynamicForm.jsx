import React, { useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    IconButton,
    Typography,
    Card,
    CardContent,
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import RichTextEditor from "../editor/RichTextEditor";
import useCommon from "../../../hooks/useCommon";
import axiosInstance from "../../../apiClient/axiosInstance";

function buildSchema(def) {
    const shape = {};
    const allFields = def.sections ? def.sections.flatMap((s) => s.fields) : def.fields || [];
    allFields.forEach((f) => {
        switch (f.type) {
            case "text":
            case "textarea":
                shape[f.name] = f.validation && f.validation.required ? yup.string().required("Required") : yup.string().notRequired();
                break;
            case "richtext":
                shape[f.name] = f.validation && f.validation.required ? yup.string().required("Please enter question") : yup.string().notRequired();
                break;
            case "number": {
                let num = yup.number().typeError("Must be a number");
                if (f.validation && f.validation.min !== undefined) num = num.min(f.validation.min);
                shape[f.name] = num.notRequired();
                break;
            }
            case "select":
                shape[f.name] = f.validation && f.validation.required ? yup.string().required("Required") : yup.string().notRequired();
                break;
            case "switch":
                shape[f.name] = yup.boolean().default(false);
                break;
            case "optionsArray":
                shape[f.name] = yup
                    .array()
                    .of(
                        yup.object({
                            option_text: yup.string().required("Option required"),
                            is_correct: yup.boolean().default(false),
                        })
                    )
                    .min((f.validation && f.validation.minItems) || 2, "Provide at least 2 options");
                break;
            default:
                shape[f.name] = yup.mixed().notRequired();
        }
    });

    const hasOptionsField = allFields.some((ff) => ff.type === "optionsArray");

    let schema = yup.object().shape(shape);

    if (hasOptionsField) {
        schema = schema.test("options-correct", "Please select correct answer", function (val) {
            const opts = val?.options || [];
            const filled = opts.filter((o) => o.option_text && o.option_text.trim());
            if (filled.length < 2) return this.createError({ path: "options", message: "Provide at least 2 options" }) || false;
            const multiple = !!val?.multiple_answers;
            const correctCount = filled.filter((o) => o.is_correct).length;
            if (multiple) {
                if (correctCount < 1) return this.createError({ path: "options", message: "Please select at least one correct answer" }) || false;
            } else {
                if (correctCount !== 1) return this.createError({ path: "options", message: "Please select exactly one correct answer" }) || false;
            }
            return true;
        });
    }

    return schema;
}

export default function DynamicForm({ definition, initialValues = {}, onSubmit, submitLabel = "Submit", successMessage = null }) {
    const schema = buildSchema(definition);

    const { showError, showSuccess } = useCommon();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: initialValues,
        mode: "onChange",
    });

    // prepare array field controllers for any array-type fields (optionsArray or objectArray)
    const allFieldsDef = definition?.sections ? definition.sections.flatMap((s) => s.fields) : definition?.fields || [];
    const arrayFieldDefs = allFieldsDef.filter((ff) => ff.type === "optionsArray" || ff.type === "objectArray");

    const arrayFieldControls = {};
    arrayFieldDefs.forEach((afd) => {
        arrayFieldControls[afd.name] = useFieldArray({ control, name: afd.name });
    });

    // Ensure array fields have at least the minimum number of items (run on mount)
    useEffect(() => {
        try {
            arrayFieldDefs.forEach((afd) => {
                const ctrl = arrayFieldControls[afd.name];
                if (!ctrl) return;
                const minItems = (afd.validation && afd.validation.minItems) || 0;
                const cur = ctrl.fields?.length || 0;
                for (let i = cur; i < minItems; i++) {
                    // append sensible defaults depending on type
                    if (afd.type === "optionsArray") ctrl.append({ option_text: "", is_correct: false });
                    else if (afd.type === "objectArray") {
                        const obj = {};
                        (afd.fields || []).forEach((sf) => {
                            if (sf.type === "switch") obj[sf.name] = false;
                            else if (sf.type === "number") obj[sf.name] = sf.default ?? null;
                            else obj[sf.name] = sf.default ?? "";
                        });
                        ctrl.append(obj);
                    }
                }
            });
        } catch (e) {
            // ignore
        }
    }, []);

    const renderField = (f) => {
        // Async select component used for fields with asyncSearch
        const AsyncSelect = ({ fieldCtrl, fieldDef, multiple = false }) => {
            const [options, setOptions] = React.useState(fieldDef.options || []);
            const [inputValue, setInputValue] = React.useState("");
            const [loadingOptions, setLoadingOptions] = React.useState(false);

            React.useEffect(() => {
                let mounted = true;
                const minLen = (fieldDef.asyncSearch && fieldDef.asyncSearch.minLength) || 3;
                const limit = (fieldDef.asyncSearch && fieldDef.asyncSearch.limit) || 10;
                const table = (fieldDef.asyncSearch && fieldDef.asyncSearch.table) || fieldDef.table;

                const fetch = async (q) => {
                    if (!table) return;
                    setLoadingOptions(true);
                    try {
                        const res = await axiosInstance.get(`/common-service/search?table=${table}&q=${encodeURIComponent(q)}&page=1&limit=${limit}`);
                        // Support several possible response shapes: res.data (array), res.data.data, res.data.response (array), res.data.response.data
                        const raw = res?.data;
                        let items = [];
                        if (Array.isArray(raw)) items = raw;
                        else if (raw && Array.isArray(raw.data)) items = raw.data;
                        else if (raw && raw.response && Array.isArray(raw.response)) items = raw.response;
                        else if (raw && raw.response && Array.isArray(raw.response.data)) items = raw.response.data;

                        const mapped = (items || []).map((it) => ({
                            value: it.id ?? it._id ?? it.value ?? null,
                            label:
                                (it.question_text
                                    ? `${it.question_text}${it.question_description ? ` - ${it.question_description}` : ""}`
                                    : (it.title || it.question || it.name || it.text || it.label || `Question ${it.id ?? it._id ?? ""}`)),
                        }));
                        if (mounted) setOptions(mapped.filter((m) => m.value != null));
                    } catch (e) {
                        // ignore network/parse errors
                    } finally {
                        if (mounted) setLoadingOptions(false);
                    }
                };

                const handle = setTimeout(() => {
                    if (inputValue && inputValue.length >= minLen) fetch(inputValue);
                }, 300);

                return () => {
                    mounted = false;
                    clearTimeout(handle);
                };
            }, [inputValue, fieldDef]);

            return (
                <Autocomplete
                    multiple={multiple}
                    freeSolo
                    filterSelectedOptions
                    clearOnBlur={false}
                    disableCloseOnSelect={multiple}
                    options={options}
                    getOptionLabel={(opt) => (opt && (opt.label || opt)) || ""}
                    isOptionEqualToValue={(o, v) => {
                        try {
                            const ov = o && (o.value ?? o);
                            const vv = v && (v.value ?? v);
                            return ov === vv;
                        } catch (e) {
                            return false;
                        }
                    }}
                    value={(() => {
                        const val = fieldCtrl.value;
                        if (multiple) {
                            if (!Array.isArray(val)) return val ? [{ value: val, label: String(val) }] : [];
                            return val.map((v) => (typeof v === "object" && v.value != null ? v : { value: v, label: String(v) }));
                        }
                        if (val == null) return null;
                        return typeof val === "object" && val.value != null ? val : { value: val, label: String(val) };
                    })()}
                    onChange={(_, newVal) => {
                        if (multiple) {
                            const out = (newVal || []).map((n) => (n && n.value != null ? n.value : n));
                            fieldCtrl.onChange(out);
                        } else {
                            fieldCtrl.onChange(newVal ? (newVal.value ?? newVal) : null);
                        }
                        setInputValue("");
                    }}
                    inputValue={inputValue}
                    onInputChange={(_, v, reason) => {
                        // allow typing; ignore when option selected
                        if (reason === "reset") return;
                        setInputValue(v);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={fieldDef.label}
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loadingOptions ? <CircularProgress color="inherit" size={16} /> : null}
                                        {params.InputProps?.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            );
        };
        switch (f.type) {
            case "text":
            case "number":
            case "textarea":
                return (
                    <Controller
                        key={f.name}
                        name={f.name}
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={f.label}
                                fullWidth
                                size="small"
                                type={f.type === "number" ? "number" : "text"}
                                multiline={f.type === "textarea"}
                                error={!!errors[f.name]}
                                helperText={errors[f.name]?.message}
                            />
                        )}
                    />
                );

            case "select":
                if (f.asyncSearch) {
                    return (
                        <Controller
                            key={f.name}
                            name={f.name}
                            control={control}
                            render={({ field }) => <AsyncSelect fieldCtrl={field} fieldDef={f} multiple={!!f.multiple} />}
                        />
                    );
                }
                return (
                    <Controller
                        key={f.name}
                        name={f.name}
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth size="small">
                                <InputLabel>{f.label}</InputLabel>
                                <Select {...field} label={f.label}>
                                    {(f.options || []).map((opt) => (
                                        <MenuItem key={opt} value={opt}>
                                            {opt || "None"}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />
                );

            case "switch":
                return (
                    <Controller
                        key={f.name}
                        name={f.name}
                        control={control}
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Switch {...field} checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                label={f.label}
                            />
                        )}
                    />
                );

            case "richtext":
                return (
                    <Controller
                        key={f.name}
                        name={f.name}
                        control={control}
                        render={({ field }) => (
                            <Box>
                                <Typography sx={{ mb: 1, fontWeight: 600 }}>{f.label}</Typography>
                                <RichTextEditor value={field.value} onChange={(v) => field.onChange(v)} />
                                {errors[f.name] && (
                                    <Typography color="error" variant="caption">
                                        {errors[f.name]?.message}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    />
                );

            case "optionsArray": {
                const ctrl = arrayFieldControls[f.name];
                const arrFields = ctrl?.fields || [];
                const arrWatch = watch(f.name);
                return (
                    <Box key={f.name}>
                        <Stack spacing={2}>
                            <Typography sx={{ fontWeight: 600 }}>{f.label}</Typography>
                            {(arrFields.length ? arrFields : []).map((opt, idx) => (
                                <Stack key={opt.id || idx} direction="row" spacing={1} alignItems="center">
                                    <Controller
                                        name={`${f.name}.${idx}.option_text`}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                placeholder={`Option ${idx + 1}`}
                                                fullWidth
                                                size="small"
                                                error={!!(errors[f.name] && errors[f.name][idx])}
                                                helperText={errors[f.name] && errors[f.name][idx]?.option_text?.message}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name={`${f.name}.${idx}.is_correct`}
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={!!field.value}
                                                onChange={() => {
                                                    const multiple = !!watch("multiple_answers");
                                                    if (!multiple) {
                                                        const current = arrWatch || [];
                                                        (current || []).forEach((__, i) => setValue(`${f.name}.${i}.is_correct`, i === idx));
                                                    } else {
                                                        setValue(`${f.name}.${idx}.is_correct`, !field.value);
                                                    }
                                                }}
                                            />
                                        )}
                                    />

                                    <IconButton size="small" onClick={() => ctrl.remove(idx)} disabled={arrFields.length <= ((f.validation && f.validation.minItems) || 1)} sx={{ opacity: arrFields.length <= ((f.validation && f.validation.minItems) || 1) ? 0.4 : 1 }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            ))}

                            <Button startIcon={<AddIcon />} size="small" onClick={() => ctrl.append({ option_text: "", is_correct: false })} sx={{ textTransform: "none" }}>
                                Add option
                            </Button>
                            {errors[f.name] && typeof errors[f.name].message === "string" && (
                                <Typography color="error" variant="caption">
                                    {errors[f.name].message}
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                );
            }

            case "objectArray": {
                const ctrl = arrayFieldControls[f.name];
                const arrFields = ctrl?.fields || [];
                return (
                    <Box key={f.name}>
                        <Stack spacing={2}>
                            <Typography sx={{ fontWeight: 600 }}>{f.label}</Typography>
                            {(arrFields.length ? arrFields : []).map((item, idx) => (
                                <Box key={item.id || idx} sx={{ border: "1px solid var(--lightgrey)", p: 1, borderRadius: 1 }}>
                                    <Stack spacing={1}>
                                        {(f.fields || []).map((sf) => (
                                            <Controller
                                                key={`${f.name}.${idx}.${sf.name}`}
                                                name={`${f.name}.${idx}.${sf.name}`}
                                                control={control}
                                                render={({ field }) => {
                                                    if (sf.type === "number") {
                                                        return (
                                                            <TextField {...field} label={sf.label} size="small" type="number" error={!!(errors[f.name] && errors[f.name][idx] && errors[f.name][idx][sf.name])} helperText={errors[f.name] && errors[f.name][idx] && errors[f.name][idx][sf.name]?.message} />
                                                        );
                                                    }
                                                    if (sf.type === "switch") {
                                                        return <FormControlLabel control={<Switch {...field} checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label={sf.label} />;
                                                    }
                                                    if (sf.type === "select") {
                                                        if (sf.asyncSearch) {
                                                            return <AsyncSelect fieldCtrl={field} fieldDef={sf} multiple={!!sf.multiple} />;
                                                        }
                                                        return (
                                                            <FormControl fullWidth size="small">
                                                                <InputLabel>{sf.label}</InputLabel>
                                                                <Select {...field} label={sf.label}>
                                                                    {(sf.options || []).map((opt) => (
                                                                        <MenuItem key={opt.value ?? opt} value={opt.value ?? opt}>
                                                                            {opt.label ?? opt}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        );
                                                    }
                                                    return (
                                                        <TextField {...field} label={sf.label} size="small" error={!!(errors[f.name] && errors[f.name][idx] && errors[f.name][idx][sf.name])} helperText={errors[f.name] && errors[f.name][idx] && errors[f.name][idx][sf.name]?.message} />
                                                    );
                                                }}
                                            />
                                        ))}

                                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                            <Button size="small" variant="outlined" onClick={() => ctrl.remove(idx)} startIcon={<DeleteIcon />}>
                                                Remove
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            ))}

                            <Button startIcon={<AddIcon />} size="small" onClick={() => {
                                const obj = {};
                                (f.fields || []).forEach((sf) => {
                                    if (sf.type === "switch") obj[sf.name] = false;
                                    else if (sf.type === "number") obj[sf.name] = sf.default ?? null;
                                    else obj[sf.name] = sf.default ?? "";
                                });
                                ctrl.append(obj);
                            }} sx={{ textTransform: "none" }}>
                                Add {f.label}
                            </Button>
                        </Stack>
                    </Box>
                );
            }

            default:
                return null;
        }
    };

    const Section = ({ title, children }) => (
        <Card variant="outlined" sx={{ width: "100%" }}>
            <Box sx={{ px: 3, py: 1.5, background: "var(--lightgrey)", borderBottom: "1px solid var(--lightgrey)" }}>
                <Typography fontWeight={600}>{title}</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>{children}</Stack>
            </CardContent>
        </Card>
    );

    const errorCount = Object.keys(errors || {}).length;

    const onValid = async (values) => {
        try {
            const res = await onSubmit(values);
            // If onSubmit returns an object with skipSuccess=true, do not show success
            if (!(res && res.skipSuccess)) {
                showSuccess(successMessage || "Saved successfully");
            }
        } catch (err) {
            showError(err?.response?.data?.message || err.message || "Failed to submit form");
        }
    };

    const onInvalid = (formErrors) => {
        const findMessage = (o) => {
            if (!o) return null;
            if (typeof o === "string") return o;
            if (o.message) return o.message;
            if (Array.isArray(o)) {
                for (const item of o) {
                    const m = findMessage(item);
                    if (m) return m;
                }
            } else if (typeof o === "object") {
                for (const k of Object.keys(o)) {
                    const m = findMessage(o[k]);
                    if (m) return m;
                }
            }
            return null;
        };

        const firstKey = Object.keys(formErrors || {})[0];
        let message = "Please fix the errors in the form";
        if (firstKey) {
            const errObj = formErrors[firstKey];
            const found = findMessage(errObj);
            if (found) message = found;
        }
        showError(message);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onValid, onInvalid)}>
            <Stack spacing={3}>
                {(definition.sections || [{ title: "", fields: definition.fields || [] }]).map((sec, i) => (
                    <Section key={sec.title || i} title={sec.title}>
                        {sec.fields.map((f) => renderField(f))}
                    </Section>
                ))}
            </Stack>

            {/* Sticky Footer */}
            <Box sx={{ position: "sticky", bottom: 0, mt: 4, background: "var(--surface)", borderTop: "1px solid var(--lightgrey)", boxShadow: "0 -4px 12px rgba(0,0,0,0.06)", zIndex: 10 }}>
                {errorCount > 0 && (
                    <Typography variant="caption" color="error" sx={{ px: 2 }}>
                        {errorCount} required field(s) missing
                    </Typography>
                )}
                <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained" type="submit" disabled={isSubmitting} sx={{ minWidth: 160 }}>
                        {submitLabel}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
