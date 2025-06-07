# AI Algo Trader
### Blog with Chatroom for Algorithmic Trading Software Developers and Traders

## About

This project is a web application for algorithmic trading, utilizing AI. It's designed to provide a robust platform for developers and traders, featuring blog functionalities and real-time communication tools.

## Overview

The application consists of a **frontend** built with Next.js and a **backend** built with Django REST Framework. It provides user authentication, allows users to view and manage blog articles, and now fully supports real-time communication through a chatroom. The entire stack is designed to be runnable both in a traditional development setup and using Docker for containerization.

## Key Features

* **User Authentication:** Secure user registration and login using JWT tokens stored in HTTP-only cookies.
* **Blog Functionality:**
    * View articles.
    * Create, Read, Update, and Delete (CRUD) operations for articles.
* **Live Chatroom:** **Fully functional real-time communication** for community interaction, powered by **Django Channels**, **Daphne**, and a **Redis Channel Layer**. Users can exchange messages in designated chat rooms.
    * **Available Chat Rooms:**
        * **Trading**
        * **Algorithmic Trading**
        * **Quantitative Trading**
        * **High Frequency Trading**
        * **Machine Learning**
        * **Cloud Solutions**
        * **TradingView & PineScript**
        * **MetaTrader & MQL**
        * **Futures**
        * **Options**
        * **Cryptocurrency Trading**
        * **C++ Programming**
        * **Python Programming**
* **AI Integration:** (Implied by the name) Features related to AI-driven trading analysis.
* **Responsive Frontend:** User interface built with React and Tailwind CSS for a modern and responsive experience across devices.

## Technologies Used

* **Frontend:** Next.js (React), Tailwind CSS
* **Backend:** Django REST Framework, Simple JWT, Django Channels (for chatroom)
* **Asynchronous Server:** **Daphne** (ASGI server for Django Channels)
* **Message Broker/Channel Layer:** **Redis** (used by Django Channels for real-time communication)
* **Containerization:** **Docker**, Docker Compose
* **Database:** PostgreSQL

---

## Setup (Development)

This section describes how to set up the project without Docker.

1.  **Clone the repository.**

2.  **Backend Setup:**
    * Navigate to the `backend` directory.
    * Create a virtual environment: `python -m venv venv`
    * Activate the virtual environment:
        * On Windows: `venv\Scripts\activate`
        * On macOS/Linux: `source venv/bin/activate`
    * Install dependencies: `pip install -r requirements.txt` (Ensure `psycopg2-binary`, `python-dotenv`, `channels`, and `channels_redis` are included in your `requirements.txt` or install them manually: `pip install psycopg2-binary python-dotenv channels channels_redis`)
    * **Database Configuration:**
        * Ensure PostgreSQL is installed and running locally.
        * Create a new PostgreSQL database (e.g., `algo_db`) and a dedicated user with appropriate permissions for it.
        * Create a `.env` file in `backend/.env` (or `backend/api/.env` if that's your standard) with your PostgreSQL credentials and other sensitive settings, following the `env.example` template.
        * Ensure your `settings.py` is configured with `ASGI_APPLICATION` and `CHANNEL_LAYERS` pointing to Redis on `localhost:6379`.
    * Apply migrations: `python manage.py migrate`
    * Create a superuser (for admin access): `python manage.py createsuperuser`
    * **Run the Django REST Framework development server:**
        ```bash
        python manage.py runserver 0.0.0.0:8000
        ```
    * **Run the Daphne ASGI server (for WebSockets):**
        * Ensure **Redis server is running** locally (default port: `6379`).
        * In a **separate terminal**, activate the virtual environment and run Daphne:
            ```bash
            python -m daphne api.asgi:application -b 0.0.0.0 -p 8001
            ```
            **Note:** Django's `runserver` and Daphne must run on different ports. Here, Django is on `8000` and Daphne on `8001`.

3.  **Frontend Setup:**
    * Navigate to the `frontend` directory.
    * Install dependencies: `npm install` or `yarn install`
    * Ensure your frontend code (`frontend/app/chat/page.js`) connects to WebSocket on port `8001`.
    * Run the development server: `npm run dev` or `yarn dev`
        * Access the application at `http://localhost:3000`. The chatroom will be at `http://localhost:3000/chat`.

---

## Docker Setup (Development/Production)

For a containerized environment, use Docker Compose to manage all services.

1.  **Ensure Docker Desktop is installed and running** on your system.

2.  **Navigate to the root directory of your project** (`C:\AI-Algo-Trader`), where `docker-compose.yml` is located.

3.  **Ensure your `.env` file for backend is properly configured** with database credentials and Django secret key.

4.  **Build and run the Docker containers:**
    ```bash
    docker compose up -d --build
    ```
    * `--build`: Rebuilds service images (useful after code changes).
    * `-d`: Runs containers in detached mode (in the background).

    This command will:
    * Build the `backend` service (which will run **Daphne on port 8001** for WebSockets, and your Django application through an ASGI entry point).
    * Start the `redis` service (available on port `6379`).
    * Start the `db` (PostgreSQL) service (available on port `5432`).

5.  **Access the Application:**
    * Your Django backend (HTTP/REST) will be accessible via a separate service (if configured in `docker-compose.yml` - typically with Gunicorn or Uvicorn behind Nginx, which is not fully covered in this `docker-compose.yml` but implied for a full production setup).
    * **Daphne (WebSockets) will be exposed on port `8001`**. Your frontend should connect to this port for real-time communication.
    * Your Next.js frontend will run separately (as described in "Frontend Setup") and connect to these services.

## Further Development

We have successfully implemented the core chatroom functionality. The next steps will focus on:

* **WebSocket Authentication:** Implementing a custom authentication middleware for Django Channels to securely link WebSocket connections to authenticated users, likely using JWT tokens.
* **Production Deployment:** Enhancing the Docker setup to include a production-ready web server (e.g., Nginx) to serve the frontend, handle static files, proxy HTTP requests to Django (Gunicorn/Uvicorn), and proxy WebSocket connections to Daphne.
* **Additional Chat Features:** Exploring features like displaying active users, private messaging, etc.
* **Chat History Persistence:** Implementing a mechanism to store chat messages in a database (e.g., PostgreSQL) for historical access, ensuring that past conversations are preserved and loaded when users join a room. This could involve using Django ORM to save messages.
* **Frontend State Management Improvement:** Transitioning from React Context API to a more robust state management solution like **Redux (or Redux Toolkit)** for global application state.
* **AI-Driven Chat Features:** Integrating an AI model (e.g., through a separate service or API) to provide functionalities like:
    * **Summarization of chat conversations** (e.g., daily summaries for each room).
    * **Automated content moderation** to detect and flag inappropriate messages.
    * **Answer generation** for frequently asked questions or technical queries within specific trading rooms, utilizing a knowledge base.
    * **Sentiment analysis** of chat messages to gauge community mood on certain topics or market movements.
* **Integration with Trading APIs:** Connecting the platform with live trading APIs (e.g., Alpaca, Interactive Brokers) to:
    * Display real-time market data directly within relevant chat rooms.
    * Allow users to trigger simulated or even live trades (with appropriate disclaimers and security) based on discussions or AI analysis.
* **Notifications System:** Implementing push notifications or in-app alerts for new messages, mentions, or specific market events.

---

Mam nadzieję, że ta rozszerzona sekcja "Further Development" lepiej oddaje wszystkie pomysły, które przewinęły się przez nasze rozmowy!