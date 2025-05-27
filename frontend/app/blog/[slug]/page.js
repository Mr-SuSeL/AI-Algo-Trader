import { notFound } from 'next/navigation';

const API_URL = 'http://localhost:8000/api/articles/';

// export async function generateStaticParams() {
//     return [{ slug: 'my-first-article' }, { slug: 'my-second-article' }];
// }

export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_URL}articles/`);
        if (!res.ok) {
            console.error('Błąd podczas pobierania listy artykułów:', res.status, res.statusText);
            return [];
        }
        const articles = await res.json();
        // console.log('Odebrane artykuły w generateStaticParams:', articles);
        return articles.map((article) => ({ slug: article.slug }));
    } catch (error) {
        console.error('Błąd podczas pobierania listy artykułów:', error);
        return [];
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        const res = await fetch(`${API_URL}articles/${slug}/`);
        if (!res.ok) return { title: 'Artykuł nieznaleziony' };
        const article = await res.json();
        return {
            title: article?.title || 'Artykuł',
            description: article?.description || '',
        };
    } catch (error) {
        console.error('Błąd podczas generowania metadanych:', error);
        return { title: 'Błąd ładowania' };
    }
}

async function getArticle(slug) {
    const res = await fetch(`${API_URL}articles/${slug}/`);
    if (!res.ok) {
        notFound();
    }
    return res.json();
}

export default async function ArticleDetail({ params }) {
    const { slug } = await params;
    const article = await getArticle(slug);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">{article.title}</h1>
            <p className="text-gray-800 text-lg mb-4">{article.content}</p>
            <p className="text-sm text-gray-500">Autor: {article.author}</p>
            <p className="text-sm text-gray-500">Opublikowano: {new Date(article.published).toLocaleDateString()}</p>
            {/* Zakomentowany przycisk */}
            {/*
            <button
                onClick={() => window.history.back()}
                className="mt-6 px-6 py-2 bg-transparent border border-gray-500 text-gray-800 rounded-full shadow hover:bg-gray-500 hover:text-white transition-all"
            >
                Wróć
            </button>
            */}
        </div>
    );
}