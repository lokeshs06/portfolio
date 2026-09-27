// All portfolio content lives here, so you can update it without touching components.

export const profile = {
  name: 'Lokesh M',
  role: 'Full Stack Developer',
  tagline:
    'I build full stack web apps with React, Node.js and MongoDB, and I like wiring machine learning into products people actually use.',
  location: 'Vridhachalam, Tamil Nadu',
  education: "B.Tech AI & Data Science, Saveetha Engineering College '27",
  email: 'lokesh.s0926@gmail.com',
  phone: '+91 88257 71200',
  github: 'https://github.com/lokeshs06',
  linkedin: 'https://www.linkedin.com/in/lokesh-m-966379290/',
  resume: 'Lokesh_M_Resume.pdf',
  openTo: 'Open to full stack and backend internships and entry-level roles',
}

export const stats = [
  { value: '125+', label: 'REST API endpoints across my two main projects' },
  { value: '98.28%', label: 'test accuracy of the crop disease model in Manthulir' },
  { key: 'projectCount', label: 'projects on GitHub, from vanilla JS to microservices' },
  { value: '8.0', label: 'CGPA in B.Tech Artificial Intelligence & Data Science' },
]

// Responses shown in the hero API console.
export const endpoints = [
  {
    id: 'me',
    method: 'GET',
    path: '/api/me',
    status: '200 OK',
    ms: 38,
    body: {
      name: 'Lokesh M',
      role: 'Full Stack Developer (MERN)',
      location: 'Tamil Nadu, India',
      education: { degree: 'B.Tech AI & Data Science', cgpa: '8.0', graduating: 2027 },
      openToWork: true,
    },
  },
  {
    id: 'projects',
    method: 'GET',
    path: '/api/projects?featured=true',
    status: '200 OK',
    ms: 51,
    body: [
      { name: 'Manthulir', endpoints: '70+', model: 'MobileNetV3', accuracy: '98.28%' },
      { name: 'OFDS', endpoints: 57, payments: 'Stripe', portals: 3 },
    ],
  },
  {
    id: 'stack',
    method: 'GET',
    path: '/api/stack',
    status: '200 OK',
    ms: 27,
    body: {
      frontend: ['React', 'Vite', 'Tailwind CSS'],
      backend: ['Node.js', 'Express', 'FastAPI'],
      data: ['MongoDB', 'MySQL'],
      ml: ['PyTorch', 'scikit-learn'],
      languages: ['Java', 'JavaScript', 'Python'],
    },
  },
  {
    id: 'hire',
    method: 'POST',
    path: '/api/hire',
    status: '201 Created',
    ms: 64,
    body: {
      message: "Thanks! Let's talk.",
      email: 'lokesh.s0926@gmail.com',
      next: 'Scroll down to Contact',
    },
  },
]

