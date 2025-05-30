import { Request, Response } from "express";
import Testcase from "../models/testcase.model.js";
import Problem from "../models/problem.model.js";
import { throwIf, sendSuccess } from "../utils/helper.js";
import { ApiError } from "../utils/ApiError.js";

// Add new testcase (Admin only)
export const addTestcase = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    const { input, output, isSample } = req.body;
    throwIf(!input || !output, 400, "Input and output are required");
    const problem = await Problem.findByPk(problemId);
    throwIf(!problem, 404, "Problem not found");
    const testcase = await Testcase.create({
      problemId,
      input,
      output,
      isSample: !!isSample,
    });
    return sendSuccess(res, 201, "Testcase created", testcase);
  } catch (err) {
    throw new ApiError(500, "Failed to create testcase");
  }
};

// List all testcases for a problem (Admin only)
export const listTestcases = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    const testcases = await Testcase.findAll({ where: { problemId } });
    return sendSuccess(res, 200, "Testcases fetched", testcases);
  } catch (err) {
    throw new ApiError(500, "Failed to fetch testcases");
  }
};

// Get only sample testcases (public)
export const listSampleTestcases = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    const testcases = await Testcase.findAll({
      where: { problemId, isSample: true },
    });
    return sendSuccess(res, 200, "Sample testcases fetched", testcases);
  } catch (err) {
    throw new ApiError(500, "Failed to fetch sample testcases");
  }
};

// Update testcase (Admin only)
export const updateTestcase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { input, output, isSample } = req.body;
    const testcase = await Testcase.findByPk(id);
    throwIf(!testcase, 404, "Testcase not found");
    if (testcase) {
      await testcase.update({
        input: input ?? testcase.input,
        output: output ?? testcase.output,
        isSample: typeof isSample === "boolean" ? isSample : testcase.isSample,
      });
      return sendSuccess(res, 200, "Testcase updated", testcase);
    }
  } catch (err) {
    throw new ApiError(500, "Failed to update testcase");
  }
};

// Delete testcase (Admin only)
export const deleteTestcase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testcase = await Testcase.findByPk(id);
    throwIf(!testcase, 404, "Testcase not found");
    if (testcase) {
      await testcase.destroy();
      return sendSuccess(res, 200, "Testcase deleted");
    }
  } catch (err) {
    throw new ApiError(500, "Failed to delete testcase");
  }
};
