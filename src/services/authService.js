
import { supabase } from './supabase';

// 1. Citizen Registration
export const registerUser = async (
  fullName,
  email,
  password
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      },
      emailRedirectTo: window.location.origin
    }
  });

  if (error) throw error;

  return data;
};


// 2. Citizen Login
export const loginUser = async (email, password) => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) throw error;

  return data;
};


// 3. Get Current Logged-in User
export const getCurrentUser = async () => {
  const { data, error } =
    await supabase.auth.getUser();

  if (error) throw error;

  return data.user;
};


// 4. Citizen Logout
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};


// 5. Listen for Authentication Changes
export const listenToAuthChanges = (callback) => {
  const { data } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );

  return () => {
    data.subscription.unsubscribe();
  };
};
