if (Meteor.isClient) {

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var x = 1;
    if (Legislators.find().count() === 0) {
      Assets.getText('legislators/legislators-current.json', function(err,res) {
        _.each(JSON.parse(res), function(legislator, i) {
          Legislators.insert(legislator)
        })
      })
    }
    if (Bills.find().count() === 0) {
      var fs = Npm.require('fs')
      var files = fs.readdirSync('/Users/xxxx/qSites/bills_json')
      var getData = Meteor.bindEnvironment(function(files) {

        _.each(files, function(file) {
          var content = fs.readFileSync('/Users/xxxx/qSites/bills_json/' + file, 'utf8')
          var success = Bills.insert(content)
          if (x % 100 === 0) { console.log(x);}
          x+=1;
          if (Bills.find().count() === files.length) { console.log("UPLOAD COMPLETE");}
        });
      })
      getData(files)
    }
  });
}


/*
// Which existing laws are being mentioned in proposed laws

1. Get Bills

Bills introduced (the last version) //
  bill:  > attr-key:  > bill-stage: "Placed-on-Calendar-Senate" // not doing this

Treat Bills and Resolutions the same way

Or just introducted
  bill: > attr-key: > bill-stage: "Introduced-in-Senate"
  bill: > attr-key: > bill-stage: "Introduced-in-House"


2. Get popular names
  "act" within cato: namespace

3. Get the "sponsor" for each bill. There is one and only one sponsor per bill
  form > action > action-desc > sponsor > attr-key > name-id; "Y29842"

4. Compare "name-id" to ID in legislator.json to get party

5. Count the associations between acts and party
Each act



*/

/*
To convert everything from xml to json, you need to do this:

  for FILE in /Users/xxxx/qSites/cato/private/bills_xml/*;
  do
    NEW_FILE_NAME=$(basename $FILE .xml)
    xml2json -t xml2json -o $NEW_FILE_NAME.json $FILE
  done

*/
