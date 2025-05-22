import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from 'lucide-react';
import { Worker } from '@/types/worker';

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]); // Replace with actual data fetching
    const [search, setSearch] = useState('');

    const filteredWorkers = workers.filter(worker => 
        worker.name.toLowerCase().includes(search.toLowerCase()) ||
        worker.employeeId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Workers</h1>
                </div>
                <Link to="/workers/new">
                    <Button>Add New Worker</Button>
                </Link>
            </div>

            <Input
                placeholder="Search workers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm mb-4"
            />

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Helmet ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredWorkers.map((worker) => (
                        <TableRow key={worker.id}>
                            <TableCell>
                                <Link to={`/workers/${worker.id}`} className="text-blue-600 hover:underline">
                                    {worker.name}
                                </Link>
                            </TableCell>
                            <TableCell>{worker.employeeId}</TableCell>
                            <TableCell>{worker.department}</TableCell>
                            <TableCell>{worker.status}</TableCell>
                            <TableCell>{worker.helmetId || 'Not assigned'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
