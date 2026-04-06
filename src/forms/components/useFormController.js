import { useCallback, useMemo, useState } from "react";

/**
 * useFormController
 * ─────────────────
 * Scans formDef.sections to find any field with a `conditionalFields` map.
 * That field becomes the "watch field" for its parent section — no separate
 * visibilityRules array is needed at the root of the JSON.
 *
 * Field-level declaration (inside details JSON):
 * {
 *   "name": "enrollment_type",
 *   "type": "select",
 *   "default": "assigned",
 *   "conditionalFields": {
 *     "scheduled": ["scheduled_start_at", "scheduled_end_at"],
 *     "assigned":  ["numberofdays"]
 *   }
 * }
 *
 * Rules are derived automatically:
 *   watchField  = field.name          ("enrollment_type")
 *   sectionKey  = the section's key   ("enrollment-process")
 *   defaultValue = field.default      ("assigned")
 */
export function useFormController(formDef) {

    // ── Derive rules by scanning all sections/fields once ────────────
    const rulesMeta = useMemo(() => {
        const rules = [];
        (formDef.sections || []).forEach((section) => {
            (section.fields || []).forEach((field) => {
                if (!field.conditionalFields) return;
                rules.push({
                    watchField: field.name,
                    sectionKey: section.key,
                    defaultValue: field.default ?? null,
                    conditionalFields: field.conditionalFields,
                    allConditional: new Set(
                        Object.values(field.conditionalFields).flat()
                    ),
                });
            });
        });
        return rules;
    }, []);

    // ── Initial watched values from each rule's defaultValue ─────────
    const initialWatched = useMemo(() => {
        const init = {};
        rulesMeta.forEach((rule) => {
            init[rule.watchField] = rule.defaultValue;
        });
        return init;
    }, []);

    const [watchedValues, setWatchedValues] = useState(initialWatched);

    // ── onFieldChange: passed to DetailsForm ─────────────────────────
    const onFieldChange = useCallback((name, value) => {
        const isWatched = rulesMeta.some((r) => r.watchField === name);
        if (isWatched) {
            setWatchedValues((prev) => ({ ...prev, [name]: value }));
        }
    }, []);

    // ── onLoad: called after DetailsForm fetches a record ────────────
    const onLoad = useCallback((values) => {
        const updates = {};
        rulesMeta.forEach((rule) => {
            if (values?.[rule.watchField] !== undefined) {
                updates[rule.watchField] = values[rule.watchField];
            }
        });
        if (Object.keys(updates).length) {
            setWatchedValues((prev) => ({ ...prev, ...updates }));
        }
    }, []);

    // ── Filtered definition recomputed on watchedValues change ───────
    const definition = useMemo(() => {
        if (!rulesMeta.length) return formDef;

        const ruleBySection = new Map(rulesMeta.map((r) => [r.sectionKey, r]));

        return {
            ...formDef,
            sections: (formDef.sections || []).map((section) => {
                const rule = ruleBySection.get(section.key);
                if (!rule) return section;

                const currentValue = watchedValues[rule.watchField];
                const visibleFields = new Set(rule.conditionalFields[currentValue] ?? []);

                return {
                    ...section,
                    fields: section.fields.filter(
                        (f) => !rule.allConditional.has(f.name) || visibleFields.has(f.name)
                    ),
                };
            }),
        };
    }, [formDef, rulesMeta, watchedValues]);

    return { definition, onFieldChange, onLoad, watchedValues };
}
