# Shape Merge - Infinite Puzzle

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/andymanitara/merge-burst)

Shape Merge is a visually vibrant, 'Kid Playful' styled grid-based puzzle game designed for mobile-first web experiences. It features an 8x8 grid where users drag and drop geometric shapes (Square, Triangle, Line, L-Shape, Dot) to merge them into higher tiers.

The game utilizes a physics-free environment (no gravity) where placement is strategic. The core loop involves placing shapes to trigger orthogonal merges (Tier 1 + Tier 1 → Tier 2), resulting in satisfying chain reactions and score multipliers.

## 🎮 Features

- **Endless Gameplay**: Infinite score-chasing mode with increasing complexity.
- **Strategic Merging**: Merge identical shapes to create higher-tier versions and clear space.
- **Chain Reactions**: Trigger satisfying multi-step merges for massive score multipliers.
- **Daily Challenge**: Compete on a shared seed board that resets every 24 hours.
- **Mobile-First Design**: Optimized for touch interactions with large targets and smooth animations.
- **Offline Capable**: Fully functional offline play with local progress saving.
- **Visual Polish**: "Kid Playful" aesthetic with bright colors, bouncy animations, and clear feedback.

## 🛠️ Tech Stack

This project is built with a modern, performance-focused stack:

- **Frontend Framework**: React 18 with Vite
- **Language**: TypeScript
- **State Management**: Zustand (with Immer for immutable updates)
- **Styling**: Tailwind CSS, ShadCN UI, CLSX, Tailwind Merge
- **Animations**: Framer Motion, Canvas Confetti
- **Drag & Drop**: @dnd-kit (Core, Modifiers, Utilities)
- **Icons**: Lucide React
- **Infrastructure**: Cloudflare Workers (Hono)
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- Node.js (v18 or higher recommended for compatibility)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/shape-merge.git
   cd shape-merge
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Development

Start the development server:

```bash
bun run dev
```

This will start the Vite development server, typically at `http://localhost:3000`.

### Building for Production

Create a production build:

```bash
bun run build
```

To preview the production build locally:

```bash
bun run preview
```

## 📦 Deployment

This project is configured for deployment on Cloudflare Workers.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/andymanitara/merge-burst)

### Manual Deployment

1. Authenticate with Cloudflare:
   ```bash
   bun run wrangler login
   ```

2. Deploy to Cloudflare Workers:
   ```bash
   bun run deploy
   ```

## 🕹️ How to Play

1. **Drag & Drop**: Drag shapes from the bottom queue onto the 8x8 grid.
2. **Merge**: Place identical shapes next to each other (up, down, left, right) to merge them into a higher-tier shape.
3. **Plan Ahead**: Shapes do not fall. Placement is permanent until merged.
4. **Hold Slot**: Use the hold slot to save a shape for later strategic use.
5. **Game Over**: The game ends when you cannot place any of the upcoming shapes on the grid.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.