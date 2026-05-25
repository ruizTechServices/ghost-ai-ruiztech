import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type TaskRunRow = Database["public"]["Tables"]["task_runs"]["Row"];
type TaskRunInsert = Database["public"]["Tables"]["task_runs"]["Insert"];

type TaskRunType = "design_generation" | "spec_generation";

const TASK_TYPE_DESIGN_GENERATION = "design_generation" satisfies TaskRunType;
const TASK_TYPE_SPEC_GENERATION = "spec_generation" satisfies TaskRunType;

const taskRunSelect =
  "id, run_id, project_id, user_id, task_type, created_at";

interface CreateTaskRunInput {
  projectId: string;
  runId: string;
  taskType: TaskRunType;
  userId: string;
}

interface GetTaskRunForUserInput {
  runId: string;
  userId: string;
}

const createTaskRun = async ({
  projectId,
  runId,
  taskType,
  userId,
}: CreateTaskRunInput): Promise<TaskRunRow> => {
  const supabase = createSupabaseAdminClient();
  const insert: TaskRunInsert = {
    project_id: projectId,
    run_id: runId,
    task_type: taskType,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("task_runs")
    .insert(insert)
    .select(taskRunSelect)
    .single();

  if (error) throw error;

  return data;
};

const getTaskRunByRunId = async (
  runId: string,
): Promise<TaskRunRow | null> => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("task_runs")
    .select(taskRunSelect)
    .eq("run_id", runId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

const getTaskRunForUser = async ({
  runId,
  userId,
}: GetTaskRunForUserInput): Promise<TaskRunRow | null> => {
  const taskRun = await getTaskRunByRunId(runId);

  if (!taskRun || taskRun.user_id !== userId) {
    return null;
  }

  return taskRun;
};

export {
  createTaskRun,
  getTaskRunByRunId,
  getTaskRunForUser,
  TASK_TYPE_DESIGN_GENERATION,
  TASK_TYPE_SPEC_GENERATION,
};
export type { TaskRunRow, TaskRunType };
