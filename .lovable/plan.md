

# Add Filter and Sort Controls to Projects Page

## Overview

Add filter and sort functionality to the `/projects` page, allowing users to filter projects by status, priority, and client name, and sort by various fields like created date, project name, budget, and start/end dates.

## Current State

- Projects are fetched from `adrian_projects` table and displayed in a grid
- Default sort is by `created_at` descending (newest first)
- No filtering or sorting UI exists
- Available project fields: `status`, `priority`, `client_name`, `project_name`, `budget`, `created_at`, `start_date`, `end_date`, `project_manager`

## Database Schema Reference

The `adrian_projects` table has these relevant columns:
- `status`: text (planning, in_progress, on_hold, completed, cancelled)
- `priority`: text (low, medium, high)
- `client_name`: text
- `project_name`: text
- `budget`: numeric
- `created_at`: timestamp
- `start_date`: date
- `end_date`: date

## Implementation

### 1. Add Required Imports

```typescript
import { Filter, SortAsc, SortDesc, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
```

### 2. Add State Variables

```typescript
// Filter states
const [statusFilter, setStatusFilter] = useState<string>('all');
const [priorityFilter, setPriorityFilter] = useState<string>('all');
const [searchQuery, setSearchQuery] = useState<string>('');

// Sort states
const [sortField, setSortField] = useState<string>('created_at');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
```

### 3. Add Filtering and Sorting Logic

Create a computed variable that applies filters and sorting to the projects array:

```typescript
const filteredAndSortedProjects = useMemo(() => {
  let result = [...projects];
  
  // Apply status filter
  if (statusFilter !== 'all') {
    result = result.filter(p => p.status === statusFilter);
  }
  
  // Apply priority filter
  if (priorityFilter !== 'all') {
    result = result.filter(p => p.priority === priorityFilter);
  }
  
  // Apply search filter (searches project name, client name, project ID)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(p => 
      p.project_name?.toLowerCase().includes(query) ||
      p.client_name?.toLowerCase().includes(query) ||
      p.project_id?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    // Handle null values
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';
    
    // Handle date/string comparison
    if (sortField.includes('date') || sortField === 'created_at') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
  
  return result;
}, [projects, statusFilter, priorityFilter, searchQuery, sortField, sortDirection]);
```

### 4. Add Clear Filters Function

```typescript
const clearFilters = () => {
  setStatusFilter('all');
  setPriorityFilter('all');
  setSearchQuery('');
  setSortField('created_at');
  setSortDirection('desc');
};

const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim() !== '';
```

### 5. Add Filter/Sort UI Section

Insert this section between the header and the projects grid:

```tsx
{/* Filter and Sort Controls */}
<div className="mb-6 space-y-4">
  {/* Search Bar */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search projects by name, client, or ID..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10 pr-10"
    />
    {searchQuery && (
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
        onClick={() => setSearchQuery('')}
      >
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>

  {/* Filter and Sort Row */}
  <div className="flex flex-wrap items-center gap-3">
    {/* Status Filter */}
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="planning">Planning</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Priority Filter */}
    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Priority</SelectItem>
        <SelectItem value="high">High</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="low">Low</SelectItem>
      </SelectContent>
    </Select>

    {/* Sort Field */}
    <div className="flex items-center gap-2 ml-auto">
      <Select value={sortField} onValueChange={setSortField}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Created Date</SelectItem>
          <SelectItem value="project_name">Project Name</SelectItem>
          <SelectItem value="client_name">Client Name</SelectItem>
          <SelectItem value="start_date">Start Date</SelectItem>
          <SelectItem value="end_date">End Date</SelectItem>
          <SelectItem value="budget">Budget</SelectItem>
          <SelectItem value="status">Status</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Direction Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
        title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortDirection === 'asc' ? (
          <SortAsc className="h-4 w-4" />
        ) : (
          <SortDesc className="h-4 w-4" />
        )}
      </Button>
    </div>

    {/* Clear Filters Button */}
    {hasActiveFilters && (
      <Button variant="ghost" size="sm" onClick={clearFilters}>
        <X className="h-4 w-4 mr-1" />
        Clear Filters
      </Button>
    )}
  </div>

  {/* Results Count */}
  <div className="text-sm text-muted-foreground">
    Showing {filteredAndSortedProjects.length} of {projects.length} projects
  </div>
</div>
```

### 6. Update Projects Grid

Change the grid to use `filteredAndSortedProjects` instead of `projects`:

```tsx
// Before
{projects.map((project) => (

// After
{filteredAndSortedProjects.map((project) => (
```

Also update the empty state check:

```tsx
// Before
{projects.length === 0 ? (

// After  
{projects.length === 0 ? (
  // Show "No Projects Yet" - original empty state
) : filteredAndSortedProjects.length === 0 ? (
  // Show "No matching projects" - filtered empty state
  <Card className="glass">
    <CardContent className="text-center py-12">
      <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Matching Projects</h3>
      <p className="text-muted-foreground mb-6">
        No projects match your current filters. Try adjusting your search or filters.
      </p>
      <Button variant="outline" onClick={clearFilters}>
        Clear Filters
      </Button>
    </CardContent>
  </Card>
) : (
  // Show projects grid
)}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ProjectsPage.tsx` | Add imports, state, filtering/sorting logic, and UI controls |

## Visual Layout

```text
+------------------------------------------------------------------+
|  [Back to Dashboard]                                              |
|                                                                   |
|  Projects                                    [+ New Project]      |
|  Manage and track your ongoing projects                           |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | [🔍] Search projects by name, client, or ID...          [X] | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  [Filter] [Status ▼] [Priority ▼]    [Sort by ▼] [↑↓] [Clear]    |
|                                                                   |
|  Showing 5 of 12 projects                                         |
|                                                                   |
|  +----------------+  +----------------+  +----------------+       |
|  | Project Card 1 |  | Project Card 2 |  | Project Card 3 |       |
|  +----------------+  +----------------+  +----------------+       |
+------------------------------------------------------------------+
```

## Filter Options Summary

| Filter | Options |
|--------|---------|
| Status | All, Planning, In Progress, On Hold, Completed, Cancelled |
| Priority | All, High, Medium, Low |
| Search | Free text (searches name, client, ID, description) |

## Sort Options Summary

| Sort Field | Type |
|------------|------|
| Created Date | Date (default) |
| Project Name | Alphabetical |
| Client Name | Alphabetical |
| Start Date | Date |
| End Date | Date |
| Budget | Numeric |
| Status | Alphabetical |
| Priority | Alphabetical |

## Technical Notes

- Filtering is done client-side using `useMemo` for performance
- All filters can be combined (AND logic)
- Sort direction toggles between ascending and descending
- "Clear Filters" button only appears when filters are active
- Results count shows filtered vs total projects
- Search is case-insensitive

