import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Worker } from '@/types/worker';

export default function WorkerDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker] = useState<Worker | null>(null);

    useEffect(() => {
        // Fetch worker data using id
        // Replace with actual data fetching
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        // Update worker data
    };

    if (!worker && id !== 'new') return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={() => navigate('/workers')}>Back</Button>
                <h1 className="text-3xl font-bold">
                    {id === 'new' ? 'Add New Worker' : 'Edit Worker'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={worker?.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input id="employeeId" name="employeeId" defaultValue={worker?.employeeId} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" name="department" defaultValue={worker?.department} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" name="role" defaultValue={worker?.role} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" defaultValue={worker?.email} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" defaultValue={worker?.phone} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select defaultValue={worker?.status}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="helmetId">Helmet ID</Label>
                        <Input id="helmetId" name="helmetId" defaultValue={worker?.helmetId} />
                    </div>
                </div>
                <Button type="submit" className="mt-6">
                    {id === 'new' ? 'Create Worker' : 'Update Worker'}
                </Button>
            </form>
        </div>
    );
}
