if (Meteor.isClient) {
  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Legislators.find().count() === 0) {
      _.each(_rawLegislatorArray, function(legislator, i) {
        Legislators.insert(legislator)
      })
    }
  });
}
