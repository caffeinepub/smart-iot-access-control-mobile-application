# Specification

## Summary
**Goal:** Add a To-Do List feature with full CRUD operations and a credential-gated Admin Dashboard to the Smart IoT Access Control application.

**Planned changes:**
- Add a `ToDo` data type to the backend with fields: id, title, description, completed, createdAt, and optional owner principal; implement `createTodo`, `getTodos`, `updateTodo`, and `deleteTodo` stored in a stable map
- Add a `/todos` frontend page displaying pending and completed todos in separate sections, with support for creating, toggling, editing, and deleting todos using React Query and toast feedback
- Add a "To-Do" navigation link in the Header pointing to `/todos`
- Add a `/admin-dashboard` route with a credential-gated login form (email: aahanvarma42@gmail.com, password: aahan123); session is preserved in sessionStorage
- Admin Dashboard content shows system-wide monitoring: device statuses, user counts, recent access events, and a To-Do stats panel (total, completed, pending counts, and recent todos list)
- Register `/admin-dashboard` route in the TanStack Router configuration
- Add a stable todos map migration to preserve all existing stable data (devices, users, events, rules) on canister upgrade

**User-visible outcome:** Users can manage a personal To-Do list at `/todos`, and admins can access a credential-protected dashboard at `/admin-dashboard` that monitors devices, users, access events, and todo statistics.
