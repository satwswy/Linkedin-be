import express from "express";
import UsersModel from "./model.js";
import ExperiencesModel from "./exp.js";
import createHttpError from "http-errors";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream"
import {v2 as cloudinary } from "cloudinary"
import {CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer";
import json2csv from "json2csv"



const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, 
    params: {
      folder: "linkedin/users",
    },
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("avatar");

const cloudinaryExpUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, 
    params: {
      folder: "linkedin/experience",
    },
  }),
  limits: { fileSize: 1024 * 1024 },
}).single("experience");

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    newUser.image = process.env.defaultPicture;
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find().populate({ path: "experiences" });
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId).populate({
      path: "experiences",
    });
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/:userId/experiences", async (req, res, next) => {
  try {
    const newExperience = new ExperiencesModel(req.body);
    const { _id } = await newExperience.save();
    const user = await UsersModel.findById(req.params.userId);
    user.experiences.push(_id);
    await user.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId).populate({
      path: "experiences",
    });
    if (user) {
      res.send(user.experiences);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get(
  "/:usersId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.usersId).populate({
        path: "experiences",
      });
      if (user) {
        const experience = user.experiences.find(
          (current) => req.params.experienceId === current._id.toString()
        );
        if (experience) {
          res.send(experience);
        } else {
          next(
            createHttpError(
              404,
              `Experience with id ${req.params.experienceId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(404, `User with id ${req.params.usersId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.put(
  "/:userId/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId).populate({
        path: "experiences",
      });

      if (user) {
        const experience = await ExperiencesModel.findByIdAndUpdate(
          req.params.experienceId,
          req.body,
          { new: true, runValidators: true }
        );

        if (experience) {
          await user.save();
          res.send(experience);
        } else {
          next(
            createHttpError(
              404,
              `Experience with id ${req.params.experienceId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete("/:userId/experiences/:experienceId", async (req, res, next)=>{
try {
  const user = await UsersModel.findById(req.params.userId).populate({
    path: "experiences",
  });

  if (user) {
    const experience = await ExperiencesModel.findByIdAndDelete( req.params.experienceId );

    if (experience) {
      await user.save();
      res.send();
    } else {
      next(
        createHttpError(
          404,
          `Experience with id ${req.params.experienceId} not found!`
        )
      );
    }
  } else {
    next(
      createHttpError(404, `User with id ${req.params.userId} not found!`)
    );
  }
} catch (error) {
  next(error);
}
})


usersRouter.get("/:userId/download/PDF", async (req, res, next) => {
  try {
    const userId = req.params.userId
    console.log("userId:",userId)
    const users = await UsersModel.find().populate({ path: "experiences" });
    console.log("users:",users)
    const foundUser = users.find(user => user._id.toString() === userId)
    res.setHeader("Content-Disposition", "attachment; filename=users.pdf")
    console.log("foundUser:",foundUser)
    const source = await getPDFReadableStream(foundUser)
    const destination = res
    pipeline(source, destination, err => {
      if (err) console.log(err)
    })
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/:userId/cloudinary", cloudinaryUploader, async (req,res,next)=>{
  try {
    
// console.log("REQ FILE: ", req.file)
// console.log("Link:", req.file.path )

const user = await UsersModel.findById(req.params.userId)
if (user) {
  user.image = req.file.path; 
// console.log(user)
  user.save()
 
} else {
  next(
    createHttpError(404, `User with id ${req.params.userId} not found!`)
  );
}
// 1. upload on Cloudinary happens automatically
    // 2. req.file contains the path which is the url where to find that picture
    // 3. update the resource by adding the path to it
res.send()

  } catch (error) {
    next(error)
  }
} )

usersRouter.post("/experiences/:experienceId/cloudinary", cloudinaryExpUploader, async (req,res,next)=>{
  try {
    
// console.log("REQ FILE: ", req.file)
// console.log("Link:", req.file.path )

const experience = await ExperiencesModel.findById(req.params.experienceId)
if (experience) {
  experience.image = req.file.path; 
// console.log(user)
experience.save()
 
} else {
  next(
    createHttpError(404, `Experience with id ${req.params.experienceId} not found!`)
  );
}
// 1. upload on Cloudinary happens automatically
    // 2. req.file contains the path which is the url where to find that picture
    // 3. update the resource by adding the path to it
res.send()

  } catch (error) {
    next(error)
  }
} )

usersRouter.get("/:userId/CSV", async (req, res, next) => {
  try {

    const user = await UsersModel.findById(req.params.userId).populate({
      path: "experiences",
    });
    if (user) {
        
    res.setHeader("Content-Disposition", "attachment; filename=usersexperiences.csv") 
    const source = JSON.stringify(user.experiences)
    const destination = res
    const transform = new json2csv.Transform({ fields: ["role", "company", "description"] })

    pipeline(source, transform, destination, err => {
      if (err) console.log(err)
    })
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error)
  }
})

export default usersRouter;