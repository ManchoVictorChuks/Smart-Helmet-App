import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Activity,
  AlertTriangle,
  Bolt,
  Droplet,
  Thermometer,
  Wind,
  Battery,
  Zap,
  User
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { helmetService, type VitalData, type Worker } from "@/services/helmet-service";
import { useAuth } from "@/contexts/auth-context";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [vitals, setVitals] = useState<VitalData | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const workersData = await helmetService.getWorkers();
        setWorkers(workersData);
        
        if (workersData.length > 0) {
          setSelectedWorker(workersData[0]);
          const vitalsData = await helmetService.getCurrentVitals(workersData[0].id);
          setVitals(vitalsData);
          
          const history = await helmetService.getVitalsHistory(workersData[0].id);
          setVitalsHistory(history);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(async () => {
      if (selectedWorker) {
        try {
          const vitalsData = await helmetService.getCurrentVitals(selectedWorker.id);
          setVitals(vitalsData);
        } catch (error) {
          console.error("Error refreshing vitals:", error);
        }
      }
    }, 10000);

    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    if (selectedWorker) {
      const fetchData = async () => {
        try {
          const vitalsData = await helmetService.getCurrentVitals(selectedWorker.id);
          setVitals(vitalsData);
          
          const history = await helmetService.getVitalsHistory(selectedWorker.id);
          setVitalsHistory(history);
        } catch (error) {
          console.error("Error fetching worker data:", error);
        }
      };

      fetchData();

      // Set up auto-refresh every 10 seconds
      const interval = setInterval(async () => {
        try {
          const vitalsData = await helmetService.getCurrentVitals(selectedWorker.id);
          setVitals(vitalsData);
        } catch (error) {
          console.error("Error refreshing vitals:", error);
        }
      }, 10000);

      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [selectedWorker]);

  const handleWorkerChange = async (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setSelectedWorker(worker);
    }
  };

  // Helper function to determine status colors
  const getVitalStatusInfo = (type: string, value: number) => {
    switch (type) {
      case 'oximeter':
        if (value >= 95) return { color: 'text-green-500', status: 'Normal' };
        if (value >= 90) return { color: 'text-amber-500', status: 'Low' };
        return { color: 'text-red-500', status: 'Critical' };
      
      case 'heartRate':
        if (value >= 60 && value <= 100) return { color: 'text-green-500', status: 'Normal' };
        if ((value >= 50 && value < 60) || (value > 100 && value <= 120)) return { color: 'text-amber-500', status: 'Abnormal' };
        return { color: 'text-red-500', status: 'Critical' };
      
      case 'temperature':
        if (value >= 36 && value <= 37.5) return { color: 'text-green-500', status: 'Normal' };
        if ((value >= 35 && value < 36) || (value > 37.5 && value <= 38)) return { color: 'text-amber-500', status: 'Warning' };
        return { color: 'text-red-500', status: 'Critical' };
      
      case 'humidity':
        if (value >= 40 && value <= 60) return { color: 'text-green-500', status: 'Normal' };
        if ((value >= 30 && value < 40) || (value > 60 && value <= 70)) return { color: 'text-amber-500', status: 'Warning' };
        return { color: 'text-red-500', status: 'Critical' };
      
      case 'gasLevel':
        if (value < 20) return { color: 'text-green-500', status: 'Safe' };
        if (value >= 20 && value <= 50) return { color: 'text-amber-500', status: 'Warning' };
        return { color: 'text-red-500', status: 'Danger' };
      
      default:
        return { color: 'text-gray-500', status: 'Unknown' };
    }
  };

  // Format chart data
  const formatChartData = (history: VitalData[]) => {
    return history.map(entry => ({
      time: format(new Date(entry.timestamp), 'HH:mm'),
      oximeter: entry.oximeter,
      heartRate: entry.heartRate,
      temperature: entry.temperature,
      gasLevel: entry.gasLevel,
    }));
  };

  const chartData = formatChartData(vitalsHistory);

  const renderAlert = () => {
    if (!vitals) return null;
    
    const alerts = [];
    
    if (vitals.oximeter < 90) {
      alerts.push({ type: 'Low Oxygen', description: 'Worker oxygen level is critically low!', severity: 'critical' });
    }
    
    if (vitals.heartRate < 50 || vitals.heartRate > 120) {
      alerts.push({ type: 'Abnormal Heart Rate', description: 'Worker heart rate is outside safe range!', severity: 'high' });
    }
    
    if (vitals.temperature > 38) {
      alerts.push({ type: 'High Temperature', description: 'Worker body temperature is elevated!', severity: 'high' });
    }
    
    if (vitals.gasLevel > 50) {
      alerts.push({ type: 'High Gas Level', description: 'Dangerous gas levels detected!', severity: 'critical' });
    }
    
    if (vitals.accelerometer.status === 'fall_detected') {
      alerts.push({ type: 'Fall Detected', description: 'Worker may have fallen! Immediate response required.', severity: 'critical' });
    }
    
    if (alerts.length === 0) return null;
    
    return (
      <div className="mb-6 space-y-3">
        {alerts.map((alert, index) => (
          <Alert 
            key={index} 
            variant="destructive" 
            className="animate-pulse border-l-4 border-red-500"
          >
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-red-500 font-bold">{alert.type}</AlertTitle>
            <AlertDescription>
              {alert.description}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading dashboard...</h2>
            <p className="text-muted-foreground">Retrieving helmet and worker data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Hello, {user?.name}. Welcome to the SafetyTrack monitoring system.
            </p>
          </div>
          <div className="w-full md:w-[300px]">
            <Select onValueChange={handleWorkerChange} defaultValue={selectedWorker?.id}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map((worker) => (
                  <SelectItem key={worker.id} value={worker.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={worker.photo} alt={worker.name} />
                        <AvatarFallback>{worker.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{worker.name} - {worker.helmetId}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedWorker && (
          <div className="flex flex-col md:flex-row items-start gap-4 mb-4">
            <div className="w-full md:w-auto bg-card rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedWorker.photo} alt={selectedWorker.name} />
                  <AvatarFallback>{selectedWorker.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedWorker.name}</h2>
                  <p className="text-muted-foreground">{selectedWorker.department} - {selectedWorker.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">ID: {selectedWorker.id}</Badge>
                    <Badge variant="outline">Helmet: {selectedWorker.helmetId}</Badge>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Battery</span>
                </div>
                <Progress value={85} className="w-24" />
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/worker/${selectedWorker.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>
            
            {renderAlert()}
          </div>
        )}

        {vitals && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Oxygen Level</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{vitals.oximeter.toFixed(1)}%</div>
                    <Badge variant={vitals.oximeter >= 95 ? "outline" : vitals.oximeter >= 90 ? "secondary" : "destructive"}>
                      {getVitalStatusInfo('oximeter', vitals.oximeter).status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Progress value={vitals.oximeter} max={100} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {format(new Date(vitals.timestamp), 'HH:mm:ss')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{vitals.heartRate.toFixed(0)} <span className="text-sm font-normal">bpm</span></div>
                    <Badge variant={
                      vitals.heartRate >= 60 && vitals.heartRate <= 100
                        ? "outline"
                        : (vitals.heartRate >= 50 && vitals.heartRate < 60) || (vitals.heartRate > 100 && vitals.heartRate <= 120)
                          ? "secondary"
                          : "destructive"
                    }>
                      {getVitalStatusInfo('heartRate', vitals.heartRate).status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Progress value={vitals.heartRate} max={150} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {format(new Date(vitals.timestamp), 'HH:mm:ss')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{vitals.temperature.toFixed(1)} <span className="text-sm font-normal">°C</span></div>
                    <Badge variant={
                      vitals.temperature >= 36 && vitals.temperature <= 37.5
                        ? "outline"
                        : (vitals.temperature >= 35 && vitals.temperature < 36) || (vitals.temperature > 37.5 && vitals.temperature <= 38)
                          ? "secondary"
                          : "destructive"
                    }>
                      {getVitalStatusInfo('temperature', vitals.temperature).status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Progress value={(vitals.temperature - 35) * 20} max={100} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {format(new Date(vitals.timestamp), 'HH:mm:ss')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Humidity</CardTitle>
                    <Droplet className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{vitals.humidity.toFixed(1)}%</div>
                    <Badge variant={
                      vitals.humidity >= 40 && vitals.humidity <= 60
                        ? "outline"
                        : (vitals.humidity >= 30 && vitals.humidity < 40) || (vitals.humidity > 60 && vitals.humidity <= 70)
                          ? "secondary"
                          : "destructive"
                    }>
                      {getVitalStatusInfo('humidity', vitals.humidity).status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Progress value={vitals.humidity} max={100} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {format(new Date(vitals.timestamp), 'HH:mm:ss')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Gas Level</CardTitle>
                    <Wind className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{vitals.gasLevel.toFixed(1)} <span className="text-sm font-normal">ppm</span></div>
                    <Badge variant={
                      vitals.gasLevel < 20
                        ? "outline"
                        : vitals.gasLevel >= 20 && vitals.gasLevel <= 50
                          ? "secondary"
                          : "destructive"
                    }>
                      {getVitalStatusInfo('gasLevel', vitals.gasLevel).status}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <Progress value={vitals.gasLevel} max={100} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {format(new Date(vitals.timestamp), 'HH:mm:ss')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Accelerometer</CardTitle>
                    <Bolt className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {vitals.accelerometer.status === 'normal' ? 'Normal' : 
                       vitals.accelerometer.status === 'warning' ? 'Motion' : 'Fall'}
                    </div>
                    <Badge variant={
                      vitals.accelerometer.status === 'normal'
                        ? "outline"
                        : vitals.accelerometer.status === 'warning'
                          ? "secondary"
                          : "destructive"
                    }>
                      {vitals.accelerometer.status === 'normal' ? 'Safe' : 
                       vitals.accelerometer.status === 'warning' ? 'Warning' : 'Alert'}
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">X-axis</p>
                      <p className="font-medium">{vitals.accelerometer.x.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Y-axis</p>
                      <p className="font-medium">{vitals.accelerometer.y.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Z-axis</p>
                      <p className="font-medium">{vitals.accelerometer.z.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Last updated: {format(new Date(vitals.timestamp), 'HH:mm:ss')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Vitals Trend</CardTitle>
                <CardDescription>
                  Monitoring vital signs over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="oximeter" stroke="#8884d8" name="Oxygen (%)" />
                      <Line type="monotone" dataKey="heartRate" stroke="#82ca9d" name="Heart Rate (bpm)" />
                      <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="Temperature (°C)" />
                      <Line type="monotone" dataKey="gasLevel" stroke="#666" name="Gas Level (ppm)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}