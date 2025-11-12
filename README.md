# TriageShift

An AI-powered patient intake and routing system for healthcare practices. TriageShift streamlines the process of handling patient symptom inquiries by leveraging AI to determine urgency levels and appropriate medical specialties, then automatically assigns cases to suitable doctors and sends real-time notifications.

## 🎯 Overview

TriageShift modernizes healthcare triage by automating the patient intake workflow. When patients submit symptom inquiries, the system uses Google Gemini AI to analyze the information, assess urgency, identify required medical specialties, and intelligently route cases to available doctors. The platform handles all notifications through an event-driven architecture, ensuring timely communication with both patients and healthcare providers.

## ✨ Key Features

- **AI-Powered Triage**: Analyzes patient symptoms using Google Gemini API to determine urgency and required medical specialty
- **Intelligent Case Routing**: Automatically assigns inquiries to doctors based on their specialties and availability
- **Event-Driven Architecture**: Processes background jobs reliably using Inngest for notifications and workflows
- **Multi-Role Support**: Role-based access control for patients, doctors, moderators, and administrators
- **Email Notifications**: Automated email notifications for case assignments, updates, and onboarding
- **Comprehensive Patient Records**: Tracks chief complaints, symptoms, urgency levels, clinical notes, and more
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt
- **Background Jobs**: Inngest for event-driven workflows
- **AI Integration**: Google Gemini API
- **Email Service**: NodeMailer (with Mailtrap for development)
- **Future**: Twilio for SMS notifications (post-MVP)

### Frontend (Planned)
- **Framework**: React with Vite
- **Routing**: React Router DOM
- **Styling**: TailwindCSS + DaisyUI
- **HTTP Client**: Fetch API

### Infrastructure
- **Backend Hosting**: Railway or Render
- **Frontend Hosting**: Vercel or Netlify
- **Database**: MongoDB Atlas
- **Event Processing**: Inngest Cloud

## 🏗️ Architecture Overview

TriageShift uses an **event-driven architecture** powered by Inngest to handle asynchronous workflows:


```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │ Submits Inquiry
       ▼
┌─────────────────────┐
│  Express API Server │
└──────┬──────────────┘
       │ Triggers Event
       ▼
┌─────────────────────┐      ┌──────────────────┐
│   Inngest Worker    │◄─────┤  Inngest Cloud   │
└──────┬──────────────┘      └──────────────────┘
       │
       ├─► AI Analysis (Gemini API)
       │   • Assess urgency
       │   • Identify specialty
       │
       ├─► Doctor Assignment
       │   • Query available doctors
       │   • Match by specialty
       │
       └─► Notifications
           • Email to doctor
           • Email to patient
           • (Future: SMS via Twilio)
```

### Event Flow Examples:
1. **User Signup**: `user/signup` → Welcome email sent via Inngest
2. **Inquiry Submission**: `inquiry/created` → AI triage → Doctor assignment → Notifications
3. **Case Update**: `inquiry/updated` → Notify relevant parties

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas account)
- npm or yarn package manager
- Inngest account (free tier available)
- Google Gemini API key
- Mailtrap account (for development emails)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dev-muse/TriageShift.git
   cd TriageShift
   ```

2. **Install backend dependencies**
   ```bash
   cd ai-inquiry-assistant
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `ai-inquiry-assistant` directory:
   ```bash
   cp .env.sample .env
   ```
   
   Edit `.env` with your credentials (see Environment Variables section below)

4. **Start MongoDB**
   
   Make sure MongoDB is running locally, or use MongoDB Atlas connection string

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Server will start at `http://localhost:3000`

6. **Set up Inngest (optional for local development)**
   
   Install Inngest CLI:
   ```bash
   npx inngest-cli@latest dev
   ```
   
   This starts the Inngest Dev Server for local testing of background jobs

## 🔐 Environment Variable Configuration

Create a `.env` file in the `ai-inquiry-assistant` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/triageshift
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/triageshift

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Mailtrap for development)
MAILTRAP_SMTP_HOST=smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=your-mailtrap-username
MAILTRAP_SMTP_PASS=your-mailtrap-password

# Google Gemini AI
GEMINI_API_KEY=your-google-gemini-api-key

# Application URL
APP_URL=http://localhost:3000

