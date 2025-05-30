# AI Algo Trader
### Blog with chatroom for Algorithmic Trading Software Developers and Traders

## About

This project is a web application for algorithmic trading, utilizing AI.

## Overview

The application consists of a frontend built with Next.js and a backend built with Django REST Framework. It provides user authentication, allows users to view and potentially manage algorithmic trading strategies, interact with AI-powered analysis, and manage a blog.

## Key Features

-   **User Authentication:** Secure user registration and login using JWT tokens stored in HTTP-only cookies.
-   **Blog Functionality:**
    -   View articles.
    -   Create, Read, Update, and Delete (CRUD) operations for articles (based on observed "AddArticleForm").
-   **AI Integration:** (Implied by the name) Features related to AI-driven trading analysis (details not fully covered in our discussion).
-   **Responsive Frontend:** User interface built with React and Tailwind CSS for a modern and responsive experience.

## Technologies Used

-   **Frontend:** Next.js (React), Tailwind CSS
-   **Backend:** Django REST Framework, Simple JWT
-   **Database:** SQLite (default Django setup)

## Setup (Development)

1.  **Clone the repository.**
2.  **Backend Setup:**
    -   Navigate to the `backend` directory.
    -   Create a virtual environment: `python -m venv venv`
    -   Activate the virtual environment:
        -   On Windows: `venv\Scripts\activate`
        -   On macOS/Linux: `source venv/bin/activate`
    -   Install dependencies: `pip install -r requirements.txt` (You might need to create this file if you don't have one yet)
    -   Apply migrations: `python manage.py migrate`
    -   Run the development server: `python manage.py runserver`
3.  **Frontend Setup:**
    -   Navigate to the `frontend` directory.
    -   Install dependencies: `npm install` or `yarn install`
    -   Run the development server: `npm run dev` or `yarn dev`

## Further Development

(This section would be updated as we continue our work)

---

How does this look? Should we add anything else for now?