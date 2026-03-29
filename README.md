# Schedora — Full Stack Scheduling Platform

Schedora is a full-stack scheduling application that enables users to create event types, manage availability, and share booking links for seamless meeting scheduling.

---

## Overview

The platform provides a modern scheduling experience with a structured dashboard and public booking pages. It is designed with scalability and modular architecture in mind, making it suitable for real-world SaaS applications.

---

## Features

- User authentication and protected routes  
- Event type creation and management  
- Availability configuration and time slot generation  
- Public booking pages using dynamic routes  
- Booking confirmation workflow  
- Analytics dashboard  
- Contact management  
- Integration-ready architecture  
- Workflow automation structure  

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React with TypeScript
- Tailwind CSS
- React Query

### Backend
- Node.js
- Express.js
- TypeScript

### Database
- PostgreSQL with Prisma ORM

---

## Project Structure
schedulr/
├── backend/
│ ├── prisma/
│ ├── src/
│ └── package.json
└── frontend/
├── app/
├── components/
└── package.json

---

## Application Flow

- User registers or logs in  
- Creates event types  
- Defines availability  
- Shares booking link  
- Invitee selects time slot  
- Booking is created and confirmed  

---

## Assumptions

- Each user has a unique username for public URLs  
- Time slots are generated server-side  
- Basic timezone handling is implemented  
- Authentication is JWT-based  
- Integrations are partially implemented  

---

## Deployment

### Frontend
Vercel  

### Backend
Render or Railway  

### Database
Supabase or Neon  

---

## Future Improvements

- Advanced timezone handling  
- Email notifications  
- Calendar integrations (Google, Outlook)  
- Payment support  
- Mobile optimization  

---

## License

MIT License
