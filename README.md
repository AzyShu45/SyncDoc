# SyncDoc – AI Powered Collaborative Workspace

SyncDoc is a high-performance, real-time collaborative platform designed for teams to create, share, and edit documents with integrated AI assistance and secure access control.

## Real-Time Concurrency Approach

SyncDoc implements a robust real-time synchronization engine to support multiple users editing the same document simultaneously without data loss.

### WebSocket-Driven Synchronization
The system utilizes a WebSocket-based architecture (implemented via Firestore Real-time SDK) to maintain a persistent bi-directional connection between clients and the server.
- **Document Rooms**: When a user opens a document, they join a virtual "room" by subscribing to the document's specific path.
- **Instant Broadcasting**: Any change made by User A is instantly broadcast to all other users in the same room. The TipTap editor listens for these broadcasts and updates the local state optimistically.

### Conflict Prevention & Consistency
To maintain document integrity, SyncDoc employs a **Sequential Update Strategy**:
- **Atomic Operations**: Every edit is sent to the server as an atomic update.
- **Version Control**: The backend uses server-side timestamps to sequence updates. Late updates that arrive after a newer version has been established are merged or rejected based on the document's state.
- **Race Condition Handling**: By offloading the merge logic to the central database coordinator, the system ensures that all connected clients eventually converge on the exact same document state, preventing race conditions.

## RBAC Database Schema

The application enforces a strict **Role-Based Access Control (RBAC)** system to protect document data and ensure collaboration remains secure.

### Database Structure
- **Users**: Stores registered user profiles, including unique IDs, emails, and display names.
- **Documents**: Stores the primary document content (HTML/JSON), metadata (titles, timestamps), and an embedded **Permissions Map**.
- **DocumentPermissions (Members Map)**: For performance and reliability, document-level permissions are stored as a map of `userId: role` within each document. This allows the security layer to verify access in a single operation without additional joins.

### Roles & Permissions
SyncDoc defines three distinct roles:
1. **Owner**: Full control over the document. Can edit, delete, manage sharing permissions, send chat messages, and upload files.
2. **Editor**: Collaborative access. Can edit document text, send chat messages, and upload files.
3. **Viewer**: Read-only access. Can view the document and read chat history but cannot edit or send messages.

### Security Enforcement
The backend enforces these roles through a **Security Rules Layer**. Every request is intercepted and validated:
- Before any write operation (update, delete, or creating a sub-collection record like a chat message), the system checks the `members` map for the requesting `userId`.
- If a user with the **Viewer** role attempts to edit a document or send a message, the backend rejects the request and returns a **403 Forbidden** (Permission Denied) error, which is then handled gracefully by the UI to prevent unauthorized interaction.
