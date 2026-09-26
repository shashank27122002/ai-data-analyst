import {
  useState,
  type FormEvent,
} from "react";

import {
  login,
  register,
} from "./api/api";


// ============================================================
// TYPES
// ============================================================

interface AuthProps {
  onLoginSuccess: () => void;
}


// ============================================================
// COMPONENT
// ============================================================

function Auth({
  onLoginSuccess,
}: AuthProps) {

  const [mode, setMode] =
    useState<"login" | "register">(
      "login"
    );

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!email.trim()) {

      setError(
        "Please enter your email."
      );

      return;
    }


    if (password.length < 8) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }


    // ========================================================
    // REGISTER
    // ========================================================

    if (mode === "register") {

      if (
        password !==
        confirmPassword
      ) {

        setError(
          "Passwords do not match."
        );

        return;
      }


      try {

        setLoading(true);


        await register({
          email:
            email.trim(),

          password,
        });


        setSuccess(
          "Registration successful. You can now log in."
        );


        setMode("login");

        setPassword("");

        setConfirmPassword("");


      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : "Registration failed."
        );

      } finally {

        setLoading(false);
      }


      return;
    }


    // ========================================================
    // LOGIN
    // ========================================================

    try {

      setLoading(true);


      await login({
        email:
          email.trim(),

        password,
      });


      onLoginSuccess();


    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Login failed."
      );

    } finally {

      setLoading(false);
    }
  }


  // ==========================================================
  // SWITCH MODE
  // ==========================================================

  function switchMode(
    nextMode: "login" | "register"
  ) {

    setMode(nextMode);

    setError("");

    setSuccess("");

    setPassword("");

    setConfirmPassword("");
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f4f7fb 0%, #e8eef7 100%)",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "36px",
          boxSizing: "border-box",
          boxShadow:
            "0 20px 50px rgba(0, 0, 0, 0.10)",
        }}
      >

        {/* ================================================== */}
        {/* BRAND */}
        {/* ================================================== */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >

          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "16px",
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#111827",
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            AI
          </div>


          <h1
            style={{
              margin: 0,
              fontSize: "25px",
              color: "#111827",
            }}
          >
            AI Data Analyst
          </h1>


          <p
            style={{
              margin:
                "8px 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Intelligent analytics platform
          </p>

        </div>


        {/* ================================================== */}
        {/* TABS */}
        {/* ================================================== */}

        <div
          style={{
            display: "flex",
            background: "#f3f4f6",
            borderRadius: "10px",
            padding: "4px",
            marginBottom: "24px",
          }}
        >

          <button
            type="button"
            onClick={() =>
              switchMode("login")
            }
            style={{
              flex: 1,
              border: "none",
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
              fontWeight: 600,
              background:
                mode === "login"
                  ? "#ffffff"
                  : "transparent",
              color:
                mode === "login"
                  ? "#111827"
                  : "#6b7280",
              boxShadow:
                mode === "login"
                  ? "0 1px 4px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            Login
          </button>


          <button
            type="button"
            onClick={() =>
              switchMode("register")
            }
            style={{
              flex: 1,
              border: "none",
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
              fontWeight: 600,
              background:
                mode === "register"
                  ? "#ffffff"
                  : "transparent",
              color:
                mode === "register"
                  ? "#111827"
                  : "#6b7280",
              boxShadow:
                mode === "register"
                  ? "0 1px 4px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            Register
          </button>

        </div>


        {/* ================================================== */}
        {/* FORM */}
        {/* ================================================== */}

        <form
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >

            <label
              htmlFor="auth-email"
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Email
            </label>


            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding:
                  "12px 14px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "9px",
                outline: "none",
                fontSize: "14px",
              }}
            />

          </div>


          {/* PASSWORD */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >

            <label
              htmlFor="auth-password"
              style={{
                display: "block",
                marginBottom: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Password
            </label>


            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter your password"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding:
                  "12px 14px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "9px",
                outline: "none",
                fontSize: "14px",
              }}
            />

          </div>


          {/* CONFIRM PASSWORD */}

          {mode === "register" && (

            <div
              style={{
                marginBottom: "18px",
              }}
            >

              <label
                htmlFor="auth-confirm-password"
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Confirm Password
              </label>


              <input
                id="auth-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={loading}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding:
                    "12px 14px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "9px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

            </div>

          )}


          {/* ERROR */}

          {error && (

            <div
              style={{
                marginBottom: "16px",
                padding: "11px 13px",
                borderRadius: "8px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "13px",
              }}
            >
              {error}
            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div
              style={{
                marginBottom: "16px",
                padding: "11px 13px",
                borderRadius: "8px",
                background: "#ecfdf5",
                color: "#047857",
                fontSize: "13px",
              }}
            >
              {success}
            </div>

          )}


          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "9px",
              padding: "13px",
              background: "#111827",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              opacity:
                loading
                  ? 0.7
                  : 1,
            }}
          >

            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}

          </button>

        </form>


        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <p
          style={{
            margin:
              "22px 0 0",
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "12px",
          }}
        >
          Secure authentication
        </p>

      </div>

    </div>
  );
}


export default Auth;