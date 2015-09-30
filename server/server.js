Meteor.startup(function () {
  var fs = Npm.require('fs')
  var files = fs.readdirSync('/Users/xxxx/qSites/bills_json')

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
        var ihJSON = /.+\ih.json/;
        var isJSON = /.+\is.json/;
        // Only run this for .json files
        if (ihJSON.test(file) || isJSON.test(file)) {
          // placeholder for cleaned data
          let temp = {};
          // Get the contents of the file
          var content = fs.readFileSync('/Users/xxxx/qSites/bills_json/' + file, 'utf8');
          // Parse the content into JSON
          var parsedContent = JSON.parse(content);

          // function scan(obj)
          //   {
          //       var k;
          //       if (obj instanceof Object) {
          //           for (k in obj){
          //               if (obj.hasOwnProperty(k)){
          //                   //recursive call to scan property
          //                   scan( obj[k] );
          //               }
          //           }
          //       } else {
          //           //not an Object so obj[k] here is a value
          //       };
          //
          //   };




          // function that sync returns an array of all instances of a particular namespace
          getValue = function(json, key) {
            // If the value is an array...
            var item;
            if (json instanceof Array) {
              // ...go over each item in the array and run this function
              console.log("array?");
              _.each(json, function(item, i) {
                console.log("array obj");
                return getValue(json[i], key)
              })
            } else if (json instanceof Object) {
              console.log("this is an object");
              for (item in json) {
                if (json[item] instanceof String) {
                  console.log("this is a string");
                  return
                }
                return getValue(json[item], key)
              }
            }

              // // for each keyed item in the object...
              // for (item in json) {
              //   // XXX This log below shows that there are both objects and strings
              //   // console.log(typeof json[item]);
              //   // ...if it is also an object with keys run it again
              //   if (json[item] instanceof Object) {
              //     return getValue(json[item], key)
              //   }
              //
              //   ///////////////////
              //   if (json[item] instanceof String) {
              //     // XXX This doesn't work!
              //     console.log("this is a string");
              //   }
              //   /////////////////////
              //
              //   // ...if the item is same as the key passed into the function, return it
              //   if (item === key) {
              //     return json[key];
              //   }
              // }
            // }
          }
          let test = getValue(parsedContent, '@bill-stage')
          // console.log(test);


          // // Only run if it is a bill (as opposed to a resolution)
          // if (parsedContent.bill) {
          //   var catoArray = [];
          //   var getNamespace = function(obj, namespace, container) {
          //     if (obj instanceof Array) {
          //       _.each(obj, function(item, i) {
          //         getNamespace(obj[i], namespace)
          //       })
          //     } else {
          //       for (let key in obj) {
          //         if (key == namespace) {
          //           // container.push(obj[key])
          //         }
          //         if (obj[key] instanceof Object) {
          //           getNamespace(obj[key], namespace)
          //         }
          //       }
          //     }
          //   }
          //   getNamespace(parsedContent.bill, '{http://namespaces.cato.org/catoxml}entity-ref', catoArray)
          //
          //   temp.billStage = parsedContent.bill['@bill-stage']
          //   temp.billType = parsedContent.bill['@bill-type']
          //   temp.legislationNumber = parsedContent.bill.form['legis-num']['#text']
          //   temp.entities = catoArray
          //
          //   if (parsedContent.bill.form.action instanceof Array) {
          //     _.each(parsedContent.bill.form.action, function(action, i) {
          //       if (action['action-desc']) {
          //         if (action['action-desc']['sponsor']) {
          //           if (action['action-desc']['sponsor']['@name-id']) {
          //             let sponsorNameId = action['action-desc']['sponsor']['@name-id']
          //             // Filtering out 'lis' properties
          //             if (sponsorNameId.length > 4) {
          //               temp.sponsor = sponsorNameId
          //               console.log(sponsorNameId);
          //             }
          //             if (sponsorNameId.length === 4) {
          //               console.log(parsedContent.bill);
          //               console.log(sponsorNameId);
          //               console.log(file);
          //             }
          //           }
          //         }
          //       }
          //     })
          //   } else {
          //     if (parsedContent.bill.form.action) {
          //       if (parsedContent.bill.form.action['action-desc']) {
          //         // console.log(parsedContent.bill['@stage-count']); // undefined
          //       }
          //     } else {
          //       counter+=1;
          //       console.log(counter);
          //       // console.log(parsedContent.bill);
          //
          //       // console.log(parsedContent.bill.form);
          //     }
          //     // temp.sponsor = parsedContent.bill.form.action['action-desc']['sponsor']['@name-id']
          //   }
          //
          //
          //
          //
          //
          //   // XXX Not all bills have an action-date
          //   // console.log(parsedContent.bill.form.action['action-date']['#text']);
          //
          // }

          // Now, we need to find the pieces of information that we might need.

          // console.log(parsedContent.bill);

          // TODO check to make sure it is not undefined first!
          // console.log(parsedContent.resolution.form);
          // console.log(parsedContent);
           // console.log(i);
          // console.log(JSON.parse(content));
          // Bills.insert(parsedContent)
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
