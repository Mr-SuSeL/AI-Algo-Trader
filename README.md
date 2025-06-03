# AI Algo Trader
### Blog with Chatroom for Algorithmic Trading Software Developers and Traders

## About

This project is a web application for algorithmic trading, utilizing AI.

## Overview

The application consists of a frontend built with Next.js and a backend built with Django REST Framework. It provides user authentication, allows users to view and manage blog articles, and will facilitate real-time communication through a chatroom.

## Key Features

* **User Authentication:** Secure user registration and login using JWT tokens stored in HTTP-only cookies.
* **Blog Functionality:**
    * View articles.
    * Create, Read, Update, and Delete (CRUD) operations for articles.
* **Live Chatroom:** Real-time communication for community interaction (planned using Django Channels and WebSockets).
* **AI Integration:** (Implied by the name) Features related to AI-driven trading analysis.
* **Responsive Frontend:** User interface built with React and Tailwind CSS for a modern and responsive experience across devices.

## Technologies Used

* **Frontend:** Next.js (React), Tailwind CSS
* **Backend:** Django REST Framework, Simple JWT, Django Channels (for chatroom)
* **Database:** PostgreSQL

## Setup (Development)

1.  **Clone the repository.**

2.  **Backend Setup:**
    * Navigate to the `backend` directory.
    * Create a virtual environment: `python -m venv venv`
    * Activate the virtual environment:
        * On Windows: `venv\Scripts\activate`
        * On macOS/Linux: `source venv/bin/activate`
    * Install dependencies: `pip install -r requirements.txt` (Ensure `psycopg2-binary` and `python-dotenv` are included in your `requirements.txt` or install them manually: `pip install psycopg2-binary python-dotenv`)
    * **Database Configuration:**
        * Ensure PostgreSQL is installed and running.
        * Create a new PostgreSQL database (e.g., `blog`) and a dedicated user with appropriate permissions for it.
        * Create a `.env` file in `backend/api/` (next to `settings.py`) with your PostgreSQL credentials and other sensitive settings, following the `env.example` template.
    * Apply migrations: `python manage.py migrate`
    * Create a superuser (for admin access): `python manage.py createsuperuser`
    * Run the development server: `python manage.py runserver`

3.  **Frontend Setup:**
    * Navigate to the `frontend` directory.
    * Install dependencies: `npm install` or `yarn install`
    * Run the development server: `npm run dev` or `yarn dev`

## Further Development

(This section will be updated as we continue our work on the chatroom and other features.)