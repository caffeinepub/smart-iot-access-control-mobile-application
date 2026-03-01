import { useState, useMemo } from 'react';
import { useGetAccessEvents } from '../hooks/useQueries';
import ReportTable from '../components/reports/ReportTable';
import { groupEventsByWeek, groupEventsByMonth } from '../utils/reportUtils';
import { exportReportToCsv } from '../utils/csvExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Calendar, CalendarDays, FileSpreadsheet } from 'lucide-react';

export default function Reports() {
  const { data: events = [], isLoading } = useGetAccessEvents();
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');

  const rows = useMemo(() => {
    return view === 'weekly' ? groupEventsByWeek(events) : groupEventsByMonth(events);
  }, [events, view]);

  const handleExportPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportReportToCsv(rows, view === 'weekly' ? 'Week' : 'Month');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totalSuccess = rows.reduce((s, r) => s + r.successCount, 0);
  const totalFailed = rows.reduce((s, r) => s + r.failureCount, 0);
  const totalEvents = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent" />
            Access Reports
          </h1>
          <p className="text-muted-foreground mt-1">Grouped access event summaries</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button onClick={handleExportCsv} variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPdf} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 no-print">
        <Card className="border-accent/20 text-center">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold font-mono">{totalEvents}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Events</p>
          </CardContent>
        </Card>
        <Card className="border-success/20 text-center">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold font-mono text-success">{totalSuccess}</p>
            <p className="text-xs text-muted-foreground mt-1">Successful</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 text-center">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold font-mono text-destructive">{totalFailed}</p>
            <p className="text-xs text-muted-foreground mt-1">Failed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {view === 'weekly' ? <CalendarDays className="w-5 h-5 text-accent" /> : <Calendar className="w-5 h-5 text-accent" />}
                {view === 'weekly' ? 'Weekly' : 'Monthly'} Report
              </CardTitle>
              <CardDescription>Access events grouped by {view === 'weekly' ? 'week' : 'month'} and user</CardDescription>
            </div>
            <div className="flex gap-2 no-print">
              <Button
                size="sm"
                variant={view === 'weekly' ? 'default' : 'outline'}
                onClick={() => setView('weekly')}
                className={view === 'weekly' ? 'bg-accent text-accent-foreground' : ''}
              >
                Weekly
              </Button>
              <Button
                size="sm"
                variant={view === 'monthly' ? 'default' : 'outline'}
                onClick={() => setView('monthly')}
                className={view === 'monthly' ? 'bg-accent text-accent-foreground' : ''}
              >
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ReportTable rows={rows} periodLabel={view === 'weekly' ? 'Week' : 'Month'} />
        </CardContent>
      </Card>
    </div>
  );
}
