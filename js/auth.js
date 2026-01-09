 const supabaseUrl = 'https://ydeczzyvfgwwmfornfef.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZWN6enl2Zmd3d21mb3JuZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5Njc1ODksImV4cCI6MjA4MzU0MzU4OX0.IBNkcqDJtQSurdKaic94iRrc4NYnO8m1e1bQzbkkstc";
const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

/* ---------------- HELPERS ---------------- */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2, 14);
    localStorage.setItem("device_id", id);
  }
  return id;
}

/* ---------------- MAIN INIT ---------------- */

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

      if (!isValidEmail(email))
        return alert("Please enter a valid email");

      const deviceId = getDeviceId();

      // Prevent multiple signups per device
      const { data: existingProfile } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("device_id", deviceId)
        .maybeSingle();

      if (existingProfile)
        return alert("This device has already been used to sign up.");

      // Create auth user
      const { data: authData, error: authError } =
        await supabaseClient.auth.signUp({ email, password });

      if (authError) return alert(authError.message);

      const user = authData.user;
      if (!user) return alert("Failed to create user");

      // Referral lookup
      let referredBy = null;
      let referrerId = null;

      if (referralCode) {
        const { data: refUser } = await supabaseClient
          .from("profiles")
          .select("id, username, balance")
          .eq("referral_code", referralCode)
          .maybeSingle();

        if (refUser) {
          referredBy = refUser.username;
          referrerId = refUser.id;
        }
      }

      // Insert profile
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .insert({
          id: user.id,
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

      // Referral bonus
      if (referrerId) {
        await supabaseClient
          .from("profiles")
          .update({ balance: supabaseClient.raw("balance + 0.01") })
          .eq("id", referrerId);
      }

      alert("Account created successfully!");
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

      if (!email || !password)
        return alert("Please enter email and password");

      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) return alert(error.message);

      localStorage.setItem("user_session", JSON.stringify(data.session));
      window.location.href = "dashboard.html";
    });
  }

  /* ---------- FORGOT PASSWORD ---------- */
  const forgot = document.getElementById("forgot-password");
  if (forgot) {
    forgot.addEventListener("click", async () => {
      const email = document.getElementById("email")?.value.trim();
      if (!email) return alert("Enter your email first");

      const { error } =
        await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo:
            "https://chronodisrupt.github.io/DUZ-web/reset-password.html"
        });

      if (error) alert(error.message);
      else alert("Password reset email sent!");
    });
  }
}

/* ---------- PAGE GUARD ---------- */
async function protectPage() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) window.location.href = "login.html";
}
