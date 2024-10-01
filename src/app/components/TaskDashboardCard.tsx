import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
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
    <>
      <div className="w-full h-full flex justify-between items-stretch gap-4">
        {isLoading ? (
          <>
            <TaskStatisticsSkeleton />
            <TaskStatisticsSkeleton />
            <TaskStatisticsSkeleton />
          </>
        ) : (
          <>
            <TaskSection
              number={taskStats.toDoTasks}
              title="To do"
              subtitle="tasks"
            />
            <TaskSection
              number={taskStats.completedTasks}
              title="Completed"
              subtitle="tasks"
            />
            <TaskSection
              number={taskStats.importantTasks}
              title="Important"
              subtitle="tasks"
            />
          </>
        )}
      </div>
    </>
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
    <Card className="flex-1 p-4">
      <div className="flex flex-col items-center">
        <motion.h2
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {number}
        </motion.h2>
        <Separator className="w-1/2 my-2" />
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h3 className="text-md text-textPrimary font-semibold">{title}</h3>
          <p className="text-xs sm:text-sm text-textSecondary">{subtitle}</p>
        </motion.div>
      </div>
    </Card>
  );
}
