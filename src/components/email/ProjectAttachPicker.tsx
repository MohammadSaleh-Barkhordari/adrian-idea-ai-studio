import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FolderOpen, Plus, X } from 'lucide-react';

interface AttachItem {
  id: string;
  name: string;
  storage_path: string;
  bucket: string;
}

interface ProjectAttachPickerProps {
  onAttach: (item: { name: string; storage_path: string; bucket: string }) => void;
}

const ProjectAttachPicker = ({ onAttach }: ProjectAttachPickerProps) => {
  const [show, setShow] = useState(false);
  const [projects, setProjects] = useState<{ id: string; project_id: string | null; project_name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [category, setCategory] = useState('');
  const [items, setItems] = useState<AttachItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('adrian_projects')
      .select('id, project_id, project_name')
      .order('project_name');
    setProjects(data || []);
  };

  useEffect(() => {
    if (show && projects.length === 0) fetchProjects();
  }, [show]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCategory('');
    setItems([]);
    setSelectedItemId('');
  };

  const handleCategoryChange = async (cat: string) => {
    setCategory(cat);
    setSelectedItemId('');
    setLoading(true);

    const project = projects.find(p => p.id === selectedProjectId);
    const pid = project?.project_id;
    if (!pid) { setItems([]); setLoading(false); return; }

    try {
      if (cat === 'document') {
        const { data } = await supabase
          .from('documents')
          .select('id, file_name, file_path')
          .eq('project_id', pid)
          .order('created_at', { ascending: false });
        setItems((data || []).filter(d => d.file_path).map(d => ({
          id: d.id,
          name: d.file_name || 'Untitled',
          storage_path: d.file_path!,
          bucket: 'Documents',
        })));
      } else if (cat === 'file') {
        const { data } = await supabase
          .from('files')
          .select('id, file_name, file_path')
          .eq('project_id', pid)
          .order('created_at', { ascending: false });
        setItems((data || []).filter(d => d.file_path).map(d => ({
          id: d.id,
          name: d.file_name || 'Untitled',
          storage_path: d.file_path,
          bucket: 'Files',
        })));
      } else if (cat === 'letter') {
        const { data } = await supabase
          .from('letters')
          .select('id, letter_title, subject, final_image_url')
          .eq('project_id', pid)
          .eq('status', 'final_generated')
          .order('created_at', { ascending: false });
        setItems((data || []).filter(d => d.final_image_url).map(d => ({
          id: d.id,
          name: d.letter_title || d.subject || 'Untitled Letter',
          storage_path: d.final_image_url!,
          bucket: 'Letters',
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;
    onAttach({ name: item.name, storage_path: item.storage_path, bucket: item.bucket });
    setSelectedItemId('');
  };

  if (!show) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setShow(true)}>
        <FolderOpen className="h-4 w-4 mr-1" />
        Attach from Project
      </Button>
    );
  }

  return (
    <div className="border border-border rounded-md p-3 space-y-2 bg-muted/30">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Attach from Project</Label>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setShow(false); setSelectedProjectId(''); setCategory(''); setItems([]); setSelectedItemId(''); }}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Select value={selectedProjectId} onValueChange={handleProjectChange}>
          <SelectTrigger className="text-xs h-8">
            <SelectValue placeholder="Project..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.project_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={handleCategoryChange} disabled={!selectedProjectId}>
          <SelectTrigger className="text-xs h-8">
            <SelectValue placeholder="Category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="document" className="text-xs">Document</SelectItem>
            <SelectItem value="file" className="text-xs">File</SelectItem>
            <SelectItem value="letter" className="text-xs">Letter</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedItemId} onValueChange={setSelectedItemId} disabled={!category || loading}>
          <SelectTrigger className="text-xs h-8">
            <SelectValue placeholder={loading ? 'Loading...' : 'Item...'} />
          </SelectTrigger>
          <SelectContent>
            {items.map(i => (
              <SelectItem key={i.id} value={i.id} className="text-xs">
                {i.name}
              </SelectItem>
            ))}
            {!loading && items.length === 0 && category && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No items found</div>
            )}
          </SelectContent>
        </Select>
      </div>
      <Button type="button" size="sm" variant="secondary" disabled={!selectedItemId} onClick={handleAdd} className="h-7 text-xs">
        <Plus className="h-3 w-3 mr-1" /> Add Attachment
      </Button>
    </div>
  );
};

export default ProjectAttachPicker;
