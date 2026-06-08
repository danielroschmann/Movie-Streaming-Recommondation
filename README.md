# Movie Streaming & Recommendation App

A full-stack movie streaming platform where users can browse movies, get personalized recommendations based on their favourite genres, and stream content. Admins can write reviews that are automatically ranked using OpenAI sentiment analysis. Those rankings then feed into the recommendation engine to surface the best-rated movies in a user's preferred genres.

## Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, TypeScript
- **Backend**: Go (Gin), MongoDB, JWT authentication
- **AI**: OpenAI via LangChain Go — sentiment analysis on admin reviews for automatic ranking

## Structure

```
client/     # Next.js frontend (port 3000)
Server/     # Go backend (port 8080)
```

## Getting Started

**Backend**
```bash
cd Server/MovieStreamServer
# configure .env with MONGO_URI, JWT_SECRET, OPENAI_API_KEY, BASE_PROMPT_TEMPLATE
go run main.go
```

**Frontend**
```bash
cd client
npm install
npm run dev
```
