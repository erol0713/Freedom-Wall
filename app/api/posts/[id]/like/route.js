import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '../../../../utils/db';
import Post from '../../../../models/Post';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Get or create session ID from cookies
    const cookieStore = cookies();
    let sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const alreadyLiked = post.likedBy.includes(sessionId);

    if (alreadyLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter((s) => s !== sessionId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.likedBy.push(sessionId);
      post.likes += 1;
    }

    await post.save();

    const response = NextResponse.json({
      likes: post.likes,
      liked: !alreadyLiked,
    });

    // Set session cookie if new
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
