/*
 * API routes for 'users' collection.
 */

const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { UserSchema, insertNewUser, getUserById, validateUser, getCoursesByInstructorId, getCoursesByStudentId } = require('../models/user');

//add new user
//only someone with admin auth can create admin or instructor
router.post('/', requireAuthentication, async (req, res) => {
  console.log("post /users : add new user")

  console.log("role of auth'd user making request: req.role = ", req.role)
  console.log("role of user we're adding: req.params.role = ", req.body.role)

  //admins can create admin / student / instructor users
  //instructors can create admin / student / instructor users (yaml doesnt specify)
  //students can only create students

  if (validateAgainstSchema(req.body, UserSchema)) {

    //if non-admin is trying to create admin OR student is trying to create instructor
    if((req.role != "admin" && req.body.role == "admin") || (req.role == "student" && req.body.role == "instructor")){
      //error
      console.log("adding person err")
      res.status(403).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
      });

    }else{
      //all good
      console.log("all good, continue")
    }



    try {
      const id = await insertNewUser(req.body);
      res.status(201).send({
        _id: id
      });
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error inserting new user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body does not contain a valid User."
    });
  }
});

//debug route to add initial admin
router.post('/debugAdd', async (req, res) => {

  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      const id = await insertNewUser(req.body);
      res.status(201).send({
        _id: id
      });
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error inserting new user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body does not contain a valid User."
    });
  }
});

router.post('/login', async (req, res) => {
  //if (req.body && req.body.id && req.body.password) {
  if (req.body && req.body.email && req.body.password) {
    try {
      //const authenticated = await validateUser(req.body.id, req.body.password);
      const authenticated = await validateUser(req.body.email, req.body.password);
      if (authenticated) {
        //const token = generateAuthToken(req.body.id);
        const token = generateAuthToken(req.body.email);
        res.status(200).send({
          token: token
        });
      } else {
        res.status(401).send({
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      res.status(500).send({
        error: "Error validating user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body was invalid"
    });
  }
});

router.get('/:id', requireAuthentication, async (req, res, next) => {
  console.log("req.email = ", req.email)
/*
  console.log("req.params.id = ", req.params.id)
  console.log(typeof req.params.id)
  console.log("req.userId    = ", req.userId)
  console.log(typeof req.userId)
  userIdString = String(req.userId)
  console.log("userIdString = ", userIdString)
  console.log(typeof userIdString)
*/
  //if request id is same of user making request
  //if (req.params.id === req.userId) {
  if(req.params.id == String(req.userId)){

    console.log("role of auth'd user making request: req.role = ", req.role)
    //if req.role =="instructor", include list of all id's of courses where instructorId == req.params.id
    //if req.role =="student", include list of all ids of courses where student is enrolled in

    try {
      //getUserByEmail(req.email, false)
      const user = await getUserById(req.params.id, false);
      console.log("user = ", user)

      if (user) {

        if(req.role == "instructor"){
          //const instructorCourses = await getCoursesByInstructorId(req.params.id);
          const instructorCourses = "tempinstructorCourses";
          res.status(200).send({
            user: user,
            courses: instructorCourses
          });

        }else if(req.role == "student"){
          //const studentCourses = await getCoursesByStudentId(req.params.id);
          const studentCourses = "tempStudentCourses";
          res.status(200).send({
            user: user,
            courses: studentCourses
          });
        }else{
          //res.status(200).send(user);
          res.status(200).send({
            user: user
          });
        }

      } else {
        next();
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
  } else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});


module.exports = router;
