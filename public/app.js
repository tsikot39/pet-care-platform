// Pet Care Platform Frontend JavaScript

const API_BASE = "http://localhost:8001/api";
let authToken = localStorage.getItem("authToken");
let currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM Content Loaded - App initializing...");

  // Test if register function is available
  if (typeof register === "function") {
    console.log("✅ register function is available");
  } else {
    console.error("❌ register function is NOT available");
  }

  // Test if button exists
  const registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    console.log("✅ Register button found:", registerBtn);
  } else {
    console.error("❌ Register button NOT found");
  }

  checkConnection();
  updateAuthStatus();
});

// Form validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // At least 6 characters, contains at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
}

function validatePhone(phone) {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

function validateName(name) {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const existingError = field.parentNode.querySelector(".field-error");

  // Remove existing error
  if (existingError) {
    existingError.remove();
  }

  // Add new error
  if (message) {
    field.style.borderColor = "#e53e3e";
    field.classList.add("error");
    const errorEl = document.createElement("div");
    errorEl.className = "field-error";
    errorEl.style.color = "#e53e3e";
    errorEl.style.fontSize = "12px";
    errorEl.style.marginTop = "5px";
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
  } else {
    field.style.borderColor = "#38a169";
    field.classList.remove("error");
    field.classList.add("valid");
  }
}

function clearFieldErrors() {
  document.querySelectorAll(".field-error").forEach((error) => error.remove());
  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.style.borderColor = "#e2e8f0";
    field.classList.remove("error", "valid");
  });
}

// Enhanced password strength checker
function checkPasswordStrength(password) {
  let score = 0;
  let feedback = [];

  if (password.length >= 8) score++;
  else feedback.push("Use at least 8 characters");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Include uppercase letters");

  if (/\d/.test(password)) score++;
  else feedback.push("Include numbers");

  if (/[^A-Za-z\d]/.test(password)) score++;
  else feedback.push("Include special characters");

  const strength = ["Very Weak", "Weak", "Fair", "Good", "Strong"][score];
  return { score, strength, feedback };
}

