// frontend/app/blog/[slug]/page.js
import { notFound } from 'next/navigation';
import React from 'react';
import ArticleDetailClient from './ArticleDetailClient';

const API_URL = 'http://localhost:8000/api/articles/';

export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_URL}`);
        if (!res.ok) {
            console.error('Błąd podczas pobierania listy artykułów:', res.status, res.statusText);
            return [];
        }
        const articles = await res.json();
        return articles.map((article) => ({ slug: article.slug }));
    } catch (error) {
        console.error('Błąd podczas pobierania listy artykułów:', error);
        return [];
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        const res = await fetch(`${API_URL}${slug}/`);
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
    const res = await fetch(`${API_URL}${slug}/`);
    if (!res.ok) {
        notFound();
    }
    return res.json();
}

export default async function ArticleDetail({ params }) {
    const { slug } = await params;
    const article = await getArticle(slug);
    return <ArticleDetailClient article={article} />;
}