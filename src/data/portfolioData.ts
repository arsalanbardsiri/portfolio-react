// IMAGES
// Note: verify the extensions match exactly (.png vs .jpg vs .jpeg)
import profileImg from '../assets/images/IMG_2929.jpeg';
import blogLogImg from '../assets/images/bloglounge.png';
import projectItImg from '../assets/images/projectit.png';
import catlenderImg from '../assets/images/catlender.png';

// PDF
import resumePdf from '../assets/pdf/resume.pdf';

export const portfolioData = {
    "profile": profileImg,
    "resumeUrl": resumePdf,
    "name": "Arsalan Bardsiri",
    "title": "Full-Stack Software Engineer",
    "typewriterTexts": [
        "Hybrid Full-stack/DevOps Developer",
        "Full Cycle/AI Augmented Development",
        "QA Automation & SRE Expert"
    ],
    "about": {
        "bio": "I am a hybrid software engineer bridging the gap between development and quality assurance. With a strong background in distributed systems and automation, I build scalable, reliable web applications using the modern React stack and cloud-native architecture.",
        "stats": [
            {
                "label": "Years Experience",
                "value": "3+"
            },
            {
                "label": "Projects Shipped",
                "value": "20+"
            },
            {
                "label": "Stack Coverage",
                "value": "100%"
            }
        ]
    },
    "skills": [
        {
            "category": "Frontend & AI",
            "items": ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Google Gemini API"]
        },
        {
            "category": "Backend & Distributed",
            "items": ["Node.js", "Express", "Redis (Pub/Sub)", "Socket.io", "PostgreSQL", "Supabase"]
        },
        {
            "category": "DevOps & QA",
            "items": ["Docker", "GitHub Actions", "Cypress", "Playwright", "JMeter"]
        }
    ],
    "projects": [
        {
            "id": "p1",
            "title": "Blog Lounge",
            "description": "A high-scale distributed content platform featuring Cache-Aside patterns, rate limiting, and an 'Origami Notebook' aesthetic.",
            "tech": [
                "Next.js 16",
                "Express",
                "Redis",
                "PostgreSQL",
                "Playwright"
            ],
            "imageUrl": blogLogImg, // Using the imported variable
            "links": {
                "github": "https://github.com/arsalanbardsiri/bloglog",
                "live": "https://bloglog.vercel.app"
            }
        },
        {
            "id": "p2",
            "title": "ProjectIt V2",
            "description": "A distributed real-time collaboration platform using Microservices principles, WebSocket clusters, and background job queues.",
            "tech": [
                "Next.js 16",
                "Express",
                "Socket.io",
                "Redis Adapter",
                "Prisma"
            ],
            "imageUrl": projectItImg, // Using the imported variable
            "links": {
                "github": "https://github.com/arsalanbardsiri/ProjectIt",
                "live": "https://project-it-one.vercel.app"
            }
        },
        {
            "id": "p3",
            "title": "Catlender",
            "description": "An AI-Augmented productivity tool featuring a 'Cat Concierge' agent (Google Gemini) for smart scheduling and daily briefings.",
            "tech": [
                "Next.js 16",
                "Supabase",
                "Google GenAI",
                "Tailwind",
                "Shadcn UI"
            ],
            "imageUrl": catlenderImg, // Using the imported variable
            "links": {
                "github": "https://github.com/arsalanbardsiri/Catlender",
                "live": "https://catlender.vercel.app"
            }
        }
    ],
    "experience": [
        {
            "title": "QA Lead & Automation Engineer",
            "company": "Ecotrak Facility Management",
            "period": "Oct 2023 - Dec 2024",
            "summary": "Bridged the gap between Quality Assurance and Software Engineering.",
            "achievements": [
                "Engineered automation frameworks using Cypress & JMeter",
                "Implemented CI/CD pipelines via GitHub Actions",
                "Collaborated with dev teams to ship enterprise features"
            ]
        },
        {
            "title": "Full Stack Developer",
            "company": "Freelance",
            "period": "2022 - Present",
            "summary": "Delivering high-quality web solutions for diverse clients.",
            "achievements": [
                "Developing scalable Next.js applications",
                "Optimizing frontend performance and SEO",
                "Integrating secure payment gateways (Stripe)"
            ]
        }
    ],
    "contact": {
        "email": "arsalanbardsiri@gmail.com",
        "github": "https://github.com/arsalanbardsiri",
        "linkedin": "https://www.linkedin.com/in/arsalan-bardsiri/",
        "devto": "https://dev.to/arsalanbardsiri"
    }
};