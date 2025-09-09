# Supabase Database Setup Guide

## 🚨 UUID Type Error Fix

If you're getting this error when running the database schema:
```
ERROR: 42883: operator does not exist: text = uuid
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

This happens because Supabase's `auth.uid()` function returns a UUID type, but the original schema used TEXT for user IDs. Here are **3 solutions**:

## Solution 1: Use the Fixed Schema (Recommended)

I've created a corrected version of the schema that properly handles UUID comparisons:

**File**: `lib/database-schema.sql` (✅ Fixed)

```sql
-- This version has been updated with proper UUID casting
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = owner_id::uuid);
```

## Solution 2: Use the Step-by-Step Schema

If you prefer to run commands one at a time:

**File**: `lib/database-schema-step-by-step.sql`

This breaks down the entire schema into 14 individual steps that you can run one by one in your Supabase SQL editor. This is helpful for:
- Debugging which specific command is failing
- Understanding the schema structure
- Making modifications as needed

## Solution 3: Use the Simplified Schema

For a completely fresh start with consistent UUID types:

**File**: `lib/database-schema-simple.sql`

This version:
- Uses UUID for all primary keys (including projects.id)
- Properly references Supabase's auth.users table
- Avoids complex foreign key relationships
- Has simpler RLS policies

## 🚀 Quick Setup Instructions

### Step 1: Choose Your Schema Version

**For most users**: Use `database-schema.sql` (already fixed)

**For debugging**: Use `database-schema-step-by-step.sql`

**For fresh start**: Use `database-schema-simple.sql`

### Step 2: Run the Schema

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste your chosen schema file
4. Click **Run**

### Step 3: Verify Setup

Test that everything works by running:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'project%';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'project%';
```

## 🔧 Troubleshooting Common Issues

### Issue 1: "Extension uuid-ossp does not exist"

**Solution**: Enable the extension first
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue 2: "relation auth.users does not exist"

**Solution**: This is normal - Supabase creates this table automatically. Use the TEXT version instead:
```sql
owner_id TEXT, -- Instead of UUID REFERENCES auth.users(id)
```

### Issue 3: "permission denied for table"

**Solution**: Make sure you're running as a superuser or the table owner.

### Issue 4: RLS Policies Not Working

**Solution**: Check that RLS is enabled:
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

## 📊 Schema Comparison

| Feature | Original | Fixed | Simple |
|---------|----------|-------|--------|
| UUID Handling | ❌ Broken | ✅ Fixed | ✅ Native |
| Complexity | Medium | Medium | Low |
| Compatibility | High | High | Medium |
| RLS Policies | Complex | Fixed | Simple |
| Foreign Keys | TEXT refs | TEXT refs | UUID refs |

## 🎯 Recommended Approach

1. **First try**: `database-schema.sql` (fixed version)
2. **If issues**: `database-schema-step-by-step.sql` (run one step at a time)
3. **If still issues**: `database-schema-simple.sql` (fresh start)

## 🔍 Testing the Setup

After running any schema, test with:

```sql
-- Test project creation (replace YOUR_USER_ID)
INSERT INTO projects (title, owner_id, project_key)
VALUES ('Test Project', 'your-user-uuid-here', 'proj_test123');

-- Test code file insertion
INSERT INTO project_code_files (project_id, file_path, file_name, file_content, version_id)
VALUES (
  (SELECT id FROM projects WHERE project_key = 'proj_test123'),
  'src/App.tsx',
  'App.tsx',
  'console.log("Hello World");',
  'v_test123'
);
```

## 🚀 Next Steps

Once your database is set up:

1. **Update your API endpoints** to match the schema you chose
2. **Test the project creation flow**
3. **Verify that data persists correctly**
4. **Test user isolation** (users should only see their own projects)

## 💡 Pro Tips

- **Always backup** your database before running schema changes
- **Test in a development environment** first
- **Use the step-by-step version** if you're new to SQL
- **Check the Supabase logs** if something fails unexpectedly

## 📞 Support

If you continue having issues:

1. Check the **Supabase SQL Editor logs** for detailed error messages
2. Verify your **environment variables** are correct
3. Ensure you have **proper permissions** in your Supabase project
4. Try the **simplified schema** as a fallback

---

**🎉 Happy coding! Your project persistence system will be up and running soon!**
