// const express = require("express");
// const dotenv = require("dotenv");
// const { createClient } = require("@supabase/supabase-js");
// const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
// const path = require("path");
// const fs = require("fs");

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Initialize Supabase client
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// // Middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json()); // Added for JSON parsing
// app.use(cookieParser());
// app.use(express.static("public"));

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Server Error:', err);
//   res.redirect(`/error.html?code=500&message=${encodeURIComponent('Internal server error')}&type=Server Error`);
// });

// // Routes
// app.get("/", (req, res) => {
//   try {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
//   } catch (error) {
//     console.error('Error serving index.html:', error);
//     res.status(500).send('Server error');
//   }
// });

// // Signup route
// app.post("/signup", async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Input validation
//     if (!email || !password) {
//       return res.redirect(`/error.html?code=400&message=${encodeURIComponent('Email and password are required')}&type=Validation Error`);
//     }

//     const { data, error } = await supabase.auth.signUp({ 
//       email, 
//       password,
//       options: {
//         emailRedirectTo: `${req.protocol}://${req.get('host')}/auth/callback`
//       }
//     });

//     if (error) {
//       console.error('Signup error:', error);
//       return res.redirect(`/error.html?code=400&message=${encodeURIComponent(error.message)}&type=Authentication Error`);
//     }

//     // Redirect to success page with email parameter
//     res.redirect(`/signupsuccess.html?email=${encodeURIComponent(email)}`);
//   } catch (error) {
//     console.error('Signup server error:', error);
//     res.redirect(`/error.html?code=500&message=${encodeURIComponent('Registration failed')}&type=Server Error`);
//   }
// });

// // Login route
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Input validation
//     if (!email || !password) {
//       return res.redirect(`/error.html?code=400&message=${encodeURIComponent('Email and password are required')}&type=Validation Error`);
//     }

//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });

//     if (error) {
//       console.error('Login error:', error);
//       return res.redirect(`/error.html?code=401&message=${encodeURIComponent(error.message)}&type=Authentication Error`);
//     }

//     if (!data.session) {
//       return res.redirect(`/error.html?code=401&message=${encodeURIComponent('No session created')}&type=Authentication Error`);
//     }

//     // Set secure cookie with session token
//     res.cookie("access_token", data.session.access_token, { 
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 24 * 60 * 60 * 1000 // 24 hours
//     });
    
//     res.redirect("/private");
//   } catch (error) {
//     console.error('Login server error:', error);
//     res.redirect(`/error.html?code=500&message=${encodeURIComponent('Login failed')}&type=Server Error`);
//   }
// });

// // Private route with authentication
// app.get("/private", async (req, res) => {
//   try {
//     const token = req.cookies.access_token;
    
//     if (!token) {
//       return res.redirect("/?message=Please log in to access this page");
//     }

//     // Verify token with Supabase
//     const { data, error } = await supabase.auth.getUser(token);
    
//     if (error || !data.user) {
//       console.error('Token verification error:', error);
//       res.clearCookie("access_token");
//       return res.redirect("/?message=Session expired, please log in again");
//     }

//     const filePath = path.join(__dirname, "private.html");

//     // Check if private.html exists
//     if (!fs.existsSync(filePath)) {
//       console.error("Error: private.html not found!");
//       return res.redirect(`/error.html?code=404&message=${encodeURIComponent('Private page not found')}&type=File Not Found`);
//     }

//     fs.readFile(filePath, "utf8", (err, html) => {
//       if (err) {
//         console.error("Error reading private.html:", err);
//         return res.redirect(`/error.html?code=500&message=${encodeURIComponent('Could not load private page')}&type=Server Error`);
//       }

//       // Replace template variables
//       const modifiedHtml = html
//         .replace(/{{userEmail}}/g, data.user.email)
//         .replace(/{{userName}}/g, data.user.user_metadata?.full_name || data.user.email)
//         .replace(/{{userId}}/g, data.user.id);
      
//       res.send(modifiedHtml);
//     });
//   } catch (error) {
//     console.error('Private route error:', error);
//     res.redirect(`/error.html?code=500&message=${encodeURIComponent('Access denied')}&type=Server Error`);
//   }
// });

// // Logout route
// app.get("/logout", async (req, res) => {
//   try {
//     const token = req.cookies.access_token;
    
//     if (token) {
//       // Sign out from Supabase
//       await supabase.auth.signOut(token);
//     }
    
//     res.clearCookie("access_token");
//     res.redirect("/?message=Successfully logged out");
//   } catch (error) {
//     console.error('Logout error:', error);
//     res.clearCookie("access_token");
//     res.redirect("/");
//   }
// });

// // Auth callback route for email verification
// app.get("/auth/callback", async (req, res) => {
//   try {
//     const { access_token, refresh_token } = req.query;
    
//     if (access_token) {
//       // Set the session
//       const { data, error } = await supabase.auth.setSession({
//         access_token,
//         refresh_token
//       });
      
//       if (error) {
//         console.error('Auth callback error:', error);
//         return res.redirect(`/error.html?code=400&message=${encodeURIComponent('Email verification failed')}&type=Authentication Error`);
//       }
      
//       res.cookie("access_token", access_token, { 
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         maxAge: 24 * 60 * 60 * 1000
//       });
      
//       res.redirect("/private");
//     } else {
//       res.redirect("/?message=Email verified successfully, please log in");
//     }
//   } catch (error) {
//     console.error('Auth callback server error:', error);
//     res.redirect(`/error.html?code=500&message=${encodeURIComponent('Verification failed')}&type=Server Error`);
//   }
// });

// // 404 handler for undefined routes
// app.use((req, res) => {
//   res.redirect(`/error.html?code=404&message=${encodeURIComponent('Page not found')}&type=Not Found`);
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// });

// module.exports = app;




// Login route
// ------------------ Imports ------------------



import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));

// Supabase client (⚠️ use service role key in .env, not anon key)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ========== AUTH ROUTES ==========

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Signup successful", user: data.user });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  // Save session in cookie
  res.cookie("sb:token", data.session.access_token, { httpOnly: true, secure: false });
  res.json({ message: "Login successful", user: data.user });
});

// Logout
app.post("/logout", async (req, res) => {
  res.clearCookie("sb:token");
  res.json({ message: "Logout successful" });
});

// ========== PROFILE ROUTES ==========

// Get profile
app.get("/api/profile", async (req, res) => {
  const token = req.cookies["sb:token"];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError) return res.status(401).json({ error: "Invalid token" });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Create/Update profile
app.post("/api/profile", async (req, res) => {
  const token = req.cookies["sb:token"];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError) return res.status(401).json({ error: "Invalid token" });

  const { name, email, skills, bio, location } = req.body;

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      user_id: user.id,
      name,
      email,
      skills,
      bio,
      location,
      updated_at: new Date()
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete profile
app.delete("/api/profile", async (req, res) => {
  const token = req.cookies["sb:token"];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError) return res.status(401).json({ error: "Invalid token" });

  const { error } = await supabase.from("profiles").delete().eq("user_id", user.id);
  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Profile deleted" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

