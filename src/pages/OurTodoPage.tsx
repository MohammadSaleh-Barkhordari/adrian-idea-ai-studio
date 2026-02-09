import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Edit, Trash2, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewTodoDialog from "@/components/NewTodoDialog";
import { sendNotification, getOtherOurLifeUser, getOurLifeUserName } from "@/lib/notifications";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  user_id: string;
}

const OurTodoPage = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<'Raiana' | 'Mohammad' | 'Both'>('Raiana');
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const allowedEmails = ['r.sattari@adrianidea.ir', 'm.barkhordari@adrianidea.ir'];
    if (!allowedEmails.includes(session.user.email || '')) {
      navigate('/dashboard');
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('our_todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch todos",
        variant: "destructive"
      });
    }
  };

  const toggleTodoStatus = async (todoId: string, currentCompleted: boolean, todoTitle?: string) => {
    const newCompleted = !currentCompleted;

    try {
      const { error } = await supabase
        .from('our_todos')
        .update({ completed: newCompleted })
        .eq('id', todoId);

      if (error) throw error;
      
      // Send notification to the other Our Life user
      if (user) {
        const otherUserId = getOtherOurLifeUser(user.id);
        if (otherUserId) {
          const actorName = getOurLifeUserName(user.id);
          await sendNotification(
            '✅ Task Updated',
            `${actorName} marked "${todoTitle || 'a task'}" as ${newCompleted ? 'completed' : 'reopened'}`,
            [otherUserId],
            'task',
            '/our-todo'
          );
        }
      }
      
      fetchTodos();
      toast({
        title: "Success",
        description: `Todo ${newCompleted ? 'completed' : 'reopened'}`,
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive"
      });
    }
  };

  const deleteTodo = async (todoId: string, todoTitle?: string) => {
    try {
      const { error } = await supabase
        .from('our_todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;
      
      // Send notification to the other Our Life user
      if (user) {
        const otherUserId = getOtherOurLifeUser(user.id);
        if (otherUserId) {
          const actorName = getOurLifeUserName(user.id);
          await sendNotification(
            '✅ Task Removed',
            `${actorName} removed: "${todoTitle || 'a task'}"`,
            [otherUserId],
            'task',
            '/our-todo'
          );
        }
      }
      
      fetchTodos();
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  useEffect(() => {
    const subscription = supabase
      .channel('our_todos_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'our_todos' }, () => {
        fetchTodos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const filterTodosByPriority = (priority: string) => {
    return todos.filter(todo => todo.priority === priority || priority === 'all');
  };

  const TodoSection = ({ title, todos }: { title: string; todos: Todo[] }) => {
    const activeTodos = todos.filter(todo => !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);

    return (
      <Card className="glass-card border-border bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Active Todos */}
          {activeTodos.length === 0 && completedTodos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tasks yet. Add one above!</p>
          ) : (
            <>
              {activeTodos.map((todo) => (
                <div key={todo.id} className="glass-card border-border bg-card/30 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodoStatus(todo.id, todo.completed, todo.title)}
                      className="mt-1 border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-foreground font-medium">{todo.title}</h3>
                        <Badge variant={getPriorityColor(todo.priority)} className="text-xs">
                          {todo.priority}
                        </Badge>
                      </div>
                      {todo.description && (
                        <p className="text-muted-foreground text-sm mb-2">{todo.description}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => deleteTodo(todo.id, todo.title)}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Completed Todos */}
              {completedTodos.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-muted-foreground text-sm font-medium mb-3">Completed ({completedTodos.length})</h4>
                  {completedTodos.map((todo) => (
                    <div key={todo.id} className="glass-card border-border bg-muted/20 p-3 rounded-lg opacity-75">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => toggleTodoStatus(todo.id, todo.completed, todo.title)}
                          className="mt-1 border-border"
                        />
                        <div className="flex-1">
                          <h3 className="text-muted-foreground font-medium line-through">{todo.title}</h3>
                          {todo.description && (
                            <p className="text-muted-foreground text-sm line-through">{todo.description}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => deleteTodo(todo.id, todo.title)}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24" dir="ltr">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button
            onClick={() => navigate('/our-life')}
            variant="ghost"
            className="text-foreground hover:bg-accent w-full sm:w-auto justify-start min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Our Life</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Our To-Do List</h1>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="glass-button text-foreground border-border hover:bg-accent sm:ml-auto w-full sm:w-auto min-h-[44px]"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <TodoSection title="High Priority" todos={todos.filter(t => t.priority === 'high')} />
          <TodoSection title="Medium Priority" todos={todos.filter(t => t.priority === 'medium')} />
          <TodoSection title="Low Priority" todos={todos.filter(t => t.priority === 'low')} />
        </div>

        <NewTodoDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          selectedPerson={'Both'}
          onTodoCreated={fetchTodos}
        />
      </main>

      <Footer />
    </div>
  );
};

export default OurTodoPage;