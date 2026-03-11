import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart3, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import AdvancedAnalytics from "../components/analytics/AdvancedAnalytics";
import ActivityFeed from "../components/events/ActivityFeed";
import AnalyticsCharts from "../components/events/AnalyticsCharts";
import EventFilters from "../components/events/EventFilters";
import EventSearch from "../components/events/EventSearch";
import { useGetAccessEvents } from "../hooks/useQueries";

export default function EventMonitoring() {
  const { data: events = [], isLoading } = useGetAccessEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMethod =
        selectedMethod === "all" || event.method === selectedMethod;
      const matchesUser =
        selectedUser === "all" || event.userEmail === selectedUser;

      return matchesSearch && matchesMethod && matchesUser;
    });
  }, [events, searchQuery, selectedMethod, selectedUser]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Monitoring</h1>
        <p className="text-muted-foreground mt-1">
          Real-time access events and analytics
        </p>
      </div>

      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="feed" className="gap-2">
            <Activity className="w-4 h-4" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <EventSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <EventFilters
              events={events}
              selectedMethod={selectedMethod}
              selectedUser={selectedUser}
              onMethodChange={setSelectedMethod}
              onUserChange={setSelectedUser}
            />
          </div>
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Live Activity Feed
              </CardTitle>
              <CardDescription>
                {filteredEvents.length} events{" "}
                {searchQuery ||
                selectedMethod !== "all" ||
                selectedUser !== "all"
                  ? "(filtered)"
                  : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed events={filteredEvents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Analytics Charts
              </CardTitle>
              <CardDescription>
                Visual breakdown of access patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts events={events} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Advanced Analytics</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Deep-dive trends, user breakdowns, and peak-hour analysis
            </p>
          </div>
          <AdvancedAnalytics events={events} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
