const express = require("express");

const interviewRouter = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middleware/file.middleware");

/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description, resume pdf and job description.
 * @acces private
 */
interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);

/**
 * @route GET /api/interview/:interviewId
 * @description get interview report by interviewId
 * @acces private
 */
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController,
);

/**
 * @route GET /api/interview
 * @description get all interview reports of the logged in user
 * @acces private
 */
interviewRouter.get(
  "/",
  authMiddleware.authUser,
  interviewController.getAllInterviewReportsController,
);

module.exports = interviewRouter;
