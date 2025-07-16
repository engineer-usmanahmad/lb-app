import type { APIRoute } from 'astro';
import { enrollInCourse, verifyUserSession } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get session token from cookies
    const cookies = request.headers.get('cookie');
    const sessionToken = cookies?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (!sessionToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = await verifyUserSession(sessionToken);
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid session' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const courseId = formData.get('course_id') as string;
    const courseName = formData.get('course_name') as string;
    const learningGoals = formData.get('learning_goals') as string;

    if (!courseId || !courseName) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Course ID and name are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const enrolled = await enrollInCourse(user.id, {
      courseId,
      courseName,
      enrollmentType: 'free',
      paymentAmount: 0,
      learningGoals
    });

    if (!enrolled) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Enrollment failed' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Successfully enrolled in course'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Course enrollment error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};