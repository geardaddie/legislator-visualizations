Meteor.startup(function () {
  var x = 1;
  if (Legislators.find().count() === 0) {
    Assets.getText('legislators/legislators-current.json', function(err,res) {
      _.each(JSON.parse(res), function(legislator, i) {
        Legislators.insert(legislator)
      })
    })
  }
  // if (Bills.find().count() === 0) {
    console.log("Adding Bills...");
    var fs = Npm.require('fs')
    var files = fs.readdirSync('/Users/xxxx/qSites/bills_json')
    var billsArray = [];
    var getData = Meteor.bindEnvironment(function(files) {
      _.each(files, function(file, i) {
        var content = fs.readFileSync('/Users/xxxx/qSites/bills_json/' + file, 'utf8')
        console.log(content);
        console.log(i);
        billsArray.push(content)
      });
    })
    getData(files)
    _.each(billsArray, function(bill, i) {
      // console.log(JSON.parse('{"key": 4}'));
      console.log(JSON.parse(bill));
      // console.log(JSON.parseString(bill));
      // console.log(this.JSON);
    })
  // }
});


Meteor.methods({
  getBills: function() {
    if (Bills.find().count() === 0) {
      console.log("Adding Bills...");
      var fs = Npm.require('fs')
      var files = fs.readdirSync('/Users/xxxx/qSites/bills_json')
      var billsArray = [];
      var getData = Meteor.bindEnvironment(function(files) {
        _.each(files, function(file, i) {
          var content = fs.readFileSync('/Users/xxxx/qSites/bills_json/' + file, 'utf8')
          console.log(i);
          billsArray.push(content)
        });
      })
      getData(files)
      // _.each(JSON.parse(billsArray), function(bill, i) {
        // console.log(i);
        // Bills.insert(bill)
      // })
    }

    return billsArray[42];
  }
})
