'use strict';
/* Manages creation of new linkedin signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var findOrMakeSign     = require('../sign_creation_handler.js'  ).findOrMakeSign;
var apiBypass          = require('../api_data_requests/bypass_api_req.js');
var LinkedinStrategy   = require('passport-linkedin-oauth2'     ).Strategy;
var LinkedinSign       = require('../../models/LinkedinSign.js' );
var loginSignupHandler = require('../login_signup_handler.js'   );
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new LinkedinStrategy({
    clientID:     process.env.LINKEDIN_ID,
    clientSecret: process.env.LINKEDIN_SECRET,
    callbackURL:  buildCallbackUrl('linkedin') || 'http://127.0.0.1:3000/api/auth/linkedin/callback',
    passReqToCallback: true,
  },
  handleLinkedinResponse  // see below
  ));
};


// Linkedin sends data into this callback
function handleLinkedinResponse(req, accessToken, refreshToken, profile, done) {
  console.log("REQ.USER IN LINKEDIN STRATEGY AFTER OAUTH API RESPONSE IS: ", req.user);
  console.log("PROFILE IS: ", profile);

  var userSignInfo = {
    accessToken: accessToken,
    linkedin: {
      getApiInfo: apiBypass,
      SignModel:  LinkedinSign,
      mongo: {
        authType:        'linkedin',
        authTypeId:      'linkedinId',
        accessToken:     'linkedinAccesstoken',
        authIdPath:      'auth.linkedin.linkedinId',
        accessTokenPath: 'auth.linkedin.linkedinAccessToken',
      },
      apiFields: {
        apiId:        'id',
        apiEmail:     'email',
        apiUsername:  'displayName',
      },
      profileId:       profile.id,
      reqdProfileData: profile,
    },
    signType: 'linkedin',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign
    loginSignupHandler(req, userSignInfo, done);
}
