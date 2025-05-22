export type Worker = {
    id: string;
    name: string;
    employeeId: string;
    department: string;
    role: string;
    helmetId?: string;
    status: 'active' | 'inactive';
    email: string;
    phone: string;
}
