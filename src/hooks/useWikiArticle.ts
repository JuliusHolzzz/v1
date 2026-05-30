import { useState, useEffect } from 'react';
import { parseArticleContent } from '../lib/articleParser';

export const useWikiArticle = (title: string, language: string = 'de') => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title) return;
    
    let isMounted = true;
    
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const lang = language.toLowerCase() === 'en' ? 'en' : 'de';
        const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&origin=*`);
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error.info);
        }
        
        const rawHtml = data.parse.text['*'];
        const processedHtml = parseArticleContent(rawHtml);
        
        if (isMounted) {
          setHtml(processedHtml);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch article');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [title, language]);

  return { html, loading, error };
};

export const fetchRandomArticlePair = async (language: string = 'de') => {
  const lang = language.toLowerCase() === 'en' ? 'en' : 'de';
  const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=2&format=json&origin=*`);
  const data = await res.json();
  const pages = data.query.random;
  return {
    from: pages[0].title,
    to: pages[1].title
  };
};
