import { supabase } from "../lib/supabaseClient";
import { useAuthContext } from "../context/AuthContext";

export function useAuth() {
  const { session, user, loading, signOut } = useAuthContext();

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password });

  /** Sends an OTP-based recovery code to the user's email (used by the password-reset flow). */
  const requestPasswordResetOtp = (email: string) =>
    supabase.auth.resetPasswordForEmail(email);

  /** Verifies the OTP the user received and sets a new password. */
  const verifyOtpAndSetPassword = async (email: string, token: string, newPassword: string) => {
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
    if (verifyError) return { error: verifyError };
    return supabase.auth.updateUser({ password: newPassword });
  };

  return { session, user, loading, signIn, signUp, signOut, requestPasswordResetOtp, verifyOtpAndSetPassword };
}
