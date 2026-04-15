# Bloom Marketing Website - Directory Structure

Complete directory structure of the deployment pipeline setup.

```
/mnt/c/Users/Zachg/Bloom-Website/
│
├── .github/                                    # GitHub configuration
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md                       # Bug report template
│   │   └── feature_request.md                  # Feature request template
│   ├── workflows/                              # GitHub Actions workflows
│   │   ├── deploy.yml                          # Main CI/CD pipeline
│   │   └── dependency-review.yml               # Dependency scanning
│   └── PULL_REQUEST_TEMPLATE.md                # PR template with checklist
│
├── .vscode/                                    # VSCode configuration
│   ├── extensions.json                         # Recommended extensions
│   └── settings.json                           # Editor settings
│
├── public/                                     # Static assets (copied as-is)
│   ├── robots.txt                              # Search engine crawler rules
│   ├── favicon.ico                             # [TO ADD] Site favicon
│   ├── og-image.jpg                            # [TO ADD] Open Graph image
│   └── fonts/                                  # [TO ADD] Web fonts
│       ├── orbitron-v29-latin-regular.woff2
│       └── inter-v13-latin-regular.woff2
│
├── scripts/                                    # Build and optimization scripts
│   └── optimize-build.sh                       # Post-build optimization
│
├── src/                                        # Source code
│   ├── components/                             # Reusable Astro components
│   │   ├── Analytics.astro                     # Plausible analytics integration
│   │   └── SEO.astro                           # SEO meta tags component
│   │
│   ├── layouts/                                # Page layouts
│   │   └── BaseLayout.astro                    # Main layout wrapper
│   │
│   ├── pages/                                  # Route pages (file-based routing)
│   │   ├── index.astro                         # Homepage (/)
│   │   └── 404.astro                           # 404 error page
│   │
│   ├── styles/                                 # [TO ADD] Global styles
│   │   └── global.css
│   │
│   └── utils/                                  # [TO ADD] Helper functions
│       └── helpers.ts
│
├── .env.example                                # Environment variables template
├── .eslintrc.json                              # ESLint configuration
├── .gitignore                                  # Git ignore rules
├── .lighthouserc.json                          # Lighthouse CI configuration
├── .prettierignore                             # Prettier ignore rules
├── .prettierrc.json                            # Prettier configuration
├── astro.config.mjs                            # Astro framework configuration
├── LICENSE                                     # Source-visible license
├── netlify.toml                                # Netlify deployment configuration
├── package.json                                # Dependencies and scripts
├── performance-budget.json                     # Performance budget limits
├── tsconfig.json                               # TypeScript configuration
│
└── Documentation/
    ├── README.md                               # Project overview
    ├── DEPLOYMENT.md                           # Detailed deployment guide
    ├── DEPLOYMENT_PIPELINE_SUMMARY.md          # Pipeline summary (this was just created)
    ├── PRE_DEPLOYMENT_CHECKLIST.md             # Pre-deployment checklist
    ├── QUICKSTART.md                           # 30-minute quick start
    ├── plausible-setup.md                      # Analytics setup guide
    └── DIRECTORY_STRUCTURE.md                  # This file
```

---

## File Count by Category

### Configuration Files (14)
- `netlify.toml` - Netlify deployment configuration
- `astro.config.mjs` - Astro framework settings
- `package.json` - npm dependencies and scripts
- `tsconfig.json` - TypeScript compiler options
- `.eslintrc.json` - Code linting rules
- `.prettierrc.json` - Code formatting rules
- `.prettierignore` - Files to exclude from formatting
- `.lighthouserc.json` - Performance testing config
- `performance-budget.json` - Resource size limits
- `.gitignore` - Git exclusion rules
- `.env.example` - Environment variables template
- `.vscode/settings.json` - VSCode workspace settings
- `.vscode/extensions.json` - Recommended VSCode extensions
- `public/robots.txt` - SEO crawler directives

### CI/CD Pipeline (2)
- `.github/workflows/deploy.yml` - Main deployment pipeline
- `.github/workflows/dependency-review.yml` - Dependency security check

### Scripts (1)
- `scripts/optimize-build.sh` - Build optimization and analysis

### Components (2)
- `src/components/SEO.astro` - SEO meta tags
- `src/components/Analytics.astro` - Analytics integration

