import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTasks } from "@/contexts/TaskContext";
import TaskProgressSkeleton from "./skeleton/TaskProgressSkeleton";

export default function ProgressCard() {
  const { tasks, isLoading } = useTasks();

  const { totalTasks, completedTasks, progress } = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.isCompleted).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    return { totalTasks, completedTasks, progress };
  }, [tasks]);

  const progressMessages = [
    { title: "Keep going!", message: "You're just getting started." },
    { title: "Great Job!", message: "You're making progress." },
    { title: "Almost halfway there!", message: "Keep it up." },
    { title: "You're so close!", message: "Just a little more to go!" },
    { title: "Hurrah!", message: "You did it!" },
  ];

  const messageIndex = Math.min(
    Math.floor(progress / 25),
    progressMessages.length - 1
  );

  const { title, message } = progressMessages[messageIndex];

  return (
    <>
      <Card className="w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6"
        >
          {isLoading ? (
            <TaskProgressSkeleton />
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    {title}
                  </h2>
                  <p className="text-sm text-textPrimary mb-4">{message}</p>
                </div>
                <Image
                  src="/images/hourglass.png"
                  alt="Hourglass"
                  width={50}
                  height={50}
                />
              </div>
              <Progress
                className="[&>*]:bg-secondary"
                value={progress}
                max={100}
              />
              <p className="text-xs text-textSecondary mt-2">
                {completedTasks} out of {totalTasks}{" "}
                {totalTasks <= 1 ? "task" : "tasks"} are completed
              </p>
            </>
          )}
        </motion.div>
      </Card>
    </>
  );
}
