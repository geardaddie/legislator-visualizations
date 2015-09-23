if (Meteor.isClient) {

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
