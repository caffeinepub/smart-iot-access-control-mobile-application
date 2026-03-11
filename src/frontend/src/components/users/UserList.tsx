import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import type { AccessEvent } from "@/types/accessEvent";
import { computeUserActivityMetrics } from "@/utils/userActivityUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Trash2, UserCheck, UserX } from "lucide-react";
import React, { useState } from "react";
import AccessWindowModal from "./AccessWindowModal";

function useGetUsers() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

function useGetAccessEvents() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<AccessEvent[]>({
    queryKey: ["accessEvents"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // Return events with bigint timestamps as-is to match AccessEvent type
      const events = await actor.getAccessEvents();
      return events as AccessEvent[];
    },
    enabled: !!actor && !actorFetching,
  });
}

function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export default function UserList() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useGetUsers();
  const { data: accessEvents } = useGetAccessEvents();
  const { data: role } = useGetCallerUserRole();
  const isAdmin = role === "admin";

  const [accessWindowUser, setAccessWindowUser] = useState<{
    uid: string;
    name: string;
  } | null>(null);

  const activityMap = React.useMemo(() => {
    if (!accessEvents) return new Map();
    return computeUserActivityMetrics(accessEvents);
  }, [accessEvents]);

  const removeMutation = useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeUser(uid);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const disableMutation = useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.disableUser(uid);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const enableMutation = useMutation({
    mutationFn: async (uid: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.enableUser(uid);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable list
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No users registered yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground text-xs">
                Name
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Email
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Role
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                Activity
              </TableHead>
              {isAdmin && (
                <TableHead className="text-muted-foreground text-xs">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const activity =
                activityMap.get(user.rfidUid) || activityMap.get(user.email);
              const successRate = activity
                ? Math.round(activity.successRate * 100)
                : null;
              const successColor =
                successRate === null
                  ? ""
                  : successRate >= 90
                    ? "text-green-400"
                    : successRate >= 70
                      ? "text-yellow-400"
                      : "text-red-400";

              return (
                <TableRow
                  key={user.rfidUid}
                  className="border-border hover:bg-muted/20"
                >
                  <TableCell className="text-sm font-medium text-foreground">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "admin"
                          ? "default"
                          : user.role === "guest"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {user.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activity ? (
                      <div className="text-xs space-y-0.5">
                        <div className="text-muted-foreground">
                          {activity.accessCount} accesses
                        </div>
                        {successRate !== null && (
                          <div className={`font-mono ${successColor}`}>
                            {successRate}% success
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No activity
                      </span>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setAccessWindowUser({
                              uid: user.rfidUid,
                              name: user.name,
                            })
                          }
                          className="h-7 px-2 text-xs flex items-center gap-1"
                          title="Set access window"
                        >
                          <Clock className="w-3 h-3" />
                          Schedule
                        </Button>
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => disableMutation.mutate(user.rfidUid)}
                            disabled={disableMutation.isPending}
                            className="h-7 px-2 text-xs"
                          >
                            <UserX className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => enableMutation.mutate(user.rfidUid)}
                            disabled={enableMutation.isPending}
                            className="h-7 px-2 text-xs"
                          >
                            <UserCheck className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMutation.mutate(user.rfidUid)}
                          disabled={removeMutation.isPending}
                          className="h-7 px-2 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {accessWindowUser && (
        <AccessWindowModal
          open={!!accessWindowUser}
          onClose={() => setAccessWindowUser(null)}
          uid={accessWindowUser.uid}
          userName={accessWindowUser.name}
        />
      )}
    </>
  );
}
