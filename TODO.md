# TODO

- [ ] Add admin API routes:
  - [ ] app/api/admin/users/route.ts (GET users)
  - [ ] app/api/admin/tasks/route.ts (GET all tasks, POST create task for user)
  - [ ] app/api/admin/tasks/[id]/route.ts (DELETE task by id across all users)
- [ ] Extend dummy-store with admin helpers:
  - [ ] getAllUsers
  - [ ] getAllTasks (flatten)
  - [ ] deleteTaskById
- [ ] Add Admin dashboard UI:
  - [ ] app/admin-dashboard/page.tsx wrapper
  - [ ] app/admin-dashboard/AdminDashboardClient.tsx client component
  - [ ] Fetch users + tasks
  - [ ] Admin can create task for selected user
  - [ ] Admin can delete tasks (no edit)
- [ ] Route admins to AdminDashboard after login:
  - [ ] Update app/login/page.tsx to push /admin-dashboard if role === 'admin'
- [ ] Ensure admin guard in AdminDashboardClient (redirect if not admin)
- [ ] Run build/lint/dev server to verify pages and API routes work

