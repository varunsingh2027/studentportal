import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function run() {
  try {
    // 1. Signup a random user
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`Registering user: ${email}`);
    
    try {
        const signupRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test User',
            email,
            password,
            role: 'student'
        });
        console.log("Signup success:", signupRes.data.message);
    } catch (e) {
        console.log("Signup error (might exist):", e.response?.data || e.message);
    }

    // 2. Login
    console.log("Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    const { token, user } = loginRes.data;
    console.log("Logged in:", user);

    // 3. Create Profile
    console.log("Creating profile...");
    const profileData = {
      branch: "Computer Science",
      enrollmentNumber: "EN" + Date.now(),
      semester: 1, // Number
      gender: "male",
      skills: "React, Node", // This is interesting - the script sends string, backend splits? 
      // Wait, my backend logic for skills is: Array.isArray(skills) ? skills : []
      // The frontend logic splits it before sending?
      // frontend/src/pages/StudentDashboard.jsx: const skills = splitCsv(form.skills); -> returns array.
      // So I should send array here.
      certifications: ["https://cert.com/1"],
      hackathons: []
    };
    
    // Correcting skills to be array as frontend does
    // And actually "skills" in backend takes array of strings.
    // The previous code block for skills:
    /*
      skills: [
    {
      type: String,
      trim: true,
    },
  ],
    */
    // So if send ["React", "Node"] it works.
    
    // Wait, let's correct the script
    const correctedProfileData = {
        ...profileData,
        skills: ["React", "Node"]
    };

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    const createRes = await axios.post(`${API_URL}/students`, correctedProfileData, config);
    console.log("Profile created successfully!", createRes.data);

  } catch (error) {
    console.error("FAILED:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error:", error.message);
    }
  }
}

run();
