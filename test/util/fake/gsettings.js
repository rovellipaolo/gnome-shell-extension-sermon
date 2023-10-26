export const bind = () => {};

export const get_boolean = () => false;

export const get_int = () => 0;

export const get_string = () => "";

export const settings_schema = () => ({
    get_key: (key) => ({
        get_description: () => "",
        get_key: () => key,
        get_summary: () => "",
    }),
});
