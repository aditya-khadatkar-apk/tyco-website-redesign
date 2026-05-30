import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { supaCache } from '../lib/supaCache';

export function useCMS(slug: string, initialData: any = {}) {
  // Try to serve cached content instantly (no loading flash)
  const cached = supaCache.getCached<any>(`cms:${slug}`);
  const [content, setContent] = useState<any>(
    cached ? { ...initialData, ...cached } : initialData
  );
  const [loading, setLoading] = useState(!cached);

  const fetchContent = useCallback(async () => {
    try {
      const { data: result } = await supaCache.get(
        `cms:${slug}`,
        async () => {
          const { data, error } = await supabase
            .from('pages')
            .select('content')
            .eq('slug', slug)
            .maybeSingle();

          if (error) {
            console.error(`[CMS] Error fetching "${slug}":`, error.message);
            return null;
          }
          return data?.content || null;
        }
      );

      if (result) {
        setContent({ ...initialData, ...result });
      } else {
        setContent(initialData);
      }
    } catch (err) {
      console.error('[CMS] Unexpected error:', err);
      setContent(initialData);
    } finally {
      setLoading(false);
    }
    // initialData is a static default object, no need to track
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    fetchContent();

    // Subscribe to realtime changes for this specific page
    const channel = supabase.channel(`public:pages:slug=${slug}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pages', filter: `slug=eq.${slug}` },
        (payload) => {
          console.log(`[CMS Realtime] Page updated: ${slug}`, payload);
          // Invalidate cache for this specific page
          supaCache.invalidate(`cms:${slug}`);
          if (payload.new && (payload.new as any).content) {
            const newContent = { ...initialData, ...(payload.new as any).content };
            setContent(newContent);
            // Update cache with the fresh realtime data
            supaCache.set(`cms:${slug}`, (payload.new as any).content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchContent, slug]);

  return { content, loading };
}
