import { Creation, CreationDocument } from "../models/Creation";
import { User, UserDocument } from "../models/User";
import { CollectionEvent, CollectionEventDocument } from "../models/CollectionEvent";
import { Reaction, ReactionDocument } from "../models/Reaction";
import { FastifyRequest, FastifyReply } from "fastify";


interface GetCreationsRequest {
  body: {
    username: string;
    generators: string[];
    collectionId: string;
    earliestTime: any;
    latestTime: any;
    limit: number;
  }
}

export const getCreations = async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, generators, collectionId, earliestTime, latestTime, limit } = request.body as GetCreationsRequest["body"];

  let user: UserDocument | null = null;

  let filter = {};

  if (username) {
    try {
      user = await User.findOne({username: username});
      if (!user) {
        return reply.status(200).send({creations: []});
      }  
    } catch (error) {
      return reply.status(404).send({
        message: 'User not found'
      });
    }
    Object.assign(filter, user ? { user: user._id } : {});
  }

  let collectionCreationIds = null;
  if (collectionId) {
    let collectionEvents: CollectionEventDocument[] = [];
    collectionEvents = await CollectionEvent.find({
      collectionId: collectionId
    });
    collectionCreationIds = collectionEvents.map(collectionEvent => collectionEvent.creation);
    Object.assign(filter, { creationId: {$in: collectionCreationIds} });
  }

  if (earliestTime || latestTime) {
    Object.assign(filter, {
      createdAt: {
        ...(earliestTime ? { $gte: earliestTime } : {}),
        ...(latestTime ? { $lte: latestTime } : {}),
      },
    });
  }

  let creations: CreationDocument[] = [];

  creations = await Creation.find(filter)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate({
      path: 'task',
      select: 'config status generator',
      populate: {
        path: 'generator',
        select: 'generatorName',
      }
    }
  );

  if (generators && generators.length > 0) {
    creations = creations.filter(creation => {
      creation.task.generator && creation.task.generator.generatorName &&
      generators.includes(creation.task.generator.generatorName)
    });
  }

  return reply.status(200).send({
    creations,
  });
};

interface GetCreationParams {
  creationId: string;
}

export const getCreation = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;
  
  let creation: CreationDocument | null = null;

  try {
    creation = await Creation.findById(creationId).populate({ 
      path: 'task',
      select: 'config status'
    });
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  return reply.status(200).send({
    creation,
  });
};

export const getCollections = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;

  let collections: CollectionEventDocument[] = [];
  try {
    collections = await CollectionEvent.find({
      creation: creationId,
    }).populate({ 
      path: 'collectionId',
      select: 'name user createdAt'
    });
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  return reply.status(200).send({
    collections,
  });
};

export const getRecreations = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;

  let creations: CreationDocument[] = [];

  try {
    creations = await Creation.find({
      parent: creationId,
    }).populate({
      path: 'task',
      select: 'config status generator',
      populate: {
        path: 'generator',
        select: 'generatorName'
      }
    });
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }
  
  return reply.status(200).send({
    creations,
  });
};

export const getReactions = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;

  let reactions: ReactionDocument[] = [];

  try {
    reactions = await Reaction.find({
      creation: creationId,
    }).populate({
      path: 'user',
      select: 'username'
    });
  }
  catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  return reply.status(200).send({
    reactions,
  });
};

export const react = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;
  const { reaction } = request.body as { reaction: string };
  const userId = request.user.userId;

  let creation: CreationDocument | null = null;

  try {
    creation = await Creation.findById(creationId);
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  if (!creation) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  const reactionData = {
    creation: creationId,
    user: userId,
    reaction: reaction,
  }

  // check if user has already reacted
  const existingReaction = await Reaction.findOne(reactionData);

  if (existingReaction) {
    return reply.status(200).send({
      success: true
    });
  }
  

  try {         
    const newReaction = new Reaction(reactionData);
    await newReaction.save();
    return reply.status(200).send({
      success: true,
    });  
  } catch (error) {
    return reply.status(404).send({
      message: 'Reaction not found'
    });
  }

};