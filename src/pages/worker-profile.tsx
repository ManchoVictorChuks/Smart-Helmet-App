import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Activity,
  Battery,
  Clock,
  MailIcon,
  MapPin,
  Phone,
  ThumbsUp,
  User,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/main-layout";
import { helmetService, type Worker, type VitalData, type Event } from "@/services/helmet-service";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [vitals, setVitals] = useState<VitalData | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalData[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [workerData, vitalsData, historyData, eventsData] = await Promise.all([
          helmetService.getWorkerById(id),
          helmetService.getCurrentVitals(id),
          helmetService.getVitalsHistory(id),
          helmetService.getEvents({ workerId: id }),
        ]);
        
        if (workerData) {
          setWorker(workerData);
          setVitals(vitalsData);
          setVitalsHistory(historyData);
          setRecentEvents(eventsData.slice(0, 5)); // Get only the 5 most recent events
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching worker data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Format chart data
  const formatChartData = (history: VitalData[]) => {
    return history.map(entry => ({
      time: format(new Date(entry.timestamp), 'HH:mm'),
      oximeter: entry.oximeter,
      heartRate: entry.heartRate,
      temperature: entry.temperature,
    }));
  };

  const chartData = formatChartData(vitalsHistory);

  // Generate mock contact information
  const contactInfo = {
    phone: "+1 (555) 123-4567",
    email: "worker@example.com",
    location: "Building C, Section 2",
    department: worker?.department || "Unknown",
    position: worker?.position || "Unknown",
    supervisor: "John Supervisor",
  };

  // Get status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">New</Badge>;
      case 'acknowledged':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Acknowledged</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get event type label
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'fall_detected': return 'Fall Detected';
      case 'high_co_level': return 'High CO Level';
      case 'low_oxygen': return 'Low Oxygen';
      case 'high_temperature': return 'High Temperature';
      case 'battery_low': return 'Battery Low';
      case 'disconnected': return 'Disconnected';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Loading worker profile...</h2>
            <p className="text-muted-foreground">Retrieving worker and helmet data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Worker Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={worker?.photo} alt={worker?.name} />
                    <AvatarFallback>{worker?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-xl font-semibold">{worker?.name}</h2>
                  <p className="text-muted-foreground">{worker?.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">ID: {worker?.id}</Badge>
                    <Badge variant="outline">Helmet: {worker?.helmetId}</Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{contactInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MailIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{contactInfo.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{contactInfo.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ThumbsUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Supervisor</p>
                      <p className="font-medium">{contactInfo.supervisor}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Worker
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Helmet Status</CardTitle>
                <CardDescription>
                  Real-time helmet data and vitals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Battery className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium">Battery Level</p>
                        <p className="text-sm font-medium">85%</p>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {vitals?.timestamp ? format(new Date(vitals.timestamp), "MMM d, yyyy HH:mm:ss") : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {vitals && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Oxygen Level</p>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-bold">{vitals.oximeter.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Normal range: 95-100%
                      </p>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Heart Rate</p>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-bold">{vitals.heartRate.toFixed(0)} <span className="text-sm font-normal">bpm</span></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Normal range: 60-100 bpm
                      </p>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Temperature</p>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-bold">{vitals.temperature.toFixed(1)} <span className="text-sm font-normal">°C</span></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Normal range: 36.1-37.2°C
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vitals Trend</CardTitle>
                <CardDescription>
                  Worker vitals over the last 24 hours
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
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  Latest events for this worker
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {recentEvents.map(event => (
                      <div key={event.id} className="flex items-start gap-4 p-3 border rounded-lg">
                        <div className={`rounded-full p-2 ${
                          event.severity === 'critical' ? 'bg-red-100' :
                          event.severity === 'high' ? 'bg-amber-100' :
                          'bg-blue-100'
                        }`}>
                          <AlertTriangle className={`h-5 w-5 ${
                            event.severity === 'critical' ? 'text-red-500' :
                            event.severity === 'high' ? 'text-amber-500' :
                            'text-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{getEventTypeLabel(event.eventType)}</p>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                            <div className="text-right">
                              <div>{getStatusBadge(event.status)}</div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(event.timestamp), "MMM d, HH:mm")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent alerts for this worker
                  </div>
                )}
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/events")}>
                    View All Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}