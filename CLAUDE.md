# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend for PalateMap, a mobile app for discovering, sharing, and collaborating on food recommendations. The app is a social platform where users can share restaurant recommendations on maps, connect with friends, and upvote places. See PRD.md for full product requirements.

## Technology Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono
- **Build**: Turbopack (via --turbopack flag)
- **Linting**: ESLint 9 with Next.js config

## Common Commands

```bash
# Development
pnpm dev          # Start dev server with Turbopack
pnpm build        # Build for production with Turbopack  
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Package management
pnpm install      # Install dependencies
```

## Architecture

### Project Structure
```
src/
  app/              # Next.js App Router pages and layouts
    layout.tsx      # Root layout with Geist fonts
    page.tsx        # Homepage 
    globals.css     # Global Tailwind styles
```

### Key Features to Implement (from PRD)
- Map view with restaurant pins (Google Maps integration)
- User authentication (phone/OTP)
- Restaurant recommendation system
- Social features (friends, upvotes, feed)
- Profile management with preferences
- Multi-user collaboration on maps
- Photo upload and sharing

### Mobile-First Approach
The app targets mobile users primarily (iOS/Android via React Native or PWA), so all UI should be optimized for mobile screens with responsive breakpoints.

## Development Notes

- Uses Turbopack for faster builds and development
- Geist fonts are pre-configured for optimal loading
- Tailwind v4 with PostCSS for styling
- TypeScript strict mode enabled
- App Router structure for file-based routing

## TODO: Security Review Needed

### Profile Pictures Storage Bucket Configuration
**Current**: Public bucket (`005_setup_profile_pictures_storage.sql`)
- ✅ Profile pictures are publicly accessible via direct URLs
- ✅ Better performance, simpler implementation
- ❌ Less secure - images accessible if URL is known

**Alternative**: Private bucket (`005b_private_profile_pictures_storage.sql`)  
- ✅ More secure - requires signed URLs to access
- ✅ Better privacy control
- ❌ More complex implementation, worse performance

**Decision needed**: Choose public vs private bucket based on security requirements vs UX trade-offs. For social apps, public is typically preferred, but review based on specific privacy requirements.