'use strict';

var SignSchema = require('./SignSchema.js');
var Sign       = require('./Sign.js'      );

// New schema from base
var googleSignSchema = new SignSchema();

// BaseSchema: customBgColor, description, knownAs, linkUrl, published, userId
googleSignSchema.add({
  bgColor:         { type: String, default: '#dd4b39'          },
  circledByCount:  { type: String                              },
  icon:            { type: String, default: 'google'           },
  profileId:       { type: String, required: true              },
  signType:        { type: String, default: 'google'           },
});

// Validations
googleSignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Export as Discriminator
module.exports = Sign.discriminator('GoogleSign', googleSignSchema);
