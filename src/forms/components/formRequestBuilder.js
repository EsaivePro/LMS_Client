/**
 * formRequestBuilder.js
 * ─────────────────────
 * Generic utilities for building and validating form payloads.
 * Used by HeaderHandle.js and any custom Manage page that needs
 * to override or extend the default request formation.
 */

// ─────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────

/**
 * Validates required fields across the definition.
 * Returns { valid: true } or { valid: false, missing: string[], invalidFields: {} }
 */
export function validateFormValues(definition, values) {
    const missing = [];
    const invalidFields = {};

    (definition.sections || []).forEach((sec) => {
        (sec.fields || []).forEach((f) => {
            if (f.required && f.type !== "table") {
                const val = values[f.name];
                const empty =
                    val === undefined ||
                    val === null ||
                    (typeof val === "string" && val.trim() === "") ||
                    (Array.isArray(val) && val.length === 0);
                if (empty) {
                    missing.push(f.label || f.name);
                    invalidFields[f.name] = true;
                }
            }

            if (f.type === "table") {
                const cols = f.table?.columns || [];
                const rows = values[f.name] || [];
                cols.forEach((col) => {
                    if (col.required) {
                        rows.forEach((row, idx) => {
                            const cell = row[col.name];
                            const emptyCell =
                                cell === undefined ||
                                cell === null ||
                                (typeof cell === "string" && cell.trim() === "");
                            if (emptyCell)
                                missing.push(`${col.label || col.name} (row ${idx + 1})`);
                        });
                    }
                });
            }
        });
    });

    if (missing.length) return { valid: false, missing, invalidFields };
    return { valid: true, missing: [], invalidFields: {} };
}

/**
 * Returns the section key of the first invalid field, or null.
 */
export function findFirstInvalidSection(definition, values) {
    for (const sec of definition.sections || []) {
        for (const f of sec.fields || []) {
            if (f.type !== "table") {
                if (f.required) {
                    const val = values[f.name];
                    const empty =
                        val === undefined ||
                        val === null ||
                        (typeof val === "string" && val.trim() === "") ||
                        (Array.isArray(val) && val.length === 0);
                    if (empty) return sec.key;
                }
            } else {
                const cols = f.table?.columns || [];
                const rows = values[f.name] || [];
                for (const col of cols) {
                    if (!col.required) continue;
                    for (const row of rows) {
                        const cell = row[col.name];
                        const emptyCell =
                            cell === undefined ||
                            cell === null ||
                            (typeof cell === "string" && cell.trim() === "");
                        if (emptyCell) return sec.key;
                    }
                }
            }
        }
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────
// PAYLOAD BUILDERS
// ─────────────────────────────────────────────────────────────────

/**
 * Resolves the target table name from a definition.
 */
export function resolveTable(definition) {
    return definition.fetchConfig?.table || definition.tablename || null;
}

/**
 * Returns true if the values represent a new record (no real id).
 */
export function isNewRecord(values) {
    return (
        values?.id === undefined ||
        values?.id === null ||
        values?.id === "" ||
        values?.id === 0
    );
}

/**
 * Builds the base insert payload: { table, data }
 * Strips the id field automatically.
 */
export function buildInsertPayload(definition, values) {
    const table = resolveTable(definition);
    const data = { ...values };
    delete data.id;
    return { table, data };
}

/**
 * Builds the base update payload: { table, id, data }
 */
export function buildUpdatePayload(definition, values) {
    const table = resolveTable(definition);
    const id = parseInt(values.id, 10);
    const data = { ...values };
    return { table, id, data };
}

/**
 * Full generic payload builder — decides insert vs update automatically.
 * Returns: { mode: "insert"|"update", table, id?, data }
 */
export function buildFormPayload(definition, values) {
    if (isNewRecord(values)) {
        const payload = buildInsertPayload(definition, values);
        return { mode: "insert", ...payload };
    }
    const payload = buildUpdatePayload(definition, values);
    return { mode: "update", ...payload };
}

// ─────────────────────────────────────────────────────────────────
// COPY HELPER
// ─────────────────────────────────────────────────────────────────

/**
 * Deep-clones values and strips identity fields for use in copy/duplicate.
 * Appends " (copy)" to the first title/name/label field found.
 */
export function buildCopyPayload(definition, values) {
    const copied = JSON.parse(JSON.stringify(values || {}));
    delete copied.id;
    delete copied._id;
    delete copied.uuid;

    Object.keys(copied).forEach((k) => {
        if (Array.isArray(copied[k])) {
            copied[k] = copied[k].map((row) => {
                if (row && typeof row === "object") {
                    const nr = { ...row };
                    delete nr.id;
                    delete nr._id;
                    return nr;
                }
                return row;
            });
        }
    });

    let titleFieldName = null;
    (definition.sections || []).some((sec) =>
        (sec.fields || []).some((f) => {
            if (f.name === "title" || f.name === "name" || f.name === "label") {
                titleFieldName = f.name;
                return true;
            }
            return false;
        })
    );
    if (titleFieldName) {
        copied[titleFieldName] = `${copied[titleFieldName] ?? ""} (copy)`;
    }

    return copied;
}
