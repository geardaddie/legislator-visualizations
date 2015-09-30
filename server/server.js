Meteor.startup(function () {

  var DOMParser = Meteor.npmRequire('xmldom').DOMParser

  var fs = Npm.require('fs')
  var files = fs.readdirSync('/Users/xxxx/qSites/bills_xml')

  // This function takes the legislators from Assets and adds to DB. Pretty straight-forward
  var populateLegislators = function() {
    Assets.getText('legislators/legislators-current.json', function(err,res) {
      _.each(JSON.parse(res), function(legislator, i) {
        Legislators.insert(legislator)
      })
    })
  }

  // Must bind to the file system environment or it will not work
  var populateBills = Meteor.bindEnvironment(function(files) {
    // Iterate over each file
    var counter = 0;
    _.each(files, function(file, i) {
      if (i < 1000) { // XXX this will eventually be removed. It's just to limit the number of times it runs
        // Find files that are type .json
        // that have been introduced in the house or senate
        var ihXML = /.+\ih.xml/;
        var isXML = /.+\is.xml/;
        // Only run this for .json files
        if (ihXML.test(file) || isXML.test(file)) {
          var getValues = function(xmlDoc, entity) {
            console.log(xmlDoc.length);
            console.log(entity);
          }


          // Get the contents of the file
          var content = fs.readFileSync('/Users/xxxx/qSites/bills_xml/' + file, 'utf8');

          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(content,"text/xml");

          var sponsor = xmlDoc.getElementsByTagName("sponsor")[0].attributes[0].nodeValue
          var cosponsors = []

          var entityRef = xmlDoc.getElementsByTagName('cato:entity-ref')
          var acts = getValues(entityRef, 'acts')
          var federalBodies = []
          var people = []
          var committees = []



          // Iterate over each entityRef and get the proper values... would be nice if there were an exestential operator

          // <cato:entity-ref xmlns:cato="http://namespaces.cato.org/catoxml" value="Continuing Appropriations Resolution, 2015" entity-type="act">
          // <cato:entity-ref entity-id="0100" entity-type="federal-body">
          // TODO we can later reference federal bodies
        }
      }
    });
  })

  var resetDB = function(db) {
    _.each(db.find().fetch(), function(item) {
      db.remove(item._id)
    })
  }

  // resetDB(Legislators)

  if (Legislators.find().count() === 0) {
    console.log("populating legislators");
    populateLegislators()
  }
  if (Bills.find().count() === 0) {
    console.log("populating bills");
    populateBills(files)
  }
  // if (Resolutions.find().count() === 0) {
  //   populateResolutions(files)
  // }


});
