import React, { useEffect, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useTasks } from "@/contexts/TaskContext";
import TaskStatisticsSkeleton from "./skeleton/TaskStatisticsSkeleton";

export default function TaskDashboardCard() {
  const { tasks, isLoading, fetchTasks } = useTasks();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const taskStats = useMemo(() => {
    const toDoTasks = tasks.filter((task) => !task.isCompleted).length;
    const completedTasks = tasks.filter((task) => task.isCompleted).length;
    const importantTasks = tasks.filter((task) => task.isImportant).length;

    return { toDoTasks, completedTasks, importantTasks };
  }, [tasks]);

  return (
    <Card className="w-full h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-stretch text-center gap-4">
          {isLoading ? (
            <>
              <TaskStatisticsSkeleton />
              <Separator orientation="vertical" decorative />
              <TaskStatisticsSkeleton />
              <Separator orientation="vertical" decorative />
              <TaskStatisticsSkeleton />
            </>
          ) : (
            <>
              <TaskSection
                number={taskStats.toDoTasks}
                title="To do"
                subtitle="tasks"
              />
              <Separator orientation="vertical" decorative />
              <TaskSection
                number={taskStats.completedTasks}
                title="Completed"
                subtitle="tasks"
              />
              <Separator orientation="vertical" decorative />
              <TaskSection
                number={taskStats.importantTasks}
                title="Important"
                subtitle="tasks"
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskSection({
  number,
  title,
  subtitle,
}: {
  number: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-textPrimary font-bold mb-1">
        {number}
      </h2>
      <Separator className="my-1" decorative />
      <div className="mt-1">
        <h3 className="text-sm sm:text-base text-textPrimary font-semibold">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-textSecondary">{subtitle}</p>
      </div>
    </div>
  );
}
