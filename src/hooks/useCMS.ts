import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCMS(slug: string, initialData: any = {}) {
  const [content, setContent] = useState<any>(initialData);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('content')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error(`[CMS] Error fetching "${slug}":`, error.message);
      }

      if (data?.content) {
        // DB values take precedence over defaults
        setContent({ ...initialData, ...data.content });
      } else {
        // No row in DB yet — use defaults
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
          if (payload.new && (payload.new as any).content) {
            setContent({ ...initialData, ...(payload.new as any).content });
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
