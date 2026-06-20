import { NextResponse } from 'next/server';
import connectDB from '../../utils/db';
import Post from '../../models/Post';

// GET /api/posts - Fetch posts with pagination
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({}),
    ]);

    const hasMore = skip + posts.length < total;

    return NextResponse.json({
      posts: posts.map((post) => ({
        ...post,
        _id: post._id.toString(),
      })),
      hasMore,
      total,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { content, contentType, songId, songName, songArtist, songCover, songPreviewUrl, toAlias, fromAlias } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Content cannot exceed 2000 characters' },
        { status: 400 }
      );
    }

    const post = await Post.create({
      content: content.trim(),
      contentType: contentType || 'thought',
      songId: songId || null,
      songName: songName || null,
      songArtist: songArtist || null,
      songCover: songCover || null,
      songPreviewUrl: songPreviewUrl || null,
      toAlias: toAlias || null,
      fromAlias: fromAlias || null,
    });

    return NextResponse.json(
      {
        ...post.toObject(),
        _id: post._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts - Delete a post (using query param)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const deleted = await Post.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
