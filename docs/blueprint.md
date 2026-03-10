# **App Name**: SyncDoc

## Core Features:

- Secure User Authentication: Enable user signup, login, and secure access to the application using JWT. Includes bcrypt hashing for password security.
- Document Management Dashboard: Users can create, rename, delete, open, and share collaborative documents with others via email.
- Role-Based Access Control: Implement distinct roles (Owner, Editor, Viewer) with granular permissions for document access and modification, enforced by backend middleware.
- Real-Time Collaborative Editor: Live multi-user document editing with TipTap and Socket.io, featuring real-time updates, active user presence, and conflict-safe content synchronization.
- Real-Time Document Chat: Integrate an instant messaging sidebar within each document workspace, supporting message history stored in the database, Socket broadcasting, and optimistic UI updates.
- Cloud File Sharing: Enable Owners and Editors to upload images and PDF files, storing them via Cloudinary, with uploaded files appearing directly in the document's chat feed.
- AI Document Assistance: Integrate Google Gemini for AI-powered actions such as a tool to summarize documents and a tool to refine grammar and tone. Responses stream token-by-token and are displayed in a dedicated AI side panel.

## Style Guidelines:

- Primary color: A sophisticated, deep blue-purple (#451B98), representing professionalism and focus, used for key interactive elements and branding.
- Background color: A very light, subtle grey-blue (#F1F0F4), providing a clean and calm canvas conducive to prolonged collaborative work.
- Accent color: A vibrant cyan-blue (#5CC2D6), providing contrast and drawing attention to notifications, highlights, and important calls-to-action.
- Headlines: 'Space Grotesk' (proportional sans-serif) for a modern, slightly techy feel, conveying innovation for titles and key headings.
- Body Text: 'Inter' (grotesque-style sans-serif) for exceptional readability across all document content and UI elements, ensuring clarity and ease of use.
- Use clean, modern line-based icons for a consistent and professional aesthetic. Icons should clearly convey their function without cluttering the interface.
- The workspace should follow a responsive three-column layout: Left Sidebar for Document navigation, Central pane for the Collaborative Editor, and a Right Panel for Real-Time Chat and AI interactions, ensuring optimal use of screen space across devices.
- Incorporate subtle and functional animations, such as smooth transitions for panel expansions, menu interactions, and real-time updates, to enhance user feedback and a sense of responsiveness without being distracting.