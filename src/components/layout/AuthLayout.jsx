import LoadingScreen from "../common/loading/LoadingScreen";

export default function AuthLayout({ children }) {
    return (
        <div style={{ minHeight: "100vh" }}>
            <LoadingScreen />
            {children}
        </div>
    );
}
