import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Task } from "@prisma/client";
import { getUserIDFromToken } from "@/utils/auth";
import { AuthenticationError, InvalidTokenError } from "@/utils/errors";

// Type definition for updating task properties
type TaskUpdateData = Partial<
  Pick<Task, "title" | "remindOn" | "isImportant" | "isCompleted">
>;

// Handles PUT requests to update a task
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userID = await getUserIDFromToken();

    const { title, remindOn, isImportant, isCompleted } = await req.json();

    const updateData: TaskUpdateData = {};

    // Populate updateData with provided fields
    if (title) updateData.title = title;
    if (remindOn) updateData.remindOn = new Date(remindOn);
    if (isImportant !== undefined) updateData.isImportant = isImportant;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    // Update the task in the database
    const updatedTask = await prisma.task.updateMany({
      where: { id: Number(params.id), userID },
      data: updateData,
    });

    // Handle case where no task was found or user is unauthorized
    if (updatedTask.count === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    // Return the updated task
    return NextResponse.json(updatedTask);
  } catch (error) {
    // Handle authentication errors
    if (
      error instanceof AuthenticationError ||
      error instanceof InvalidTokenError
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Log unexpected errors and return a server error response
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the task" },
      { status: 500 }
    );
  }
}

// Handles DELETE requests to remove a task
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userID = await getUserIDFromToken();

    const deletedTask = await prisma.task.deleteMany({
      where: { id: Number(params.id), userID },
    });

    // Handle case where no task was found or user is unauthorized
    if (deletedTask.count === 0) {
      return NextResponse.json(
        { error: "Task not found or unauthorized" },
        { status: 404 }
      );
    }

    // Return success message for deletion
    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Handle authentication errors
    if (
      error instanceof AuthenticationError ||
      error instanceof InvalidTokenError
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Log unexpected errors and return a server error response
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the task" },
      { status: 500 }
    );
  }
}
