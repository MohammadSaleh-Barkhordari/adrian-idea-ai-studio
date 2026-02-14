import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, ChevronLeft, ChevronRight, Home, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  task_name: string;
  description?: string;
  assigned_to?: string;
  created_by?: string;
  due_date?: string;
  start_time?: string;
  priority: string;
  status: string;
  project_id: string;
  related_task_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface GanttChartProps {
  tasks: Task[];
}

interface GanttData {
  id: string;
  task: string;
  startDays: number;
  duration: number;
  status: string;
  priority: string;
  assigned_to?: string;
  start_date: string;
  end_date: string;
  actualStartDate: Date;
  actualEndDate: Date;
}

type ViewMode = 'week' | 'month' | 'quarter';

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentWindowStart, setCurrentWindowStart] = useState<Date>(() => {
    if (tasks.length === 0) return new Date();
    return new Date(Math.min(...tasks.map(t => new Date(t.start_time || t.created_at).getTime())));
  });
  const processTasksForGantt = (tasks: Task[]): GanttData[] => {
    if (tasks.length === 0) return [];

    const projectStart = new Date(Math.min(...tasks.map(t => new Date(t.start_time || t.created_at).getTime())));
    
    return tasks.map((task) => {
      const startDate = new Date(task.start_time || task.created_at);
      const endDate = task.due_date ? new Date(task.due_date) : new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const startDays = Math.floor((startDate.getTime() - projectStart.getTime()) / (24 * 60 * 60 * 1000));
      const endDays = Math.floor((endDate.getTime() - projectStart.getTime()) / (24 * 60 * 60 * 1000));
      const duration = Math.max(1, endDays - startDays);

      return {
        id: task.id,
        task: (task.task_name || '').length > 30 ? (task.task_name || '').substring(0, 30) + '...' : (task.task_name || ''),
        startDays,
        duration,
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to,
        start_date: startDate.toLocaleDateString(),
        end_date: endDate.toLocaleDateString(),
        actualStartDate: startDate,
        actualEndDate: endDate
      };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'hsl(142 76% 36%)';
      case 'in_progress': return 'hsl(var(--primary))'; 
      case 'todo':
      case 'pending': return 'hsl(var(--gold))';
      case 'cancelled': return 'hsl(0 84% 60%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const getPriorityStroke = (priority: string) => {
    const normalizedPriority = priority?.toLowerCase();
    switch (normalizedPriority) {
      case 'urgent': return { color: 'hsl(0 84% 60%)', width: 3 };
      case 'high': return { color: 'hsl(var(--gold-dark))', width: 2.5 };
      case 'medium': return { color: 'hsl(var(--accent))', width: 2 };
      case 'low': return { color: 'hsl(var(--muted-foreground))', width: 1.5 };
      default: return { color: 'hsl(var(--muted-foreground))', width: 1.5 };
    }
  };

  // Navigation functions
  const getWindowDuration = (mode: ViewMode) => {
    switch (mode) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
    }
  };

  const navigateWindow = (direction: 'prev' | 'next') => {
    const duration = getWindowDuration(viewMode);
    const offset = direction === 'next' ? duration : -duration;
    setCurrentWindowStart(prev => new Date(prev.getTime() + offset * 24 * 60 * 60 * 1000));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWindowStart(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)); // Start a week before today
  };

  // Calculate window end based on current start and view mode
  const currentWindowEnd = useMemo(() => {
    const duration = getWindowDuration(viewMode);
    return new Date(currentWindowStart.getTime() + duration * 24 * 60 * 60 * 1000);
  }, [currentWindowStart, viewMode]);

  // Filter and process tasks for current window
  const windowFilteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskStart = new Date(task.start_time || task.created_at);
      const taskEnd = task.due_date ? new Date(task.due_date) : new Date(taskStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Show task if it overlaps with current window
      return taskEnd >= currentWindowStart && taskStart <= currentWindowEnd;
    });
  }, [tasks, currentWindowStart, currentWindowEnd]);

  const ganttData = processTasksForGantt(windowFilteredTasks);
  
  // Use window dates instead of task dates for consistent scaling
  const projectStart = currentWindowStart;
  const windowDays = getWindowDuration(viewMode);
  
  if (ganttData.length === 0) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Project Timeline</CardTitle>
                <p className="text-sm text-muted-foreground font-body">
                  {currentWindowStart.toLocaleDateString()} - {currentWindowEnd.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-32 glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                  <SelectItem value="quarter">Quarter View</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center bg-muted/30 rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={() => navigateWindow('prev')} className="h-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToToday} className="h-8 px-3">
                  <Home className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateWindow('next')} className="h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-12 text-center">
            <div className="space-y-3">
              <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-body">No tasks to display in this time window</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting the time period or adding new tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Recalculate gantt data relative to window start
  const windowGanttData = ganttData.map(task => ({
    ...task,
    startDays: Math.floor((task.actualStartDate.getTime() - projectStart.getTime()) / (24 * 60 * 60 * 1000)),
  }));
  
  const today = Math.floor((new Date().getTime() - projectStart.getTime()) / (24 * 60 * 60 * 1000));
  const chartMaxDays = windowDays;

  // Chart dimensions - truly responsive to content
  const taskSpacing = 40;
  const taskHeight = 28;
  const topMargin = 50;
  const bottomMargin = 60;
  const chartHeight = Math.max(200, ganttData.length * taskSpacing + 80);
  const leftMargin = 220;
  
  // Scale for converting days to pixels - use dynamic width
  const chartViewWidth = 800; // Base width for calculations
  const dayWidth = (chartViewWidth - leftMargin - 50) / (chartMaxDays + 2);

  const formatDate = (days: number) => {
    const date = new Date(projectStart.getTime() + days * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Generate x-axis ticks
  const xTicks = [];
  for (let i = 0; i <= chartMaxDays + 2; i += Math.ceil((chartMaxDays + 2) / 8)) {
    xTicks.push(i);
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-6">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          {/* Main Title Section */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-accent rounded-xl shadow-glow-accent">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="font-display text-2xl text-foreground">
                Project Timeline
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-muted-foreground font-body">
                  {currentWindowStart.toLocaleDateString()} - {currentWindowEnd.toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {tasks.length} total
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {windowFilteredTasks.length} in view
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            {/* Status Legend */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="font-body text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                <span className="font-body text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                <div className="w-2.5 h-2.5 bg-gold rounded-full"></div>
                <span className="font-body text-muted-foreground">To Do</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <span className="font-body text-muted-foreground">Cancelled</span>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-3">
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-36 glass-input font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                  <SelectItem value="quarter">Quarter View</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center bg-muted/30 rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={() => navigateWindow('prev')} className="h-9 hover-lift">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToToday} className="h-9 px-4 hover-lift">
                  <Home className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigateWindow('next')} className="h-9 hover-lift">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full overflow-x-auto bg-card/50 rounded-xl border border-border/30 p-2">
          <svg 
            viewBox={`0 0 ${chartViewWidth} ${chartHeight + topMargin + bottomMargin}`}
            className="w-full h-auto bg-gradient-subtle rounded-lg min-h-[400px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Enhanced Grid lines */}
            <defs>
              <pattern id="grid" width={dayWidth} height={taskSpacing} patternUnits="userSpaceOnUse">
                <path d={`M ${dayWidth} 0 L 0 0 0 ${taskSpacing}`} fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="3,2"/>
              </pattern>
              <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.8)" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
              <filter id="taskShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="hsl(var(--shadow-soft))" />
              </filter>
            </defs>
            <rect width={chartViewWidth} height={chartHeight + topMargin} fill="url(#grid)" />
            
            {/* Alternating row backgrounds */}
            {windowGanttData.map((task, index) => (
              index % 2 === 0 ? (
                <rect
                  key={`row-bg-${task.id}`}
                  x={0}
                  y={topMargin + index * taskSpacing}
                  width={chartViewWidth}
                  height={taskSpacing}
                  fill="hsl(var(--muted) / 0.3)"
                  rx="4"
                />
              ) : null
            ))}
            
            {/* Y-axis (task names) with enhanced styling */}
            {windowGanttData.map((task, index) => (
              <g key={`task-label-${task.id}`}>
                <text
                  x={leftMargin - 15}
                  y={topMargin + index * taskSpacing + taskHeight / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-foreground text-sm font-body font-medium"
                  filter="url(#taskShadow)"
                >
                  {task.task}
                </text>
                {/* Priority indicator */}
                <circle
                  cx={leftMargin - 5}
                  cy={topMargin + index * taskSpacing + taskHeight / 2}
                  r={getPriorityStroke(task.priority).width}
                  fill={getPriorityStroke(task.priority).color}
                />
              </g>
            ))}
            
            {/* X-axis (dates) with enhanced styling */}
            {xTicks.map((tick) => (
              <g key={`x-tick-${tick}`}>
                <line
                  x1={leftMargin + tick * dayWidth}
                  y1={topMargin}
                  x2={leftMargin + tick * dayWidth}
                  y2={topMargin + windowGanttData.length * taskSpacing}
                  stroke="hsl(var(--border))"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                <text
                  x={leftMargin + tick * dayWidth}
                  y={topMargin + windowGanttData.length * taskSpacing + 25}
                  textAnchor="middle"
                  className="fill-muted-foreground text-xs font-body font-medium"
                >
                  {formatDate(tick)}
                </text>
              </g>
            ))}
            
            {/* Enhanced Task bars */}
            {windowGanttData.map((task, index) => {
              const barX = leftMargin + task.startDays * dayWidth;
              const barY = topMargin + index * taskSpacing + (taskSpacing - taskHeight) / 2;
              const barWidth = Math.max(task.duration * dayWidth, 8); // Minimum width for very short tasks
              const priority = getPriorityStroke(task.priority);
              
              return (
                <g key={`task-bar-${task.id}`} className="hover:opacity-90 transition-opacity duration-200">
                  {/* Task bar shadow */}
                  <rect
                    x={barX + 1}
                    y={barY + 1}
                    width={barWidth}
                    height={taskHeight}
                    fill="hsl(var(--shadow-soft))"
                    rx="6"
                    opacity="0.3"
                  />
                  
                  {/* Main task bar */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={taskHeight}
                    fill={getStatusColor(task.status)}
                    stroke={priority.color}
                    strokeWidth={priority.width}
                    rx="6"
                    className="cursor-pointer hover:brightness-110 transition-all duration-200"
                    filter="url(#taskShadow)"
                  />
                  
                  {/* Progress indicator for completed tasks */}
                  {task.status === 'completed' && (
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={taskHeight}
                      fill="url(#taskGradient)"
                      rx="6"
                      opacity="0.3"
                    />
                  )}
                  
                  {/* Task duration text for longer bars */}
                  {barWidth > 60 && (
                    <text
                      x={barX + barWidth / 2}
                      y={barY + taskHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-xs font-body font-medium"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {task.duration}d
                    </text>
                  )}
                  
                  {/* Enhanced tooltip */}
                  <title>
                    {`${tasks.find(t => t.id === task.id)?.task_name}
📅 Start: ${task.start_date}
📅 End: ${task.end_date}
⏱️ Duration: ${task.duration} days
📊 Status: ${task.status.replace('_', ' ').toUpperCase()}
⚡ Priority: ${task.priority.toUpperCase()}${task.assigned_to ? `
👤 Assigned to: ${task.assigned_to}` : ''}`}
                  </title>
                </g>
              );
            })}
            
            {/* Enhanced Today line */}
            {today >= 0 && (
              <g>
                {/* Glow effect */}
                <line
                  x1={leftMargin + today * dayWidth}
                  y1={topMargin}
                  x2={leftMargin + today * dayWidth}
                  y2={topMargin + windowGanttData.length * taskSpacing}
                  stroke="hsl(0 84% 60%)"
                  strokeWidth="6"
                  opacity="0.3"
                  strokeDasharray="8,4"
                />
                
                {/* Main line */}
                <line
                  x1={leftMargin + today * dayWidth}
                  y1={topMargin}
                  x2={leftMargin + today * dayWidth}
                  y2={topMargin + windowGanttData.length * taskSpacing}
                  stroke="hsl(0 84% 60%)"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                />
                
                {/* Today label with background */}
                <rect
                  x={leftMargin + today * dayWidth - 25}
                  y={topMargin - 25}
                  width="50"
                  height="20"
                  fill="hsl(0 84% 60%)"
                  rx="10"
                />
                <text
                  x={leftMargin + today * dayWidth}
                  y={topMargin - 12}
                  textAnchor="middle"
                  className="fill-white text-xs font-body font-bold"
                >
                  TODAY
                </text>
                
                {/* Pulse indicator */}
                <circle
                  cx={leftMargin + today * dayWidth}
                  cy={topMargin - 15}
                  r="4"
                  fill="hsl(0 84% 60%)"
                  className="animate-pulse"
                />
              </g>
            )}
            
            {/* Timeline label */}
            <text
              x={chartViewWidth / 2}
              y={topMargin + windowGanttData.length * taskSpacing + 55}
              textAnchor="middle"
              className="fill-muted-foreground text-sm font-body font-semibold"
            >
              Project Timeline
            </text>
          </svg>
        </div>
        
        {/* Enhanced Legend */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-body font-medium text-foreground">Priority Indicators:</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-md border">
                <div className="w-4 h-2 bg-muted-foreground border-2 border-red-500 rounded"></div>
                <span className="font-body text-muted-foreground">Urgent</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-md border">
                <div className="w-4 h-2 bg-muted-foreground border-2 border-gold-dark rounded"></div>
                <span className="font-body text-muted-foreground">High</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-md border">
                <div className="w-4 h-2 bg-muted-foreground border-2 border-accent rounded"></div>
                <span className="font-body text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-md border">
                <div className="w-4 h-2 bg-muted-foreground border border-muted-foreground rounded"></div>
                <span className="font-body text-muted-foreground">Low</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;