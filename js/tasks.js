  
// Hamburger toggle
 
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


 -
// REFERRAL
 -
document.getElementById("referral-btn").addEventListener("click", async () => {
  if (!userId) return;

  // 1️⃣ Get user details including username
  const { data: user, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  if(error) return alert("Failed to fetch your referral code");

  const referralCode = user.username; // Using username as referral code
  document.getElementById("referral-link").textContent = `Your referral code: ${referralCode}`;

  // 2️⃣ Save the task for recordkeeping
  const { error: taskError } = await supabase.from("tasks").insert({
    user_id: userId,
    task_type: "Referral",
    content: referralCode,
    status: 'pending',
    reward: '0.01'
  });

  if(taskError) return alert(taskError.message);

  alert("Share your referral code with friends!");
});


 
  // IDEAS
 
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




 
  // SURVEY
 
  document.getElementById("survey-btn").addEventListener("click",() => {
    alert("No survey available at the moment, come back later!");


  });




// AWARENESS UPLOAD (max 4 per day)
 -
document.getElementById("awareness-btn").addEventListener("click", async () => {
  if (!userId) return;

  const fileInput = document.getElementById("awareness-file");
  if (fileInput.files.length === 0)
    return alert("Upload an image first");

  // 1️⃣ Check how many awareness posts submitted today
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of today

  const { data: countData, error: countError } = await supabase
    .from("tasks")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("task_type", "Awareness")
    .gte("created_at", today.toISOString());

  if (countError) return alert("Failed to check daily uploads");
  if (countData.length >= 4) return alert("You can only submit 4 awareness posts per day");

  // 2️⃣ Upload file
  const file = fileInput.files[0];
  const fileName = `${userId}_${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("awareness-images")
    .upload(fileName, file);

  if (uploadError) return alert(uploadError.message);

  // 3️⃣ Get public URL
  const { data } = supabase.storage
    .from("awareness-images")
    .getPublicUrl(fileName);

  const imageUrl = data.publicUrl;

  // 4️⃣ Save task
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


