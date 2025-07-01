import { NextRequest, NextResponse } from 'next/server';
import { createMockChatbot } from '@/lib/rag/mock-chatbot';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language') || 'nl';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Use mock chatbot for search
    const mockChatbot = createMockChatbot();
    const searchResults = await mockChatbot.searchContent(query);

    // Filter by difficulty if specified
    const filtered = difficulty 
      ? searchResults.filter(r => r.metadata.level === difficulty)
      : searchResults;

    // Format results
    const formattedResults = filtered.map(result => ({
      courseId: result.metadata.id,
      courseTitle: result.metadata.title,
      courseLevel: result.metadata.level,
      contentType: 'course',
      score: result.score,
      highlight: result.content,
      url: `/cursussen/${result.metadata.id}`,
    }));

    // Paginate results
    const paginatedResults = formattedResults.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginatedResults,
      total: formattedResults.length,
      query,
      filters: { category, difficulty },
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < formattedResults.length,
      },
      mode: 'mock', // Indicate mock mode
    });

  } catch (error) {
    console.error('Course search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}