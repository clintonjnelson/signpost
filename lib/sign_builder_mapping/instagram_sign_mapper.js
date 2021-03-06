'use strict';
// This loads both the custom & base attrs for new signs into a new Model instance

var InstagramSign  = require('../../models/InstagramSign.js');

module.exports = function(signBuilder) {

  function buildInstagramSign(igData) {  // igData comes from profile.user
    // base attrs:   customBgColor, description, knownAs, linkUrl, published, userId
    // custom attrs: bgColor, instagramId, picUrl, icon, signType
    // NOTE: most not needed OR covered by defaults
    console.log("INSTAGRAM DATA RECEIVED IS: ", igData);

    var signProps = {
      // ----------------- BASE -----------------------
      // description:    ig.description,                        // optional for updates?
      knownAs:        (igData.displayName || igData.knownAs),      // TODO: VERIFY || is NOT BACKWARDS!
      linkUrl:        (getLinkUrl(igData) || igData.linkUrl),      // TODO: VERIFY || is NOT BACKWARDS!
      // ----------------- CUSTOM ---------------------
      email:          igData.email,
      profileId:      igData.id,
      picUrl:         getPicUrl(igData),
    };

    // load schema data into new instagram sign
    var newInstagramSign = new InstagramSign(signProps);

    return newInstagramSign;
  }

  function getLinkUrl(ig) {
    if(ig.username) {
      return 'http://instagram.com/' + ig.username;
    }
    return null;
  }

  function getPicUrl(ig) {
    try { return ig._json.data.profile_picture; }
    catch (e) {
      console.log('Data access error for Instagram picUrl: ', e);
      return '';
    }
  }

  signBuilder.instagram = buildInstagramSign;
};


//--------------------- Sample of Data in Instagram Profile --------------------
/*
{ provider: 'instagram',
  id: '2131966332',
  displayName: 'Clint Nelson',
  name: { familyName: undefined, givenName: undefined },
  username: 'clintonjnelson',
  _raw: '{"meta":{"code":200},"data":{"username":"clintonjnelson","bio":"","website":"","profile_picture":"https:\\/\\/instagramimages-a.akamaihd.net\\/profiles\\/anonymousUser.jpg","fu…
  _json:
   { meta: { code: 200 },
     data:
      { username: 'clintonjnelson',
        bio: '',
        website: '',
        profile_picture: 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg',
        full_name: 'Clint Nelson',
        counts: [Object],
        id: '2131966332' } } }
*/
