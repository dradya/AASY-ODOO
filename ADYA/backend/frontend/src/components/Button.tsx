import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const colors: Record<Variant, string> = {
  primary: "#2563eb",
  secondary: "#6b7280",
  danger: "#dc2626",
};

export default function Button({ variant = "primary", style, ...rest }: Props) {
  return (
    <button
      {...rest}
      style={{
        background: colors[variant],
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "8px 16px",
        cursor: "pointer",
        fontSize: 14,
        ...style,
      }}
    />
  );
}
