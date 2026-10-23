import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../api/useAuth";

/**
 * Custom Hook: useLoginLogic
 * Quản lý toàn bộ state, validation và logic đăng nhập (tách biệt khỏi UI/UX)
 */
export function useLoginLogic() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Đọc identifier đã ghi nhớ (nếu có)
  const savedIdentifier = typeof window !== "undefined" ? localStorage.getItem("rememberIdentifier") || "" : "";

  // Khởi tạo React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      identifier: savedIdentifier,
      password: "",
      rememberMe: Boolean(savedIdentifier),
    },
    mode: "onTouched",
  });

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const clearServerError = () => {
    setServerError("");
  };

  /**
   * Xử lý submit form và gọi API login của Backend
   */
  const onSubmit = async (data) => {
    setServerError("");

    try {
      // Đấu nối API qua AuthContext (POST /api/v1/auth/login)
      const result = await login(data.identifier.trim(), data.password);

      if (result.success) {
        // Lưu tùy chọn ghi nhớ nếu cần
        if (data.rememberMe) {
          localStorage.setItem("rememberIdentifier", data.identifier.trim());
        } else {
          localStorage.removeItem("rememberIdentifier");
        }

        // Chuyển hướng sang trang Dashboard sau khi đăng nhập thành công
        navigate("/dashboard");
      } else {
        setServerError(result.message || "Invalid email/student ID or password.");
      }
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err);
      setServerError("Unable to connect to server. Please check your internet connection.");
    }
  };

  /**
   * Xử lý đăng nhập bằng Google
   */
  const handleGoogleLogin = () => {
    console.log("Kích hoạt luồng Google OAuth...");
    alert("Chức năng đăng nhập Google đang được tích hợp!");
  };

  /**
   * Xử lý đăng nhập bằng tài khoản FPT Student
   */
  const handleFptLogin = () => {
    console.log("Kích hoạt luồng FPT Student OAuth...");
    alert("Chức năng đăng nhập FPT Student đang được tích hợp!");
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading: authLoading || isSubmitting,
    showPassword,
    toggleShowPassword,
    serverError,
    clearServerError,
    handleGoogleLogin,
    handleFptLogin,
  };
}
