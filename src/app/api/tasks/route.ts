import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIDFromToken } from "@/utils/auth";
import { AuthenticationError, InvalidTokenError } from "@/utils/errors";

export async function GET() {
  try {
    const userID = await getUserIDFromToken();
    const tasks = await prisma.task.findMany({
      where: { userID },
    });

    const formattedTasks = tasks.map((task) => ({
      ...task,
      remindOn: task.remindOn ? new Date(task.remindOn).toLocaleString() : null,
    }));
    return NextResponse.json(formattedTasks, { status: 200 });
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof InvalidTokenError
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the task" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userID = await getUserIDFromToken();
    const { title, createdAt, remindOn, isImportant, isCompleted } =
      await req.json();

    const newTask = await prisma.task.create({
      data: {
        title,
        createdAt: new Date(createdAt).toISOString(),
        remindOn: remindOn ? new Date(remindOn).toISOString() : null,
        isImportant,
        isCompleted,
        user: {
          connect: { id: userID },
        },
      },
    });
    console.log(newTask.remindOn);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof InvalidTokenError
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the task" },
      { status: 500 }
    );
  }
}
