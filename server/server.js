// Meteor.startup(function () {
//
//   /*
//   README
//   To run, uncomment the legislatorArray below, and populate bills at the bottom
//
//   */
//
//   var DOMParser = Meteor.npmRequire('xmldom').DOMParser
//
//   var fs = Npm.require('fs')
//   var files = fs.readdirSync('/Users/xxxx/qSites/bills_xml')
//
//   let actSet = [];
//
//   console.log("Populating legislators...");
//   let historicalLegislatorArray = JSON.parse(fs.readFileSync('/Users/xxxx/qSites/legislators_historical/legislators-historical.json', 'utf8'))
//   let currentLegislatorArray = JSON.parse(fs.readFileSync('/Users/xxxx/qSites/legislators_historical/legislators-current.json', 'utf8'))
//   let legislatorArray = historicalLegislatorArray.concat(currentLegislatorArray)
//   console.log("Added " + legislatorArray.length + " legislators.");
//
//   // Must bind to the file system environment or it will not work
//   var populateBills = Meteor.bindEnvironment(function(files) {
//     // Iterate over each file
//     _.each(files, function(file, i) {
//       if (i < 1000) { // XXX this will eventually be removed. It's just to limit the number of times it runs
//         // Find files that are type .json
//         // that have been introduced in the house or senate
//         var ihXML = /.+\ih.xml/;
//         var isXML = /.+\is.xml/;
//         // Only run this for the proper files
//         if (ihXML.test(file) || isXML.test(file)) {
//
//           // function to get the proper value from XML
//           var getValues = function(xmlDoc, entity) {
//             let valueArray = [];
//             // for each reference in the xml doc...
//             _.each(xmlDoc, function(ref) {
//               if (ref.getAttributeNode('entity-type').nodeValue === entity) {
//                 // TODO this should not need to exist. They should all have values
//                 if (ref.getAttributeNode('value')) {
//                   // gets rid of all the extra stuff at the end of the common name
//                   // if there isnt a tailing "/", then just return the item
//                   let myRe = /(^.+?)\//
//                   let reArray = myRe.exec(ref.getAttributeNode('value').nodeValue)
//                   // push to the array
//                   valueArray.push(reArray ? reArray[1] : ref.getAttributeNode('value').nodeValue)
//                 }
//               }
//             })
//             // return the array of referenced entities
//             return valueArray;
//           }
//
//           // Get the contents of the file
//           var content = fs.readFileSync('/Users/xxxx/qSites/bills_xml/' + file, 'utf8');
//
//           var parser = new DOMParser();
//           var xmlDoc = parser.parseFromString(content,"text/xml");
//
//           var sponsor = xmlDoc.getElementsByTagName("sponsor")[0].attributes[0].nodeValue
//           var cosponsors = []
//
//           var entityRef = xmlDoc.getElementsByTagName('cato:entity-ref')
//
//           // only unique act names
//           var acts = getValues(entityRef, 'act')
//           var federalBodies = _.uniq(getValues(entityRef, 'federal-body'))
//           // var people = getValues(entityRef, 'person')
//           // var committees = getValues(entityRef, 'committee')
//           // var uscodes = getValues(entityRef, 'uscode')
//           // var publicLaws = getValues(entityRef, 'public-law')
//           // var statutesAtLarge = getValues(entityRef, 'statute-at-large')
//           // var billsByNumber = getValues(entityRef, 'bills-by-number')
//
//           // take only acts that reference other acts
//           if (federalBodies.length) {
//             // filter out all legislators other than the one we want
//             let currentSponsor = _.find(legislatorArray, function(legislator) {
//               return legislator.id.bioguide === sponsor;
//             })
//             // let sponsorName = currentSponsor.name.official_full
//             let sponsorParty = currentSponsor.terms[0].party
//
//             // console.log(sponsorName, sponsorParty);
//             _.each(federalBodies, function(act) {
//               // Make sure the party is either republican or democrat
//               if (sponsorParty === "Democrat" || sponsorParty === "Republican") {
//                 // if it does not have the act
//                 if (!_.find(actSet, function(obj) { return obj.act === act})) {
//                   // give the object an "act" property
//                   let actObj = {
//                     act: act,
//                     Republican: 0,
//                     Democrat: 0
//                   }
//                   actObj[sponsorParty] += 1;
//                   actSet.push(actObj)
//
//                 } else { // if the act has already been referenced
//                   let currentAct = _.find(actSet, function(obj) {
//                     return obj.act === act;
//                   })
//                   currentAct[sponsorParty] += 1;
//                 }
//               }
//             })
//           }
//         }
//       }
//     });
//   })
//
//   var resetDB = function(db) {
//     _.each(db.find().fetch(), function(item) {
//       db.remove(item._id)
//     })
//   }
//
//   // resetDB(Legislators)
//
//   console.log("Populating bills...");
//   populateBills(files)
//   console.log("Added " + files.length + " bills.");
//
//   // console.log(actSet);
//
//   // save file to desktop
//   let res = fs.writeFileSync("/Users/xxxx/Desktop/federalBodies.json", JSON.stringify(actSet));
//   console.log(res);
//
// });
