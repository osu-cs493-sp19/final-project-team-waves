const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, getTokenData, requireAuthentication } = require('../lib/auth');
const { getBusinessesByOwnerId } = require('../models/business');
const { getReviewsByUserId } = require('../models/review');
const { getPhotosByUserId } = require('../models/photo');
const { 
  UserSchema, 
  insertNewUser,
  getUserById,
  getUserByEmail,
  validateUser
} = require('../models/user');

/*
 * Route to list all of a user's businesses.
 */
router.get('/:id/businesses', requireAuthentication, async (req, res, next) => {
  if (parseInt(req.params.id) === req.userId || req.userIsAdmin) {
    try {
      const businesses = await getBusinessesByOwnerId(parseInt(req.params.id));
      if (businesses) {
        res.status(200).send({ businesses: businesses });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch businesses.  Please try again later."
      });
    }
  }

  else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:id/reviews', requireAuthentication, async (req, res, next) => {
  if (parseInt(req.params.id) === req.userId || req.userIsAdmin) {
    try {
      const reviews = await getReviewsByUserId(parseInt(req.params.id));
      if (reviews) {
        res.status(200).send({ reviews: reviews });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch reviews.  Please try again later."
      });
    }
  }

  else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:id/photos', requireAuthentication, async (req, res, next) => {
  if (parseInt(req.params.id) === req.userId || req.userIsAdmin) {
    try {
      const photos = await getPhotosByUserId(parseInt(req.params.id));
      if (photos) {
        res.status(200).send({ photos: photos });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch photos.  Please try again later."
      });
    }
  }

  else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Get user information
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {
  if (parseInt(req.params.id) === req.userId || req.userIsAdmin) {
    try {
      const user = await getUserById(req.params.id, false);

      if (user)
        res.status(200).send(user);

      else
        next();
    }

    catch (err) {
      console.error(" -- Error:", err);

      res.status(500).send({
        error: "Error fetching user.  Try again later"
      });
    }
  }

  else {
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
});

/*
 * Route to create new users
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      if (req.body.admin) {
        const data = await getTokenData(req);

        if (!data || !data.userIsAdmin) {
          res.status(403).send({
            error: "Unauthorized to create admin user"
          });

          return;
        }
      }

      const id = await insertNewUser(req.body);

      res.status(201).send({
        id: id
      });
    }

    catch (err) {
      console.error(" -- Error:", err);
      
      res.status(500).send({
        error: "Error inserting new user. Try again later"
      });
    }
  }

  else {
    res.status(400).send({
      error: "Request body is not a valid user object"
    });
  }
});

/*
 * Route to log user in and return a JWT
 */
router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.email, req.body.password);

      if (authenticated) {
        const user = await getUserByEmail(req.body.email, false);
        const token = generateAuthToken(user.id);

        res.status(200).send({
          token: token
        });
      }

      else {
        res.status(401).send({
          error: "Invalid credentials"
        });
      }
    }

    catch (err) {
      console.error(err);

      res.status(500).send({
        error: "Error validating user. Try again later"
      });
    }
  }

  else {
    res.status(400).send({
      error: "Request body was invalid"
    });
  }
});

module.exports = router;
