import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    // Use iTunes Search API instead of Spotify
    const itunesResponse = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`
    );

    if (!itunesResponse.ok) {
      throw new Error('iTunes API request failed');
    }

    const data = await itunesResponse.json();

    // Map iTunes response to match the exact same structure the frontend expects from Spotify
    const tracks = data.results.map((track) => ({
      id: track.trackId.toString(),
      name: track.trackName,
      artists: track.artistName,
      album: {
        images: [
          {
            // Get the highest quality artwork available (replace 100x100 with 600x600)
            url: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '600x600bb') : '',
          },
        ],
      },
      previewUrl: track.previewUrl || null,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Music search error:', error);
    return NextResponse.json(
      { error: 'Failed to search music', tracks: [] },
      { status: 500 }
    );
  }
}
