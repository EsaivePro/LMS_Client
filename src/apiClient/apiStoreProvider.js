let _store = null;

export const setAxiosStore = (store) => {
    _store = store;
};

export const getAxiosStore = () => {
    return _store;
};
