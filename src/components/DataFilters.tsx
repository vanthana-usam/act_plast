
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, X } from 'lucide-react';

interface DataFiltersProps {
  title: string;
  filters: {
    date: string;
    machine: string;
    operator: string;
    shift: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onExport: () => void;
  onClose: () => void;
  resultCount?: number;
}

const DataFilters: React.FC<DataFiltersProps> = ({
  title,
  filters,
  onFilterChange,
  onClearFilters,
  onExport,
  onClose,
  resultCount
}) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              type="date" 
              value={filters.date}
              onChange={(e) => onFilterChange('date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Machine</Label>
            <Select value={filters.machine} onValueChange={(value) => onFilterChange('machine', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All machines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Machines</SelectItem>
                <SelectItem value="MACHINE-001">MACHINE-001</SelectItem>
                <SelectItem value="MACHINE-002">MACHINE-002</SelectItem>
                <SelectItem value="ASSEMBLY-001">ASSEMBLY-001</SelectItem>
                <SelectItem value="ASSEMBLY-002">ASSEMBLY-002</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Operator</Label>
            <Input 
              placeholder="Enter operator name"
              value={filters.operator}
              onChange={(e) => onFilterChange('operator', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Shift</Label>
            <Select value={filters.shift} onValueChange={(value) => onFilterChange('shift', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="A">Shift A</SelectItem>
                <SelectItem value="B">Shift B</SelectItem>
                <SelectItem value="C">Shift C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {resultCount !== undefined && `${resultCount} results found`}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataFilters;
