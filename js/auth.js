const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- Helper functions ---
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev_" + Math.random().toString(36).substr(2, 12);
    localStorage.setItem("device_id", id);
  }
  return id;
}

// --- Main function ---
function authInit(mode) {
  /* ---------- SIGNUP ---------- */
  if (mode === "signup") {
    const btn = document.getElementById("signup-btn");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const full_name = document.getElementById("name").value.trim();
      const username = document.getElementById("username").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const referralCode = document.getElementById("referral")?.value.trim();

      if (!full_name || !username || !phone || !email || !password)
        return alert("All fields are required");
      if (!isValidEmail(email)) return alert("Please enter a valid email");

      const deviceId = getDeviceId();

      // Check if this device already signed up
      const { data: existingProfile } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("device_id", deviceId)
        .single();

      if (existingProfile) return alert("This device has already been used to sign up.");

      // Create auth user
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({ email, password });
      if (authError) return alert(authError.message);
      const userId = authData.user?.id;
      if (!userId) return alert("Failed to create user. Try again.");

      // Check if profile already exists (safety check)
      const { data: existing, error: checkErr } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();
      if (existing) return alert("Profile already exists. Try logging in.");

      // Handle referral
      let referredBy = null;
      let referrerId = null;
      if (referralCode) {
        const { data: refUser, error: refError } = await supabaseClient
          .from("profiles")
          .select("id, username, balance")
          .eq("referral_code", referralCode)
          .single();
        if (!refError && refUser) {
          referredBy = refUser.username;
          referrerId = refUser.id;
        }
      }

      // Insert new profile
      const { error: profileError } = await supabaseClient.from("profiles").insert({
        id: userId,
        full_name,
        username,
        phone,
        email,
        device_id: deviceId,
        referral_code: username,
        referred_by: referredBy,
        balance: 0
      });
      if (profileError) return alert(profileError.message);

      // Apply referral bonus if valid
      if (referrerId) {
        const { data: refData, error: balErr } = await supabaseClient
          .from("profiles")
          .select("balance")
          .eq("id", referrerId)
          .single();
        if (!balErr) {
          const newBalance = (refData?.balance || 0) + 0.01;
          await supabaseClient.from("profiles").update({ balance: newBalance }).eq("id", referrerId);
        }
      }

      alert("Account created! Referral bonus applied if any.");
      window.location.href = "login.html";
    });
  }

  /* ---------- LOGIN ---------- */
  if (mode === "login") {
    const btn = document.getElementById("login-btn");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      if (!email || !password) return alert("Please enter email and password");

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) return alert(error.message);

      localStorage.setItem("user_session", JSON.stringify(data.session));
      alert("Logged in!");
      window.location.href = "dashboard.html";
    });
  }

  /* ---------- FORGOT PASSWORD ---------- */
  const forgot = document.getElementById("forgot-password");
  if (forgot) {
    forgot.onclick = async () => {
      const email = document.getElementById("email").value.trim();
      if (!email) return alert("Enter your email first");

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: "https://chronodisrupt.github.io/DUZ-web/reset-password.html"
      });

      if (error) alert(error.message);
      else alert("Password reset email sent!");
    };
  }
}

// Optional: protect pages
async function protectPage() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) window.location.href = "login.html";
        }
