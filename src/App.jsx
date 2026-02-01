import { useState, useEffect } from "react";
import "./index.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

export default function App() {
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // ⏱️ Countdown logic (FIXED)
  useEffect(() => {
    if (step !== "otp") return;
    if (canResend) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, canResend]);

  // 📩 Send OTP
  const sendOtp = async () => {
    if (mobile.length !== 10) {
      setMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://otp-login-backend-89aw.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSessionId(data.sessionId);
        setStep("otp");
        setTimer(30);
        setCanResend(false);
        setOtp("");
      } else {
        setMessage("Failed to send OTP");
      }
    } catch {
      setLoading(false);
      setMessage("Server error. Try again.");
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setMessage("Please enter OTP");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://otp-login-backend-89aw.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, otp }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
  localStorage.setItem("token", data.token);
  window.location.href = "/dashboard";
}
 else {
        setMessage("❌ Invalid OTP");
      }
    } catch {
      setLoading(false);
      setMessage("Verification failed");
    }
  };

  // 🔁 Resend OTP
  const resendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://otp-login-backend-89aw.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSessionId(data.sessionId);
        setTimer(30);
        setCanResend(false);
        setMessage("OTP resent successfully");
      } else {
        setMessage("Failed to resend OTP");
      }
    } catch {
      setLoading(false);
      setMessage("Server error");
    }
  };

  return (<Routes>
  <Route path="/" element={<div className="container">
      <div className="card">
        <div className="title">
          {step === "mobile" ? "Login with OTP" : "Verify OTP"}
        </div>

        <div className="subtitle">
          {step === "mobile"
            ? "We’ll send an OTP to your mobile number"
            : `OTP sent to +91 ******${mobile.slice(-2)}`}
        </div>

        {step === "mobile" && (
          <>
            <input
              className="input"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
            />

            <button className="button" onClick={sendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <input
              className="input"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button className="button" onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div
              className="link"
              style={{ color: canResend ? "#2563eb" : "#999" }}
              onClick={resendOtp}
            >
              {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
            </div>
          </>
        )}

        {message && <div className="message">{message}</div>}
      </div>
    </div>} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute> 
    }
  />
</Routes>
  );
}


    // <div className="container">
    //   <div className="card">
    //     <div className="title">
    //       {step === "mobile" ? "Login with OTP" : "Verify OTP"}
    //     </div>

    //     <div className="subtitle">
    //       {step === "mobile"
    //         ? "We’ll send an OTP to your mobile number"
    //         : `OTP sent to +91 ******${mobile.slice(-2)}`}
    //     </div>

    //     {step === "mobile" && (
    //       <>
    //         <input
    //           className="input"
    //           placeholder="Enter mobile number"
    //           value={mobile}
    //           onChange={(e) => setMobile(e.target.value)}
    //           maxLength={10}
    //         />

    //         <button className="button" onClick={sendOtp} disabled={loading}>
    //           {loading ? "Sending..." : "Send OTP"}
    //         </button>
    //       </>
    //     )}

    //     {step === "otp" && (
    //       <>
    //         <input
    //           className="input"
    //           placeholder="Enter OTP"
    //           value={otp}
    //           onChange={(e) => setOtp(e.target.value)}
    //         />

    //         <button className="button" onClick={verifyOtp} disabled={loading}>
    //           {loading ? "Verifying..." : "Verify OTP"}
    //         </button>

    //         <div
    //           className="link"
    //           style={{ color: canResend ? "#2563eb" : "#999" }}
    //           onClick={resendOtp}
    //         >
    //           {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
    //         </div>
    //       </>
    //     )}

    //     {message && <div className="message">{message}</div>}
    //   </div>
    // </div> 
  