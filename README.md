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

This project is designed to be easily customizable. You don't need to dive deep into the code to make it yours.

### 1. Update Your Information
All content is managed in `src/data/portfolioData.ts`. Open this file to update:
- **Personal Info**: Name, title, bio, and typewriter strings.
- **Experience**: Add your work history.
- **Skills**: List your technical skills.
- **Projects**: Add your projects with titles, descriptions, and links.
- **Contact**: Update your social media links and email.

### 2. Change Images
Images are located in `src/assets/images/`.
1.  **Add your image**: Drag and drop your profile picture (e.g., `my-photo.jpg`) into `src/assets/images/`.
2.  **Import it**: Open `src/data/portfolioData.ts` and import your image at the top:
    ```typescript
    import profileImg from '../assets/images/my-photo.jpg';
    ```
3.  **Use it**: Update the `profile` field in the `portfolioData` object:
    ```typescript
    export const portfolioData = {
      profile: profileImg,
      // ...
    };
    ```

### 3. Update Resume
- Place your resume PDF in the `public/` folder.
- Rename it to `resume.pdf` (or update the link in `src/components/Hero.tsx` if you prefer a different name).

### 4. Customize Colors
Want a different color scheme? Open `src/styles/global.css` and modify the CSS variables at the top:
```css
:root {
  --primary: #00f2ff; /* Change this to your favorite color */
  --secondary: #9d00ff; /* Change this to a matching secondary color */
  /* ... */
}
```

## 📂 Project Structure

```
portfolio-react/
├── public/              # Static assets (resume.pdf, favicon)
├── src/
│   ├── assets/          # Images and media
│   │   └── images/      # Profile and project images
│   ├── components/      # Reusable UI components (Hero, NavBar, etc.)
│   ├── data/            # Content data (portfolioData.ts)
│   ├── styles/          # Global styles and themes
│   ├── App.tsx          # Main application layout
│   └── main.tsx         # Entry point
├── package.json         # Dependencies and scripts
└── README.md            # Documentation
```

## 📜 License

Feel free to use this template for your own portfolio!

---
Made with ❤️ by [Arsalan.dev](https://github.com/arsalanbardsiri)
