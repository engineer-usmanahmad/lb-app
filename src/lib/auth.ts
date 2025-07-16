import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_verified: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
}

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// JWT utilities
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Admin authentication
export const authenticateAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    const isValidPassword = await verifyPassword(password, data.password_hash);
    if (!isValidPassword) return null;

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);

    return {
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
      is_active: data.is_active,
      last_login: data.last_login
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
};

// User authentication
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    const isValidPassword = await verifyPassword(password, data.password_hash);
    if (!isValidPassword) return null;

    return {
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      is_verified: data.is_verified,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('User authentication error:', error);
    return null;
  }
};

// User registration
export const registerUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}): Promise<User | null> => {
  try {
    const hashedPassword = await hashPassword(userData.password);

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password_hash: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        is_verified: true // Auto-verify for now
      })
      .select()
      .single();

    if (error) {
      console.error('User registration error:', error);
      return null;
    }

    // Create user profile
    await supabase
      .from('user_profiles')
      .insert({
        user_id: data.id,
        experience_level: 'beginner'
      });

    return {
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      is_verified: data.is_verified,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('User registration error:', error);
    return null;
  }
};

// Session management
export const createUserSession = async (userId: string, ipAddress?: string, userAgent?: string): Promise<string | null> => {
  try {
    const sessionToken = generateToken({ userId, type: 'user' });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const { error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) {
      console.error('Session creation error:', error);
      return null;
    }

    return sessionToken;
  } catch (error) {
    console.error('Session creation error:', error);
    return null;
  }
};

export const createAdminSession = async (adminId: string): Promise<string | null> => {
  try {
    const sessionToken = generateToken({ adminId, type: 'admin' });
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hours

    const { error } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      console.error('Admin session creation error:', error);
      return null;
    }

    return sessionToken;
  } catch (error) {
    console.error('Admin session creation error:', error);
    return null;
  }
};

// Session verification
export const verifyUserSession = async (sessionToken: string): Promise<User | null> => {
  try {
    const decoded = verifyToken(sessionToken);
    if (!decoded || decoded.type !== 'user') return null;

    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !sessionData) return null;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.user_id)
      .single();

    if (userError || !userData) return null;

    return {
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      is_verified: userData.is_verified,
      created_at: userData.created_at
    };
  } catch (error) {
    console.error('User session verification error:', error);
    return null;
  }
};

export const verifyAdminSession = async (sessionToken: string): Promise<AdminUser | null> => {
  try {
    const decoded = verifyToken(sessionToken);
    if (!decoded || decoded.type !== 'admin') return null;

    const { data: sessionData, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !sessionData) return null;

    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', sessionData.admin_id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminData) return null;

    return {
      id: adminData.id,
      email: adminData.email,
      first_name: adminData.first_name,
      last_name: adminData.last_name,
      role: adminData.role,
      is_active: adminData.is_active,
      last_login: adminData.last_login
    };
  } catch (error) {
    console.error('Admin session verification error:', error);
    return null;
  }
};

// Course enrollment
export const enrollInCourse = async (userId: string, courseData: {
  courseId: string;
  courseName: string;
  enrollmentType: string;
  paymentAmount?: number;
  learningGoals?: string;
}): Promise<boolean> => {
  try {
    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseData.courseId)
      .eq('is_active', true)
      .single();

    if (existingEnrollment) {
      return true; // Already enrolled
    }

    const { error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseData.courseId,
        course_name: courseData.courseName,
        enrollment_type: courseData.enrollmentType,
        payment_amount: courseData.paymentAmount || 0,
        learning_goals: courseData.learningGoals
      });

    return !error;
  } catch (error) {
    console.error('Course enrollment error:', error);
    return false;
  }
};

// Check course access
export const checkCourseAccess = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Course access check error:', error);
    return false;
  }
};

// Log content access
export const logContentAccess = async (userId: string, contentData: {
  contentType: string;
  contentId: string;
  contentTitle?: string;
}): Promise<void> => {
  try {
    // Check if already accessed
    const { data: existingAccess } = await supabase
      .from('free_content_access')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', contentData.contentId)
      .single();

    if (existingAccess) {
      // Update access count and last accessed
      await supabase
        .from('free_content_access')
        .update({
          last_accessed_at: new Date().toISOString(),
          access_count: existingAccess.access_count + 1
        })
        .eq('id', existingAccess.id);
    } else {
      // Create new access record
      await supabase
        .from('free_content_access')
        .insert({
          user_id: userId,
          content_type: contentData.contentType,
          content_id: contentData.contentId,
          content_title: contentData.contentTitle
        });
    }
  } catch (error) {
    console.error('Content access logging error:', error);
  }
};

// Logout functions
export const logoutUser = async (sessionToken: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', sessionToken);

    return !error;
  } catch (error) {
    console.error('User logout error:', error);
    return false;
  }
};

export const logoutAdmin = async (sessionToken: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('session_token', sessionToken);

    return !error;
  } catch (error) {
    console.error('Admin logout error:', error);
    return false;
  }
};