import GlobalAlert from "../common/alert/GlobalAlert";
import LoadingScreen from "../common/loading/LoadingScreen";

export default function AuthLayout({ children }) {
    return (
        <div style={{ minHeight: "100vh" }}>
            <LoadingScreen />
            <GlobalAlert />

            {children}
        </div>
    );
}
