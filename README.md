# Freedom Wall

Freedom Wall is a digital sanctuary for your thoughts, confessions, and unspoken words. Built with the belief that everyone needs a safe, judgment-free space to express themselves, this platform allows you to pin your feelings anonymously to a public digital bulletin board. 

Whether you want to dedicate a message to a secret crush, vent your daily frustrations, or simply share a fleeting thought, the Freedom Wall is here to listen. You can express your exact mood and even attach a Spotify song to set the perfect vibe for your message. 

No accounts. No tracking. Just pure, anonymous expression.

## Features

- **Anonymous Confessions:** Write down your deepest thoughts or messages without revealing who you are.
- **Digital Bulletin Board:** Every post gets "pinned" to the wall like a digital sticky note, complete with a pushpin and a realistic paper aesthetic.
- **Spotify Integration:** Search for any song on Spotify and attach it to your post to perfectly capture the mood of your message.
- **Mood Tracking:** Choose from a variety of mood emojis (like 🔥, 💡, 🤔, 🌊, 💕, 😤, 💭) to express exactly how you were feeling when you wrote your message.
- **Interactive Design:** A gorgeous, dark-mode animated background with soft floating chat bubbles and fun confetti explosions whenever you pin a new message to the wall!
- **Hidden Admin Dashboard:** A secret `/keys` route to manage and delete unwanted posts to keep the community clean.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS for custom animations
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Music API:** [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started Locally

To run this project on your local machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/erol0713/Freedom-Wall.git
cd Freedom-Wall
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add your secret keys:
```env
MONGODB_URI=your_mongodb_connection_string
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the Freedom Wall in action.

## Database Management

If you ever need to clear all posts from your database, a handy script is included:
```bash
node --env-file=.env.local clear.mjs
```
