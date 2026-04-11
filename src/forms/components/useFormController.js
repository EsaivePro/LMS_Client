import { useCallback, useMemo, useState } from "react";
import {
    buildConditionalFieldRules,
    buildConditionalWatchedDefaults,
    filterFieldsByConditionalRules,
} from "./conditionalFields";

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
        return (formDef.sections || []).flatMap((section) => {
            return buildConditionalFieldRules(section.fields || []).map((rule) => ({
                ...rule,
                sectionKey: section.key,
            }));
        });
    }, [formDef]);

    // ── Initial watched values from each rule's defaultValue ─────────
    const initialWatched = useMemo(() => {
        return buildConditionalWatchedDefaults(rulesMeta);
    }, [rulesMeta]);

    const [watchedValues, setWatchedValues] = useState(initialWatched);

    // ── onFieldChange: passed to DetailsForm ─────────────────────────
    const onFieldChange = useCallback((name, value) => {
        const isWatched = rulesMeta.some((r) => r.watchField === name);
        if (isWatched) {
            setWatchedValues((prev) => ({ ...prev, [name]: value }));
        }
    }, [rulesMeta]);

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
    }, [rulesMeta]);

    // ── Filtered definition recomputed on watchedValues change ───────
    const definition = useMemo(() => {
        if (!rulesMeta.length) return formDef;

        return {
            ...formDef,
            sections: (formDef.sections || []).map((section) => {
                const sectionRules = rulesMeta.filter((rule) => rule.sectionKey === section.key);
                if (!sectionRules.length) return section;

                return {
                    ...section,
                    fields: filterFieldsByConditionalRules(section.fields || [], sectionRules, watchedValues),
                };
            }),
        };
    }, [formDef, rulesMeta, watchedValues]);

    return { definition, onFieldChange, onLoad, watchedValues };
}
