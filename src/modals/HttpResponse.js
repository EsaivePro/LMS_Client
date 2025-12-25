export const HttpResponse = ({
    statusCode = 200,
    isError = false,
    message = "",
    data = null,
} = {}) => ({
    statusCode,
    isError,
    message,
    data,
});