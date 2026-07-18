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

module.exports = interviewRouter;