# Inngest Configuration (automatically configured in Inngest Cloud)
# INNGEST_SIGNING_KEY=your-inngest-signing-key
# INNGEST_EVENT_KEY=your-inngest-event-key
```

### Getting API Keys:
- **MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com)
- **Gemini API**: [ai.google.dev](https://ai.google.dev)
- **Mailtrap**: [mailtrap.io](https://mailtrap.io)
- **Inngest**: [inngest.com](https://inngest.com)

## 📡 API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - Register new user (patient or doctor)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Inquiries (Patient Intake)
- `POST /api/inquiries` - Submit new symptom inquiry
- `GET /api/inquiries` - List inquiries (filtered by role)
- `GET /api/inquiries/:id` - Get specific inquiry details
- `PATCH /api/inquiries/:id` - Update inquiry (add clinical notes, change status)
- `DELETE /api/inquiries/:id` - Delete inquiry (admin only)

### Users (Doctors & Staff)
- `GET /api/users/doctors` - List available doctors by specialty
- `PATCH /api/users/:id` - Update user profile
- `GET /api/users/:id/inquiries` - Get assigned inquiries for a doctor

### Inngest Events (Background Jobs)
- `POST /api/inngest` - Inngest webhook endpoint for event processing

## 🗂️ Project Structure

```
TriageShift/
├── ai-inquiry-assistant/          # Backend application
│   ├── controllers/               # Route controllers
│   │   └── user.js               # User authentication & management
│   ├── models/                   # Mongoose models
│   │   ├── user.models.js        # User schema (patients, doctors, admin)
│   │   └── inquiry.models.js     # Inquiry schema (patient cases)
│   ├── inngest/                  # Inngest event functions
│   │   ├── client.js             # Inngest client configuration
│   │   └── functions/            # Event handlers
│   │       └── on-signup.js      # Welcome email on user signup
│   ├── utils/                    # Utility functions
│   │   └── mailer.js             # Email sending utility
│   ├── routes/                   # API routes (to be added)
│   ├── middleware/               # Custom middleware (to be added)
│   ├── index.js                  # Application entry point
│   ├── package.json              # Dependencies
│   └── .env.sample               # Environment variables template
│
└── frontend/                     # React frontend (to be added)
```

## 🧪 Development Workflow

1. **Start MongoDB** (if running locally)
2. **Start Inngest Dev Server** (optional for local testing):
   ```bash
   npx inngest-cli@latest dev
   ```
3. **Start Backend**:
   ```bash
   cd ai-inquiry-assistant
   npm run dev
   ```
4. Backend runs on `http://localhost:3000`
5. Inngest Dev UI available at `http://localhost:8288`

## 🗺️ Future Roadmap

### Phase 1: Core Features (Current)
- ✅ User authentication and authorization
- ✅ Basic inquiry submission
- ✅ Event-driven welcome emails
- 🔄 AI-powered triage analysis
- 🔄 Doctor assignment algorithm
- 🔄 Frontend development

### Phase 2: Enhanced Notifications
- 📋 SMS notifications via Twilio
- 📋 Real-time updates with WebSockets
- 📋 Mobile push notifications
- 📋 In-app notification center

### Phase 3: Compliance & Security
- 📋 HIPAA compliance measures
- 📋 End-to-end encryption for patient data
- 📋 Audit logs for all actions
- 📋 Two-factor authentication (2FA)
- 📋 Role-based access control (RBAC) enhancements

### Phase 4: Advanced Features
- 📋 Billing and insurance processing
- 📋 Appointment scheduling integration
- 📋 Telemedicine video consultations
- 📋 Patient medical history tracking
- 📋 Analytics dashboard for administrators
- 📋 Multi-language support

### Phase 5: Scale & Performance
- 📋 Caching layer (Redis)
- 📋 Load balancing
- 📋 Microservices architecture
- 📋 Advanced AI models for better triage accuracy

## 👥 Contributing

This project is currently in early development. Contribution guidelines will be added soon.

## 📄 License

ISC

## 👤 Author

**Rahman Muse** (Dev-muse)

---

**Note**: This is an MVP in active development. HIPAA compliance and production-ready security features will be implemented before handling real patient data.

## 🔗 Links

- [Inngest Documentation](https://www.inngest.com/docs)
- [Google Gemini AI](https://ai.google.dev)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Express.js Documentation](https://expressjs.com/)
```

This README provides a comprehensive overview of your TriageShift project with all the sections you requested. It's structured for developers, includes clear setup instructions, documents your tech stack and architecture, and outlines the future roadmap. You can save this as `README.md` in the root of your repository.

Would you like me to make any adjustments to the content, or would you like me to generate any additional documentation files (e.g., CONTRIBUTING.md, API.md, or ARCHITECTURE.md)?
