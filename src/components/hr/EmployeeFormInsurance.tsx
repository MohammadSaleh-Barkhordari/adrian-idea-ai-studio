import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const EmployeeFormInsurance = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance & Tax</CardTitle>
        <CardDescription>Insurance and tax information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 p-4 rounded-md bg-muted">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Insurance & Tax fields coming in Phase 3C.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeFormInsurance;
