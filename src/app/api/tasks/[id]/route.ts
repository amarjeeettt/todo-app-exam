import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Task } from "@prisma/client";
import { getUserIDFromToken } from "@/utils/auth";
import { AuthenticationError, InvalidTokenError } from "@/utils/errors";

type TaskUpdateData = Partial<
  Pick<Task, "title" | "remindOn" | "isImportant" | "isCompleted">
>;

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userID = await getUserIDFromToken();
    const { title, remindOn, isImportant, isCompleted } = await req.json();

    const updateData: TaskUpdateData = {};

    if (title) updateData.title = title;
    if (remindOn) updateData.remindOn = new Date(remindOn);
    if (isImportant !== undefined) updateData.isImportant = isImportant;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const updatedTask = await prisma.task.updateMany({
      where: { id: Number(params.id), userID },
      data: updateData,
    });

    if (updatedTask.count === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTask);
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userID = await getUserIDFromToken();

    const deletedTask = await prisma.task.deleteMany({
      where: { id: Number(params.id), userID },
    });

    if (deletedTask.count === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
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
