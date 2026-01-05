// ---------------------
// Hamburger toggle
// ---------------------
const btn = document.getElementById("menu-btn");
const nav = document.getElementById("nav-links");
btn.addEventListener("click", () => {
  btn.classList.toggle("active");
  nav.classList.toggle("open");
});

document.addEventListener("DOMContentLoaded", () => {

  const supabaseUrl = "https://pdvjaxccdsziyvtznamb.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdmpheGNjZHN6aXl2dHpuYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzUxNTEsImV4cCI6MjA4MzAxMTE1MX0.Ye8kHuBUVMZLgt6prnRfe9qSdk3KAOM1Fo6ABjR7b_E";
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  let userId = null;

  // 🔐 PROTECT PAGE + LOAD USER
  async function initUser() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert("You must be logged in!");
      window.location.href = "login.html";
      return;
    }

    userId = session.user.id;
    console.log("Logged in user:", userId);
  }

  initUser();


  // ----------------------
  // REFERRAL
  // ----------------------
  document.getElementById("referral-btn").addEventListener("click", async () => {
    if (!userId) return;

    const link = `${window.location.origin}/index.html?ref=${userId}`;
    document.getElementById("referral-link").textContent = link;

    await supabase.from("tasks").insert({
      user_id: userId,
      task_type: "Referral",
      content: link,
      status: 'pending',
      reward: '0.01'
    });

    alert("Now share your link with friends!");
  });


  // ----------------------
  // IDEAS
  // ----------------------
  document.getElementById("idea-btn").addEventListener("click", async () => {
    if (!userId) return;

    const content = document.getElementById("ideaContent").value.trim();
    if (!content) return alert("Write your idea first");

    await supabase.from("tasks").insert({
      user_id: userId,
      task_type: "Idea",
      content,
      status: 'pending',
      reward: '1'
    });

    alert("Idea submitted!");
    document.getElementById("ideaContent").value = "";
  });

// ----------------------
// AWARENESS UPLOAD
// ----------------------
document.getElementById("awareness-btn").addEventListener("click", async () => {

  if (!userId) return;

  const fileInput = document.getElementById("awareness-file");

  if (fileInput.files.length === 0)
    return alert("Upload an image first");

  const file = fileInput.files[0];
  const fileName = `${userId}_${Date.now()}_${file.name}`;

  // 1️⃣ Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("awareness-images")
    .upload(fileName, file);

  if (uploadError) return alert(uploadError.message);

  // 2️⃣ Get public URL
  const { data } = supabase.storage
    .from("awareness-images")
    .getPublicUrl(fileName);

  const imageUrl = data.publicUrl;

  // 3️⃣ Save task
  await supabase.from("tasks").insert({
    user_id: userId,
    task_type: "Awareness",
    image_url: imageUrl,
    status: 'pending',
    reward: '0.00125'
  });

  alert("Awareness post submitted!");
  fileInput.value = "";
}); 


}); 

