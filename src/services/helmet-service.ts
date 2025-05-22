import { formatISO, subDays, subHours, subMinutes } from 'date-fns';

export interface Worker {
  id: string;
  name: string;
  photo: string;
  department: string;
  position: string;
  helmetId: string;
}

export interface HelmetData {
  id: string;
  workerId: string;
  batteryLevel: number;
  status: 'active' | 'inactive' | 'warning' | 'critical';
  lastConnected: string;
}

export interface VitalData {
  oximeter: number; // Blood oxygen level (95-100%)
  heartRate: number; // BPM (60-100)
  temperature: number; // Body temperature in °C (36.1-37.2)
  humidity: number; // Humidity percentage (40-60%)
  gasLevel: number; // Gas level (0-100)
  accelerometer: {
    x: number;
    y: number;
    z: number;
    status: 'normal' | 'warning' | 'fall_detected';
  };
  timestamp: string;
}

export interface Event {
  id: string;
  workerId: string;
  helmetId: string;
  eventType: 'fall_detected' | 'high_co_level' | 'low_oxygen' | 'high_temperature' | 'battery_low' | 'disconnected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved';
  timestamp: string;
  description: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Generate mock workers
const WORKERS: Worker[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    photo: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
    department: 'Construction',
    position: 'Site Manager',
    helmetId: 'H001',
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
    department: 'Electrical',
    position: 'Lead Electrician',
    helmetId: 'H002',
  },
  {
    id: '3',
    name: 'David Chen',
    photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300',
    department: 'Maintenance',
    position: 'Technician',
    helmetId: 'H003',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    photo: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300',
    department: 'Safety',
    position: 'Inspector',
    helmetId: 'H004',
  },
];

// Generate mock helmet data
const HELMET_DATA: HelmetData[] = WORKERS.map(worker => ({
  id: worker.helmetId,
  workerId: worker.id,
  batteryLevel: Math.floor(Math.random() * 100),
  status: ['active', 'active', 'active', 'warning'][Math.floor(Math.random() * 4)] as 'active' | 'inactive' | 'warning' | 'critical',
  lastConnected: formatISO(new Date()),
}));

// Generate random vital data
const generateVitalData = (workerId: string): VitalData => {
  const isNormal = Math.random() > 0.2;
  return {
    oximeter: isNormal ? 95 + Math.random() * 5 : 85 + Math.random() * 10,
    heartRate: isNormal ? 60 + Math.random() * 40 : 50 + Math.random() * 100,
    temperature: isNormal ? 36.1 + Math.random() * 1.1 : 35 + Math.random() * 4,
    humidity: 40 + Math.random() * 20,
    gasLevel: isNormal ? Math.random() * 20 : 20 + Math.random() * 80,
    accelerometer: {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
      status: isNormal ? 'normal' : Math.random() > 0.5 ? 'warning' : 'fall_detected',
    },
    timestamp: formatISO(new Date()),
  };
};

// Generate vitals history for each worker
const VITALS_HISTORY: Record<string, VitalData[]> = {};
WORKERS.forEach(worker => {
  VITALS_HISTORY[worker.id] = Array.from({ length: 24 }, (_, i) => ({
    ...generateVitalData(worker.id),
    timestamp: formatISO(subHours(new Date(), 23 - i)),
  }));
});

// Generate mock events
const EVENT_TYPES = ['fall_detected', 'high_co_level', 'low_oxygen', 'high_temperature', 'battery_low', 'disconnected'] as const;
const SEVERITY = ['low', 'medium', 'high', 'critical'] as const;
const STATUS = ['new', 'acknowledged', 'resolved'] as const;

const EVENTS: Event[] = [];

// Generate 20 random events across all workers
for (let i = 0; i < 20; i++) {
  const worker = WORKERS[Math.floor(Math.random() * WORKERS.length)];
  const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const severity = SEVERITY[Math.floor(Math.random() * SEVERITY.length)];
  const status = STATUS[Math.floor(Math.random() * STATUS.length)];
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const timestamp = formatISO(subDays(subHours(subMinutes(new Date(), minutesAgo), hoursAgo), daysAgo));
  
  let description = '';
  switch (eventType) {
    case 'fall_detected':
      description = 'Worker may have fallen. Motion sensors detected sudden acceleration.';
      break;
    case 'high_co_level':
      description = 'High carbon monoxide level detected. Worker may be at risk.';
      break;
    case 'low_oxygen':
      description = 'Low oxygen level detected. Worker may be experiencing breathing difficulties.';
      break;
    case 'high_temperature':
      description = 'High body temperature detected. Worker may be experiencing heat stress.';
      break;
    case 'battery_low':
      description = 'Helmet battery is low. Replacement or charging required soon.';
      break;
    case 'disconnected':
      description = 'Helmet connection lost. Unable to monitor worker status.';
      break;
  }

  EVENTS.push({
    id: `E${i + 1}`,
    workerId: worker.id,
    helmetId: worker.helmetId,
    eventType,
    severity,
    status,
    timestamp,
    description,
    ...(status === 'resolved' ? {
      resolvedAt: formatISO(new Date(new Date(timestamp).getTime() + 1000 * 60 * 30)),
      resolvedBy: 'John Supervisor',
    } : {}),
  });
}

// Sort events by timestamp (newest first)
EVENTS.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

class HelmetService {
  async getWorkers(): Promise<Worker[]> {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return WORKERS;
  }

  async getWorkerById(id: string): Promise<Worker | undefined> {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return WORKERS.find(worker => worker.id === id);
  }

  async getHelmetData(helmetId: string): Promise<HelmetData | undefined> {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return HELMET_DATA.find(helmet => helmet.id === helmetId);
  }

  async getCurrentVitals(workerId: string): Promise<VitalData> {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateVitalData(workerId);
  }

  async getVitalsHistory(workerId: string): Promise<VitalData[]> {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 700));
    return VITALS_HISTORY[workerId] || [];
  }

  async getEvents(filters?: {
    workerId?: string;
    eventType?: string;
    status?: string;
    severity?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Event[]> {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filteredEvents = [...EVENTS];
    
    if (filters) {
      if (filters.workerId) {
        filteredEvents = filteredEvents.filter(event => event.workerId === filters.workerId);
      }
      
      if (filters.eventType) {
        filteredEvents = filteredEvents.filter(event => event.eventType === filters.eventType);
      }
      
      if (filters.status) {
        filteredEvents = filteredEvents.filter(event => event.status === filters.status);
      }
      
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(event => event.severity === filters.severity);
      }
      
      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) >= fromDate);
      }
      
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        filteredEvents = filteredEvents.filter(event => new Date(event.timestamp) <= toDate);
      }
    }
    
    return filteredEvents;
  }

  async updateEventStatus(eventId: string, status: 'new' | 'acknowledged' | 'resolved'): Promise<Event> {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const eventIndex = EVENTS.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    EVENTS[eventIndex] = {
      ...EVENTS[eventIndex],
      status,
      ...(status === 'resolved' ? {
        resolvedAt: formatISO(new Date()),
        resolvedBy: 'John Supervisor',
      } : {}),
    };
    
    return EVENTS[eventIndex];
  }
}

export const helmetService = new HelmetService();

export const someFunction = async () => {
  // ...implementation
};