import * as yup from "yup";

export const profileSchema = yup.object({
    name: yup.string().required("Full name is required"),
    email: yup.string().email("Invalid email").required(),
    phone: yup.string().min(10).required(),
    password: yup.string().min(8, "Min 8 characters"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match"),
    notifications: yup.boolean(),
});
