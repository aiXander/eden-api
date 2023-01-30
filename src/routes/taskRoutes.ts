import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";

import { isAdmin, isAuth } from "../middleware/authMiddleware";

import { 
  fetchTask,
  fetchTasks, 
  receiveTaskUpdate 
} from "../controllers/taskController";


const taskRoutes: FastifyPluginAsync = async (server) => {

  server.get('/task/:taskId', {
    schema: {
      response: {
        200: Type.Object({
          task: Type.Any(),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => fetchTask(request, reply),
  });

  server.post('/tasks/fetch', {
    schema: {
      request: {
        userId: Type.String(),
        status: Type.String(),
        taskIds: Type.Array(Type.String()),
      },
      response: {
        200: Type.Object({
          tasks: Type.Array(Type.Any()),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => fetchTasks(request, reply),
  });

  server.post('/tasks/update', {
    handler: (request, reply) => receiveTaskUpdate(server, request, reply),
  });

}

export default taskRoutes;