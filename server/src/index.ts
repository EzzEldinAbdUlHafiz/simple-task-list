import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parseDueDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateTaskInput(body: any) {
  const title = String(body.title ?? "").trim();
  const notes = String(body.notes ?? "");
  const dueDate = body.dueDate ?? null;

  if (!title) {
    return { error: "Title is required" };
  }

  if (title.length > 120) {
    return { error: "Title must be 120 characters or fewer" };
  }

  if (notes.length > 1000) {
    return { error: "Notes must be 1000 characters or fewer" };
  }

  if (dueDate && !parseDueDate(dueDate)) {
    return { error: "Due date is invalid" };
  }

  return {
    data: {
      title,
      notes,
      dueDate: dueDate ? parseDueDate(dueDate) : null,
    },
  };
}

app.get("/tasks", async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { updatedAt: "desc" },
      ],
    });

    res.json(tasks);
  } catch (error) {
    console.error("GET /tasks failed:", error);
    res.status(500).json({ error: "Failed to load tasks" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const result = validateTaskInput(req.body);

    if ("error" in result) {
      return res.status(400).json({ error: result.error });
    }

    const task = await prisma.task.create({
      data: result.data,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("POST /tasks failed:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const result = validateTaskInput(req.body);

    if ("error" in result) {
      return res.status(400).json({ error: result.error });
    }

    const status =
      req.body.status === "COMPLETED" ? "COMPLETED" : "ACTIVE";

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...result.data,
        status,
      },
    });

    res.json(task);
  } catch (error) {
    console.error("PUT /tasks/:id failed:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.patch("/tasks/:id/complete", async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: "COMPLETED" },
    });

    res.json(task);
  } catch (error) {
    console.error("PATCH /tasks/:id/complete failed:", error);
    res.status(500).json({ error: "Failed to complete task" });
  }
});

app.patch("/tasks/:id/reopen", async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE" },
    });

    res.json(task);
  } catch (error) {
    console.error("PATCH /tasks/:id/reopen failed:", error);
    res.status(500).json({ error: "Failed to reopen task" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("DELETE /tasks/:id failed:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});