// Projects shown on the site.
// When the API is connected (VITE_API_URL), these come from MongoDB and you edit them at /admin.
// This list is the fallback if the API is unreachable, and the seed data for `npm run seed` in /server.
export const projects = [
  {
    name: 'Manthulir',
    subtitle: 'Organic farming transition platform',
    category: 'Full Stack',
    period: 'Sep 2026',
    featured: true,
    visual: 'architecture',
    description:
      'A platform that helps small and marginal farmers in Tamil Nadu move from chemical to organic farming without losing income. Farmers get scheme matching, a transition timeline, crop disease detection and a marketplace for verified organic produce.',
    repoUrl: 'https://github.com/lokeshs06/manthulir',
    liveUrl: '',
    metrics: [
      { value: '98.28%', label: 'test accuracy' },
      { value: '70+', label: 'API endpoints' },
      { value: '90+', label: 'automated tests' },
      { value: '3', label: 'role-based portals' },
    ],
    highlights: [
      'Trained a MobileNetV3-Large model in PyTorch on 8 tomato leaf disease classes (97.72% macro-F1) and served it from a FastAPI microservice.',
      'Designed 70+ REST endpoints over 12 MongoDB models with JWT access and refresh tokens, Zod validation, rate limiting and Swagger docs.',
      'Built a WhatsApp chatbot for scheme matching and pest detection, plus a bilingual Tamil / English PWA for low-bandwidth areas.',
      'Containerized with Docker Compose and deployed 3 services on Render and Netlify.',
    ],
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'FastAPI', 'PyTorch', 'Docker', 'WhatsApp Cloud API'],
  },
  {
    name: 'Online Food Delivery System',
    subtitle: 'OFDS · MERN food ordering',
    category: 'Full Stack',
    period: 'Jun – Jul 2026',
    featured: true,
    visual: 'order-tracker',
    description:
      'A full-stack MERN food ordering app with separate portals for customers, restaurant owners and admins. It covers the whole order lifecycle, from browsing menus and applying coupons to paying and tracking the order to the door.',
    repoUrl: 'https://github.com/lokeshs06/Online-Food-delivery-System',
    liveUrl: '',
    metrics: [
      { value: '57', label: 'API endpoints' },
      { value: '18', label: 'pages' },
      { value: '9', label: 'MongoDB models' },
      { value: '3', label: 'payment options' },
    ],
    highlights: [
      'Implemented JWT authentication and role-based access control for customers, restaurant owners and admins.',
      'Built restaurant, menu, cart, coupon, offer, review and order management modules on a REST API.',
      'Integrated Stripe card payments alongside cash-on-delivery and wallet payments.',
      'Wrote end-to-end tests with Playwright and Selenium; frontend on Netlify, backend on Render.',
    ],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB Atlas', 'Stripe', 'Playwright', 'Selenium'],
  },
  {
    name: 'Kanban Board',
    category: 'React',
    description: 'Drag-and-drop task board with To Do, In Progress and Done columns, a detail modal with inline editing, and tasks saved in localStorage.',
    stack: ['React 19', 'dnd-kit', 'Context API', 'Tailwind'],
    repoUrl: 'https://github.com/lokeshs06/kanban-board',
  },
  {
    name: 'CineSearch',
    category: 'React',
    description: 'Movie search on the OMDB API with type filters, pagination, a detail page with ratings and cast, and a saved favorites list.',
    stack: ['React 19', 'React Router 7', 'Tailwind 4', 'OMDB API'],
    repoUrl: 'https://github.com/lokeshs06/movie_searching_app',
  },
  {
    name: 'Recipe Finder',
    category: 'React',
    description: 'Browse TheMealDB recipes, search and filter by category or ingredient, watch the cooking video, and keep favorites.',
    stack: ['React 19', 'React Router', 'Axios', 'Tailwind'],
    repoUrl: 'https://github.com/lokeshs06/recipe-app',
  },
  {
    name: 'Store with Cart',
    category: 'React',
    description: 'Two-page shop on the Fake Store API with a global cart in Context, quantity controls, an automatic 10% discount and persisted cart.',
    stack: ['React', 'React Router 7', 'Context API', 'Tailwind'],
    repoUrl: 'https://github.com/lokeshs06/react_router_app',
  },
  {
    name: 'Cart Modal Shop',
    category: 'React',
    description: 'Product grid with a modal cart, live subtotal, item removal and an alert that stops the same product being added twice.',
    stack: ['React', 'Vite', 'Tailwind', 'Fake Store API'],
    repoUrl: 'https://github.com/lokeshs06/fakestore-api-cart',
  },
  {
    name: 'Authentication API',
    category: 'Node API',
    description: 'Register, login and protected profile routes with bcrypt password hashing, 1-day JWTs and centralized error handling, in MVC.',
    stack: ['Node.js', 'Express 5', 'MongoDB', 'JWT', 'bcryptjs'],
    repoUrl: 'https://github.com/lokeshs06/user_mvc',
  },
  {
    name: 'Recipes CRUD API',
    category: 'Node API',
    description: 'Backend-only REST API with full CRUD for recipes, MVC structure, a health check and a ready-to-run Postman collection.',
    stack: ['Node.js', 'Express 5', 'Mongoose', 'MongoDB Atlas'],
    repoUrl: 'https://github.com/lokeshs06/recipe-mvc',
  },
  {
    name: 'Memory Game',
    category: 'JavaScript',
    description: 'Find all 8 pairs in the fewest moves. 3D card flips, a move counter, sound effects and a glassy dark UI with no framework.',
    stack: ['HTML', 'CSS', 'Vanilla JS'],
    repoUrl: 'https://github.com/lokeshs06/memory_game_js',
  },
]

export const skills = [
  { group: 'Languages', items: ['Java', 'JavaScript', 'Python', 'SQL'] },
  { group: 'Frontend', items: ['React', 'Vite', 'Tailwind CSS', 'React Router', 'React Query', 'HTML5', 'CSS3'] },
  { group: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'FastAPI', 'JWT Auth', 'Swagger'] },
  { group: 'Data & ML', items: ['MongoDB', 'Mongoose', 'MySQL', 'PyTorch', 'scikit-learn', 'Gemini API'] },
  { group: 'Tools & Cloud', items: ['Git', 'GitHub', 'Docker', 'Postman', 'Render', 'Netlify', 'Stripe'] },
  { group: 'Testing', items: ['Jest', 'Supertest', 'Pytest', 'Playwright', 'Selenium'] },
]

export const journey = [
  {
    date: 'Sep 2023',
    title: 'Started B.Tech in AI & Data Science',
    place: 'Saveetha Engineering College',
    detail: 'Current CGPA 8.0. Class XII 85%, Class X 80%.',
  },
  {
    date: 'Jan 2025',
    title: 'Cybersecurity In-Plant Training',
    place: 'Retech Solutions Pvt. Ltd.',
    detail: 'Vulnerability assessment and secure coding. Built a password strength checker based on industry rules.',
  },
  {
    date: 'Jun 2026',
    title: 'Shipped OFDS',
    place: 'Personal project',
    detail: 'First full MERN product with payments, three portals and end-to-end tests.',
  },
  {
    date: 'Sep 2026',
    title: 'Shipped Manthulir',
    place: 'Personal project',
    detail: 'Added a Python ML microservice and a WhatsApp channel to a MERN platform.',
  },
  {
    date: 'May 2027',
    title: 'Graduating',
    place: 'Saveetha Engineering College',
    detail: 'Looking for my first full-time role in full stack or backend development.',
    upcoming: true,
  },
]

export const certifications = [
  { name: 'Full Stack Development Course with AI Tools', issuer: 'IIT Madras Pravartak' },
  { name: 'Building Modern Websites using HTML and CSS', issuer: 'Udemy' },
]