function validateSingleField(fieldId) {
  const field = document.getElementById(fieldId);
  const value = field.value.trim();

  switch (fieldId) {
    case "regName":
      if (!value) {
        showFieldError(fieldId, "Name is required");
      } else if (value.length < 2) {
        showFieldError(fieldId, "Name must be at least 2 characters");
      } else if (value.length > 50) {
        showFieldError(fieldId, "Name must be less than 50 characters");
      } else if (!/^[a-zA-Z\s\-'\.]+$/.test(value)) {
        showFieldError(
          fieldId,
          "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
        );
      } else {
        showFieldError(fieldId, null);
      }
      break;

    case "regEmail":
      if (!value) {
        showFieldError(fieldId, "Email is required");
      } else if (!validateEmail(value)) {
        showFieldError(fieldId, "Please enter a valid email address");
      } else if (value.length > 100) {
        showFieldError(fieldId, "Email must be less than 100 characters");
      } else {
        showFieldError(fieldId, null);
      }
      break;

    case "regPassword":
      if (!value) {
        showFieldError(fieldId, "Password is required");
      } else if (value.length < 6) {
        showFieldError(fieldId, "Password must be at least 6 characters long");
      } else if (!validatePassword(value)) {
        showFieldError(
          fieldId,
          "Password must contain at least one letter and one number"
        );
      } else {
        const strengthCheck = checkPasswordStrength(value);
        if (strengthCheck.score < 2) {
          showFieldError(
            fieldId,
            `Weak password. ${strengthCheck.feedback.slice(0, 2).join(", ")}`
          );
        } else {
          showFieldError(fieldId, null);
          // Show strength indicator
          const strengthEl =
            field.parentNode.querySelector(".password-strength");
          if (strengthEl) {
            strengthEl.textContent = `Strength: ${strengthCheck.strength}`;
            strengthEl.className = `password-strength strength-${strengthCheck.score}`;
          }
        }
      }
      break;

    case "regRole":
      if (!value) {
        showFieldError(fieldId, "Please select a role");
      } else if (!["owner", "sitter"].includes(value)) {
        showFieldError(fieldId, "Please select a valid role");
      } else {
        showFieldError(fieldId, null);
      }
      break;

    case "regPhone":
      if (value && !validatePhone(value)) {
        showFieldError(
          fieldId,
          "Please enter a valid phone number (e.g., +1234567890 or 1234567890)"
        );
      } else if (
        value &&
        (value.replace(/\D/g, "").length < 10 ||
          value.replace(/\D/g, "").length > 15)
      ) {
        showFieldError(
          fieldId,
          "Phone number must be between 10 and 15 digits"
        );
      } else {
        showFieldError(fieldId, null);
      }
      break;
  }
}

// Login field validation
function validateLoginField(fieldId) {
  const field = document.getElementById(fieldId);
  const value = field.value.trim();

  switch (fieldId) {
    case "loginEmail":
      if (!value) {
        showFieldError(fieldId, "Email is required");
      } else if (!validateEmail(value)) {
        showFieldError(fieldId, "Please enter a valid email address");
      } else {
        showFieldError(fieldId, null);
      }
      break;

    case "loginPassword":
      if (!value) {
        showFieldError(fieldId, "Password is required");
      } else if (value.length < 6) {
        showFieldError(fieldId, "Password must be at least 6 characters");
      } else {
        showFieldError(fieldId, null);
      }
      break;
  }
}

// Enhanced validation functions

// Real-time validation for non-password fields
function realTimeValidation(fieldId) {
  const field = document.getElementById(fieldId);
  const value = field.value.trim();

  // Only validate if field has content (except for required fields on blur)
  if (value.length > 0) {
    validateSingleField(fieldId);
  } else {
    // Clear validation state for empty optional fields
    if (!field.required || field.id === "regPhone") {
      showFieldError(fieldId, null);
      field.classList.remove("error", "valid");
      field.style.borderColor = "#e2e8f0";
    }
  }
}

// Real-time password validation with strength indicator
function realTimePasswordValidation(fieldId) {
  const field = document.getElementById(fieldId);
  const value = field.value; // Don't trim password as spaces might be intentional
  const strengthEl = document.getElementById(fieldId + "Strength");

  // Clear any existing errors first
  const existingError = field.parentNode.querySelector(".field-error");
  if (existingError) {
    existingError.remove();
  }

  if (value.length === 0) {
    // Empty field - hide strength indicator and reset styling
    if (strengthEl) {
      strengthEl.style.display = "none";
    }
    field.classList.remove("error", "valid");
    field.style.borderColor = "#e2e8f0";
    return;
  }

  if (value.length < 6) {
    // Show error for password too short
    showFieldError(fieldId, "Password must be at least 6 characters long");
    if (strengthEl) strengthEl.style.display = "none";
    return;
  }

  // Password is 6+ characters, check strength and other requirements
  const strengthCheck = checkPasswordStrength(value);

  if (strengthEl) {
    strengthEl.style.display = "block";
    strengthEl.textContent = `Strength: ${strengthCheck.strength}`;
    strengthEl.className = `password-strength strength-${strengthCheck.score}`;
  }

  if (!validatePassword(value)) {
    showFieldError(
      fieldId,
      "Password must contain at least one letter and one number"
    );
  } else if (strengthCheck.score < 2) {
    showFieldError(
      fieldId,
      `Weak password. Try: ${strengthCheck.feedback.slice(0, 2).join(", ")}`
    );
  } else {
    showFieldError(fieldId, null);
  }
}

// Phone number formatting
function formatPhoneNumber(input) {
  let value = input.value.replace(/\D/g, ""); // Remove all non-digits

  if (value.length === 0) {
    input.value = "";
    return;
  }

  // Format based on length and patterns
  if (value.startsWith("1") && value.length === 11) {
    // US number with country code
    input.value = `+1 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(
      7
    )}`;
  } else if (value.length === 10 && !value.startsWith("1")) {
    // US number without country code
    input.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(
      6
    )}`;
  } else if (value.length > 10) {
    // International number
    input.value = `+${value}`;
  } else {
    // Partial number, don't format yet
    input.value = value;
  }

  // Trigger validation
  validateSingleField(input.id);
}

// Form validation summary
function updateValidationSummary(formType, errors) {
  const summaryEl = document.getElementById(formType + "ValidationSummary");
  const listEl = document.getElementById(formType + "ValidationList");

  if (errors.length === 0) {
    summaryEl.style.display = "none";
    return;
  }

  listEl.innerHTML = errors.map((error) => `<li>${error}</li>`).join("");
  summaryEl.style.display = "block";

  // Scroll to summary
  summaryEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Enhanced registration validation with summary
function validateRegistrationForm() {
  clearFieldErrors();
  let errors = [];

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;
  const phone = document.getElementById("regPhone").value.trim();

  // Validate name
  if (!name) {
    showFieldError("regName", "Name is required");
    errors.push("Please enter your full name");
  } else if (!validateName(name)) {
    showFieldError("regName", "Name must be between 2 and 50 characters");
    errors.push("Name must be between 2 and 50 characters");
  } else if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
    showFieldError(
      "regName",
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
    );
    errors.push("Name contains invalid characters");
  } else {
    showFieldError("regName", null);
  }

  // Validate email
  if (!email) {
    showFieldError("regEmail", "Email is required");
    errors.push("Please enter your email address");
  } else if (!validateEmail(email)) {
    showFieldError("regEmail", "Please enter a valid email address");
    errors.push("Please enter a valid email address");
  } else if (email.length > 100) {
    showFieldError("regEmail", "Email must be less than 100 characters");
    errors.push("Email address is too long");
  } else {
    showFieldError("regEmail", null);
  }

  // Validate password
  if (!password) {
    showFieldError("regPassword", "Password is required");
    errors.push("Please create a password");
  } else if (password.length < 6) {
    showFieldError(
      "regPassword",
      "Password must be at least 6 characters long"
    );
    errors.push("Password must be at least 6 characters long");
  } else if (!validatePassword(password)) {
    showFieldError(
      "regPassword",
      "Password must contain at least one letter and one number"
    );
    errors.push("Password must contain at least one letter and one number");
  } else {
    const strengthCheck = checkPasswordStrength(password);
    if (strengthCheck.score < 2) {
      showFieldError(
        "regPassword",
        `Password is too weak. ${strengthCheck.feedback.slice(0, 2).join(", ")}`
      );
      errors.push("Password is too weak - please make it stronger");
    } else {
      showFieldError("regPassword", null);
    }
  }

  // Validate role
  if (!role) {
    showFieldError("regRole", "Please select a role");
    errors.push("Please select your account type");
  } else if (!["owner", "sitter"].includes(role)) {
    showFieldError("regRole", "Please select a valid role");
    errors.push("Please select a valid account type");
  } else {
    showFieldError("regRole", null);
  }

  // Validate phone (optional)
  if (phone && !validatePhone(phone)) {
    showFieldError("regPhone", "Please enter a valid phone number");
    errors.push("Please enter a valid phone number");
  } else if (
    phone &&
    (phone.replace(/\D/g, "").length < 10 ||
      phone.replace(/\D/g, "").length > 15)
  ) {
    showFieldError("regPhone", "Phone number must be between 10 and 15 digits");
    errors.push("Phone number must be between 10 and 15 digits");
  } else {
    showFieldError("regPhone", null);
  }

  // Update validation summary
  updateValidationSummary("reg", errors);

  return errors.length === 0;
}

// Enhanced login validation with summary
function validateLoginForm() {
  clearFieldErrors();
  let errors = [];

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Validate email
  if (!email) {
    showFieldError("loginEmail", "Email is required");
    errors.push("Please enter your email address");
  } else if (!validateEmail(email)) {
    showFieldError("loginEmail", "Please enter a valid email address");
    errors.push("Please enter a valid email address");
  } else {
    showFieldError("loginEmail", null);
  }

  // Validate password
  if (!password) {
    showFieldError("loginPassword", "Password is required");
    errors.push("Please enter your password");
  } else if (password.length < 6) {
    showFieldError("loginPassword", "Password must be at least 6 characters");
    errors.push("Password must be at least 6 characters");
  } else {
    showFieldError("loginPassword", null);
  }

  // Update validation summary
  updateValidationSummary("login", errors);

  return errors.length === 0;
}

// Utility Functions
function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  document.getElementById(tabName).classList.add("active");

  // Add active class to clicked button
  event.target.classList.add("active");
}

function showResponse(responseId, data, isError = false) {
  const responseEl = document.getElementById(responseId);
  responseEl.style.display = "block";
  responseEl.className = `response ${isError ? "error" : "success"}`;
  responseEl.textContent = JSON.stringify(data, null, 2);
}

function getAuthHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function makeRequest(url, options = {}) {
  try {
    console.log("🌐 Making request to:", url, options); // Debug log

    const requestOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options.headers,
      },
    };

    console.log("📋 Request options:", requestOptions); // Debug log

    const response = await fetch(url, requestOptions);

    console.log("📡 Response status:", response.status, response.statusText); // Debug log
    console.log("📡 Response headers:", [...response.headers.entries()]); // Debug log

    const data = await response.json();
    console.log("📦 Response data:", data); // Debug log

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("💥 Request failed:", error); // Debug log
    console.error("💥 Error details:", error.message, error.stack); // Debug log
    throw error;
  }
}

// Connection Check
async function checkConnection() {
  try {
    const response = await fetch("http://localhost:8001/health");
    const data = await response.json();

    if (response.ok) {
      document.getElementById("connectionStatus").textContent = "Connected ✅";
      document.getElementById("connectionStatus").className =
        "status connected";
    } else {
      throw new Error("Health check failed");
    }
  } catch (error) {
    document.getElementById("connectionStatus").textContent = "Disconnected ❌";
    document.getElementById("connectionStatus").className =
      "status disconnected";
  }
}

// Authentication Functions
function updateAuthStatus() {
  const authStatusEl = document.getElementById("authStatus");
  const tokenDisplayEl = document.getElementById("tokenDisplay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (authToken && currentUser) {
    authStatusEl.innerHTML = `
            <strong>Logged in as:</strong> ${currentUser.name} (${currentUser.email})<br>
            <strong>Role:</strong> ${currentUser.role}
        `;
    tokenDisplayEl.style.display = "block";
    tokenDisplayEl.textContent = `Token: ${authToken.substring(0, 50)}...`;
    logoutBtn.style.display = "inline-block";
  } else {
    authStatusEl.textContent = "Not logged in";
    tokenDisplayEl.style.display = "none";
    logoutBtn.style.display = "none";
  }
}

async function register() {
  console.log("🔄 Register function called"); // Debug log

  try {
    // Validate form before making request
    console.log("🔍 Validating registration form..."); // Debug log
    const validationResult = validateRegistrationForm();
    console.log("✅ Validation result:", validationResult); // Debug log

    if (!validationResult) {
      console.log("❌ Form validation failed"); // Debug log
      showResponse(
        "authResponse",
        {
          error: "Please fix the validation errors above",
        },
        true
      );
      return;
    }

    console.log("✅ Form validation passed"); // Debug log

    // Get form values (already validated)
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("regRole").value;
    const phone = document.getElementById("regPhone").value.trim() || undefined;

    const userData = {
      name,
      email,
      password,
      role,
      phone,
    };

    console.log("📝 User data to send:", { ...userData, password: "[HIDDEN]" }); // Debug log without password

    // Show loading state - use ID selector instead
    const registerBtn = document.getElementById("registerBtn");
    if (!registerBtn) {
      console.error("❌ Register button not found!");
      return;
    }

    console.log("🔘 Button found, setting loading state..."); // Debug log

    const originalText = registerBtn.textContent;
    registerBtn.textContent = "Creating Account...";
    registerBtn.disabled = true;

    console.log("🌐 Making API request to:", `${API_BASE}/auth/register`); // Debug log

    const data = await makeRequest(`${API_BASE}/auth/register`, {
      method: "POST",
      body: JSON.stringify(userData),
    });

    console.log("🎉 Registration successful:", data); // Debug log

    authToken = data.token;
    currentUser = data.data.user;
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    updateAuthStatus();
    showResponse("authResponse", {
      message: "Account created successfully!",
      user: {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      },
    });

    // Clear form
    document.getElementById("regName").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPassword").value = "";
    document.getElementById("regRole").value = "";
    document.getElementById("regPhone").value = "";

    // Hide password strength indicator
    const strengthEl = document.getElementById("regPasswordStrength");
    if (strengthEl) strengthEl.style.display = "none";

    // Clear validation states
    clearFieldErrors();
    updateValidationSummary("reg", []);

    // Reset button
    registerBtn.textContent = originalText;
    registerBtn.disabled = false;
  } catch (error) {
    console.error("Registration error:", error); // Debug log

    // Reset button
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
      registerBtn.textContent = "Create Account";
      registerBtn.disabled = false;
    }

    // Handle specific validation errors from server
    if (
      error.message.includes("email already exists") ||
      error.message.includes("duplicate")
    ) {
      showFieldError("regEmail", "This email is already registered");
      showResponse(
        "authResponse",
        {
          error:
            "Email already exists. Please use a different email or try logging in.",
        },
        true
      );
    } else {
      showResponse(
        "authResponse",
        {
          error: error.message,
          details: error.toString(),
        },
        true
      );
    }
  }
}

async function login() {
  console.log("🔐 Login function called"); // Debug log

  try {
    // Validate form before making request
    console.log("🔍 Validating login form..."); // Debug log
    const validationResult = validateLoginForm();
    console.log("✅ Login validation result:", validationResult); // Debug log

    if (!validationResult) {
      console.log("❌ Login form validation failed"); // Debug log
      showResponse(
        "authResponse",
        {
          error: "Please fix the validation errors above",
        },
        true
      );
      return;
    }

    console.log("✅ Login form validation passed"); // Debug log

    const credentials = {
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value,
    };

    console.log("🔑 Attempting login for:", credentials.email); // Debug log

    // Show loading state
    const loginBtn = document.getElementById("loginBtn");
    if (!loginBtn) {
      console.error("❌ Login button not found!");
      return;
    }

    const originalText = loginBtn.textContent;
    loginBtn.textContent = "Signing In...";
    loginBtn.disabled = true;

    console.log("🌐 Making login API request..."); // Debug log

    const data = await makeRequest(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    console.log("🎉 Login successful:", data); // Debug log

    authToken = data.token;
    currentUser = data.data.user;
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    updateAuthStatus();
    showResponse("authResponse", {
      message: "Login successful!",
      user: {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      },
    });

    // Clear form and validation states
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    clearFieldErrors();
    updateValidationSummary("login", []);

    // Reset button
    loginBtn.textContent = originalText;
    loginBtn.disabled = false;
  } catch (error) {
    console.error("💥 Login error:", error); // Debug log
    console.error("💥 Error message:", error.message); // Debug log

    // Reset button state
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.textContent = "Sign In";
      loginBtn.disabled = false;
    }

    // Clear any existing field errors first
    clearFieldErrors();

    // Handle different types of authentication errors
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("invalid") ||
      errorMessage.includes("credentials") ||
      errorMessage.includes("password") ||
      errorMessage.includes("email") ||
      errorMessage.includes("user not found") ||
      errorMessage.includes("unauthorized")
    ) {
      console.log("🚫 Authentication failed - invalid credentials"); // Debug log

      // Show field-level errors
      showFieldError("loginEmail", "Invalid email or password");
      showFieldError("loginPassword", "Invalid email or password");

      // Show detailed response
      showResponse(
        "authResponse",
        {
          error: "❌ Login Failed",
          message:
            "The email address or password you entered is incorrect. Please check your credentials and try again.",
          details:
            "If you forgot your password, please use the password reset feature.",
          hint: "Make sure your email is spelled correctly and your password matches exactly.",
        },
        true
      );
    } else if (
      errorMessage.includes("network") ||
      errorMessage.includes("fetch")
    ) {
      console.log("🌐 Network error during login"); // Debug log

      showResponse(
        "authResponse",
        {
          error: "🌐 Connection Error",
          message:
            "Unable to connect to the server. Please check your internet connection and try again.",
          details: error.message,
        },
        true
      );
    } else {
      console.log("❓ Unexpected login error"); // Debug log

      showResponse(
        "authResponse",
        {
          error: "⚠️ Login Error",
          message:
            "An unexpected error occurred during login. Please try again.",
          details: error.message,
        },
        true
      );
    }
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  updateAuthStatus();
  showResponse("authResponse", { message: "Logged out successfully" });
}

// Pet Functions
async function addPet() {
  if (!authToken) {
    showResponse("petsResponse", { error: "Please login first" }, true);
    return;
  }

  if (currentUser.role !== "owner") {
    showResponse(
      "petsResponse",
      { error: "Only pet owners can add pets" },
      true
    );
    return;
  }

  try {
    // Debug: Check if form elements exist
    const nameElement = document.getElementById("petName");
    const speciesElement = document.getElementById("petSpecies");

    console.log("Name element:", nameElement);
    console.log("Species element:", speciesElement);
    console.log("Name value:", nameElement?.value);
    console.log("Species value:", speciesElement?.value);

    // Create FormData for file upload
    const formData = new FormData();

    // Add text fields
    const name = nameElement?.value || "";
    const species = speciesElement?.value || "";
    const breed = document.getElementById("petBreed")?.value || "";
    const age = document.getElementById("petAge")?.value || "";
    const weight = document.getElementById("petWeight")?.value || "";
    const gender = document.getElementById("petGender")?.value || "";
    const color = document.getElementById("petColor")?.value || "";
    const specialNeeds =
      document.getElementById("petSpecialNeeds")?.value || "";
    const vaccinated = document.getElementById("petVaccinated")?.checked;
    const microchipped = document.getElementById("petMicrochipped")?.checked;

    console.log("Form values:", {
      name,
      species,
      breed,
      age,
      weight,
      gender,
      color,
      specialNeeds,
      vaccinated,
      microchipped,
    });

    formData.append("name", name);
    formData.append("species", species);
    if (breed) formData.append("breed", breed);
    if (age) formData.append("age", age);
    if (weight) formData.append("weight", weight);
    if (gender) formData.append("gender", gender);
    if (color) formData.append("color", color);
    if (specialNeeds) formData.append("specialNeeds", specialNeeds);
    formData.append("vaccinated", vaccinated);
    formData.append("microchipped", microchipped);

    // Add photo files
    const photoFiles = document.getElementById("petPhotos")?.files || [];
    for (let i = 0; i < photoFiles.length; i++) {
      formData.append("photos", photoFiles[i]);
    }

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await fetch(`${API_BASE}/pets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    showResponse("petsResponse", data);

    // Clear form
    if (nameElement) nameElement.value = "";
    if (document.getElementById("petBreed"))
      document.getElementById("petBreed").value = "";
    if (document.getElementById("petAge"))
      document.getElementById("petAge").value = "";
    if (document.getElementById("petWeight"))
      document.getElementById("petWeight").value = "";
    if (document.getElementById("petGender"))
      document.getElementById("petGender").value = "";
    if (document.getElementById("petColor"))
      document.getElementById("petColor").value = "";
    if (document.getElementById("petSpecialNeeds"))
      document.getElementById("petSpecialNeeds").value = "";
    if (document.getElementById("petVaccinated"))
      document.getElementById("petVaccinated").checked = false;
    if (document.getElementById("petMicrochipped"))
      document.getElementById("petMicrochipped").checked = false;
    if (document.getElementById("petPhotos"))
      document.getElementById("petPhotos").value = "";

    // Refresh pets list
    loadPets();
  } catch (error) {
    showResponse("petsResponse", { error: error.message }, true);
  }
}