### Layouts (1)
- `src/layouts/BaseLayout.astro` - Base page layout

### Pages (2)
- `src/pages/index.astro` - Homepage
- `src/pages/404.astro` - 404 error page

### Documentation (7)
- `README.md` - Project documentation
- `DEPLOYMENT.md` - Deployment instructions
- `DEPLOYMENT_PIPELINE_SUMMARY.md` - Pipeline overview
- `PRE_DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `QUICKSTART.md` - Quick start guide
- `plausible-setup.md` - Analytics setup
- `DIRECTORY_STRUCTURE.md` - This file

### GitHub Templates (3)
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug reporting
- `.github/ISSUE_TEMPLATE/feature_request.md` - Feature requests
- `.github/PULL_REQUEST_TEMPLATE.md` - Pull request template

### Legal (1)
- `LICENSE` - Source-visible license

---

## Total Files Created: 33

---

## Files You Need to Add

Before deployment, you'll need to add these assets:

### Required
1. **Favicon** (`public/favicon.ico`)
   - 32x32 or 16x16 pixels
   - .ico format

2. **Open Graph Image** (`public/og-image.jpg`)
   - 1200x630 pixels (recommended)
   - JPG or PNG format
   - Used for social media previews

3. **Fonts** (`public/fonts/`)
   - Orbitron (headings)
   - Inter (body text)
   - WOFF2 format for best compression

### Optional but Recommended
4. **Apple Touch Icon** (`public/apple-touch-icon.png`)
   - 180x180 pixels
   - PNG format

5. **Web Manifest** (`public/manifest.json`)
   - PWA configuration (optional)

6. **Additional Pages**
   - About page (`src/pages/about.astro`)
   - Factions page (`src/pages/factions.astro`)
   - Contact page (`src/pages/contact.astro`)

---

## Generated at Build Time

These files are auto-generated during `npm run build`:

- `dist/` - Production build output
- `dist/sitemap-index.xml` - Auto-generated sitemap
- `.astro/` - Astro build cache
- `node_modules/` - Dependencies

---

## Environment-Specific Files

### Local Development Only
- `.env` - Local environment variables (gitignored)
- `node_modules/` - Dependencies (gitignored)
- `.astro/` - Build cache (gitignored)

### Production (Netlify)
- Environment variables set in Netlify dashboard
- Build artifacts stored in Netlify CDN

---

## Key File Relationships

```
┌─────────────────────────────────────────┐
│         netlify.toml                    │  Netlify configuration
│  - References: dist/                    │
│  - Uses: Environment variables          │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      astro.config.mjs                   │  Astro configuration
│  - Outputs to: dist/                    │
│  - Uses integrations: sitemap, robots   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      src/layouts/BaseLayout.astro       │  Base layout
│  - Imports: SEO.astro, Analytics.astro  │
│  - Used by: All pages                   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      src/pages/index.astro              │  Homepage
│  - Uses: BaseLayout.astro               │
│  - Rendered to: dist/index.html         │
└─────────────────────────────────────────┘
```

---

## Build Flow

```
1. npm run build
   │
   ├─→ Type check (tsconfig.json)
   ├─→ Lint (eslintrc.json)
   ├─→ Build (astro.config.mjs)
   │   │
   │   ├─→ Process .astro files
   │   ├─→ Optimize images (Sharp)
   │   ├─→ Generate sitemap
   │   ├─→ Generate robots.txt
   │   └─→ Output to dist/
   │
   └─→ Lighthouse CI (.lighthouserc.json)
       │
       └─→ Performance check (pass/fail)
```

---

## Development vs Production

| Feature | Development | Production |
|---------|------------|------------|
| Analytics | Disabled | Enabled |
| Source Maps | Yes | Optional |
| Minification | No | Yes |
| Image Optimization | Basic | Full (WebP/AVIF) |
| Cache Headers | None | Aggressive |
| Error Details | Verbose | Hidden |
| Hot Reload | Yes | N/A |

---

## Next Steps

1. **Add missing assets** (fonts, favicon, images)
2. **Create content pages** (about, factions, etc.)
3. **Test locally** (`npm run dev`)
4. **Build and verify** (`npm run build && npm run preview`)
5. **Deploy** (follow QUICKSTART.md)

---

**Last Updated:** November 1, 2025
