import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Calculates real-time password strength:
 * 0: Empty / very weak
 * 1: Weak (< 6 chars)
 * 2: Medium (>= 6 chars + numbers or mixed)
 * 3: Strong (>= 8 chars + number + symbol)
 */
export function getPasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      label: "Weak",
      color: "text-slate-400",
      barClass: "strength-bar-inactive",
      text: "Enter password",
    };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8 && (/\d/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password))) score += 1;
  if (password.length >= 8 && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score === 1) {
    return {
      score: 1,
      label: "Weak",
      color: "text-amber-500",
      barClass: "strength-bar-weak",
      text: "Weak password",
    };
  } else if (score === 2) {
    return {
      score: 2,
      label: "Medium",
      color: "text-blue-600",
      barClass: "strength-bar-medium",
      text: "Medium password",
    };
  } else if (score === 3) {
    return {
      score: 3,
      label: "Strong",
      color: "text-emerald-600",
      barClass: "strength-bar-strong",
      text: "Strong password",
    };
  }

  return {
    score: 1,
    label: "Weak",
    color: "text-amber-500",
    barClass: "strength-bar-weak",
    text: "Weak password",
  };
}

/**
 * Custom Hook: useRegisterLogic
 * Manages registration state, real-time validation, password strength, and backend API integration
 */
export function useRegisterLogic() {
  const navigate = useNavigate();
  const { register: authRegister, isLoading: authLoading } = useAuth();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status and error states
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const strength = getPasswordStrength(password);
  const isLoading = authLoading || submitting;

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);
  const clearServerError = () => setServerError("");

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!agreeTerms) {
      errors.agreeTerms = "You must agree to the Terms of Service & Privacy Policy.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Backend RegisterRequest expects: Email, Password, ConfirmPassword, FirstName, LastName, Role
      const trimmedName = fullName.trim();
      const nameParts = trimmedName.split(/\s+/);
      const firstName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts[0] : "Student";

      const result = await authRegister({
        email: email.trim(),
        password,
        confirmPassword,
        firstName,
        lastName,
        role: "Student",
        fullName: trimmedName,
      });

      if (result.success) {
        setSuccessMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setServerError(result.message || "Registration failed. Please check your information.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setServerError("Unable to connect to the server. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    agreeTerms,
    setAgreeTerms,
    showPassword,
    toggleShowPassword,
    showConfirmPassword,
    toggleShowConfirmPassword,
    strength,
    isLoading,
    formErrors,
    setFormErrors,
    serverError,
    clearServerError,
    successMessage,
    handleSubmit,
  };
}
