export const buildConditionalFieldRules = (fields = []) => {
    return fields.reduce((rules, field) => {
        if (!field?.name || !field.conditionalFields) return rules;

        rules.push({
            watchField: field.name,
            defaultValue: field.default ?? null,
            conditionalFields: field.conditionalFields,
            allConditional: new Set(Object.values(field.conditionalFields).flat()),
        });

        return rules;
    }, []);
};

export const buildConditionalWatchedDefaults = (rules = []) => {
    return rules.reduce((defaults, rule) => {
        defaults[rule.watchField] = rule.defaultValue;
        return defaults;
    }, {});
};

export const filterFieldsByConditionalRules = (fields = [], rules = [], values = {}) => {
    if (!rules.length) return fields;

    const visibleConditional = new Set();
    const hiddenConditional = new Set();

    rules.forEach((rule) => {
        const currentValue = values?.[rule.watchField] ?? rule.defaultValue;
        const visibleFields = new Set(rule.conditionalFields?.[currentValue] ?? []);

        rule.allConditional.forEach((fieldName) => {
            if (visibleFields.has(fieldName)) visibleConditional.add(fieldName);
            else hiddenConditional.add(fieldName);
        });
    });

    return fields.filter((field) => !hiddenConditional.has(field.name) || visibleConditional.has(field.name));
};

export const getHiddenConditionalFieldNames = (fields = [], rules = [], values = {}) => {
    if (!rules.length) return new Set();

    const visibleNames = new Set(filterFieldsByConditionalRules(fields, rules, values).map((field) => field.name));
    const hiddenNames = new Set();

    rules.forEach((rule) => {
        rule.allConditional.forEach((fieldName) => {
            if (!visibleNames.has(fieldName)) hiddenNames.add(fieldName);
        });
    });

    return hiddenNames;
};