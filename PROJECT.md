PROJECT 
Project Version: v0.1.0 (Framework Prototype)
\# LeadGen Framework Project

\#\# Vision

This repository is being built as a reusable framework for local lead generation websites.

Although this repository is currently named \`roof-repair-modesto\`, the long-term goal is not to build a single roofing website. The goal is to build a reusable system that can power roofing, plumbing, HVAC, electrical, concrete, landscaping, and other local service businesses by changing only the content.

Eventually the framework itself may become its own repository (\`leadgen-framework\`) while individual city sites become separate repositories using the same codebase.

\---

\# Core Philosophy

Everything should be:

\- Reusable  
\- Data-driven  
\- Easy to maintain  
\- SEO-friendly  
\- Fast  
\- Accessible  
\- Easy to clone for new businesses

The objective is to create new microsites by replacing content rather than rewriting React components.

\---

\# Architecture Principles

\#\# Rule 1

No hardcoded business information inside reusable components.

Business name, city, services, branding, metadata, and page copy belong in content.

\---

\#\# Rule 2

Components receive props.

Components should not import \`site.json\`.

Instead:

Page

↓

Content

↓

Props

↓

Component

\---

\#\# Rule 3

Pages orchestrate.

Components render.

Pages assemble sections.

Sections render content.

\---

\#\# Rule 4

Every component should pass this test:

"Could this component be reused unchanged for a plumber?"

If not, redesign it.

\---

\#\# Rule 5

Only one layer should know where the content comes from.

Today:

content/site.json

Tomorrow:

CMS

Database

Markdown

API

The components should not care.

\---

\#\# Rule 6

Avoid repeating Tailwind class strings.

If the same layout appears multiple times, create a reusable component.

Examples:

Container

Section

SectionHeading

\---

\#\# Rule 7

Keep responsibilities separated.

layout/

Shared site layout

sections/

Homepage and page sections

common/

Shared layout primitives

ui/

shadcn components

lib/

Utilities

types/

TypeScript models

content/

Site content

\---

\# Content Philosophy

Content is treated as an API.

The goal is that every visible piece of text comes from JSON.

Eventually content/site.json should contain:

\- business  
\- branding  
\- seo  
\- navigation  
\- hero  
\- services  
\- whyChooseUs  
\- faq  
\- testimonials  
\- cta  
\- footer  
\- schema

React components should contain little or no marketing copy.

\---

\# Technology Stack

Next.js

TypeScript

Tailwind CSS

shadcn/ui

Lucide Icons

GitHub

Vercel Pro

JSON content

\---

\# Future Folder Structure

src/

app/

components/

layout/

sections/

common/

ui/

lib/

seo/

schema/

utils/

types/

content/

public/

docs/

\---

\# Long-Term Goal

Launching a new lead generation site should require little more than:

1\. Clone repository

2\. Replace content/site.json

3\. Replace images

4\. Deploy

No React code should need to change.

\---

\# Future Vision

Eventually this framework should generate:

\- Dynamic metadata  
\- LocalBusiness schema  
\- FAQ schema  
\- Service schema  
\- Breadcrumb schema  
\- XML sitemap  
\- robots.txt  
\- Open Graph images  
\- Contact forms  
\- Thank-you pages  
\- Analytics  
\- Call tracking placeholders

from the content model.

\---

\# Code Quality

Prefer:

Small components

Strong TypeScript types

Reusable sections

Meaningful commits

Clean Git history

No duplicated logic

Readable code over clever code

\---

\# Current Progress

Completed:

✓ Next.js setup

✓ GitHub repository

✓ Vercel-ready

✓ JSON content loading

✓ TypeScript models

✓ Shared layout

✓ Header

✓ Footer

✓ Hero component

✓ shadcn/ui

In Progress:

Reusable section architecture

Next:

Container

Section

SectionHeading

Service cards

FAQ

CTA

SEO engine

Schema generation

\---

\# Notes for Future Sessions

Continue building the LeadGen Framework.

Favor reusable architecture over quick solutions.

Avoid hardcoded business content.

Treat this project as a professional software product rather than a single website.

Always recommend architectural improvements when they increase maintainability or scalability without introducing unnecessary complexity.

