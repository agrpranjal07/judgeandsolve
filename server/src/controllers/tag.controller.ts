import { Request, Response, NextFunction } from "express";
import Tag from "../models/tag.model.js";
import Problem from "../models/problem.model.js";
import ProblemTag from "../models/problem_tag.model.js";
import { successResponse } from "../utils/ApiResponse.js";
import { throwIf } from "../utils/helper.js";

// Create a new tag
export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    throwIf (!name,400, "Tag name is required");

    const exists = await Tag.findOne({ where: { name } });
    throwIf (exists!==null, 409, "Tag already exists");

    const tag = await Tag.create({ name });
    return successResponse(res, {
      statusCode: 201,
      message: "Tag created",
      data: tag,
    });
  } catch (err) {
    next(err);
  }
};

// Get all tags, or tags for a specific problem if problemId is provided
export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { problemId } = req.params;

    let tags;
    if (problemId) {

      const problemWithTags =  await Problem.findByPk(problemId, {
        include: [
          {
            model: Tag,
            as: "tags",
            through: { attributes: [] },
          },
        ],
      });
      throwIf (!problemWithTags, 404, "Problem not found");

      tags = (problemWithTags as any)?.tags;
      throwIf (!tags || tags.length === 0, 404, "No tags found for this problem");
    } else {
      tags = await Tag.findAll();
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Tags fetched",
      data: tags,
    });
  } catch (err) {
    next(err);
  }
};

// Associate tags to a problem (expects { tagIds: string[] } in body)
export const setTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { problemId } = req.params;
    const { tagIds } = req.body;
    throwIf(!Array.isArray(tagIds) || tagIds.length === 0,400, "tagIds array is required")

    const problem = await Problem.findByPk(problemId);
    throwIf(!problem, 404, "Problem not found");

    const validTags = await Tag.findAll({ where: { id: tagIds } });
    const validIds = validTags.map((t) => t.id);

    // Bulk-create associations, ignore duplicates
    const associations = validIds.map((tagId) => ({ problemId, tagId }));
    await ProblemTag.bulkCreate(associations, { ignoreDuplicates: true });

    return successResponse(res, {
      statusCode: 200,
      message: "Tags associated",
      data: { problemId, tagIds: validIds },
    });
  } catch (err) {
    next(err);
  }
};

// Remove a tag from a problem
export const removeTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { problemId, tagId } = req.params;
    const deleted = await ProblemTag.destroy({ where: { problemId, tagId } });
    throwIf(!deleted, 404, "Tag association not found");

    return successResponse(res, {
      statusCode: 200,
      message: "Tag removed",
      data: { problemId, tagId },
    });
  } catch (err) {
    next(err);
  }
};
