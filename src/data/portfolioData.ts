import profileImg from '../assets/images/IMG_2929.jpeg';
import resumePdf from '../assets/pdf/resume.pdf';

export const portfolioData = {
    "profile": profileImg,
    "resumeUrl": resumePdf,
    "name": "Arsalan Bardsiri",
    "title": "Full-Stack Developer",
    "typewriterTexts": [
        "Hybrid Full-Stack/DevOps Developer",
        "UI/UX Enthusiast",
        "Problem Solver"
    ],
    "about": {
        "bio": "I am a passionate developer with a knack for building beautiful, functional, and scalable web applications. With expertise in the modern React stack and a keen eye for design, I transform ideas into digital reality.",
        "stats": [
            {
                "label": "Years Experience",
                "value": "3+"
            },
            {
                "label": "Projects Completed",
                "value": "15+"
            },
            {
                "label": "Happy Clients",
                "value": "10+"
            }
        ]
    },
    "skills": [
        {
            "category": "Frontend Powerhouse",
            "items": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Framer Motion"]
        },
        {
            "category": "Backend & Cloud",
            "items": ["Node.js", "PostgreSQL", "GraphQL", "AWS", "Docker"]
        },
        {
            "category": "Design & Tools",
            "items": ["Figma", "Git", "Vite", "CI/CD"]
        }
    ],
    "projects": [
        {
            "id": "p1",
            "title": "BlogLog",
            "description": "A full-stack blogging platform featuring real-time updates, rich text editing, and a modern content management system.",
            "tech": [
                "React",
                "Node.js",
                "MongoDB",
                "Socket.io"
            ],
            "imageUrl": "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=800&auto=format&fit=crop",
            "links": {
                "github": "https://github.com/arsalanbardsiri/bloglog",
                "live": "https://bloglog.vercel.app"
            }
        },
        {
            "id": "p2",
            "title": "ProjectIt",
            "description": "A comprehensive project management tool designed for agile teams, featuring task tracking, collaboration boards, and analytics.",
            "tech": [
                "React",
                "TypeScript",
                "Firebase",
                "Tailwind"
            ],
            "imageUrl": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
            "links": {
                "github": "https://github.com/arsalanbardsiri/ProjectIt",
                "live": "https://project-it-one.vercel.app"
            }
        },
        {
            "id": "p3",
            "title": "Catlender",
            "description": "A whimsical yet functional calendar application that combines productivity with daily doses of feline joy.",
            "tech": [
                "React",
                "API Integration",
                "CSS Modules"
            ],
            "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop",
            "links": {
                "github": "https://github.com/arsalanbardsiri/Catlender",
                "live": "https://catlender.vercel.app"
            }
        }
    ],
    "experience": [
        {
            "title": "Full Stack Developer",
            "company": "Freelance",
            "period": "2022 - Present",
            "summary": "Delivering high-quality web solutions for diverse clients.",
            "achievements": [
                "Developed scalable web applications",
                "Optimized frontend performance",
                "Integrated secure payment gateways"
            ]
        }
    ],
    "contact": {
        "email": "arsalan.bardsiri@example.com",
        "github": "https://github.com/arsalanbardsiri",
        "linkedin": "https://www.linkedin.com/in/arsalan-bardsiri/",
        "devto": "https://dev.to/arsalanbardsiri"
    }
};
