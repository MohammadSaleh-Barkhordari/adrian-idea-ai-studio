import { Inbox, Send, FileText, Star, Archive, Trash2, Plus, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'starred' | 'archive' | 'trash';

interface EmailSidebarProps {
  activeFolder: EmailFolder;
  onFolderChange: (folder: EmailFolder) => void;
  onCompose: () => void;
  onQuickAdd: () => void;
  unreadCount: number;
  collapsed?: boolean;
}

const folders: { id: EmailFolder; label: string; icon: typeof Inbox }[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const EmailSidebar = ({ activeFolder, onFolderChange, onCompose, onQuickAdd, unreadCount, collapsed = false }: EmailSidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border p-2 gap-1">
      <Button onClick={onCompose} className="w-full mb-3" size={collapsed ? 'icon' : 'default'}>
        <Plus className="h-4 w-4" />
        {!collapsed && <span className="ml-2">Compose</span>}
      </Button>

      <nav className="flex-1 space-y-0.5">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const isActive = activeFolder === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => onFolderChange(folder.id)}
              className={cn(
                'flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{folder.label}</span>
                  {folder.id === 'inbox' && unreadCount > 0 && (
                    <Badge variant="default" className="text-xs h-5 min-w-[20px] flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      <Button variant="ghost" size={collapsed ? 'icon' : 'sm'} onClick={onQuickAdd} className="mt-auto text-muted-foreground">
        <PlusCircle className="h-4 w-4" />
        {!collapsed && <span className="ml-2">Quick Add</span>}
      </Button>
    </div>
  );
};

export default EmailSidebar;
