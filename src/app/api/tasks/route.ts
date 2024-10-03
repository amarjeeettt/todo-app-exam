import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIDFromToken } from "@/utils/auth";
import { AuthenticationError, InvalidTokenError } from "@/utils/errors";

// GET endpoint to fetch all tasks for a user
export async function GET() {
  try {
    const userID = await getUserIDFromToken();

    const tasks = await prisma.task.findMany({
      where: { userID },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    // Handle authentication errors
    if (
      error instanceof AuthenticationError ||
      error instanceof InvalidTokenError
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Log and return other errors
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching tasks" },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new task
export async function POST(req: Request) {
  try {
    const userID = await getUserIDFromToken();

    const { title, createdAt, remindOn, isImportant, isCompleted } =
      await req.json();

    // Create new task in the database
    const newTask = await prisma.task.create({
      data: {
        title,
        createdAt: new Date(createdAt),
        remindOn: remindOn ? new Date(remindOn) : null,
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
    // Handle authentication errors
    if (
      error instanceof AuthenticationError ||
      error instanceof InvalidTokenError
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Log and return other errors
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the task" },
      { status: 500 }
    );
  }
}
