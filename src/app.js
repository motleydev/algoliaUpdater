require('dotenv').config()
import fetch  from 'isomorphic-fetch';
const algoliasearch = require('algoliasearch');
const rename = require('deep-rename-keys');

const client = algoliasearch(process.env.ID, process.env.KEY);
const index = client.initIndex('dachfest_v1');

// Our endpoint, which we can get from the project dashboard
const endpoint = "https://confql.now.sh/"

//Our Query
const query = `{
    events {
      id
      name
      description
      talks {
        speakers {
          id
          name
          bio
        }
        description
      }
      venue {
        id
        name
        location {
          coords
          weather {
            summary
          }
        }
      }
    }
  }`;

(async () => {
    const request = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({query: query})
    })

    const response = await request.json()

    const renamedResponse = await rename(response.data, key => {
        if (key === 'id') {
            return 'objectID'
        }
        return key
    })

    try {
        index.saveObjects(renamedResponse.events, function(err, content) {
            if (err) throw err;
            console.log("Done");
        });
    } catch (e) {
        console.log(e)
    }

})();