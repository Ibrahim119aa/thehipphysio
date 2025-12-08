'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, User, ShieldAlert, UserX, Activity } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStore, UserWithAnalytics } from '@/stores/useDashboardStore';


export default function DashboardPage() {
  const { analytics, loading, fetchAnalytics } = useDashboardStore();

  useEffect(() => {
    if (!analytics) fetchAnalytics();
  }, [analytics, fetchAnalytics]);

  if (loading || !analytics) return <DashboardSkeleton />;

  const { kpi, charts, tables, meta } = analytics;
  const windowDays = meta?.windowDays ?? 7;

  const kpiData = [
    { title: "Total Users", value: kpi.totalUsers, change: "+12%", icon: Users },
    { title: "Active Users (Week)", value: kpi.activeUsers, change: "+5%", icon: User },
    { title: "Highest Irritability", value: kpi.highestIrritability.value, change: kpi.highestIrritability.user, icon: ShieldAlert },
    { title: "Lowest Resilience", value: kpi.lowestResilience.value, change: kpi.lowestResilience.user, icon: Activity },
    // show missed days explicitly
    { title: "Least Compliant", value: `${kpi.leastCompliant.value} days`, change: kpi.leastCompliant.user, icon: UserX },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {kpiData.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#73B7BC" strokeWidth={2} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Completion (last {windowDays} days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.sessionCompletion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#73B7BC" name="Completed" />
                <Bar dataKey="missed" stackId="a" fill="#F87171" name="Missed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Least Compliant Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Missed (last {windowDays})</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.leastCompliantUsers.map((u: UserWithAnalytics) => (
                  <TableRow key={u._id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.plan}</TableCell>
                    <TableCell className="text-right text-red-500 font-bold">
                      {u.analytics?.missedDays ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Users by Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Engagement Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.topUsersByEngagement.map((u: UserWithAnalytics) => (
                  <TableRow key={u._id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.plan}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-bold">
                      {u.analytics.engagementScore ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  </div>
);
