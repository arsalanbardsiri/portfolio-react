# Modern React Portfolio (2025 Edition)

A premium, high-performance portfolio website built with **React**, **TypeScript**, and **Framer Motion**. It features a stunning "Geometric Tech" theme with glassmorphism, physics-based interactions, and a fully responsive design optimized for 2025 industry standards.

## 🚀 Features

- **🎨 Geometric Tech Design System**:
  - **Glassmorphism**: Modern, frosted-glass UI elements with rotating light borders.
  - **Dynamic Backgrounds**: Dot grid patterns and parallax floating shapes.
  - **Dark/Light Mode**: Deep navy/cyan for dark mode, crisp white/blue for light mode.
  - **Neon Aesthetics**: Glowing accents and gradients.

- **✨ Advanced Animations**:
  - **Neon Pull Switch**: A custom physics-based pull cord to toggle themes (built with Framer Motion).
  - **Staggered Reveals**: Content cascades in smoothly as you scroll.
  - **Floating Avatar**: Interactive 3D-style floating profile image with orbiting satellites.
  - **Micro-interactions**: Magnetic buttons, "breathing" hover effects, and tilt cards.

- **📱 Fully Responsive & Accessible**:
  - Adaptive grid layouts for all screen sizes.
  - Mobile-first navigation with a smooth hamburger menu.
  - **A11y Compliant**: Full keyboard navigation and screen reader support.

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
- Place your resume PDF in `src/assets/pdf/`.
- Rename it to `resume.pdf` (or update the import in `src/data/portfolioData.ts`).

### 4. Customize Colors
Want a different color scheme? Open `src/styles/global.css` and modify the CSS variables at the top:
```css
:root {
  --primary: #00f2ff; /* Change this to your favorite color */
  --secondary: #9d00ff; /* Change this to a matching secondary color */
  /* ... */
}
```

## 🚀 Deployment

This project is optimized for **Vercel** or **Netlify**.

1.  Push your code to GitHub.
2.  Import the repository into Vercel/Netlify.
3.  It will automatically detect Vite and deploy.
4.  (Optional) Connect your custom domain.

## 📂 Project Structure

```
portfolio-react/
├── public/              # Static assets (favicon)
├── src/
│   ├── assets/          # Images, PDFs, and media
│   │   ├── images/      # Profile and project images
│   │   └── pdf/         # Resume file
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
