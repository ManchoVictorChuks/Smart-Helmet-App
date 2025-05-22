import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  Check,
  Filter,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { helmetService, type Event, type Worker } from "@/services/helmet-service";

export default function EventHistoryPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, workersData] = await Promise.all([
          helmetService.getEvents(),
          helmetService.getWorkers(),
        ]);
        setEvents(eventsData);
        setWorkers(workersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStatus = async (eventId: string, newStatus: 'new' | 'acknowledged' | 'resolved') => {
    try {
      const updatedEvent = await helmetService.updateEventStatus(eventId, newStatus);
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? updatedEvent : event
        )
      );
    } catch (error) {
      console.error("Error updating event status:", error);
    }
  };

  const applyFilters = () => {
    setIsLoading(true);
    const filters: any = {};
    
    if (eventTypeFilter) filters.eventType = eventTypeFilter;
    if (statusFilter) filters.status = statusFilter;
    if (severityFilter) filters.severity = severityFilter;
    if (startDate) filters.fromDate = format(startDate, 'yyyy-MM-dd');
    if (endDate) filters.toDate = format(endDate, 'yyyy-MM-dd');
    
    helmetService.getEvents(filters)
      .then(filteredEvents => {
        setEvents(filteredEvents);
        setCurrentPage(1);
      })
      .catch(error => console.error("Error applying filters:", error))
      .finally(() => setIsLoading(false));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setEventTypeFilter("");
    setStatusFilter("");
    setSeverityFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    
    setIsLoading(true);
    helmetService.getEvents()
      .then(resetEvents => {
        setEvents(resetEvents);
        setCurrentPage(1);
      })
      .catch(error => console.error("Error resetting filters:", error))
      .finally(() => setIsLoading(false));
  };

  // Filter events by search term
  const filteredEvents = events.filter(event => {
    const worker = workers.find(w => w.id === event.workerId);
    const searchString = `${event.id} ${worker?.name || ''} ${event.helmetId} ${event.eventType} ${event.description}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown';
  };

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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">High</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

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

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event History</h1>
          <p className="text-muted-foreground">
            View and manage all safety events from worker helmets
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Narrow down events by type, status, and date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full"
                    startIcon={<Search />}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:w-2/3">
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="fall_detected">Fall Detected</SelectItem>
                      <SelectItem value="high_co_level">High CO Level</SelectItem>
                      <SelectItem value="low_oxygen">Low Oxygen</SelectItem>
                      <SelectItem value="high_temperature">High Temperature</SelectItem>
                      <SelectItem value="battery_low">Battery Low</SelectItem>
                      <SelectItem value="disconnected">Disconnected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PP") : "Start Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PP") : "End Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={resetFilters} variant="outline">
                    Reset
                  </Button>
                  <Button onClick={applyFilters}>
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Event List</CardTitle>
              <div className="text-sm text-muted-foreground">
                {filteredEvents.length} events found
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-60">
                <p>Loading events...</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">
                          <div className="flex items-center gap-1">
                            Date & Time
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Worker</TableHead>
                        <TableHead>Helmet ID</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length > 0 ? (
                        currentItems.map(event => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">
                              {format(new Date(event.timestamp), "MMM d, yyyy HH:mm")}
                            </TableCell>
                            <TableCell>{getWorkerName(event.workerId)}</TableCell>
                            <TableCell>{event.helmetId}</TableCell>
                            <TableCell>
                              {getEventTypeLabel(event.eventType)}
                              <div className="text-xs text-muted-foreground mt-1">
                                {event.description.length > 40 
                                  ? `${event.description.substring(0, 40)}...` 
                                  : event.description}
                              </div>
                            </TableCell>
                            <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                            <TableCell>{getStatusBadge(event.status)}</TableCell>
                            <TableCell className="text-right">
                              {event.status === 'new' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(event.id, 'acknowledged')}
                                >
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Acknowledge
                                </Button>
                              )}
                              {event.status === 'acknowledged' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateStatus(event.id, 'resolved')}
                                >
                                  <Check className="mr-1 h-3 w-3" />
                                  Resolve
                                </Button>
                              )}
                              {event.status === 'resolved' && (
                                <div className="text-xs text-muted-foreground">
                                  Resolved by: {event.resolvedBy}
                                  <br />
                                  {event.resolvedAt && format(new Date(event.resolvedAt), "MMM d, HH:mm")}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No events found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredEvents.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {indexOfFirstItem + 1}-
                      {indexOfLastItem > filteredEvents.length
                        ? filteredEvents.length
                        : indexOfLastItem}{" "}
                      of {filteredEvents.length}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous Page</span>
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next Page</span>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}