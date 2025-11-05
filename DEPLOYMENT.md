# Deployment Guide

This guide will help you deploy Maulik Joshi's portfolio website to various platforms.

## Vercel (Recommended)

Vercel is the easiest way to deploy a Next.js application.

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial portfolio setup"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect it's a Next.js project

3. **Deploy**
   - Click "Deploy"
   - Your site will be live in minutes!

### Custom Domain (Optional)
- In your Vercel dashboard, go to your project settings
- Add your custom domain
- Update DNS records as instructed

## Netlify

### Steps:

1. **Build the project**
   ```bash
   npm run build
   npm run export
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `out` folder to deploy
   - Or connect your GitHub repository

## AWS Amplify

### Steps:

1. **Push to GitHub** (same as Vercel)

2. **Connect to AWS Amplify**
   - Go to AWS Amplify console
   - Click "New app" > "Host web app"
   - Connect your GitHub repository
   - Build settings will be auto-detected

3. **Deploy**
   - Review build settings and deploy

## Docker Deployment

### Create Dockerfile:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Deploy:
```bash
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

## Environment Variables

If you need environment variables:

1. **Create `.env.local`**:
   ```env
   NEXT_PUBLIC_GA_ID=your-google-analytics-id
   NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
   ```

2. **Add to your deployment platform**:
   - Vercel: Project Settings > Environment Variables
   - Netlify: Site Settings > Environment Variables
   - AWS Amplify: App Settings > Environment Variables

## Performance Optimization

### Before Deployment:

1. **Optimize Images**
   ```bash
   # Use WebP format for better compression
   # Ensure images are properly sized
   ```

2. **Check Bundle Size**
   ```bash
   npm run build
   npm run analyze
   ```

3. **Test Performance**
   - Use Lighthouse in Chrome DevTools
   - Test on mobile devices
   - Check Core Web Vitals

## SEO Checklist

Before going live:

- [ ] Update meta tags in `app/layout.tsx`
- [ ] Add your actual social media links
- [ ] Update `config/profile.json` with real information
- [ ] Test all internal links
- [ ] Verify contact form works
- [ ] Check responsive design on all devices

## Common Issues

### Build Errors:
- Ensure all dependencies are installed
- Check TypeScript errors: `npm run type-check`
- Verify all imports are correct

### Performance Issues:
- Optimize images and use Next.js Image component
- Enable compression
- Use CDN for static assets

### SEO Issues:
- Verify meta tags are correct
- Check Open Graph images
- Test social media sharing

## Support

If you encounter issues:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review the [Vercel deployment guide](https://vercel.com/docs)
3. Check the project's GitHub issues

---

Happy deploying!
