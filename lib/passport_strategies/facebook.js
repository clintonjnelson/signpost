'use strict';
/* Manages creation of new facebook signs with Oauth2.0
    If new user, will create user first & then sign
    If existing user, will create the sign for that user
*/

var FacebookStrategy   = require('passport-facebook'            ).Strategy;
var FacebookSign       = require('../../models/FacebookSign.js' );
var findOrMakeSign     = require('../sign_creation_handler.js'  ).findOrMakeSign;
var getFacebookInfo    = require('../api_data_requests/facebook_api_req.js');
var loginSignupHandler = require('../login_signup_handler.js'   );
var buildCallbackUrl   = require('../signpost_utils.js').buildCallbackUrl;

module.exports = function(passport) {
  passport.use(new FacebookStrategy({
    clientID:     process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL:  buildCallbackUrl('facebook') || 'http://127.0.0.1:3000/api/auth/facebook/callback',
    passReqToCallback: true,
  },
  handleFacebookResponse   // see below
  ));
};


// facebook sends data into this callback
function handleFacebookResponse(req, accessToken, refreshToken, profile, done) {
  console.log("FACEBOOK API CALLBACK RESPONSE IS...");
  // console.log("REQ:", req);
  console.log("ACCESS_TOKEN:", accessToken);
  console.log("REFRESH_TOKEN:", refreshToken);
  console.log("PROFILE:", profile);
  console.log("REQ.USER IN FACEBOOK STRATEGY AFTER OAUTH API RESPONSE IS: ", req.user);

  var userSignInfo = {
    accessToken: accessToken,
    facebook: {
      getApiInfo: getFacebookInfo,   // function
      SignModel:  FacebookSign,       // model Constructor Function
      mongo: {
        authType:        'facebook',
        authTypeId:      'facebookId',
        accessToken:     'facebookAccessToken',
        authIdPath:      'auth.facebook.facebookId',
        accessTokenPath: 'auth.facebook.facebookAccessToken',
      },
      apiFields: {
        apiId:       'id',
        apiEmail:    'email',
        apiUsername: 'name',
      },
      profileId:       profile.id,
      reqdProfileData: profile,  // don't use profile, fetch from API w/access token
    },
    signType: 'facebook',
    user:     req.user,
  };

  !!req.user ?
    // User logged in => add sign.
    findOrMakeSign(req, userSignInfo, done) :
    // User NOT logged in => login/signup, add sign.
    loginSignupHandler(req, userSignInfo, done);
}
