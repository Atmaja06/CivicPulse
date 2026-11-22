
import { supabase } from './supabase';

// 1. Upload complaint photo
export const uploadIssuePhoto = async (file) => {
  if (!file) return null;

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Please login before uploading a photo');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from('issue-photos')
    .upload(filePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false
    });

  if (error) throw error;

  return data.path;
};

// 2. Generate secure photo URL
export const getIssuePhotoUrl = async (photoPath) => {
  if (!photoPath) return null;

  const { data, error } = await supabase.storage
    .from('issue-photos')
    .createSignedUrl(photoPath, 3600);

  if (error) throw error;

  return data.signedUrl;
};

// 3. Submit a new complaint
export const submitIssue = async ({
  title,
  category,
  description,
  latitude,
  longitude,
  photoFile
}) => {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Please login before submitting a complaint');
  }

  if (!title?.trim() || !category?.trim()) {
    throw new Error('Title and category are required');
  }

  let photoPath = null;

  try {
    if (photoFile) {
      photoPath = await uploadIssuePhoto(photoFile);
    }

    const { data, error } = await supabase
      .from('issues')
      .insert([{
        title: title.trim(),
        category: category.trim(),
        description: description || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        photo_url: photoPath,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    return data;

  } catch (error) {
    // Remove uploaded photo if complaint submission fails
    if (photoPath) {
      await supabase.storage
        .from('issue-photos')
        .remove([photoPath]);
    }

    throw error;
  }
};

// 4. Retrieve all complaints
export const getIssues = async () => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
};

// 5. Retrieve one complaint by ID
export const getIssueById = async (id) => {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
};

// 6. Update complaint status
export const updateIssueStatus = async (
  id,
  status,
  department = null
) => {
  const validStatuses = [
    'Reported',
    'Assigned',
    'In Progress',
    'Resolved',
    'Community Verified'
  ];

  if (!validStatuses.includes(status)) {
    throw new Error('Invalid complaint status');
  }

  const updates = {
    status,
    updated_at: new Date().toISOString()
  };

  if (department !== null) {
    updates.department = department;
  }

  const { data, error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
};
