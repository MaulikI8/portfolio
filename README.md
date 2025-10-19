# Maulik Joshi - Portfolio Website

Hey there! This is my personal portfolio website built with Next.js 14 and TypeScript. I've put a lot of effort into making this both visually appealing and technically impressive.

## What's Inside

This portfolio showcases my journey as a backend-focused full-stack developer. Here's what makes it special:

- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Interactive Elements**: 3D hover effects, smooth animations, and engaging micro-interactions
- **Custom Illustrations**: I created custom SVGs for each project instead of using stock photos
- **Responsive Design**: Looks great on all devices
- **Performance Optimized**: Fast loading times and smooth animations

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth, professional animations
- **Icons**: React Icons (Heroicons, Font Awesome)
- **Email**: EmailJS for contact form functionality
- **Analytics**: Google Analytics integration

## Project Structure

```
portfolio/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── LoadingScreen.tsx
│   │   ├── ProjectIllustrations.tsx
│   │   └── ...
│   ├── sections/           # Page sections
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Projects.tsx
│   │   └── ...
│   ├── api/               # API routes
│   │   └── contact/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── config/
│   └── profile.json       # Profile data
├── public/               # Static assets
└── ...
```

## Design Philosophy

I wanted to create something that stands out from typical portfolio websites. The design focuses on:

- **Clean & Modern**: Minimalist approach with strategic use of color
- **Interactive**: Engaging animations that don't distract from content
- **Professional**: Strikes the right balance between creativity and professionalism
- **Accessible**: Works well for all users

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/MaulikI8/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your values
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Key Features

### Interactive Project Showcase
- Custom SVG illustrations for each project
- 3D hover effects with smooth transitions
- Staggered animations for visual appeal
- Responsive grid layout

### Smooth Animations
- Framer Motion for professional animations
- Intersection Observer for scroll-triggered effects
- Micro-interactions throughout the site

### Contact System
- EmailJS integration for contact form
- Excel export functionality for contact submissions
- Admin panel for managing submissions

## Customization

The portfolio is designed to be easily customizable:

1. **Profile Data**: Update `config/profile.json` with your information
2. **Projects**: Modify the projects array in `app/sections/Projects.tsx`
3. **Styling**: Customize colors and fonts in `tailwind.config.js`
4. **Content**: Update section components with your content

## Responsive Design

The website is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Deployment

This portfolio is deployed on Vercel for optimal performance:

1. Connect your GitHub repository to Vercel
2. Set up environment variables
3. Deploy automatically on every push to main

## Contributing

While this is my personal portfolio, I'm always open to feedback and suggestions! Feel free to:
- Open an issue for bugs or suggestions
- Fork the repository for your own use
- Share your thoughts on the design

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Thanks to the Next.js team for the amazing framework
- Framer Motion for the smooth animations
- Tailwind CSS for the utility-first approach
- All the open-source contributors who made this possible

---

**Built with love by Maulik Joshi**

*Last updated: January 2025*