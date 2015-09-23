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

        var jsonFileType = /.+\.json/;
        // Only run this for .json files
        if (jsonFileType.test(file)) {
          let temp = {};
          // Get the contents of the file
          var content = fs.readFileSync('/Users/xxxx/qSites/bills_json/' + file, 'utf8');
          // Parse the content into JSON
          var parsedContent = JSON.parse(content);

          // Only run if it is a bill (as opposed to a resolution)
          if (parsedContent.bill) {
            var catoArray = [];
            var getNamespace = function(obj, namespace) {
              if (obj instanceof Array) {
                _.each(obj, function(item, i) {
                  getNamespace(obj[i], namespace)
                })
              } else {
                for (let key in obj) {
                  if (key == namespace) {
                    catoArray.push(obj[key])
                  }
                  if (obj[key] instanceof Object) {
                    getNamespace(obj[key], namespace)
                  }
                }
              }
            }
            getNamespace(parsedContent.bill, '{http://namespaces.cato.org/catoxml}entity-ref')


            temp.billStage = parsedContent.bill['@bill-stage']
            temp.billType = parsedContent.bill['@bill-type']
            temp.legislationNumber = parsedContent.bill.form['legis-num']['#text']
            temp.entities = catoArray

            if (parsedContent.bill.form.action instanceof Array) {
              _.each(parsedContent.bill.form.action, function(action, i) {
                if (action['action-desc']) {
                  if (action['action-desc']['sponsor']) {
                    if (action['action-desc']['sponsor']['@name-id']) {
                      let sponsorNameId = action['action-desc']['sponsor']['@name-id']
                      // Filtering out 'lis' properties
                      if (sponsorNameId.length > 4) {
                        temp.sponsor = sponsorNameId
                      }
                      if (sponsorNameId.length === 4) {
                        console.log(parsedContent.bill);
                      }
                    }
                  }
                }
              })
            } else {
              if (parsedContent.bill.form.action) {
                if (parsedContent.bill.form.action['action-desc']) {
                  // console.log(parsedContent.bill['@stage-count']); // undefined
                }
              } else {
                counter+=1;
                console.log(counter);
                // console.log(parsedContent.bill);

                // console.log(parsedContent.bill.form);
              }
              // temp.sponsor = parsedContent.bill.form.action['action-desc']['sponsor']['@name-id']
            }





            // XXX Not all bills have an action-date
            // console.log(parsedContent.bill.form.action['action-date']['#text']);

          }

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
