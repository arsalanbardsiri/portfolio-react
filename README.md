# Modern React Portfolio

A premium, high-performance portfolio website built with **React**, **TypeScript**, and **Framer Motion**. It features a stunning dark/light theme with glassmorphism, physics-based interactions, and a fully responsive design.

## 🚀 Features

- **🎨 Premium Design System**:
  - **Glassmorphism**: Modern, frosted-glass UI elements.
  - **Dark/Light Mode**: Deep navy/cyan for dark mode, crisp white/blue for light mode.
  - **Neon Aesthetics**: Glowing accents and gradients.

- **✨ Advanced Animations**:
  - **Neon Pull Switch**: A custom physics-based pull cord to toggle themes (built with Framer Motion).
  - **Staggered Reveals**: Content cascades in smoothly as you scroll.
  - **Floating Avatar**: Interactive 3D-style floating profile image.
  - **Micro-interactions**: Hover effects, tilt cards, and magnetic buttons.

- **📱 Fully Responsive**:
  - Adaptive grid layouts for all screen sizes.
  - Mobile-first navigation with a smooth hamburger menu.

- **⚡ Tech Stack**:
  - **React 18** + **TypeScript**
  - **Vite** (Blazing fast build tool)
  - **Framer Motion** (Animation library)
  - **React Slick** (Project carousel)
  - **Typewriter Effect** (Dynamic text)

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd portfolio-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🛠 Customization

All content is managed in a single JSON file for easy updates without touching the code.

1. **Update Content**:
   - Open `src/data/portfolioData.json`.
   - Edit your **Name**, **Bio**, **Skills**, **Experience**, and **Projects**.
   - Update social links in the `contact` section.

2. **Change Images**:
   - Place your profile picture in `public/assets/images/`.
   - Update the `profile` filename in `portfolioData.json`.
   - Add project screenshots to the same folder and update `imageUrl` in the `projects` array.

3. **Resume**:
   - Place your resume PDF in the `public/` folder and name it `resume.pdf`.

## 📂 Project Structure

```
portfolio-react/
├── public/              # Static assets (images, resume, favicon)
├── src/
│   ├── components/      # Reusable UI components (Hero, NavBar, ThemeCord, etc.)
│   ├── data/            # Content data (portfolioData.json)
│   ├── styles/          # Global styles and CSS variables
│   ├── App.tsx          # Main application layout
│   └── main.tsx         # Entry point
├── package.json         # Dependencies and scripts
└── README.md            # Documentation
```

## 📜 License

Feel free to use this template for your own portfolio!

---
Made with ❤️ by [Arsalan.dev](https://github.com/arsalanbardsiri)
