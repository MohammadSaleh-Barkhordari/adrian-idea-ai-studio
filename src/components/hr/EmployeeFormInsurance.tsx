import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeFormInsuranceProps {
  formData: { [key: string]: any };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const EmployeeFormInsurance = ({ formData, setFormData }: EmployeeFormInsuranceProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance & Tax</CardTitle>
        <CardDescription>Insurance and tax information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="insurance_number">Insurance Number</Label>
            <Input
              id="insurance_number"
              value={formData.insurance_number}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, insurance_number: e.target.value }))}
              placeholder="Tameen Ejtemaaei number"
            />
          </div>
          <div>
            <Label htmlFor="insurance_type">Insurance Type</Label>
            <Select
              value={formData.insurance_type}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, insurance_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select insurance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tameen_ejtemaaei">Tameen Ejtemaaei (Social Security)</SelectItem>
                <SelectItem value="private">Private Insurance</SelectItem>
                <SelectItem value="supplementary">Supplementary</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="insurance_start_date">Insurance Start Date</Label>
          <Input
            id="insurance_start_date"
            type="date"
            value={formData.insurance_start_date}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, insurance_start_date: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tax_id">Tax ID</Label>
            <Input
              id="tax_id"
              value={formData.tax_id}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, tax_id: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="tax_exemption_status">Tax Exemption Status</Label>
            <Select
              value={formData.tax_exemption_status}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, tax_exemption_status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exemption status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Exemption</SelectItem>
                <SelectItem value="partial">Partial Exemption</SelectItem>
                <SelectItem value="full">Full Exemption</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeFormInsurance;
