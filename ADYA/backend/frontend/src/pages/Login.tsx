import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";

type Mode = "signin" | "signup" | "request-otp" | "verify-otp";

export default function Login() {
  const { signIn, signUp, requestPasswordResetOtp, verifyOtpAndSetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "signin") {
      const { error: err } = await signIn(email, password);
      if (err) return setError(err.message);
      navigate("/dashboard");
    } else if (mode === "signup") {
      const { error: err } = await signUp(email, password);
      if (err) return setError(err.message);
      setInfo("Account created — check your email to confirm, then sign in.");
      setMode("signin");
    } else if (mode === "request-otp") {
      const { error: err } = await requestPasswordResetOtp(email);
      if (err) return setError(err.message);
      setInfo("A one-time code has been emailed to you.");
      setMode("verify-otp");
    } else if (mode === "verify-otp") {
      const { error: err } = await verifyOtpAndSetPassword(email, otp, password);
      if (err) return setError(err.message);
      setInfo("Password updated — you can now sign in.");
      setMode("signin");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f6f7f9" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 8, width: 360 }}>
        <h2 style={{ marginTop: 0 }}>StockSense</h2>

        <label style={{ fontSize: 13 }}>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, margin: "4px 0 12px", boxSizing: "border-box" }} />

        {mode !== "request-otp" && (
          <>
            <label style={{ fontSize: 13 }}>{mode === "verify-otp" ? "New password" : "Password"}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8, margin: "4px 0 12px", boxSizing: "border-box" }} />
          </>
        )}

        {mode === "verify-otp" && (
          <>
            <label style={{ fontSize: 13 }}>OTP code</label>
            <input required value={otp} onChange={(e) => setOtp(e.target.value)}
              style={{ width: "100%", padding: 8, margin: "4px 0 12px", boxSizing: "border-box" }} />
          </>
        )}

        {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
        {info && <p style={{ color: "#16a34a", fontSize: 13 }}>{info}</p>}

        <Button type="submit" style={{ width: "100%" }}>
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : mode === "request-otp" ? "Send code" : "Reset password"}
        </Button>

        <div style={{ marginTop: 16, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
          {mode === "signin" ? (
            <>
              <a href="#" onClick={() => setMode("signup")}>Create account</a>
              <a href="#" onClick={() => setMode("request-otp")}>Forgot password?</a>
            </>
          ) : (
            <a href="#" onClick={() => setMode("signin")}>Back to sign in</a>
          )}
        </div>
      </form>
    </div>
  );
}