async function loadPets() {
  if (!authToken) {
    showResponse("petsResponse", { error: "Please login first" }, true);
    return;
  }

  if (currentUser.role !== "owner") {
    showResponse(
      "petsResponse",
      { error: "Only pet owners can view pets" },
      true
    );
    return;
  }

  try {
    const data = await makeRequest(`${API_BASE}/pets`);

    const petsListEl = document.getElementById("petsList");
    if (data.data.pets.length === 0) {
      petsListEl.innerHTML = "<p>No pets found. Add your first pet!</p>";
    } else {
      petsListEl.innerHTML = data.data.pets
        .map((pet) => {
          // Helper function to format date
          const formatDate = (dateString) => {
            if (!dateString) return "Not specified";
            return new Date(dateString).toLocaleDateString();
          };

          // Helper function to display array data
          const formatArray = (arr) => {
            if (!arr || arr.length === 0) return "None";
            return arr.join(", ");
          };

          return `
                <div data-pet-id="${pet._id}" data-pet-name="${
            pet.name
          }" style="border: 1px solid #e2e8f0; padding: 15px; margin: 10px 0; border-radius: 8px; background: #f8fafc;">
                    <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #2d3748;">🐕 ${
                          pet.name
                        }</h4>
                        <small style="color: #718096;">ID: ${pet._id}</small>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <strong>Species:</strong> ${
                              pet.species || "Not specified"
                            }
                        </div>
                        <div>
                            <strong>Breed:</strong> ${
                              pet.breed || "Not specified"
                            }
                        </div>
                        <div>
                            <strong>Age:</strong> ${
                              pet.age ? `${pet.age} years old` : "Not specified"
                            }
                        </div>
                        <div>
                            <strong>Weight:</strong> ${
                              pet.weight ? `${pet.weight} lbs` : "Not specified"
                            }
                        </div>
                        <div>
                            <strong>Gender:</strong> ${pet.gender || "Unknown"}
                        </div>
                        <div>
                            <strong>Color:</strong> ${
                              pet.color || "Not specified"
                            }
                        </div>
                    </div>
                    
                    ${
                      pet.specialNeeds
                        ? `
                        <div style="margin-bottom: 10px;">
                            <strong>Special Needs:</strong><br>
                            <span style="background: #fef5e7; padding: 5px; border-radius: 4px; display: inline-block; margin-top: 5px;">
                                ${pet.specialNeeds}
                            </span>
                        </div>
                    `
                        : ""
                    }
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <strong>Vaccinated:</strong> ${
                              pet.vaccinated === true
                                ? "✅ Yes"
                                : pet.vaccinated === false
                                ? "❌ No"
                                : "❓ Unknown"
                            }
                        </div>
                        <div>
                            <strong>Microchipped:</strong> ${
                              pet.microchipped === true
                                ? "✅ Yes"
                                : pet.microchipped === false
                                ? "❌ No"
                                : "❓ Unknown"
                            }
                        </div>
                    </div>
                    
                    ${
                      pet.medications && pet.medications.length > 0
                        ? `
                        <div style="margin-bottom: 10px;">
                            <strong>Medications:</strong> ${formatArray(
                              pet.medications
                            )}
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      pet.allergies && pet.allergies.length > 0
                        ? `
                        <div style="margin-bottom: 10px;">
                            <strong>Allergies:</strong> ${formatArray(
                              pet.allergies
                            )}
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      pet.vetInfo
                        ? `
                        <div style="margin-bottom: 10px; background: #e6fffa; padding: 10px; border-radius: 5px;">
                            <strong>🏥 Veterinarian Information:</strong><br>
                            ${
                              pet.vetInfo.name
                                ? `Name: ${pet.vetInfo.name}<br>`
                                : ""
                            }
                            ${
                              pet.vetInfo.phone
                                ? `Phone: ${pet.vetInfo.phone}<br>`
                                : ""
                            }
                            ${
                              pet.vetInfo.address
                                ? `Address: ${pet.vetInfo.address}<br>`
                                : ""
                            }
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      pet.emergencyContact
                        ? `
                        <div style="margin-bottom: 10px; background: #fed7d7; padding: 10px; border-radius: 5px;">
                            <strong>🚨 Emergency Contact:</strong><br>
                            ${
                              pet.emergencyContact.name
                                ? `Name: ${pet.emergencyContact.name}<br>`
                                : ""
                            }
                            ${
                              pet.emergencyContact.phone
                                ? `Phone: ${pet.emergencyContact.phone}<br>`
                                : ""
                            }
                            ${
                              pet.emergencyContact.relationship
                                ? `Relationship: ${pet.emergencyContact.relationship}<br>`
                                : ""
                            }
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      pet.photos && pet.photos.length > 0
                        ? `
                        <div style="margin-bottom: 10px;">
                            <strong>📸 Photos:</strong><br>
                            <div style="display: flex; gap: 10px; margin-top: 5px; flex-wrap: wrap;">
                                ${pet.photos
                                  .map(
                                    (photo, index) => `
                                    <img src="${photo}" alt="${
                                      pet.name
                                    } photo ${index + 1}" 
                                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; border: 1px solid #e2e8f0;">
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }
                    
                    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096;">
                        <strong>Created:</strong> ${formatDate(
                          pet.createdAt
                        )} | 
                        <strong>Last Updated:</strong> ${formatDate(
                          pet.updatedAt
                        )}
                    </div>
                    
                    <div style="margin-top: 10px;">
                        <button onclick="editPet('${
                          pet._id
                        }')" style="background: #4299e1; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-right: 5px; cursor: pointer;">
                            ✏️ Edit
                        </button>
                        <button onclick="deletePet('${
                          pet._id
                        }')" style="background: #f56565; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        })
        .join("");
    }

    showResponse("petsResponse", data);
  } catch (error) {
    showResponse("petsResponse", { error: error.message }, true);
  }
}

// Service Functions
async function loadAllServices() {
  try {
    const data = await makeRequest(`${API_BASE}/services`);
    showResponse("servicesResponse", data);
  } catch (error) {
    showResponse("servicesResponse", { error: error.message }, true);
  }
}

async function searchServices() {
  try {
    const city = document.getElementById("searchCity").value;
    const serviceType = document.getElementById("searchServiceType").value;
    const petType = document.getElementById("searchPetType").value;

    let query = new URLSearchParams();
    if (city) query.append("city", city);
    if (serviceType) query.append("serviceType", serviceType);
    if (petType) query.append("petType", petType);

    const url = `${API_BASE}/services/search?${query.toString()}`;
    const data = await makeRequest(url);

    showResponse("servicesResponse", data);
  } catch (error) {
    showResponse("servicesResponse", { error: error.message }, true);
  }
}

async function createService() {
  if (!authToken) {
    showResponse("servicesResponse", { error: "Please login first" }, true);
    return;
  }

  if (currentUser.role !== "sitter") {
    showResponse(
      "servicesResponse",
      { error: "Only pet sitters can create services" },
      true
    );
    return;
  }

  try {
    const address = document.getElementById("serviceAddress").value;

    const serviceData = {
      title: document.getElementById("serviceTitle").value,
      serviceType: document.getElementById("serviceType").value,
      description: document.getElementById("serviceDescription").value,
      price: parseFloat(document.getElementById("servicePrice").value),
      location: {
        address: address,
        city: "Austin", // Default for demo
        state: "TX", // Default for demo
        zipCode: "78701", // Default for demo
      },
      petTypes: ["dog", "cat"], // Default for demo
      priceType: "hourly", // Default
    };

    const data = await makeRequest(`${API_BASE}/services/my`, {
      method: "POST",
      body: JSON.stringify(serviceData),
    });

    showResponse("servicesResponse", data);

    // Clear form
    document.getElementById("serviceTitle").value = "";
    document.getElementById("serviceDescription").value = "";
    document.getElementById("servicePrice").value = "";
    document.getElementById("serviceAddress").value = "";
  } catch (error) {
    showResponse("servicesResponse", { error: error.message }, true);
  }
}

// Booking Functions
async function loadBookings() {
  if (!authToken) {
    showResponse("bookingsResponse", { error: "Please login first" }, true);
    return;
  }

  try {
    const data = await makeRequest(`${API_BASE}/bookings`);

    const bookingsListEl = document.getElementById("bookingsList");
    if (data.data.bookings.length === 0) {
      bookingsListEl.innerHTML = "<p>No bookings found.</p>";
    } else {
      bookingsListEl.innerHTML = data.data.bookings
        .map((booking) => {
          const startDate = new Date(booking.startDate).toLocaleString();
          const endDate = new Date(booking.endDate).toLocaleString();

          // Generate action buttons based on user role and booking status
          let actionButtons = "";
          if (currentUser.role === "sitter" && booking.status === "pending") {
            actionButtons = `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                            <button onclick="updateBookingStatus('${booking._id}', 'confirmed')" 
                                    style="background: #48bb78; color: white; border: none; padding: 6px 12px; border-radius: 4px; margin-right: 5px; cursor: pointer;">
                                ✅ Confirm
                            </button>
                            <button onclick="updateBookingStatus('${booking._id}', 'declined')" 
                                    style="background: #f56565; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                                ❌ Decline
                            </button>
                        </div>
                    `;
          } else if (
            currentUser.role === "sitter" &&
            booking.status === "confirmed"
          ) {
            actionButtons = `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                            <button onclick="updateBookingStatus('${booking._id}', 'in_progress')" 
                                    style="background: #4299e1; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                                🚀 Start Service
                            </button>
                        </div>
                    `;
          } else if (
            currentUser.role === "sitter" &&
            booking.status === "in_progress"
          ) {
            actionButtons = `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                            <button onclick="updateBookingStatus('${booking._id}', 'completed')" 
                                    style="background: #38a169; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                                ✅ Complete Service
                            </button>
                        </div>
                    `;
          } else if (
            currentUser.role === "owner" &&
            ["pending", "confirmed"].includes(booking.status)
          ) {
            actionButtons = `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                            <button onclick="updateBookingStatus('${booking._id}', 'cancelled')" 
                                    style="background: #f56565; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                                🚫 Cancel Booking
                            </button>
                        </div>
                    `;
          }

          // Status styling
          const statusColors = {
            pending: "#f59e0b",
            confirmed: "#3b82f6",
            in_progress: "#8b5cf6",
            completed: "#10b981",
            cancelled: "#ef4444",
            declined: "#f87171",
          };

          return `
                    <div style="border: 1px solid #e2e8f0; padding: 15px; margin: 10px 0; border-radius: 8px; background: #f8fafc;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <strong style="color: #2d3748;">📅 Booking #${booking._id.slice(
                              -6
                            )}</strong>
                            <span style="background: ${
                              statusColors[booking.status] || "#6b7280"
                            }; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                                ${booking.status.toUpperCase()}
                            </span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                            <div><strong>Start:</strong> ${startDate}</div>
                            <div><strong>End:</strong> ${endDate}</div>
                            <div><strong>Price:</strong> $${
                              booking.totalPrice
                            }</div>
                            <div><strong>Service:</strong> ${
                              booking.service?.title || "N/A"
                            }</div>
                        </div>
                        
                        ${
                          booking.pet
                            ? `
                            <div style="margin-bottom: 10px;">
                                <strong>Pet:</strong> ${booking.pet.name} (${booking.pet.species})
                            </div>
                        `
                            : ""
                        }
                        
                        ${
                          booking.notes
                            ? `
                            <div style="margin-bottom: 10px; background: #fef5e7; padding: 8px; border-radius: 4px;">
                                <strong>Notes:</strong> ${booking.notes}
                            </div>
                        `
                            : ""
                        }
                        
                        ${actionButtons}
                    </div>
                `;
        })
        .join("");
    }

    showResponse("bookingsResponse", data);
  } catch (error) {
    showResponse("bookingsResponse", { error: error.message }, true);
  }
}

async function createBooking() {
  if (!authToken) {
    showResponse("bookingsResponse", { error: "Please login first" }, true);
    return;
  }

  if (currentUser.role !== "owner") {
    showResponse(
      "bookingsResponse",
      { error: "Only pet owners can create bookings" },
      true
    );
    return;
  }

  try {
    const bookingData = {
      service: document.getElementById("bookingServiceId").value,
      pet: document.getElementById("bookingPetId").value,
      startDate: document.getElementById("bookingStartDate").value,
      endDate: document.getElementById("bookingEndDate").value,
      notes: document.getElementById("bookingNotes").value || undefined,
    };

    const data = await makeRequest(`${API_BASE}/bookings`, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });

    showResponse("bookingsResponse", data);

    // Clear form
    document.getElementById("bookingServiceId").value = "";
    document.getElementById("bookingPetId").value = "";
    document.getElementById("bookingStartDate").value = "";
    document.getElementById("bookingEndDate").value = "";
    document.getElementById("bookingNotes").value = "";

    // Refresh bookings list
    loadBookings();
  } catch (error) {
    showResponse("bookingsResponse", { error: error.message }, true);
  }
}

// Edit Pet Functions
async function editPet(petId) {
  if (!authToken) {
    alert("Please login first");
    return;
  }

  if (currentUser.role !== "owner") {
    alert("Only pet owners can edit pets");
    return;
  }

  try {
    // Get pet details first
    const data = await makeRequest(`${API_BASE}/pets/${petId}`);
    const pet = data.data.pet;

    // Populate the edit form with pet data
    document.getElementById("editPetId").value = pet._id;
    document.getElementById("editPetName").value = pet.name || "";
    document.getElementById("editPetSpecies").value = pet.species || "";
    document.getElementById("editPetBreed").value = pet.breed || "";
    document.getElementById("editPetAge").value = pet.age || "";
    document.getElementById("editPetWeight").value = pet.weight || "";
    document.getElementById("editPetGender").value = pet.gender || "";
    document.getElementById("editPetColor").value = pet.color || "";
    document.getElementById("editPetVaccinated").checked = pet.vaccinated === true;
    document.getElementById("editPetMicrochipped").checked = pet.microchipped === true;
    document.getElementById("editPetSpecialNeeds").value = pet.specialNeeds || "";

    // Show current photos
    const currentPhotosDiv = document.getElementById("editCurrentPhotos");
    if (pet.photos && pet.photos.length > 0) {
      currentPhotosDiv.innerHTML = `
        <label>Current Photos:</label>
        <div style="display: flex; gap: 10px; margin-top: 5px; flex-wrap: wrap;">
          ${pet.photos.map((photo, index) => `
            <div style="position: relative;">
              <img src="${photo}" alt="Pet photo ${index + 1}" 
                   style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; border: 1px solid #e2e8f0;">
              <button type="button" onclick="removeCurrentPhoto('${petId}', ${index})" 
                      style="position: absolute; top: -5px; right: -5px; background: #f56565; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;">
                ×
              </button>
            </div>
          `).join("")}
        </div>
      `;
    } else {
      currentPhotosDiv.innerHTML = "<p>No photos currently uploaded.</p>";
    }

    // Show the edit modal
    document.getElementById("editPetModal").style.display = "block";

  } catch (error) {
    alert("Error loading pet details: " + error.message);
  }
}

async function updatePet() {
  if (!authToken) {
    alert("Please login first");
    return;
  }

  if (currentUser.role !== "owner") {
    alert("Only pet owners can update pets");
    return;
  }

  try {
    const petId = document.getElementById("editPetId").value;
    const formData = new FormData();

    // Add form fields
    formData.append("name", document.getElementById("editPetName").value);
    formData.append("species", document.getElementById("editPetSpecies").value);
    formData.append("breed", document.getElementById("editPetBreed").value);
    formData.append("age", document.getElementById("editPetAge").value);
    formData.append("weight", document.getElementById("editPetWeight").value);
    formData.append("gender", document.getElementById("editPetGender").value);
    formData.append("color", document.getElementById("editPetColor").value);
    formData.append("vaccinated", document.getElementById("editPetVaccinated").checked);
    formData.append("microchipped", document.getElementById("editPetMicrochipped").checked);
    formData.append("specialNeeds", document.getElementById("editPetSpecialNeeds").value);

    // Add new photos if any
    const photoFiles = document.getElementById("editPetPhotos").files;
    for (let i = 0; i < photoFiles.length; i++) {
      formData.append("photos", photoFiles[i]);
    }

    // Check if user wants to replace all photos
    const replacePhotos = document.getElementById("editReplacePhotos").checked;
    if (replacePhotos) {
      formData.append("replacePhotos", "true");
    }

    // Show loading state
    const updateButton = document.querySelector("#editPetModal .btn-primary");
    const originalText = updateButton.textContent;
    updateButton.disabled = true;
    updateButton.textContent = "Updating...";

    const response = await fetch(`${API_BASE}/pets/${petId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update pet");
    }

    // Success - close modal and refresh pets
    closeEditPetModal();
    loadPets();
    alert("Pet updated successfully!");

  } catch (error) {
    alert("Error updating pet: " + error.message);
  } finally {
    // Reset button state
    const updateButton = document.querySelector("#editPetModal .btn-primary");
    if (updateButton) {
      updateButton.disabled = false;
      updateButton.textContent = "Update Pet";
    }
  }
}

function closeEditPetModal() {
  document.getElementById("editPetModal").style.display = "none";
  
  // Reset form
  document.getElementById("editPetForm").reset();
  document.getElementById("editCurrentPhotos").innerHTML = "";
}

async function removeCurrentPhoto(petId, photoIndex) {
  if (!confirm("Are you sure you want to delete this photo?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/pets/${petId}/photos/${photoIndex}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to delete photo");
    }

    // Refresh the edit form to show updated photos
    editPet(petId);
    alert("Photo deleted successfully!");

  } catch (error) {
    alert("Error deleting photo: " + error.message);
  }
}

// Auto-refresh connection status every 30 seconds
setInterval(checkConnection, 30000);
