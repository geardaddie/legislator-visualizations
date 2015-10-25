Meteor.startup(function () {
/*
  var DOMParser = Meteor.npmRequire('xmldom').DOMParser

  var fs = Npm.require('fs')
  var files = fs.readdirSync('/Users/johnshields/Hackathon/bills_xml')

  let actSet = [];

  console.log("Populating legislators...");
  let historicalLegislatorArray = JSON.parse(fs.readFileSync('/Users/johnshields/Hackathon/legislators_historical/legislators-historical.json', 'utf8'))
  let currentLegislatorArray = JSON.parse(fs.readFileSync('/Users/johnshields/Hackathon/legislators_historical/legislators-current.json', 'utf8'))
  let legislatorArray = historicalLegislatorArray.concat(currentLegislatorArray)
  console.log("Added " + legislatorArray.length + " legislators.");

  errorList = [];

  // Must bind to the file system environment or it will not work
  var populateBills = Meteor.bindEnvironment(function(files) {
    // Iterate over each file
    let counter = 0;

    _.each(files, function(file, i) {
      if (i < 1000000) { // XXX this will eventually be removed. It's just to limit the number of times it runs
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
              if (ref.getAttributeNode('entity-type')) {
                if (ref.getAttributeNode('entity-type').nodeValue === entity) {
                  // checks to make sure they have a value property
                  if (ref.getAttributeNode('value')) {
                    // Exclusing bills with "proposed" value of "true". This is not error handling, just filtering
                    if (!ref.getAttributeNode('proposed')) {
                      let myRe = /(^.+?)\//
                      let reArray = myRe.exec(ref.getAttributeNode('value').nodeValue)
                      // push to the array
                      valueArray.push(reArray ? reArray[1] : ref.getAttributeNode('value').nodeValue)
                    }
                    // gets rid of all the extra stuff at the end of the common name
                    // if there isnt a tailing "/", then just return the item
                    / *
                    for Federal bodies
                    entity-parent-id
                    and
                    entity-id
                    Then we references the entity-id against the table
                    * /


                  } else {
                    console.warn("File " + file + " does not have a VALUE for the act");
                    errorList.push("File " + file + " does not have a VALUE for the act")
                  }
                }

              } else {
                console.warn("File " + file + " does not have an ENTITY-TYPE");
                errorList.push("File " + file + " does not have an ENTITY-TYPE")
              }
            })
            // return the array of referenced entities
            return valueArray;
          }

          // Get the contents of the file
          var content = fs.readFileSync('/Users/johnshields/Hackathon/bills_xml/' + file, 'utf8');

          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(content,"text/xml");

          var sponsor;
          // if the sponsor exists
          if (xmlDoc.getElementsByTagName("sponsor").length) {
            // if the sponsor has attributes
            if (xmlDoc.getElementsByTagName("sponsor")[0].attributes.length) {
              sponsor = xmlDoc.getElementsByTagName("sponsor")[0].attributes[0].nodeValue
            } else {
              console.warn("File " + file + " does not have SPONSOR ATTRIBUTES");
              errorList.push("File " + file + " does not have SPONSOR ATTRIBUTES")
            }
          } else {
            console.warn("File " + file + " does not have a SPONSOR");
            errorList.push("File " + file + " does not have a SPONSOR")
          }

          var cosponsors = []

          var entityRef;
          if (xmlDoc.getElementsByTagName('cato:entity-ref')) {
            entityRef = xmlDoc.getElementsByTagName('cato:entity-ref');
          } else {
            console.warn("File " + file + " does not have a CATO:ENTITY-REF");
            errorList.push("File " + file + " does not have a CATO:ENTITY-REF")
          }

          // only unique act names
          var acts = _.uniq(getValues(entityRef, 'act'))
          // var federalBodies = _.uniq(getValues(entityRef, 'federal-body'))
          // var people = getValues(entityRef, 'person')
          // var committees = getValues(entityRef, 'committee')
          // var uscodes = getValues(entityRef, 'uscode')
          // var publicLaws = getValues(entityRef, 'public-law')
          // var statutesAtLarge = getValues(entityRef, 'statute-at-large')
          // var billsByNumber = getValues(entityRef, 'bills-by-number')
          // take only acts that reference other acts


          if (acts.length) {
            // if it has a sponsor
            if (sponsor) {
              let currentSponsor
              // filter out all legislators other than the one we want
              currentSponsor = _.find(legislatorArray, function(legislator) {
                return legislator.id.bioguide === sponsor;
                // return legislator.id.bioguide === sponsor ? legislator.id.bioguide === sponsor : legislator.id.lis;
              })
              // if there is no currentSponsor, check to make sure it's not an LIS ID issue
              if (!currentSponsor) {
                currentSponsor = _.find(legislatorArray, function(legislator) {
                  return legislator.id.lis === sponsor;
                })
              }
              // Checks to make sure the current sponsor is found in the legislator list
              if (currentSponsor) {
                // check to make sure it has the party identifier for the sponsor
                if (currentSponsor.terms[0]) {
                  let sponsorParty = currentSponsor.terms[0].party
                  _.each(acts, function(act) {
                    // Make sure the party is either republican or democrat
                    if (sponsorParty === "Democrat" || sponsorParty === "Republican") {
                      // if it does not have the act
                      if (!_.find(actSet, function(obj) { return obj.act === act})) {
                        // give the object an "act" property
                        let actObj = {
                          act: act,
                          Republican: 0,
                          Democrat: 0
                        }
                        actObj[sponsorParty] += 1;
                        actSet.push(actObj)

                      } else { // if the act has already been referenced
                        let currentAct = _.find(actSet, function(obj) {
                          return obj.act === act;
                        })
                        currentAct[sponsorParty] += 1;
                      }
                    } else {
                      console.warn("File " + file + " has a SPONSOR PARTY error.")
                      errorList.push("File " + file + " has a SPONSOR PARTY error.")
                    }
                  })
                } else {
                  console.warn("File " + file + " does not have the PARTY IDENTIFIER for the sponsor");
                  errorList.push("File " + file + " does not have the PARTY IDENTIFIER for the sponsor")
                }
              } else {
                console.warn("File " + file + " could not match LEGISLATOR to BIOGUIDE");
                errorList.push("File " + file + " could not match LEGISLATOR to BIOGUIDE")
              }

            } else {
              // warning for lack of sponsor already handled above
            }
          } else {
            // could warn for bills that do not reference acts here
          }
        }
      }
    });
  })

  console.log("Populating bills...");
  populateBills(files)
  console.log("Added " + files.length + " bills.");

  // save file to desktop
  let res = fs.writeFileSync("/Users/johnshields/Desktop/acts.json", JSON.stringify(actSet));
  console.log(res);

  let err = fs.writeFileSync("/Users/johnshields/Desktop/err.txt", _.uniq(errorList).join("\r\n"));
*/
});
