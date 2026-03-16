// Wikipedia cache functions (Supabase table removed - using no-cache mode)
const getWikipediaData = async (_title: string): Promise<{ links: string[], extract: string | null } | null> => null;
const saveWikipediaData = async (_title: string, _links: string[], _extract: string | null): Promise<void> => { };

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

export async function fetchWikiConcept(pageTitle: string): Promise<{ links: string[], extract: string | null }> {
    // Check in database cache first
    const cached = await getWikipediaData(pageTitle);
    if (cached) {
        return cached;
    }

    const url = new URL(WIKI_API);
    url.searchParams.set('action', 'query');
    url.searchParams.set('format', 'json');
    url.searchParams.set('titles', pageTitle);
    url.searchParams.set('redirects', '1');

    // Fetch both LINKS and EXTRACTS (plain text resume)
    url.searchParams.set('prop', 'links|extracts');

    // Limits for links
    url.searchParams.set('pllimit', '30'); // Only top 30 links to avoid polluting the tree
    url.searchParams.set('plnamespace', '0'); // main articles only (no user, talk, help pages)

    // Configure Extracts
    url.searchParams.set('exintro', '1'); // Only the intro paragraph
    url.searchParams.set('explaintext', '1'); // Plain text instead of HTML
    url.searchParams.set('exchars', '500'); // Limit to 500 chars

    try {
        const response = await fetch(url.toString(), {
            headers: { 'User-Agent': 'NexusCapitalElite/2.0 (Murilo Interpira Web App)' }
        });

        if (!response.ok) return { links: [], extract: null };

        const data = await response.json();

        const pages = data.query?.pages;
        if (!pages) return { links: [], extract: null };

        const pageId = Object.keys(pages)[0];
        if (pageId === '-1') return { links: [], extract: null };

        const pageData = pages[pageId];

        let links: string[] = [];
        if (pageData.links) {
            links = pageData.links.map((l: any) => l.title);
        }

        const extract = pageData.extract || null;

        // Filter out common dates or very unhelpful pages to improve the graph
        links = links.filter(l => !l.match(/^[0-9]{4}$/) && !l.includes('List of') && !l.includes('Timeline of'));

        // Save to cache asynchronously 
        if (links.length > 0 || extract) {
            saveWikipediaData(pageTitle, links, extract).catch(console.error);
        }

        return { links, extract };
    } catch (error) {
        console.error(`Error fetching wiki concept for ${pageTitle}:`, error);
        return { links: [], extract: null };
    }
}
