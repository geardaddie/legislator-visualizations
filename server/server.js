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
        // Only run this for the proper files
        if (ihXML.test(file) || isXML.test(file)) {

          // function to get the proper value from XML
          var getValues = function(xmlDoc, entity) {
            let valueArray = [];
            // for each reference in the xml doc...
            _.each(xmlDoc, function(ref) {
              if (ref.getAttributeNode('entity-type').nodeValue === entity) {
                // TODO this should not need to exist. They should all have values
                if (ref.getAttributeNode('value')) {
                  // gets rid of all the extra stuff at the end of the common name
                  // if there isnt a tailing "/", then just return the item
                  let myRe = /(^.+?)\//
                  let reArray = myRe.exec(ref.getAttributeNode('value').nodeValue)
                  // push to the array
                  valueArray.push(reArray ? reArray[1] : ref.getAttributeNode('value').nodeValue)
                }
              }
            })
            // return the array of referenced entities
            return valueArray;
          }


          // Get the contents of the file
          var content = fs.readFileSync('/Users/xxxx/qSites/bills_xml/' + file, 'utf8');

          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(content,"text/xml");

          var sponsor = xmlDoc.getElementsByTagName("sponsor")[0].attributes[0].nodeValue
          var cosponsors = []

          var entityRef = xmlDoc.getElementsByTagName('cato:entity-ref')

          var acts = getValues(entityRef, 'act')
          var federalBodies = getValues(entityRef, 'federal-body')
          // var people = getValues(entityRef, 'person')
          // var committees = getValues(entityRef, 'committee')
          // var uscodes = getValues(entityRef, 'uscode')
          // var publicLaws = getValues(entityRef, 'public-law')
          // var statutesAtLarge = getValues(entityRef, 'statute-at-large')
          // var billsByNumber = getValues(entityRef, 'bills-by-number')

          // take only acts that reference other acts
          if (acts.length) {
            console.log(sponsor, acts);
          }



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
